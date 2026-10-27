import { ChevronLeft, ChevronRight } from 'lucide-react';

const SIZES = [10, 20, 50, 100];

// The API returns a bare list with no total, so we only know whether a next page *may* exist.
export default function Pagination({ page, size, count, hasNext, loading, onPage, onSize }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span>Page {page}{count > 0 ? ` · ${count} record${count === 1 ? '' : 's'} shown` : ''}</span>
        <label className="flex items-center gap-2">
          <span className="text-slate-500">Rows per page</span>
          <select className="input !w-auto !py-1" value={size} onChange={(e) => onSize(Number(e.target.value))}>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary" disabled={page <= 1 || loading} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
        </button>
        <button type="button" className="btn-secondary" disabled={!hasNext || loading} onClick={() => onPage(page + 1)}>
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
