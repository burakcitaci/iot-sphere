import { DaprService } from '@gateway/otel-library';
import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';


@Controller('metrics')
export class MetricsController {
    constructor(private readonly daprService: DaprService){}
 

  // This endpoint will be consumed by the React UI
  @Sse('stream')
  streamMetricss(): Observable<MessageEvent> {
    return this.daprService.streamMetric(); // TODO: This should be streamMetricss()
  }

  // Call this method when a new log is received from Dapr
  pushMetric(metric: any) {
   this.daprService.pushMetric(metric) // TODO: This should be pushMetric()
  }
} 