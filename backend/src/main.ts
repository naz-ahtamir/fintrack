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
  const allowedOrigins = [
    // Development
    'http://localhost:3000',
    'http://localhost:3001',
    
    // Production - Custom Domain (recommended)
    process.env.FRONTEND_URL, // Set di Render: https://fintrack.com
    
    // Production - Vercel Production URL (permanent)
    'https://fintrack-naz-ahtamirs-projects.vercel.app', // URL ini permanen
  ].filter(Boolean);

  // Allow Vercel preview deployments untuk testing
  const isVercelPreview = (origin: string) => {
    return origin.match(/^https:\/\/fintrack-[a-z0-9]+-naz-ahtamirs-projects\.vercel\.app$/);
  };

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (for testing new features)
      if (process.env.NODE_ENV !== 'production' && isVercelPreview(origin)) {
        return callback(null, true);
      }

      // Reject other origins
      console.warn(`CORS blocked origin: ${origin}`);
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
    maxAge: 86400, // 24 hours
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