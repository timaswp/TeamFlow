import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { getErrorMessage } from '@/api/client';
import { STATUS_LABELS, TASK_PRIORITIES, TASK_STATUSES, type ProjectMember } from '@/types';
import type { TaskPayload } from '@/api/tasks';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(2000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof schema>;

interface TaskFormModalProps {
  open: boolean;
  title: string;
  submitLabel: string;
  members: ProjectMember[];
  defaultValues?: Partial<TaskFormValues>;
  onClose: () => void;
  onSubmit: (payload: TaskPayload) => Promise<unknown>;
}

export function TaskFormModal({
  open,
  title,
  submitLabel,
  members,
  defaultValues,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'TODO', priority: 'MEDIUM', ...defaultValues },
  });

  async function submit(values: TaskFormValues): Promise<void> {
    setFormError(null);
    try {
      await onSubmit({
        title: values.title,
        description: values.description?.trim() ? values.description : null,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate : null,
        assigneeId: values.assigneeId ? values.assigneeId : null,
      });
      reset({ ...values, title: '', description: '' });
      onClose();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save the task.'));
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose} size="lg">
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <Input
          label="Title"
          placeholder="Implement authentication"
          error={errors.title?.message}
          {...register('title')}
        />
        <Textarea
          label="Description"
          placeholder="Add details for your teammates…"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Status" error={errors.status?.message} {...register('status')}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
          <Select label="Priority" error={errors.priority?.message} {...register('priority')}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
          <Input label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          <Select label="Assignee" error={errors.assigneeId?.message} {...register('assigneeId')}>
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.name}
              </option>
            ))}
          </Select>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
