import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with configuration from environment
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'https://tic-tac-toe-ij1b.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // Get port and host from environment variables
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
