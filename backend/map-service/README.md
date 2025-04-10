# Map Service

This service is responsible for the geospatial aspects of the Provider Finder Platform, providing efficient map-based provider discovery.

## Overview

The Map Service provides APIs for:
- Searching providers within a map viewport
- Filtering providers by specialty, type, language, etc.
- Sorting providers by distance from user location

## Key Features

- Efficient geospatial queries using PostGIS
- Viewport-based searching for map-centric discovery
- Distance-based sorting
- Caching for frequent viewport queries

## Development Setup

### Prerequisites

- JDK 17
- Maven 3.8+
- PostgreSQL with PostGIS extension
- Redis (for caching)

### Building the Service

```bash
cd backend/map-service
mvn clean install
```

### Running Locally

```bash
mvn spring-boot:run
```

Or using Docker:

```bash
docker-compose up map-service
```

## API Documentation

Once the service is running, the OpenAPI documentation is available at:

- Swagger UI: `http://localhost:8081/api/map/swagger-ui.html`
- API Docs: `http://localhost:8081/api/map/api-docs`

## Key Endpoints

### Provider Search

```
POST /api/map/providers/search
```

Searches for providers within a map viewport with filtering options.

#### Request Body

```json
{
  "northLat": 17.4500,
  "southLat": 17.3500,
  "eastLng": 78.5500,
  "westLng": 78.4000,
  "searchTerm": "cardiologist",
  "specialtyIds": [3],
  "providerTypeIds": [1],
  "languageIds": [2],
  "isVerifiedOnly": true,
  "isRegisteredOnly": false,
  "page": 1,
  "pageSize": 20,
  "userLat": 17.3850,
  "userLng": 78.4867,
  "sortBy": "distance",
  "sortDirection": "asc"
}
```

### Simple Viewport Search

```
GET /api/map/providers/map?northLat=17.45&southLat=17.35&eastLng=78.55&westLng=78.40
```

A simplified GET endpoint for searching providers within a viewport.

## Database Schema

The service relies on the following key tables in the PostgreSQL database:

- `provider.provider` - Provider information
- `provider.location` - Provider locations with geospatial data
- `provider.specialty` - Medical specialties
- `provider.provider_type` - Types of providers (doctor, hospital, etc.)
- `provider.language` - Languages supported by providers

## Caching Strategy

The service uses Redis to cache:
- Frequent viewport queries
- Provider details for commonly accessed providers