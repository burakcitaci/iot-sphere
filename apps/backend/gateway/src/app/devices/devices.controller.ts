import { Controller, Get, Post, Body, Patch, Param, Delete, Sse, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceIdDto } from './dto/device-id.dto';
import { TelemetryDto } from './dto/telemetry.dto';
import { Observable, Subject } from 'rxjs';
import { CentralLoggerService, Trace } from '@gateway/otel-library';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';


interface CloudEvent<T = unknown> {
  id: string;
  source: string;
  type: string;
  specversion: string;
  datacontenttype: string;
  data: T;
  pubsubname: string;
  topic: string;
  traceid?: string;
}

interface SpanData {
  traceId: string;
  spanId: string;
  name: string;
  kind: SpanKind;
  startTime: string;
  endTime: string;
  attributes: Record<string, unknown>;
  status: {
    code: SpanStatusCode;
    message?: string;
  };
}

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  private readonly telemetrySubject = new Subject<MessageEvent>();

  constructor(
    private readonly devicesService: DevicesService,
    private readonly logger: CentralLoggerService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device' })
  @ApiBody({ type: CreateDeviceDto })
  @ApiResponse({ status: 201, description: 'Device created successfully' })
  @Trace({
    spanName: 'create-device',
    spanKind: SpanKind.SERVER
  })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, description: 'List of all devices' })
  @Trace({
    spanName: 'find-all-devices',
    spanKind: SpanKind.SERVER
  })
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a device by ID' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'Device found' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @Trace({
    spanName: 'find-device',
    spanKind: SpanKind.SERVER
  })
  findOne(@Param() { id }: DeviceIdDto) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiBody({ type: UpdateDeviceDto })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @Trace({
    spanName: 'update-device',
    spanKind: SpanKind.SERVER
  })
  update(@Param() { id }: DeviceIdDto, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiParam({ name: 'id', description: 'Device ID' })
  @ApiResponse({ status: 200, description: 'Device deleted successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @Trace({
    spanName: 'remove-device',
    spanKind: SpanKind.SERVER
  })
  remove(@Param() { id }: DeviceIdDto) {
    return this.devicesService.remove(id);
  }

  @Post('telemetry')
  @ApiOperation({ summary: 'Process device telemetry data' })
  @ApiBody({ type: TelemetryDto })
  @ApiResponse({ status: 201, description: 'Telemetry processed successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Trace({
    spanName: 'handle-device-telemetry',
    spanKind: SpanKind.SERVER,
    captureArgs: true
  })
  async handleTelemetry(@Body() data: CloudEvent<TelemetryDto> | TelemetryDto) {
    try {
      let telemetryData: TelemetryDto;
      let traceId = '';
      let spanId = '';

      // Handle both direct HTTP requests and DAPR cloud events
      if (this.isCloudEvent(data)) {
        telemetryData = data.data;
        traceId = data.traceid || '';
        spanId = data.id;
        this.logger.debug(`Received telemetry from DAPR: ${JSON.stringify(telemetryData)}`);
      } else {
        telemetryData = data;
        this.logger.debug(`Received direct telemetry: ${JSON.stringify(telemetryData)}`);
      }

      // Add timestamp if not provided
      if (!telemetryData.timestamp) {
        telemetryData.timestamp = new Date().toISOString();
      }

      // Create a span for the telemetry data
      const spanData: SpanData = {
        traceId,
        spanId,
        name: 'device-telemetry',
        kind: SpanKind.SERVER,
        startTime: telemetryData.timestamp,
        endTime: new Date().toISOString(),
        attributes: {
          'device.id': telemetryData.deviceId,
          'telemetry.type': telemetryData.type || 'unknown',
          ...telemetryData.data
        },
        status: { code: SpanStatusCode.OK }
      };

      // Emit the telemetry data to any connected SSE clients
      this.telemetrySubject.next(new MessageEvent('message', { 
        data: JSON.stringify(spanData)
      }));

      return { success: true, data: spanData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error handling telemetry:', errorMessage);
      throw error;
    }
  }

  @Sse('telemetry/stream')
  @ApiOperation({ summary: 'Stream device telemetry in real-time' })
  @ApiResponse({ status: 200, description: 'Server-sent events stream of device telemetry' })
  @Trace({
    spanName: 'stream-device-telemetry',
    spanKind: SpanKind.SERVER
  })
  streamTelemetry(): Observable<MessageEvent> {
    return this.telemetrySubject.asObservable();
  }

  private isCloudEvent(data: unknown): data is CloudEvent<TelemetryDto> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'specversion' in data &&
      'type' in data &&
      'source' in data &&
      'id' in data
    );
  }
} 