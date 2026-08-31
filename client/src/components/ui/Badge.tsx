import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { TaskPriority, TaskStatus } from '@/types';

type Tone = 'neutral' | 'brand' | 'green' | 'amber' | 'red';

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const priorityTone: Record<TaskPriority, Tone> = {
  LOW: 'neutral',
  MEDIUM: 'amber',
  HIGH: 'red',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge tone={priorityTone[priority]}>{priority}</Badge>;
}

const statusTone: Record<TaskStatus, Tone> = {
  TODO: 'neutral',
  IN_PROGRESS: 'brand',
  DONE: 'green',
};

export function StatusBadge({ status, label }: { status: TaskStatus; label: string }) {
  return <Badge tone={statusTone[status]}>{label}</Badge>;
}
