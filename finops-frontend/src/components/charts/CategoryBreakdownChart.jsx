import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { categoryLabel } from '../../utils/category.js';
import { formatCurrency } from '../../utils/currency.js';
import { CATEGORY_PALETTE } from '../../utils/theme.js';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';

export default function CategoryBreakdownChart({ totals, loading }) {
  const rows = Object.entries(totals || {})
    .map(([key, value]) => ({ key, name: categoryLabel(key), value: Number(value) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
  const sum = rows.reduce((acc, r) => acc + r.value, 0);

  return (
    <section className="card p-5" aria-labelledby="cat-title">
      <h2 id="cat-title" className="text-base font-semibold">Transaction amount by category</h2>
      <p className="mt-0.5 text-xs text-slate-500">Income and expense amounts combined; not an expense-only breakdown.</p>
      {loading ? <Skeleton className="mt-4 h-72 w-full" /> : rows.length === 0 ? (
        <EmptyState icon={PieIcon} title="No category data yet" message="Categories appear once financial records exist." />
      ) : (
        <>
          <div className="mt-2 h-48" role="img" aria-label={`Donut chart of amounts across ${rows.length} categories; see the list below for values.`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2} stroke="none">
                  {rows.map((r, i) => <Cell key={r.key} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [formatCurrency(v), name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1 text-sm">
            {rows.map((r, i) => (
              <li key={r.key} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }} aria-hidden="true" />
                  <span className="truncate">{r.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-slate-600">{formatCurrency(r.value)} <span className="text-xs text-slate-400">({((r.value / sum) * 100).toFixed(1)}%)</span></span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
