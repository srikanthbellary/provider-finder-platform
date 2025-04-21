import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Region } from 'react-native-maps';
import apiService from '../../services/api.service';
import { Provider, ProviderSearchResponse } from '../../models/provider.model';
import { APP_CONFIG } from '../../config/environment';

// Define tile types for OpenStreetMap
export enum TileType {
  STANDARD = 'standard',
  CYCLE = 'cycle',
  TRANSPORT = 'transport',
  HUMANITARIAN = 'humanitarian',
}

// Define the state interface
interface MapState {
  providers: Provider[];
  selectedProvider: Provider | null;
  loading: boolean;
  error: string | null;
  viewport: Region;
  tileType: TileType;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  providersInViewport: number;
}

// Initialize state
const initialState: MapState = {
  providers: [],
  selectedProvider: null,
  loading: false,
  error: null,
  viewport: APP_CONFIG.initialMapRegion,
  tileType: TileType.STANDARD,
  totalResults: 0,
  currentPage: 1,
  totalPages: 1,
  providersInViewport: 0,
};

// Async thunks
export const fetchProviders = createAsyncThunk(
  'map/fetchProviders',
  async (viewport: Region, { rejectWithValue, getState }) => {
    try {
      // Get the current page from state
      const state = getState() as { map: MapState };
      const page = state.map.currentPage;
      
      // Fetch providers with the specified viewport and page
      const response = await apiService.fetchProvidersWithFilters({
        northLat: viewport.latitude + viewport.latitudeDelta / 2,
        southLat: viewport.latitude - viewport.latitudeDelta / 2,
        eastLng: viewport.longitude + viewport.longitudeDelta / 2,
        westLng: viewport.longitude - viewport.longitudeDelta / 2,
        page,
        pageSize: APP_CONFIG.defaultPageSize,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch providers');
    }
  }
);

export const fetchProviderById = createAsyncThunk(
  'map/fetchProviderById',
  async (providerId: number, { rejectWithValue }) => {
    try {
      const provider = await apiService.fetchProviderById(providerId);
      if (!provider) {
        return rejectWithValue('Provider not found');
      }
      return provider;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch provider details');
    }
  }
);

export const fetchNextPage = createAsyncThunk(
  'map/fetchNextPage',
  async (_, { getState, dispatch }) => {
    const state = getState() as { map: MapState };
    
    // Only fetch next page if there are more pages
    if (state.map.currentPage < state.map.totalPages) {
      // Increment current page and fetch providers with current viewport
      const nextPage = state.map.currentPage + 1;
      const viewport = state.map.viewport;
      
      try {
        const response = await apiService.fetchProvidersWithFilters({
          northLat: viewport.latitude + viewport.latitudeDelta / 2,
          southLat: viewport.latitude - viewport.latitudeDelta / 2,
          eastLng: viewport.longitude + viewport.longitudeDelta / 2,
          westLng: viewport.longitude - viewport.longitudeDelta / 2,
          page: nextPage,
          pageSize: APP_CONFIG.defaultPageSize,
        });
        
        return { page: nextPage, response };
      } catch (error) {
        throw error instanceof Error ? error.message : 'Failed to fetch next page';
      }
    }
    
    // Return null if there are no more pages to fetch
    return null;
  }
);

// Create slice
const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setViewport(state, action: PayloadAction<Region>) {
      state.viewport = action.payload;
    },
    clearSelectedProvider(state) {
      state.selectedProvider = null;
    },
    setTileType(state, action: PayloadAction<TileType>) {
      state.tileType = action.payload;
    },
    cycleTileType(state) {
      // Cycle through tile types in order
      const tileTypes = Object.values(TileType);
      const currentIndex = tileTypes.indexOf(state.tileType);
      const nextIndex = (currentIndex + 1) % tileTypes.length;
      state.tileType = tileTypes[nextIndex];
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    resetPagination(state) {
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalResults = 0;
      state.providers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchProviders
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        const response = action.payload as ProviderSearchResponse;
        state.loading = false;
        state.providers = response.providers;
        state.totalResults = response.totalCount;
        state.totalPages = response.totalPages;
        state.currentPage = response.page;
        state.providersInViewport = response.viewportMetadata.providersInViewport;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetchProviderById
      .addCase(fetchProviderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProvider = action.payload;
      })
      .addCase(fetchProviderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetchNextPage
      .addCase(fetchNextPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNextPage.fulfilled, (state, action) => {
        state.loading = false;
        
        // If there was a new page to fetch
        if (action.payload) {
          const { page, response } = action.payload;
          state.currentPage = page;
          state.totalResults = response.totalCount;
          state.totalPages = response.totalPages;
          
          // Append the new providers to the existing list
          state.providers = [...state.providers, ...response.providers];
        }
      })
      .addCase(fetchNextPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch next page';
      });
  },
});

// Export actions and reducer
export const { 
  setViewport, 
  clearSelectedProvider, 
  setTileType, 
  cycleTileType,
  setCurrentPage,
  resetPagination
} = mapSlice.actions;

export default mapSlice.reducer; 