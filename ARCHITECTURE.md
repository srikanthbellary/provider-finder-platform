# Provider Finder Platform - Architecture Documentation

## Overview

The Provider Finder Platform is currently structured as a monorepo containing all services, backends, and UI components in a single repository. This document explains the architectural decisions, current development approach, and future deployment strategy.

## Repository Structure

The platform follows a modular structure within a monorepo:

```
provider-finder-platform/
├── apps/                   # Frontend applications
│   ├── user-app/           # User-facing React Native application 
│   └── provider-app/       # Provider-facing React Native application
├── backend/                # Backend microservices
│   ├── map-service/        # Geographic provider search service
│   ├── api-gateway/        # API gateway service
│   └── [other-services]/   # Additional microservices
├── common/                 # Shared libraries and utilities
├── docs/                   # Documentation
├── infra/                  # Infrastructure configuration
└── scripts/                # Utility scripts
```

## Development Approach

### Current: Monorepo Strategy

We've adopted a monorepo approach during the initial development phase for several reasons:

1. **Simplified Coordination**: Easier to coordinate changes across service boundaries
2. **Consistency**: Enforces consistent coding standards and architecture
3. **Visibility**: Provides a complete view of the platform
4. **CI/CD Efficiency**: Allows for efficient testing of cross-service changes
5. **Reduced Overhead**: Simplifies dependency management
6. **Speed of Development**: Facilitates rapid iteration during the early stages

### Future: Independent Microservices

While development occurs in a monorepo, each component is designed to function as an independent microservice with its own:

- Deployment lifecycle
- Version control repository
- Continuous integration/deployment pipeline
- Scaling characteristics
- Resource allocations

## Frontend Technology Choice

After careful consideration and business requirements analysis, **React Native** has been selected as the frontend technology for both user and provider applications. Key factors in this decision include:

1. **Strong Community Support**: React Native has a larger and more established developer community
2. **JavaScript Ecosystem**: Leverages the extensive JavaScript/TypeScript ecosystem
3. **Native Performance**: Provides near-native performance with JavaScript development experience
4. **Corporate Backing**: Maintained by Facebook/Meta with strong industry support
5. **Map Implementation Options**: Mature libraries for OpenStreetMap integration
6. **Code Reusability**: Potential to share code with web applications if needed in the future

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
   - Integration with cloud secret managers (GCP Secret Manager, etc.)
   - No hardcoded secrets or API keys

2. **Service Authentication**
   - Service-to-service authentication
   - Proper CORS configuration
   - API key management for third-party services

3. **Cost-Effective Map Services**
   - Implementing OpenStreetMap for mapping functionality
   - Eliminates ongoing costs associated with map loads
   - Provides flexibility in tile server selection
   - Removes dependency on third-party API keys for core map functions
   - Maintains geographic functionality through PostGIS in the backend

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

## Conclusion

This architecture provides the best of both worlds: the development efficiency of a monorepo with the deployment flexibility of microservices. Each component is designed to operate independently while maintaining coherent integration within the platform.

By adopting React Native as our frontend technology and following this architecture approach, we ensure the Provider Finder Platform can scale and evolve while maintaining deployment flexibility across cloud providers and on-premises environments. 