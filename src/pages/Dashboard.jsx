// src/pages/Dashboard.jsx
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

// ── Import actual data files ───────────────────────────────────
import laptopsRaw   from '../data/laptopsData';
import mobilesRaw   from '../data/mobilesData';
import ramRaw       from '../data/ramData';
import mouseRaw     from '../data/mouseData';
import keyboardRaw  from '../data/keyboardData';
import monitorsRaw  from '../data/monitorsData';

// ── Helpers ────────────────────────────────────────────────────
const countBy = (arr, key, val) =>
    arr.filter(r => (r[key] || '').toLowerCase() === val.toLowerCase()).length;

// ── Compute stats from data ────────────────────────────────────
const LAPTOP = {
    total:       laptopsRaw.length,
    assigned:    countBy(laptopsRaw, 'status', 'assigned'),
    available:   countBy(laptopsRaw, 'status', 'available'),
    maintenance: countBy(laptopsRaw, 'status', 'maintenance'),
    notFound:    countBy(laptopsRaw, 'status', 'not found'),
    sold:        countBy(laptopsRaw, 'status', 'sold'),
};

const MOBILE = {
    total:      mobilesRaw.length,
    assigned:   countBy(mobilesRaw, 'status', 'assigned'),
    available:  countBy(mobilesRaw, 'status', 'available'),
    maintenance:countBy(mobilesRaw, 'status', 'maintenance'),
    disposal:   countBy(mobilesRaw, 'status', 'disposal'),
    notWorking: countBy(mobilesRaw, 'status', 'not working'),
};

const RAM = {
    total:     ramRaw.length,
    assigned:  countBy(ramRaw, 'status', 'assigned'),
    available: countBy(ramRaw, 'status', 'available'),
    ddr4:      countBy(ramRaw, 'type', 'ddr4'),
    ddr5:      countBy(ramRaw, 'type', 'ddr5'),
};

const MOUSE = {
    total:       mouseRaw.length,
    assigned:    countBy(mouseRaw, 'status', 'assigned'),
    available:   countBy(mouseRaw, 'status', 'available'),
    maintenance: countBy(mouseRaw, 'status', 'maintenance'),
    notFound:    countBy(mouseRaw, 'status', 'not found'),
    notWorking:  countBy(mouseRaw, 'status', 'not working'),
};

const KEYBOARD = {
    total:       keyboardRaw.length,
    assigned:    countBy(keyboardRaw, 'status', 'assigned'),
    available:   countBy(keyboardRaw, 'status', 'available'),
    maintenance: countBy(keyboardRaw, 'status', 'maintenance'),
    notFound:    countBy(keyboardRaw, 'status', 'not found'),
};

const MONITOR = {
    total:       monitorsRaw.length,
    assigned:    countBy(monitorsRaw, 'status', 'assigned'),
    available:   countBy(monitorsRaw, 'status', 'available'),
    maintenance: countBy(monitorsRaw, 'status', 'maintenance'),
};

const GRAND_TOTAL     = LAPTOP.total + MOBILE.total + RAM.total + MOUSE.total + KEYBOARD.total + MONITOR.total;
const GRAND_ASSIGNED  = LAPTOP.assigned + MOBILE.assigned + RAM.assigned + MOUSE.assigned + KEYBOARD.assigned + MONITOR.assigned;
const GRAND_AVAILABLE = LAPTOP.available + MOBILE.available + RAM.available + MOUSE.available + KEYBOARD.available + MONITOR.available;
const GRAND_MAINT     = LAPTOP.maintenance + MOBILE.maintenance + MOUSE.maintenance + KEYBOARD.maintenance + MONITOR.maintenance;
const GRAND_OTHER     = LAPTOP.notFound + LAPTOP.sold + MOBILE.disposal + MOBILE.notWorking + MOUSE.notFound + MOUSE.notWorking + KEYBOARD.notFound;

// ── Icons ─────────────────────────────────────────────────────
const Icons = {
    box:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    user:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    check:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    laptop:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M1 21h22"/></svg>,
    mobile:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    monitor:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    ram:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8V6m4 2V6m4 2V6m4 2V6M6 16v2m4-2v2m4-2v2m4-2v2"/></svg>,
    mouse:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 2v8M5 10h14"/></svg>,
    keyboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8M6 10h.01"/></svg>,
};

// ── Chart Tooltip ─────────────────────────────────────────────
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

// ── Top Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, iconBg, iconColor, icon, accent }) {
    return (
        <div className="stat-card" style={{ borderTopColor: accent }}>
            <div className="stat-card-inner">
                <div>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value" style={{ color: accent }}>{value}</div>
                    <div className="stat-sub" style={{ color: subColor }}>{sub}</div>
                </div>
                <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ── Category Card ─────────────────────────────────────────────
function CatCard({ label, total, assigned, available, color, icon }) {
    const pct = total > 0 ? Math.round((assigned / total) * 100) : 0;
    return (
        <div className="cat-card" style={{ borderTopColor: color }}>
            <div className="cat-head">
                <div className="cat-icon" style={{ background: `${color}15`, color }}>{icon}</div>
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
                    <span>{available} Available</span>
                </div>
                <span className="cat-pct" style={{ color }}>{pct}%</span>
            </div>
        </div>
    );
}

// ── Breakdown Card ────────────────────────────────────────────
function BreakdownCard({ title, rows }) {
    return (
        <div className="card">
            <div className="card-title">{title}</div>
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

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
    return (
        <div className="dashboard">

            {/* Heading */}
            <div className="dash-heading">
                <h1>Dashboard</h1>
                <p>Asset overview across all categories</p>
            </div>

            {/* ── 4 Grand stat cards ── */}
            <div className="stat-grid">
                <StatCard
                    label="Total Assets" value={GRAND_TOTAL}
                    sub="Across all categories" subColor="#6b7280"
                    accent="#2878C8" iconBg="#EBF4FF" iconColor="#2878C8" icon={Icons.box}
                />
                <StatCard
                    label="Assigned" value={GRAND_ASSIGNED}
                    sub={GRAND_TOTAL > 0 ? `${((GRAND_ASSIGNED / GRAND_TOTAL) * 100).toFixed(1)}% utilisation` : '0% utilisation'} subColor="#2878C8"
                    accent="#1D9E75" iconBg="#E6F9F2" iconColor="#1D9E75" icon={Icons.user}
                />
                <StatCard
                    label="Available" value={GRAND_AVAILABLE}
                    sub={GRAND_TOTAL > 0 ? `${((GRAND_AVAILABLE / GRAND_TOTAL) * 100).toFixed(1)}% of total` : '0% of total'} subColor="#3B6D11"
                    accent="#b0c21f" iconBg="#F5F8E6" iconColor="#6a7a00" icon={Icons.check}
                />
                <StatCard
                    label="Maintenance / Other" value={GRAND_MAINT + GRAND_OTHER}
                    sub={`${GRAND_MAINT} maintenance · ${GRAND_OTHER} other`} subColor="#D97706"
                    accent="#D97706" iconBg="#FEF3E2" iconColor="#D97706" icon={Icons.box}
                />
            </div>

            {/* ── 6 Category cards ── */}
            <div className="cat-grid">
                <CatCard label="Laptops"  total={LAPTOP.total}   assigned={LAPTOP.assigned}   available={LAPTOP.available}   color="#2878C8" icon={Icons.laptop}   />
                <CatCard label="Mobile"   total={MOBILE.total}   assigned={MOBILE.assigned}   available={MOBILE.available}   color="#7C3AED" icon={Icons.mobile}   />
                <CatCard label="Monitors" total={MONITOR.total}  assigned={MONITOR.assigned}  available={MONITOR.available}  color="#0891B2" icon={Icons.monitor}  />
                <CatCard label="RAM"      total={RAM.total}      assigned={RAM.assigned}      available={RAM.available}      color="#D97706" icon={Icons.ram}      />
                <CatCard label="Mouse"    total={MOUSE.total}    assigned={MOUSE.assigned}    available={MOUSE.available}    color="#059669" icon={Icons.mouse}    />
                <CatCard label="Keyboard" total={KEYBOARD.total} assigned={KEYBOARD.assigned} available={KEYBOARD.available} color="#DC2626" icon={Icons.keyboard} />
            </div>

            {/* ── 2 Pie charts ── */}
            <div className="charts-row">
                <div className="card">
                    <div className="card-title">Asset type split</div>
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie data={[
                                { name: 'Laptops',  value: LAPTOP.total,   fill: '#2878C8' },
                                { name: 'Mobile',   value: MOBILE.total,   fill: '#7C3AED' },
                                { name: 'Monitors', value: MONITOR.total,  fill: '#0891B2' },
                                { name: 'RAM',      value: RAM.total,      fill: '#D97706' },
                                { name: 'Mouse',    value: MOUSE.total,    fill: '#059669' },
                                { name: 'Keyboard', value: KEYBOARD.total, fill: '#DC2626' },
                            ].filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                                {['#2878C8','#7C3AED','#0891B2','#D97706','#059669','#DC2626'].map((c,i) => <Cell key={i} fill={c} />)}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend iconType="square" iconSize={10}
                                formatter={v => <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-title">Overall assignment status</div>
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie data={[
                                { name: 'Assigned',    value: GRAND_ASSIGNED,  fill: '#1D9E75' },
                                { name: 'Available',   value: GRAND_AVAILABLE, fill: '#2878C8' },
                                { name: 'Maintenance', value: GRAND_MAINT,     fill: '#D97706' },
                                { name: 'Other',       value: GRAND_OTHER,     fill: '#E24B4A' },
                            ].filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                                {['#1D9E75','#2878C8','#D97706','#E24B4A'].map((c,i) => <Cell key={i} fill={c} />)}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend iconType="square" iconSize={10}
                                formatter={v => <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Breakdown row 1 ── */}
            <div className="breakdown-grid">
                <BreakdownCard title="Laptop breakdown" rows={[
                    ['Total',       LAPTOP.total,       LAPTOP.total, '#2878C8'],
                    ['Assigned',    LAPTOP.assigned,    LAPTOP.total, '#1D9E75'],
                    ['Available',   LAPTOP.available,   LAPTOP.total, '#3B6D11'],
                    ['Maintenance', LAPTOP.maintenance, LAPTOP.total, '#D97706'],
                    ['Not found',   LAPTOP.notFound,    LAPTOP.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="Mobile breakdown" rows={[
                    ['Total',           MOBILE.total,                        MOBILE.total, '#7C3AED'],
                    ['Assigned',        MOBILE.assigned,                     MOBILE.total, '#1D9E75'],
                    ['Available',       MOBILE.available,                    MOBILE.total, '#3B6D11'],
                    ['Maintenance',     MOBILE.maintenance,                  MOBILE.total, '#D97706'],
                    ['Disposal / Dead', MOBILE.disposal + MOBILE.notWorking, MOBILE.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="RAM breakdown" rows={[
                    ['Total modules', RAM.total,     RAM.total, '#D97706'],
                    ['Assigned',      RAM.assigned,  RAM.total, '#1D9E75'],
                    ['Available',     RAM.available, RAM.total, '#3B6D11'],
                    ['DDR4',          RAM.ddr4,      RAM.total, '#2878C8'],
                    ['DDR5',          RAM.ddr5,      RAM.total, '#7C3AED'],
                ]} />
            </div>

            {/* ── Breakdown row 2 ── */}
            <div className="breakdown-grid">
                <BreakdownCard title="Mouse breakdown" rows={[
                    ['Total',       MOUSE.total,                        MOUSE.total, '#059669'],
                    ['Assigned',    MOUSE.assigned,                     MOUSE.total, '#1D9E75'],
                    ['Available',   MOUSE.available,                    MOUSE.total, '#3B6D11'],
                    ['Maintenance', MOUSE.maintenance,                  MOUSE.total, '#D97706'],
                    ['Not found',   MOUSE.notFound + MOUSE.notWorking,  MOUSE.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="Keyboard breakdown" rows={[
                    ['Total',       KEYBOARD.total,       KEYBOARD.total, '#DC2626'],
                    ['Assigned',    KEYBOARD.assigned,    KEYBOARD.total, '#1D9E75'],
                    ['Available',   KEYBOARD.available,   KEYBOARD.total, '#3B6D11'],
                    ['Maintenance', KEYBOARD.maintenance, KEYBOARD.total, '#D97706'],
                    ['Not found',   KEYBOARD.notFound,    KEYBOARD.total, '#E24B4A'],
                ]} />
                <BreakdownCard title="Monitor breakdown" rows={[
                    ['Total',       MONITOR.total,       MONITOR.total, '#0891B2'],
                    ['Assigned',    MONITOR.assigned,    MONITOR.total, '#1D9E75'],
                    ['Available',   MONITOR.available,   MONITOR.total, '#3B6D11'],
                    ['Maintenance', MONITOR.maintenance, MONITOR.total, '#D97706'],
                ]} />
            </div>

        </div>
    );
}
