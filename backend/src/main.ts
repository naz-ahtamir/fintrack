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

  // ========== CORS - PRODUCTION READY ==========
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      // Development: Allow localhost
      if (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }

      // Production: Allow specific domains
      const allowedOrigins = [
        process.env.FRONTEND_URL, // Set ini di Render environment variables
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel deployments (*.vercel.app)
      // This is the PERMANENT solution for Vercel
      if (origin.match(/^https:\/\/.*\.vercel\.app$/)) {
        return callback(null, true);
      }

      // Log blocked origins for debugging
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours - reduces preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 204,
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