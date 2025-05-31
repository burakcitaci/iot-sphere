import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { Logger } from '@opentelemetry/api-logs';
import { Inject } from '@nestjs/common';

@Injectable()
export class CentralLoggerService implements LoggerService {
  private context?: string;
  private otelLogger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerProvider: LoggerProvider
  ) {
    this.otelLogger = this.loggerProvider.getLogger('gateway-api');
  }

  log(message: any, ...optionalParams: any[]) {
    this.otelLogger.emit({
      body: message,
      severityNumber: 9, // INFO
      severityText: 'INFO',
      attributes: this.getAttributes(optionalParams),
    });
  }

  error(message: any, ...optionalParams: any[]) {
    this.otelLogger.emit({
      body: this.formatMessage(message, optionalParams),
      severityNumber: 17, // ERROR
      severityText: 'ERROR',
      attributes: this.getAttributes(optionalParams),
    });
  }

  warn(message: any, ...optionalParams: any[]) {
    this.otelLogger.emit({
      body: this.formatMessage(message, optionalParams),
      severityNumber: 13, // WARN
      severityText: 'WARN',
      attributes: this.getAttributes(optionalParams),
    });
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.otelLogger.emit({
        body: this.formatMessage(message, optionalParams),
        severityNumber: 5, // DEBUG
        severityText: 'DEBUG',
        attributes: this.getAttributes(optionalParams),
      });
    }
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.otelLogger.emit({
        body: this.formatMessage(message, optionalParams),
        severityNumber: 1, // TRACE
        severityText: 'TRACE',
        attributes: this.getAttributes(optionalParams),
      });
    }
  }

  private formatMessage(message: any, optionalParams: any[]): string {
    const base =
      typeof message === 'object' ? JSON.stringify(message) : String(message);
  
    const extras = optionalParams
      .map(param => (typeof param === 'object' ? JSON.stringify(param) : String(param)))
      .join(' ');
  
    return [base, extras].filter(Boolean).join(' ');
  }
  

  private getAttributes(optionalParams: any[]): Record<string, any> {
    const attributes: Record<string, any> = {};
    if (this.context) {
      attributes['context'] = this.context;
    }
    if (optionalParams.length > 0 && typeof optionalParams[0] === 'object') {
      Object.assign(attributes, optionalParams[0]);
    }
    return attributes;
  }

  setContext(context: string) {
    this.context = context;
  }
}