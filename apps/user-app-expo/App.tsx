import React, { useState, useEffect, useRef, Component } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ActivityIndicator, Alert, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import WebView from 'react-native-webview';

interface Provider {
  id: number;
  name: string;
  specialty: string;
  latitude: number;
  longitude: number;
  rating: number;
}

interface DatabaseProvider {
  id: number;
  name: string;
  providerType: string;
  about: string;
  phone: string;
  email: string | null;
  isVerified: boolean;
  isRegisteredUser: boolean;
  locations: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    addressLine1: string;
    city: string;
    state: string;
  }>;
  specialties: string[];
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong with the map.</Text>
          <Text style={styles.errorText} onPress={() => this.setState({ hasError: false })}>
            Tap to try again
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useMapView, setUseMapView] = useState(false); // Disable map view by default
  const [mapZoom, setMapZoom] = useState(13);
  const [region, setRegion] = useState({
    latitude: 17.4,
    longitude: 78.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const webViewRef = useRef<WebView>(null);

  // Fetch real provider data on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch providers when region changes
  useEffect(() => {
    if (useMapView) {
      fetchProviders();
    }
  }, [region, useMapView]);

  // Fetch real provider data from the backend
  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      console.log("Fetching real providers from PostgreSQL database...");
      
      // For Android emulator, localhost is 10.0.2.2
      const response = await axios.get('http://10.0.2.2:8081/api/map/providers/map', {
        params: {
          northLat: region.latitude + region.latitudeDelta / 2,
          southLat: region.latitude - region.latitudeDelta / 2,
          eastLng: region.longitude + region.longitudeDelta / 2,
          westLng: region.longitude - region.longitudeDelta / 2
        },
        timeout: 10000
      });
      
      console.log("Response received from database");
      
      if (response.data && response.data.providers && Array.isArray(response.data.providers)) {
        const dbProviders = response.data.providers;
        console.log(`Fetched ${dbProviders.length} providers from database`);
        
        // Get locations for providers - with defensive programming to handle possible empty arrays
        const providersWithLocations = dbProviders.flatMap((provider: DatabaseProvider) => {
          // Check if provider has locations array and it's not empty
          if (!provider.locations || !Array.isArray(provider.locations) || provider.locations.length === 0) {
            console.log(`Provider ${provider.id} (${provider.name}) has no locations, skipping`);
            return []; // Skip this provider
          }
          
          // Map each location to a provider entry with validation for required fields
          return provider.locations
            .filter(location => 
              // Ensure location has valid coordinates
              location && 
              typeof location.latitude === 'number' && 
              typeof location.longitude === 'number'
            )
            .map(location => ({
              id: provider.id,
              name: provider.name || 'Unknown Provider',
              specialty: provider.providerType || 'General',
              latitude: location.latitude,
              longitude: location.longitude,
              rating: provider.isVerified ? 5 : 4  // Higher rating for verified providers
            }));
        });
        
        setProviders(providersWithLocations);
        console.log(`Successfully processed ${providersWithLocations.length} provider locations`);
      } else {
        throw new Error("Invalid response format or no providers in the response");
      }
    } catch (error) {
      console.error("Error fetching or processing providers:", error);
      setErrorMessage("Error loading providers from database. Please try again.");
      
      // Show a detailed error alert for debugging
      Alert.alert(
        "Database Error",
        `Failed to load providers from PostgreSQL: ${error instanceof Error ? error.message : String(error)}`,
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // A list view implementation that doesn't use the map
  const renderProviderList = () => {
    return (
      <FlatList
        data={providers}
        keyExtractor={(item) => `${item.id}-${item.latitude}-${item.longitude}`}
        renderItem={({item, index}) => (
          <TouchableOpacity 
            style={[styles.listItem, selectedProvider?.id === item.id ? styles.selectedListItem : null]} 
            onPress={() => setSelectedProvider(item)}
          >
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSubtitle}>{item.specialty}</Text>
            <View style={styles.listItemDetails}>
              <Text>Rating: {item.rating} ⭐</Text>
              <Text>Coordinates: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    );
  };

  // Create HTML content for the WebView that displays an OpenStreetMap
  const generateMapHtml = () => {
    const markersJson = JSON.stringify(providers.map(provider => ({
      id: provider.id,
      name: provider.name,
      specialty: provider.specialty,
      lat: provider.latitude,
      lng: provider.longitude,
      rating: provider.rating
    })));
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .provider-popup .name { font-weight: bold; font-size: 16px; }
          .provider-popup .specialty { color: #666; margin-bottom: 5px; }
          .provider-popup .rating { margin-top: 5px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize the map
          const map = L.map('map').setView([${region.latitude}, ${region.longitude}], ${mapZoom});
          
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);
          
          // Add markers for providers
          const providers = ${markersJson};
          
          providers.forEach(provider => {
            const marker = L.marker([provider.lat, provider.lng])
              .addTo(map)
              .bindPopup(
                '<div class="provider-popup">' +
                '<div class="name">' + provider.name + '</div>' +
                '<div class="specialty">' + provider.specialty + '</div>' +
                '<div class="rating">Rating: ' + provider.rating + '⭐</div>' +
                '</div>'
              );
              
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'marker_click',
                provider: provider
              }));
            });
          });
          
          // Handle map movement to update region in React Native
          map.on('moveend', function() {
            const center = map.getCenter();
            const bounds = map.getBounds();
            const zoom = map.getZoom();
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'region_change',
              region: {
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: bounds.getNorth() - bounds.getSouth(),
                longitudeDelta: bounds.getEast() - bounds.getWest()
              },
              zoom: zoom
            }));
          });
        </script>
      </body>
      </html>
    `;
  };

  // Handle messages from the WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'marker_click') {
        // Find the selected provider
        const provider = providers.find(p => p.id === data.provider.id);
        if (provider) {
          setSelectedProvider(provider);
        }
      } else if (data.type === 'region_change') {
        setRegion(data.region);
        setMapZoom(data.zoom);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  // Render OpenStreetMap using WebView
  const renderMap = () => {
    try {
      console.log("Rendering OpenStreetMap with", providers.length, "providers");
      
      return (
        <View style={styles.mapContainerFull}>
          <WebView
            ref={webViewRef}
            style={styles.mapFull}
            originWhitelist={['*']}
            source={{ html: generateMapHtml() }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#008080" />
                <Text style={styles.loaderText}>Loading OpenStreetMap...</Text>
              </View>
            )}
          />
          <View style={styles.mapAttribution}>
            <Text style={styles.mapAttributionText}>© OpenStreetMap contributors</Text>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Error rendering map:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading map. Please try again.</Text>
          <Text style={styles.errorText}>{String(error)}</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#008080" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Provider Finder</Text>
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => setUseMapView(!useMapView)}
        >
          <Text style={styles.toggleButtonText}>
            {useMapView ? "Switch to List View" : "Switch to Map View"}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        {useMapView ? (
          <ErrorBoundary>
            {renderMap()}
          </ErrorBoundary>
        ) : (
          renderProviderList()
        )}
      </View>
      
      {selectedProvider && (
        <View style={styles.providerCard}>
          <Text style={styles.providerName}>{selectedProvider.name}</Text>
          <Text style={styles.providerSpecialty}>{selectedProvider.specialty}</Text>
          <Text style={styles.providerRating}>Rating: {selectedProvider.rating.toFixed(1)} ⭐</Text>
        </View>
      )}
      
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>Loading providers from PostgreSQL...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#008080',
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  toggleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
  },
  mapContainerFull: {
    flex: 1,
    position: 'relative',
  },
  mapFull: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  providerCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  providerSpecialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  providerRating: {
    marginTop: 10,
  },
  errorContainer: {
    position: 'absolute',
    top: 65,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  loadingIndicator: {
    position: 'absolute',
    top: 65,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 10,
  },
  loadingText: {
    color: 'white',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  loaderText: {
    marginTop: 10,
    color: '#008080',
  },
  mapAttribution: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 3,
    borderRadius: 3,
  },
  mapAttributionText: {
    fontSize: 10,
    color: '#333',
  },
  listItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
  },
  selectedListItem: {
    backgroundColor: '#d4f0f0',
    borderLeftWidth: 5,
    borderLeftColor: '#008080',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  listItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  }
});
