import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BarChart3, LayoutDashboard, LogOut, ReceiptText, UserRound, Users, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import BrandMark from '../common/BrandMark.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'can_view_dashboard' },
  { to: '/records', label: 'Financial Records', icon: ReceiptText, permission: 'can_view_records' },
  { to: '/insights', label: 'Insights', icon: BarChart3, permission: 'can_view_insights' },
  { to: '/users', label: 'User Management', icon: Users, permission: 'can_manage_users' },
];

export default function Sidebar({ open, onClose }) {
  const { permissions, user, logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'}`;

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        id="app-sidebar"
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <BrandMark />
          <button type="button" className="icon-btn lg:hidden" onClick={onClose} aria-label="Close navigation"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.filter((n) => permissions?.[n.permission] === true).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={link}>
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><UserRound className="h-4 w-4" aria-hidden="true" /></span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{user?.full_name || user?.username}</span>
              <span className="block truncate text-xs text-slate-500">@{user?.username}</span>
            </span>
          </Link>
          <button type="button" onClick={logout} className="btn-ghost mt-1 w-full justify-start px-3">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
