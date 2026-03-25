// src/pages/AdminOverview.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPeople } from '../api/people';
import PEOPLE_STATIC from '../data/peopleData';
import { AUDIT_LOG, LOCATIONS, ROLE_META } from '../data/adminData';
import './adminShared.css';

const IcoUsers    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoShield   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoAlert    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoLocation = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoClock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export default function AdminOverview() {
  const navigate = useNavigate();
  const [people, setPeople] = useState(PEOPLE_STATIC);

  const load = useCallback(async () => {
    try {
      const res = await getPeople();
      const items = res.data?.people ?? res.data ?? [];
      if (Array.isArray(items) && items.length) setPeople(items);
    } catch { /* use static */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const admins   = people.filter(p => p.role === 'admin').length;
  const managers = people.filter(p => p.role === 'manager').length;
  const active   = people.filter(p => p.status === 'Active').length;
  const inactive = people.filter(p => p.status === 'Inactive').length;

  const kpis = [
    { label: 'Total Users',    value: people.length, sub: `${active} active · ${inactive} inactive`, color: '#2878C8', bg: '#EBF4FF', icon: <IcoUsers /> },
    { label: 'Admins',         value: admins,         sub: `${managers} managers`,                    color: '#7C3AED', bg: '#F5F3FF', icon: <IcoShield /> },
    { label: 'Inactive Users', value: inactive,        sub: 'Require attention',                      color: '#DC2626', bg: '#FEF2F2', icon: <IcoAlert /> },
    { label: 'Locations',      value: LOCATIONS.length,sub: LOCATIONS.map(l => l.key).join(' · '),   color: '#059669', bg: '#ECFDF5', icon: <IcoLocation /> },
  ];

  return (
    <div>
      <h1 className="adm-section-title">Overview</h1>
      <p className="adm-section-sub">Summary of users, locations and recent system activity.</p>

      {/* KPI cards */}
      <div className="adm-kpi-grid">
        {kpis.map(k => (
          <div key={k.label} className="adm-kpi-card" style={{ borderTopColor: k.color, color: k.color }}>
            <div className="adm-kpi-inner">
              <div>
                <div className="adm-kpi-lbl">{k.label}</div>
                <div className="adm-kpi-val">{k.value}</div>
                <div className="adm-kpi-sub">{k.sub}</div>
              </div>
              <div className="adm-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="adm-quick-links">
        <button className="adm-ql-btn" onClick={() => navigate('/admin/users')}>
          <IcoUsers /> Manage Users
        </button>
        <button className="adm-ql-btn" onClick={() => navigate('/admin/audit')}>
          Audit Log →
        </button>
        <button className="adm-ql-btn" onClick={() => navigate('/admin/settings')}>
          System Settings →
        </button>
        <button className="adm-ql-btn" onClick={() => navigate('/people')}>
          People page →
        </button>
        <button className="adm-ql-btn" onClick={() => navigate('/tickets')}>
          Tickets →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Recent activity */}
        <div className="adm-card">
          <div className="adm-card-title">Recent activity</div>
          <div className="adm-timeline">
            {AUDIT_LOG.slice(0, 6).map(e => (
              <div key={e.id} className="adm-tl-row">
                <div className="adm-tl-dot" style={{ background: e.color }} />
                <div className="adm-tl-body">
                  <div className="adm-tl-action">{e.action}</div>
                  <div className="adm-tl-detail">{e.detail}</div>
                </div>
                <div className="adm-tl-time"><IcoClock /> {e.time.split(' ')[1]}</div>
              </div>
            ))}
          </div>
          <button className="adm-btn-ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/admin/audit')}>
            View full audit log →
          </button>
        </div>

        {/* Role distribution */}
        <div className="adm-card">
          <div className="adm-card-title">Role distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
            {Object.entries(ROLE_META).map(([role, meta]) => {
              const cnt = people.filter(p => p.role === role).length;
              const pct = people.length > 0 ? Math.round((cnt / people.length) * 100) : 0;
              return (
                <div key={role} className="adm-role-row">
                  <span className="adm-badge" style={{ background: meta.bg, color: meta.color, minWidth: 66 }}>{meta.label}</span>
                  <div className="adm-role-bar-bg">
                    <div className="adm-role-bar-fill" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                  <span className="adm-role-bar-val" style={{ color: meta.color }}>
                    {cnt} <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="adm-card-title">Locations</div>
          {LOCATIONS.map(loc => {
            const cnt = people.filter(p => p.location === loc.key).length;
            const pct = people.length > 0 ? Math.round((cnt / people.length) * 100) : 0;
            return (
              <div key={loc.key} className="adm-loc-card-row">
                <div className="adm-loc-badge" style={{ background: loc.bg, color: loc.color }}>
                  <IcoLocation />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{loc.key}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: loc.color }}>{cnt} users ({pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--clr-border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: loc.color, borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
