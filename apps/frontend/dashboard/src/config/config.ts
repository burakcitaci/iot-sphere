interface Config {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
  };
  features: {
    telemetry: boolean;
    analytics: boolean;
  };
}

const config: Config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 10000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'IoT Sphere Dashboard',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  features: {
    telemetry: import.meta.env.VITE_TELEMETRY_ENABLED === 'true',
    analytics: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  },
};

export default config; 