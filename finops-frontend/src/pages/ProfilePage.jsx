import { Check, Minus } from 'lucide-react';
import { RoleBadge, StatusBadge } from '../components/common/Badges.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { PERMISSION_LABELS } from '../utils/category.js';
import { formatDate } from '../utils/date.js';

export default function ProfilePage() {
  const { user, role, permissions, logout } = useAuth();
  const rows = [
    ['Full name', user.full_name || '—'],
    ['Username', user.username],
    ['Email', user.email],
    ['Role', <RoleBadge key="r" role={role} />],
    ['Status', <StatusBadge key="s" active={user.is_active} />],
    ['Member since', formatDate(user.created_at)],
  ];
  return (
    <>
      <PageHeader title="My account" description="Read-only. The API has no endpoints for editing your profile or changing your password." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="acct">
          <h2 id="acct" className="text-base font-semibold">Account details</h2>
          <dl className="mt-3 divide-y divide-slate-100 text-sm">
            {rows.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <button type="button" className="btn-secondary mt-4" onClick={logout}>Log out</button>
        </section>
        <section className="card p-5" aria-labelledby="perm">
          <h2 id="perm" className="text-base font-semibold">What your role can do</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
              const ok = permissions?.[key] === true;
              return (
                <li key={key} className="flex items-center justify-between py-2.5">
                  <span className={ok ? '' : 'text-slate-400'}>{label}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${ok ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {ok ? <Check className="h-4 w-4" aria-hidden="true" /> : <Minus className="h-4 w-4" aria-hidden="true" />}{ok ? 'Allowed' : 'Not allowed'}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
