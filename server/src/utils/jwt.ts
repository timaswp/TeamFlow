import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface TokenPayload {
  sub: string;
}

export function signToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ sub: userId }, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      throw new UnauthorizedError('Invalid token');
    }
    return { sub: decoded.sub };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
