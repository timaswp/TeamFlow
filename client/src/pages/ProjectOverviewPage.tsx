import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useProjectContext } from '@/hooks/useProjectContext';
import { formatLongDate } from '@/utils/format';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function ProjectOverviewPage() {
  const project = useProjectContext();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardTitle>Progress</CardTitle>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={project.progress} className="flex-1" />
            <span className="text-sm font-semibold text-slate-700">{project.progress}%</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Total tasks" value={project.totalTasks} />
            <Stat label="Completed" value={project.completedTasks} />
            <Stat label="Team size" value={project.memberCount} />
          </div>
          <Link
            to="board"
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            Open the Kanban board →
          </Link>
        </Card>

        <Card>
          <CardTitle>Description</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            {project.description ?? 'No description was added for this project.'}
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays className="h-4 w-4" />
            {project.deadline ? `Deadline: ${formatLongDate(project.deadline)}` : 'No deadline set'}
          </p>
        </Card>
      </div>

      <Card className="h-fit">
        <CardTitle>Members</CardTitle>
        <ul className="mt-3 space-y-3">
          {project.members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar name={member.user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{member.user.name}</p>
                <p className="truncate text-xs text-slate-500">{member.user.email}</p>
              </div>
              <Badge tone={member.role === 'OWNER' ? 'brand' : 'neutral'}>
                {member.role === 'OWNER' ? 'Owner' : 'Member'}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
