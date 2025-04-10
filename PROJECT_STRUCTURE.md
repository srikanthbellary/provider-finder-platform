# Provider Finder Platform - Project Structure

## Overview
This document outlines the project structure for the Provider Finder Platform, a healthcare provider discovery and appointment management system.

## Root Directory Structure
```
provider-finder-platform/
├── apps/                      # Flutter applications
│   ├── user-app/             # Patient-facing mobile app
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

### Flutter Apps (`apps/`)
```
apps/
├── user-app/
│   ├── lib/
│   │   ├── features/
│   │   │   ├── map/         # Map-related features
│   │   │   ├── search/      # Provider search
│   │   │   ├── appointments/# Appointment management
│   │   │   └── profile/     # User profile
│   │   ├── core/           # Core functionality
│   │   ├── shared/         # Shared components
│   │   └── i18n/           # Internationalization
│   └── test/              # Tests
└── provider-app/
    ├── lib/
    │   ├── features/
    │   │   ├── dashboard/   # Provider dashboard
    │   │   ├── schedule/    # Schedule management
    │   │   ├── patients/    # Patient management
    │   │   └── profile/     # Provider profile
    │   ├── core/           # Core functionality
    │   ├── shared/         # Shared components
    │   └── i18n/           # Internationalization
    └── test/              # Tests
```

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

### Flutter Files
- Widgets: `*_widget.dart`
- Screens: `*_screen.dart`
- Models: `*_model.dart`
- Services: `*_service.dart`

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