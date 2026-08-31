import { prisma } from '../config/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { requireMembership } from './project.service';
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  _count: { select: { comments: true } },
} as const;

async function assertAssigneeIsMember(projectId: string, assigneeId: string): Promise<void> {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assigneeId } },
    select: { id: true },
  });
  if (!membership) {
    throw new BadRequestError('The assignee must be a member of this project');
  }
}

export async function listProjectTasks(projectId: string, userId: string) {
  await requireMembership(projectId, userId);
  return prisma.task.findMany({
    where: { projectId },
    include: taskInclude,
    orderBy: [{ createdAt: 'asc' }],
  });
}

export async function createTask(projectId: string, userId: string, input: CreateTaskInput) {
  await requireMembership(projectId, userId);
  if (input.assigneeId) {
    await assertAssigneeIsMember(projectId, input.assigneeId);
  }

  return prisma.task.create({
    data: {
      projectId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'TODO',
      priority: input.priority ?? 'MEDIUM',
      dueDate: input.dueDate ?? null,
      assigneeId: input.assigneeId ?? null,
    },
    include: taskInclude,
  });
}

export async function getTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      ...taskInclude,
      project: { select: { id: true, name: true } },
    },
  });
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  await requireMembership(task.projectId, userId);
  return task;
}

export async function updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  await requireMembership(task.projectId, userId);

  if (input.assigneeId) {
    await assertAssigneeIsMember(task.projectId, input.assigneeId);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
    },
    include: taskInclude,
  });
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, assigneeId: true },
  });
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const role = await requireMembership(task.projectId, userId);
  if (role !== 'OWNER' && task.assigneeId !== userId) {
    throw new ForbiddenError('Only the project owner or the assignee can delete this task');
  }

  await prisma.task.delete({ where: { id: taskId } });
}

export async function getDashboard(userId: string) {
  const [projectCount, assignedTasks] = await Promise.all([
    prisma.projectMember.count({ where: { userId } }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const completedTasks = assignedTasks.filter((task) => task.status === 'DONE');
  const upcomingTasks = assignedTasks
    .filter((task) => task.status !== 'DONE' && task.dueDate !== null)
    .slice(0, 8);

  return {
    projectCount,
    assignedTaskCount: assignedTasks.length,
    completedTaskCount: completedTasks.length,
    upcomingTasks,
  };
}
