import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { signToken } from '../utils/jwt';
import type { AuthUser } from '../types';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

const SALT_ROUNDS = 10;

const publicUserSelect = { id: true, name: true, email: true, avatar: true } as const;

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: publicUserSelect,
  });

  return { user, token: signToken(user.id) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
    token: signToken(user.id),
  };
}
