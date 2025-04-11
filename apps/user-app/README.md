# Provider Finder - User App

A Flutter application for finding healthcare providers on a map, viewing their details, and booking appointments.

## Features

- Interactive map showing healthcare providers in the current viewport
- Provider details with specialties, languages, and contact information
- User location tracking and distance calculation
- Search functionality for finding providers by name, specialty, etc.
- Filter options for refined searches
- Appointment booking workflow (coming soon)

## Getting Started

### Prerequisites

- Flutter SDK: >= 3.0.0
- Dart SDK: >= 3.0.0
- Android Studio or VS Code with Flutter extensions

### Setup

1. Clone the repository
   ```
   git clone https://your-repository-url.git
   cd provider-finder-platform/apps/user-app
   ```

2. Install dependencies
   ```
   flutter pub get
   ```

3. Configure API endpoints

   Update the API URL in `lib/services/config/api_config.dart` to point to your running backend services.

4. Configure Google Maps

   For Android:
   - Create a Google Maps API key in the [Google Cloud Console](https://console.cloud.google.com/)
   - Add your API key to `android/app/src/main/AndroidManifest.xml`:
     ```xml
     <meta-data
         android:name="com.google.android.geo.API_KEY"
         android:value="YOUR_API_KEY_HERE"/>
     ```

   For iOS:
   - Add your API key to `ios/Runner/AppDelegate.swift`:
     ```swift
     GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
     ```

5. Run the app
   ```
   flutter run
   ```

## Architecture

The app follows a feature-first architecture:

- **Models**: Data models representing API requests/responses
- **Services**: API clients and business logic
- **Screens**: Full pages in the app
- **Widgets**: Reusable UI components

## Dependencies

- **google_maps_flutter**: For displaying the map and provider pins
- **http**: For API requests
- **geolocator**: For user location tracking
- **flutter_riverpod**: For state management
- **url_launcher**: For launching phone, email, and website URLs
- **intl**: For internationalization and formatting

## Connected Services

This app connects to the following backend services:
- **Map Service**: For geospatial provider search
- **Provider Service**: For detailed provider information (coming soon)
- **Appointment Service**: For booking appointments (coming soon)
- **Auth Service**: For user authentication (coming soon)

## License

This project is licensed under the terms of the LICENSE file included in the repository. 