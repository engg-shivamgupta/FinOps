import Skeleton from '../common/Skeleton.jsx';

const TONES = {
  positive: { icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700' },
  negative: { icon: 'bg-red-50 text-red-600', value: 'text-red-700' },
  neutral: { icon: 'bg-indigo-50 text-indigo-600', value: 'text-ink' },
};

export default function StatCard({ label, value, icon: Icon, tone = 'neutral', caption, loading }) {
  const t = TONES[tone];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className={`rounded-lg p-2 ${t.icon}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
      </div>
      {loading ? (
        <><Skeleton className="mt-4 h-8 w-36" /><Skeleton className="mt-3 h-3 w-24" /></>
      ) : (
        <>
          <p className={`mt-3 text-2xl font-semibold tabular-nums tracking-tight ${t.value}`}>{value}</p>
          {caption && <p className="mt-1 text-xs text-slate-500">{caption}</p>}
        </>
      )}
    </div>
  );
}
