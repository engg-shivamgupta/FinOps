import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, UserRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { formatLongDate } from '../../utils/date.js';
import { RoleBadge } from '../common/Badges.jsx';

const TITLES = { '/dashboard': 'Dashboard', '/records': 'Financial Records', '/insights': 'Insights', '/users': 'User Management', '/profile': 'My Account' };

export default function Topbar({ onMenu, menuOpen }) {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
      <button type="button" className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="app-sidebar">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{TITLES[pathname] || 'FinOps'}</p>
        <p className="hidden truncate text-xs text-slate-500 sm:block">{formatLongDate()}</p>
      </div>
      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
          <span className="hidden max-w-[160px] truncate text-sm font-medium sm:block">{user?.full_name || user?.username}</span>
          <RoleBadge role={role} />
          <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
        </button>
        {open && (
          <div role="menu" className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <Link role="menuitem" to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
              <UserRound className="h-4 w-4" aria-hidden="true" /> My account
            </Link>
            <button role="menuitem" type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
