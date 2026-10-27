import { useState } from 'react';
import { toast } from 'sonner';
import { Ban, Pencil, Users } from 'lucide-react';
import { usersApi } from '../api/usersApi.js';
import { RoleBadge, StatusBadge } from '../components/common/Badges.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import DataTable from '../components/common/DataTable.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import UserEditModal from '../components/users/UserEditModal.jsx';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatDate } from '../utils/date.js';
import { parseApiError } from '../utils/errors.js';

export default function UsersPage() {
  const { user: me, refreshUser } = useAuth();
  const { data, error, loading, reload } = useApi(() => usersApi.list(), []);
  const [editingId, setEditingId] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [busy, setBusy] = useState(false);
  const rows = data ?? [];

  const save = async (original, payload) => {
    if (Object.keys(payload).length === 0) { toast.info('No changes to save'); setEditingId(null); return; }
    await usersApi.update(original.id, payload);
    toast.success('User updated');
    setEditingId(null);
    if (original.id === me?.id) refreshUser().catch(() => {});
    reload();
  };

  const deactivate = async () => {
    setBusy(true);
    try {
      await usersApi.deactivate(deactivating.id);
      toast.success(`${deactivating.username} was deactivated`);
      setDeactivating(null);
      reload();
    } catch (err) {
      const e = parseApiError(err);
      toast.error(e.message);
      if (e.status === 404) { setDeactivating(null); reload(); }
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'text-slate-500 tabular-nums' },
    { key: 'full_name', header: 'Full name', className: 'font-medium', render: (u) => (<>{u.full_name || <span className="font-normal text-slate-400">—</span>}{u.id === me?.id && <span className="ml-2 text-xs font-normal text-slate-500">(you)</span>}</>) },
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email', className: 'text-slate-600' },
    { key: 'role', header: 'Role', render: (u) => <RoleBadge role={u.role} /> },
    { key: 'is_active', header: 'Status', render: (u) => <StatusBadge active={u.is_active} /> },
    { key: 'created_at', header: 'Created', className: 'whitespace-nowrap text-slate-600', render: (u) => formatDate(u.created_at) },
    { key: 'actions', header: <span className="sr-only">Actions</span>, className: 'whitespace-nowrap text-right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <button type="button" className="icon-btn" aria-label={`Edit ${u.username}`} onClick={() => setEditingId(u.id)}><Pencil className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" className="icon-btn hover:!text-red-600" disabled={!u.is_active || u.id === me?.id}
            aria-label={u.id === me?.id ? 'You can’t deactivate your own account' : `Deactivate ${u.username}`}
            title={u.id === me?.id ? 'You can’t deactivate your own account' : u.is_active ? 'Deactivate' : 'Already inactive'}
            onClick={() => setDeactivating(u)}><Ban className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      ) },
  ];

  return (
    <>
      <PageHeader title="User management" description="Change names, roles and active status. Deactivating an account blocks sign-in; the account is not deleted." />
      <div className="card overflow-hidden">
        {error && !data ? <div className="p-4"><ErrorState title="Couldn't load users" message={error.message} onRetry={reload} /></div>
          : !loading && rows.length === 0 ? <EmptyState icon={Users} title="No users found" />
          : <DataTable caption="Users" columns={columns} rows={rows} loading={loading} />}
      </div>

      {editingId !== null && (
        <UserEditModal userId={editingId} isSelf={editingId === me?.id} onSave={save} onClose={() => setEditingId(null)} onMissing={() => { setEditingId(null); reload(); }} />
      )}
      <ConfirmDialog open={!!deactivating} destructive busy={busy} title="Deactivate this user?"
        message={deactivating ? `${deactivating.username} will no longer be able to sign in or use existing sessions. You can reactivate the account later by editing it.` : ''}
        confirmLabel="Deactivate user" onConfirm={deactivate} onCancel={() => setDeactivating(null)} />
    </>
  );
}
