import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import INITIAL_DATA from "../data/ticketData";
import { getTickets, createTicket, updateTicket, deleteTicket } from "../api/tickets";
import StatCard from "../components/StatCard";
import StatusBadge, {
  TICKET_PRIORITY_COLORS,
  TICKET_STATUS_COLORS,
} from "../components/StatusBadge";
import "./Laptops.css";

const ISSUE_TYPES = ["Heating","Screen","Battery","Keyboard","Performance","Network","Software","Other"];
const PRIORITIES  = ["Critical","High","Medium","Low"];
const STATUSES    = ["Open","In Progress","Resolved","Closed"];
const DEPARTMENTS = ["Engineering","HR","Finance","Operations","Sales","Management","Design",""];
const IT_STAFF    = ["IT Team","Vikram IT","Neha IT","Ravi IT",""];

const EMPTY_FORM = {
  ticketNo: "", title: "", assetName: "", assetSerial: "",
  reportedBy: "", department: "", issueType: "Other",
  priority: "Medium", status: "Open", assignedTo: "", resolvedAt: "", remarks: "",
};

/* ── icons ── */
const IconTicket  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconAlert   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconClock   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconFire    = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const IconEdit    = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

export default function Tickets() {
  const [data, setData]               = useState(INITIAL_DATA);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("");
  const [priorityFilter, setPriority] = useState("");
  const [issueFilter, setIssue]       = useState("");
  const [sorting, setSorting]         = useState([]);
  const [pagination, setPagination]   = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal]     = useState(false);
  const [editRow, setEditRow]         = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [deleteRow, setDeleteRow]     = useState(null);

  /* ── fetch all tickets ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTickets();
      const tickets = res.data?.tickets ?? res.data ?? [];
      setData(tickets.length ? tickets : INITIAL_DATA);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || "Failed to load tickets.");
      setData(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:      data.length,
    open:       data.filter(d => d.status === "Open").length,
    inProgress: data.filter(d => d.status === "In Progress").length,
    critical:   data.filter(d => d.priority === "Critical").length,
  }), [data]);

  /* ── filtered rows ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(r => {
      const matchSearch   = !q || [r.ticketNo, r.title, r.assetName, r.reportedBy, r.assignedTo]
        .some(v => v?.toLowerCase().includes(q));
      const matchStatus   = !statusFilter   || r.status   === statusFilter;
      const matchPriority = !priorityFilter || r.priority === priorityFilter;
      const matchIssue    = !issueFilter    || r.issueType === issueFilter;
      return matchSearch && matchStatus && matchPriority && matchIssue;
    });
  }, [data, search, statusFilter, priorityFilter, issueFilter]);

  /* ── columns ── */
  const columns = useMemo(() => [
    { accessorKey: "id",         header: "#",           size: 50  },
    { accessorKey: "ticketNo",   header: "Ticket No",   size: 110 },
    { accessorKey: "title",      header: "Title",       size: 200 },
    { accessorKey: "assetName",  header: "Asset",       size: 160 },
    { accessorKey: "reportedBy", header: "Reported By", size: 130 },
    { accessorKey: "department", header: "Department",  size: 120 },
    { accessorKey: "issueType",  header: "Issue Type",  size: 110 },
    {
      accessorKey: "priority",
      header: "Priority",
      size: 100,
      cell: ({ getValue }) => (
        <StatusBadge value={getValue()} colorMap={TICKET_PRIORITY_COLORS} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ getValue }) => (
        <StatusBadge value={getValue()} colorMap={TICKET_STATUS_COLORS} />
      ),
    },
    { accessorKey: "assignedTo", header: "Assigned To", size: 120 },
    { accessorKey: "resolvedAt", header: "Resolved",    size: 110 },
    {
      id: "actions",
      header: "Actions",
      size: 90,
      cell: ({ row }) => (
        <div className="lp-actions">
          <button className="lp-btn-icon lp-btn-edit" title="Edit"
            onClick={() => openEdit(row.original)}>{IconEdit}</button>
          <button className="lp-btn-icon lp-btn-delete" title="Delete"
            onClick={() => setDeleteRow(row.original)}>{IconTrash}</button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  /* ── modal helpers ── */
  const openAdd  = () => {
    setEditRow(null);
    const nextNo = `TKT-${String(data.length + 1).padStart(4, "0")}`;
    setForm({ ...EMPTY_FORM, ticketNo: nextNo });
    setShowModal(true);
  };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setShowModal(true); };
  const close    = () => { setShowModal(false); setEditRow(null); };

  const save = async () => {
    if (!form.title.trim()) return;
    const updated = { ...form };
    if (["Resolved","Closed"].includes(updated.status) && !updated.resolvedAt) {
      updated.resolvedAt = new Date().toISOString().split("T")[0];
    }
    try {
      setSaving(true);
      if (editRow) {
        await updateTicket(editRow._id || editRow.id, updated);
      } else {
        await createTicket(updated);
      }
      await fetchData();
      close();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTicket(deleteRow._id || deleteRow.id);
      setDeleteRow(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
      setDeleteRow(null);
    }
  };

  const inp = (key, type = "text") => (
    <input type={type} className="lp-form-inp" value={form[key] ?? ""}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
  );
  const sel = (key, options) => (
    <select className="lp-form-inp" value={form[key] ?? ""}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
      {options.map(o => <option key={o} value={o}>{o || "—"}</option>)}
    </select>
  );

  /* ── loading / error screens ── */
  if (loading) return (
    <div className="lp-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:300 }}>
      <span style={{ color:"var(--clr-text-muted)", fontSize:14 }}>Loading tickets…</span>
    </div>
  );

  if (error && !data.length) return (
    <div className="lp-page" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:12 }}>
      <span style={{ color:"#DC2626", fontSize:14 }}>{error}</span>
      <button className="lp-btn-primary" onClick={fetchData}>Retry</button>
    </div>
  );

  return (
    <div className="lp-page">

      {/* ── Page header ── */}
      <div className="lp-header">
        <div>
          <h1 className="lp-title">IT Support Tickets</h1>
          <p className="lp-subtitle">Track and manage hardware &amp; software issue tickets</p>
        </div>
        <button className="lp-btn-primary" onClick={openAdd}>+ New Ticket</button>
      </div>

      {/* ── Inline error banner ── */}
      {error && (
        <div style={{ margin:"0 20px", padding:"10px 14px", background:"#FEE2E2", color:"#991B1B", borderRadius:8, fontSize:13 }}>
          {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="lp-stats">
        <StatCard label="Total Tickets" value={stats.total}      accent="#2878C8" icon={IconTicket} />
        <StatCard label="Open"          value={stats.open}       accent="#713F12" icon={IconAlert}  />
        <StatCard label="In Progress"   value={stats.inProgress} accent="#1E40AF" icon={IconClock}  />
        <StatCard label="Critical"      value={stats.critical}   accent="#991B1B" icon={IconFire}   />
      </div>

      {/* ── Table card ── */}
      <div className="lp-card">
        {/* Toolbar */}
        <div className="lp-toolbar">
          <input className="lp-search" placeholder="Search tickets…" value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }} />
          <div className="lp-toolbar-filters">
            <select className="lp-sel" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="lp-sel" value={priorityFilter} onChange={e => setPriority(e.target.value)}>
              <option value="">All Priority</option>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="lp-sel" value={issueFilter} onChange={e => setIssue(e.target.value)}>
              <option value="">All Issues</option>
              {ISSUE_TYPES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} className="lp-th" style={{ width: h.getSize() }}
                        onClick={h.column.getToggleSortingHandler()}>
                      <div className="lp-th-inner">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === "asc" ? " ↑" : h.column.getIsSorted() === "desc" ? " ↓" : ""}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0
                ? <tr><td colSpan={columns.length} className="lp-empty">No tickets found.</td></tr>
                : table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="lp-tr">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="lp-td">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="lp-pagination">
          <span className="lp-pg-info">
            {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
            {" · "}Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="lp-pg-btns">
            <button className="lp-pg-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</button>
            {Array.from({ length: Math.min(table.getPageCount(), 10) }, (_, i) => (
              <button key={i}
                className={`lp-pg-btn${table.getState().pagination.pageIndex === i ? " lp-pg-btn--active" : ""}`}
                onClick={() => table.setPageIndex(i)}>{i + 1}</button>
            ))}
            <button className="lp-pg-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</button>
          </div>
          <select className="lp-sel" style={{ width: "auto" }} value={pagination.pageSize}
            onChange={e => setPagination(p => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))}>
            {[10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="lp-overlay" onClick={close}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">{editRow ? "Edit Ticket" : "New Ticket"}</h2>
              <button className="lp-modal-close" onClick={close}>✕</button>
            </div>
            <div className="lp-modal-body">
              <div className="lp-form-grid">
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Ticket No</label>
                  {inp("ticketNo")}
                </div>
                <div className="lp-form-group">
                  {/* spacer — keeps ticket no on left in 2-col grid */}
                </div>
                <div className="lp-form-group lp-col-2">
                  <label className="lp-form-lbl">Title *</label>
                  {inp("title")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Asset Name</label>
                  {inp("assetName")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Asset Serial</label>
                  {inp("assetSerial")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Reported By</label>
                  {inp("reportedBy")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Department</label>
                  {sel("department", DEPARTMENTS)}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Issue Type</label>
                  {sel("issueType", ISSUE_TYPES)}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Priority</label>
                  {sel("priority", PRIORITIES)}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Status</label>
                  {sel("status", STATUSES)}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Assigned To</label>
                  {sel("assignedTo", IT_STAFF)}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Resolved At</label>
                  {inp("resolvedAt", "date")}
                </div>
                <div className="lp-form-group lp-col-2">
                  <label className="lp-form-lbl">Remarks</label>
                  <textarea className="lp-form-inp" rows={2} value={form.remarks ?? ""}
                    onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-secondary" onClick={close} disabled={saving}>Cancel</button>
              <button className="lp-btn-primary"   onClick={save}  disabled={saving}>
                {saving ? "Saving…" : editRow ? "Save Changes" : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteRow && (
        <div className="lp-overlay" onClick={() => setDeleteRow(null)}>
          <div className="lp-modal lp-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">Delete Ticket</h2>
              <button className="lp-modal-close" onClick={() => setDeleteRow(null)}>✕</button>
            </div>
            <div className="lp-modal-body">
              <p style={{ color: "var(--clr-text)", margin: 0, lineHeight: 1.6 }}>
                Delete <strong>{deleteRow.ticketNo}</strong>: "{deleteRow.title}"? This cannot be undone.
              </p>
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-secondary" onClick={() => setDeleteRow(null)}>Cancel</button>
              <button className="lp-btn-danger"    onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
