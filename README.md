# IoT Sphere

A modern IoT telemetry platform built with NestJS, OpenTelemetry, and DAPR, providing real-time device monitoring and observability.

## Features

- **Device Management**: Full CRUD operations for IoT devices
- **Real-time Telemetry**: Server-Sent Events (SSE) for live device data streaming
- **Distributed Tracing**: End-to-end tracing with OpenTelemetry
- **Structured Logging**: Centralized logging with correlation IDs
- **Event-Driven Architecture**: Using DAPR pub/sub for telemetry data
- **Modern Frontend**: React-based dashboard with real-time updates
- **API Documentation**: Swagger/OpenAPI documentation

## Architecture

### Backend Services

- **Gateway API** (`/apps/backend/gateway`):
  - Device management and telemetry ingestion
  - OpenTelemetry integration for tracing and logging
  - DAPR pub/sub for event handling
  - SSE endpoints for real-time data streaming

### Frontend Applications

- **Dashboard** (`/apps/frontend/dashboard`):
  - Real-time device telemetry visualization
  - Device management interface
  - Trace and log viewing

### Telemetry System

The telemetry system uses a multi-layered approach:

1. **Data Collection**:
   - Device telemetry ingestion via REST API
   - Support for both direct HTTP and DAPR cloud events
   - Automatic timestamp and trace context propagation

2. **Data Processing**:
   - OpenTelemetry for distributed tracing
   - Structured logging with correlation
   - Batch processing for efficient data handling

3. **Data Distribution**:
   - DAPR pub/sub for event distribution
   - Server-Sent Events for real-time updates
   - REST APIs for historical data

## Getting Started

### Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- DAPR CLI

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize DAPR:
   ```bash
   dapr init
   ```

3. Start Redis (required for DAPR pub/sub):
   ```bash
   docker-compose up -d redis
   ```

### Running the Application

1. Start the backend:
   ```bash
   nx serve backend-gateway
   ```

2. In a new terminal, start the frontend:
   ```bash
   nx serve frontend-dashboard
   ```

3. Start DAPR sidecar for the backend:
   ```bash
   dapr run --app-id gateway-api --app-port 3000 --dapr-http-port 3500
   ```

## API Documentation

The API documentation is available at `/api/docs` when running the backend service. Key endpoints include:

### Device Management

- `POST /api/devices` - Create a new device
- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get device details
- `PATCH /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Remove device

### Telemetry

- `POST /api/devices/telemetry` - Send device telemetry
- `GET /api/devices/telemetry/stream` - Stream real-time telemetry
- `GET /api/telemetry/spans` - Get trace spans
- `GET /api/telemetry/logs` - Get system logs

## Telemetry Data Format

### Device Telemetry

```typescript
interface TelemetryDto {
  deviceId: string;
  timestamp?: string;
  type?: string;
  data: Record<string, any>;
  version?: number;
}
```

### Span Data

```typescript
interface SpanData {
  traceId: string;
  spanId: string;
  name: string;
  kind: string;
  startTime: string;
  endTime: string;
  attributes: Record<string, unknown>;
  status: {
    code: number;
    message?: string;
  };
}
```

## Configuration

### Environment Variables

```env
# API Configuration
PORT=3000
API_PREFIX=api

# DAPR Configuration
DAPR_HTTP_PORT=3500
PUBSUB_NAME=pubsub
PUBSUB_TOPIC_TELEMETRY=telemetry

# Telemetry Configuration
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=gateway-api
TELEMETRY_SERVICE_VERSION=1.0.0
```

### DAPR Components

The application uses the following DAPR components:

1. **Redis PubSub** (`/apps/backend/gateway/dapr/components/pubsub.yaml`):
   - Used for telemetry event distribution
   - Configurable host and connection settings

2. **Redis State** (optional):
   - Can be used for device state management
   - Configurable persistence settings

## Development

### Project Structure

```
.
├── apps
│   ├── backend
│   │   └── gateway
│   │       ├── src
│   │       │   ├── app
│   │       │   │   ├── devices
│   │       │   │   └── telemetry
│   │       │   └── common
│   │       │       └── open-telemetry
│   │       └── dapr
│   │           └── components
│   └── frontend
│       └── dashboard
└── libs
    └── shared
```

### Adding New Features

1. Create new NestJS modules in the appropriate directory
2. Add OpenTelemetry decorators for tracing
3. Update API documentation using Swagger decorators
4. Add corresponding frontend components

### Testing

```bash
# Unit tests
nx test backend-gateway
nx test frontend-dashboard

# E2E tests
nx e2e backend-gateway-e2e
nx e2e frontend-dashboard-e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
