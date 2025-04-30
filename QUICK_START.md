# 🚀 Quick Start Manual for Srikanth Bellary to run this app on his local machine (Not for other developers)

## Daily Startup Steps

### 0. First Time or If Things Get Stuck
```bash
# 1. Find what's using port 8081:
netstat -ano | findstr :8081

# 2. Kill the process (replace XXXX with PID from step 1):
taskkill /F /PID XXXX

# 3. Verify port is free:
netstat -ano | findstr :8081   # Should show nothing

# 4. Close emulator if running
# 5. Close all terminal windows
# 6. Start fresh
```

### 1. Start Docker Desktop
- Open Docker Desktop
- Wait until it's fully started (green light in the bottom left)
- Verify PostgreSQL container is running (ID: 6a4468ac72b4)

### 2. Start Backend Service
```bash
# 1. Open a NEW PowerShell window (don't use the old one)
# 2. Navigate to map-service
cd backend/map-service

# 3. Start the service (it will use host.docker.internal to connect to PostgreSQL)
./mvnw spring-boot:run
```

### 3. Start the App
```bash
# 1. Open ANOTHER NEW PowerShell window
# 2. Navigate to expo directory
cd apps/user-app-expo

# 3. Start the app
npx expo start --android --clear
```

## Troubleshooting
If you get errors:
1. Make sure Docker Desktop is running and shows green light
2. Check that PostgreSQL container is running in Docker Desktop
3. Always use NEW PowerShell windows for each service
4. Never try to run Docker commands in the same window as the app or backend

## Common Commands During Development
- Reload app: Press `r`
- Open dev menu: Press `m`
- Show all commands: Press `?`
- Open debugger: Press `j`

## Common Issues & Quick Fixes
- If port 8081 is busy: Just press `y` when asked to use 8082
- If app doesn't load: Press `a` in terminal
- If map is slow: Check your internet connection
- If providers don't load: Check if backend is running

## Backend Status Check
The app should show real provider data from PostgreSQL. You'll see logs like:
```
LOG  Fetching real providers from PostgreSQL database...
LOG  Fetched 20 providers from database
```

## Current Setup
- We're using Expo (NOT bare React Native)
- App directory: `apps/user-app-expo`
- Backend service: `backend/map-service` on port 8081
- Database: PostgreSQL with PostGIS running in Docker

## Docker Container Status
You should see these containers running:
```bash
docker ps

# Should show:
# - PostgreSQL (postgis/postgis:14-3.2) on port 5432
# - Redis (redis:7.0-alpine) on port 6379
# - Elasticsearch (elasticsearch:7.1) on port 9200
```

## Verifying Everything Works

1. **Database is running** if you see the PostgreSQL container in `docker ps`

2. **Backend is running** if you see:
   ```
   Started MapServiceApplication in X.XXX seconds
   ```

3. **App is connected** if you see:
   ```
   LOG  Fetching real providers from PostgreSQL database...
   LOG  Response received from database
   ```

4. **Map should show**:
   - OpenStreetMap tiles loaded
   - Red markers for providers (no black boxes)
   - Provider cards when markers are tapped

If you don't see these logs, something isn't connected properly! 

## Verifying Real Data
You should see in the Expo terminal:
```
LOG  Fetching real providers from PostgreSQL database...
LOG  Response received from database
```

If you don't see these logs, you're probably seeing cached/mock data! 