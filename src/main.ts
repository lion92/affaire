import {NestFactory, Reflector} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {JwtAuthGuard} from "./JwtAuthGuard";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });

  app.setGlobalPrefix('affaire');

  // Set up global JWT auth guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'], // ← ajoute ici
  });

  const config = new DocumentBuilder()
      .setTitle('Mon API')
      .setDescription('Description de l\'API')
      .setVersion('1.0')
      .addBearerAuth() // si tu utilises JWT
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await console.log('ok');
  await app.listen(3004);
}

bootstrap();
