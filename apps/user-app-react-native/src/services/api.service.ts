import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Region } from 'react-native-maps';
import { API } from '../config/environment';
import { 
  Provider, 
  ProviderSearchResponse, 
  ProviderSearchRequest 
} from '../models/provider.model';

// Create an axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API.baseUrl,
  timeout: API.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request/response interceptors for logging and error handling
apiClient.interceptors.request.use(
  (config) => {
    // Log or modify request before sending
    console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.debug(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log and handle errors
    if (error.response) {
      // The request was made and the server responded with an error status code
      console.error(`API Error ${error.response.status}: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`API No Response: ${error.message}`);
    } else {
      // Something happened in setting up the request
      console.error(`API Request Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

// Define API service
const apiService = {
  /**
   * Fetch providers within the current map viewport with pagination and filters
   */
  fetchProvidersInViewport: async (
    viewport: Region, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<Provider[]> => {
    try {
      const request: ProviderSearchRequest = {
        // Convert viewport from center-based to bound-based coordinates
        northLat: viewport.latitude + viewport.latitudeDelta / 2,
        southLat: viewport.latitude - viewport.latitudeDelta / 2,
        eastLng: viewport.longitude + viewport.longitudeDelta / 2,
        westLng: viewport.longitude - viewport.longitudeDelta / 2,
        page,
        pageSize
      };

      // We'll use the GET endpoint for simpler requests
      const response = await apiClient.get<ProviderSearchResponse>('/providers/map', {
        params: request
      });

      return response.data.providers;
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  },

  /**
   * Fetch providers with advanced filtering options
   */
  fetchProvidersWithFilters: async (request: ProviderSearchRequest): Promise<ProviderSearchResponse> => {
    try {
      // Using POST endpoint for more complex filtering
      const response = await apiClient.post<ProviderSearchResponse>('/providers/search', request);
      return response.data;
    } catch (error) {
      console.error('Error fetching providers with filters:', error);
      throw error;
    }
  },

  /**
   * Fetch provider details by ID
   */
  fetchProviderById: async (providerId: number): Promise<Provider | null> => {
    try {
      const response = await apiClient.get<Provider>(`/providers/${providerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching provider ${providerId}:`, error);
      return null;
    }
  },

  /**
   * Fetch providers near a specific location with distance-based sorting
   */
  fetchProvidersNearLocation: async (
    latitude: number,
    longitude: number,
    radius: number = 10,
    page: number = 1,
    pageSize: number = 20
  ): Promise<Provider[]> => {
    try {
      const request: ProviderSearchRequest = {
        // Define a viewport around the specified location
        // (converting radius to approximate lat/lng delta)
        northLat: latitude + radius / 111, // ~111km per degree of latitude
        southLat: latitude - radius / 111,
        eastLng: longitude + radius / (111 * Math.cos(latitude * (Math.PI / 180))),
        westLng: longitude - radius / (111 * Math.cos(latitude * (Math.PI / 180))),
        userLat: latitude,
        userLng: longitude,
        sortBy: 'distance',
        sortDirection: 'asc',
        page,
        pageSize
      };

      const response = await apiClient.get<ProviderSearchResponse>('/providers/map', {
        params: request
      });

      return response.data.providers;
    } catch (error) {
      console.error('Error fetching nearby providers:', error);
      return [];
    }
  },
};

export default apiService; 