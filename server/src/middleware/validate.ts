import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';
import { BadRequestError } from '../utils/errors';

/** Validates and replaces `req.body` with the parsed value. */
export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new BadRequestError(
          'Validation failed',
          result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      );
      return;
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}
