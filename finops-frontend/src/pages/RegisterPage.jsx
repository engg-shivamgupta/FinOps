import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../api/authApi.js';
import BrandMark from '../components/common/BrandMark.jsx';
import Spinner from '../components/common/Spinner.jsx';
import Field, { describedBy } from '../components/forms/Field.jsx';
import FormAlert from '../components/forms/FormAlert.jsx';
import PasswordInput from '../components/forms/PasswordInput.jsx';
import { applyApiError } from '../utils/forms.js';
import { registerSchema } from '../utils/validation.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', username: '', email: '', password: '', confirm_password: '' },
  });

  const onSubmit = async (values) => {
    setFormError('');
    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
      role: 'viewer', // never user-selectable: public sign-ups are always Viewers
    };
    if (values.full_name) payload.full_name = values.full_name;
    try {
      await authApi.register(payload);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      const message = applyApiError(err, setError, ['username', 'email', 'password', 'full_name']);
      // The API reports duplicates as HTTP 400 with a plain-text detail.
      if (/username already taken/i.test(message)) setError('username', { type: 'server', message });
      else if (/email already registered/i.test(message)) setError('email', { type: 'server', message });
      else setFormError(message);
    }
  };

  const field = (name, label, props = {}) => (
    <Field id={name} label={label} error={errors[name]?.message}>
      <input id={name} className="input" aria-invalid={!!errors[name]} aria-describedby={describedBy(name, errors[name])} {...props} {...register(name)} />
    </Field>
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8"><BrandMark /></div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">New accounts start with Viewer access. An administrator can change your role later.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            <FormAlert>{formError}</FormAlert>
            {field('full_name', 'Full name (optional)', { autoComplete: 'name' })}
            {field('username', 'Username', { autoComplete: 'username' })}
            {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
            <Field id="password" label="Password" error={errors.password?.message} hint="At least 6 characters.">
              <PasswordInput id="password" autoComplete="new-password" invalid={!!errors.password}
                describedBy={describedBy('password', errors.password, true)} {...register('password')} />
            </Field>
            <Field id="confirm_password" label="Confirm password" error={errors.confirm_password?.message}>
              <PasswordInput id="confirm_password" autoComplete="new-password" invalid={!!errors.confirm_password}
                describedBy={describedBy('confirm_password', errors.confirm_password)} {...register('confirm_password')} />
            </Field>
            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />} {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
