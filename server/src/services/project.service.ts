import { prisma } from '../config/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';
import type { ProjectRole } from '../types';

const memberSelect = {
  id: true,
  role: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, avatar: true } },
} as const;

/** Ensures the user belongs to the project and returns their role. */
export async function requireMembership(projectId: string, userId: string): Promise<ProjectRole> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });
  if (!membership) {
    throw new ForbiddenError('You are not a member of this project');
  }

  return membership.role as ProjectRole;
}

export async function requireOwnership(projectId: string, userId: string): Promise<void> {
  const role = await requireMembership(projectId, userId);
  if (role !== 'OWNER') {
    throw new ForbiddenError('Only the project owner can perform this action');
  }
}

function withProgress<T extends { tasks: { status: string }[] }>(project: T) {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.status === 'DONE').length;
  const { tasks: _tasks, ...rest } = project;
  return {
    ...rest,
    totalTasks,
    completedTasks,
    progress: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
  };
}

export async function listProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: 'desc' },
    include: {
      tasks: { select: { status: true } },
      _count: { select: { members: true } },
      owner: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  return projects.map((project) => ({
    ...withProgress(project),
    memberCount: project._count.members,
  }));
}

export async function getProject(projectId: string, userId: string) {
  const role = await requireMembership(projectId, userId);
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: {
      tasks: { select: { status: true } },
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      members: { select: memberSelect, orderBy: { createdAt: 'asc' } },
    },
  });

  return { ...withProgress(project), memberCount: project.members.length, currentUserRole: role };
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      deadline: input.deadline ?? null,
      ownerId: userId,
      members: { create: { userId, role: 'OWNER' } },
    },
    include: { tasks: { select: { status: true } }, _count: { select: { members: true } } },
  });

  return { ...withProgress(project), memberCount: project._count.members };
}

export async function updateProject(projectId: string, userId: string, input: UpdateProjectInput) {
  await requireOwnership(projectId, userId);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.deadline !== undefined ? { deadline: input.deadline } : {}),
    },
    include: { tasks: { select: { status: true } }, _count: { select: { members: true } } },
  });

  return { ...withProgress(project), memberCount: project._count.members };
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  await requireOwnership(projectId, userId);
  await prisma.project.delete({ where: { id: projectId } });
}

export async function listMembers(projectId: string, userId: string) {
  await requireMembership(projectId, userId);
  return prisma.projectMember.findMany({
    where: { projectId },
    select: memberSelect,
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function addMember(projectId: string, userId: string, email: string) {
  await requireOwnership(projectId, userId);

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    throw new NotFoundError('No user is registered with this email');
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) {
    throw new ConflictError('This user is already a member of the project');
  }

  return prisma.projectMember.create({
    data: { projectId, userId: user.id, role: 'MEMBER' },
    select: memberSelect,
  });
}

export async function removeMember(
  projectId: string,
  requesterId: string,
  memberUserId: string,
): Promise<void> {
  await requireOwnership(projectId, requesterId);

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: memberUserId } },
  });
  if (!membership) {
    throw new NotFoundError('Member not found in this project');
  }
  if (membership.role === 'OWNER') {
    throw new ForbiddenError('The project owner cannot be removed');
  }

  await prisma.projectMember.delete({ where: { id: membership.id } });
}
