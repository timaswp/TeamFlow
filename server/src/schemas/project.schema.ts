import { z } from 'zod';

const optionalDate = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    return value === null || value === '' ? null : new Date(value);
  });

export const createProjectSchema = z.object({
  name: z.string().trim().min(3, 'Project name must be at least 3 characters').max(80),
  description: z.string().trim().max(1000).optional().nullable(),
  deadline: optionalDate,
});

export const updateProjectSchema = createProjectSchema.partial();

export const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
