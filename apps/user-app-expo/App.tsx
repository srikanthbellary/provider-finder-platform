import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, MapMarkerProps, UrlTile } from 'react-native-maps';
import axios from 'axios';

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

export default function App() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 17.4,
    longitude: 78.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const mapRef = useRef<MapView>(null);

  // Fetch real provider data on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch providers when region changes
  useEffect(() => {
    fetchProviders();
  }, [region]);

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
        
        // Get locations for providers
        const providersWithLocations = dbProviders.flatMap((provider: DatabaseProvider) => 
          provider.locations.map(location => ({
            id: provider.id,
            name: provider.name,
            specialty: provider.providerType,
            latitude: location.latitude,
            longitude: location.longitude,
            rating: provider.isVerified ? 5 : 4  // Higher rating for verified providers
          }))
        );
        
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

  // Handle zoom in/out using the region change
  const handleRegionChange = (newRegion: any) => {
    console.log("Region changed:", newRegion);
    setRegion(newRegion);
  };

  // Handle map zoom out
  const zoomOut = () => {
    if (mapRef.current) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  // Handle map zoom in
  const zoomIn = () => {
    if (mapRef.current) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#008080" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Provider Finder</Text>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation={true}
          zoomEnabled={true}
          zoomControlEnabled={true}
        >
          <UrlTile 
            urlTemplate={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
            maximumZ={19}
            flipY={false}
            zIndex={-1}
            tileSize={256}
            shouldReplaceMapContent={true}
          />
          {providers.map(provider => (
            <Marker
              key={provider.id}
              coordinate={{
                latitude: provider.latitude,
                longitude: provider.longitude
              }}
              title={provider.name}
              description={provider.specialty}
              onPress={() => setSelectedProvider(provider)}
              pinColor="red"  // Use default red pin
              tracksViewChanges={false}  // Optimize performance
            />
          ))}
        </MapView>
        
        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <View style={styles.zoomButton} onTouchEnd={zoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </View>
          <View style={styles.zoomButton} onTouchEnd={zoomOut}>
            <Text style={styles.zoomButtonText}>-</Text>
          </View>
        </View>
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
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  zoomControls: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    backgroundColor: 'transparent',
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008080',
  }
});
