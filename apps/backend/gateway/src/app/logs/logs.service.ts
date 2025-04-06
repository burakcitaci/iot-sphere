
import { Controller, Sse, MessageEvent, Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
@Injectable()
export class LogsService {
    private logStream$ = new Subject<MessageEvent>();

    // This endpoint will be consumed by the React UI

    streamLogs(): Observable<MessageEvent> {
      return this.logStream$.asObservable();
    }
  
    // Call this method when a new log is received from Dapr
    pushLog(log: any) {
      this.logStream$.next({ data: log });
    }

   
}