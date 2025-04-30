# Provider Finder Platform 
A healthcare provider discovery and appointment management system. This platform helps users find healthcare providers on a map, view detailed information, and book appointments.

## 🚀 Quick Start
1. Navigate to Expo app directory:
   ```bash
   cd apps/user-app-expo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npx expo start
   ```
Note: Use Expo Go app to run on a physical device or emulator.

## Core Features
- Map-based healthcare provider discovery using OpenStreetMap
- Provider search and filtering by specialty, rating, and distance
- Detailed provider profiles with appointment booking capabilities
- Multi-language support for international accessibility
- Seamless switching between list and map views
- Android and iOS mobile applications built with React Native

## Technical Stack
- **Frontend**: React Native with TypeScript
- **Map Solution**: OpenStreetMap with Leaflet.js in WebView (no Google Maps dependencies)
- **Backend**: Java 17 + Spring Boot Microservices
- **Database**: PostgreSQL with PostGIS extension for geospatial data
- **Infrastructure**: Docker containers, Kubernetes-ready

## Current Status
Successfully implemented the map-based provider discovery with real data from PostgreSQL. Provider markers are displayed on an OpenStreetMap implementation that requires no Google API keys for production. Users can toggle between list and map views, tap markers to view provider details, and see ratings for each provider.

## Map Implementation Details
- Pure OpenStreetMap implementation via WebView and Leaflet.js
- No Google Maps dependencies or API keys required
- Interactive markers with popup details for providers
- Properly attributed according to OpenStreetMap requirements
- Fully functional on both Android and iOS platforms

## Getting Started
See the [Project Structure](PROJECT_STRUCTURE.md) document for repository organization.
For development status, check the [Project Tracker](project-tracker.md).
For React Native migration status, see [Migration Status](REACT_NATIVE_MIGRATION_STATUS.md).
See the [User App README](apps/user-app-expo/README.md) for more details on the mobile app implementation.
