import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import INITIAL_DATA from "../data/mouseData";
import "./Laptops.css";

const BADGE = {
  Assigned:    { bg: "rgba(40,120,200,0.12)",  color: "#2878C8" },
  Available:   { bg: "rgba(176,194,31,0.15)",  color: "#6a7a00" },
  Maintenance: { bg: "#fef3c7", color: "#92400e" },
  "Not Found": { bg: "#fee2e2", color: "#991b1b" },
  "Not Working":{ bg: "#f3f4f6", color: "#374151" },
};

const EMPTY_FORM = { type:"Wired", brand:"Lenovo", model:"300", serial:"", assigned:"", status:"Available", location:"", remark:"" };
const BRANDS    = ["Lenovo","DELL","LAPCARE","INTEX","Cosmic Byte","Marvo","Other"];
const TYPES     = ["Wired","Wireless"];
const STATUSES  = ["Assigned","Available","Maintenance","Not Found","Not Working"];
const LOCATIONS = ["ABIL","TEERTH","AMBROSIA",""];

export default function Mouse() {
  const [assets, setAssets]             = useState(INITIAL_DATA);
  const [search, setSearch]             = useState("");
  const [filterBrand, setFilterBrand]   = useState("");
  const [filterType, setFilterType]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sorting, setSorting]           = useState([]);
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 15 });

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const q = search.toLowerCase();
      const matchSearch   = !q || [a.brand,a.model,a.serial,a.assigned,a.remark].some(v => v?.toLowerCase().includes(q));
      const matchBrand    = !filterBrand    || a.brand === filterBrand;
      const matchType     = !filterType     || a.type === filterType;
      const matchStatus   = !filterStatus   || a.status === filterStatus;
      const matchLocation = !filterLocation || a.location === filterLocation;
      return matchSearch && matchBrand && matchType && matchStatus && matchLocation;
    });
  }, [assets, search, filterBrand, filterType, filterStatus, filterLocation]);

  const columns = useMemo(() => [
    { accessorKey: "id",       header: "#",          size: 50  },
    { accessorKey: "type",     header: "Type",       size: 90,
      cell: i => <span className="lp-type-badge" style={{ background: i.getValue()==="Wireless"?"#FEF3C7":"#DBEAFE", color: i.getValue()==="Wireless"?"#92400E":"#1E40AF" }}>{i.getValue()}</span> },
    { accessorKey: "brand",    header: "Brand",      size: 100 },
    { accessorKey: "model",    header: "Model",      size: 80  },
    { accessorKey: "serial",   header: "Serial No",  size: 180,
      cell: i => <span className="lp-mono">{i.getValue() || "—"}</span> },
    { accessorKey: "assigned", header: "Assigned To",size: 200 },
    { accessorKey: "status",   header: "Status",     size: 120,
      cell: i => { const b = BADGE[i.getValue()] || BADGE.Available; return <span className="lp-status-badge" style={b}>{i.getValue()}</span>; } },
    { accessorKey: "location", header: "Location",   size: 100 },
    { accessorKey: "remark",   header: "Remark",     size: 180,
      cell: i => <span className="lp-notes" title={i.getValue()}>{i.getValue() || "—"}</span> },
    { id: "actions", header: "Actions", size: 120, enableSorting: false,
      cell: ({ row }) => (
        <span className="lp-action-btns">
          <button className="lp-btn-edit" onClick={() => { setForm({...row.original}); setEditId(row.original.id); setShowModal(true); }}>Edit</button>
          <button className="lp-btn-del"  onClick={() => setDeleteConfirm(row.original)}>Delete</button>
        </span>
      )},
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

  const openAdd    = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = () => {
    if (!form.brand || !form.model) {
      alert("Brand and Model are required.");
      return;
    }
    if (editId) {
      setAssets(prev => prev.map(a => a.id === editId ? {...form, id: editId} : a));
    } else {
      const newId = Math.max(...assets.map(a => a.id), 0) + 1;
      setAssets(prev => [...prev, {...form, id: newId}]);
      setPagination(p => ({ ...p, pageIndex: Math.floor(filtered.length / p.pageSize) }));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const stats = {
    total:       assets.length,
    assigned:    assets.filter(a => a.status === "Assigned").length,
    available:   assets.filter(a => a.status === "Available").length,
    issues:      assets.filter(a => ["Maintenance","Not Found","Not Working"].includes(a.status)).length,
    wireless:    assets.filter(a => a.type === "Wireless").length,
  };

  const Field = ({ field, label, type = "text", opts = null }) => (
    <div className="lp-form-field">
      <label className="lp-form-label">{label}</label>
      {opts ? (
        <select className="lp-form-inp" value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})}>
          {opts.map(o => <option key={o} value={o}>{o || "— none —"}</option>)}
        </select>
      ) : (
        <input type={type} className="lp-form-inp" value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})} />
      )}
    </div>
  );

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = filtered.length;
  const pageCount = table.getPageCount();
  const from = Math.min(pageIndex * pageSize + 1, totalRows);
  const to   = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="lp-page">

      {/* Page header */}
      <div className="lp-page-header" style={{ padding:"16px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:12 }}>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:"#111827", lineHeight:1.2 }}>Mouse</h1>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#6b7280" }}>{assets.length} total assets</p>
          </div>
          <button className="lp-add-btn" style={{ borderRadius:7, padding:"8px 18px" }} onClick={openAdd}>
            + Add New Asset
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:14 }}>
          {[
            { label:"Total",           val:stats.total,     color:"#2878C8", border:"#2878C8" },
            { label:"Assigned",        val:stats.assigned,  color:"#2878C8", border:"#2878C8" },
            { label:"Available",       val:stats.available, color:"#6a7a00", border:"#b0c21f" },
            { label:"Wireless",        val:stats.wireless,  color:"#7c3aed", border:"#7c3aed" },
            { label:"Issues",          val:stats.issues,    color:"#dc2626", border:"#dc2626" },
          ].map(s => (
            <div key={s.label} style={{ background:"#fff", border:"1px solid #e5e7eb", borderTop:`3px solid ${s.border}`, borderRadius:8, padding:"10px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:10, color:"#9ca3af", marginBottom:4, textTransform:"uppercase", letterSpacing:".07em", fontWeight:700 }}>{s.label}</div>
              <div style={{ fontSize:26, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main table card */}
      <div className="lp-card" style={{ margin:"0 20px 20px" }}>

        {/* Filter bar */}
        <div style={{ padding:"10px 14px", borderBottom:"1px solid #E5E7EB", display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", background:"#fafafa" }}>
          <input className="lp-search" placeholder="Search brand, serial, assigned…" value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({...p, pageIndex:0})); }}
            style={{ width:220 }} />
          <select className="lp-sel lp-sel-sm" value={filterBrand}
            onChange={e => { setFilterBrand(e.target.value); setPagination(p => ({...p, pageIndex:0})); }}>
            <option value="">All brands</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="lp-sel lp-sel-sm" value={filterType}
            onChange={e => { setFilterType(e.target.value); setPagination(p => ({...p, pageIndex:0})); }}>
            <option value="">All types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="lp-sel lp-sel-sm" value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPagination(p => ({...p, pageIndex:0})); }}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="lp-sel lp-sel-sm" value={filterLocation}
            onChange={e => { setFilterLocation(e.target.value); setPagination(p => ({...p, pageIndex:0})); }}>
            <option value="">All locations</option>
            {LOCATIONS.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {(search || filterBrand || filterType || filterStatus || filterLocation) && (
            <button className="lp-btn-ghost" onClick={() => { setSearch(""); setFilterBrand(""); setFilterType(""); setFilterStatus(""); setFilterLocation(""); setPagination({pageIndex:0,pageSize:15}); }}>
              Clear
            </button>
          )}
          <span style={{ fontSize:12, color:"#9ca3af", marginLeft:"auto", whiteSpace:"nowrap" }}>{totalRows} results</span>
        </div>

        {/* Table */}
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} className="lp-th" onClick={h.column.getToggleSortingHandler()}
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
                <tr><td colSpan={columns.length} className="lp-empty">No assets found</td></tr>
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
              const pg = pageCount <= 5 ? i : pageIndex <= 2 ? i : pageIndex >= pageCount-3 ? pageCount-5+i : pageIndex-2+i;
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
              <h2 className="lp-modal-title">{editId ? "Edit Asset" : "Add New Asset"}</h2>
              <button className="lp-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="lp-modal-body">
              <div className="lp-form-grid">
                <Field field="brand"    label="Brand *"       opts={BRANDS}    />
                <Field field="type"     label="Type"          opts={TYPES}     />
                <Field field="model"    label="Model *"                        />
                <Field field="serial"   label="Serial No"                      />
                <Field field="status"   label="Status"        opts={STATUSES}  />
                <Field field="assigned" label="Assigned To"                    />
                <Field field="location" label="Location"      opts={LOCATIONS} />
                <Field field="remark"   label="Remark"                         />
              </div>
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="lp-btn-primary" onClick={handleSave}>{editId ? "Update Asset" : "Save Asset"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="lp-overlay">
          <div className="lp-modal lp-modal-sm">
            <div className="lp-modal-header">
              <h3 className="lp-modal-title">Delete Asset</h3>
              <button className="lp-modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="lp-modal-body">
              <p className="lp-del-msg">
                Are you sure you want to delete <strong>{deleteConfirm.brand} {deleteConfirm.model}</strong>
                {deleteConfirm.serial ? ` (${deleteConfirm.serial})` : ""}?<br />
                {deleteConfirm.assigned && <>Assigned to: <strong>{deleteConfirm.assigned}</strong></>}
              </p>
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="lp-btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
