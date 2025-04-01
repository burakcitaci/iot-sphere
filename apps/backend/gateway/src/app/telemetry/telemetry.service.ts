import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trace } from './entities/trace.entity';
import { Log } from './entities/log.entity';
import { DaprClient } from '@dapr/dapr';
import { DAPR_CLIENT } from '../dapr/dapr.module';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { GatewaySpanExporter } from '../../common/open-telemetry/traces/exporter';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TelemetryService implements OnModuleInit {
  constructor(
    @InjectRepository(Trace)
    private readonly traceRepository: Repository<Trace>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @Inject(DAPR_CLIENT)
    private readonly daprClient: DaprClient,
    private configService: ConfigService
  ) {}

  onModuleInit() {
    if (this.configService.get('telemetry.enabled')) {
      this.initializeTracing();
    }
  }
  private initializeTracing() {
    console.log('Initializing telemetry...');

    const provider = new NodeTracerProvider({
      resource: new Resource({
        'service.name': this.configService.get('telemetry.serviceName'),
        'service.version': this.configService.get('telemetry.serviceVersion'),
      }),
      spanProcessors: [
        new BatchSpanProcessor(new GatewaySpanExporter()),
      ],
    });

    provider.register();

    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation({
          requestHook: (span, request: ClientRequest | IncomingMessage) => {
            const method = 'method' in request ? request.method : undefined;
            const url = 'url' in request ? request.url : undefined;

            if (method) {
              span.setAttribute('http.method', method);
            }
            if (url) {
              span.setAttribute('http.url', url);
            }
          },
          responseHook: (
            span,
            response: IncomingMessage | ServerResponse<IncomingMessage>
          ) => {
            if (
              'statusCode' in response &&
              typeof response.statusCode === 'number'
            ) {
              span.setAttribute('http.status_code', response.statusCode);
            }
          },
        }),
      ],
    });
  }
/*   async handleTraces(data: any): Promise<void> {
    const trace = this.traceRepository.create({
      traceId: data.traceId,
      name: data.name,
      timestamp: new Date(data.timestamp),
      duration: data.duration,
      status: data.status,
      spans: data.spans,
      metadata: data.metadata,
      createdAt: new Date(),
    });

    await this.traceRepository.save(trace);
    
    // Publish to Dapr
    await this.daprClient.pubsub.publish('pubsub', 'telemetry', {
      type: 'trace',
      data: trace,
    });
  }

  async handleLogs(data: any): Promise<void> {
    // const log = this.logRepository.create({
    //   timestamp: new Date(data.timestamp),
    //   level: data.level,
    //   message: data.message,
    //   service: data.service,
    //   traceId: data.traceId,
    //   metadata: data.metadata,
    //   createdAt: new Date(),
    // });

    // await this.logRepository.save(log);
    
    // Publish to Dapr
    await this.daprClient.pubsub.publish('pubsub', 'telemetry', {
      type: 'log',
      data: {name: 'test'},
    });
  }

  async getTraces(startTime?: Date, endTime?: Date): Promise<Trace[]> {
    const query = this.traceRepository.createQueryBuilder('trace');
    
    if (startTime) {
      query.andWhere('trace.timestamp >= :startTime', { startTime });
    }
    if (endTime) {
      query.andWhere('trace.timestamp <= :endTime', { endTime });
    }
    
    query.orderBy('trace.timestamp', 'DESC');
    return query.getMany();
  }

  async getLogs(startTime?: Date, endTime?: Date): Promise<Log[]> {
    const query = this.logRepository.createQueryBuilder('log');
    
    if (startTime) {
      query.andWhere('log.timestamp >= :startTime', { startTime });
    }
    if (endTime) {
      query.andWhere('log.timestamp <= :endTime', { endTime });
    }
    
    query.orderBy('log.timestamp', 'DESC');
    return query.getMany();
  } */
} 