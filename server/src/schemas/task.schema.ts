import { z } from 'zod';

const dueDate = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    return value === null || value === '' ? null : new Date(value);
  });

const assigneeId = z.union([z.string().uuid(), z.literal(''), z.null()]).optional().transform((value) => {
  if (value === undefined) return undefined;
  return value === null || value === '' ? null : value;
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate,
  assigneeId,
});

export const updateTaskSchema = createTaskSchema.partial();

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment cannot be empty').max(1000),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
