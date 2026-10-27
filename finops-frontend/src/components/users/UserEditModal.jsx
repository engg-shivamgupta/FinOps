import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usersApi } from '../../api/usersApi.js';
import { useApi } from '../../hooks/useApi.js';
import { ROLES, roleLabel } from '../../utils/category.js';
import { applyApiError } from '../../utils/forms.js';
import { userEditSchema } from '../../utils/validation.js';
import ErrorState from '../common/ErrorState.jsx';
import Modal from '../common/Modal.jsx';
import Skeleton from '../common/Skeleton.jsx';
import Spinner from '../common/Spinner.jsx';
import Field from '../forms/Field.jsx';
import FormAlert from '../forms/FormAlert.jsx';

function UserEditForm({ user, isSelf, onSubmit, onCancel }) {
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(userEditSchema),
    defaultValues: { full_name: user.full_name ?? '', role: user.role, is_active: user.is_active },
  });

  const submit = async (values) => {
    setFormError('');
    // PATCH only what changed.
    const payload = {};
    if (values.full_name !== (user.full_name ?? '')) payload.full_name = values.full_name;
    if (values.role !== user.role) payload.role = values.role;
    if (values.is_active !== user.is_active) payload.is_active = values.is_active;
    try { await onSubmit(payload); } catch (err) { setFormError(applyApiError(err, setError, ['full_name', 'role', 'is_active'])); }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <FormAlert>{formError}</FormAlert>
      <dl className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Username</dt><dd className="font-medium">{user.username}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
      </dl>
      <Field id="u-name" label="Full name" error={errors.full_name?.message}>
        <input id="u-name" className="input" data-autofocus {...register('full_name')} />
      </Field>
      <Field id="u-role" label="Role" error={errors.role?.message} hint={isSelf ? 'You can’t change your own role here.' : undefined}>
        <select id="u-role" className="input" disabled={isSelf} aria-describedby={isSelf ? 'u-role-hint' : undefined} {...register('role')}>
          {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
      </Field>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600" disabled={isSelf} {...register('is_active')} />
          Account is active
        </label>
        <p className="mt-1.5 text-xs text-slate-500">{isSelf ? 'You can’t deactivate your own account.' : 'Inactive users can’t sign in. Tick this to reactivate an account.'}</p>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting && <Spinner />} Save changes</button>
      </div>
    </form>
  );
}

/** Loads the latest copy of the user via GET /api/users/{id} before editing. */
export default function UserEditModal({ userId, isSelf, onSave, onClose, onMissing }) {
  const { data, error, loading, reload } = useApi(() => usersApi.get(userId), [userId]);
  const missing = error?.status === 404;
  return (
    <Modal open title="Edit user" onClose={onClose}>
      {loading && !data && <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
      {missing && <ErrorState title="User not found" message="This user no longer exists."><button type="button" className="btn-primary" onClick={onMissing}>Refresh list</button></ErrorState>}
      {error && !missing && <ErrorState title="Couldn't load this user" message={error.message} onRetry={reload} />}
      {data && <UserEditForm user={data} isSelf={isSelf} onSubmit={(payload) => onSave(data, payload)} onCancel={onClose} />}
    </Modal>
  );
}
