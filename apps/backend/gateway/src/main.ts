import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './app/shared/filters/http-exception.filter';
import { LoggerProvider } from '@opentelemetry/sdk-logs';


/*************  ✨ Codeium Command ⭐  *************/
/**
 * Initializes tracing and bootstraps the Nest.js application.
 *
 * @remarks
 * Performs the following steps:
 * 1. Initializes tracing.
 * 2. Creates a new Nest.js application with the {@link AppModule}.
 * 3. Configures the logger to use the {@link OtelLogger}.
 * 4. Sets the global prefix for the application.
 * 5. Listens on the specified port.
 * 6. Logs a message to the console indicating the application is running.
 */
/******  91b51717-d546-499d-b448-d715f0a013ea  *******/
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Gateway API')
    .setDescription('The Gateway API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // CORS
  if (configService.get('cors.enabled')) {
    app.enableCors({
      origin: configService.get('cors.origin'),
    });
  }

  // Global prefix
  const globalPrefix = configService.get('api.prefix');
  
  app.setGlobalPrefix('api');

  // Start the application
  const port = configService.get('port');
  await app.listen(3001);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 API Documentation available at: http://localhost:${port}/api/docs`
  );
}

bootstrap();
