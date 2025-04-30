import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';

interface Provider {
  id: number;
  name: string;
  specialty: string;
  latitude: number;
  longitude: number;
  rating: number;
}

// Mock data that will always show
const MOCK_PROVIDERS: Provider[] = [
  { id: 1, name: 'Dr. Smith', specialty: 'Cardiology', latitude: 17.41, longitude: 78.48, rating: 4.5 },
  { id: 2, name: 'Dr. Johnson', specialty: 'Pediatrics', latitude: 17.39, longitude: 78.51, rating: 4.2 },
  { id: 3, name: 'Dr. Williams', specialty: 'Dermatology', latitude: 17.42, longitude: 78.53, rating: 4.8 },
  { id: 4, name: 'Dr. Davis', specialty: 'Neurology', latitude: 17.385, longitude: 78.49, rating: 4.6 },
  { id: 5, name: 'Dr. Miller', specialty: 'Orthopedics', latitude: 17.405, longitude: 78.47, rating: 4.4 }
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    // Always show mock data first
    setProviders(MOCK_PROVIDERS);
    
    // Try to fetch real data
    if (!useMockData) {
      fetchProviders();
    }
  }, [useMockData]);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching providers from map service...");
      
      // For Android emulator, localhost is 10.0.2.2
      const response = await axios.get('http://10.0.2.2:8081/api/map/providers/map', {
        params: {
          northLat: 17.45,
          southLat: 17.35,
          eastLng: 78.55,
          westLng: 78.45
        },
        timeout: 5000 // 5 second timeout
      });
      
      console.log("Response received:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform the response to match our Provider interface
        const fetchedProviders = response.data.map((item: any) => ({
          id: item.id || Math.random(),
          name: item.name || 'Unknown Provider',
          specialty: item.specialty || 'General',
          latitude: item.latitude,
          longitude: item.longitude,
          rating: item.rating || 0
        }));
        
        console.log(`Fetched ${fetchedProviders.length} providers`);
        
        if (fetchedProviders.length > 0) {
          setProviders(fetchedProviders);
          setUseMockData(false);
        } else {
          console.log("No providers found, using mock data");
          setError("No providers found in this area");
          setProviders(MOCK_PROVIDERS);
          setUseMockData(true);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError("Failed to fetch providers. Using mock data.");
      setProviders(MOCK_PROVIDERS);
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDataSource = () => {
    setUseMockData(!useMockData);
  };
  
  const handleProviderPress = (provider: Provider) => {
    setSelectedProvider(provider === selectedProvider ? null : provider);
  };

  const renderProviderCards = () => {
    return (
      <ScrollView style={styles.cardContainer}>
        {providers.map(provider => (
          <TouchableOpacity 
            key={provider.id} 
            style={[
              styles.card, 
              selectedProvider?.id === provider.id && styles.selectedCard
            ]}
            onPress={() => handleProviderPress(provider)}
          >
            <Text style={styles.cardTitle}>{provider.name}</Text>
            <Text style={styles.cardSubtitle}>{provider.specialty}</Text>
            <View style={styles.cardDetails}>
              <Text>Rating: {provider.rating} ⭐</Text>
              <Text>Lat: {provider.latitude.toFixed(4)}</Text>
              <Text>Lng: {provider.longitude.toFixed(4)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Provider Finder</Text>
      </View>
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loaderText}>Loading providers...</Text>
          </View>
        ) : (
          renderProviderCards()
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.dataSourceContainer}>
          <TouchableOpacity 
            style={[styles.dataSourceButton, {backgroundColor: useMockData ? '#4285F4' : '#f44242'}]}
            onPress={toggleDataSource}
          >
            <Text style={styles.dataSourceText}>
              {useMockData ? "Using Mock Data" : "Using API Data"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#e0f0ff',
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#4285F4',
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dataSourceContainer: {
    alignItems: 'center',
    padding: 15,
  },
  dataSourceButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
  },
  dataSourceText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default App; 