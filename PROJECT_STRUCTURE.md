# Provider Finder Platform - Project Structure

## Overview
This document outlines the project structure for the Provider Finder Platform, a healthcare provider discovery and appointment management system.

## Root Directory Structure
```
provider-finder-platform/
├── apps/                      # React Native applications
│   ├── user-app-expo/        # Patient-facing mobile app (current active)
│   └── provider-app/         # Healthcare provider mobile app
├── backend/                   # Java Spring Boot microservices
│   ├── api-gateway/          # API Gateway service
│   ├── service-discovery/    # Eureka service discovery
│   ├── auth-service/         # Authentication & authorization
│   ├── user-service/         # User profile management
│   ├── provider-service/     # Provider data management
│   ├── map-service/          # Geospatial provider search
│   ├── appointment-service/  # Appointment management
│   ├── notification-service/ # Push notifications
│   ├── speech-service/       # Speech-to-text processing
│   ├── chat-service/         # AI-powered chat
│   └── customer-care/        # Support ticketing system
├── infrastructure/           # Infrastructure configuration
│   ├── docker/              # Docker configurations
│   ├── kubernetes/          # K8s manifests
│   └── monitoring/          # Prometheus/Grafana configs
├── docs/                    # Project documentation
└── scripts/                 # Utility scripts
```

## Detailed Structure

### React Native Apps (`apps/`)
```
apps/
├── user-app-expo/           # Current active user app using Expo
│   ├── src/
│   │   ├── features/
│   │   │   ├── map/         # Map-related features
│   │   │   ├── search/      # Provider search
│   │   │   ├── appointments/# Appointment management
│   │   │   └── profile/     # User profile
│   │   ├── components/     # Reusable components
│   │   ├── navigation/     # Navigation configuration
│   │   ├── store/          # Redux state management
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── i18n/           # Internationalization
│   ├── __tests__/          # Tests
│   ├── android/            # Android-specific files
│   ├── ios/                # iOS-specific files
│   ├── assets/             # App assets
│   ├── app.json            # Expo configuration
│   ├── app.config.js       # Advanced Expo configuration
│   └── package.json        # Dependencies
└── provider-app/
    ├── src/
    │   ├── features/
    │   │   ├── dashboard/   # Provider dashboard
    │   │   ├── schedule/    # Schedule management
    │   │   ├── patients/    # Patient management
    │   │   └── profile/     # Provider profile
    │   ├── components/     # Reusable components
    │   ├── navigation/     # Navigation configuration
    │   ├── store/          # Redux state management
    │   ├── services/       # API services
    │   ├── utils/          # Utility functions
    │   └── i18n/           # Internationalization
    ├── __tests__/          # Tests
    ├── android/            # Android-specific files
    ├── ios/                # iOS-specific files
    └── package.json        # Dependencies
```

### OpenStreetMap Implementation Details
The user app contains a custom OpenStreetMap implementation in `apps/user-app-expo/`:

```
apps/user-app-expo/
├── App.tsx               # Main application file with WebView + Leaflet.js implementation
├── package.json          # Dependencies including react-native-webview
└── app.config.js         # Configuration with Google Maps disabled
```

Key components:
1. **Main App Component (`App.tsx`)**: 
   - Contains the WebView implementation of OpenStreetMap
   - Includes HTML/CSS/JS for Leaflet.js integration
   - Handles two-way communication with the map 
   - Manages provider data and user interactions

2. **Map HTML Generation**:
   - Function `generateMapHtml()` creates the HTML/JS content
   - Embeds Leaflet.js for rendering OpenStreetMap tiles
   - Passes provider data as JSON for marker rendering
   - Implements event handling for map interactions

3. **List/Map Toggle**:
   - Provides seamless switching between list and map views
   - Maintains provider selection state across view changes

4. **Backend Integration**:
   - Fetches real provider data from the map-service backend
   - Processes geospatial data for map rendering

### Backend Services (`backend/`)
Each service follows the standard Spring Boot structure:
```
backend/[service-name]/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/healthcare/[service]/
│   │   │       ├── config/     # Configuration classes
│   │   │       ├── controller/ # REST controllers
│   │   │       ├── service/    # Business logic
│   │   │       ├── repository/ # Data access
│   │   │       ├── model/      # Domain models
│   │   │       ├── dto/        # Data transfer objects
│   │   │       └── exception/  # Exception handling
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-[env].yml
│   └── test/              # Test classes
├── Dockerfile
└── pom.xml
```

### Map Service Details
The map service in `backend/map-service/` is specifically designed to be map provider agnostic:

```
backend/map-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/healthapp/mapservice/
│   │   │       ├── controller/
│   │   │       │   └── ProviderMapController.java  # Map endpoints
│   │   │       ├── service/
│   │   │       │   └── ProviderMapService.java     # Geospatial queries
│   │   │       ├── repository/
│   │   │       │   └── ProviderLocationRepository.java  # PostGIS queries
│   │   │       └── dto/
│   │   │           └── ProviderSearchResponse.java     # Provider data
│   │   └── resources/
│   │       └── application.yml  # Database configuration
│   └── test/
└── pom.xml  # Dependencies including PostGIS
```

### Infrastructure (`infrastructure/`)
```
infrastructure/
├── docker/
│   ├── base/             # Base Docker images
│   ├── services/         # Service-specific Dockerfiles
│   └── compose/          # Docker Compose files
├── kubernetes/
│   ├── base/            # Base K8s manifests
│   ├── overlays/        # Environment-specific configs
│   └── helm/            # Helm charts
└── monitoring/
    ├── prometheus/      # Prometheus configs
    ├── grafana/         # Grafana dashboards
    └── alerts/          # Alert rules
```

### Documentation (`docs/`)
```
docs/
├── api/                 # API documentation
├── architecture/        # Architecture decisions
├── deployment/         # Deployment guides
└── development/        # Development guides
```

## Key Files at Root Level
- `README.md` - Project overview and setup instructions
- `PROJECT_STRUCTURE.md` - This file
- `project-tracker.md` - Project progress tracking
- `REACT_NATIVE_MIGRATION_STATUS.md` - Migration status and details
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - Project license
- `.gitignore` - Git ignore rules
- `docker-compose.yml` - Local development environment

## Naming Conventions

### Java Files
- Controllers: `*Controller.java`
- Services: `*Service.java`
- Repositories: `*Repository.java`
- Models: `*Entity.java`
- DTOs: `*Dto.java`

### React Native Files
- Components: `*.component.tsx`
- Screens: `*.screen.tsx`
- Hooks: `use*.ts`
- Reducers: `*.slice.ts`
- Services: `*.service.ts`
- Utils: `*.util.ts`

### Configuration Files
- Environment: `application-[env].yml`
- Docker: `Dockerfile.[service]`
- Kubernetes: `[service]-deployment.yaml`

## Best Practices
- Follow the standards outlined in the custom instructions
- Maintain consistent naming conventions
- Keep services modular and focused
- Document all public APIs and interfaces
- Include appropriate tests for all components
- Use proper versioning for dependencies 

## Map Implementation Best Practices
- Use the WebView + Leaflet.js approach for OpenStreetMap integration
- Always include proper attribution for OpenStreetMap
- Implement defensive validation for provider coordinates
- Provide fallbacks for potential network or data issues
- Ensure proper error handling for WebView communication 