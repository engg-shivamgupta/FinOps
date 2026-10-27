import { Link } from 'react-router-dom';
import { CategoryBadge, TypeBadge } from '../common/Badges.jsx';
import DataTable from '../common/DataTable.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { formatSignedAmount } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';

const columns = [
  { key: 'description', header: 'Description', render: (r) => <span className="font-medium">{r.description || <span className="text-slate-400">No description</span>}</span> },
  { key: 'category', header: 'Category', render: (r) => <CategoryBadge category={r.category} /> },
  { key: 'date', header: 'Date', render: (r) => formatDate(r.date), className: 'whitespace-nowrap text-slate-600' },
  { key: 'type', header: 'Type', render: (r) => <TypeBadge type={r.type} /> },
  {
    key: 'amount', header: 'Amount', headerClassName: 'text-right', className: 'whitespace-nowrap text-right tabular-nums font-medium',
    render: (r) => <span className={r.type === 'income' ? 'text-emerald-700' : 'text-red-700'}>{formatSignedAmount(r.amount, r.type)}</span>,
  },
];

export default function RecentActivity({ items, loading }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="text-base font-semibold">Recent activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">The 10 most recent records by date. This is not the full history.</p>
        </div>
        <Link to="/records" className="shrink-0 text-sm font-medium text-indigo-600 hover:underline">View all records</Link>
      </div>
      {!loading && (items || []).length === 0
        ? <EmptyState title="No transactions yet" message="Recorded income and expenses will show up here." />
        : <DataTable caption="Recent transactions" columns={columns} rows={items || []} loading={loading} skeletonRows={5} />}
    </section>
  );
}
