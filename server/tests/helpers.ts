import { prisma } from '../src/config/prisma';

/**
 * Integration tests need a running PostgreSQL instance. When the database is not
 * reachable (for example on a machine without Postgres) the suites are skipped
 * instead of failing, so `npm test` stays usable during development.
 */
export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function resetDatabase(): Promise<void> {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@test.local`;
}
