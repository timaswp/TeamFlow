import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, FolderKanban, ListTodo } from 'lucide-react';
import { useDashboard } from '@/features/projects/queries';
import { Card, CardTitle } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { getErrorMessage } from '@/api/client';
import { formatDate, isOverdue } from '@/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
}) {
  return (
    <Card className="flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Hello, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here is what your teams are working on.</p>
      </header>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      )}

      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Projects" value={data.projectCount} icon={FolderKanban} />
            <StatCard label="Assigned tasks" value={data.assignedTaskCount} icon={ListTodo} />
            <StatCard label="Completed tasks" value={data.completedTaskCount} icon={CheckCircle2} />
          </div>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-slate-400" />
              <CardTitle>Upcoming deadlines</CardTitle>
            </div>

            {data.upcomingTasks.length === 0 ? (
              <EmptyState
                title="Nothing due right now"
                description="Tasks assigned to you with a due date will appear here."
              />
            ) : (
              <ul className="divide-y divide-line">
                {data.upcomingTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate);
                  return (
                    <li key={task.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        {overdue && (
                          <span className="mb-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-red-700">
                            OVERDUE
                          </span>
                        )}
                        <Link
                          to={`/projects/${task.projectId}/board`}
                          className="block truncate text-sm font-medium text-slate-900 hover:text-brand-700"
                        >
                          {task.title}
                        </Link>
                        <p className="truncate text-xs text-slate-500">{task.project?.name}</p>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          overdue ? 'text-red-600' : 'text-slate-500',
                        )}
                      >
                        Due {formatDate(task.dueDate)}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
