# Provider Finder - React Native Setup Guide

This document provides instructions to complete the setup for the Provider Finder React Native app.

## Prerequisites

1. Node.js (v14 or newer)
2. npm or yarn
3. Android Studio
4. JDK 11 or newer
5. Android SDK
6. Android device or emulator

## Completing the Setup

### 1. Install Dependencies

```bash
# Navigate to the project directory
cd apps/user-app-react-native

# Install dependencies
npm install

# For specific modules needed
npm install react-native-maps --save
npm install @react-navigation/native @react-navigation/stack
npm install react-native-gesture-handler
npm install react-native-safe-area-context
npm install react-native-screens
```

### 2. Create Android Debug Keystore

```bash
# Navigate to the Android app directory
cd android/app

# Generate debug keystore
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Set up Android SDK Location

Create a `local.properties` file in the `android` directory with your Android SDK path:

```properties
# For Windows
sdk.dir=C:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk

# For macOS/Linux
sdk.dir=/Users/USERNAME/Library/Android/sdk
```

### 4. Verify Backend is Running

Ensure the Map Service backend is running:

```bash
# Check if it's accessible
curl http://localhost:8081/api/map/providers/map?northLat=17.45&southLat=17.35&eastLng=78.55&westLng=78.40
```

### 5. Run the App

```bash
# Start Metro Bundler
npm start

# In a new terminal, run on Android
npm run android
```

## Troubleshooting

### Network Errors
- If the app can't connect to the backend, check that the Map Service is running
- For Android emulator, ensure the backend URL is set to `10.0.2.2` instead of `localhost`
- For real device debugging, use your computer's IP address in the API configuration

### Package Manager Issues
- If you encounter "Unable to resolve module" errors, try:
  ```bash
  npm start -- --reset-cache
  ```

### OpenStreetMap Tile Loading Issues
- If map tiles don't load, check internet connectivity
- Verify that the OSM tile server URLs are accessible
- Ensure the app has proper permissions in AndroidManifest.xml

## Next Development Steps

1. Implement marker clustering for better performance
2. Create the provider detail view
3. Add search and filtering functionality
4. Complete the appointment booking flow 