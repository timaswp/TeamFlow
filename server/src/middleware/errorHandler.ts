import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { isProduction } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { message: error.message, ...(error.details ? { details: error.details } : {}) },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: { message: 'Resource already exists' } });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({ error: { message: 'Resource not found' } });
      return;
    }
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: { message: 'Malformed JSON payload' } });
    return;
  }

  if (!isProduction) {
    console.error('[error]', error);
  }

  res.status(500).json({ error: { message: 'Internal server error' } });
}
