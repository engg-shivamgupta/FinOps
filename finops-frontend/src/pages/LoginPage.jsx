import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BrandMark from '../components/common/BrandMark.jsx';
import Spinner from '../components/common/Spinner.jsx';
import Field, { describedBy } from '../components/forms/Field.jsx';
import FormAlert from '../components/forms/FormAlert.jsx';
import PasswordInput from '../components/forms/PasswordInput.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { parseApiError } from '../utils/errors.js';
import { loginSchema } from '../utils/validation.js';

const NOTICES = {
  expired: 'Your session has expired or is no longer valid. Sign in again to continue.',
  inactive: 'Your account has been deactivated. Contact an administrator.',
};

function loginMessage(error) {
  const e = parseApiError(error);
  if (e.status === 401) return 'Incorrect username or password.';
  if (e.status === 403) return 'This account is inactive. Ask an administrator to reactivate it.';
  return e.message;
}

export default function LoginPage() {
  const { login, notice, clearNotice } = useAuth();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => () => clearNotice(), [clearNotice]);

  const onSubmit = async ({ username, password }) => {
    setFormError('');
    clearNotice();
    try {
      await login(username, password); // PublicOnlyRoute redirects once authenticated
    } catch (err) {
      setFormError(loginMessage(err));
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <BrandMark light />
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">Every transaction, summarised and accounted for.</h2>
          <p className="mt-4 text-slate-300">Review income and spending, search the ledger, and see what each role is allowed to do — all from one place.</p>
        </div>
        <p className="text-sm text-slate-400">Access follows your assigned role: Admin, Analyst or Viewer.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><BrandMark /></div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">Use your FinOps username and password.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            {location.state?.registered && !formError && <FormAlert tone="success">Account created. Sign in to continue.</FormAlert>}
            {notice && !formError && <FormAlert>{NOTICES[notice]}</FormAlert>}
            <FormAlert>{formError}</FormAlert>

            <Field id="username" label="Username" error={errors.username?.message}>
              <input id="username" className="input" autoComplete="username" autoFocus
                aria-invalid={!!errors.username} aria-describedby={describedBy('username', errors.username)} {...register('username')} />
            </Field>
            <Field id="password" label="Password" error={errors.password?.message}>
              <PasswordInput id="password" autoComplete="current-password" invalid={!!errors.password}
                describedBy={describedBy('password', errors.password)} {...register('password')} />
            </Field>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />} {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to FinOps? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
