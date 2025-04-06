// logs.controller.ts
import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { DaprService } from '@gateway/otel-library';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: DaprService){}
 

  // This endpoint will be consumed by the React UI
  @Sse('stream')
  streamLogs(): Observable<MessageEvent> {
    return this.logsService.streamLogs();
  }

  // Call this method when a new log is received from Dapr
  pushLog(log: any) {
   this.logsService.pushLog(log)
  }
}