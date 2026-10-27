import Skeleton from './Skeleton.jsx';

/** columns: [{ key, header, render?(row), className?, headerClassName? }] */
export default function DataTable({ caption, columns, rows, rowKey = 'id', loading = false, skeletonRows = 6 }) {
  const showSkeleton = loading && rows.length === 0;
  return (
    <div className="overflow-x-auto" aria-busy={loading}>
      <table className={`w-full min-w-[640px] text-left text-sm transition-opacity ${loading && !showSkeleton ? 'opacity-60' : ''}`}>
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium text-slate-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-4 py-3 font-medium ${c.headerClassName || ''}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {showSkeleton
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <tr key={i}>{columns.map((c) => <td key={c.key} className="px-4 py-3.5"><Skeleton className="h-4 w-full max-w-[140px]" /></td>)}</tr>
              ))
            : rows.map((row) => (
                <tr key={row[rowKey]} className="hover:bg-slate-50/60">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ''}`}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
