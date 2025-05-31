/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration
  const globalPrefix = 'api';
  const port = process.env.PORT || 3004;

  // Global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS setup (if needed)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Set global prefix BEFORE setting up documentation
  app.setGlobalPrefix(globalPrefix);

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API documentation for your NestJS application')
    .setVersion('1.0')
    .addTag('default')
    .addBearerAuth() // Add if you use JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Set up Scalar API documentation at /docs
  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'purple', // Options: 'default', 'alternate', 'moon', 'purple', 'solarized', 'mars'
    }),
  );

  // Also setup traditional Swagger UI at /api/docs
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    customSiteTitle: 'API Documentation',
  });

  // Start the application
  await app.listen(port);

  // Logging
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Scalar Documentation available at: http://localhost:${port}/docs`
  );
  Logger.log(
    `📖 Swagger Documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
  Logger.log(
    `🌐 Environment: ${process.env.NODE_ENV || 'development'}`
  );
}

bootstrap().catch((error) => {
  Logger.error('Failed to start application', error);
  process.exit(1);
});