import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Global app configuration shared by main.ts and the e2e tests, so tests
 * exercise exactly the same validation behaviour as the running server.
 */
export function setupApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties without decorators
      forbidNonWhitelisted: true, // ...and reject the request if any were sent
      transform: true, // turn payloads into DTO class instances
    }),
  );
}
