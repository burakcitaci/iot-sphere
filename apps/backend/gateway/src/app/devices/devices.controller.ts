import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceIdDto } from './dto/device-id.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    console.log(createDeviceDto);
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: DeviceIdDto) {
    return this.devicesService.findOne(params.id);
  }

  @Patch(':id')
  update(@Param() params: DeviceIdDto, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(params.id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param() params: DeviceIdDto) {
    return this.devicesService.remove(params.id);
  }
} 