// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

// ── Static fallback data ───────────────────────────────────────
import laptopsRaw    from '../data/laptopsData';
import mobilesRaw    from '../data/mobilesData';
import ramRaw        from '../data/ramData';
import mouseRaw      from '../data/mouseData';
import keyboardRaw   from '../data/keyboardData';
import monitorsRaw   from '../data/monitorsData';
import m2ramRaw      from '../data/m2ramData';
import internRaw     from '../data/internLaptopData';
import converterRaw  from '../data/converterData';
import extraRaw      from '../data/extraEquipData';
import hddRaw        from '../data/hddData';
import pendriveRaw   from '../data/pendriveData';
import clientRaw     from '../data/clientDevicesData';

// ── API imports ────────────────────────────────────────────────
import { getLaptops }        from '../api/laptops';
import { getMobiles }        from '../api/mobiles';
import { getRAMs }           from '../api/ram';
import { getMice }           from '../api/mouse';
import { getKeyboards }      from '../api/keyboard';
import { getMonitors }       from '../api/monitors';
import { getM2RAMs }         from '../api/m2ram';
import { getInternLaptops }  from '../api/internLaptops';
import { getConverters }     from '../api/converters';
import { getExtraEquipment } from '../api/extraEquipment';
import { getHDDs }           from '../api/hddStorage';
import { getPendrives }      from '../api/pendrive';
import { getClientDevices }  from '../api/clientDevices';

// ── Helpers ────────────────────────────────────────────────────
const countBy = (arr, key, val) =>
    arr.filter(r => (r[key] || '').toLowerCase() === val.toLowerCase()).length;

const pick = (result, key, fallback) => {
    if (result.status === 'fulfilled') {
        const items = result.value?.data?.[key] ?? result.value?.data ?? [];
        return Array.isArray(items) && items.length ? items : fallback;
    }
    return fallback;
};

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const fmtDate = (d) => d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;
const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// ── Icons ──────────────────────────────────────────────────────
const Icons = {
    box:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    user:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    check:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    laptop:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M1 21h22"/></svg>,
    mobile:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    monitor:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    ram:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8V6m4 2V6m4 2V6m4 2V6M6 16v2m4-2v2m4-2v2m4-2v2"/></svg>,
    mouse:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 2v8M5 10h14"/></svg>,
    keyboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>,
    hdd:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>,
    usb:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><line x1="12" y1="11" x2="12" y2="17"/></svg>,
    location: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    refresh:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>,
    plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// ── Chart Tooltip ──────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="dash-tooltip">
            <p style={{ color: payload[0].payload.fill, margin: 0, fontWeight: 600 }}>
                {payload[0].name}: {payload[0].value}
            </p>
        </div>
    );
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, iconBg, iconColor, icon, accent }) {
    return (
        <div className="stat-card" style={{ borderTopColor: accent }}>
            <div className="stat-card-inner">
                <div>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value" style={{ color: accent }}>{value}</div>
                    <div className="stat-sub" style={{ color: subColor }}>{sub}</div>
                </div>
                <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
            </div>
        </div>
    );
}

// ── Category Card (clickable) ──────────────────────────────────
function CatCard({ label, total, assigned, available, color, icon, to, navigate }) {
    const pct = total > 0 ? Math.round((assigned / total) * 100) : 0;
    return (
        <div className="cat-card" style={{ borderTopColor: color, cursor: to ? 'pointer' : 'default' }}
            onClick={() => to && navigate(to)}
            title={to ? `Go to ${label}` : undefined}>
            <div className="cat-head">
                <div className="cat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
                <div>
                    <div className="cat-lbl">{label}</div>
                    <div className="cat-ttl" style={{ color }}>{total}<span className="cat-ttl-sub"> total</span></div>
                </div>
            </div>
            <div className="cat-bar-bg">
                <div className="cat-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="cat-foot">
                <div className="cat-inline-stats">
                    <span className="cat-dot" style={{ background: '#10b981' }} />
                    <span>{assigned} Assigned</span>
                    <span className="cat-sep">·</span>
                    <span className="cat-dot" style={{ background: '#f59e0b' }} />
                    <span>{available} Avail.</span>
                </div>
                <span className="cat-pct" style={{ color }}>{pct}%</span>
            </div>
        </div>
    );
}

// ── Breakdown Card ─────────────────────────────────────────────
function BreakdownCard({ title, to, rows, navigate }) {
    return (
        <div className="card">
            <div className="card-title-row">
                <span className="card-title">{title}</span>
                {to && (
                    <button className="card-view-all" onClick={() => navigate(to)}>
                        View all →
                    </button>
                )}
            </div>
            <ul className="status-list">
                {rows.map(([label, value, total, color]) => (
                    <li key={label}>
                        <span className="status-name">{label}</span>
                        <div className="status-right">
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill"
                                    style={{ width: `${total > 0 ? Math.round((value / total) * 100) : 0}%`, background: color }} />
                            </div>
                            <span className="status-count">{value}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ── Location Card ──────────────────────────────────────────────
function LocationCard({ allArrays }) {
    const LOCS = [
        { key: 'ABIL',     color: '#2878C8', bg: '#EBF4FF' },
        { key: 'TEERTH',   color: '#059669', bg: '#ECFDF5' },
        { key: 'AMBROSIA', color: '#7C3AED', bg: '#F5F3FF' },
    ];
    const combined = allArrays.flat();
    const total    = combined.filter(a => a.location).length;
    return (
        <div className="card">
            <div className="card-title">Assets by location</div>
            <div className="loc-list">
                {LOCS.map(({ key, color, bg }) => {
                    const cnt = combined.filter(a => a.location === key).length;
                    const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                    return (
                        <div key={key} className="loc-row">
                            <div className="loc-badge" style={{ background: bg, color }}>{Icons.location}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text)' }}>{key}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{cnt} <span style={{ fontWeight: 400, color: 'var(--clr-text-muted)' }}>({pct}%)</span></span>
                                </div>
                                <div className="cat-bar-bg" style={{ marginBottom: 0 }}>
                                    <div className="cat-bar-fill" style={{ width: `${pct}%`, background: color }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Dashboard ──────────────────────────────────────────────────
export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const name = user?.name || user?.email?.split('@')[0] || 'there';

    // State: each category is an array
    const [rows, setRows] = useState({
        laptops:    laptopsRaw,
        mobiles:    mobilesRaw,
        ram:        ramRaw,
        mouse:      mouseRaw,
        keyboard:   keyboardRaw,
        monitors:   monitorsRaw,
        m2ram:      m2ramRaw,
        intern:     internRaw,
        converter:  converterRaw,
        extra:      extraRaw,
        hdd:        hddRaw,
        pendrive:   pendriveRaw,
        client:     clientRaw,
    });
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12] =
                await Promise.allSettled([
                    getLaptops(), getMobiles(), getRAMs(), getMice(), getKeyboards(),
                    getMonitors(), getM2RAMs(), getInternLaptops(), getConverters(),
                    getExtraEquipment(), getHDDs(), getPendrives(), getClientDevices(),
                ]);
            setRows({
                laptops:   pick(r0,  'laptops',       laptopsRaw),
                mobiles:   pick(r1,  'mobiles',        mobilesRaw),
                ram:       pick(r2,  'rams',           ramRaw),
                mouse:     pick(r3,  'mice',           mouseRaw),
                keyboard:  pick(r4,  'keyboards',      keyboardRaw),
                monitors:  pick(r5,  'monitors',       monitorsRaw),
                m2ram:     pick(r6,  'm2ram',          m2ramRaw),
                intern:    pick(r7,  'laptops',        internRaw),
                converter: pick(r8,  'converters',     converterRaw),
                extra:     pick(r9,  'extraEquipment', extraRaw),
                hdd:       pick(r10, 'hdds',           hddRaw),
                pendrive:  pick(r11, 'pendrives',      pendriveRaw),
                client:    pick(r12, 'devices',        clientRaw),
            });
            setLastUpdated(new Date());
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // ── Computed stats ─────────────────────────────────────────
    const s = useMemo(() => {
        const c = countBy;
        const L = rows.laptops, M = rows.mobiles, R = rows.ram, Mo = rows.mouse,
              K = rows.keyboard, Mon = rows.monitors, M2 = rows.m2ram,
              I = rows.intern, Cv = rows.converter, Ex = rows.extra,
              H = rows.hdd, P = rows.pendrive, Cl = rows.client;

        const LAPTOP = {
            total: L.length,  assigned: c(L,'status','assigned'),
            available: c(L,'status','available'), maintenance: c(L,'status','maintenance'),
            notFound: c(L,'status','not found'),
        };
        const MOBILE = {
            total: M.length,  assigned: c(M,'status','assigned'),
            available: c(M,'status','available'), maintenance: c(M,'status','maintenance'),
            disposal: c(M,'status','disposal') + c(M,'status','not working'),
        };
        const RAM = {
            total: R.length, assigned: c(R,'status','assigned'),
            available: c(R,'status','available'),
            ddr4: c(R,'type','ddr4'), ddr5: c(R,'type','ddr5'),
        };
        const MOUSE = {
            total: Mo.length, assigned: c(Mo,'status','assigned'),
            available: c(Mo,'status','available'), maintenance: c(Mo,'status','maintenance'),
            issues: c(Mo,'status','not found') + c(Mo,'status','not working'),
        };
        const KEYBOARD = {
            total: K.length, assigned: c(K,'status','assigned'),
            available: c(K,'status','available'), maintenance: c(K,'status','maintenance'),
            issues: c(K,'status','not found'),
        };
        const MONITOR = {
            total: Mon.length, assigned: c(Mon,'status','assigned'),
            available: c(Mon,'status','available'), maintenance: c(Mon,'status','maintenance'),
        };

        // All categories for grand totals
        const ALL = [L, M, R, Mo, K, Mon, M2, I, Cv, Ex, H, P, Cl];
        const allFlat = ALL.flat();
        const grandTotal     = allFlat.length;
        const grandAssigned  = allFlat.filter(a => (a.status||'').toLowerCase() === 'assigned').length;
        const grandAvailable = allFlat.filter(a => (a.status||'').toLowerCase() === 'available').length;
        const grandMaint     = allFlat.filter(a => (a.status||'').toLowerCase() === 'maintenance').length;
        const grandIssues    = allFlat.filter(a =>
            ['not found','not working','disposal','faulty','overdue'].includes((a.status||'').toLowerCase())
        ).length;

        return { LAPTOP, MOBILE, RAM, MOUSE, KEYBOARD, MONITOR, grandTotal, grandAssigned, grandAvailable, grandMaint, grandIssues, ALL };
    }, [rows]);

    // ── All location-aware arrays ──────────────────────────────
    const locationArrays = useMemo(() =>
        Object.values(rows).filter(arr => Array.isArray(arr)),
    [rows]);

    return (
        <div className="dashboard">

            {/* ── Header ── */}
            <div className="dash-heading">
                <div>
                    <h1>{greeting()}, {name} 👋</h1>
                    <p>{todayStr} · Asset overview across all categories</p>
                </div>
                <div className="dash-head-right">
                    {lastUpdated && (
                        <span className="dash-updated">Updated {fmtDate(lastUpdated)}</span>
                    )}
                    <button className="dash-refresh-btn" onClick={refresh} disabled={refreshing}
                        title="Refresh data">
                        <span style={{ display: 'inline-flex', transform: refreshing ? 'rotate(360deg)' : 'none', transition: refreshing ? 'transform 0.8s linear' : 'none' }}>
                            {Icons.refresh}
                        </span>
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* ── Quick actions ── */}
            <div className="dash-quick-actions">
                <button className="dash-qa-btn" onClick={() => navigate('/laptops')}>
                    {Icons.plus} Add Laptop
                </button>
                <button className="dash-qa-btn" onClick={() => navigate('/mobiles')}>
                    {Icons.plus} Add Mobile
                </button>
                <button className="dash-qa-btn" onClick={() => navigate('/monitors')}>
                    {Icons.plus} Add Monitor
                </button>
                <button className="dash-qa-btn" onClick={() => navigate('/tickets')}>
                    {Icons.plus} Raise Ticket
                </button>
                <button className="dash-qa-btn" onClick={() => navigate('/people')}>
                    {Icons.user} View People
                </button>
            </div>

            {/* ── Grand stat cards ── */}
            <div className="stat-grid">
                <StatCard
                    label="Total Assets" value={s.grandTotal}
                    sub="Across all 13 categories" subColor="#6b7280"
                    accent="#2878C8" iconBg="#EBF4FF" iconColor="#2878C8" icon={Icons.box}
                />
                <StatCard
                    label="Assigned" value={s.grandAssigned}
                    sub={s.grandTotal > 0 ? `${((s.grandAssigned / s.grandTotal) * 100).toFixed(1)}% utilisation` : '0%'}
                    subColor="#2878C8"
                    accent="#1D9E75" iconBg="#E6F9F2" iconColor="#1D9E75" icon={Icons.user}
                />
                <StatCard
                    label="Available" value={s.grandAvailable}
                    sub={s.grandTotal > 0 ? `${((s.grandAvailable / s.grandTotal) * 100).toFixed(1)}% of total` : '0%'}
                    subColor="#3B6D11"
                    accent="#b0c21f" iconBg="#F5F8E6" iconColor="#6a7a00" icon={Icons.check}
                />
                <StatCard
                    label="Issues / Other" value={s.grandMaint + s.grandIssues}
                    sub={`${s.grandMaint} maintenance · ${s.grandIssues} issues`}
                    subColor="#D97706"
                    accent="#D97706" iconBg="#FEF3E2" iconColor="#D97706" icon={Icons.alert}
                />
            </div>

            {/* ── Category cards ── */}
            <div className="cat-grid">
                <CatCard label="Laptops"  total={s.LAPTOP.total}  assigned={s.LAPTOP.assigned}  available={s.LAPTOP.available}  color="#2878C8" icon={Icons.laptop}   to="/laptops"   navigate={navigate} />
                <CatCard label="Mobile"   total={s.MOBILE.total}  assigned={s.MOBILE.assigned}  available={s.MOBILE.available}  color="#7C3AED" icon={Icons.mobile}   to="/mobiles"   navigate={navigate} />
                <CatCard label="Monitors" total={s.MONITOR.total} assigned={s.MONITOR.assigned} available={s.MONITOR.available} color="#0891B2" icon={Icons.monitor}  to="/monitors"  navigate={navigate} />
                <CatCard label="RAM"      total={s.RAM.total}     assigned={s.RAM.assigned}     available={s.RAM.available}     color="#D97706" icon={Icons.ram}      to="/ram"       navigate={navigate} />
                <CatCard label="Mouse"    total={s.MOUSE.total}   assigned={s.MOUSE.assigned}   available={s.MOUSE.available}   color="#059669" icon={Icons.mouse}    to="/mouse"     navigate={navigate} />
                <CatCard label="Keyboard" total={s.KEYBOARD.total}assigned={s.KEYBOARD.assigned}available={s.KEYBOARD.available}color="#DC2626" icon={Icons.keyboard} to="/keyboard"  navigate={navigate} />
            </div>

            {/* ── 2 Pie charts + Location breakdown ── */}
            <div className="charts-row">
                <div className="card">
                    <div className="card-title">Asset type split</div>
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie data={[
                                { name: 'Laptops',   value: s.LAPTOP.total,  fill: '#2878C8' },
                                { name: 'Mobile',    value: s.MOBILE.total,  fill: '#7C3AED' },
                                { name: 'Monitors',  value: s.MONITOR.total, fill: '#0891B2' },
                                { name: 'RAM',       value: s.RAM.total,     fill: '#D97706' },
                                { name: 'Mouse',     value: s.MOUSE.total,   fill: '#059669' },
                                { name: 'Keyboard',  value: s.KEYBOARD.total,fill: '#DC2626' },
                                { name: 'HDD/SSD',   value: rows.hdd.length, fill: '#0E7490' },
                                { name: 'Pendrive',  value: rows.pendrive.length, fill: '#B45309' },
                                { name: 'Other',     value: rows.m2ram.length + rows.converter.length + rows.extra.length + rows.intern.length + rows.client.length, fill: '#6B7280' },
                            ].filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                                {['#2878C8','#7C3AED','#0891B2','#D97706','#059669','#DC2626','#0E7490','#B45309','#6B7280'].map((c, i) => (
                                    <Cell key={i} fill={c} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend iconType="square" iconSize={9}
                                formatter={v => <span style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-title">Assignment status</div>
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie data={[
                                { name: 'Assigned',    value: s.grandAssigned,  fill: '#1D9E75' },
                                { name: 'Available',   value: s.grandAvailable, fill: '#2878C8' },
                                { name: 'Maintenance', value: s.grandMaint,     fill: '#D97706' },
                                { name: 'Issues',      value: s.grandIssues,    fill: '#E24B4A' },
                            ].filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                                {['#1D9E75','#2878C8','#D97706','#E24B4A'].map((c, i) => <Cell key={i} fill={c} />)}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend iconType="square" iconSize={9}
                                formatter={v => <span style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <LocationCard allArrays={locationArrays} />
            </div>

            {/* ── Breakdown cards ── */}
            <div className="breakdown-grid">
                <BreakdownCard title="Laptop breakdown" to="/laptops" navigate={navigate} rows={[
                    ['Total',       s.LAPTOP.total,       s.LAPTOP.total, '#2878C8'],
                    ['Assigned',    s.LAPTOP.assigned,    s.LAPTOP.total, '#1D9E75'],
                    ['Available',   s.LAPTOP.available,   s.LAPTOP.total, '#3B6D11'],
                    ['Maintenance', s.LAPTOP.maintenance, s.LAPTOP.total, '#D97706'],
                    ['Not found',   s.LAPTOP.notFound,    s.LAPTOP.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="Mobile breakdown" to="/mobiles" navigate={navigate} rows={[
                    ['Total',           s.MOBILE.total,       s.MOBILE.total, '#7C3AED'],
                    ['Assigned',        s.MOBILE.assigned,    s.MOBILE.total, '#1D9E75'],
                    ['Available',       s.MOBILE.available,   s.MOBILE.total, '#3B6D11'],
                    ['Maintenance',     s.MOBILE.maintenance, s.MOBILE.total, '#D97706'],
                    ['Disposal / Dead', s.MOBILE.disposal,    s.MOBILE.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="RAM breakdown" to="/ram" navigate={navigate} rows={[
                    ['Total',     s.RAM.total,     s.RAM.total, '#D97706'],
                    ['Assigned',  s.RAM.assigned,  s.RAM.total, '#1D9E75'],
                    ['Available', s.RAM.available, s.RAM.total, '#3B6D11'],
                    ['DDR4',      s.RAM.ddr4,      s.RAM.total, '#2878C8'],
                    ['DDR5',      s.RAM.ddr5,      s.RAM.total, '#7C3AED'],
                ]} />
            </div>
            <div className="breakdown-grid">
                <BreakdownCard title="Mouse breakdown" to="/mouse" navigate={navigate} rows={[
                    ['Total',       s.MOUSE.total,       s.MOUSE.total, '#059669'],
                    ['Assigned',    s.MOUSE.assigned,    s.MOUSE.total, '#1D9E75'],
                    ['Available',   s.MOUSE.available,   s.MOUSE.total, '#3B6D11'],
                    ['Maintenance', s.MOUSE.maintenance, s.MOUSE.total, '#D97706'],
                    ['Issues',      s.MOUSE.issues,      s.MOUSE.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="Keyboard breakdown" to="/keyboard" navigate={navigate} rows={[
                    ['Total',       s.KEYBOARD.total,       s.KEYBOARD.total, '#DC2626'],
                    ['Assigned',    s.KEYBOARD.assigned,    s.KEYBOARD.total, '#1D9E75'],
                    ['Available',   s.KEYBOARD.available,   s.KEYBOARD.total, '#3B6D11'],
                    ['Maintenance', s.KEYBOARD.maintenance, s.KEYBOARD.total, '#D97706'],
                    ['Issues',      s.KEYBOARD.issues,      s.KEYBOARD.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="Monitor breakdown" to="/monitors" navigate={navigate} rows={[
                    ['Total',       s.MONITOR.total,       s.MONITOR.total, '#0891B2'],
                    ['Assigned',    s.MONITOR.assigned,    s.MONITOR.total, '#1D9E75'],
                    ['Available',   s.MONITOR.available,   s.MONITOR.total, '#3B6D11'],
                    ['Maintenance', s.MONITOR.maintenance, s.MONITOR.total, '#D97706'],
                ]} />
            </div>

        </div>
    );
}
