import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import './types';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.clientUrls, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
