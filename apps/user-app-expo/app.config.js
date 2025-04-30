module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: null,  // Use null to allow MapView without API key for OpenStreetMap
          useAndroidViewMap: true
        }
      }
    }
  };
}; 