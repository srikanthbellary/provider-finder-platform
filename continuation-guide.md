# Provider Finder Platform - Continuation Guide

This document provides instructions for continuing development from our current point. Use this as a reference when starting a new chat session.

## Current Status

We've set up the Docker infrastructure (PostgreSQL with PostGIS, Redis, Elasticsearch) and created the Map Service code structure. The build process for the Map Service encountered an issue that needs to be resolved.

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

### 3. Begin Flutter UI Development

After confirming the Map Service works:
1. Set up Flutter project for the user app:
```
flutter create --org com.healthapp --project-name provider_finder_user apps/user-app
```

2. Add map dependencies to `pubspec.yaml`:
```yaml
dependencies:
  flutter_map: ^5.0.0
  latlong2: ^0.9.0
```

3. Create a basic map component that shows a centered map of India with hardcoded provider pins

### 4. Connect Flutter UI to Map Service

1. Create API client in Flutter app
2. Implement viewport change detection to query Map Service
3. Display real provider data on the map

## Important Files

- **Docker Configuration**: `docker-compose.yml`
- **Map Service Code**: `backend/map-service/`
- **Database Initialization**: `scripts/db/init/01-init-postgis.sql`
- **Project Tracker**: `project-tracker.md`

## Database Status

The PostgreSQL database container is running with:
- Database name: `providerdb`
- Username: `appuser`
- Password: `apppassword`
- PostGIS extension is verified working

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