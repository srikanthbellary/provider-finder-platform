#!/bin/sh
set -e

# Generate runtime configuration from environment variables
/startup.sh

# Execute the original CMD
exec "$@" 