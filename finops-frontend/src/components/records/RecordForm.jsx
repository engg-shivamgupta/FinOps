import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Spinner from '../common/Spinner.jsx';
import Field, { describedBy } from '../forms/Field.jsx';
import FormAlert from '../forms/FormAlert.jsx';
import { CATEGORIES, RECORD_TYPES, categoryLabel, typeLabel } from '../../utils/category.js';
import { todayISO } from '../../utils/date.js';
import { applyApiError } from '../../utils/forms.js';
import { recordSchema } from '../../utils/validation.js';

const FIELDS = ['amount', 'type', 'category', 'date', 'description'];

/** `initial` present => edit mode. `onSubmit(values)` must throw on failure. */
export default function RecordForm({ initial, onSubmit, onCancel }) {
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(recordSchema),
    defaultValues: initial
      ? { amount: initial.amount, type: initial.type, category: initial.category, date: initial.date, description: initial.description ?? '' }
      : { amount: '', type: 'expense', category: 'other', date: todayISO(), description: '' },
  });

  const submit = async (values) => {
    setFormError('');
    try { await onSubmit(values); } catch (err) { setFormError(applyApiError(err, setError, FIELDS)); }
  };

  const e = (n) => errors[n]?.message;
  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <FormAlert>{formError}</FormAlert>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="rec-amount" label="Amount (₹)" error={e('amount')}>
          <input id="rec-amount" type="number" inputMode="decimal" step="0.01" min="0" className="input" data-autofocus
            aria-invalid={!!errors.amount} aria-describedby={describedBy('rec-amount', errors.amount)} {...register('amount')} />
        </Field>
        <Field id="rec-date" label="Date" error={e('date')}>
          <input id="rec-date" type="date" className="input" aria-invalid={!!errors.date} aria-describedby={describedBy('rec-date', errors.date)} {...register('date')} />
        </Field>
        <Field id="rec-type" label="Type" error={e('type')}>
          <select id="rec-type" className="input" aria-invalid={!!errors.type} {...register('type')}>
            {RECORD_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
          </select>
        </Field>
        <Field id="rec-category" label="Category" error={e('category')}>
          <select id="rec-category" className="input" aria-invalid={!!errors.category} {...register('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
          </select>
        </Field>
      </div>
      <Field id="rec-description" label="Description (optional)" error={e('description')}>
        <textarea id="rec-description" rows={3} className="input" {...register('description')} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Spinner />} {initial ? 'Save changes' : 'Create record'}
        </button>
      </div>
    </form>
  );
}
