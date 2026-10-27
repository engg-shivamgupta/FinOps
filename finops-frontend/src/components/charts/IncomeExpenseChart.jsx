import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/currency.js';
import { formatMonthLong, formatMonthShort } from '../../utils/date.js';
import { CHART_COLORS } from '../../utils/theme.js';
import EmptyState from '../common/EmptyState.jsx';
import Skeleton from '../common/Skeleton.jsx';
import { BarChart3 } from 'lucide-react';

export default function IncomeExpenseChart({ trends, loading }) {
  const data = (trends || []).map((t) => ({ month: t.month, income: Number(t.income) || 0, expense: Number(t.expense) || 0 }));
  return (
    <section className="card p-5" aria-labelledby="trend-title">
      <h2 id="trend-title" className="text-base font-semibold">Monthly income vs. expenses</h2>
      <p className="mt-0.5 text-xs text-slate-500">Months that have recorded activity (up to the latest 12), not every calendar month.</p>
      <div className="mt-4 h-72">
        {loading ? <Skeleton className="h-full w-full" /> : data.length === 0 ? (
          <EmptyState icon={BarChart3} title="No monthly data yet" message="Trends appear once financial records exist." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12, fill: CHART_COLORS.axis }} tickLine={false} axisLine={false} width={64} />
              <Tooltip formatter={(v, name) => [formatCurrency(v), name]} labelFormatter={formatMonthLong} cursor={{ fill: '#f1f5f9' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" name="Expenses" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {!loading && data.length > 0 && (
        <table className="sr-only">
          <caption>Monthly income and expenses</caption>
          <thead><tr><th>Month</th><th>Income</th><th>Expenses</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.month}><td>{formatMonthLong(d.month)}</td><td>{formatCurrency(d.income)}</td><td>{formatCurrency(d.expense)}</td></tr>)}</tbody>
        </table>
      )}
    </section>
  );
}
