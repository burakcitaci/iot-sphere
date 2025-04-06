import { SetMetadata } from '@nestjs/common';
import {
    context,
    SpanKind,
    SpanStatusCode,
    trace,
    type Span,
} from '@opentelemetry/api';
import { SemanticAttributes as Semantics } from '@opentelemetry/semantic-conventions';
export interface TraceOptions {
  /** Custom tracer name (default: 'gateway-api') */
  tracerName?: string;
  /** Custom span name (default: method name) */
  spanName?: string;
  /** Span kind (default: SpanKind.SERVER) */
  spanKind?: SpanKind;
  /** Capture method arguments as attributes (default: false) */
  captureArgs?: boolean;
  /** Maximum length for captured arguments (default: 1024) */
  maxArgLength?: number;
  /** Record exception stack traces (default: true) */
  includeStackTrace?: boolean;
  /** Additional span attributes */
  attributes?: Record<string, string | number | boolean>;
}
export const TRACE_METADATA = 'trace';
export function Trace(options: TraceOptions = {}) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    const methodName = propertyKey;
    const className = target.constructor.name;
    descriptor.value = async function (...args: any[]) {
      const tracer = trace.getTracer(options.tracerName || className);
      
      const spanName = options.spanName || `${className}.${methodName}`;
      const attributes: Record<string, string | number | boolean> = {
        'code.function': methodName,
        'code.namespace': className,
        ...options.attributes,
      };
      if (options.captureArgs) {
        attributes['args'] = JSON.stringify(args);
      }
      return await tracer.startActiveSpan(
        spanName,
        {
          kind: options.spanKind || SpanKind.INTERNAL,
          attributes,
        },
        async (span: Span) => {
          try {
            const result = await originalMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
          } catch (error) {
            span.recordException(error as Error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: (error as Error).message,
            });
            throw error;
          } finally {
            span.end();
          }
        }
      );
    };
    return descriptor;
  };
}
