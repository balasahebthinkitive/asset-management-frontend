// src/pages/Admin.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import { useAuth } from '../auth';
import { getPeople, updatePerson } from '../api/people';
import PEOPLE_STATIC from '../data/peopleData';
import './Admin.css';

// ── Icons ──────────────────────────────────────────────────
const Icons = {
  shield:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  users:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  log:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  gear:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.41 14.14M4.93 4.93A10 10 0 0 0 3.52 19.07"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  user:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  box:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  alert:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  location:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  back:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
};

// ── Mock audit log ─────────────────────────────────────────
const AUDIT_LOG = [
  { id: 1,  type: 'user',   action: 'User role updated',          detail: 'admin changed role of Priya Sharma to manager',    time: '2026-03-24 10:32', icon: 'user',   color: '#7C3AED' },
  { id: 2,  type: 'asset',  action: 'Laptop added',               detail: 'Laptop #LP-041 (Dell XPS 15) added to inventory', time: '2026-03-24 09:55', icon: 'box',    color: '#2878C8' },
  { id: 3,  type: 'asset',  action: 'Asset assigned',             detail: 'Mouse #MS-022 assigned to Rohan Mehta (ABIL)',     time: '2026-03-24 09:30', icon: 'check',  color: '#059669' },
  { id: 4,  type: 'user',   action: 'New user created',           detail: 'Neha Singh added with role: user',                 time: '2026-03-23 17:10', icon: 'user',   color: '#7C3AED' },
  { id: 5,  type: 'system', action: 'System settings updated',    detail: 'Location AMBROSIA address updated',               time: '2026-03-23 15:45', icon: 'gear',   color: '#D97706' },
  { id: 6,  type: 'asset',  action: 'Asset status changed',       detail: 'Monitor #MN-007 marked as Maintenance',           time: '2026-03-23 14:20', icon: 'alert',  color: '#D97706' },
  { id: 7,  type: 'asset',  action: 'Asset deleted',              detail: 'Pendrive #PD-003 removed from inventory',         time: '2026-03-23 11:05', icon: 'alert',  color: '#DC2626' },
  { id: 8,  type: 'user',   action: 'User status changed',        detail: 'Amit Joshi status changed to Inactive',           time: '2026-03-22 16:50', icon: 'user',   color: '#6B7280' },
  { id: 9,  type: 'asset',  action: 'Bulk import completed',      detail: '12 RAM modules imported from CSV',                time: '2026-03-22 10:00', icon: 'box',    color: '#2878C8' },
  { id: 10, type: 'system', action: 'Backup completed',           detail: 'Scheduled backup completed successfully',          time: '2026-03-21 02:00', icon: 'check',  color: '#059669' },
];

// ── System config state ────────────────────────────────────
const DEFAULT_SETTINGS = {
  companyName: 'Techvantage',
  companyEmail: 'it@techvantage.in',
  defaultLocation: 'ABIL',
  lowStockThreshold: '5',
  emailNotifications: true,
  autoBackup: true,
  maintenanceAlerts: true,
};

const LOCATIONS = [
  { key: 'ABIL',     address: 'ABIL Tech Park, Pune',      color: '#2878C8', bg: '#EBF4FF' },
  { key: 'TEERTH',   address: 'Teerth Technospace, Pune',  color: '#059669', bg: '#ECFDF5' },
  { key: 'AMBROSIA', address: 'Ambrosia IT Park, Pune',    color: '#7C3AED', bg: '#F5F3FF' },
];

const ROLE_META = {
  admin:   { label: 'Admin',   bg: '#F5F3FF', color: '#7C3AED' },
  manager: { label: 'Manager', bg: '#FEF3E2', color: '#D97706' },
  user:    { label: 'User',    bg: '#F0F9FF', color: '#0369A1' },
};
const STATUS_META = {
  Active:    { bg: '#ECFDF5', color: '#059669' },
  Inactive:  { bg: '#FEF2F2', color: '#DC2626' },
  'On Leave':{ bg: '#FEF3E2', color: '#D97706' },
};

// ── Sub-components ─────────────────────────────────────────
function Badge({ text, bg, color }) {
  return (
    <span className="adm-badge" style={{ background: bg, color }}>{text}</span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      className={`adm-toggle${checked ? ' adm-toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="adm-toggle-thumb" />
    </button>
  );
}

// ── Overview Tab ───────────────────────────────────────────
function OverviewTab({ people }) {
  const navigate = useNavigate();
  const admins   = people.filter(p => p.role === 'admin').length;
  const managers = people.filter(p => p.role === 'manager').length;
  const active   = people.filter(p => p.status === 'Active').length;
  const inactive = people.filter(p => p.status === 'Inactive').length;

  const kpis = [
    { label: 'Total Users',     value: people.length,   sub: `${active} active`,         color: '#2878C8', bg: '#EBF4FF', icon: Icons.users  },
    { label: 'Admins',          value: admins,           sub: `${managers} managers`,      color: '#7C3AED', bg: '#F5F3FF', icon: Icons.shield },
    { label: 'Inactive Users',  value: inactive,         sub: 'Require attention',         color: '#DC2626', bg: '#FEF2F2', icon: Icons.alert  },
    { label: 'Locations',       value: LOCATIONS.length, sub: 'ABIL · TEERTH · AMBROSIA', color: '#059669', bg: '#ECFDF5', icon: Icons.location},
  ];

  return (
    <div>
      {/* KPI cards */}
      <div className="adm-kpi-grid">
        {kpis.map(k => (
          <div key={k.label} className="adm-kpi-card" style={{ borderTopColor: k.color }}>
            <div className="adm-kpi-inner">
              <div>
                <div className="adm-kpi-label">{k.label}</div>
                <div className="adm-kpi-value" style={{ color: k.color }}>{k.value}</div>
                <div className="adm-kpi-sub">{k.sub}</div>
              </div>
              <div className="adm-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="adm-quick-links">
        <button className="adm-ql-btn" onClick={() => navigate('/people')}>
          {Icons.users} Manage People
        </button>
        <button className="adm-ql-btn" onClick={() => navigate('/tickets')}>
          {Icons.log} View Tickets
        </button>
        <button className="adm-ql-btn" onClick={() => navigate('/settings')}>
          {Icons.gear} App Settings
        </button>
        <button className="adm-ql-btn" onClick={() => navigate('/dashboard-management')}>
          {Icons.box} Dashboard Config
        </button>
      </div>

      {/* Recent audit log preview */}
      <div className="adm-card">
        <div className="adm-card-title">Recent activity</div>
        <div className="adm-timeline">
          {AUDIT_LOG.slice(0, 5).map(e => (
            <div key={e.id} className="adm-tl-row">
              <div className="adm-tl-dot" style={{ background: e.color }}>
                {Icons[e.icon] || Icons.check}
              </div>
              <div className="adm-tl-body">
                <div className="adm-tl-action">{e.action}</div>
                <div className="adm-tl-detail">{e.detail}</div>
              </div>
              <div className="adm-tl-time">{Icons.clock} {e.time.split(' ')[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Role distribution */}
      <div className="adm-card" style={{ marginTop: 12 }}>
        <div className="adm-card-title">User role distribution</div>
        <div className="adm-role-bars">
          {Object.entries(ROLE_META).map(([role, meta]) => {
            const cnt = people.filter(p => p.role === role).length;
            const pct = people.length > 0 ? Math.round((cnt / people.length) * 100) : 0;
            return (
              <div key={role} className="adm-role-bar-row">
                <Badge text={meta.label} bg={meta.bg} color={meta.color} />
                <div className="adm-role-bar-bg">
                  <div className="adm-role-bar-fill" style={{ width: `${pct}%`, background: meta.color }} />
                </div>
                <span className="adm-role-bar-val">{cnt} <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── User Management Tab ────────────────────────────────────
function UserMgmtTab({ people, onRoleChange, onStatusChange, saving }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = people.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
    const matchR = roleFilter === 'all' || p.role === roleFilter;
    return matchQ && matchR;
  });

  return (
    <div>
      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <svg className="adm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="adm-search"
            placeholder="Search by name, email, department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="adm-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Location</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="adm-empty">No users match your filter.</td></tr>
            )}
            {filtered.map(p => {
              const rm = ROLE_META[p.role]   || ROLE_META.user;
              const sm = STATUS_META[p.status] || { bg: '#F3F4F6', color: '#6B7280' };
              const locColor = LOCATIONS.find(l => l.key === p.location)?.color || '#6B7280';
              return (
                <tr key={p.id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar" style={{ background: rm.bg, color: rm.color }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="adm-user-name">{p.name}</div>
                        <div className="adm-user-desg">{p.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="adm-td-muted">{p.email}</td>
                  <td className="adm-td-muted">{p.department}</td>
                  <td>
                    <span className="adm-loc-tag" style={{ color: locColor }}>
                      {Icons.location} {p.location}
                    </span>
                  </td>
                  <td>
                    <select
                      className="adm-inline-select"
                      value={p.role}
                      disabled={saving}
                      onChange={e => onRoleChange(p.id, e.target.value)}
                      style={{ background: rm.bg, color: rm.color, borderColor: rm.color + '44' }}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="user">User</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="adm-inline-select"
                      value={p.status}
                      disabled={saving}
                      onChange={e => onStatusChange(p.id, e.target.value)}
                      style={{ background: sm.bg, color: sm.color, borderColor: sm.color + '44' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="adm-table-foot">{filtered.length} of {people.length} users</div>
    </div>
  );
}

// ── Audit Log Tab ──────────────────────────────────────────
function AuditLogTab() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? AUDIT_LOG : AUDIT_LOG.filter(e => e.type === filter);

  return (
    <div>
      <div className="adm-toolbar">
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'user', 'asset', 'system'].map(f => (
            <button
              key={f}
              className={`adm-filter-btn${filter === f ? ' adm-filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-timeline adm-timeline--full">
          {filtered.map(e => (
            <div key={e.id} className="adm-tl-row">
              <div className="adm-tl-dot" style={{ background: e.color }}>
                {Icons[e.icon] || Icons.check}
              </div>
              <div className="adm-tl-body">
                <div className="adm-tl-action">{e.action}</div>
                <div className="adm-tl-detail">{e.detail}</div>
              </div>
              <div className="adm-tl-time" style={{ whiteSpace: 'nowrap' }}>
                {Icons.clock} {e.time}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '24px 0', margin: 0 }}>
              No events for this filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── System Settings Tab ────────────────────────────────────
function SystemSettingsTab() {
  const [cfg, setCfg] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setCfg(prev => ({ ...prev, [k]: v })); setSaved(false); };

  const handleSave = () => {
    // In production: call API to persist settings
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Company info */}
      <div className="adm-card">
        <div className="adm-card-title">Company information</div>
        <div className="adm-form-grid">
          <div className="adm-form-group">
            <label className="adm-label">Company name</label>
            <input className="adm-input" value={cfg.companyName} onChange={e => set('companyName', e.target.value)} />
          </div>
          <div className="adm-form-group">
            <label className="adm-label">IT contact email</label>
            <input className="adm-input" type="email" value={cfg.companyEmail} onChange={e => set('companyEmail', e.target.value)} />
          </div>
          <div className="adm-form-group">
            <label className="adm-label">Default location</label>
            <select className="adm-input" value={cfg.defaultLocation} onChange={e => set('defaultLocation', e.target.value)}>
              {LOCATIONS.map(l => <option key={l.key} value={l.key}>{l.key}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-label">Low stock threshold</label>
            <input className="adm-input" type="number" min="1" value={cfg.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Office locations */}
      <div className="adm-card">
        <div className="adm-card-title">Office locations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LOCATIONS.map(loc => (
            <div key={loc.key} className="adm-loc-row">
              <div className="adm-loc-badge" style={{ background: loc.bg, color: loc.color }}>
                {Icons.location}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: loc.color }}>{loc.key}</div>
                <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{loc.address}</div>
              </div>
              <span className="adm-badge" style={{ background: loc.bg, color: loc.color }}>Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification settings */}
      <div className="adm-card">
        <div className="adm-card-title">Notification & automation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'emailNotifications', label: 'Email notifications',   desc: 'Send email alerts for asset assignments and status changes' },
            { key: 'autoBackup',         label: 'Automatic backups',      desc: 'Run nightly backup of all asset and user data' },
            { key: 'maintenanceAlerts',  label: 'Maintenance alerts',     desc: 'Alert IT team when assets are flagged for maintenance' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="adm-toggle-row">
              <div>
                <div className="adm-toggle-label">{label}</div>
                <div className="adm-toggle-desc">{desc}</div>
              </div>
              <Toggle checked={cfg[key]} onChange={v => set(key, v)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {saved && <span className="adm-saved-msg">{Icons.check} Settings saved</span>}
        <button className="adm-save-btn" onClick={handleSave}>Save settings</button>
      </div>
    </div>
  );
}

// ── Main Admin Component ───────────────────────────────────
const TABS = [
  { key: 'overview',  label: 'Overview',        icon: Icons.shield  },
  { key: 'users',     label: 'User Management', icon: Icons.users   },
  { key: 'audit',     label: 'Audit Log',        icon: Icons.log     },
  { key: 'settings',  label: 'System Settings',  icon: Icons.gear    },
];

export default function Admin() {
  const { isAdmin } = usePermission();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [people, setPeople] = useState(PEOPLE_STATIC);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getPeople();
      const items = res.data?.people ?? res.data ?? [];
      if (Array.isArray(items) && items.length) setPeople(items);
    } catch { /* use static */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Guard — non-admins see a 403 panel
  if (!isAdmin) {
    return (
      <div className="adm-forbidden">
        <div className="adm-forbidden-icon">{Icons.shield}</div>
        <h2>Admin access only</h2>
        <p>You need an <strong>admin</strong> role to access this section. Contact your IT administrator.</p>
        <button className="adm-save-btn" onClick={() => navigate('/')}>
          {Icons.back} Back to Dashboard
        </button>
      </div>
    );
  }

  const handleRoleChange = async (id, role) => {
    setSaving(true);
    try {
      await updatePerson(id, { role });
      setPeople(prev => prev.map(p => p.id === id ? { ...p, role } : p));
    } catch {
      setPeople(prev => prev.map(p => p.id === id ? { ...p, role } : p)); // optimistic
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    setSaving(true);
    try {
      await updatePerson(id, { status });
      setPeople(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch {
      setPeople(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } finally { setSaving(false); }
  };

  const name = user?.name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="adm-page">
      {/* Header */}
      <div className="adm-header">
        <div>
          <div className="adm-header-tag">
            <span className="adm-shield-dot">{Icons.shield}</span>
            Admin Portal
          </div>
          <h1 className="adm-title">Administration</h1>
          <p className="adm-subtitle">Logged in as <strong>{name}</strong> · Full system access</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="adm-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`adm-tab${tab === t.key ? ' adm-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="adm-tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="adm-content">
        {tab === 'overview' && <OverviewTab people={people} />}
        {tab === 'users'    && <UserMgmtTab people={people} onRoleChange={handleRoleChange} onStatusChange={handleStatusChange} saving={saving} />}
        {tab === 'audit'    && <AuditLogTab />}
        {tab === 'settings' && <SystemSettingsTab />}
      </div>
    </div>
  );
}
