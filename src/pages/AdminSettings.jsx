// src/pages/AdminSettings.jsx
import { useState } from 'react';
import { LOCATIONS, DEFAULT_SETTINGS } from '../data/adminData';
import './adminShared.css';

const IcoLocation = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

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

export default function AdminSettings() {
  const [cfg, setCfg]   = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setCfg(prev => ({ ...prev, [k]: v })); setSaved(false); };

  const handleSave = () => {
    // In production: POST /admin/settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h1 className="adm-section-title">System Settings</h1>
        <p className="adm-section-sub">Configure company details, office locations and platform behaviour.</p>
      </div>

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
              {LOCATIONS.map(l => <option key={l.key} value={l.key}>{l.key} — {l.label}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-label">Low stock threshold</label>
            <input className="adm-input" type="number" min="1" max="50"
              value={cfg.lowStockThreshold}
              onChange={e => set('lowStockThreshold', e.target.value)} />
            <span style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>
              Alert when any category falls below this count
            </span>
          </div>
        </div>
      </div>

      {/* Office locations */}
      <div className="adm-card">
        <div className="adm-card-title">Office locations</div>
        {LOCATIONS.map(loc => (
          <div key={loc.key} className="adm-loc-card-row">
            <div className="adm-loc-badge" style={{ background: loc.bg, color: loc.color }}>
              <IcoLocation />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: loc.color }}>{loc.key}</div>
              <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 1 }}>{loc.address}</div>
            </div>
            <span className="adm-badge" style={{ background: loc.bg, color: loc.color }}>Active</span>
          </div>
        ))}
        <p style={{ margin: '12px 0 0', fontSize: 11.5, color: 'var(--clr-text-muted)' }}>
          Contact your system administrator to add or remove office locations.
        </p>
      </div>

      {/* Notification / automation toggles */}
      <div className="adm-card">
        <div className="adm-card-title">Notifications &amp; automation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { key: 'emailNotifications', label: 'Email notifications',  desc: 'Send email alerts for asset assignments and status changes' },
            { key: 'autoBackup',         label: 'Automatic backups',     desc: 'Run nightly backup of all asset and user data' },
            { key: 'maintenanceAlerts',  label: 'Maintenance alerts',    desc: 'Notify IT team when assets are flagged for maintenance' },
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

      {/* Save row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
        {saved && (
          <span className="adm-saved-msg">
            <IcoCheck /> Settings saved
          </span>
        )}
        <button className="adm-btn-primary" onClick={handleSave}>Save settings</button>
      </div>
    </div>
  );
}
