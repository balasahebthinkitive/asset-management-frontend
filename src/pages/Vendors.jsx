import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import INITIAL_DATA from "../data/vendorsData";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../api/vendors";
import StatCard from "../components/StatCard";
import StatusBadge, {
  VENDOR_TYPE_COLORS,
  VENDOR_ACTIVE_COLORS,
} from "../components/StatusBadge";
import "./Laptops.css";

const VENDOR_TYPES = ["Purchase", "Rental", "Repair"];

const EMPTY_FORM = {
  name: "", contactPerson: "", email: "", phone: "",
  vendorType: "Purchase", gstin: "", website: "",
  address: "", isActive: true, remarks: "",
};

/* ── icons ── */
const IconStore  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconBuy    = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconRent   = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const IconWrench = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IconEdit   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

export default function Vendors() {
  const [data, setData]           = useState(INITIAL_DATA);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [typeFilter, setType]     = useState("");
  const [activeFilter, setActive] = useState("");
  const [sorting, setSorting]     = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [deleteRow, setDeleteRow] = useState(null);

  /* ── fetch from API ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await getVendors();
      const items = res.data?.vendors ?? res.data ?? [];
      setData(items.length ? items : INITIAL_DATA);
    } catch (err) {
      // Only surface an error if the server responded with a failure (4xx/5xx).
      // Network errors (backend offline) silently fall back to static data.
      if (err.response) setError('Failed to load vendors from server. Showing cached data.');
      setData(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:    data.length,
    purchase: data.filter(d => d.vendorType === "Purchase").length,
    rental:   data.filter(d => d.vendorType === "Rental").length,
    repair:   data.filter(d => d.vendorType === "Repair").length,
  }), [data]);

  /* ── filtered rows ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(r => {
      const matchSearch = !q || [r.name, r.contactPerson, r.email, r.phone, r.gstin, r.address]
        .some(v => v?.toLowerCase().includes(q));
      const matchType   = !typeFilter || r.vendorType === typeFilter;
      const matchActive = activeFilter === ""
        ? true : activeFilter === "active" ? r.isActive : !r.isActive;
      return matchSearch && matchType && matchActive;
    });
  }, [data, search, typeFilter, activeFilter]);

  /* ── columns ── */
  const columns = useMemo(() => [
    { accessorKey: "id",            header: "#",             size: 50  },
    { accessorKey: "name",          header: "Vendor Name",   size: 180 },
    { accessorKey: "contactPerson", header: "Contact Person",size: 140 },
    { accessorKey: "email",         header: "Email",         size: 180 },
    { accessorKey: "phone",         header: "Phone",         size: 120 },
    {
      accessorKey: "vendorType",
      header: "Type",
      size: 100,
      cell: ({ getValue }) => (
        <StatusBadge value={getValue()} colorMap={VENDOR_TYPE_COLORS} />
      ),
    },
    { accessorKey: "gstin",         header: "GSTIN",         size: 160 },
    { accessorKey: "website",       header: "Website",       size: 150 },
    { accessorKey: "address",       header: "Address",       size: 160 },
    {
      accessorKey: "isActive",
      header: "Status",
      size: 90,
      cell: ({ getValue }) => (
        <StatusBadge
          value={getValue() ? "Active" : "Inactive"}
          colorMap={VENDOR_ACTIVE_COLORS}
        />
      ),
    },
    { accessorKey: "remarks",       header: "Remarks",       size: 160 },
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
  const openAdd  = () => { setEditRow(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setShowModal(true); };
  const close    = () => { setShowModal(false); setEditRow(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editRow) {
        await updateVendor(editRow.id, form);
      } else {
        await createVendor(form);
      }
      await fetchData();
      close();
    } catch {
      if (editRow) {
        setData(prev => prev.map(r => r.id === editRow.id ? { ...r, ...form } : r));
      } else {
        setData(prev => [...prev, { ...form, id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1 }]);
      }
      close();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteVendor(deleteRow.id);
      await fetchData();
    } catch {
      setData(prev => prev.filter(r => r.id !== deleteRow.id));
    }
    setDeleteRow(null);
  };

  const inp = (key, type = "text") => (
    <input type={type} className="lp-form-inp" value={form[key] ?? ""}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
  );

  if (loading) return (
    <div className="lp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <p style={{ color: 'var(--clr-text-muted)', fontSize: 15 }}>Loading vendors…</p>
    </div>
  );

  return (
    <div className="lp-page">

      {/* ── Error banner ── */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          {error} <button onClick={fetchData} style={{ marginLeft: 12, fontWeight: 700, background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="lp-header">
        <div>
          <h1 className="lp-title">Vendor Management</h1>
          <p className="lp-subtitle">Manage purchase, rental and repair vendors</p>
        </div>
        <button className="lp-btn-primary" onClick={openAdd}>+ Add Vendor</button>
      </div>


      {/* ── Stat cards ── */}
      <div className="lp-stats">
        <StatCard label="Total Vendors" value={stats.total}    accent="#2878C8" icon={IconStore}  />
        <StatCard label="Purchase"      value={stats.purchase} accent="#1E40AF" icon={IconBuy}    />
        <StatCard label="Rental"        value={stats.rental}   accent="#92400E" icon={IconRent}   />
        <StatCard label="Repair"        value={stats.repair}   accent="#065F46" icon={IconWrench} />
      </div>

      {/* ── Table card ── */}
      <div className="lp-card">
        {/* Toolbar */}
        <div className="lp-toolbar">
          <input className="lp-search" placeholder="Search vendors…" value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }} />
          <div className="lp-toolbar-filters">
            <select className="lp-sel" value={typeFilter} onChange={e => setType(e.target.value)}>
              <option value="">All Types</option>
              {VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="lp-sel" value={activeFilter} onChange={e => setActive(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                ? <tr><td colSpan={columns.length} className="lp-empty">No vendors found.</td></tr>
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
            {filtered.length} vendor{filtered.length !== 1 ? "s" : ""}
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
              <h2 className="lp-modal-title">{editRow ? "Edit Vendor" : "Add Vendor"}</h2>
              <button className="lp-modal-close" onClick={close}>✕</button>
            </div>
            <div className="lp-modal-body">
              <div className="lp-form-grid">
                <div className="lp-form-group lp-col-2">
                  <label className="lp-form-lbl">Vendor Name *</label>
                  {inp("name")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Contact Person</label>
                  {inp("contactPerson")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Email</label>
                  {inp("email", "email")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Phone</label>
                  {inp("phone", "tel")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Vendor Type</label>
                  <select className="lp-form-inp" value={form.vendorType}
                    onChange={e => setForm(f => ({ ...f, vendorType: e.target.value }))}>
                    {VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">GSTIN</label>
                  {inp("gstin")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Website</label>
                  {inp("website")}
                </div>
                <div className="lp-form-group">
                  <label className="lp-form-lbl">Status</label>
                  <select className="lp-form-inp"
                    value={form.isActive ? "active" : "inactive"}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.value === "active" }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="lp-form-group lp-col-2">
                  <label className="lp-form-lbl">Address</label>
                  {inp("address")}
                </div>
                <div className="lp-form-group lp-col-2">
                  <label className="lp-form-lbl">Remarks</label>
                  <textarea className="lp-form-inp" rows={2} value={form.remarks ?? ""}
                    onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-secondary" onClick={close}>Cancel</button>
              <button className="lp-btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : editRow ? "Save Changes" : "Add Vendor"}
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
              <h2 className="lp-modal-title">Delete Vendor</h2>
              <button className="lp-modal-close" onClick={() => setDeleteRow(null)}>✕</button>
            </div>
            <div className="lp-modal-body">
              <p style={{ color: "var(--clr-text)", margin: 0, lineHeight: 1.6 }}>
                Delete <strong>{deleteRow.name}</strong>? This action cannot be undone.
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
