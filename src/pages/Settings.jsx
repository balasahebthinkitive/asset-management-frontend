// src/pages/Settings.jsx — Asset Panda style
import { useState } from 'react';
import './Settings.css';

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
    return (
        <label className="st-toggle-row">
            <button
                className={`st-toggle${checked ? " on" : ""}`}
                onClick={onChange}
                role="switch"
                aria-checked={checked}
            >
                <span className="st-toggle-thumb" />
            </button>
            {label && <span className="st-toggle-label">{label}</span>}
        </label>
    );
}

// ── Shared: Row ⋮ menu ────────────────────────────────────────────────────────
function RowMenu3({ items }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="am-row-menu-wrap" onBlur={() => setTimeout(() => setOpen(false), 150)}>
            <button className="am-row-menu-btn" onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                </svg>
            </button>
            {open && (
                <div className="am-row-dropdown">
                    {items.map(it => (
                        <button key={it.label} className={`am-row-dd-item${it.danger ? " danger" : ""}`}
                            onClick={() => { it.onClick?.(); setOpen(false); }}>
                            {it.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── New Account Modal ─────────────────────────────────────────────────────────
function NewAccountModal({ onClose, onSave, title = "New account" }) {
    const [form, setForm] = useState({ name:"", email:"", firstName:"", lastName:"" });
    const f = (field, label, placeholder = "", type = "text") => (
        <div className="st-field">
            <label className="st-label">{label}</label>
            <input className="st-input" type={type} placeholder={placeholder}
                value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
        </div>
    );
    return (
        <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="am-modal">
                <div className="am-modal-header">
                    <span className="am-modal-title">{title}</span>
                    <button className="am-modal-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="am-modal-body">
                    {f("name", "Name", "", "text")}
                    <div className="am-invite-section">
                        <div className="am-invite-title">Invite account admin</div>
                        <div className="am-invite-sub">Fill this data to assign a user to be account admin.</div>
                    </div>
                    {f("email",     "Email",      "example@email.com", "email")}
                    {f("firstName", "First name", "")}
                    {f("lastName",  "Last name",  "")}
                </div>
                <div className="am-modal-footer">
                    <button className="st-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="st-btn-primary" onClick={() => { if (!form.name.trim()) return; onSave(form); }}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── New Module Modal ──────────────────────────────────────────────────────────
function NewModuleModal({ parentName, onClose, onSave }) {
    const [name, setName] = useState("");
    return (
        <div className="am-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="am-modal">
                <div className="am-modal-header">
                    <span className="am-modal-title">Add module to "{parentName}"</span>
                    <button className="am-modal-close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="am-modal-body">
                    <div className="st-field">
                        <label className="st-label">Module name</label>
                        <input className="st-input st-input-teal" autoFocus placeholder="e.g. Asset Management"
                            value={name} onChange={e => setName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && name.trim() && onSave(name)} />
                    </div>
                </div>
                <div className="am-modal-footer">
                    <button className="st-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="st-btn-primary" onClick={() => name.trim() && onSave(name)}>Add Module</button>
                </div>
            </div>
        </div>
    );
}

// ── Drag handle SVG ───────────────────────────────────────────────────────────
function DragDots() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="#D1D5DB">
            <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
            <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
            <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
        </svg>
    );
}

// ── Module stats panel ────────────────────────────────────────────────────────
const STAT_ICONS = {
    Collections: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
    ),
    Forms: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
    ),
    Automations: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
        </svg>
    ),
    Users: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
        </svg>
    ),
    Integrations: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 0 1 1.41 14.14M4.93 4.93A10 10 0 0 0 3.52 19.07"/>
        </svg>
    ),
};

function ModuleStats({ stats }) {
    const keys = ["Collections","Forms","Automations","Users","Integrations"];
    return (
        <div className="am-stats-row">
            {keys.map(k => (
                <div key={k} className="am-stat-card">
                    <div className="am-stat-card-top">
                        <span className="am-stat-icon">{STAT_ICONS[k]}</span>
                        <button className="am-stat-manage">Manage</button>
                    </div>
                    <div className="am-stat-count">{stats?.[k] ?? 0}</div>
                    <div className="am-stat-label">{k}</div>
                </div>
            ))}
        </div>
    );
}

// ── Section: Account Management ───────────────────────────────────────────────
const INITIAL_ACCOUNTS = [
    {
        id: 1,
        name: "Thinkitive Technologies",
        expanded: true,
        modules: [
            { id: 101, name: "Asset Management",            expanded: true,  stats:{ Collections:6, Forms:0, Automations:0, Users:1, Integrations:0 } },
            { id: 102, name: "Equipment & Maintenance Tracking", expanded: false, stats:{ Collections:2, Forms:1, Automations:0, Users:3, Integrations:0 } },
            { id: 103, name: "ITAM",                        expanded: false, stats:{ Collections:4, Forms:2, Automations:1, Users:5, Integrations:1 } },
        ],
    },
];

function AccountManagement() {
    const [accounts, setAccounts]             = useState(INITIAL_ACCOUNTS);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [addModuleFor, setAddModuleFor]     = useState(null);

    const toggleAccount = (id) =>
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, expanded: !a.expanded } : a));

    const toggleModule = (accId, modId) =>
        setAccounts(prev => prev.map(a => a.id === accId
            ? { ...a, modules: a.modules.map(m => m.id === modId ? { ...m, expanded: !m.expanded } : m) }
            : a));

    const deleteAccount = (id) => setAccounts(prev => prev.filter(a => a.id !== id));

    const deleteModule = (accId, modId) =>
        setAccounts(prev => prev.map(a => a.id === accId
            ? { ...a, modules: a.modules.filter(m => m.id !== modId) } : a));

    const handleAddAccount = (form) => {
        const newId = Math.max(...accounts.map(a => a.id), 0) + 1;
        setAccounts(prev => [...prev, { id: newId, name: form.name, expanded: true, modules: [] }]);
        setShowAddAccount(false);
    };

    const handleAddModule = (name) => {
        setAccounts(prev => prev.map(a => a.id === addModuleFor
            ? { ...a, modules: [...a.modules, { id: Date.now(), name, expanded: false, stats:{ Collections:0, Forms:0, Automations:0, Users:0, Integrations:0 } }] }
            : a));
        setAddModuleFor(null);
    };

    return (
        <div className="am-page">
            {/* Page header */}
            <div className="am-page-header">
                <div className="am-company-row">
                    <div className="am-company-logo">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <span className="am-company-name">Thinkitive Technologies</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                    <button className="st-btn-primary" onClick={() => setShowAddAccount(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add account
                    </button>
                    <RowMenu3 items={[{ label:"Edit company" }, { label:"Delete", danger:true }]} />
                </div>
            </div>

            {/* Accounts */}
            <div className="am-list">
                {accounts.map(acc => (
                    <div key={acc.id} className="am-account-block">

                        {/* Account header row */}
                        <div className="am-account-row">
                            <span className="am-drag-handle"><DragDots /></span>
                            <button className="am-chevron-btn" onClick={() => toggleAccount(acc.id)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: acc.expanded ? "rotate(0deg)" : "rotate(-90deg)", transition:"transform 0.2s" }}>
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>
                            <span className="am-account-name">{acc.name}</span>
                            <div className="am-account-row-right">
                                <button className="am-add-module-btn" onClick={() => setAddModuleFor(acc.id)}>
                                    Add module
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                </button>
                                <RowMenu3 items={[
                                    { label:"Edit" },
                                    { label:"Add module", onClick:() => setAddModuleFor(acc.id) },
                                    { label:"Delete", danger:true, onClick:() => deleteAccount(acc.id) },
                                ]} />
                            </div>
                        </div>

                        {/* Modules */}
                        {acc.expanded && acc.modules.map(mod => (
                            <div key={mod.id} className="am-module-block">
                                {/* Module row */}
                                <div className="am-module-row" onClick={() => toggleModule(acc.id, mod.id)}>
                                    <span className="am-drag-handle"><DragDots /></span>
                                    <button className="am-chevron-btn">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: mod.expanded ? "rotate(0deg)" : "rotate(-90deg)", transition:"transform 0.2s" }}>
                                            <polyline points="6 9 12 15 18 9"/>
                                        </svg>
                                    </button>
                                    <span className="am-module-name">{mod.name}</span>
                                    <div className="am-account-row-right" onClick={e => e.stopPropagation()}>
                                        <RowMenu3 items={[
                                            { label:"Edit" },
                                            { label:"Delete", danger:true, onClick:() => deleteModule(acc.id, mod.id) },
                                        ]} />
                                    </div>
                                </div>

                                {/* Stats panel (when expanded) */}
                                {mod.expanded && <ModuleStats stats={mod.stats} />}
                            </div>
                        ))}

                        {acc.expanded && acc.modules.length === 0 && (
                            <div className="am-empty-modules">
                                No modules yet —
                                <button className="st-link-btn" onClick={() => setAddModuleFor(acc.id)} style={{ marginLeft:4 }}>Add one</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showAddAccount && (
                <NewAccountModal onClose={() => setShowAddAccount(false)} onSave={handleAddAccount} />
            )}
            {addModuleFor !== null && (
                <NewModuleModal
                    parentName={accounts.find(a => a.id === addModuleFor)?.name || ""}
                    onClose={() => setAddModuleFor(null)}
                    onSave={handleAddModule}
                />
            )}
        </div>
    );
}

// ── Section: Users ────────────────────────────────────────────────────────────
const USERS = [
    { id:1, name:"Balasaheb Kankate", email:"balasaheb.kankate@thinkitive.com", role:"Admin",  status:"Active",   joined:"01/01/2020" },
    { id:2, name:"Dhananjay Kolte",   email:"dhananjay.kolte@thinkitive.com",   role:"Manager",status:"Active",   joined:"15/03/2021" },
    { id:3, name:"Amol Shete",        email:"amol.shete@thinkitive.com",        role:"User",   status:"Active",   joined:"10/06/2022" },
    { id:4, name:"Prachi Karonde",    email:"prachi.karonde@thinkitive.com",    role:"User",   status:"Active",   joined:"26/10/2020" },
    { id:5, name:"Jitendra Muradnar", email:"jitendra.muradnar@thinkitive.com", role:"Manager",status:"Active",   joined:"26/10/2020" },
    { id:6, name:"Nishant Unde",      email:"nishant.unde@thinkitive.com",      role:"User",   status:"Inactive", joined:"09/01/2023" },
];
function Users() {
    const [search, setSearch] = useState("");
    const filtered = USERS.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    return (
        <div className="st-content">
            <div className="st-content-header">
                <h2 className="st-content-title">Users</h2>
                <p className="st-content-sub">Manage who has access to this account</p>
            </div>
            <div className="st-card" style={{ padding: 0 }}>
                <div className="st-tbl-toolbar">
                    <div className="st-search-wrap">
                        <svg className="st-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input className="st-search" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="st-btn-primary">+ Invite User</button>
                </div>
                <table className="st-table">
                    <thead>
                        <tr>
                            <th className="st-th">Name</th>
                            <th className="st-th">Email</th>
                            <th className="st-th">Role</th>
                            <th className="st-th">Status</th>
                            <th className="st-th">Joined</th>
                            <th className="st-th"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u.id} className="st-tr">
                                <td className="st-td"><span className="st-user-name">{u.name}</span></td>
                                <td className="st-td st-muted">{u.email}</td>
                                <td className="st-td">
                                    <span className={`st-role-pill ${u.role.toLowerCase()}`}>{u.role}</span>
                                </td>
                                <td className="st-td">
                                    <span className={`st-status-dot-row${u.status === "Active" ? " active" : ""}`}>
                                        <span className="st-dot" />{u.status}
                                    </span>
                                </td>
                                <td className="st-td st-muted">{u.joined}</td>
                                <td className="st-td st-actions-cell">
                                    <button className="st-link-btn">Edit</button>
                                    <button className="st-link-btn danger">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Section: Roles & Permissions ──────────────────────────────────────────────
const ROLES = [
    { name:"Admin",   desc:"Full access to all settings and data",  users:2, color:"#7C3AED" },
    { name:"Manager", desc:"Can manage assets and users",           users:3, color:"#0D9488" },
    { name:"User",    desc:"Can view and update assigned assets",   users:8, color:"#2878C8" },
    { name:"Viewer",  desc:"Read-only access",                      users:4, color:"#D97706" },
];
function RolesPermissions() {
    return (
        <div className="st-content">
            <div className="st-content-header">
                <h2 className="st-content-title">Roles & Permissions</h2>
                <p className="st-content-sub">Control what each role can do in the system</p>
            </div>
            <div className="st-roles-grid">
                {ROLES.map(r => (
                    <div key={r.name} className="st-role-card">
                        <div className="st-role-card-header" style={{ borderLeftColor: r.color }}>
                            <span className="st-role-card-name" style={{ color: r.color }}>{r.name}</span>
                            <span className="st-role-card-users">{r.users} users</span>
                        </div>
                        <p className="st-role-card-desc">{r.desc}</p>
                        <div className="st-role-card-footer">
                            <button className="st-link-btn">Edit Permissions</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="st-card" style={{ marginTop: 20 }}>
                <div className="st-card-title">Permissions Matrix</div>
                <table className="st-table">
                    <thead>
                        <tr>
                            <th className="st-th">Feature</th>
                            {ROLES.map(r => <th key={r.name} className="st-th" style={{ textAlign:"center" }}>{r.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["View Assets",      true, true,  true,  true ],
                            ["Edit Assets",      true, true,  true,  false],
                            ["Delete Assets",    true, true,  false, false],
                            ["Manage Users",     true, false, false, false],
                            ["View Reports",     true, true,  true,  true ],
                            ["System Settings",  true, false, false, false],
                        ].map(([feat, ...vals]) => (
                            <tr key={feat} className="st-tr">
                                <td className="st-td">{feat}</td>
                                {vals.map((v, i) => (
                                    <td key={i} className="st-td" style={{ textAlign:"center" }}>
                                        {v
                                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Section: Preferences ──────────────────────────────────────────────────────
function Preferences() {
    const [prefs, setPrefs] = useState({
        emailNotifications: true,
        maintenanceAlerts:  true,
        warrantyAlerts:     true,
        assignmentAlerts:   false,
        darkMode:           false,
        compactView:        false,
        autoLogout:         true,
        twoFactor:          false,
    });
    const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }));
    const group = (title, items) => (
        <div className="st-card" style={{ marginBottom: 16 }}>
            <div className="st-card-title">{title}</div>
            {items.map(([key, label, desc]) => (
                <div key={key} className="st-pref-row">
                    <div>
                        <div className="st-pref-label">{label}</div>
                        <div className="st-pref-desc">{desc}</div>
                    </div>
                    <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
                </div>
            ))}
        </div>
    );
    return (
        <div className="st-content">
            <div className="st-content-header">
                <h2 className="st-content-title">Preferences</h2>
                <p className="st-content-sub">Customize your experience</p>
            </div>
            {group("Notifications", [
                ["emailNotifications", "Email Notifications",  "Receive email updates for important events"],
                ["maintenanceAlerts",  "Maintenance Alerts",   "Get notified when assets require maintenance"],
                ["warrantyAlerts",     "Warranty Expiry Alerts","Alert 30 days before warranty expires"],
                ["assignmentAlerts",   "Assignment Alerts",    "Notify when assets are assigned or returned"],
            ])}
            {group("Display", [
                ["darkMode",    "Dark Mode",     "Use dark color theme (coming soon)"],
                ["compactView", "Compact View",  "Reduce spacing in tables and lists"],
            ])}
            {group("Security", [
                ["autoLogout", "Auto Logout",     "Automatically log out after 30 minutes of inactivity"],
                ["twoFactor",  "Two-Factor Auth", "Require 2FA for all logins (coming soon)"],
            ])}
        </div>
    );
}

// ── Section: API Configuration ────────────────────────────────────────────────
function ApiConfiguration() {
    const [key] = useState("th_live_xK9mP2wQrLvNzA8dJcYuFsHe3TbG7i0R");
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);
    const copy = () => { navigator.clipboard?.writeText(key); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="st-content">
            <div className="st-content-header">
                <h2 className="st-content-title">API Configuration</h2>
                <p className="st-content-sub">Manage API keys and integrations</p>
            </div>
            <div className="st-card">
                <div className="st-card-title">API Key</div>
                <p className="st-muted" style={{ fontSize:13, marginBottom:14 }}>Use this key to authenticate API requests. Keep it secret — do not share or expose it publicly.</p>
                <div className="st-api-key-row">
                    <code className="st-api-key">{show ? key : key.replace(/./g,"•").slice(0,40)}</code>
                    <button className="st-icon-btn" onClick={() => setShow(s => !s)} title={show ? "Hide" : "Show"}>
                        {show
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                    </button>
                    <button className="st-icon-btn" onClick={copy} title="Copy">
                        {copied
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        }
                    </button>
                </div>
                <button className="st-btn-danger" style={{ marginTop: 20 }}>Regenerate Key</button>
            </div>
            <div className="st-card" style={{ marginTop: 16 }}>
                <div className="st-card-title">Webhook Endpoints</div>
                <p className="st-muted" style={{ fontSize:13, marginBottom:14 }}>Configure webhooks to receive real-time asset event notifications.</p>
                <button className="st-btn-primary">+ Add Webhook</button>
                <div className="st-empty-state">No webhook endpoints configured yet.</div>
            </div>
        </div>
    );
}

// ── Section: Account Builder (Form Setup) ─────────────────────────────────────
function AccountBuilder() {
    const [step, setStep]           = useState(1);
    const [formName, setFormName]   = useState("New Form");
    const [action, setAction]       = useState("create");   // create | update
    const [forType, setForType]     = useState("single");   // single | multiple
    const [collection, setCollection] = useState("");
    const [pullRecords, setPullRecords]   = useState(false);
    const [allowReceipt, setAllowReceipt] = useState(false);

    const STEPS = ["Setup", "Form build", "Share", "Preview"];

    return (
        <div className="st-content">
            <div className="st-content-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                    <h2 className="st-content-title">Account Builder</h2>
                    <p className="st-content-sub">Forms / New Form</p>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                    <button className="st-btn-ghost">Cancel</button>
                    <button className="st-btn-primary" onClick={() => setStep(s => Math.min(s + 1, 4))}>
                        Save &amp; continue →
                    </button>
                </div>
            </div>

            {/* Step tabs */}
            <div className="st-step-tabs">
                {STEPS.map((s, i) => (
                    <button
                        key={i}
                        className={`st-step-tab${step === i + 1 ? " active" : ""}${step > i + 1 ? " done" : ""}`}
                        onClick={() => setStep(i + 1)}
                    >
                        <span className="st-step-num">{i + 1}.</span> {s}
                    </button>
                ))}
            </div>

            {/* Step 1: Setup */}
            {step === 1 && (
                <div className="st-form-setup-card">
                    <h3 className="st-form-setup-title">Form setup</h3>

                    <div className="st-field">
                        <label className="st-label">Form name</label>
                        <input className="st-input st-input-teal" value={formName} onChange={e => setFormName(e.target.value)} />
                    </div>

                    <div className="st-field" style={{ marginTop: 20 }}>
                        <label className="st-label">This form will</label>
                        <div className="st-option-group">
                            <button className={`st-option-btn${action === "create" ? " active" : ""}`} onClick={() => setAction("create")}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                                </svg>
                                Create records
                            </button>
                            <button className={`st-option-btn${action === "update" ? " active" : ""}`} onClick={() => setAction("update")}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                </svg>
                                Update records
                            </button>
                        </div>
                    </div>

                    <div className="st-field" style={{ marginTop: 20 }}>
                        <label className="st-label">For</label>
                        <div className="st-option-group">
                            <button className={`st-option-btn${forType === "single" ? " active" : ""}`} onClick={() => setForType("single")}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                </svg>
                                Single record
                            </button>
                            <button className={`st-option-btn${forType === "multiple" ? " active" : ""}`} onClick={() => setForType("multiple")}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                    <line x1="3" y1="6" x2="1" y2="6"/><line x1="3" y1="10" x2="1" y2="10"/>
                                </svg>
                                Multiple records
                            </button>
                        </div>
                    </div>

                    <div className="st-field" style={{ marginTop: 20 }}>
                        <label className="st-label">In this collection</label>
                        <div className="st-select-wrap">
                            <select className="st-input" value={collection} onChange={e => setCollection(e.target.value)}>
                                <option value="">— select collection —</option>
                                <option value="laptops">Laptops</option>
                                <option value="mobiles">Mobiles & Tablets</option>
                                <option value="ram">RAM Modules</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                    </div>

                    <div className="st-toggle-group">
                        <Toggle checked={pullRecords} onChange={() => setPullRecords(v => !v)} label="Pull records from another collection" />
                        <Toggle checked={allowReceipt} onChange={() => setAllowReceipt(v => !v)} label="Allow receipt of responses after submission" />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="st-form-setup-card">
                    <h3 className="st-form-setup-title">Form build</h3>
                    <p className="st-muted" style={{ fontSize:13 }}>Drag and drop fields to build your form. This section will be configured in the next release.</p>
                    <div className="st-placeholder-area">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/>
                        </svg>
                        <p style={{ color:"#9CA3AF", marginTop:8 }}>Form builder coming soon</p>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="st-form-setup-card">
                    <h3 className="st-form-setup-title">Share</h3>
                    <div className="st-field">
                        <label className="st-label">Form URL</label>
                        <div className="st-api-key-row">
                            <code className="st-api-key" style={{ fontSize:12 }}>https://assets.thinkitive.com/forms/{formName.toLowerCase().replace(/\s+/g,"-")}</code>
                        </div>
                    </div>
                    <p className="st-muted" style={{ fontSize:13, marginTop:12 }}>Share this link with users to allow them to submit the form.</p>
                </div>
            )}

            {step === 4 && (
                <div className="st-form-setup-card">
                    <h3 className="st-form-setup-title">Preview — {formName}</h3>
                    <div className="st-preview-form">
                        <div className="st-field"><label className="st-label">Asset Name *</label><input className="st-input" placeholder="Enter asset name" /></div>
                        <div className="st-field"><label className="st-label">Asset Type</label><input className="st-input" placeholder="e.g. Laptop, Mobile" /></div>
                        <div className="st-field"><label className="st-label">Serial No</label><input className="st-input" placeholder="Serial number" /></div>
                        <div className="st-field"><label className="st-label">Assigned To</label><input className="st-input" placeholder="Employee name" /></div>
                        <button className="st-btn-primary" style={{ width:"100%", marginTop:8 }}>Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Section: Templates ────────────────────────────────────────────────────────
const TEMPLATES = [
    { name:"IT Asset Checkin",     desc:"Form for checking in returned IT assets",     icon:"📥", color:"#0D9488" },
    { name:"IT Asset Checkout",    desc:"Form for issuing assets to employees",        icon:"📤", color:"#2878C8" },
    { name:"Maintenance Request",  desc:"Submit a maintenance request for an asset",   icon:"🔧", color:"#D97706" },
    { name:"Asset Disposal",       desc:"Mark an asset for disposal or write-off",    icon:"🗑️", color:"#DC2626" },
    { name:"New Asset Registration",desc:"Register a brand-new asset in the system",  icon:"➕", color:"#7C3AED" },
    { name:"Transfer Request",     desc:"Transfer asset ownership between departments",icon:"🔄", color:"#059669" },
];
function Templates() {
    return (
        <div className="st-content">
            <div className="st-content-header">
                <h2 className="st-content-title">Templates</h2>
                <p className="st-content-sub">Ready-to-use form templates for common asset workflows</p>
            </div>
            <div className="st-templates-grid">
                {TEMPLATES.map(t => (
                    <div key={t.name} className="st-template-card">
                        <div className="st-template-icon" style={{ background: `${t.color}18`, color: t.color }}>{t.icon}</div>
                        <div className="st-template-name">{t.name}</div>
                        <div className="st-template-desc">{t.desc}</div>
                        <button className="st-btn-primary" style={{ width:"100%", marginTop:"auto" }}>Use Template</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { key:"account",     label:"Account management",  component: AccountManagement },
    { key:"users",       label:"Users",               component: Users },
    { key:"roles",       label:"Roles & permissions", component: RolesPermissions },
    { key:"preferences", label:"Preferences",         component: Preferences },
    { key:"api",         label:"API configuration",   component: ApiConfiguration },
    { key:"builder",     label:"Account builder",     component: AccountBuilder },
    { key:"templates",   label:"Templates",           component: Templates },
];

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
    const [active, setActive] = useState("account");
    const ActiveComp = NAV_ITEMS.find(n => n.key === active)?.component || AccountManagement;

    return (
        <div className="st-page">
            {/* Left settings nav */}
            <aside className="st-sidebar">
                <div className="st-sidebar-title">Settings</div>
                <nav className="st-sidebar-nav">
                    {NAV_ITEMS.map(n => (
                        <button
                            key={n.key}
                            className={`st-nav-item${active === n.key ? " active" : ""}`}
                            onClick={() => setActive(n.key)}
                        >
                            <span className={`st-nav-dot${active === n.key ? " active" : ""}`} />
                            {n.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Right content pane */}
            <div className="st-main">
                <ActiveComp />
            </div>
        </div>
    );
}
