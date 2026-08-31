import { prisma } from '../config/prisma';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { requireMembership } from './project.service';

const commentInclude = {
  author: { select: { id: true, name: true, email: true, avatar: true } },
} as const;

async function getTaskProjectId(taskId: string): Promise<string> {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  return task.projectId;
}

export async function listComments(taskId: string, userId: string) {
  const projectId = await getTaskProjectId(taskId);
  await requireMembership(projectId, userId);

  return prisma.comment.findMany({
    where: { taskId },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });
}

export async function createComment(taskId: string, userId: string, text: string) {
  const projectId = await getTaskProjectId(taskId);
  await requireMembership(projectId, userId);

  return prisma.comment.create({
    data: { taskId, authorId: userId, text },
    include: commentInclude,
  });
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true, task: { select: { projectId: true } } },
  });
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  const role = await requireMembership(comment.task.projectId, userId);
  if (comment.authorId !== userId && role !== 'OWNER') {
    throw new ForbiddenError('You can only delete your own comments');
  }

  await prisma.comment.delete({ where: { id: commentId } });
}
