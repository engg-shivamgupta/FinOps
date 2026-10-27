import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FormAlert({ children, tone = 'error' }) {
  if (!children) return null;
  const ok = tone === 'success';
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div role={ok ? 'status' : 'alert'} className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
