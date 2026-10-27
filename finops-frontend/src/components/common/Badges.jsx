import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { categoryLabel, roleLabel, typeLabel } from '../../utils/category.js';

const ROLE_STYLES = {
  admin: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  analyst: 'bg-sky-50 text-sky-700 ring-sky-200',
  viewer: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function RoleBadge({ role }) {
  return <span className={`badge ring-1 ring-inset ${ROLE_STYLES[role] || ROLE_STYLES.viewer}`}>{roleLabel(role)}</span>;
}

export function StatusBadge({ active }) {
  return active ? (
    <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> Active
    </span>
  ) : (
    <span className="badge bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden="true" /> Inactive
    </span>
  );
}

export function TypeBadge({ type }) {
  const income = type === 'income';
  const Icon = income ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`badge ring-1 ring-inset ${income ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
      <Icon className="h-3 w-3" aria-hidden="true" /> {typeLabel(type)}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return <span className="badge bg-slate-100 text-slate-700">{categoryLabel(category)}</span>;
}
