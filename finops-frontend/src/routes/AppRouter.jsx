import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import InsightsPage from '../pages/InsightsPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RecordsPage from '../pages/RecordsPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import UsersPage from '../pages/UsersPage.jsx';
import PermissionRoute from './PermissionRoute.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route element={<PermissionRoute permission="can_view_dashboard" />}><Route path="/dashboard" element={<DashboardPage />} /></Route>
          <Route element={<PermissionRoute permission="can_view_records" />}><Route path="/records" element={<RecordsPage />} /></Route>
          <Route element={<PermissionRoute permission="can_view_insights" />}><Route path="/insights" element={<InsightsPage />} /></Route>
          <Route element={<PermissionRoute permission="can_manage_users" />}><Route path="/users" element={<UsersPage />} /></Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
