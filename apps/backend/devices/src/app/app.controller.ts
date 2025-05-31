import { Controller, Get, HttpStatus } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiOkResponse,
  ApiProperty
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CentralLoggerService, Trace } from '@gateway/otel-library';

// Optional: Create a response DTO for better documentation
export class AppDataResponseDto {
  @ApiProperty({ example: 'Hello API', description: 'Welcome message' })
  message!: string;

  @ApiProperty({ example: '1.0.0', description: 'API version' })
  version?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Current timestamp' })
  timestamp!: string;
}

@Controller()
@ApiTags('App') // Groups endpoints in Scalar/Swagger UI
export class AppController {
  constructor(
    private readonly appService: AppService, 
    private readonly logger: CentralLoggerService
  ) {
    this.logger.setContext('AppController');
  }

  @Get()
  
  @Trace({
    spanName: 'getData',
    captureArgs: true,
  })
  getData() {
    this.logger.log('Fetching data from AppService');
    
    try {
      const result = this.appService.getData();
      return result;
    } catch (error) {
      this.logger.error('Error fetching data', error);
      throw error;
    }
  }
}