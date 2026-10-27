import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { categoryLabel } from '../../utils/category.js';
import { formatCompactCurrency, formatCurrency } from '../../utils/currency.js';
import { CHART_COLORS } from '../../utils/theme.js';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';

export default function RankedBarChart({ title, subtitle, items, color, loading }) {
  const data = (items || []).map((i) => ({ name: categoryLabel(i.category), total: Number(i.total) || 0 }));
  return (
    <section className="card p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      {loading ? <Skeleton className="mt-4 h-64 w-full" /> : data.length === 0 ? (
        <EmptyState icon={BarChart3} title="Nothing to rank yet" message="This list fills in as matching records are added." />
      ) : (
        <>
          <div className="mt-4" style={{ height: Math.max(180, data.length * 48) }} role="img" aria-label={`${title}: ${data.map((d) => `${d.name} ${formatCurrency(d.total)}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tickFormatter={formatCompactCurrency} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#334155' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Total']} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="total" fill={color} radius={[0, 4, 4, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ol className="mt-4 divide-y divide-slate-100 text-sm">
            {data.map((d, i) => (
              <li key={d.name} className="flex justify-between py-2"><span>{i + 1}. {d.name}</span><span className="tabular-nums font-medium">{formatCurrency(d.total)}</span></li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
