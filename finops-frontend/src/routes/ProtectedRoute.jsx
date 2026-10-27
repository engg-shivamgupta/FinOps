import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ErrorState from '../components/common/ErrorState.jsx';
import Spinner from '../components/common/Spinner.jsx';

export function FullScreenLoader({ label = 'Verifying your session…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-slate-600">
      <Spinner className="h-5 w-5" /> {label}
    </div>
  );
}

export default function ProtectedRoute() {
  const { status, error, retrySession, logout } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'error') {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <ErrorState title="Couldn't verify your session" message={error?.message} onRetry={retrySession}>
          <button type="button" className="btn-ghost" onClick={logout}>Sign out</button>
        </ErrorState>
      </div>
    );
  }
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
