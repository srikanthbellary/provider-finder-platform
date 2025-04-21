# Provider Finder - User App

## Overview

The Provider Finder User App is a React Native-based frontend application designed for healthcare consumers to find, evaluate, and connect with healthcare providers. It is developed as part of the monorepo strategy but is designed to function as an independent component in production deployments.

## Purpose and Features

- Interactive map-based provider search
- Provider filtering by specialty, languages, and other criteria
- Detailed provider profiles with location and contact information
- Appointment booking capabilities
- User authentication and profile management
- Multi-platform support (Android, iOS, with web support via React Native Web)

## Technical Architecture

### Technology Stack

- **Framework**: React Native
- **Languages**: JavaScript/TypeScript
- **State Management**: Redux Toolkit and React Query
- **Map Implementation**: 
  - OpenStreetMap (via react-native-maps with OSM configuration)
  - Alternative options: react-native-mapbox-gl
- **Networking**: Axios and React Query
- **Containerization**: Docker (web version)
- **API Integration**: RESTful APIs to backend services
- **Navigation**: React Navigation
- **UI Components**: React Native Paper or Native Base

### Project Structure

```
user-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific code
│   │   ├── map/          # Map and provider search features
│   │   ├── auth/         # Authentication features
│   │   └── profile/      # User profile features
│   ├── i18n/             # Internationalization
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services and data providers
│   ├── store/            # Redux store and slices
│   ├── utils/            # Utility functions
│   └── App.tsx           # Application entry point
├── assets/               # Images, fonts, and other static assets
├── android/              # Android-specific configuration
├── ios/                  # iOS-specific configuration
├── __tests__/            # Test files
├── package.json          # Dependencies and project configuration
└── tsconfig.json         # TypeScript configuration
```

### Map Implementation

We are implementing OpenStreetMap through React Native map libraries to reduce costs and dependencies on third-party APIs:

1. Primary implementation using react-native-maps with OSM tile configuration
2. Implementing marker handling with custom pin components
3. Adding clustering for improved performance with large datasets
4. Optimizing for performance across platforms

Our backend Map Service is provider-agnostic (using PostGIS), so no changes to the backend API are required for this implementation.

## Configuration

### API Keys and Environment Variables

The app uses a secure runtime configuration approach to manage API keys and environment variables:

- Environment variables managed through react-native-config
- During development: Local .env files are used
- For production: Environment variables injected during build process

Required environment variables:
```
API_BASE_URL=https://api.provider-finder.example.com
MAPBOX_TOKEN=your-mapbox-token  # Only if using Mapbox tiles instead of OSM
```

## Deployment

The app can be deployed on multiple platforms:

### Web Deployment (via React Native Web)

A containerized approach is used for web deployment:

```bash
# Build the Docker image
docker build -t provider-finder/user-app .

# Run the container
docker run -p 80:80 \
  -e API_BASE_URL=https://api.provider-finder.example.com \
  provider-finder/user-app
```

#### Cloud Deployment (GCP Cloud Run)

```bash
# Deploy to Cloud Run
gcloud run deploy user-app \
  --image gcr.io/your-project/user-app \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="API_BASE_URL=https://api.provider-finder.example.com"
```

### Mobile Deployment

#### Android

1. Configure the app in the Google Play Console
2. Create a release build:
   ```bash
   cd android && ./gradlew bundleRelease
   ```
3. Upload the resulting app bundle to Google Play

#### iOS

1. Configure the app in App Store Connect
2. Create a release build using Xcode
3. Archive and upload to App Store

## Development

### Prerequisites

- Node.js and npm/yarn
- React Native CLI
- Android Studio for Android development
- Xcode for iOS development (Mac only)
- Metro bundler
- Watchman (recommended)

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/provider-finder-platform.git
   ```

2. Navigate to the user app:
   ```bash
   cd provider-finder-platform/apps/user-app
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create necessary environment files based on examples

5. Run the app:
   ```bash
   # Start Metro bundler
   npx react-native start
   
   # For Android
   npx react-native run-android
   
   # For iOS
   npx react-native run-ios
   
   # For web (if configured with react-native-web)
   npm run web
   ```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Integration Points

The User App integrates with:

- **Map Service**: For geographic provider search
- **Provider Service**: For detailed provider information
- **Auth Service**: For user authentication
- **Appointment Service**: For booking appointments

## Independent Repository Considerations

When migrated to an independent repository, this app will maintain:

- Separate version control and release cycles
- Dedicated CI/CD pipeline for mobile releases
- Environment-specific configuration management
- Documentation for standalone development

## Responsive Design

The app implements a responsive design approach:
- Adapts to different screen sizes (phone, tablet)
- Supports both portrait and landscape orientations
- Uses React Native's Dimensions API and responsive design patterns

## Internationalization

The app supports multiple languages through i18next:
- English (default)
- Spanish
- Additional languages can be added through the i18n system

## Performance Considerations

- FlatList and SectionList for optimized list rendering
- Proper implementation of memo and useCallback for heavy components
- Image caching and optimization
- Efficient marker rendering for map performance 