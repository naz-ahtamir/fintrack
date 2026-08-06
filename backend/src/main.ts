import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ========== SECURITY ==========
  app.use(helmet());

  // ========== CORS ==========
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',

      // URL Frontend Production (Vercel)
      'https://fintrack-d0ef5gapa-naz-ahtamirs-projects.vercel.app',

      // Jika nanti ganti domain cukup ubah Environment Variable
      process.env.FRONTEND_URL,
    ].filter(Boolean),

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
    ],
  });

  // ========== VALIDATION ==========
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ========== SWAGGER ==========
  const config = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription('Personal Finance Management System API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('accounts', 'Account management')
    .addTag('categories', 'Category management')
    .addTag('transactions', 'Transaction management')
    .addTag('budgets', 'Budget management')
    .addTag('goals', 'Financial goals')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();