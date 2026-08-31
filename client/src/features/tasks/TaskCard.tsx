import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, MessageSquare } from 'lucide-react';
import { PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, isOverdue } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  isDragging?: boolean;
}

export function TaskCardContent({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow',
        isDragging ? 'shadow-lg' : 'hover:shadow-md',
      )}
    >
      <p className="text-sm font-medium text-slate-900">{task.title}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs',
              overdue ? 'font-medium text-red-600' : 'text-slate-500',
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {overdue ? 'Overdue · ' : 'Due '}
            {formatDate(task.dueDate)}
          </span>
        )}
        {Boolean(task._count?.comments) && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <MessageSquare className="h-3.5 w-3.5" />
            {task._count?.comments}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {task.assignee ? (
          <>
            <Avatar name={task.assignee.name} size="sm" />
            <span className="truncate text-xs text-slate-600">{task.assignee.name}</span>
          </>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}
      </div>
    </div>
  );
}

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('cursor-grab active:cursor-grabbing', isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen(task);
      }}
    >
      <TaskCardContent task={task} />
    </div>
  );
}
