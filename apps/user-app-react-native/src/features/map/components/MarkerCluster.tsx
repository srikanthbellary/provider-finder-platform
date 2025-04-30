import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Provider } from '../../../models/provider.model';

interface MarkerClusterProps {
  providers: Provider[];
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress: (provider: Provider) => void;
}

interface Cluster {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  providers: Provider[];
}

/**
 * A component that clusters provider markers based on their proximity.
 * This improves performance when there are many providers on the map.
 */
const MarkerCluster: React.FC<MarkerClusterProps> = ({ 
  providers,
  region,
  onMarkerPress,
}) => {
  // The clustering distance depends on the zoom level
  const clusteringDistance = useMemo(() => {
    // Higher zoom level (smaller delta) = smaller clustering distance
    return Math.min(region.latitudeDelta, region.longitudeDelta) * 0.05;
  }, [region.latitudeDelta, region.longitudeDelta]);

  // Group providers into clusters based on their proximity
  const clusters = useMemo(() => {
    if (!providers || providers.length === 0) {
      return [];
    }

    const clusters: Cluster[] = [];

    // Process each provider
    providers.forEach(provider => {
      // Skip providers without location
      if (!provider.locations || provider.locations.length === 0) {
        return;
      }

      // Use the primary location or first location
      const location = provider.locations.find(loc => loc.isPrimary) || provider.locations[0];
      
      // Find a cluster this provider can join
      let foundCluster = false;
      
      for (const cluster of clusters) {
        // Calculate distance between cluster center and provider
        const distance = calculateDistance(
          cluster.coordinate.latitude,
          cluster.coordinate.longitude,
          location.latitude,
          location.longitude
        );
        
        // If within clustering distance, add to this cluster
        if (distance < clusteringDistance) {
          cluster.providers.push(provider);
          
          // Update cluster center to be the average of all points
          const newLat = (cluster.coordinate.latitude * (cluster.providers.length - 1) + 
                           location.latitude) / cluster.providers.length;
          const newLng = (cluster.coordinate.longitude * (cluster.providers.length - 1) + 
                           location.longitude) / cluster.providers.length;
          
          cluster.coordinate = {
            latitude: newLat,
            longitude: newLng
          };
          
          foundCluster = true;
          break;
        }
      }
      
      // If no suitable cluster found, create a new one
      if (!foundCluster) {
        clusters.push({
          id: `cluster-${clusters.length}`,
          coordinate: {
            latitude: location.latitude,
            longitude: location.longitude
          },
          providers: [provider]
        });
      }
    });
    
    return clusters;
  }, [providers, clusteringDistance]);

  return (
    <>
      {clusters.map(cluster => {
        const count = cluster.providers.length;
        
        // If only one provider in the cluster, render a normal marker
        if (count === 1) {
          const provider = cluster.providers[0];
          return (
            <Marker
              key={`provider-${provider.id}`}
              coordinate={cluster.coordinate}
              title={provider.name}
              description={getProviderType(provider)}
              onPress={() => onMarkerPress(provider)}
            />
          );
        }
        
        // Otherwise render a cluster marker
        return (
          <Marker
            key={cluster.id}
            coordinate={cluster.coordinate}
            onPress={() => {
              // If zoom is at maximum, just show the first provider
              if (region.latitudeDelta < 0.01) {
                onMarkerPress(cluster.providers[0]);
              } else {
                // Otherwise zoom in to this cluster
                // This will be handled by the parent component
                onMarkerPress(cluster.providers[0]);
              }
            }}
          >
            <View style={styles.cluster}>
              <Text style={styles.clusterText}>{count}</Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
};

// Helper function to calculate distance between two points (using Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Helper to get provider type
const getProviderType = (provider: Provider): string => {
  return provider.providerType || 'Healthcare Provider';
};

const styles = StyleSheet.create({
  cluster: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clusterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MarkerCluster; 