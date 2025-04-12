#!/bin/bash

# This script generates runtime configuration from environment variables
# It should be run as part of the container startup process

# Create the runtime configuration file
cat > /app/web/runtime-config.js << EOF
// This file is auto-generated at runtime. Do not edit manually.
window.runtimeConfig = {
  // API Keys
  GOOGLE_MAPS_API_KEY: '${GOOGLE_MAPS_API_KEY}',
  
  // Environment-specific configuration
  API_BASE_URL: '${API_BASE_URL:-/api}',
  
  // Feature flags
  ENABLE_LOGGING: ${ENABLE_LOGGING:-false},
  ENABLE_ANALYTICS: ${ENABLE_ANALYTICS:-false}
};
EOF

echo "Runtime configuration generated successfully." 