import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CommentSection } from '@/features/comments/CommentSection';
import { TaskFormModal } from './TaskFormModal';
import { useDeleteTask, useUpdateTask } from './queries';
import { formatLongDate, toDateInputValue } from '@/utils/format';
import { STATUS_LABELS, TASK_STATUSES, type ProjectMember, type Task, type TaskStatus } from '@/types';

interface TaskDetailsModalProps {
  task: Task;
  members: ProjectMember[];
  isOwner: boolean;
  onClose: () => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm text-slate-800">{children}</span>
    </div>
  );
}

export function TaskDetailsModal({ task, members, isOwner, onClose }: TaskDetailsModalProps) {
  const updateTask = useUpdateTask(task.projectId);
  const deleteTask = useDeleteTask(task.projectId);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Modal open title={task.title} onClose={onClose} size="lg">
        <div className="space-y-5">
          <p className="whitespace-pre-wrap text-sm text-slate-600">
            {task.description ?? 'No description provided.'}
          </p>

          <div className="divide-y divide-line rounded-xl border border-line px-4">
            <DetailRow label="Status">
              <StatusBadge status={task.status} label={STATUS_LABELS[task.status]} />
            </DetailRow>
            <DetailRow label="Priority">
              <PriorityBadge priority={task.priority} />
            </DetailRow>
            <DetailRow label="Assignee">
              {task.assignee ? (
                <span className="inline-flex items-center gap-2">
                  <Avatar name={task.assignee.name} size="sm" />
                  {task.assignee.name}
                </span>
              ) : (
                <span className="text-slate-400">Unassigned</span>
              )}
            </DetailRow>
            <DetailRow label="Due date">
              {task.dueDate ? formatLongDate(task.dueDate) : <span className="text-slate-400">—</span>}
            </DetailRow>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Change status"
              value={task.status}
              onChange={(event) =>
                void updateTask.mutateAsync({
                  taskId: task.id,
                  payload: { status: event.target.value as TaskStatus },
                })
              }
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            <Select
              label="Assign to"
              value={task.assigneeId ?? ''}
              onChange={(event) =>
                void updateTask.mutateAsync({
                  taskId: task.id,
                  payload: { assigneeId: event.target.value || null },
                })
              }
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>

          <hr className="border-line" />

          <CommentSection taskId={task.id} isOwner={isOwner} />
        </div>
      </Modal>

      {isEditOpen && (
        <TaskFormModal
          open
          title="Edit task"
          submitLabel="Save changes"
          members={members}
          defaultValues={{
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            dueDate: toDateInputValue(task.dueDate),
            assigneeId: task.assigneeId ?? '',
          }}
          onClose={() => setEditOpen(false)}
          onSubmit={(payload) => updateTask.mutateAsync({ taskId: task.id, payload })}
        />
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete task"
        message="This task and its comments will be permanently deleted."
        isLoading={deleteTask.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteTask.mutateAsync(task.id);
          setDeleteOpen(false);
          onClose();
        }}
      />
    </>
  );
}
