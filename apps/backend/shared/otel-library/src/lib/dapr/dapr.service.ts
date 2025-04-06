
import { DaprServer } from '@dapr/dapr';
import { Controller, Sse, MessageEvent, Injectable, Inject } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
@Injectable()
export class DaprService{

    private logStream$ = new Subject<MessageEvent>();
    private spanStream$ = new Subject<MessageEvent>();
    // This endpoint will be consumed by the React UI

    // constructor(@Inject('DAPR_SERVER') private readonly daprServer: DaprServer){}
    // async onModuleInit() {
    //   console.log("dapr initied")
    //   await this.daprServer.pubsub.subscribe('pubsub', 'my-topic', async (data) => {
    //      console.log("Resiecevd log: ", data)
    //     return { success: true };
    //   });
    // }
    
    streamLogs(): Observable<MessageEvent> {
      return this.logStream$.asObservable();
    }
  
    // Call this method when a new log is received from Dapr
    pushLog(log: any) {
      this.logStream$.next({ data: log });
    }
    streamSpanss(): Observable<MessageEvent> {
      return this.spanStream$.asObservable();
    }
  
    // Call this method when a new log is received from Dapr
    pushSpan(log: any) {
      this.spanStream$.next({ data: log });
    }
}