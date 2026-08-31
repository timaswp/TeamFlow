import { useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { useAddMember, useMembers, useRemoveMember } from '@/features/projects/queries';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState, Loader } from '@/components/ui/States';
import { getErrorMessage } from '@/api/client';
import { useProjectContext } from '@/hooks/useProjectContext';

export function MembersPage() {
  const project = useProjectContext();
  const isOwner = project.currentUserRole === 'OWNER';
  const { data: members, isLoading, isError, error, refetch } = useMembers(project.id);
  const addMember = useAddMember(project.id);
  const removeMember = useRemoveMember(project.id);

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setFormError(null);
    try {
      await addMember.mutateAsync(email.trim().toLowerCase());
      setEmail('');
    } catch (submitError) {
      setFormError(getErrorMessage(submitError, 'Could not add this member.'));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardTitle>Members</CardTitle>

        {isLoading && <Loader label="Loading members…" />}
        {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}

        {members && (
          <ul className="mt-3 divide-y divide-line">
            {members.map((member) => (
              <li key={member.id} className="flex items-center gap-3 py-3">
                <Avatar name={member.user.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{member.user.name}</p>
                  <p className="truncate text-xs text-slate-500">{member.user.email}</p>
                </div>
                <Badge tone={member.role === 'OWNER' ? 'brand' : 'neutral'}>
                  {member.role === 'OWNER' ? 'Owner' : 'Member'}
                </Badge>
                {isOwner && member.role !== 'OWNER' && (
                  <button
                    type="button"
                    aria-label={`Remove ${member.user.name}`}
                    onClick={() => setPendingRemovalId(member.user.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {isOwner && (
        <Card className="h-fit">
          <CardTitle>Add member</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Enter the email of a registered TeamFlow user.
          </p>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <Input
              label="Email"
              type="email"
              required
              placeholder="maria@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={formError ?? undefined}
            />
            <Button
              type="submit"
              className="w-full"
              leftIcon={<UserPlus className="h-4 w-4" />}
              isLoading={addMember.isPending}
            >
              Add member
            </Button>
          </form>
        </Card>
      )}

      <ConfirmDialog
        open={pendingRemovalId !== null}
        title="Remove member"
        message="This person will lose access to the project."
        confirmLabel="Remove"
        isLoading={removeMember.isPending}
        onCancel={() => setPendingRemovalId(null)}
        onConfirm={async () => {
          if (pendingRemovalId) {
            await removeMember.mutateAsync(pendingRemovalId);
          }
          setPendingRemovalId(null);
        }}
      />
    </div>
  );
}
