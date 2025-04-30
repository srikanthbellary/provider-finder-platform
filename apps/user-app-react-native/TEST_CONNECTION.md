# Testing the Connection to Map Service and PostgreSQL

This guide outlines how to verify the connection between the React Native app and the backend Map Service with PostgreSQL database.

## 1. Start the Backend Services

First, ensure the Docker containers for the Map Service and PostgreSQL are running:

```bash
# Navigate to the project root
cd ../../

# Start the backend services using Docker Compose
docker-compose up -d postgres
docker-compose up -d map-service
```

## 2. Verify PostgreSQL is Running

Verify that PostgreSQL with PostGIS extension is running properly:

```bash
# Check if the container is running
docker ps | grep postgres

# Optionally, connect to PostgreSQL to verify data
docker exec -it provider-finder-postgres psql -U appuser -d providerdb -c "SELECT count(*) FROM provider.provider;"
```

This should return the count of providers in the database.

## 3. Test the Map Service API

Make a direct request to the Map Service API to verify it's working:

```bash
# Test a simple viewport query
curl "http://localhost:8081/api/map/providers/map?northLat=17.45&southLat=17.35&eastLng=78.55&westLng=78.40"
```

You should receive a JSON response with providers in the specified viewport.

## 4. Update the React Native Environment Configuration

If you're testing on an emulator or device, ensure the API endpoint in the environment config is correctly set:

- For emulator: `10.0.2.2:8081/api/map` (points to localhost of your computer)
- For real device: Use your computer's IP address (e.g., `192.168.x.x:8081/api/map`)

The environment configuration file is located at `src/config/environment.ts`.

## 5. Test the Connection in the React Native App

To test the connection from the React Native app:

1. Start the Metro bundler:
   ```bash
   npm start
   ```

2. In a new terminal, run the app on an Android emulator:
   ```bash
   npm run android
   ```

3. Once the app is running, it should automatically attempt to fetch providers from the Map Service based on the initial viewport.

4. Check the Metro bundler console for API request logs to verify the connection.

## 6. Troubleshooting Connection Issues

If you encounter connection issues:

- **PostgreSQL Connection Error**: Check Docker logs with `docker logs provider-finder-postgres`
- **Map Service API Error**: Check Docker logs with `docker logs map-service`
- **CORS Issues**: Verify the Map Service's CORS configuration allows requests from your app
- **Network Access**: Ensure your emulator/device can access the API endpoint (check firewall settings)
- **API Configuration**: Verify the API URL in the environment config points to the correct address

## 7. Testing API Responses in the Browser

For a visual inspection of the API response:

1. Open a browser and navigate to:
   ```
   http://localhost:8081/api/map/swagger-ui.html
   ```

2. Use the Swagger UI to test the API endpoints directly.

## 8. Database Schema Verification

To verify the PostGIS schema is correctly configured:

```bash
docker exec -it provider-finder-postgres psql -U appuser -d providerdb -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'provider';"
```

This will list all tables in the `provider` schema, which should include `provider`, `location`, and others. 