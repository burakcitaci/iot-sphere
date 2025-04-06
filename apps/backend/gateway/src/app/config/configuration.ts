export default () => ({
  port: parseInt(process.env.APP_PORT ?? process.env.PORT ?? '3000', 10),
  api: {
    prefix: process.env.API_PREFIX || 'api',
  },
  dapr: {
    port: 3502
  },
  resource: {
    name: 'gateway-api',
    version: '0.0.1'
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