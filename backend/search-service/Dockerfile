# Build stage
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
COPY src/main/resources/symp_spec.json /app/symp_spec.json

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8085/api/search/providers/health || exit 1

EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"] 