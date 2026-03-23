import { useState, useMemo, useRef, useEffect } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import INITIAL_DATA from "../data/laptopsData";
import "./Laptops.css";

/* ─── constants ─────────────────────────────────────────────────────────── */
const BADGE = {
  assigned:    { bg: "#D1FAE5", color: "#065F46" },
  available:   { bg: "#DCFCE7", color: "#166534" },
  maintenance: { bg: "#FEF3C7", color: "#92400E" },
  "not found": { bg: "#FEE2E2", color: "#991B1B" },
  sold:        { bg: "#F3F4F6", color: "#374151" },
};

const TYPE_COLORS = {
  Laptop:         { bg: "#DBEAFE", color: "#1E40AF" },
  MacBook:        { bg: "#F3E8FF", color: "#6B21A8" },
  Ultrabook:      { bg: "#FEF9C3", color: "#854D0E" },
  Workstation:    { bg: "#FFE4E6", color: "#9F1239" },
  "Gaming Laptop":{ bg: "#ECFDF5", color: "#065F46" },
  Other:          { bg: "#F3F4F6", color: "#374151" },
};

const BRANDS      = ["Apple","HP","Lenovo","Asus","Other"];
const STATUSES    = ["assigned","available","maintenance","not found","sold"];
const LOCATIONS   = ["ABIL","TEERTH","AMBROSIA","ABIL Office","Teerth Office","Ambrosia Office",""];
const OS_LIST     = ["MacOS","Windows","Ubuntu","Dual",""];
const ASSET_TYPES = ["Laptop","MacBook","Ultrabook","Workstation","Gaming Laptop","Other"];
const DEPARTMENTS = ["Engineering","Design","HR","Finance","Marketing","Sales","IT","Management","Other",""];
const MAINTENANCE_STATUSES = ["","Pending","Under Repair","Repaired","Replaced","Cancelled"];
const ISSUE_TYPES = ["","Charging Port","Screen","Keyboard","Battery","Motherboard","RAM","Storage","Fan","Other"];
const FIELD_DEFAULTS = { assetType:"Laptop", warrantyExpiration:"", department:"", addedBy:"", lastUpdatedBy:"", dateAdded:"", lastUpdated:"", issueType:"", maintenanceStatus:"", repairCost:"", vendorName:"", ticketNumber:"", maintenanceDate:"", maintenanceNotes:"" };

const EMPTY_FORM = {
  brand:"", model:"", serial:"", ram:"", os:"", label:"", assigned:"",
  status:"assigned", location:"", purchaseDate:"", cost:"", working:"YES",
  remarks:"", assetType:"Laptop", warrantyExpiration:"", department:"",
  addedBy:"", lastUpdatedBy:"", dateAdded:"", lastUpdated:"",
  issueType:"", maintenanceStatus:"", repairCost:"", vendorName:"",
  ticketNumber:"", maintenanceDate:"", maintenanceNotes:""
};

const FILTER_FIELDS = [
  { label:"Asset Name",          key:"model" },
  { label:"Asset Type",          key:"assetType" },
  { label:"Asset Tag",           key:"label" },
  { label:"Brand",               key:"brand" },
  { label:"Status",              key:"status" },
  { label:"Assigned To",         key:"assigned" },
  { label:"Department",          key:"department" },
  { label:"Location",            key:"location" },
  { label:"Purchase Date",       key:"purchaseDate" },
  { label:"Purchase Cost",       key:"cost" },
  { label:"Warranty Expiration", key:"warrantyExpiration" },
  { label:"Notes",               key:"remarks" },
  { label:"Date Added",          key:"dateAdded" },
  { label:"Maintenance Status",  key:"maintenanceStatus" },
  { label:"Issue Type",          key:"issueType" },
  { label:"Repair Cost",         key:"repairCost" },
  { label:"Vendor Name",         key:"vendorName" },
  { label:"Ticket Number",       key:"ticketNumber" },
  { label:"Maintenance Date",    key:"maintenanceDate" },
  { label:"Maintenance Notes",   key:"maintenanceNotes" },
];

const OPERATORS = ["contains","equals","starts with","ends with","is empty","is not empty"];

function today() { return new Date().toLocaleDateString("en-IN"); }

/* ─── small helpers ──────────────────────────────────────────────────────── */
function TypeBadge({ value }) {
  const c = TYPE_COLORS[value] || TYPE_COLORS.Other;
  return (
    <span className="lp-type-badge" style={{ background: c.bg, color: c.color }}>
      {value || "—"}
    </span>
  );
}

function StatusBadge({ value }) {
  const c = BADGE[value] || BADGE.sold;
  return (
    <span className="lp-status-badge" style={{ background: c.bg, color: c.color }}>
      {value}
    </span>
  );
}

/* ─── Filter Panel ───────────────────────────────────────────────────────── */
function FilterPanel({ onClose, onApply, initial }) {
  const [matchMode, setMatchMode] = useState(initial.matchMode || "All");
  const [rows, setRows] = useState(
    initial.rows?.length ? initial.rows : [{ field: "", operator: "contains", value: "" }]
  );

  const setRow = (i, patch) => setRows(r => r.map((x, j) => j === i ? { ...x, ...patch } : x));
  const addRow = () => setRows(r => [...r, { field: "", operator: "contains", value: "" }]);
  const removeRow = (i) => setRows(r => r.filter((_, j) => j !== i));
  const clearAll = () => setRows([{ field: "", operator: "contains", value: "" }]);

  return (
    <div className="lp-panel">
      <div className="lp-panel-header">
        <span className="lp-panel-title">Filter by</span>
        <button className="lp-panel-close" onClick={onClose}>✕</button>
      </div>
      <div className="lp-panel-body">
        <div className="lp-filter-match">
          Match&nbsp;
          <select value={matchMode} onChange={e => setMatchMode(e.target.value)} className="lp-sel-sm">
            <option>All</option>
            <option>Any</option>
          </select>
          &nbsp;of these conditions
        </div>
        <table className="lp-cond-table">
          <thead>
            <tr>
              <th>Field name</th>
              <th>Operator</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <select value={row.field} onChange={e => setRow(i, { field: e.target.value })} className="lp-sel">
                    <option value="">— select —</option>
                    {FILTER_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </td>
                <td>
                  <select value={row.operator} onChange={e => setRow(i, { operator: e.target.value })} className="lp-sel">
                    {OPERATORS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </td>
                <td>
                  {row.operator !== "is empty" && row.operator !== "is not empty" && (
                    <input value={row.value} onChange={e => setRow(i, { value: e.target.value })} className="lp-inp" placeholder="Value" />
                  )}
                </td>
                <td>
                  {rows.length > 1 && (
                    <button className="lp-row-del" onClick={() => removeRow(i)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lp-panel-footer">
        <button className="lp-btn-ghost lp-btn-red" onClick={clearAll}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          &nbsp;Clear all
        </button>
        <div style={{ display:"flex", gap:8 }}>
          <button className="lp-btn-ghost" onClick={addRow}>Add more</button>
          <button className="lp-btn-primary" onClick={() => onApply({ matchMode, rows })}>Apply</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sort Panel ─────────────────────────────────────────────────────────── */
function SortPanel({ onClose, onApply, initial }) {
  const [rows, setRows] = useState(
    initial?.length ? initial : [{ field: "", direction: "Ascending" }]
  );
  const setRow = (i, patch) => setRows(r => r.map((x, j) => j === i ? { ...x, ...patch } : x));
  const addRow = () => setRows(r => [...r, { field: "", direction: "Ascending" }]);

  return (
    <div className="lp-panel">
      <div className="lp-panel-header">
        <span className="lp-panel-title">Sort by</span>
        <button className="lp-panel-close" onClick={onClose}>✕</button>
      </div>
      <div className="lp-panel-body">
        {rows.map((row, i) => (
          <div key={i} className="lp-sort-row">
            <div className="lp-sort-field">
              <label className="lp-sort-label">Sorting field</label>
              <select value={row.field} onChange={e => setRow(i, { field: e.target.value })} className="lp-sel">
                <option value="">— select —</option>
                {FILTER_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>
            <div className="lp-sort-dir">
              <label className="lp-sort-label">Value</label>
              <select value={row.direction} onChange={e => setRow(i, { direction: e.target.value })} className="lp-sel">
                <option>Ascending</option>
                <option>Descending</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <div className="lp-panel-footer">
        <div />
        <div style={{ display:"flex", gap:8 }}>
          <button className="lp-btn-ghost" onClick={addRow}>Add more</button>
          <button className="lp-btn-primary" onClick={() => onApply(rows)}>Apply</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Group By Panel ─────────────────────────────────────────────────────── */
function GroupByPanel({ onClose, onApply, initial }) {
  const [field, setField] = useState(initial || "");

  return (
    <div className="lp-panel">
      <div className="lp-panel-header">
        <span className="lp-panel-title">Group by</span>
        <button className="lp-panel-close" onClick={onClose}>✕</button>
      </div>
      <div className="lp-panel-body">
        <label className="lp-sort-label" style={{ display:"block", marginBottom:8 }}>Primary grouping option</label>
        <div className="lp-group-select-wrap">
          <select value={field} onChange={e => setField(e.target.value)} className="lp-sel lp-sel-lg">
            <option value="">— None —</option>
            {FILTER_FIELDS.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="lp-panel-footer">
        <div />
        <button className="lp-btn-primary" onClick={() => onApply(field)}>Apply</button>
      </div>
    </div>
  );
}

/* ─── View Panel (column visibility + order) ────────────────────────────── */
const COLUMN_META = [
  { id:"model",              label:"Asset Name",          type:"text"   },
  { id:"assetType",          label:"Asset Type",          type:"text"   },
  { id:"label",              label:"Asset Tag",           type:"text"   },
  { id:"status",             label:"Status",              type:"text"   },
  { id:"purchaseDate",       label:"Purchase Date",       type:"date"   },
  { id:"cost",               label:"Purchase Cost",       type:"number" },
  { id:"warrantyExpiration", label:"Warranty Expiration", type:"date"   },
  { id:"remarks",            label:"Notes",               type:"long"   },
  { id:"id",                 label:"ID",                  type:"number" },
  { id:"dateAdded",          label:"Date Added",          type:"date"   },
  { id:"lastUpdated",        label:"Last Updated",        type:"date"   },
  { id:"addedBy",            label:"Added By",            type:"text"   },
  { id:"lastUpdatedBy",      label:"Last Updated By",     type:"text"   },
  { id:"assigned",           label:"Assigned To",         type:"text"   },
  { id:"department",         label:"Department",          type:"text"   },
  { id:"location",           label:"Location",            type:"text"   },
  { id:"brand",              label:"Brand",               type:"text"   },
  { id:"serial",             label:"Serial No",           type:"text"   },
  { id:"ram",                label:"RAM",                 type:"text"   },
  { id:"os",                 label:"OS",                  type:"text"   },
  { id:"maintenanceStatus",  label:"Maintenance Status",  type:"text"   },
  { id:"issueType",          label:"Issue Type",          type:"text"   },
  { id:"repairCost",         label:"Repair Cost",         type:"number" },
  { id:"vendorName",         label:"Vendor Name",         type:"text"   },
  { id:"ticketNumber",       label:"Ticket Number",       type:"text"   },
  { id:"maintenanceDate",    label:"Maintenance Date",    type:"date"   },
  { id:"maintenanceNotes",   label:"Maintenance Notes",   type:"long"   },
];

function FieldTypeIcon({ type }) {
  if (type === "date") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  );
  if (type === "number") return (
    <span style={{ fontWeight:700, fontSize:12 }}>#</span>
  );
  if (type === "long") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>
  );
  return <span style={{ fontWeight:700, fontSize:12 }}>T</span>;
}

function EyeIcon({ open }) {
  if (open) return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  );
}

function DragHandle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="lp-drag-dots">
      <circle cx="9" cy="5" r="1.5" fill="#9CA3AF"/><circle cx="15" cy="5" r="1.5" fill="#9CA3AF"/>
      <circle cx="9" cy="12" r="1.5" fill="#9CA3AF"/><circle cx="15" cy="12" r="1.5" fill="#9CA3AF"/>
      <circle cx="9" cy="19" r="1.5" fill="#9CA3AF"/><circle cx="15" cy="19" r="1.5" fill="#9CA3AF"/>
    </svg>
  );
}

const DEFAULT_VISIBILITY = Object.fromEntries(COLUMN_META.map(c => [c.id, true]));
const DEFAULT_ORDER = ["select", ...COLUMN_META.map(c => c.id), "actions"];

/* ─── New Field Modal ────────────────────────────────────────────────────── */
const DATA_TYPES = ["Text","Long text","Number","Date","Yes/No","Email","URL","Currency"];
const TYPE_HINT = {
  "Text":      "Limited to 256 characters",
  "Long text": "No character limit",
  "Number":    "Numeric values only",
  "Date":      "Format: DD-MM-YYYY",
  "Yes/No":    "Boolean: Yes or No",
  "Email":     "Must be a valid email address",
  "URL":       "Must be a valid URL",
  "Currency":  "Formatted as currency (₹)",
};
const DATA_TYPE_META = { "Text":"text","Long text":"long","Number":"number","Date":"date","Yes/No":"text","Email":"text","URL":"text","Currency":"number" };

function NewFieldModal({ onClose, onSave }) {
  const [fieldName,   setFieldName]   = useState("");
  const [pullFrom,    setPullFrom]    = useState(false);
  const [dataType,    setDataType]    = useState("Text");
  const [defValue,    setDefValue]    = useState("");
  const [required,    setRequired]    = useState(false);
  const [unique,      setUnique]      = useState(false);
  const [readOnly,    setReadOnly]    = useState(false);
  const [helperOn,    setHelperOn]    = useState(false);
  const [helperText,  setHelperText]  = useState("");

  const handleSave = () => {
    if (!fieldName.trim()) { alert("Field name is required."); return; }
    onSave({ fieldName: fieldName.trim(), dataType, defValue, required, unique, readOnly, helperText: helperOn ? helperText : "", pullFrom });
  };

  return (
    <div className="lp-overlay">
      <div className="nf-modal">
        <div className="nf-modal-header">
          <span className="nf-modal-title">New field</span>
          <button className="nf-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="nf-modal-body">
          <div className="nf-field">
            <label className="nf-label">Field name</label>
            <input className="nf-input" value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="" autoFocus />
          </div>

          <div className="nf-toggle-row">
            <button className={`nf-toggle${pullFrom ? " nf-toggle--on" : ""}`} onClick={() => setPullFrom(p => !p)} type="button">
              <span className="nf-toggle-thumb" />
            </button>
            <span className="nf-toggle-label">Pull from another collection</span>
          </div>

          <div className="nf-field">
            <label className="nf-label">Data type</label>
            <select className="nf-select" value={dataType} onChange={e => setDataType(e.target.value)}>
              {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            {TYPE_HINT[dataType] && <span className="nf-type-hint">{TYPE_HINT[dataType]}</span>}
          </div>

          <div className="nf-field">
            <label className="nf-label">Default value</label>
            <input className="nf-input" value={defValue} onChange={e => setDefValue(e.target.value)} />
          </div>

          <div className="nf-checks">
            <label className="nf-check-row"><input type="checkbox" className="nf-chk" checked={required}  onChange={e => setRequired(e.target.checked)}  /> Set as required</label>
            <label className="nf-check-row"><input type="checkbox" className="nf-chk" checked={unique}    onChange={e => setUnique(e.target.checked)}    /> Set as unique field</label>
            <label className="nf-check-row"><input type="checkbox" className="nf-chk" checked={readOnly}  onChange={e => setReadOnly(e.target.checked)}  /> Set as read-only field</label>
            <label className="nf-check-row"><input type="checkbox" className="nf-chk" checked={helperOn}  onChange={e => setHelperOn(e.target.checked)}  /> Add helper text</label>
            {helperOn && (
              <input className="nf-input nf-helper-inp" value={helperText} onChange={e => setHelperText(e.target.value)} placeholder="Enter helper text..." />
            )}
          </div>
        </div>
        <div className="nf-modal-footer">
          <button className="lp-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="lp-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function ViewPanel({ visibility, onToggle, onReset, order, onReorder, columnMeta, onAddField }) {
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(null);
  const dragItem = useRef(null);

  const displayed = columnMeta.filter(c =>
    !search || c.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragStart = (id) => { dragItem.current = id; };
  const handleDragOver  = (e, id) => { e.preventDefault(); setDragOver(id); };
  const handleDrop      = (targetId) => {
    if (!dragItem.current || dragItem.current === targetId) { setDragOver(null); return; }
    const src = dragItem.current;
    const newOrder = [...order];
    const si = newOrder.indexOf(src);
    const ti = newOrder.indexOf(targetId);
    if (si < 0 || ti < 0) { setDragOver(null); return; }
    newOrder.splice(si, 1);
    newOrder.splice(ti, 0, src);
    onReorder(newOrder);
    dragItem.current = null;
    setDragOver(null);
  };

  return (
    <div className="lp-panel lp-view-panel">
      <div className="lp-view-panel-topbar">
        <div className="lp-view-search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="lp-view-search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="lp-view-reset" onClick={onReset}>Reset</button>
      </div>
      <div className="lp-view-fields-header">
        <span className="lp-view-fields-title">Fields</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <button className="lp-view-add-field-btn" onClick={onAddField} title="Add new field">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </button>
        </div>
      </div>
      <div className="lp-view-fields-list">
        {displayed.map(col => (
          <div
            key={col.id}
            className={`lp-view-field-row${dragOver === col.id ? " lp-view-field-drag-over" : ""}`}
            draggable
            onDragStart={() => handleDragStart(col.id)}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={() => handleDrop(col.id)}
            onDragLeave={() => setDragOver(null)}
          >
            <DragHandle />
            <span className="lp-view-field-icon">
              <FieldTypeIcon type={col.type} />
            </span>
            <span className="lp-view-field-name">{col.label}</span>
            <button
              className={`lp-view-eye-btn${visibility[col.id] !== false ? " lp-view-eye-btn--on" : ""}`}
              onClick={() => onToggle(col.id)}
              title={visibility[col.id] !== false ? "Hide column" : "Show column"}
            >
              <EyeIcon open={visibility[col.id] !== false} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Column Header Menu ─────────────────────────────────────────────────── */
function ColHeaderMenu({ onAscending, onDescending, onAddLeft, onAddRight, onPin, onHide, onSettings, menuRef }) {
  return (
    <div className="lp-col-menu" ref={menuRef}>
      <button className="lp-col-menu-item" onClick={onAscending}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="19" y2="18"/><polyline points="3 6 6 3 9 6"/></svg>
        Ascending
      </button>
      <button className="lp-col-menu-item" onClick={onDescending}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="19" y2="18"/><polyline points="3 18 6 21 9 18"/></svg>
        Descending
      </button>
      <div className="lp-col-menu-divider" />
      <button className="lp-col-menu-item" onClick={onAddLeft}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Add field to left
      </button>
      <button className="lp-col-menu-item" onClick={onAddRight}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        Add field to right
      </button>
      <button className="lp-col-menu-item" onClick={onPin}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
        Pin to left
      </button>
      <button className="lp-col-menu-item" onClick={onHide}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        Hide
      </button>
      <button className="lp-col-menu-item" onClick={onSettings}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.41 14.14M4.93 4.93A10 10 0 0 0 3.52 19.07M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        Settings
      </button>
    </div>
  );
}

/* ─── Export Menu ────────────────────────────────────────────────────────── */
function exportCSV(data) {
  const headers = ["ID","Brand","Asset Type","Asset Name","Serial","RAM","OS","Asset Tag","Status","Assigned To","Department","Location","Purchase Date","Purchase Cost","Warranty Expiration","Notes","Date Added","Last Updated"];
  const rows = data.map(a => [
    a.id, a.brand, a.assetType, a.model, a.serial, a.ram, a.os, a.label,
    a.status, a.assigned, a.department, a.location, a.purchaseDate, a.cost,
    a.warrantyExpiration, a.remarks, a.dateAdded, a.lastUpdated,
  ].map(v => `"${(v ?? "").toString().replace(/"/g,'""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "laptops.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Laptops() {
  const [assets, setAssets]         = useState(() => INITIAL_DATA.map(a => ({ ...FIELD_DEFAULTS, ...a })));
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sorting, setSorting]       = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [rowSelection, setRowSelection] = useState({});

  // Custom fields added via "New field" modal
  const [customFields, setCustomFields]         = useState([]);
  const [showNewField, setShowNewField]         = useState(false);
  const [insertPos,    setInsertPos]            = useState(null); // {colId, side:'left'|'right'}

  // Column header context menu
  const [headerMenuCol, setHeaderMenuCol]       = useState(null);
  const headerMenuRef = useRef(null);

  // Column visibility & order
  const [columnVisibility, setColumnVisibility] = useState({ ...DEFAULT_VISIBILITY });
  const [columnOrder, setColumnOrder]           = useState([...DEFAULT_ORDER]);

  // All column meta (static + custom)
  const allColumnMeta = useMemo(() => [
    ...COLUMN_META,
    ...customFields.map(f => ({ id: f.id, label: f.label, type: DATA_TYPE_META[f.dataType] || "text", custom: true }))
  ], [customFields]);

  // Panel state
  const [activePanel, setActivePanel] = useState(null); // 'filter' | 'sort' | 'group' | 'view' | null
  const [exportOpen, setExportOpen]   = useState(false);
  const [addDropOpen, setAddDropOpen] = useState(false);

  // Applied filter/sort/group
  const [appliedFilter, setAppliedFilter] = useState({ matchMode:"All", rows:[] });
  const [appliedSort,   setAppliedSort]   = useState([]);
  const [appliedGroup,  setAppliedGroup]  = useState("");

  const exportRef = useRef(null);
  const addDropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
      if (addDropRef.current && !addDropRef.current.contains(e.target)) setAddDropOpen(false);
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) setHeaderMenuCol(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* filtering logic */
  const filtered = useMemo(() => {
    let data = assets;
    // search
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(a =>
        [a.brand,a.model,a.serial,a.assigned,a.label,a.location,a.assetType,a.department]
          .some(v => v?.toLowerCase().includes(q))
      );
    }
    // applied filter conditions
    const conds = appliedFilter.rows.filter(r => r.field);
    if (conds.length) {
      const check = (a) => conds.map(r => {
        const val = (a[r.field] ?? "").toString().toLowerCase();
        const target = (r.value || "").toLowerCase();
        switch (r.operator) {
          case "equals":       return val === target;
          case "starts with":  return val.startsWith(target);
          case "ends with":    return val.endsWith(target);
          case "is empty":     return !val;
          case "is not empty": return !!val;
          default:             return val.includes(target); // contains
        }
      });
      data = data.filter(a =>
        appliedFilter.matchMode === "Any"
          ? check(a).some(Boolean)
          : check(a).every(Boolean)
      );
    }
    return data;
  }, [assets, search, appliedFilter]);

  /* sorting from sort panel */
  const sortedData = useMemo(() => {
    if (!appliedSort.length || !appliedSort[0].field) return filtered;
    return [...filtered].sort((a, b) => {
      for (const s of appliedSort) {
        if (!s.field) continue;
        const av = (a[s.field] ?? "").toString().toLowerCase();
        const bv = (b[s.field] ?? "").toString().toLowerCase();
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        if (cmp !== 0) return s.direction === "Descending" ? -cmp : cmp;
      }
      return 0;
    });
  }, [filtered, appliedSort]);

  /* group by */
  const groupedData = useMemo(() => {
    if (!appliedGroup) return null;
    const groups = {};
    sortedData.forEach(a => {
      const key = (a[appliedGroup] || "—");
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  }, [sortedData, appliedGroup]);

  /* columns */
  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="lp-chk" />
      ),
      cell: ({ row }) => (
        <input type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="lp-chk" />
      ),
      size: 40, enableSorting: false,
    },
    { accessorKey: "model",              header: "Asset Name",          size: 200 },
    { accessorKey: "assetType",          header: "Asset Type",          size: 120,
      cell: i => <TypeBadge value={i.getValue()} /> },
    { accessorKey: "label",              header: "Asset Tag",           size: 120,
      cell: i => <span className="lp-mono">{i.getValue() || "—"}</span> },
    { accessorKey: "status",             header: "Status",              size: 110,
      cell: i => <StatusBadge value={i.getValue()} /> },
    { accessorKey: "purchaseDate",       header: "Purchase Date",       size: 115 },
    { accessorKey: "cost",               header: "Purchase Cost",       size: 120,
      cell: i => i.getValue() ? `₹${Number(i.getValue()).toLocaleString("en-IN")}` : "—" },
    { accessorKey: "warrantyExpiration", header: "Warranty Expiration", size: 130 },
    { accessorKey: "remarks",            header: "Notes",               size: 180,
      cell: i => <span className="lp-notes">{i.getValue() || "—"}</span> },
    { accessorKey: "id",                 header: "ID",                  size: 60  },
    { accessorKey: "dateAdded",          header: "Date Added",          size: 105 },
    { accessorKey: "lastUpdated",        header: "Last Updated",        size: 110 },
    { accessorKey: "addedBy",            header: "Added By",            size: 120 },
    { accessorKey: "lastUpdatedBy",      header: "Last Updated By",     size: 130 },
    { accessorKey: "assigned",           header: "Assigned To",         size: 160 },
    { accessorKey: "department",         header: "Department",          size: 120 },
    { accessorKey: "location",           header: "Location",            size: 100 },
    { accessorKey: "brand",              header: "Brand",               size: 90  },
    { accessorKey: "serial",             header: "Serial No",           size: 140,
      cell: i => <span className="lp-mono">{i.getValue()}</span> },
    { accessorKey: "ram",                header: "RAM",                 size: 70  },
    { accessorKey: "os",                 header: "OS",                  size: 80  },
    { accessorKey: "maintenanceStatus", header: "Maintenance Status", size: 140,
      cell: i => {
        const v = i.getValue();
        if (!v) return "—";
        const c = v === "Under Repair" ? { bg:"#FEF3C7", color:"#92400E" }
                : v === "Repaired"     ? { bg:"#D1FAE5", color:"#065F46" }
                : v === "Replaced"     ? { bg:"#DBEAFE", color:"#1E40AF" }
                : v === "Cancelled"    ? { bg:"#F3F4F6", color:"#6B7280" }
                :                       { bg:"#FEE2E2", color:"#991B1B" };
        return <span className="lp-status-badge" style={{ background:c.bg, color:c.color }}>{v}</span>;
      }},
    { accessorKey: "issueType",        header: "Issue Type",         size: 130, cell: i => i.getValue() || "—" },
    { accessorKey: "repairCost",       header: "Repair Cost (₹)",    size: 120,
      cell: i => i.getValue() ? `₹${Number(i.getValue()).toLocaleString("en-IN")}` : "—" },
    { accessorKey: "vendorName",       header: "Vendor Name",        size: 140, cell: i => i.getValue() || "—" },
    { accessorKey: "ticketNumber",     header: "Ticket No",          size: 120,
      cell: i => i.getValue() ? <span className="lp-mono">{i.getValue()}</span> : "—" },
    { accessorKey: "maintenanceDate",  header: "Maintenance Date",   size: 120, cell: i => i.getValue() || "—" },
    { accessorKey: "maintenanceNotes", header: "Maintenance Notes",  size: 180,
      cell: i => <span className="lp-notes">{i.getValue() || "—"}</span> },
    { id: "actions", header: "Actions", size: 130, enableSorting: false,
      cell: ({ row }) => (
        <span className="lp-action-btns">
          <button className="lp-btn-edit"
            onClick={() => { setForm({...row.original}); setEditId(row.original.id); setShowModal(true); }}>
            Edit
          </button>
          <button className="lp-btn-del" onClick={() => setDeleteConfirm(row.original)}>
            Delete
          </button>
        </span>
      )},
    // Dynamic custom field columns
    ...customFields.map(f => ({
      accessorKey: f.id,
      header: f.label,
      size: 140,
      cell: i => {
        const v = i.getValue();
        if (v === undefined || v === null || v === "") return <span style={{ color:"#9CA3AF" }}>—</span>;
        if (f.dataType === "Currency") return `₹${Number(v).toLocaleString("en-IN")}`;
        if (f.dataType === "Yes/No") {
          const c = v === "Yes" ? { bg:"#D1FAE5", color:"#065F46" } : { bg:"#F3F4F6", color:"#6B7280" };
          return <span className="lp-status-badge" style={c}>{v}</span>;
        }
        return <span>{v}</span>;
      },
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [customFields]);

  const table = useReactTable({
    data: sortedData,
    columns,
    state: { sorting, pagination, rowSelection, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); setAddDropOpen(false); };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = () => {
    if (!form.brand || !form.model || !form.serial) {
      alert("Brand, Model and Serial No are required.");
      return;
    }
    const now = today();
    if (editId) {
      setAssets(prev => prev.map(a => a.id === editId ? { ...form, id: editId, lastUpdated: now } : a));
    } else {
      const newId = Math.max(...assets.map(a => a.id), 0) + 1;
      setAssets(prev => [...prev, { ...form, id: newId, dateAdded: now, lastUpdated: now }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const togglePanel = (name) => setActivePanel(p => p === name ? null : name);

  const handleAddField = (fieldDef) => {
    const id = "custom_" + fieldDef.fieldName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const newField = { id, label: fieldDef.fieldName, dataType: fieldDef.dataType, defValue: fieldDef.defValue, required: fieldDef.required };
    setCustomFields(prev => [...prev, newField]);
    setColumnVisibility(v => ({ ...v, [id]: true }));
    setColumnOrder(o => {
      const next = [...o];
      if (insertPos) {
        const ti = next.indexOf(insertPos.colId);
        next.splice(ti >= 0 ? (insertPos.side === "left" ? ti : ti + 1) : (next.indexOf("actions") >= 0 ? next.indexOf("actions") : next.length), 0, id);
      } else {
        const ai = next.indexOf("actions");
        next.splice(ai >= 0 ? ai : next.length, 0, id);
      }
      return next;
    });
    // add default value to all existing assets
    if (fieldDef.defValue) {
      setAssets(prev => prev.map(a => ({ ...a, [id]: fieldDef.defValue })));
    }
    setInsertPos(null);
    setShowNewField(false);
  };

  const filterActive = appliedFilter.rows.some(r => r.field);
  const sortActive   = appliedSort.some(r => r.field);
  const groupActive  = !!appliedGroup;

  const selectedCount = Object.keys(rowSelection).length;

  /* ── form helper ── */
  const inp = (field, label, type = "text", opts = null) => (
    <div className="lp-form-field">
      <label className="lp-form-label">{label}</label>
      {opts ? (
        <select value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} className="lp-form-inp">
          {opts.map(o => <option key={o} value={o}>{o || "— none —"}</option>)}
        </select>
      ) : (
        <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} className="lp-form-inp" />
      )}
    </div>
  );

  /* ── render grouped table ── */
  const renderGroupedRows = () => {
    const fieldLabel = FILTER_FIELDS.find(f => f.key === appliedGroup)?.label || appliedGroup;
    return Object.entries(groupedData).map(([key, rows]) => (
      <tbody key={key}>
        <tr className="lp-group-header-row">
          <td colSpan={columns.length}>
            <span className="lp-group-label">{fieldLabel}: </span>
            <span className="lp-group-value">{key}</span>
            <span className="lp-group-count">{rows.length}</span>
          </td>
        </tr>
        {rows.map((row, i) => (
          <tr key={row.id} className={`lp-tr${i % 2 === 0 ? "" : " lp-tr-alt"}`}>
            {columns.map(col => {
              const val = col.accessorKey ? row[col.accessorKey] : null;
              return (
                <td key={col.id || col.accessorKey} className="lp-td">
                  {col.cell ? col.cell({ getValue: () => val, row: { original: row, getIsSelected: () => false, getToggleSelectedHandler: () => () => {} } }) : (val ?? "—")}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    ));
  };

  return (
    <div className="lp-page">

      {/* ── Page header ── */}
      <div className="lp-page-header">
        <div className="lp-breadcrumb">
          <span className="lp-bread-home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </span>
          <span className="lp-bread-sep">›</span>
          <span className="lp-bread-cur">Assets</span>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="lp-card">

        {/* ── Toolbar ── */}
        <div className="lp-toolbar">
          <div className="lp-toolbar-left">
            <h2 className="lp-card-title">Assets</h2>
          </div>
          <div className="lp-toolbar-right">
            {/* Search */}
            <div className="lp-search-wrap">
              <svg className="lp-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="lp-search"
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
              />
            </div>

            {/* Filter */}
            <button
              className={`lp-tool-btn${activePanel === "filter" || filterActive ? " lp-tool-btn--active" : ""}`}
              onClick={() => togglePanel("filter")}
              title="Filter by"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </button>

            {/* Sort */}
            <button
              className={`lp-tool-btn${activePanel === "sort" || sortActive ? " lp-tool-btn--active" : ""}`}
              onClick={() => togglePanel("sort")}
              title="Sort by"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="19" y2="18"/><polyline points="3 6 6 3 9 6"/><polyline points="3 18 6 21 9 18"/></svg>
            </button>

            {/* Group by */}
            <button
              className={`lp-tool-btn${activePanel === "group" || groupActive ? " lp-tool-btn--active" : ""}`}
              onClick={() => togglePanel("group")}
              title="Group by"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>

            {/* View */}
            <button
              className={`lp-tool-btn${activePanel === "view" ? " lp-tool-btn--active" : ""}`}
              onClick={() => togglePanel("view")}
              title="View options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>

            {/* ⋮ export menu */}
            <div className="lp-menu-wrap" ref={exportRef}>
              <button
                className={`lp-tool-btn${exportOpen ? " lp-tool-btn--active" : ""}`}
                onClick={() => setExportOpen(o => !o)}
                title="More options"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
              </button>
              {exportOpen && (
                <div className="lp-dropdown">
                  <button className="lp-dd-item" onClick={() => { exportCSV(sortedData); setExportOpen(false); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export as CSV
                  </button>
                  <button className="lp-dd-item" onClick={() => { alert("PDF export coming soon"); setExportOpen(false); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export as PDF
                  </button>
                  <button className="lp-dd-item" onClick={() => { alert("Excel export coming soon"); setExportOpen(false); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export as Excel
                  </button>
                  <div className="lp-dd-divider" />
                  <button className="lp-dd-item" onClick={() => setExportOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    Row summary
                  </button>
                </div>
              )}
            </div>

            {/* Add button */}
            <div className="lp-add-wrap" ref={addDropRef}>
              <div className="lp-add-split">
                <button className="lp-add-btn" onClick={openAdd}>Add</button>
                <button className="lp-add-arr" onClick={() => setAddDropOpen(o => !o)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              {addDropOpen && (
                <div className="lp-dropdown lp-dropdown-right">
                  <button className="lp-dd-item" onClick={openAdd}>Add single asset</button>
                  <button className="lp-dd-item" onClick={() => { alert("Bulk import coming soon"); setAddDropOpen(false); }}>Bulk import</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filter/sort/group badges */}
        {(filterActive || sortActive || groupActive) && (
          <div className="lp-active-filters">
            {filterActive && (
              <span className="lp-filter-badge">
                Filter active
                <button onClick={() => setAppliedFilter({ matchMode:"All", rows:[] })}>✕</button>
              </span>
            )}
            {sortActive && (
              <span className="lp-filter-badge">
                Sorted by {FILTER_FIELDS.find(f => f.key === appliedSort[0]?.field)?.label}
                <button onClick={() => setAppliedSort([])}>✕</button>
              </span>
            )}
            {groupActive && (
              <span className="lp-filter-badge">
                Grouped by {FILTER_FIELDS.find(f => f.key === appliedGroup)?.label}
                <button onClick={() => setAppliedGroup("")}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Collection count + selection bar */}
        <div className="lp-collection-bar">
          <span className="lp-collection-count">
            {sortedData.length} record{sortedData.length !== 1 ? "s" : ""} in collection
          </span>
          {selectedCount > 0 && (
            <span className="lp-selected-info">{selectedCount} selected</span>
          )}
        </div>

        {/* Panels */}
        {activePanel === "filter" && (
          <FilterPanel
            initial={appliedFilter}
            onClose={() => setActivePanel(null)}
            onApply={(f) => { setAppliedFilter(f); setActivePanel(null); setPagination(p => ({ ...p, pageIndex: 0 })); }}
          />
        )}
        {activePanel === "sort" && (
          <SortPanel
            initial={appliedSort}
            onClose={() => setActivePanel(null)}
            onApply={(s) => { setAppliedSort(s); setActivePanel(null); }}
          />
        )}
        {activePanel === "group" && (
          <GroupByPanel
            initial={appliedGroup}
            onClose={() => setActivePanel(null)}
            onApply={(g) => { setAppliedGroup(g); setActivePanel(null); }}
          />
        )}
        {activePanel === "view" && (
          <ViewPanel
            visibility={columnVisibility}
            order={columnOrder}
            columnMeta={allColumnMeta}
            onToggle={(id) => setColumnVisibility(v => ({ ...v, [id]: v[id] === false ? true : false }))}
            onReset={() => { setColumnVisibility({ ...DEFAULT_VISIBILITY }); setColumnOrder([...DEFAULT_ORDER]); }}
            onReorder={setColumnOrder}
            onAddField={() => setShowNewField(true)}
          />
        )}

        {/* Table */}
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => {
                    const colId = h.column.id;
                    const showMenu = colId !== "select" && colId !== "actions";
                    return (
                      <th key={h.id} className="lp-th lp-th-with-menu"
                        style={{ width: h.getSize() }}>
                        <div className="lp-th-inner"
                          onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                          style={{ cursor: h.column.getCanSort() ? "pointer" : "default" }}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getIsSorted() === "asc"  ? " ↑" :
                           h.column.getIsSorted() === "desc" ? " ↓" :
                           h.column.getCanSort()             ? <span className="lp-sort-hint"> ↕</span> : ""}
                        </div>
                        {showMenu && (
                          <div className="lp-th-menu-wrap">
                            <button className="lp-th-menu-btn"
                              onClick={e => { e.stopPropagation(); setHeaderMenuCol(p => p === colId ? null : colId); }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
                            </button>
                            {headerMenuCol === colId && (
                              <ColHeaderMenu
                                menuRef={headerMenuRef}
                                onAscending={() => { setSorting([{id:colId,desc:false}]); setHeaderMenuCol(null); }}
                                onDescending={() => { setSorting([{id:colId,desc:true}]); setHeaderMenuCol(null); }}
                                onAddLeft={() => { setInsertPos({colId,side:"left"}); setShowNewField(true); setHeaderMenuCol(null); }}
                                onAddRight={() => { setInsertPos({colId,side:"right"}); setShowNewField(true); setHeaderMenuCol(null); }}
                                onPin={() => {
                                  setColumnOrder(o => {
                                    const next = o.filter(id => id !== colId);
                                    const after = next.indexOf("select");
                                    next.splice(after >= 0 ? after + 1 : 0, 0, colId);
                                    return next;
                                  });
                                  setHeaderMenuCol(null);
                                }}
                                onHide={() => { setColumnVisibility(v => ({...v,[colId]:false})); setHeaderMenuCol(null); }}
                                onSettings={() => { setInsertPos(null); setShowNewField(true); setHeaderMenuCol(null); }}
                              />
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {groupedData ? renderGroupedRows() : (
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr><td colSpan={columns.length} className="lp-empty">No assets found</td></tr>
                ) : table.getRowModel().rows.map((row, i) => (
                  <tr key={row.id} className={`lp-tr${i % 2 === 0 ? "" : " lp-tr-alt"}${row.getIsSelected() ? " lp-tr-sel" : ""}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="lp-td">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!groupedData && (() => {
          const { pageIndex, pageSize } = table.getState().pagination;
          const total = sortedData.length;
          const pageCount = table.getPageCount();
          const from = Math.min(pageIndex * pageSize + 1, total);
          const to   = Math.min((pageIndex + 1) * pageSize, total);
          return (
            <div className="lp-pagination">
              <span className="lp-pg-info">
                {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
              </span>
              <div className="lp-pg-btns">
                <button className="lp-pg-btn" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>← Prev</button>
                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                  const pg = pageCount <= 5 ? i : pageIndex <= 2 ? i : pageIndex >= pageCount-3 ? pageCount-5+i : pageIndex-2+i;
                  return (
                    <button key={pg} className={`lp-pg-btn${pageIndex === pg ? " lp-pg-btn--active" : ""}`}
                      onClick={() => table.setPageIndex(pg)}>{pg + 1}</button>
                  );
                })}
                <button className="lp-pg-btn" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next →</button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── New Field Modal ── */}
      {showNewField && (
        <NewFieldModal
          onClose={() => setShowNewField(false)}
          onSave={handleAddField}
        />
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="lp-overlay">
          <div className="lp-modal">
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">{editId ? "Edit Asset" : "Add New Asset"}</h2>
              <button className="lp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="lp-modal-body">
              <div className="lp-form-grid">
                {inp("brand",              "Brand *",             "text", BRANDS)}
                {inp("assetType",          "Asset Type",          "text", ASSET_TYPES)}
                {inp("model",              "Asset Name / Model *")}
                {inp("serial",             "Serial No *")}
                {inp("label",              "Asset Tag")}
                {inp("ram",                "RAM")}
                {inp("os",                 "Operating System",    "text", OS_LIST)}
                {inp("status",             "Status",              "text", STATUSES)}
                {inp("working",            "Working",             "text", ["YES","NO"])}
                {inp("assigned",           "Assigned To")}
                {inp("department",         "Department",          "text", DEPARTMENTS)}
                {inp("location",           "Office Location",     "text", LOCATIONS)}
                {inp("purchaseDate",       "Purchase Date")}
                {inp("cost",               "Purchase Cost (₹)",   "number")}
                {inp("warrantyExpiration", "Warranty Expiration")}
                {inp("addedBy",            "Added By")}
                {inp("lastUpdatedBy",      "Last Updated By")}
              </div>
              {inp("remarks", "Notes")}
              <div className="lp-form-section-divider">
                <span className="lp-form-section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  Maintenance & Repair
                </span>
              </div>
              <div className="lp-form-grid">
                {inp("maintenanceStatus", "Maintenance Status", "text", MAINTENANCE_STATUSES)}
                {inp("issueType",         "Issue Type",         "text", ISSUE_TYPES)}
                {inp("repairCost",        "Repair Cost (₹)",    "number")}
                {inp("vendorName",        "Vendor Name")}
                {inp("ticketNumber",      "Ticket / Issue No")}
                {inp("maintenanceDate",   "Maintenance Date")}
              </div>
              {inp("maintenanceNotes", "Maintenance Notes")}
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="lp-btn-primary" onClick={handleSave}>
                {editId ? "Update Asset" : "Save Asset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="lp-overlay">
          <div className="lp-modal lp-modal-sm">
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">Delete Asset</h2>
              <button className="lp-modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="lp-modal-body">
              <p className="lp-del-msg">
                Are you sure you want to delete <strong>{deleteConfirm.model}</strong> ({deleteConfirm.serial})?<br />
                Assigned to: <strong>{deleteConfirm.assigned || "—"}</strong>
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
