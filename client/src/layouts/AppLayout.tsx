import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout(): void {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Team<span className="text-brand-600">Flow</span>
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <Avatar name={user?.name ?? '?'} size="sm" />
              <span className="hidden sm:inline">{user?.name}</span>
            </button>
            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
              >
                <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <Avatar name={user?.name ?? '?'} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigate('/profile')}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="h-4 w-4" /> Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-14 left-0 z-20 w-60 shrink-0 border-r border-line bg-white p-3 transition-transform lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="space-y-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 top-14 z-10 bg-slate-900/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
