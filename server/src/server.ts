import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`TeamFlow API listening on http://localhost:${env.port}/api`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down...`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
