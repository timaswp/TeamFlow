import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, FolderKanban, ListChecks, Plus, Users } from 'lucide-react';
import { useCreateProject, useProjects } from '@/features/projects/queries';
import { ProjectFormModal } from '@/features/projects/ProjectFormModal';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/ui/States';
import { getErrorMessage } from '@/api/client';
import { formatLongDate } from '@/utils/format';

export function ProjectsPage() {
  const { data: projects, isLoading, isError, error, refetch } = useProjects();
  const createProject = useCreateProject();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">All projects you own or collaborate on.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Create project
        </Button>
      </header>

      {isLoading && <CardSkeletonGrid />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}

      {projects && projects.length === 0 && (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title="You don't have any projects yet."
          description="Create your first project and start planning tasks with your team."
          action={<Button onClick={() => setModalOpen(true)}>Create your first project</Button>}
        />
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardTitle className="group-hover:text-brand-700">{project.name}</CardTitle>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                )}

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {project.memberCount} members
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="h-3.5 w-3.5" /> {project.totalTasks} tasks
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-medium text-slate-700">{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} />
                </div>

                <p className="mt-4 inline-flex items-center gap-1 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {project.deadline ? `Deadline: ${formatLongDate(project.deadline)}` : 'No deadline'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ProjectFormModal
        open={isModalOpen}
        title="Create project"
        submitLabel="Create project"
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          const project = await createProject.mutateAsync(payload);
          navigate(`/projects/${project.id}`);
        }}
      />
    </div>
  );
}
