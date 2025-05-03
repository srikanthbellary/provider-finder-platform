import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Searchbar, Button } from 'react-native-paper';
import WebView from 'react-native-webview';
import axios from 'axios';
import { theme } from '../../../theme';

interface Provider {
  id: number;
  name: string;
  specialty: string;
  latitude: number;
  longitude: number;
  rating: number;
}

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  addressLine1: string;
  city: string;
  state: string;
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
  locations: Location[];
  specialties: string[];
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMapView, setUseMapView] = useState(false);
  const [region, setRegion] = useState({
    latitude: 17.4,
    longitude: 78.5,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Filter providers based on search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    
    const query = searchQuery.toLowerCase().trim();
    return providers.filter(provider => 
      provider.name.toLowerCase().includes(query) ||
      provider.specialty.toLowerCase().includes(query)
    );
  }, [providers, searchQuery]);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8090/api/providers');
      setProviders(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const generateMapHtml = () => {
    const markersJson = JSON.stringify(filteredProviders.map(provider => ({
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
          const map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);
          
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
          });
          
          map.on('moveend', function() {
            const center = map.getCenter();
            const bounds = map.getBounds();
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'region_change',
              region: {
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: bounds.getNorth() - bounds.getSouth(),
                longitudeDelta: bounds.getEast() - bounds.getWest()
              }
            }));
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'region_change') {
        setRegion(data.region);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const renderProviderList = () => (
    <FlatList
      data={filteredProviders}
      keyExtractor={(item) => `${item.id}-${item.latitude}-${item.longitude}`}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemTitle}>{item.name}</Text>
          <Text style={styles.listItemSubtitle}>{item.specialty}</Text>
          <View style={styles.listItemDetails}>
            <Text>Rating: {item.rating} ⭐</Text>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search providers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Button
          mode="contained"
          onPress={() => setUseMapView(!useMapView)}
          style={styles.toggleButton}
        >
          {useMapView ? 'Show List' : 'Show Map'}
        </Button>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : useMapView ? (
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: generateMapHtml() }}
            style={styles.map}
            onMessage={handleWebViewMessage}
          />
        </View>
      ) : (
        renderProviderList()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  searchBar: {
    flex: 1,
  },
  toggleButton: {
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    margin: theme.spacing.md,
  },
  listItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  listItemTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  listItemSubtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
  },
  listItemDetails: {
    marginTop: theme.spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
});

export default SearchScreen; 