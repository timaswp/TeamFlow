import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useCreateTask, useMoveTask, useProjectTasks } from '@/features/tasks/queries';
import { TaskCard, TaskCardContent } from '@/features/tasks/TaskCard';
import { TaskFormModal } from '@/features/tasks/TaskFormModal';
import { TaskDetailsModal } from '@/features/tasks/TaskDetailsModal';
import { Button } from '@/components/ui/Button';
import { ErrorState, Skeleton } from '@/components/ui/States';
import { getErrorMessage } from '@/api/client';
import { useProjectContext } from '@/hooks/useProjectContext';
import { STATUS_LABELS, TASK_STATUSES, type Task, type TaskStatus } from '@/types';

function Column({
  status,
  tasks,
  onOpenTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-card border bg-slate-50/70 p-3 transition-colors md:w-full ${
        isOver ? 'border-brand-300 bg-brand-50/50' : 'border-line'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-24 flex-1 flex-col gap-2">
          {tasks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-slate-400">
              No tasks in this column.
            </p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} onOpen={onOpenTask} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function BoardPage() {
  const project = useProjectContext();
  const { data: tasks, isLoading, isError, error, refetch } = useProjectTasks(project.id);
  const createTask = useCreateTask(project.id);
  const moveTask = useMoveTask(project.id);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const task of tasks ?? []) {
      grouped[task.status].push(task);
    }
    return grouped;
  }, [tasks]);

  const activeTask = tasks?.find((task) => task.id === activeTaskId) ?? null;
  const openTask = tasks?.find((task) => task.id === openTaskId) ?? null;

  function handleDragStart(event: DragStartEvent): void {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveTaskId(null);
    const { active, over } = event;
    if (!over) return;

    const overStatus = TASK_STATUSES.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : (over.data.current?.status as TaskStatus | undefined);
    const currentStatus = active.data.current?.status as TaskStatus | undefined;

    if (!overStatus || overStatus === currentStatus) return;
    moveTask.mutate({ taskId: String(active.id), status: overStatus });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Drag cards between columns to update their status.
        </p>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add task
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((status) => (
            <Skeleton key={status} className="h-64" />
          ))}
        </div>
      )}

      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}

      {tasks && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTaskId(null)}
        >
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {TASK_STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onOpenTask={(task) => setOpenTaskId(task.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-72">
                <TaskCardContent task={activeTask} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskFormModal
        open={isCreateOpen}
        title="Add task"
        submitLabel="Create task"
        members={project.members}
        onClose={() => setCreateOpen(false)}
        onSubmit={(payload) => createTask.mutateAsync(payload)}
      />

      {openTask && (
        <TaskDetailsModal
          task={openTask}
          members={project.members}
          isOwner={project.currentUserRole === 'OWNER'}
          onClose={() => setOpenTaskId(null)}
        />
      )}
    </div>
  );
}
