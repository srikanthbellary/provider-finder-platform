# Provider Finder Mobile App

A healthcare provider finder application built with React Native and Expo, using OpenStreetMap for mapping functionality.

## Features

- Find healthcare providers in your area
- View providers on an interactive map powered by OpenStreetMap
- Switch between list and map views
- See provider details including specialty and rating

## Technical Implementation

### Map Implementation

This application uses a pure OpenStreetMap implementation with no Google Maps dependencies:

- OpenStreetMap tiles are loaded via Leaflet in a WebView component
- No Google Maps API key required
- Fully compliant with OpenStreetMap usage policies
- Interactive markers for healthcare providers
- Popup details for each provider location

### Tech Stack

- React Native with Expo
- TypeScript for type safety
- OpenStreetMap with Leaflet.js for mapping
- WebView for rendering the map component
- Axios for API communication
- PostgreSQL with PostGIS for geospatial data (backend)

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd apps/user-app-expo
npm install
```

### Running the App

```bash
npx expo start
```

Use the Expo Go app to run on a physical device or an emulator.

## Backend Integration

The app connects to a Spring Boot backend with PostGIS for geospatial queries. The map service endpoint provides provider location data, including:

- Provider details (name, specialty, etc.)
- Geospatial coordinates
- Rating information

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenStreetMap contributors for map data
- Leaflet.js for the mapping library
- Expo team for the React Native toolchain 