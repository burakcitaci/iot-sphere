export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  api: {
    prefix: process.env.API_PREFIX || 'api',
  },
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN || '*',
  },
  telemetry: {
    enabled: process.env.TELEMETRY_ENABLED === 'true',
    serviceName: process.env.SERVICE_NAME || 'gateway-api',
    serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
  },
}); 