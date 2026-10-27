import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Eye, Pencil, Plus, ReceiptText, Search, Trash2, X } from 'lucide-react';
import { recordsApi } from '../api/recordsApi.js';
import { CategoryBadge, TypeBadge } from '../components/common/Badges.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import DataTable from '../components/common/DataTable.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Modal from '../components/common/Modal.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Pagination from '../components/common/Pagination.jsx';
import RecordDetailsModal from '../components/records/RecordDetailsModal.jsx';
import RecordForm from '../components/records/RecordForm.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { usePermission } from '../hooks/usePermission.js';
import { CATEGORIES, RECORD_TYPES, categoryLabel, typeLabel } from '../utils/category.js';
import { formatSignedAmount } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { parseApiError } from '../utils/errors.js';

const DEFAULT_FILTERS = { search: '', type: '', category: '', date_from: '', date_to: '' };

export default function RecordsPage() {
  const canCreate = usePermission('can_create_record');
  const canUpdate = usePermission('can_update_record');
  const canDelete = usePermission('can_delete_record');

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit'|'view'|'delete', record? }
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);
  const rangeError = filters.date_from && filters.date_to && filters.date_from > filters.date_to
    ? 'The start date must be on or before the end date.' : '';

  const query = useMemo(() => ({
    type: filters.type || undefined,
    category: filters.category || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    search: debouncedSearch.trim() || undefined,
    page,
    size,
  }), [filters.type, filters.category, filters.date_from, filters.date_to, debouncedSearch, page, size]);

  const { data, error, loading, reload } = useApi(() => recordsApi.list(query), [JSON.stringify(query)], { enabled: !rangeError });
  const rows = data ?? [];
  // No total is returned: a full page means a next page *might* exist.
  const hasNext = rows.length === size;
  const filtersActive = Object.entries(filters).some(([, v]) => v !== '');

  const setFilter = (name, value) => { setFilters((f) => ({ ...f, [name]: value })); setPage(1); };
  const clearFilters = () => { setFilters(DEFAULT_FILTERS); setPage(1); };
  const close = () => setModal(null);

  const handleCreate = async (v) => {
    const payload = { amount: v.amount, type: v.type, category: v.category, date: v.date };
    if (v.description.trim()) payload.description = v.description.trim();
    await recordsApi.create(payload);
    toast.success('Record created');
    close();
    reload();
  };

  const handleEdit = async (v) => {
    const orig = modal.record;
    const next = { amount: v.amount, type: v.type, category: v.category, date: v.date, description: v.description.trim() || null };
    const payload = {};
    if (next.amount !== Number(orig.amount)) payload.amount = next.amount;
    if (next.type !== orig.type) payload.type = next.type;
    if (next.category !== orig.category) payload.category = next.category;
    if (next.date !== orig.date) payload.date = next.date;
    if (next.description !== ((orig.description || '').trim() || null)) payload.description = next.description;
    if (Object.keys(payload).length === 0) { toast.info('No changes to save'); close(); return; }
    try {
      await recordsApi.update(orig.id, payload);
    } catch (err) {
      if (parseApiError(err).status === 404) { toast.error('This record no longer exists.'); close(); reload(); return; }
      throw err;
    }
    toast.success('Record updated');
    close();
    reload();
  };

  const handleDelete = async () => {
    const target = modal.record;
    setDeleting(true);
    try {
      await recordsApi.remove(target.id);
      toast.success('Record deleted');
      close();
      if (rows.length === 1 && page > 1) setPage((p) => p - 1); else reload();
    } catch (err) {
      const e = parseApiError(err);
      toast.error(e.message);
      if (e.status === 404) { close(); reload(); }
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'text-slate-500 tabular-nums' },
    { key: 'description', header: 'Description', className: 'max-w-[260px] truncate font-medium', render: (r) => r.description || <span className="font-normal text-slate-400">No description</span> },
    { key: 'type', header: 'Type', render: (r) => <TypeBadge type={r.type} /> },
    { key: 'category', header: 'Category', render: (r) => <CategoryBadge category={r.category} /> },
    { key: 'amount', header: 'Amount', headerClassName: 'text-right', className: 'whitespace-nowrap text-right font-medium tabular-nums',
      render: (r) => <span className={r.type === 'income' ? 'text-emerald-700' : 'text-red-700'}>{formatSignedAmount(r.amount, r.type)}</span> },
    { key: 'date', header: 'Date', className: 'whitespace-nowrap text-slate-600', render: (r) => formatDate(r.date) },
    { key: 'created_by', header: 'Created by', className: 'text-slate-500', render: (r) => `User #${r.created_by}` },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'whitespace-nowrap text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button type="button" className="icon-btn" aria-label={`View record ${r.id}`} onClick={() => setModal({ mode: 'view', record: r })}><Eye className="h-4 w-4" aria-hidden="true" /></button>
          {canUpdate && <button type="button" className="icon-btn" aria-label={`Edit record ${r.id}`} onClick={() => setModal({ mode: 'edit', record: r })}><Pencil className="h-4 w-4" aria-hidden="true" /></button>}
          {canDelete && <button type="button" className="icon-btn hover:!text-red-600" aria-label={`Delete record ${r.id}`} onClick={() => setModal({ mode: 'delete', record: r })}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>}
        </div>
      ) },
  ];

  const createButton = canCreate && <button type="button" className="btn-primary" onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" aria-hidden="true" /> New record</button>;

  return (
    <>
      <PageHeader title="Financial records" description="All non-deleted records in the system. Results are newest first." actions={createButton} />

      <div className="card overflow-hidden">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative sm:col-span-2">
            <label htmlFor="f-search" className="sr-only">Search by description</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="f-search" type="search" className="input pl-9" placeholder="Search description" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-type" className="sr-only">Type</label>
            <select id="f-type" className="input" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
              <option value="">All types</option>
              {RECORD_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-category" className="sr-only">Category</label>
            <select id="f-category" className="input" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-from" className="mb-1 block text-xs text-slate-500">From</label>
            <input id="f-from" type="date" className="input" value={filters.date_from} max={filters.date_to || undefined} onChange={(e) => setFilter('date_from', e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-to" className="mb-1 block text-xs text-slate-500">To</label>
            <input id="f-to" type="date" className="input" value={filters.date_to} min={filters.date_from || undefined} onChange={(e) => setFilter('date_to', e.target.value)} />
          </div>
          {(filtersActive || rangeError) && (
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
              {rangeError && <p role="alert" className="text-sm text-red-600">{rangeError}</p>}
              <button type="button" className="btn-ghost ml-auto" onClick={clearFilters}><X className="h-4 w-4" aria-hidden="true" /> Clear filters</button>
            </div>
          )}
        </div>

        {error && !data ? (
          <div className="p-4"><ErrorState title="Couldn't load records" message={error.message} onRetry={reload} /></div>
        ) : !loading && rows.length === 0 ? (
          filtersActive ? (
            <EmptyState icon={Search} title="No records match your filters" message={page > 1 ? 'There are no more results on this page.' : 'Try widening the date range or clearing a filter.'}
              action={<button type="button" className="btn-secondary" onClick={clearFilters}>Clear filters</button>} />
          ) : (
            <EmptyState icon={ReceiptText} title="No records yet"
              message={canCreate ? 'Create the first income or expense record to start building the ledger.' : 'No financial records have been added yet. Your role is read-only.'}
              action={createButton || undefined} />
          )
        ) : (
          <DataTable caption="Financial records" columns={columns} rows={rows} loading={loading} skeletonRows={8} />
        )}

        {(rows.length > 0 || page > 1) && (
          <Pagination page={page} size={size} count={rows.length} hasNext={hasNext} loading={loading} onPage={setPage} onSize={(s) => { setSize(s); setPage(1); }} />
        )}
      </div>
      {error && data && <p role="alert" className="mt-3 text-sm text-red-600">Couldn't refresh: {error.message}</p>}

      <Modal open={modal?.mode === 'create'} title="New record" onClose={close}>
        {modal?.mode === 'create' && <RecordForm onSubmit={handleCreate} onCancel={close} />}
      </Modal>
      <Modal open={modal?.mode === 'edit'} title={`Edit record #${modal?.record?.id ?? ''}`} onClose={close}>
        {modal?.mode === 'edit' && <RecordForm initial={modal.record} onSubmit={handleEdit} onCancel={close} />}
      </Modal>
      {modal?.mode === 'view' && <RecordDetailsModal recordId={modal.record.id} onClose={close} onMissing={() => { close(); reload(); }} />}
      <ConfirmDialog open={modal?.mode === 'delete'} destructive busy={deleting} title="Delete this record?"
        message={modal?.record ? `Record #${modal.record.id} (${modal.record.description || categoryLabel(modal.record.category)}, ${formatSignedAmount(modal.record.amount, modal.record.type)}) will be removed from the ledger and dashboard totals.` : ''}
        confirmLabel="Delete record" onConfirm={handleDelete} onCancel={close} />
    </>
  );
}
