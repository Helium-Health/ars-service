import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { EventEmitter } from 'events';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CrudConfigService } from '@nestjsx/crud';

const emitter: EventEmitter = new EventEmitter();

CrudConfigService.load({
  routes: {
    exclude: ['createManyBase', 'replaceOneBase'],
  },
});

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const origin =
    !process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS === '*'
      ? '*'
      : process.env.ALLOWED_ORIGINS.split(',');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
    }),
  );

  app.enableCors({ origin });

  const config = new DocumentBuilder()
    .setTitle('ARS API Doc')
    .setDescription('The ARS Project API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  emitter.setMaxListeners(1000);

  await app.listen(process.env.API_PORT || 30001);
}
bootstrap().catch(console.error);
