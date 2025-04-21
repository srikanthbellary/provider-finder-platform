import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  Button, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { 
  fetchProviders, 
  setViewport, 
  resetPagination, 
  fetchNextPage
} from './mapSlice';
import { Provider } from '../../models/provider.model';
import OSMMapView from './OSMMapView';
import { APP_CONFIG, OSM_CONFIG } from '../../config/environment';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;

// Available tile types
const TILE_TYPES = ['standard', 'humanitarian', 'cycleMap', 'transport'] as const;
type TileType = typeof TILE_TYPES[number];

const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapView>(null);
  
  // Local state for tile type
  const [tileType, setTileType] = useState<TileType>('standard');
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Get state from Redux
  const { 
    providers, 
    loading, 
    viewport, 
    totalResults, 
    currentPage, 
    totalPages,
    providersInViewport,
    error
  } = useAppSelector((state) => state.map);

  // Reset pagination when component mounts or regains focus
  useFocusEffect(
    useCallback(() => {
      dispatch(resetPagination());
      return () => {
        // Optional cleanup when screen loses focus
      };
    }, [dispatch])
  );

  // Handle region change
  const onRegionChangeComplete = (newRegion: Region) => {
    dispatch(setViewport(newRegion));
    // Only fetch if the change is significant enough
    if (shouldRefetchProviders(newRegion, viewport)) {
      dispatch(resetPagination());
      dispatch(fetchProviders(newRegion));
    }
  };

  // Helper to determine if we should fetch new data based on viewport change
  const shouldRefetchProviders = (newRegion: Region, oldRegion: Region): boolean => {
    // If map isn't ready yet, don't fetch
    if (!isMapReady) return false;
    
    // Calculate how much the viewport has changed (simple distance calculation)
    const latChange = Math.abs(newRegion.latitude - oldRegion.latitude);
    const lngChange = Math.abs(newRegion.longitude - oldRegion.longitude);
    const zoomChangeX = Math.abs(newRegion.longitudeDelta - oldRegion.longitudeDelta);
    const zoomChangeY = Math.abs(newRegion.latitudeDelta - oldRegion.latitudeDelta);
    
    // Fetch if position changed by > 25% of the viewport size or zoom changed significantly
    return latChange > oldRegion.latitudeDelta * 0.25 ||
           lngChange > oldRegion.longitudeDelta * 0.25 ||
           zoomChangeX > oldRegion.longitudeDelta * 0.25 ||
           zoomChangeY > oldRegion.latitudeDelta * 0.25;
  };

  // Load initial data
  useEffect(() => {
    if (isMapReady) {
      dispatch(fetchProviders(viewport));
    }
  }, [dispatch, isMapReady]);

  // Navigate to provider detail screen
  const handleMarkerPress = (providerId: number) => {
    // Convert to string if your navigation expects a string parameter
    navigation.navigate('ProviderDetail', { providerId: providerId.toString() });
  };

  // Load more providers (next page)
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      dispatch(fetchNextPage());
    }
  };

  // When there are no providers found
  const renderEmptyState = () => {
    if (providers.length === 0 && !loading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No providers found in this area
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Try a different location or zoom out
          </Text>
        </View>
      );
    }
    return null;
  };

  // Render error state
  const renderError = () => {
    if (error && !loading) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchProviders(viewport))}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  // Cycle through tile types
  const cycleTileType = () => {
    const currentIndex = TILE_TYPES.indexOf(tileType);
    const nextIndex = (currentIndex + 1) % TILE_TYPES.length;
    setTileType(TILE_TYPES[nextIndex]);
  };

  // Format location string from provider
  const getLocationString = (provider: Provider): string => {
    const location = provider.locations && provider.locations.length > 0 
      ? provider.locations[0] 
      : null;
    
    if (!location) return '';
    
    return `${location.city}, ${location.state}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <OSMMapView
          style={styles.map}
          region={viewport}
          onRegionChangeComplete={onRegionChangeComplete}
          zoomEnabled={true}
          showsUserLocation={true}
          showsMyLocationButton={true}
          tileType={tileType as any}
          maxZoom={OSM_CONFIG.maxZoom}
          minZoom={OSM_CONFIG.minZoom}
          cacheTiles={true}
          onMapReady={() => setIsMapReady(true)}
        >
          {providers.map((provider: Provider) => {
            // Find the primary location or just use the first one
            const location = provider.locations.find(loc => loc.isPrimary) || provider.locations[0];
            
            if (!location) return null;
            
            return (
              <Marker
                key={`provider-${provider.id}`}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={provider.name}
                description={getLocationString(provider)}
                onPress={() => handleMarkerPress(provider.id)}
              />
            );
          })}
        </OSMMapView>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
          </View>
        )}
        
        {renderEmptyState()}
        {renderError()}
        
        <View style={styles.tileTypeButton}>
          <Button
            title={`Map Style: ${tileType}`}
            onPress={cycleTileType}
          />
        </View>
        
        {totalPages > 1 && currentPage < totalPages && providers.length > 0 && (
          <TouchableOpacity 
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={loading}
          >
            <Text style={styles.loadMoreButtonText}>
              {loading ? 'Loading...' : `Load More (${providers.length}/${totalResults})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {providers.length} of {totalResults} healthcare providers shown
        </Text>
        <Text style={styles.footerSubtext}>
          {providersInViewport} providers in current viewport
        </Text>
        <Text style={styles.attribution}>
          {OSM_CONFIG.attribution}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tileTypeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadMoreButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadMoreButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    height: 70,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 16,
  },
  footerSubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
  attribution: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
});

export default MapScreen; 