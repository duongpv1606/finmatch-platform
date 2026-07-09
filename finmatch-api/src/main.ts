import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(
    helmet({
      // CSP disabled: this process also serves Swagger UI (inline
      // scripts) and a strict default CSP would break it. The actual
      // website is a separate Next.js app on Vercel with its own
      // headers — this process is API-only, so CSP matters less here.
      // Other Helmet protections (X-Frame-Options, X-Content-Type-Options,
      // HSTS, etc.) stay on.
      contentSecurityPolicy: false,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FinMatch AI API')
    .setDescription('REST API cho nền tảng Fintech Marketplace FinMatch AI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`FinMatch API running on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
