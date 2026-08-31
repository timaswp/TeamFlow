import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-semibold text-slate-900">404</p>
      <p className="text-sm text-slate-500">This page does not exist.</p>
      <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
