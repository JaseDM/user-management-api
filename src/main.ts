import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Confía en el proxy (Plesk/Nginx)
  app.set('trust proxy', 1);

  // Prefijo global /v1
  app.setGlobalPrefix('v1');

  // Validación global DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor global de transformación
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  app.enableCors();

  // Swagger en /v1/docs (con server correcto)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API para la gestión de usuarios')
    .setVersion('1.0')
    .addServer('/v1') // para que "Try it out" use el prefijo
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1/docs', app, document);

  // Puerto
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();