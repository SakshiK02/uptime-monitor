import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500">Page not found.</p>
      <Link to="/" className="font-medium text-indigo-600">
        Back to dashboard
      </Link>
    </div>
  );
}
