# Provider Finder Platform 
A healthcare provider discovery and appointment management system. This platform helps users find healthcare providers based on symptoms, specialties, or direct provider search, with an intuitive map-based interface.

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

## Backend Services

### Running with Docker
You can run the backend services using Docker Compose:

```bash
# Start the main services
docker-compose up -d postgres map-service chat-service

# Check running services
docker-compose ps

# Check logs
docker-compose logs -f
```

### Available Services

1. **Map Service** - Provides geospatial provider search using PostGIS
   - PORT: 8090
   - Endpoint: `/api/map/providers`

2. **Chat Service** - Provides symptom-to-specialist mapping and chat functionality
   - PORT: 8095
   - Health Check: `/api/chat/health`
   - Message Endpoint: `/api/chat/message`

3. **Search Service** - Provides provider search capabilities
   - PORT: 8085
   - Health Check: `/api/search/providers/health`

## Core Features
- Intuitive home screen with Search, Chat, and Voice options
- Symptom-to-specialist mapping for intelligent provider search
- Map-based healthcare provider discovery using OpenStreetMap
- Provider search by specialty, symptoms, or provider name
- Detailed provider profiles with appointment booking capabilities
- Multi-language support for international accessibility
- Seamless switching between list and map views
- Android and iOS mobile applications built with React Native

## Technical Stack
- **Frontend**: React Native with TypeScript
- **Map Solution**: OpenStreetMap with Leaflet.js in WebView (no Google Maps dependencies)
- **Backend**: Java 17 + Spring Boot Microservices
- **Database**: PostgreSQL with PostGIS extension for geospatial data
- **AI Components**: Simplified AI service for symptom analysis and specialist recommendations
- **Infrastructure**: Docker containers, Kubernetes-ready

## User Flow
1. **Home Screen**: Users are presented with three options:
   - Search: Text-based search for symptoms/specialists
   - Chat: AI-powered chat interface for symptom analysis
   - Voice: (Coming soon) Voice-based interaction

2. **Search Flow**:
   - Enter symptoms, specialist type, or provider name
   - System maps symptoms to appropriate specialists
   - View providers on map based on search results
   - Filter and sort providers by distance and ratings

3. **Chat Flow**:
   - Describe symptoms through chat interface
   - AI analyzes symptoms and recommends appropriate specialists
   - Seamlessly transition to finding providers of recommended specialty
   - View provider information and schedule appointments

## Development Status
For detailed information about the current development status, accomplished features, and known issues, please refer to the [Development Status](DEVELOPMENT_STATUS.md) document.

## Map Implementation Details
- Pure OpenStreetMap implementation via WebView and Leaflet.js
- No Google Maps dependencies or API keys required
- Interactive markers with popup details for providers
- Properly attributed according to OpenStreetMap requirements
- Fully functional on both Android and iOS platforms

## Getting Started
See the [Project Structure](PROJECT_STRUCTURE.md) document for repository organization.
For previous development status, check the [Project Tracker](project-tracker.md).
For React Native migration status, see [Migration Status](REACT_NATIVE_MIGRATION_STATUS.md).
See the [User App README](apps/user-app-expo/README.md) for more details on the mobile app implementation.
