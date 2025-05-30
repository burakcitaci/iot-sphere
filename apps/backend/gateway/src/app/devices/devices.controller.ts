import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceIdDto } from './dto/device-id.dto';
import {Subject } from 'rxjs';
import { CentralLoggerService, Trace } from '@gateway/otel-library';
import { SpanKind } from '@opentelemetry/api';


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
} 