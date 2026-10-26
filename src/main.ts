import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Habilitar CORS para peticiones desde Web y Aplicación Móvil
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Pipe global de validación y transformación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de Documentación Abierta (Swagger OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('API REST Catálogo 3D Zapatillas (Pizzo Velocity)')
    .setDescription(
      'Documentación y Contrato de API REST para filtros avanzados de catálogo, gestión de pedidos, pasarela de pago Sandbox (Mercado Pago), subida de modelos 3D y autenticación Firebase.',
    )
    .setVersion('1.0.0')
    .addTag('Zapatillas', 'Endpoints de catálogo, filtros y detalles 3D')
    .addTag('Pedidos', 'Creación y consulta de pedidos')
    .addTag('Pagos / Pasarela Sandbox', 'Procesamiento de pagos y webhooks')
    .addTag('Autenticación', 'Registro, login y control de roles')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Servidor Backend iniciado en: http://localhost:${port}`);
  logger.log(`📄 Documentación Swagger interactiva: http://localhost:${port}/api/docs`);
}

await bootstrap();
