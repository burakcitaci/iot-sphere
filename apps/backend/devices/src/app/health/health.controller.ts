import { CentralLoggerService } from '@gateway/otel-library';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly loggerService: CentralLoggerService){}
  @Get()
  @ApiOperation({ 
    summary: 'Application health check',
    description: 'Returns application health status and basic metrics'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number', example: 12345.67 },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        memory: {
          type: 'object',
          properties: {
            heapUsed: { type: 'number', example: 25 },
            heapTotal: { type: 'number', example: 50 },
          }
        }
      }
    }
  })
  getHealth() {
    const health = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
    this.loggerService.log("Health status");
    return health;
  }

  @Get('ping')
  @ApiOperation({ 
    summary: 'Simple ping endpoint',
    description: 'Quick ping to check if service is responding'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pong response',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'pong' },
        timestamp: { type: 'number', example: 1704067200000 }
      }
    }
  })
  ping() {
    return { 
      message: 'pong', 
      timestamp: Date.now() 
    };
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Detailed application status',
    description: 'Returns detailed application status including system metrics'
  })
  getStatus() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      status: 'running',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: process.uptime(),
        formatted: this.formatUptime(process.uptime())
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      memory: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    };
  }

  private formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}