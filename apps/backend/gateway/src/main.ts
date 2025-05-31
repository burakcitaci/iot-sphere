import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './app/shared/filters/http-exception.filter';
import { apiReference } from '@scalar/nestjs-api-reference';

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
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration values
  const port = configService.get('port') || 3001;
  const globalPrefix = configService.get('api.prefix') || 'api';

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

  // CORS - Set this up BEFORE routes
  if (configService.get('cors.enabled')) {
    app.enableCors({
      origin: configService.get('cors.origin'),
    });
  }

  // Set Global prefix BEFORE setting up docs
  app.setGlobalPrefix(globalPrefix);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Gateway API')
    .setDescription('The Gateway API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);

  // Set up Scalar API documentation (fixed configuration)
  app.use(
    '/docs',
    apiReference({
      content: document,
      layout: 'modern',
      theme: 'bluePlanet',
      // Removed unsupported properties for basic setup
    }),
  );

  // Also setup traditional Swagger UI
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  // Start the application
  await app.listen(port);

  // Fixed logging with correct URLs
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Scalar Documentation available at: http://localhost:${port}/docs`
  );
  Logger.log(
    `📖 Swagger Documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
}

bootstrap();