import { Outlet } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission.js';
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx';

export default function PermissionRoute({ permission }) {
  const allowed = usePermission(permission);
  return allowed ? <Outlet /> : <AccessDeniedPage />;
}
