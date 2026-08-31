import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteProject, useProject, useUpdateProject } from '@/features/projects/queries';
import { ProjectFormModal } from '@/features/projects/ProjectFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { ErrorState, Loader } from '@/components/ui/States';
import { getErrorMessage } from '@/api/client';
import { toDateInputValue } from '@/utils/format';
import { cn } from '@/utils/cn';

const tabs = [
  { to: '', label: 'Overview', end: true },
  { to: 'board', label: 'Board', end: false },
  { to: 'members', label: 'Members', end: false },
];

export function ProjectLayout() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, isError, error, refetch } = useProject(projectId);
  const updateProject = useUpdateProject(projectId);
  const deleteProject = useDeleteProject();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <Loader label="Loading project…" />;
  if (isError || !project) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const isOwner = project.currentUserRole === 'OWNER';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> All projects
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
            {project.description && (
              <p className="mt-1 max-w-2xl text-sm text-slate-500">{project.description}</p>
            )}
          </div>

          {isOwner && (
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
          )}
        </div>
      </div>

      <nav className="flex gap-1 border-b border-line" aria-label="Project sections">
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ project }} />

      <ProjectFormModal
        open={isEditOpen}
        title="Edit project"
        submitLabel="Save changes"
        defaultValues={{
          name: project.name,
          description: project.description ?? '',
          deadline: toDateInputValue(project.deadline),
        }}
        onClose={() => setEditOpen(false)}
        onSubmit={(payload) => updateProject.mutateAsync(payload)}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Delete project"
        message="This will permanently delete the project along with its tasks and comments."
        isLoading={deleteProject.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteProject.mutateAsync(projectId);
          navigate('/projects', { replace: true });
        }}
      />
    </div>
  );
}
