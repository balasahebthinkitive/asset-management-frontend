// src/pages/AdminUsers.jsx
import { useState, useEffect, useCallback } from 'react';
import { getPeople, updatePerson } from '../api/people';
import PEOPLE_STATIC from '../data/peopleData';
import { ROLE_META, STATUS_META, LOCATIONS } from '../data/adminData';
import './adminShared.css';

const IcoSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoLocation = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;

export default function AdminUsers() {
  const [people, setPeople]   = useState(PEOPLE_STATIC);
  const [search, setSearch]   = useState('');
  const [roleF, setRoleF]     = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getPeople();
      const items = res.data?.people ?? res.data ?? [];
      if (Array.isArray(items) && items.length) setPeople(items);
    } catch { /* use static */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = people.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || [p.name, p.email, p.department, p.designation].some(v => (v || '').toLowerCase().includes(q));
    const matchR = roleF   === 'all' || p.role   === roleF;
    const matchS = statusF === 'all' || p.status === statusF;
    return matchQ && matchR && matchS;
  });

  const changeRole = async (id, role) => {
    setSaving(true);
    try {
      await updatePerson(id, { role });
    } catch { /* optimistic */ }
    setPeople(prev => prev.map(p => p.id === id ? { ...p, role } : p));
    setSaving(false);
  };

  const changeStatus = async (id, status) => {
    setSaving(true);
    try {
      await updatePerson(id, { status });
    } catch { /* optimistic */ }
    setPeople(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    setSaving(false);
  };

  return (
    <div>
      <h1 className="adm-section-title">User Management</h1>
      <p className="adm-section-sub">View all users. Change role or status directly from the table.</p>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <span className="adm-search-icon"><IcoSearch /></span>
          <input
            className="adm-search"
            placeholder="Search by name, email, department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="adm-select" value={roleF} onChange={e => setRoleF(e.target.value)}>
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <select className="adm-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Department</th>
              <th>Location</th>
              <th>Join date</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="adm-table-empty">No users match your filter.</td></tr>
            )}
            {filtered.map(p => {
              const rm = ROLE_META[p.role]    || ROLE_META.user;
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
                      <IcoLocation /> {p.location}
                    </span>
                  </td>
                  <td className="adm-td-muted">{p.joinDate}</td>
                  <td>
                    <select
                      className="adm-inline-select"
                      value={p.role}
                      disabled={saving}
                      onChange={e => changeRole(p.id, e.target.value)}
                      style={{ background: rm.bg, color: rm.color, borderColor: rm.color + '55' }}
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
                      onChange={e => changeStatus(p.id, e.target.value)}
                      style={{ background: sm.bg, color: sm.color, borderColor: sm.color + '55' }}
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
        <div className="adm-table-foot">{filtered.length} of {people.length} users shown</div>
      </div>
    </div>
  );
}
