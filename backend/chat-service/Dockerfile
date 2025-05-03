FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app

# Copy POM first for dependency resolution
COPY pom.xml .

# Copy source files
COPY src ./src

# Build application, skipping tests
RUN mvn clean package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8095
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8095/api/chat/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"] 