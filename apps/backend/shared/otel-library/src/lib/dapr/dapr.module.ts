import { Module, Global } from '@nestjs/common';
import { CommunicationProtocolEnum, DaprClient, DaprServer } from '@dapr/dapr';
import { DaprService } from './dapr.service';

export const DAPR_CLIENT = 'DAPR_CLIENT';
export const DAPR_SERVER = 'DAPR_SERVER';

@Global()
@Module({
  providers: [
    DaprService,
    {
      provide: DAPR_SERVER,
      useFactory: async (logsService: DaprService) => {
        const daprServer = new DaprServer();
        process.on('SIGINT', async () => {
          await daprServer.stop();
          process.exit(0);
        });
        await daprServer.pubsub.subscribe('pubsub', 'my-topic', async (data) => {
          logsService.pushLog(data);
          return { success: true };
        });
      
        await daprServer.pubsub.subscribe('pubsub2', 'my-span', async (data) => {
          logsService.pushSpan(data)
          return { success: true };
        });
      
        await daprServer.start();
        return daprServer;
      },
      inject: [DaprService],
    },
    {
      provide: DAPR_CLIENT,
      useFactory: () => {
        return new DaprClient({
          daprHost:"localhost",
          daprPort:"3502",
          communicationProtocol: CommunicationProtocolEnum.HTTP
        });
      },
    },
  ],
  exports: [DAPR_CLIENT, DAPR_SERVER, DaprService],
})
export class DaprModule {}