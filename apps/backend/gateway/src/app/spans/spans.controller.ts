// logs.controller.ts
import { DaprService } from '@gateway/otel-library';
import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';


@Controller('spans')
export class SpansController {
    constructor(private readonly logsService: DaprService){}
 

  // This endpoint will be consumed by the React UI
  @Sse('stream')
  streamLogs(): Observable<MessageEvent> {
    return this.logsService.streamSpanss();
  }

  // Call this method when a new log is received from Dapr
  pushLog(log: any) {
   this.logsService.pushLog(log)
  }
}