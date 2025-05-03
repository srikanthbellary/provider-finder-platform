# Provider Finder Platform - Project Structure

## Overview
This document outlines the project structure for the Provider Finder Platform, a healthcare provider discovery and appointment management system with intelligent symptom-to-specialist mapping.

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
│   ├── search-service/       # Search and symptom mapping
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
│   └── symp_spec.json      # Symptom-to-specialist mapping
└── scripts/                 # Utility scripts
```

## Detailed Structure

### React Native Apps (`apps/`)
```
apps/
├── user-app-expo/           # Current active user app using Expo
│   ├── src/
│   │   ├── features/
│   │   │   ├── home/       # Home screen feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── ActionButton.tsx
│   │   │   │   │   └── FeatureCard.tsx
│   │   │   │   └── screens/
│   │   │   │       └── HomeScreen.tsx
│   │   │   ├── chat/       # Chat feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatInput.tsx
│   │   │   │   │   ├── MessageBubble.tsx
│   │   │   │   │   └── TypingIndicator.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useWebSocket.ts
│   │   │   │   │   └── useChat.ts
│   │   │   │   └── screens/
│   │   │   │       └── ChatScreen.tsx
│   │   │   ├── search/     # Search feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── SearchBar.tsx
│   │   │   │   │   ├── FilterPanel.tsx
│   │   │   │   │   ├── SortOptions.tsx
│   │   │   │   │   └── ProviderList.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useSearch.ts
│   │   │   │   │   └── useFilters.ts
│   │   │   │   └── screens/
│   │   │   │       └── SearchScreen.tsx
│   │   │   └── map/        # Map feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── MapView.tsx
│   │   │   │   │   ├── ProviderMarker.tsx
│   │   │   │   │   ├── MarkerCluster.tsx
│   │   │   │   │   ├── ProviderPopup.tsx
│   │   │   │   │   ├── ViewToggle.tsx
│   │   │   │   │   └── MapAttribution.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useMapViewport.ts
│   │   │   │   │   ├── useProviderData.ts
│   │   │   │   │   └── useMapInteraction.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── leafletSetup.ts
│   │   │   │   │   └── markerUtils.ts
│   │   │   │   └── screens/
│   │   │   │       └── MapScreen.tsx
│   │   │   ├── components/     # Shared components
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorState.tsx
│   │   │   ├── navigation/     # Navigation setup
│   │   │   │   ├── AppNavigator.tsx
│   │   │   │   └── types.ts
│   │   │   ├── store/          # State management
│   │   │   │   ├── slices/
│   │   │   │   │   ├── chatSlice.ts
│   │   │   │   │   ├── searchSlice.ts
│   │   │   │   │   └── mapSlice.ts
│   │   │   │   └── store.ts
│   │   │   ├── services/       # API services
│   │   │   └── i18n/          # Internationalization
│   ├── __tests__/         # Tests
│   ├── android/           # Android-specific files
│   ├── ios/               # iOS-specific files
│   └── package.json       # Dependencies
└── provider-app/           # Provider-facing app structure
    └── // ... similar structure

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

### Chat Service Details
The chat service in `backend/chat-service/` implements AI-powered chat functionality:

```
backend/chat-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/healthcare/chatservice/
│   │   │       ├── config/
│   │   │       │   ├── WebSocketConfig.java     # WebSocket configuration
│   │   │       │   ├── RedisConfig.java         # Redis configuration
│   │   │       │   └── DJLConfig.java           # AI model configuration
│   │   │       ├── controller/
│   │   │       │   ├── ChatController.java      # WebSocket endpoints
│   │   │       │   └── HealthController.java    # Health check endpoints
│   │   │       ├── service/
│   │   │       │   ├── ChatService.java         # Chat business logic
│   │   │       │   └── AIService.java           # DJL integration
│   │   │       ├── model/
│   │   │       │   ├── ChatMessage.java         # Message entity
│   │   │       │   └── ChatSession.java         # Session entity
│   │   │       └── dto/
│   │   │           ├── ChatRequest.java         # Chat request
│   │   │           └── ChatResponse.java        # Chat response
│   │   └── resources/
│   │       └── application.yml                  # Service configuration
│   └── test/
└── pom.xml                                      # Dependencies including DJL
```

### Search Service Details
The search service in `backend/search-service/` handles intelligent provider search:

```
backend/search-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/healthcare/searchservice/
│   │   │       ├── controller/
│   │   │       │   └── SearchController.java    # Search endpoints
│   │   │       ├── service/
│   │   │       │   ├── SearchService.java       # Search logic
│   │   │       │   └── SpecialistMapper.java    # Specialist mapping
│   │   │       ├── repository/
│   │   │       │   └── SearchRepository.java    # Search queries
│   │   │       └── dto/
│   │   │           ├── SearchRequest.java       # Search parameters
│   │   │           └── SearchResponse.java      # Search results
│   │   └── resources/
│   │       └── application.yml                  # Service configuration
│   └── test/
└── pom.xml                                      # Service dependencies
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
│   │   │       │   ├── ProviderMapService.java     # Geospatial queries
│   │   │       │   └── ViewportService.java        # Viewport calculations
│   │   │       ├── repository/
│   │   │       │   └── ProviderLocationRepository.java  # PostGIS queries
│   │   │       ├── model/
│   │   │       │   ├── Location.java               # Spatial entity
│   │   │       │   └── Provider.java               # Provider entity
│   │   │       └── dto/
│   │   │           ├── ViewportRequest.java        # Viewport parameters
│   │   │           ├── ProviderResponse.java       # Provider data
│   │   │           └── LocationResponse.java       # Location data
│   │   └── resources/
│   │       └── application.yml  # Database and PostGIS configuration
│   └── test/
│       └── java/
│           └── com/healthapp/mapservice/
│               └── service/
│                   └── ProviderMapServiceTest.java  # Service tests
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

### React Native Files
- Components: `*.component.tsx`
- Screens: `*.screen.tsx`
- Hooks: `use*.ts`
- Reducers: `*.slice.ts`
- Services: `*.service.ts`
- Utils: `*.util.ts`

### Java Files
- Controllers: `*Controller.java`
- Services: `*Service.java`
- Repositories: `*Repository.java`
- Models: `*Entity.java`
- DTOs: `*Dto.java`

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

## Component Best Practices
- Keep components focused and single-responsibility
- Use TypeScript for better type safety
- Implement proper error handling
- Follow React Native performance guidelines
- Maintain consistent styling patterns

## Map Implementation Best Practices
- Use WebView with Leaflet.js for OpenStreetMap integration
- Implement proper error handling for WebView communication
- Ensure proper attribution for OpenStreetMap
- Optimize marker clustering for dense provider areas
- Implement efficient viewport-based loading
- Handle offline scenarios gracefully
- Cache frequently accessed map areas
- Use PostGIS spatial indexes for performance
- Implement fallback UI for network issues
- Follow OpenStreetMap usage policies

## Service-Specific Best Practices

### Chat Service Best Practices
- Use WebSocket for real-time communication
- Implement proper session management with Redis
- Configure DJL models appropriately
- Handle WebSocket connection lifecycle
- Implement proper error handling for AI processing
- Use appropriate thread pools for AI operations
- Cache common responses when possible
- Monitor AI model performance

### Search Service Best Practices
- Implement efficient search algorithms
- Use proper indexing for quick lookups
- Cache frequent search results
- Implement fuzzy matching where appropriate
- Handle multilingual search capabilities
- Optimize specialist mapping logic
- Implement proper error handling
- Use pagination for large result sets

## UI Component Best Practices

### Screen Organization
- Keep screens focused and single-responsibility
- Implement proper loading and error states
- Handle offline scenarios gracefully
- Use proper TypeScript types
- Follow React Native Paper design system

### Component Structure
- Separate business logic into hooks
- Keep components pure and presentational
- Use proper prop typing
- Implement proper memo usage
- Follow accessibility guidelines

### State Management
- Use Redux for global state
- Implement proper loading states
- Handle error scenarios
- Use proper TypeScript types
- Follow immutability patterns

### Navigation
- Implement proper type safety
- Handle deep linking
- Manage navigation state
- Implement proper transitions
- Handle navigation events 