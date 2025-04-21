# Provider Finder Platform - Continuation Guide

This document provides instructions for continuing development from our current point. Use this as a reference when starting a new chat session.

## Current Status

We've set up the Docker infrastructure (PostgreSQL with PostGIS, Redis, Elasticsearch) and created the Map Service code structure. We recently made a significant decision to migrate from Flutter to React Native for all frontend applications.

## Next Steps

### 1. Resolve Map Service Build Issues

The Maven Wrapper build failed. Here are approaches to try:

**Option A: Fix Maven Wrapper**
1. Navigate to `backend/map-service` directory
2. Check Maven Wrapper files (.mvn directory, mvnw, mvnw.cmd)
3. Verify file permissions (for Unix-based systems)
4. Try running with debugging: `./mvnw clean package -X`

**Option B: Use Docker for Building**
1. Update the Dockerfile in `backend/map-service`:
```dockerfile
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
COPY --from=build /app/target/map-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

2. Build and run with Docker:
```
docker build -t map-service .
docker run -p 8081:8081 --network provider-finder-platform_provider-finder-network map-service
```

### 2. Test the Map Service API

Once the service is running:
1. Access Swagger UI: http://localhost:8081/api/map/swagger-ui.html
2. Test the provider search endpoint with sample viewport coordinates
3. Verify PostgreSQL and PostGIS are properly connected

### 3. Begin React Native UI Development

After confirming the Map Service works:
1. Set up React Native project for the user app:
```bash
npx react-native init ProviderFinderUser --template react-native-template-typescript
```

2. Install necessary dependencies:
```bash
cd apps/user-app
npm install --save react-native-maps axios redux @reduxjs/toolkit react-redux react-navigation
```

3. Create a basic map component that integrates OpenStreetMap:
```tsx
// src/features/map/MapScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';

const MapScreen = () => {
  const initialRegion: Region = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 20,
    longitudeDelta: 20,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapScreen;
```

### 4. Connect React Native UI to Map Service

1. Create API client in React Native app using Axios
2. Implement viewport change detection to query Map Service
3. Display real provider data on the map

## Important Files

- **Docker Configuration**: `docker-compose.yml`
- **Map Service Code**: `backend/map-service/`
- **Database Initialization**: `scripts/db/init/01-init-postgis.sql`
- **Project Tracker**: `project-tracker.md`
- **Architecture Documentation**: `ARCHITECTURE.md`

## Database Status

The PostgreSQL database container is running with:
- Database name: `providerdb`
- Username: `appuser`
- Password: `apppassword`
- PostGIS extension is verified working

## React Native Setup Guide

For a new developer joining the project:

1. Install Node.js and npm/yarn
2. Install the React Native CLI: `npm install -g react-native-cli`
3. Install required development tools:
   - For Android: Android Studio, Android SDK
   - For iOS: Xcode (Mac only)
4. Clone the repository and navigate to the user app:
   ```bash
   git clone https://github.com/your-org/provider-finder-platform.git
   cd provider-finder-platform/apps/user-app
   ```
5. Install dependencies:
   ```bash
   npm install
   ```
6. Start the Metro bundler:
   ```bash
   npx react-native start
   ```
7. Run the application:
   ```bash
   # For Android
   npx react-native run-android
   
   # For iOS
   npx react-native run-ios
   ```

## Troubleshooting

If Docker containers aren't running:
```
docker-compose up -d postgres redis elasticsearch
```

To check container status:
```
docker ps
```

To connect to the database:
```
docker exec -it provider-finder-postgres psql -U appuser -d providerdb
```

When starting a new chat session, share this guide and the updated project tracker to provide context on where we left off.