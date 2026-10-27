import { useAuth } from './useAuth.js';

/** Reads the permission map returned by /api/auth/login (the `interface` object). UX only; the backend enforces. */
export function usePermission(name) {
  const { permissions } = useAuth();
  return permissions?.[name] === true;
}
