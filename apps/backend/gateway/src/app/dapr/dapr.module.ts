import { Module, Global } from '@nestjs/common';
import { DaprClient, DaprServer } from '@dapr/dapr';
import { ConfigService } from '@nestjs/config';

export const DAPR_CLIENT = 'DAPR_CLIENT';
export const DAPR_SERVER = 'DAPR_SERVER';

@Global()
@Module({
  providers: [
    {
      provide: DAPR_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new DaprClient({
          daprHost: process.env.DAPR_HOST || 'localhost',
          daprPort: process.env.DAPR_PORT || '3501',
        });
      },
      inject: [ConfigService],
    },
    {
      provide: DAPR_SERVER,
      useFactory: (configService: ConfigService) => {
        const server = new DaprServer({
          serverHost: '0.0.0.0', // Ensure Dapr can reach it
          serverPort: configService.get<string>('dapr.serverPort') || '3001',
          clientOptions: {
            daprHost: process.env.DAPR_HOST || 'localhost',
            daprPort: process.env.DAPR_PORT || '3501',
          },
        });

        return server;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DAPR_CLIENT, DAPR_SERVER],
})
export class DaprModule {} 