import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { UnauthorizedError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    const { sub } = verifyToken(header.slice('Bearer '.length).trim());
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, name: true, email: true, avatar: true },
    });

    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/** Narrows `req.user` for controllers that run behind `authenticate`. */
export function requireUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}
