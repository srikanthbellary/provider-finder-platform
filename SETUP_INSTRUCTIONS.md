# Provider Finder Platform - Setup Instructions

These instructions will help you get the development environment up and running when you resume development.

## Prerequisites

- Java 17 JDK
- Maven 3.8+ 
- Docker Desktop
- Node.js 18+
- Expo CLI

## Environment Setup

### 1. Backend Services

#### Starting Required Services

1. **Start Database and Infrastructure Services**:
   ```bash
   # From project root
   docker-compose up -d postgres redis discovery-server
   ```

   Allow the database and discovery server to initialize before proceeding.

2. **Start Application Services**:
   ```bash
   # Start map service
   docker-compose up -d map-service
   
   # Start chat service
   docker-compose up -d chat-service
   
   # Start search service
   docker-compose up -d search-service
   ```

3. **Check Service Status**:
   ```bash
   docker-compose ps
   ```

   The output should show all services (postgres, redis, discovery-server, map-service, chat-service, search-service) as running.

#### Verifying Service Functionality

1. **Discovery Server (Eureka)**:
   - Access Eureka dashboard in browser: `http://localhost:8761`
   - Verify registered services appear (map-service, chat-service, search-service).

2. **Map Service**:
   ```bash
   curl http://localhost:8090/api/map/providers/health
   ```

3. **Chat Service**:
   ```bash
   curl http://localhost:8095/api/chat/health
   ```

4. **Search Service**:
   ```bash
   curl http://localhost:8085/api/search/providers/health
   ```

### 2. Frontend Development

1. **Install Dependencies**:
   ```bash
   cd apps/user-app-expo
   npm install
   ```

2. **Start Expo Development Server**:
   ```bash
   npm start
   # or
   npx expo start
   ```

3. **Test on Emulator/Device**:
   - Press `a` to run on Android emulator
   - Press `i` to run on iOS simulator
   - Scan the QR code with Expo Go app for physical device testing

## Known Issues and Workarounds

### 1. Android Native Build Failure

Running `npx expo run:android` currently fails with a Gradle error (`Unresolved reference: serviceOf`). This blocks the creation of a development build needed for native modules (like `react-native-reanimated`).

**To resolve:**
1. Investigate Gradle version compatibility (Project vs. React Native Gradle Plugin).
2. Check Expo SDK / React Native versions for conflicts.
3. Consult `DEVELOPMENT_STATUS.md` for more details on the specific error.
4. Once fixed, run `npx expo run:android` to create the build.

### 2. DJL Dependency Issues

The chat service currently uses a simplified implementation without DJL due to dependency issues.

To try implementing DJL again:
1. Update the Maven repository configuration in `backend/chat-service/pom.xml`
2. Consider using a newer compatible version of DJL libraries
3. Test with specific operating system and architecture-compatible libraries

### 3. Service Discovery Issues

The platform uses Eureka for service discovery. Ensure the `discovery-server` container is running before starting other services.

1. Start the discovery server:
   ```bash
   docker-compose up -d discovery-server
   ```

2. Ensure services are configured as Eureka clients in their respective `application.yml`:
   ```yaml
   eureka:
     client:
       register-with-eureka: true
       fetch-registry: true
       service-url:
         defaultZone: http://discovery-server:8761/eureka/
   ```

### 4. Multiple Application Classes

If you encounter build errors about multiple main classes:
1. Specify the main class in pom.xml:
   ```xml
   <properties>
       <start-class>com.healthcare.chatservice.ChatServiceApplication</start-class>
   </properties>
   ```

2. Configure Maven plugin:
   ```xml
   <plugin>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-maven-plugin</artifactId>
       <configuration>
           <mainClass>${start-class}</mainClass>
       </configuration>
   </plugin>
   ```

## Testing Endpoints

### Chat Service

Test symptom analysis:
```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"message":"I have a severe headache and nausea"}' \
     http://localhost:8095/api/chat/message
```

### Map Service

Search for providers in a viewport:
```bash
curl -X GET "http://localhost:8090/api/map/providers?northLat=40.8&southLat=40.7&eastLng=-74.0&westLng=-74.1"
```

### Search Service

Search for providers by specialty:
```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"query":"Neurologist","searchType":"SPECIALTY"}' \
     http://localhost:8085/api/search/providers/search
```

## Additional Resources

- [Project Tracker](project-tracker.md) - Historical development tracking
- [Development Status](DEVELOPMENT_STATUS.md) - Current status and roadblocks
- [Architecture Documentation](ARCHITECTURE.md) - System architecture details 