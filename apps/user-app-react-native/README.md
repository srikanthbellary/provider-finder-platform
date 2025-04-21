# Provider Finder User App (React Native)

A React Native application for healthcare consumers to find, evaluate, and connect with healthcare providers. This application uses OpenStreetMap for the map interface.

## Project Structure

```
user-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific code
│   │   ├── map/          # Map and provider search features
│   │   ├── auth/         # Authentication features (future)
│   │   └── profile/      # User profile features (future)
│   ├── i18n/             # Internationalization
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services and data providers
│   ├── store/            # Redux store and slices
│   ├── utils/            # Utility functions
│   └── App.tsx           # Application entry point
├── __tests__/            # Test files (future)
├── index.js              # Entry point
├── app.json              # Application configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Features

- Interactive map-based provider search using OpenStreetMap
- Provider filtering by specialty, languages, and other criteria (upcoming)
- Detailed provider profiles with location and contact information (upcoming)
- Appointment booking capabilities (upcoming)
- User authentication and profile management (upcoming)
- Multi-language support

## Tech Stack

- React Native
- TypeScript
- Redux Toolkit for state management
- React Navigation for routing
- Axios for API requests
- OpenStreetMap with react-native-maps

## Getting Started

### Prerequisites

- Node.js and npm/yarn
- React Native CLI
- Android Studio for Android development
- Xcode for iOS development (Mac only)

### Installation

```bash
# Install dependencies
npm install

# Start the Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

## API Integration

The app integrates with the Provider Finder backend services:

- Map Service for geographic provider search
- Provider Service for detailed provider information
- Auth Service for user authentication (upcoming)
- Appointment Service for booking appointments (upcoming)

## Development

### OpenStreetMap Integration

This project uses OpenStreetMap through react-native-maps with custom tile configuration to provide free and open map services:

- Cost-effective alternative to Google Maps
- No API key requirements for basic functionality
- Support for map clustering and marker customization

### State Management

Redux Toolkit is used for state management:

- Centralized state for the map view, providers, and UI
- Async thunks for API interactions
- TypeScript integration for type safety

### Future Improvements

- Provider pin clustering for dense areas
- Advanced filtering options
- Search functionality
- Appointment booking flow
- User profiles and preferences
- Multi-language support 