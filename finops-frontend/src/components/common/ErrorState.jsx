import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', message, onRetry, children }) {
  return (
    <div role="alert" className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="rounded-full bg-red-50 p-3 text-red-600"><AlertTriangle className="h-6 w-6" aria-hidden="true" /></span>
      <h2 className="text-base font-semibold">{title}</h2>
      {message && <p className="max-w-md text-sm text-slate-600">{message}</p>}
      <div className="flex gap-2">
        {onRetry && (
          <button type="button" className="btn-secondary" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
