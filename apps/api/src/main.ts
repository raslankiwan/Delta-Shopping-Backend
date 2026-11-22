import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { ProblemJsonExceptionFilter } from './common/problem-json.filter';
import { uploadsDir } from './media/uploads-dir';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: false });

  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new ProblemJsonExceptionFilter());

  // Serve uploaded product media (outside the /v1 prefix) at /uploads.
  app.useStaticAssets(uploadsDir(), { prefix: '/uploads' });

  // Per-request correlation id, echoed on the response and available to logs.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const id = (req.headers['x-request-id'] as string) || randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-Id', id);
    next();
  });

  // CORS for the local storefront/admin dev servers.
  app.enableCors({
    origin: [/localhost:\d+$/],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Store-Id', 'X-Request-Id', 'Idempotency-Key'],
    exposedHeaders: ['X-Request-Id'],
  });

  const port = Number(process.env.API_PORT ?? 9000);
  await app.listen(port);
  console.log(`Mercato API listening on http://localhost:${port}/v1`);
}

bootstrap().catch((err) => {
  console.error('Failed to start Mercato API', err);
  process.exit(1);
});
