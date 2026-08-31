import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5001),
  databaseUrl: required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/teamflow'),
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? undefined : 'dev-only-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  /** Comma-separated list so deploy previews can be allowed alongside the main site. */
  clientUrls: (process.env.CLIENT_URL ?? 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
} as const;

export const isProduction = env.nodeEnv === 'production';
