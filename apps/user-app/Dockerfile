# Stage 1: Build the Flutter web app
FROM dart:stable AS builder

# Install Flutter dependencies
RUN apt-get update 
RUN apt-get install -y curl git unzip xz-utils zip libglu1-mesa

# Clone Flutter repository and set up environment
RUN git clone https://github.com/flutter/flutter.git /flutter
ENV PATH="/flutter/bin:${PATH}"

# Run basic check to download prebuilt tools
RUN flutter doctor -v

# Set working directory
WORKDIR /app

# Copy app source code
COPY . .

# Get dependencies
RUN flutter pub get

# Build for web
RUN flutter build web --release

# Stage 2: Create a small production image
FROM nginx:alpine

# Copy build files from the builder stage
COPY --from=builder /app/build/web /usr/share/nginx/html

# Copy our custom startup script
COPY --from=builder /app/scripts/generate-runtime-config.sh /startup.sh

# Make the startup script executable
RUN chmod +x /startup.sh

# Use a custom entrypoint script to generate configs at runtime
COPY --from=builder /app/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 