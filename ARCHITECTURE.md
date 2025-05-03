# Provider Finder Platform - Architecture Documentation

## Overview

The Provider Finder Platform is a comprehensive healthcare provider discovery system with an intuitive, multi-modal interface. The platform is structured as a monorepo containing all services, backends, and UI components in a single repository. This document explains the architectural decisions, current development approach, and future deployment strategy.

## Repository Structure

The platform follows a modular structure within a monorepo:

```
provider-finder-platform/
├── apps/                   # Frontend applications
│   ├── user-app-expo/      # User-facing React Native application (Expo-based)
│   └── provider-app/       # Provider-facing React Native application
├── backend/                # Backend microservices
│   ├── map-service/        # Geographic provider search service with PostGIS
│   ├── chat-service/       # AI-powered chat service with DJL integration
│   ├── search-service/     # Dedicated intelligent search service
│   ├── api-gateway/        # API gateway service
│   └── [other-services]/   # Additional microservices
├── common/                 # Shared libraries and utilities
├── docs/                   # Documentation and mappings
│   └── symp_spec.json     # Symptom-to-specialist mapping
├── infra/                  # Infrastructure configuration
└── scripts/                # Utility scripts
```

## User Flow Architecture

### 1. Home Screen
- Three main entry points:
  - Search: Text-based symptom/provider search
  - Chat: AI-powered conversational interface (planned)
  - Voice: Speech-based interaction (planned)

### 2. Search Flow
1. User enters search text (symptom/specialty/provider)
2. System processes input:
   - If symptom: Maps to specialist using symp_spec.json
   - If specialty/provider: Direct search
3. Backend queries provider database
4. Results displayed on map view

### 3. Map Integration
- Pure OpenStreetMap implementation via WebView and Leaflet.js
- No dependency on Google Maps or other proprietary services
- Provider markers with custom styling and clustering
- Distance-based sorting and filtering using PostGIS
- Interactive provider details with popup information
- Seamless toggle between map and list views
- Proper attribution to OpenStreetMap contributors
- Optimized viewport-based loading with spatial indexes
- Two-way communication between React Native and WebView

## Frontend Technology Choice

After careful consideration and business requirements analysis, **React Native** has been selected as the frontend technology for both user and provider applications. Key factors in this decision include:

1. **Strong Community Support**: React Native has a larger and more established developer community
2. **JavaScript Ecosystem**: Leverages the extensive JavaScript/TypeScript ecosystem
3. **Native Performance**: Provides near-native performance with JavaScript development experience
4. **Corporate Backing**: Maintained by Facebook/Meta with strong industry support
5. **Map Implementation Options**: Mature libraries for OpenStreetMap integration
6. **Code Reusability**: Potential to share code with web applications if needed in the future

## Component Architecture

### Frontend Components
1. **Home Screen**
   - Modern three-button interface
   - Material design implementation
   - Feature cards with icons
   - Responsive layout
   - Navigation integration

2. **Chat Screen**
   - GiftedChat integration
   - WebSocket connection
   - Real-time messaging
   - Session management
   - Typing indicators
   - Message persistence
   - Error recovery

3. **Search Screen**
   - Search interface
   - Filter panel
   - Sort options
   - Provider listing
   - Pagination support
   - Pull-to-refresh
   - Loading states
   - Error handling

4. **Map Component**
   - OpenStreetMap integration
   - Provider markers
   - Interactive overlays
   - Location tracking
   - Viewport management
   - Marker clustering
   - List/map toggle

5. **Shared Components**
   - Error boundaries
   - Loading states
   - Error displays
   - Navigation structure
   - Theme system
   - Internationalization

### UI Architecture Patterns
1. **Feature-First Organization**
   - Separate feature modules
   - Isolated component trees
   - Feature-specific state
   - Dedicated hooks
   - Focused testing

2. **State Management**
   - Redux for global state
   - Local state with hooks
   - WebSocket state handling
   - Loading state management
   - Error state handling

3. **Navigation Flow**
   - Stack-based navigation
   - Type-safe routes
   - Deep linking support
   - Screen transitions
   - State persistence

4. **UI/UX Principles**
   - Material Design
   - Responsive layouts
   - Accessibility support
   - Error prevention
   - Loading feedback
   - Offline support

### Backend Services
1. **Map Service**
   - Provider geolocation
   - Distance calculations
   - Spatial queries
   - PostGIS integration
   - Viewport optimization

2. **Chat Service**
   - Spring Boot based implementation
   - Deep Java Library (DJL) for AI capabilities
   - WebSocket support for real-time chat
   - Redis-based session management
   - Integration with HuggingFace tokenizers
   - Real-time response generation
   - Service discovery via Eureka

3. **Search Service**
   - Spring Boot based implementation
   - Intelligent search capabilities
   - Symptom-to-specialist mapping
   - Provider matching algorithms
   - Integration with map service
   - Advanced filtering options

4. **Future Services**
   - Voice processing
   - Additional AI recommendations

## Data Flow

1. **Search Flow**
```
User Input -> Search Service -> Specialist Mapping -> Provider Search -> Map Display
```

2. **Chat Flow**
```
User Message -> Chat Service (WebSocket) -> DJL Processing -> Service Integration -> Response Generation
```

3. **Direct Provider Flow**
```
Provider Search -> Geospatial Query -> Map Display
```

## Deployment Strategy

### Containerization

All services are containerized using Docker, with each component having its own:
- Dockerfile with appropriate base image
- Environment variable configuration
- Resource requirements
- Health checks

### Runtime Environments

The platform is designed to be deployable in multiple environments:

1. **Cloud Providers**
   - Google Cloud Platform (GCP) - Primary target
     - Cloud Run for stateless services
     - GKE for more complex workloads 
     - Cloud SQL for databases
   - AWS or Azure as alternatives
   
2. **On-Premises**
   - Kubernetes for orchestration
   - Docker Compose for simpler deployments
   - Self-hosted databases
   
3. **Hybrid Approaches**
   - Supports mixed deployments when necessary

## Security Approach

Security has been designed with a cloud-native approach:

1. **Secret Management**
   - Environment variables for configuration
   - Runtime-generated configurations
   - Integration with cloud secret managers
   - No hardcoded secrets or API keys

2. **Service Authentication**
   - Service-to-service authentication
   - Proper CORS configuration
   - API key management for third-party services

3. **Cost-Effective Map Services**
   - Pure OpenStreetMap implementation via WebView and Leaflet.js
   - Zero ongoing costs for map services
   - No API key requirements
   - Complete independence from proprietary map services
   - Efficient provider data querying through PostGIS
   - Custom marker clustering for improved performance
   - Seamless integration with backend spatial queries
   - Full compliance with OpenStreetMap usage policies

## Migration Path

The migration from monorepo to independent repositories will follow these steps:

1. **Preparation**
   - Ensure clean module boundaries
   - Identify and resolve cross-dependencies
   - Establish versioning strategy

2. **Repository Creation**
   - Create separate repositories for each component
   - Transfer codebase with history preservation

3. **CI/CD Setup**
   - Establish independent pipelines
   - Set up deployment workflows

4. **Governance**
   - Establish API contracts
   - Document interface agreements
   - Set up monitoring and observability

## Best Practices

When working with this codebase:

1. **Component Independence**
   - Design components to be self-contained
   - Use well-defined APIs for communication
   - Avoid creating implicit dependencies

2. **Configuration**
   - Store configuration in environment variables
   - Use runtime configuration generation for sensitive data
   - Follow the principles in the secure-api-keys implementation

3. **Documentation**
   - Document component interfaces
   - Maintain API documentation
   - Update deployment instructions

## React Native Best Practices

When developing React Native components:

1. **Component Architecture**
   - Use functional components with hooks
   - Implement React's unidirectional data flow
   - Separate UI components from business logic

2. **State Management**
   - Use Redux for complex global state
   - Leverage React Context for simpler shared state
   - Implement React Query for API state management

3. **Navigation**
   - Use React Navigation for consistent navigation patterns
   - Implement deep linking where appropriate
   - Handle proper state persistence during navigation

4. **Performance**
   - Optimize list rendering with FlatList and SectionList
   - Use memo and useCallback for expensive components
   - Implement proper asset management and caching

## Technology Stack Updates

1. **Backend Technologies**
   - Java 17 + Spring Boot for all services
   - Deep Java Library (DJL) for AI capabilities
   - PostgreSQL with PostGIS for geospatial
   - Redis for session management and caching
   - Spring Cloud for service discovery

2. **Frontend Technologies**
   - React Native with Expo
   - WebView + Leaflet.js for maps
   - TypeScript for type safety
   - Redux for state management

## Conclusion

This architecture provides a robust foundation for the Provider Finder Platform, with clear separation of concerns and a user-centric approach. The new home screen and search flow enhance user experience while maintaining the system's scalability and maintainability. 