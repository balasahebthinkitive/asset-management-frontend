import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import INITIAL_DATA from "../data/peopleData";
import { getPeople, createPerson, updatePerson, deletePerson } from "../api/people";
import ProtectedAction from "../components/ProtectedAction";
import { usePermission } from "../hooks/usePermission";
import "./Laptops.css";

const ROLE_BADGE = {
  admin:   { bg: "rgba(109,40,217,0.12)", color: "#5b21b6" },
  manager: { bg: "rgba(234,88,12,0.12)",  color: "#c2410c" },
  user:    { bg: "rgba(55,65,81,0.1)",    color: "#374151" },
};
const STATUS_BADGE = {
  Active:    { bg: "rgba(176,194,31,0.15)", color: "#6a7a00" },
  Inactive:  { bg: "#fee2e2",               color: "#991b1b" },
  "On Leave":{ bg: "#fef3c7",               color: "#92400e" },
};

const EMPTY = { name:"", email:"", department:"Engineering", designation:"", phone:"", role:"user", location:"ABIL", status:"Active", joinDate:"" };
const DEPARTMENTS = ["Engineering","Design","QA","HR","Finance","Marketing","IT","Operations","Other"];
const ROLES       = ["admin","manager","user"];
const STATUSES    = ["Active","Inactive","On Leave"];
const LOCATIONS   = ["ABIL","TEERTH","AMBROSIA",""];

export default function People() {
  const { can } = usePermission();

  const [assets, setAssets]   = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await getPeople();
      const items = res.data?.people ?? res.data ?? [];
      setAssets(items.length ? items : INITIAL_DATA);
    } catch {
      setAssets(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const [search, setSearch]     = useState("");
  const [fDept, setFDept]       = useState("");
  const [fRole, setFRole]       = useState("");
  const [fStatus, setFStatus]   = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [delConfirm, setDelConfirm] = useState(null);
  const [sorting, setSorting]   = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

  const filtered = useMemo(() => assets.filter(a => {
    const q = search.toLowerCase();
    return (!q || [a.name, a.email, a.department, a.designation, a.phone].some(v => v?.toLowerCase().includes(q)))
      && (!fDept   || a.department === fDept)
      && (!fRole   || a.role === fRole)
      && (!fStatus || a.status === fStatus);
  }), [assets, search, fDept, fRole, fStatus]);

  const columns = useMemo(() => [
    { accessorKey: "id",          header: "#",           size: 50 },
    { accessorKey: "name",        header: "Name",        size: 160 },
    { accessorKey: "email",       header: "Email",       size: 220,
      cell: i => <span className="lp-mono" style={{ fontSize: 12 }}>{i.getValue()}</span> },
    { accessorKey: "department",  header: "Department",  size: 130 },
    { accessorKey: "designation", header: "Designation", size: 160 },
    { accessorKey: "phone",       header: "Phone",       size: 130,
      cell: i => <span className="lp-mono">{i.getValue() || "—"}</span> },
    { accessorKey: "role",        header: "Role",        size: 90,
      cell: i => { const b = ROLE_BADGE[i.getValue()] || ROLE_BADGE.user; return <span className="lp-status-badge" style={b}>{i.getValue()}</span>; } },
    { accessorKey: "location",    header: "Location",    size: 90 },
    { accessorKey: "status",      header: "Status",      size: 100,
      cell: i => { const b = STATUS_BADGE[i.getValue()] || STATUS_BADGE.Active; return <span className="lp-status-badge" style={b}>{i.getValue()}</span>; } },
    { accessorKey: "joinDate",    header: "Join Date",   size: 100,
      cell: i => i.getValue() || "—" },
    { id: "actions", header: "Actions", size: 130, enableSorting: false,
      cell: ({ row }) => (
        <span className="lp-action-btns">
          <ProtectedAction action="edit">
            <button className="lp-btn-edit" onClick={() => { setForm({ ...row.original }); setEditId(row.original.id); setShowModal(true); }}>Edit</button>
          </ProtectedAction>
          <ProtectedAction action="delete">
            <button className="lp-btn-del" onClick={() => setDelConfirm(row.original)}>Delete</button>
          </ProtectedAction>
        </span>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const openAdd    = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.name || !form.email) { alert("Name and Email are required."); return; }
    try {
      setSaving(true);
      if (editId) { await updatePerson(editId, form); } else { await createPerson(form); }
      await fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deletePerson(id);
      setDelConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
      setDelConfirm(null);
    }
  };

  const stats = {
    total:    assets.length,
    active:   assets.filter(a => a.status === "Active").length,
    depts:    new Set(assets.map(a => a.department)).size,
    admins:   assets.filter(a => a.role === "admin").length,
  };

  const Field = ({ field, label, type = "text", opts = null }) => (
    <div className="lp-form-field">
      <label className="lp-form-label">{label}</label>
      {opts ? (
        <select className="lp-form-inp" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}>
          {opts.map(o => <option key={o} value={o}>{o || "— none —"}</option>)}
        </select>
      ) : (
        <input type={type} className="lp-form-inp" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
      )}
    </div>
  );

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = filtered.length;
  const pageCount = table.getPageCount();
  const from = Math.min(pageIndex * pageSize + 1, totalRows);
  const to   = Math.min((pageIndex + 1) * pageSize, totalRows);

  if (loading) return (
    <div className="lp-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <span style={{ color: "#9ca3af", fontSize: 14 }}>Loading…</span>
    </div>
  );

  return (
    <div className="lp-page">

      {error && (
        <div style={{ margin: "12px 20px 0", padding: "10px 14px", background: "#FEE2E2", color: "#991B1B", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div className="lp-page-header" style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>People</h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{assets.length} total employees</p>
          </div>
          <ProtectedAction action="create">
            <button className="lp-add-btn" style={{ borderRadius: 7, padding: "8px 18px" }} onClick={openAdd}>
              + Add Person
            </button>
          </ProtectedAction>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Total",        val: stats.total,   color: "#2878C8", border: "#2878C8" },
            { label: "Active",       val: stats.active,  color: "#6a7a00", border: "#b0c21f" },
            { label: "Departments",  val: stats.depts,   color: "#5b21b6", border: "#7c3aed" },
            { label: "Admins",       val: stats.admins,  color: "#c2410c", border: "#ea580c" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: `3px solid ${s.border}`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="lp-card" style={{ margin: "0 20px 20px" }}>

        {/* Filter bar */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #E5E7EB", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", background: "#fafafa" }}>
          <input className="lp-search" placeholder="Search name, email, designation…" value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
            style={{ width: 240 }} />
          <select className="lp-sel lp-sel-sm" value={fDept}
            onChange={e => { setFDept(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
            <option value="">All departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="lp-sel lp-sel-sm" value={fRole}
            onChange={e => { setFRole(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
            <option value="">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="lp-sel lp-sel-sm" value={fStatus}
            onChange={e => { setFStatus(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || fDept || fRole || fStatus) && (
            <button className="lp-btn-ghost" onClick={() => { setSearch(""); setFDept(""); setFRole(""); setFStatus(""); setPagination({ pageIndex: 0, pageSize: 15 }); }}>
              Clear
            </button>
          )}
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto", whiteSpace: "nowrap" }}>{totalRows} results</span>
        </div>

        {/* Table */}
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} className="lp-th"
                      onClick={h.column.getToggleSortingHandler()}
                      style={{ cursor: h.column.getCanSort() ? "pointer" : "default", width: h.getSize() }}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      <span className="lp-sort-hint">
                        {h.column.getIsSorted() === "asc" ? " ↑" : h.column.getIsSorted() === "desc" ? " ↓" : h.column.getCanSort() ? " ↕" : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="lp-empty">No people found</td></tr>
              ) : table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className={`lp-tr${i % 2 !== 0 ? " lp-tr-alt" : ""}`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="lp-td">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="lp-pagination">
          <span className="lp-pg-info">
            {totalRows === 0 ? "No results" : `Showing ${from}–${to} of ${totalRows}`}
          </span>
          <div className="lp-pg-btns">
            <button className="lp-pg-btn" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>← Prev</button>
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              const pg = pageCount <= 5 ? i : pageIndex <= 2 ? i : pageIndex >= pageCount - 3 ? pageCount - 5 + i : pageIndex - 2 + i;
              return (
                <button key={pg} className={`lp-pg-btn${pageIndex === pg ? " lp-pg-btn--active" : ""}`}
                  onClick={() => table.setPageIndex(pg)}>
                  {pg + 1}
                </button>
              );
            })}
            <button className="lp-pg-btn" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next →</button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="lp-overlay">
          <div className="lp-modal">
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">{editId ? "Edit Person" : "Add Person"}</h2>
              <button className="lp-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="lp-modal-body">
              <div className="lp-form-grid">
                <Field field="name"        label="Full Name *"    />
                <Field field="email"       label="Email *"        type="email" />
                <Field field="department"  label="Department"     opts={DEPARTMENTS} />
                <Field field="designation" label="Designation"    />
                <Field field="phone"       label="Phone"          />
                <Field field="role"        label="Role"           opts={ROLES} />
                <Field field="location"    label="Location"       opts={LOCATIONS} />
                <Field field="status"      label="Status"         opts={STATUSES} />
                <Field field="joinDate"    label="Join Date"      type="date" />
              </div>
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="lp-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Update Person" : "Save Person"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delConfirm && (
        <div className="lp-overlay">
          <div className="lp-modal lp-modal-sm">
            <div className="lp-modal-header">
              <h3 className="lp-modal-title">Remove Person</h3>
              <button className="lp-modal-close" onClick={() => setDelConfirm(null)}>×</button>
            </div>
            <div className="lp-modal-body">
              <p className="lp-del-msg">
                Remove <strong>{delConfirm.name}</strong> ({delConfirm.email})?<br />
                Department: <strong>{delConfirm.department}</strong>
              </p>
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-ghost" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="lp-btn-danger" onClick={() => handleDelete(delConfirm._id || delConfirm.id)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Permission notice for non-admins */}
      {!can('manage_people') && (
        <div style={{ margin: "0 20px 16px", padding: "8px 14px", background: "#f0f9ff", color: "#0369a1", borderRadius: 8, fontSize: 12, border: "1px solid #bae6fd" }}>
          You are viewing People in read-only mode. Contact an admin to make changes.
        </div>
      )}
    </div>
  );
}
