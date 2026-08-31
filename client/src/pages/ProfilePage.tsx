import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>

      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={user?.name ?? '?'} size="lg" />
          <div className="min-w-0">
            <CardTitle>{user?.name}</CardTitle>
            <p className="truncate text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="secondary"
          className="mt-6"
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          Log out
        </Button>
      </Card>
    </div>
  );
}
