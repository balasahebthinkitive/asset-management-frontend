// src/pages/AdminAudit.jsx
import { useState } from 'react';
import { AUDIT_LOG } from '../data/adminData';
import './adminShared.css';

const IcoClock  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const TYPE_COLORS = {
  user:   '#7C3AED',
  asset:  '#2878C8',
  system: '#D97706',
};

const TYPE_LABELS = {
  user:   'User',
  asset:  'Asset',
  system: 'System',
};

export default function AdminAudit() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = AUDIT_LOG.filter(e => {
    const matchType = filter === 'all' || e.type === filter;
    const q = search.toLowerCase();
    const matchQ = !q || e.action.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  return (
    <div>
      <h1 className="adm-section-title">Audit Log</h1>
      <p className="adm-section-sub">Track all user, asset and system events across the platform.</p>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-search-wrap" style={{ maxWidth: 340 }}>
          <span className="adm-search-icon"><IcoSearch /></span>
          <input
            className="adm-search"
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'user', 'asset', 'system'].map(f => (
            <button
              key={f}
              className={`adm-filter-pill${filter === f ? ' adm-filter-pill--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-timeline">
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '28px 0', margin: 0 }}>
              No events match your filter.
            </p>
          )}
          {filtered.map(e => {
            const typeColor = TYPE_COLORS[e.type] || '#6B7280';
            const typeLabel = TYPE_LABELS[e.type] || e.type;
            return (
              <div key={e.id} className="adm-tl-row">
                <div className="adm-tl-dot" style={{ background: e.color }} />
                <div className="adm-tl-body">
                  <div className="adm-tl-action">
                    {e.action}
                    <span className="adm-badge" style={{
                      marginLeft: 8,
                      background: typeColor + '18',
                      color: typeColor,
                      fontSize: 10,
                      padding: '1px 7px',
                    }}>
                      {typeLabel}
                    </span>
                  </div>
                  <div className="adm-tl-detail">{e.detail}</div>
                </div>
                <div className="adm-tl-time">
                  <IcoClock />
                  <div style={{ textAlign: 'right' }}>
                    <div>{e.time.split(' ')[1]}</div>
                    <div style={{ fontSize: 10.5 }}>{e.time.split(' ')[0]}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--clr-text-muted)', textAlign: 'right' }}>
          {filtered.length} of {AUDIT_LOG.length} events
        </div>
      </div>
    </div>
  );
}
