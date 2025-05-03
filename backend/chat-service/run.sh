#!/bin/bash
echo "Building chat service..."
mvn clean package -DskipTests

echo "Running chat service..."
java -jar target/chat-service-1.0.0.jar 