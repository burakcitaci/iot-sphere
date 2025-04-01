import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceIdDto } from './dto/device-id.dto';
import { DAPR_CLIENT, DAPR_SERVER } from '../dapr/dapr.module';
import { DaprServer } from '@dapr/dapr';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService,
    @Inject(DAPR_SERVER)
    private readonly daprClient: DaprServer,
  ) {
    this.daprClient.pubsub.subscribe('pubsub', 'telemetry', async (data: any) => {
      try {
        console.log("Subscriber received: " + JSON.stringify(data));
        // Handle the data as needed
        // For example, you might want to process the data and save it to a database
       
      } catch (error) {
        console.error("Error processing data:", error);
      }
    });
  }

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get('dapr/subscribe')
  getDaprSubscriptions() {
    return [
      {
        pubsubname: 'pubsub',
        topic: 'telemetry',
        route: '/api/devices/telemetry'
      }
      // Add other subscriptions as needed
    ];
  }
  // @Get()
  // findAll() {
  //   console.log('findAll');
  //   return this.devicesService.findAll();
  // }
  @Post('telemetry')
  async handleTelemetryEvent(@Body() data: any): Promise<void> {
    console.log('Received telemetry event:', data);
    // No validation yet, just accept any data
  }
  @Get(':id')
  findOne(@Param() params: DeviceIdDto) {
    return this.devicesService.findOne(params.id);
  }

  @Patch(':id')
  update(@Param() params: DeviceIdDto, @Body() updateDeviceDto: UpdateDeviceDto) {
    console.log(updateDeviceDto);
    return this.devicesService.update(params.id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param() params: DeviceIdDto) {
    return this.devicesService.remove(params.id);
  }
} 