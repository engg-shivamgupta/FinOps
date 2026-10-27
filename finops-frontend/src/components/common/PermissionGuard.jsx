import { usePermission } from '../../hooks/usePermission.js';

/** Renders children only when the permission is granted. Cosmetic only; the API enforces access. */
export default function PermissionGuard({ permission, children, fallback = null }) {
  const allowed = usePermission(permission);
  return allowed ? children : fallback;
}
