import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { getErrorMessage } from '@/api/client';
import type { ProjectPayload } from '@/api/projects';

const schema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().max(1000).optional(),
  deadline: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof schema>;

interface ProjectFormModalProps {
  open: boolean;
  title: string;
  submitLabel: string;
  defaultValues?: ProjectFormValues;
  onClose: () => void;
  onSubmit: (payload: ProjectPayload) => Promise<unknown>;
}

export function ProjectFormModal({
  open,
  title,
  submitLabel,
  defaultValues,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({ resolver: zodResolver(schema), defaultValues });

  async function submit(values: ProjectFormValues): Promise<void> {
    setFormError(null);
    try {
      await onSubmit({
        name: values.name,
        description: values.description?.trim() ? values.description : null,
        deadline: values.deadline ? values.deadline : null,
      });
      reset(values);
      onClose();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save the project.'));
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <Input
          label="Project name"
          placeholder="University Library"
          error={errors.name?.message}
          {...register('name')}
        />
        <Textarea
          label="Description"
          placeholder="What is this project about?"
          error={errors.description?.message}
          {...register('description')}
        />
        <Input label="Deadline" type="date" error={errors.deadline?.message} {...register('deadline')} />

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
