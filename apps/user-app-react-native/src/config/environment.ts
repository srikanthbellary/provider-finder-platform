/**
 * Environment configuration for the application
 * 
 * This file contains environment-specific configuration settings.
 * Different values can be set for development, staging, and production.
 */

// The current environment (development, staging, production)
// React Native doesn't expose process.env directly like Node.js
export const ENV = __DEV__ ? 'development' : 'production';

// API configuration
const API_CONFIG = {
  development: {
    // Use 10.0.2.2 instead of localhost for Android emulator
    // This maps to the host machine's localhost
    baseUrl: 'http://10.0.2.2:8081/api/map',
    timeout: 10000, // 10 seconds
  },
  staging: {
    baseUrl: 'https://staging-api.provider-finder.com/api/map',
    timeout: 10000,
  },
  production: {
    baseUrl: 'https://api.provider-finder.com/api/map',
    timeout: 10000,
  },
};

// OpenStreetMap configuration
export const OSM_CONFIG = {
  tileServers: {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    humanitarian: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    cycleMap: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
    transport: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
  },
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
  minZoom: 3,
};

// Export API configuration for the current environment
export const API = API_CONFIG[ENV as keyof typeof API_CONFIG];

// Application-wide settings
export const APP_CONFIG = {
  initialMapRegion: {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  },
  defaultPageSize: 20,
  maxResultsPerPage: 100,
};

export default {
  ENV,
  API,
  OSM_CONFIG,
  APP_CONFIG,
}; 