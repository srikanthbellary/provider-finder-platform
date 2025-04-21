import React from 'react';
import { Platform } from 'react-native';
import MapView, { 
  UrlTile, 
  MapViewProps, 
  PROVIDER_DEFAULT,
  Region 
} from 'react-native-maps';
import { OSM_CONFIG } from '../../config/environment';

// OSM subdomains for load balancing
const OSM_SUBDOMAINS = ['a', 'b', 'c'];

type TileType = 'standard' | 'humanitarian' | 'cycleMap' | 'transport';

interface OSMMapViewProps extends MapViewProps {
  tileType?: TileType;
  maxZoom?: number;
  minZoom?: number;
  cacheTiles?: boolean;
  onMapReady?: () => void;
}

/**
 * A custom MapView that uses OpenStreetMap tiles
 * 
 * This component wraps react-native-maps MapView and adds OpenStreetMap tiles 
 * through the UrlTile component, while still allowing all standard MapView props
 * and functionality.
 */
const OSMMapView: React.FC<OSMMapViewProps> = ({
  tileType = 'standard',
  maxZoom = OSM_CONFIG.maxZoom,
  minZoom = OSM_CONFIG.minZoom,
  cacheTiles = true,
  children,
  onMapReady,
  ...props
}) => {
  // Get the appropriate tile URL template from config
  const tileUrlTemplate = OSM_CONFIG.tileServers[tileType as keyof typeof OSM_CONFIG.tileServers];

  // Replace {s} with random subdomain for load balancing
  const getRandomSubdomain = () => {
    const randomIndex = Math.floor(Math.random() * OSM_SUBDOMAINS.length);
    return OSM_SUBDOMAINS[randomIndex];
  };

  // Process URL template to handle subdomains
  const processedUrlTemplate = tileUrlTemplate.replace('{s}', getRandomSubdomain());

  // Determine size of tiles based on platform and screen density
  const tileSize = Platform.OS === 'android' ? 256 : 512;

  // Handle onMapReady event
  const handleMapReady = () => {
    if (onMapReady) {
      onMapReady();
    }
  };

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      onMapReady={handleMapReady}
      {...props}
    >
      <UrlTile
        urlTemplate={processedUrlTemplate}
        maximumZ={maxZoom}
        minimumZ={minZoom}
        shouldReplaceMapContent={false}
        tileSize={tileSize}
        zIndex={-1}
      />
      {children}
    </MapView>
  );
};

export default OSMMapView; 