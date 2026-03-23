// src/pages/DashboardManagement.jsx — Asset Panda style
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardManagement.css';

const INITIAL_DASHBOARDS = [
    {
        id: 1,
        name: "Asset Management Overview",
        description: "Dashboard for Asset Management Overview",
        account: "Thinkitive Technologies",
        starred: true,
        enabled: true,
    },
    {
        id: 2,
        name: "IT Assets Overview",
        description: "Tracks all IT hardware including laptops, mobiles and RAM",
        account: "Thinkitive Technologies",
        starred: false,
        enabled: false,
    },
    {
        id: 3,
        name: "Available Assets Report",
        description: "Shows all currently available and unassigned assets",
        account: "Thinkitive Technologies",
        starred: false,
        enabled: true,
    },
];

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
    return (
        <button
            className={`dm-toggle${checked ? " on" : ""}`}
            onClick={onChange}
            aria-checked={checked}
            role="switch"
        >
            <span className="dm-toggle-thumb" />
        </button>
    );
}

// ── Star button ───────────────────────────────────────────────────────────────
function StarBtn({ active, onClick }) {
    return (
        <button className={`dm-star${active ? " active" : ""}`} onClick={onClick} title={active ? "Unstar" : "Star"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? "#F59E0B" : "none"} stroke={active ? "#F59E0B" : "#D1D5DB"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        </button>
    );
}

// ── Row options menu ──────────────────────────────────────────────────────────
function RowMenu({ onDelete }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="dm-row-menu-wrap" onBlur={() => setTimeout(() => setOpen(false), 150)}>
            <button className="dm-row-menu-btn" onClick={() => setOpen(o => !o)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                </svg>
            </button>
            {open && (
                <div className="dm-row-dropdown">
                    <button className="dm-row-dd-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                    </button>
                    <button className="dm-row-dd-item" onClick={() => { onDelete(); setOpen(false); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Add Dashboard Modal ───────────────────────────────────────────────────────
function AddModal({ onClose, onSave }) {
    const [form, setForm] = useState({ name: "", description: "", account: "Thinkitive Technologies" });

    const save = () => {
        if (!form.name.trim()) { alert("Dashboard name is required."); return; }
        onSave(form);
    };

    return (
        <div className="dm-modal-overlay">
            <div className="dm-modal">
                <div className="dm-modal-header">
                    <h2 className="dm-modal-title">Add Dashboard</h2>
                    <button className="dm-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="dm-modal-body">
                    <label className="dm-label">Name *</label>
                    <input className="dm-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dashboard name" />

                    <label className="dm-label" style={{ marginTop: 12 }}>Description</label>
                    <textarea className="dm-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />

                    <label className="dm-label" style={{ marginTop: 12 }}>Account</label>
                    <input className="dm-input" value={form.account} onChange={e => setForm({ ...form, account: e.target.value })} placeholder="Account name" />
                </div>
                <div className="dm-modal-footer">
                    <button className="dm-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="dm-btn-primary" onClick={save}>Save</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardManagement() {
    const [rows, setRows]         = useState(INITIAL_DASHBOARDS);
    const [selected, setSelected] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [showAdd, setShowAdd]   = useState(false);
    const [search, setSearch]     = useState("");

    const filtered = rows.filter(r =>
        !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    );

    const toggleAll = () => {
        if (allChecked) { setSelected([]); setAllChecked(false); }
        else { setSelected(filtered.map(r => r.id)); setAllChecked(true); }
    };

    const toggleRow = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

    const toggleEnabled = (id) => setRows(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    const toggleStar    = (id) => setRows(prev => prev.map(r => r.id === id ? { ...r, starred: !r.starred } : r));
    const deleteRow     = (id) => setRows(prev => prev.filter(r => r.id !== id));

    const handleAdd = (form) => {
        const newId = Math.max(...rows.map(r => r.id), 0) + 1;
        setRows(prev => [...prev, { id: newId, ...form, starred: false, enabled: true }]);
        setShowAdd(false);
    };

    return (
        <div className="dm-page">

            {/* ── Breadcrumb ── */}
            <div className="dm-breadcrumb">
                <Link to="/" className="dm-crumb-link">Dashboard</Link>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span className="dm-crumb-current">Dashboard management</span>
            </div>

            {/* ── Page card ── */}
            <div className="dm-card">

                {/* Card header */}
                <div className="dm-card-header">
                    <div className="dm-card-title-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <h1 className="dm-card-title">Dashboard management</h1>
                    </div>
                    <div className="dm-card-header-right">
                        <button className="dm-sort-btn" title="Sort / Filter">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="13" y1="18" x2="11" y2="18"/>
                            </svg>
                        </button>
                        <button className="dm-btn-primary" onClick={() => setShowAdd(true)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add
                        </button>
                    </div>
                </div>

                {/* Search + count row */}
                <div className="dm-toolbar">
                    <span className="dm-count">{filtered.length} dashboard{filtered.length !== 1 ? "s" : ""}</span>
                    <div className="dm-search-wrap">
                        <svg className="dm-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input className="dm-search" placeholder="Search dashboards..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Table */}
                <div className="dm-table-wrap">
                    <table className="dm-table">
                        <thead>
                            <tr>
                                <th className="dm-th dm-th-check">
                                    <input type="checkbox" className="dm-checkbox" checked={allChecked} onChange={toggleAll} />
                                </th>
                                <th className="dm-th dm-th-toggle"></th>
                                <th className="dm-th">Name</th>
                                <th className="dm-th">Description</th>
                                <th className="dm-th">Account</th>
                                <th className="dm-th dm-th-actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="dm-empty">No dashboards found</td>
                                </tr>
                            ) : filtered.map(row => (
                                <tr key={row.id} className={`dm-tr${selected.includes(row.id) ? " selected" : ""}`}>
                                    <td className="dm-td dm-td-check">
                                        <span className="dm-drag-handle">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="#D1D5DB">
                                                <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
                                                <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
                                                <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
                                            </svg>
                                        </span>
                                        <input type="checkbox" className="dm-checkbox" checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)} />
                                    </td>
                                    <td className="dm-td dm-td-toggle">
                                        <Toggle checked={row.enabled} onChange={() => toggleEnabled(row.id)} />
                                    </td>
                                    <td className="dm-td">
                                        <div className="dm-name-cell">
                                            <StarBtn active={row.starred} onClick={() => toggleStar(row.id)} />
                                            <Link to="/" className="dm-name-link">{row.name}</Link>
                                        </div>
                                    </td>
                                    <td className="dm-td dm-td-desc">{row.description}</td>
                                    <td className="dm-td">{row.account}</td>
                                    <td className="dm-td dm-td-actions">
                                        <button className="dm-share-btn">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                            </svg>
                                            Share
                                        </button>
                                        <RowMenu onDelete={() => deleteRow(row.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add modal */}
            {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
        </div>
    );
}
