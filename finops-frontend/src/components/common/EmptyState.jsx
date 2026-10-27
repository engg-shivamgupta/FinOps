import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="rounded-full bg-slate-100 p-3 text-slate-500"><Icon className="h-6 w-6" aria-hidden="true" /></span>
      <h3 className="text-base font-semibold">{title}</h3>
      {message && <p className="max-w-sm text-sm text-slate-600">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
