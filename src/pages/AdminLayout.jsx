// src/pages/AdminLayout.jsx
// Standalone shell for the Admin portal — renders instead of AppLayout.
// Has its own header + sidebar + content area.
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import './AdminLayout.css';

const NAV = [
  {
    to: '/admin', end: true,
    label: 'Overview',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/admin/users',
    label: 'User Management',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    to: '/admin/audit',
    label: 'Audit Log',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  },
  {
    to: '/admin/settings',
    label: 'System Settings',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || user?.email?.split('@')[0] || 'Admin';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="adm-shell">

      {/* ── Top header ── */}
      <header className="adm-shell-header">
        <div className="adm-shell-brand">
          <span className="adm-shell-brand-icon"><ShieldIcon /></span>
          <div>
            <div className="adm-shell-brand-name">Admin Portal</div>
            <div className="adm-shell-brand-sub">IT Asset Management</div>
          </div>
        </div>
        <div className="adm-shell-header-right">
          <div className="adm-shell-user">
            <div className="adm-shell-avatar">{initial}</div>
            <div>
              <div className="adm-shell-user-name">{name}</div>
              <div className="adm-shell-user-role">Administrator</div>
            </div>
          </div>
          <button className="adm-shell-back-btn" onClick={() => navigate('/')}>
            <BackIcon /> Back to App
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div className="adm-shell-body">

        {/* ── Left sidebar ── */}
        <aside className="adm-shell-sidebar">
          <p className="adm-shell-nav-label">Menu</p>
          <nav className="adm-shell-nav">
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `adm-shell-nav-item${isActive ? ' adm-shell-nav-item--active' : ''}`
                }
              >
                <span className="adm-shell-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="adm-shell-sidebar-footer">
            <button className="adm-shell-nav-item adm-shell-nav-back" onClick={() => navigate('/')}>
              <span className="adm-shell-nav-icon"><BackIcon /></span>
              <span>Back to App</span>
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="adm-shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
