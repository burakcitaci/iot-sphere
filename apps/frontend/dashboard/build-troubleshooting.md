# Docker Build Troubleshooting Guide

## Network Issues

If you're experiencing network connectivity issues during `yarn install`:

### Option 1: Use a Different Registry
```powershell
# Use npm registry instead of yarn
docker build --build-arg YARN_REGISTRY=https://registry.npmjs.org/ -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile .
```

### Option 2: Build with No Cache
```powershell
docker build --no-cache -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile .
```

### Option 3: Use Local Yarn Cache
```powershell
# First, install dependencies locally
yarn install

# Then build with local node_modules
docker build --build-arg USE_LOCAL_NODE_MODULES=true -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile .
```

### Option 4: Build with Different Network Settings
```powershell
docker build --network host -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile .
```

## Alternative Build Approaches

### Pre-build Locally
```powershell
# Build the app locally first
yarn nx build dashboard

# Then create a minimal Dockerfile that just serves the built files
docker build -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile.prebuilt .
```

### Use Multi-stage with Local Build
```powershell
# Build locally
yarn install
yarn nx build dashboard

# Copy built files to Docker
docker build -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile.copy .
```

## Docker Configuration

### Increase Docker Resources
If builds are slow, increase Docker Desktop resources:
- Memory: 8GB+
- CPUs: 4+
- Disk: 60GB+

### Use BuildKit
```powershell
# Enable BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
docker build -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile .
```

## Common Issues

### Node.js Version Issues
- Ensure using `node:lts-alpine` (Node.js 20+)
- Check package.json for Node.js version requirements

### Memory Issues
- Increase Docker memory allocation
- Use `--max-old-space-size=4096` for Node.js builds

### Permission Issues
- Run Docker as administrator on Windows
- Check file permissions in the build context

## Quick Fixes

### Restart Docker
```powershell
# Restart Docker Desktop
# Then try building again
```

### Clear Docker Cache
```powershell
docker system prune -a
docker builder prune
```

### Use Different Base Image
If Alpine has issues, try:
```dockerfile
FROM node:lts-slim AS builder
```

## Monitoring Build Progress

### Verbose Output
```powershell
docker build --progress=plain -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile .
```

### Check Build Logs
```powershell
# Get detailed build information
docker build --progress=plain --no-cache -t your-registry/iot-sphere-dashboard:latest -f apps/frontend/dashboard/Dockerfile . 2>&1 | Tee-Object -FilePath build.log
``` 