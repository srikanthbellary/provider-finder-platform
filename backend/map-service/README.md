# Map Service

## Overview

The Map Service is a critical backend component of the Provider Finder Platform responsible for geospatial operations, provider search, and location-based features. It is designed to function both as part of the monorepo during development and as an independent microservice during deployment.

## Purpose and Features

- Geographic provider search within a specified viewport
- Distance-based sorting and filtering
- Provider clustering for map visualization
- Caching frequently requested geographic data
- Spatial queries using PostGIS
- Integration with other platform services for comprehensive provider data

## Technical Architecture

### Technology Stack

- **Language**: Java 17
- **Framework**: Spring Boot
- **Database**: PostgreSQL with PostGIS extension
- **API**: RESTful with JSON responses
- **Cache**: Redis (optional)
- **Containerization**: Docker

### Database Schema

The service uses the `provider` schema in the PostgreSQL database with spatial extensions:

- `provider.provider`: Main provider information
- `provider.location`: Geographic locations with PostGIS point data
- `provider.specialty`: Provider specialties and capabilities
- `provider.availability`: Scheduling and availability information

## API Endpoints

### Provider Geographic Search

```
GET /api/map/providers
```

Parameters:
- `northLat`: North boundary latitude
- `southLat`: South boundary latitude
- `eastLng`: East boundary longitude
- `westLng`: West boundary longitude
- `userLat`: Current user's latitude (optional)
- `userLng`: Current user's longitude (optional)
- `sortBy`: Field to sort by (default: distance when user location is provided)
- `sortDirection`: asc or desc
- `page`: Page number for pagination
- `pageSize`: Number of results per page

Response: Collection of provider information with locations

## Configuration

### Environment Variables

The service is configured via environment variables:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=providerdb
DB_USER=appuser
DB_PASSWORD=apppassword

# Application
SERVER_PORT=8081
SPRING_PROFILES_ACTIVE=development

# Optional Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispassword
```

## Deployment

The service is containerized for easy deployment in various environments.

### Docker

Build the container:

```bash
# From the map-service directory
mvn clean package
docker build -t provider-finder/map-service .
```

Run the container:

```bash
docker run -p 8081:8081 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=providerdb \
  -e DB_USER=appuser \
  -e DB_PASSWORD=apppassword \
  provider-finder/map-service
```

### Cloud Deployment (GCP Cloud Run)

This service is optimized for deployment on GCP Cloud Run:

```bash
# Deploy to Cloud Run
gcloud run deploy map-service \
  --image gcr.io/your-project/map-service \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="DB_HOST=10.0.0.3,DB_NAME=providerdb" \
  --set-secrets="DB_PASSWORD=db-password:latest"
```

### On-Premises Deployment

For on-premises deployment, use Docker Compose or Kubernetes with appropriate volume and network configurations.

## Development

### Prerequisites

- JDK 17
- Maven
- PostgreSQL with PostGIS extension
- Docker (optional)

### Local Setup

1. Create a PostgreSQL database with PostGIS:
   ```sql
   CREATE DATABASE providerdb;
   CREATE EXTENSION postgis;
   ```

2. Set up environment variables or create an `.env` file

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## Integration Points

The Map Service integrates with:

- **Auth Service**: For authentication and authorization
- **Provider Service**: For detailed provider information
- **Notification Service**: For geographic-based notifications

## Future Enhancements

- Advanced clustering algorithms
- Real-time provider tracking
- Integration with traffic and travel time APIs
- Support for complex geographic queries (isochrones, etc.)

## Independent Repository

When migrated to an independent repository, the service will maintain its own:
- CI/CD pipeline
- Version control
- Release cycles
- Infrastructure as code

## Monitoring

Health and metrics endpoints are available at:
- `/actuator/health`
- `/actuator/metrics`
- `/actuator/prometheus` (when enabled)