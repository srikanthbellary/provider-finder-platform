# Provider Finder Platform - Developer Runbook

This runbook provides step-by-step instructions for setting up and running the Provider Finder application after pulling this feature branch.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Java Development Kit (JDK) 11+
- Android SDK with Android Studio
- Docker and Docker Compose
- Git

## 1. Clone and Setup

1. Clone the repository and switch to the feature branch:
```bash
git clone https://github.com/your-organization/provider-finder-platform.git
cd provider-finder-platform
git checkout feature/react-native-map-integration
```

2. Install dependencies for the React Native app:
```bash
cd apps/user-app-react-native
npm install
```

## 2. Start Backend Services

1. Start the required Docker containers from the project root:
```bash
cd ../../  # Navigate back to project root if needed
docker-compose up -d
```

2. Verify the containers are running:
```bash
docker ps
```

You should see containers for:
- PostgreSQL with PostGIS
- Map Service
- Redis (may not be actively used yet)

3. Verify the Map Service is accessible:
```bash
curl http://localhost:8081/api/map/health
```

If successful, you should see a health status response.

## 3. Configure Android Emulator

1. Launch Android Studio
2. Open AVD Manager (Tools > AVD Manager)
3. Create a new emulator if you don't have one:
   - Select a device (Pixel 6 recommended)
   - Select a system image (API 31+ recommended)
   - Complete the emulator creation

4. Start the emulator

## 4. Run the React Native App

1. Navigate to the user app directory:
```bash
cd apps/user-app-react-native
```

2. Configure the local environment:
```bash
# Create a local.properties file pointing to your Android SDK
echo "sdk.dir=C:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties
# Replace USERNAME with your Windows username
```

3. Start Metro bundler:
```bash
npx react-native start
```

4. In another terminal, deploy to the emulator:
```bash
npx react-native run-android
```

## 5. Troubleshooting

### Backend Issues

If the backend services aren't responding:

1. Check Docker container logs:
```bash
docker logs map-service
```

2. Ensure PostgreSQL is running:
```bash
docker logs postgres
```

3. Restart services if needed:
```bash
docker-compose restart map-service
```

### React Native Issues

If the app fails to build or run:

1. Clear Metro cache:
```bash
npx react-native start --reset-cache
```

2. Check for common errors:
   - **"SDK location not found"**: Create android/local.properties file with sdk.dir path
   - **Connection errors**: Ensure backend services are running
   - **Emulator not detected**: Start emulator before running the app

3. Specific Android build issues:
```bash
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

### Emulator Connection Issues

If the app can't connect to backend services:

1. Use the Android emulator's localhost with 10.0.2.2:
   - Backend URL should be configured as `http://10.0.2.2:8081/api/map`
   - This is automatically configured in the app, but verify in src/config/environment.ts

2. Check network permissions in AndroidManifest.xml

## 6. Testing the App

After launching the app:

1. **Map View**: You should see a map centered with provider markers
2. **Map Controls**: Test zoom in/out controls
3. **Provider Markers**: Tap on markers to see provider details
4. **Data Loading**: Verify real provider data is loaded from the database

## 7. Development Workflow

1. Make your changes to the code
2. Test on the emulator
3. Commit changes with meaningful messages
4. Push to the feature branch
5. Create pull request when feature is complete

## 8. Code Structure Overview

- **src/features/map/**: Map-related components and logic
- **src/services/api/**: Backend API integration
- **src/components/**: Shared UI components
- **src/store/**: Redux state management

## 9. Contact Information

For issues or questions about this feature branch, contact:
- Project Lead: [Your Name]
- Backend Specialist: [Backend Dev Name]
- React Native Developer: [Frontend Dev Name] 