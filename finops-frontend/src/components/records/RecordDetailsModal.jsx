import { recordsApi } from '../../api/recordsApi.js';
import { useApi } from '../../hooks/useApi.js';
import { categoryLabel } from '../../utils/category.js';
import { formatSignedAmount } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';
import { CategoryBadge, TypeBadge } from '../common/Badges.jsx';
import ErrorState from '../common/ErrorState.jsx';
import Modal from '../common/Modal.jsx';
import Skeleton from '../common/Skeleton.jsx';

export default function RecordDetailsModal({ recordId, onClose, onMissing }) {
  const { data, error, loading, reload } = useApi(() => recordsApi.get(recordId), [recordId]);
  const missing = error?.status === 404;

  const rows = data && [
    ['Record ID', `#${data.id}`],
    ['Amount', <span key="a" className={`font-semibold tabular-nums ${data.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>{formatSignedAmount(data.amount, data.type)}</span>],
    ['Type', <TypeBadge key="t" type={data.type} />],
    ['Category', <CategoryBadge key="c" category={data.category} />],
    ['Transaction date', formatDate(data.date)],
    ['Description', data.description || 'No description'],
    ['Created by', `User #${data.created_by}`],
    ['Created on', formatDate(data.created_at)],
  ];

  return (
    <Modal open title="Record details" onClose={onClose}>
      {loading && !data && <div className="space-y-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div>}
      {missing && (
        <ErrorState title="Record not found" message="This record no longer exists. It may have been deleted." onRetry={undefined}>
          <button type="button" className="btn-primary" onClick={onMissing}>Refresh list</button>
        </ErrorState>
      )}
      {error && !missing && <ErrorState title="Couldn't load this record" message={error.message} onRetry={reload} />}
      {data && (
        <dl className="divide-y divide-slate-100 text-sm" aria-label={`Details for ${categoryLabel(data.category)} record`}>
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="text-right">{v}</dd></div>
          ))}
        </dl>
      )}
    </Modal>
  );
}
