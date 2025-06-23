#!/bin/bash

# Build script for the devices backend Docker image

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building devices backend Docker image...${NC}"

# Get the current directory (should be the project root)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Build the image
docker build \
  -f "${PROJECT_ROOT}/apps/backend/devices/Dockerfile" \
  -t iot-sphere-devices:latest \
  "${PROJECT_ROOT}"

echo -e "${GREEN}✅ Devices backend Docker image built successfully!${NC}"
echo -e "${YELLOW}Image: iot-sphere-devices:latest${NC}" 