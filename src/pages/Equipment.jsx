import { useState, useMemo, useRef, useEffect } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import INITIAL_DATA from "../data/equipmentData";
import "./Laptops.css";   // reuse all lp-* utility styles
import "./Equipment.css";

/* ─── constants ─────────────────────────────────────────────────────────── */
const EQUIPMENT_TYPES  = ["","Pressure Rig","Multimeter","Test Instrument","Generator","Monitor","Safety Equipment","Other"];
const CATEGORIES       = ["","Measurement","Electronics","Mechanical","Power","Safety","Other"];
const STATUSES         = ["Active","Under Repair","Retired","Decommissioned"];
const LOCATIONS        = ["ABIL","TEERTH","AMBROSIA","ABIL Office","Teerth Office","Ambrosia Office",""];
const DEPARTMENTS      = ["Engineering","Maintenance","IT","Facilities","Design","HR","Finance","Other",""];
const VENDORS          = ["TechCal India","Fluke Corp","Norbar Tools","Kirloskar Electric","Anritsu India","Controls Group","Parker Hannifin","FLIR Systems","TSI India","SKF India","APC India","Honeywell India","Other",""];

const STATUS_BADGE = {
  "Active":         { bg:"#D1FAE5", color:"#065F46" },
  "Under Repair":   { bg:"#FEF3C7", color:"#92400E" },
  "Retired":        { bg:"#F3F4F6", color:"#6B7280" },
  "Decommissioned": { bg:"#FEE2E2", color:"#991B1B" },
};
const YES_BADGE = { bg:"#DCFCE7", color:"#166534" };
const NO_BADGE  = { bg:"#F3F4F6", color:"#6B7280" };

function YNBadge({ value }) {
  const c = value === "Yes" ? YES_BADGE : NO_BADGE;
  return <span className="lp-status-badge" style={{ background:c.bg, color:c.color }}>{value}</span>;
}
function StatusBadge({ value }) {
  const c = STATUS_BADGE[value] || STATUS_BADGE.Active;
  return <span className="lp-status-badge" style={{ background:c.bg, color:c.color }}>{value}</span>;
}

const FIELD_DEFAULTS = {
  type:"", serial:"", safetyCritical:"No", calibRequired:"No", calibInterval:"",
  lastCalib:"", nextCalib:"", status:"Active", location:"", department:"", vendor:"",
  category:"", purchaseDate:"", cost:"", warrantyExp:"", notes:"", addedBy:"", dateAdded:""
};

const EMPTY_FORM = {
  equipmentId:"", name:"", type:"", serial:"", safetyCritical:"No", calibRequired:"No",
  calibInterval:"", lastCalib:"", nextCalib:"", status:"Active", location:"",
  department:"", vendor:"", category:"", purchaseDate:"", cost:"", warrantyExp:"",
  notes:"", addedBy:"", dateAdded:""
};

function today() { return new Date().toLocaleDateString("en-IN"); }
function nextEqId(list) {
  if (!list.length) return "EQ-1001";
  const nums = list.map(e => parseInt((e.equipmentId || "EQ-0").split("-")[1] || 0, 10));
  return `EQ-${(Math.max(...nums) + 1).toString().padStart(4,"0")}`;
}

const FILTER_FIELDS = [
  { label:"Equipment Name",       key:"name" },
  { label:"Equipment ID",         key:"equipmentId" },
  { label:"Equipment Type",       key:"type" },
  { label:"Serial Number",        key:"serial" },
  { label:"Safety Critical",      key:"safetyCritical" },
  { label:"Calibration Required", key:"calibRequired" },
  { label:"Status",               key:"status" },
  { label:"Location",             key:"location" },
  { label:"Department",           key:"department" },
  { label:"Vendor",               key:"vendor" },
  { label:"Category",             key:"category" },
  { label:"Next Calibration",     key:"nextCalib" },
  { label:"Last Calibration",     key:"lastCalib" },
];

const OPERATORS = ["contains","equals","starts with","ends with","is empty","is not empty"];

/* ─── Filter Panel ───────────────────────────────────────────────────────── */
function FilterPanel({ onClose, onApply, initial }) {
  const [matchMode, setMatchMode] = useState(initial.matchMode || "All");
  const [rows, setRows] = useState(initial.rows?.length ? initial.rows : [{ field:"", operator:"contains", value:"" }]);
  const setRow = (i, p) => setRows(r => r.map((x,j) => j===i ? {...x,...p} : x));
  const addRow = () => setRows(r => [...r, { field:"", operator:"contains", value:"" }]);
  const removeRow = (i) => setRows(r => r.filter((_,j) => j!==i));
  const clearAll = () => setRows([{ field:"", operator:"contains", value:"" }]);
  return (
    <div className="lp-panel">
      <div className="lp-panel-header"><span className="lp-panel-title">Filter by</span><button className="lp-panel-close" onClick={onClose}>✕</button></div>
      <div className="lp-panel-body">
        <div className="lp-filter-match">Match&nbsp;<select value={matchMode} onChange={e=>setMatchMode(e.target.value)} className="lp-sel-sm">{["All","Any"].map(o=><option key={o}>{o}</option>)}</select>&nbsp;of these conditions</div>
        <table className="lp-cond-table"><thead><tr><th>Field name</th><th>Operator</th><th>Value</th><th></th></tr></thead>
          <tbody>{rows.map((row,i)=>(
            <tr key={i}>
              <td><select value={row.field} onChange={e=>setRow(i,{field:e.target.value})} className="lp-sel"><option value="">— select —</option>{FILTER_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></td>
              <td><select value={row.operator} onChange={e=>setRow(i,{operator:e.target.value})} className="lp-sel">{OPERATORS.map(o=><option key={o}>{o}</option>)}</select></td>
              <td>{row.operator!=="is empty"&&row.operator!=="is not empty"&&<input value={row.value} onChange={e=>setRow(i,{value:e.target.value})} className="lp-inp" placeholder="Value"/>}</td>
              <td>{rows.length>1&&<button className="lp-row-del" onClick={()=>removeRow(i)}>✕</button>}</td>
            </tr>))}
          </tbody>
        </table>
      </div>
      <div className="lp-panel-footer">
        <button className="lp-btn-ghost lp-btn-red" onClick={clearAll}>🗑 Clear all</button>
        <div style={{display:"flex",gap:8}}><button className="lp-btn-ghost" onClick={addRow}>Add more</button><button className="lp-btn-primary" onClick={()=>onApply({matchMode,rows})}>Apply</button></div>
      </div>
    </div>
  );
}

/* ─── Sort Panel ─────────────────────────────────────────────────────────── */
function SortPanel({ onClose, onApply, initial }) {
  const [rows, setRows] = useState(initial?.length ? initial : [{ field:"", direction:"Ascending" }]);
  const setRow = (i,p) => setRows(r=>r.map((x,j)=>j===i?{...x,...p}:x));
  return (
    <div className="lp-panel">
      <div className="lp-panel-header"><span className="lp-panel-title">Sort by</span><button className="lp-panel-close" onClick={onClose}>✕</button></div>
      <div className="lp-panel-body">
        {rows.map((row,i)=>(
          <div key={i} className="lp-sort-row">
            <div className="lp-sort-field"><label className="lp-sort-label">Sorting field</label><select value={row.field} onChange={e=>setRow(i,{field:e.target.value})} className="lp-sel"><option value="">— select —</option>{FILTER_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select></div>
            <div className="lp-sort-dir"><label className="lp-sort-label">Value</label><select value={row.direction} onChange={e=>setRow(i,{direction:e.target.value})} className="lp-sel"><option>Ascending</option><option>Descending</option></select></div>
          </div>
        ))}
      </div>
      <div className="lp-panel-footer"><div/><div style={{display:"flex",gap:8}}><button className="lp-btn-ghost" onClick={()=>setRows(r=>[...r,{field:"",direction:"Ascending"}])}>Add more</button><button className="lp-btn-primary" onClick={()=>onApply(rows)}>Apply</button></div></div>
    </div>
  );
}

/* ─── Group By Panel ─────────────────────────────────────────────────────── */
function GroupByPanel({ onClose, onApply, initial }) {
  const [field, setField] = useState(initial || "");
  return (
    <div className="lp-panel">
      <div className="lp-panel-header"><span className="lp-panel-title">Group by</span><button className="lp-panel-close" onClick={onClose}>✕</button></div>
      <div className="lp-panel-body">
        <label className="lp-sort-label" style={{display:"block",marginBottom:8}}>Primary grouping option</label>
        <select value={field} onChange={e=>setField(e.target.value)} className="lp-sel" style={{maxWidth:380}}><option value="">— None —</option>{FILTER_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}</select>
      </div>
      <div className="lp-panel-footer"><div/><button className="lp-btn-primary" onClick={()=>onApply(field)}>Apply</button></div>
    </div>
  );
}

/* ─── View Panel ─────────────────────────────────────────────────────────── */
const COLUMN_META = [
  { id:"equipmentId",    label:"Equipment ID",         type:"text"   },
  { id:"name",           label:"Equipment Name",       type:"text"   },
  { id:"type",           label:"Equipment Type",       type:"text"   },
  { id:"serial",         label:"Serial Number",        type:"text"   },
  { id:"safetyCritical", label:"Safety Critical",      type:"text"   },
  { id:"calibRequired",  label:"Calibration Required", type:"text"   },
  { id:"calibInterval",  label:"Calibration Interval", type:"number" },
  { id:"lastCalib",      label:"Last Calibration",     type:"date"   },
  { id:"nextCalib",      label:"Next Calibration",     type:"date"   },
  { id:"status",         label:"Status",               type:"text"   },
  { id:"location",       label:"Location",             type:"text"   },
  { id:"department",     label:"Department",           type:"text"   },
  { id:"vendor",         label:"Vendor",               type:"text"   },
  { id:"category",       label:"Category",             type:"text"   },
  { id:"purchaseDate",   label:"Purchase Date",        type:"date"   },
  { id:"cost",           label:"Purchase Cost",        type:"number" },
  { id:"warrantyExp",    label:"Warranty Expiration",  type:"date"   },
  { id:"notes",          label:"Notes",                type:"long"   },
  { id:"addedBy",        label:"Added By",             type:"text"   },
  { id:"dateAdded",      label:"Date Added",           type:"date"   },
];
const DEFAULT_VISIBILITY = Object.fromEntries(COLUMN_META.map(c=>[c.id,true]));
const DEFAULT_ORDER = ["select",...COLUMN_META.map(c=>c.id),"actions"];

function FieldTypeIcon({ type }) {
  if (type==="date")   return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (type==="number") return <span style={{fontWeight:700,fontSize:11}}>#</span>;
  if (type==="long")   return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>;
  return <span style={{fontWeight:700,fontSize:11}}>T</span>;
}

function ViewPanel({ visibility, onToggle, onReset, order, onReorder }) {
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(null);
  const dragItem = useRef(null);
  const displayed = COLUMN_META.filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()));
  const handleDrop = (targetId) => {
    if (!dragItem.current || dragItem.current===targetId) { setDragOver(null); return; }
    const newOrder = [...order];
    const si = newOrder.indexOf(dragItem.current), ti = newOrder.indexOf(targetId);
    if (si>=0&&ti>=0) { newOrder.splice(si,1); newOrder.splice(ti,0,dragItem.current); onReorder(newOrder); }
    dragItem.current = null; setDragOver(null);
  };
  return (
    <div className="lp-panel lp-view-panel">
      <div className="lp-view-panel-topbar">
        <div className="lp-view-search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="lp-view-search" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <button className="lp-view-reset" onClick={onReset}>Reset</button>
      </div>
      <div className="lp-view-fields-header">
        <span className="lp-view-fields-title">Fields</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </div>
      <div className="lp-view-fields-list">
        {displayed.map(col=>(
          <div key={col.id} className={`lp-view-field-row${dragOver===col.id?" lp-view-field-drag-over":""}`}
            draggable onDragStart={()=>{dragItem.current=col.id;}}
            onDragOver={e=>{e.preventDefault();setDragOver(col.id);}}
            onDrop={()=>handleDrop(col.id)} onDragLeave={()=>setDragOver(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="lp-drag-dots">
              <circle cx="9" cy="5" r="1.5" fill="#9CA3AF"/><circle cx="15" cy="5" r="1.5" fill="#9CA3AF"/>
              <circle cx="9" cy="12" r="1.5" fill="#9CA3AF"/><circle cx="15" cy="12" r="1.5" fill="#9CA3AF"/>
              <circle cx="9" cy="19" r="1.5" fill="#9CA3AF"/><circle cx="15" cy="19" r="1.5" fill="#9CA3AF"/>
            </svg>
            <span className="lp-view-field-icon"><FieldTypeIcon type={col.type}/></span>
            <span className="lp-view-field-name">{col.label}</span>
            <button className={`lp-view-eye-btn${visibility[col.id]!==false?" lp-view-eye-btn--on":""}`} onClick={()=>onToggle(col.id)}>
              {visibility[col.id]!==false
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CSV Export ─────────────────────────────────────────────────────────── */
function exportCSV(data) {
  const heads = ["Equipment ID","Name","Type","Serial","Safety Critical","Calib Required","Calib Interval","Last Calib","Next Calib","Status","Location","Department","Vendor","Category","Purchase Date","Cost","Warranty","Notes","Added By","Date Added"];
  const rows = data.map(e=>[e.equipmentId,e.name,e.type,e.serial,e.safetyCritical,e.calibRequired,e.calibInterval,e.lastCalib,e.nextCalib,e.status,e.location,e.department,e.vendor,e.category,e.purchaseDate,e.cost,e.warrantyExp,e.notes,e.addedBy,e.dateAdded].map(v=>`"${(v??'').toString().replace(/"/g,'""')}"`).join(","));
  const blob = new Blob([[heads.join(","),...rows].join("\n")],{type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="equipment.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Equipment() {
  const [equipment, setEquipment] = useState(()=>INITIAL_DATA.map(e=>({...FIELD_DEFAULTS,...e})));
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sorting, setSorting]     = useState([]);
  const [pagination, setPagination] = useState({pageIndex:0,pageSize:15});
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({...DEFAULT_VISIBILITY});
  const [columnOrder, setColumnOrder]           = useState([...DEFAULT_ORDER]);
  const [activePanel, setActivePanel] = useState(null);
  const [exportOpen, setExportOpen]   = useState(false);
  const [addDropOpen, setAddDropOpen] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState({matchMode:"All",rows:[]});
  const [appliedSort,   setAppliedSort]   = useState([]);
  const [appliedGroup,  setAppliedGroup]  = useState("");

  const exportRef  = useRef(null);
  const addDropRef = useRef(null);

  useEffect(()=>{
    const h = (e)=>{
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
      if (addDropRef.current && !addDropRef.current.contains(e.target)) setAddDropOpen(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const filtered = useMemo(()=>{
    let data = equipment;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(e=>[e.name,e.equipmentId,e.type,e.serial,e.location,e.department,e.vendor].some(v=>v?.toLowerCase().includes(q)));
    }
    const conds = appliedFilter.rows.filter(r=>r.field);
    if (conds.length) {
      const check = (e)=>conds.map(r=>{
        const val=(e[r.field]??"").toString().toLowerCase(), target=(r.value||"").toLowerCase();
        switch(r.operator){case "equals":return val===target;case "starts with":return val.startsWith(target);case "ends with":return val.endsWith(target);case "is empty":return !val;case "is not empty":return !!val;default:return val.includes(target);}
      });
      data = data.filter(e=>appliedFilter.matchMode==="Any"?check(e).some(Boolean):check(e).every(Boolean));
    }
    return data;
  },[equipment,search,appliedFilter]);

  const sortedData = useMemo(()=>{
    if (!appliedSort.length||!appliedSort[0].field) return filtered;
    return [...filtered].sort((a,b)=>{
      for(const s of appliedSort){
        if(!s.field) continue;
        const av=(a[s.field]??"").toString().toLowerCase(), bv=(b[s.field]??"").toString().toLowerCase();
        const cmp=av<bv?-1:av>bv?1:0;
        if(cmp!==0) return s.direction==="Descending"?-cmp:cmp;
      }
      return 0;
    });
  },[filtered,appliedSort]);

  const groupedData = useMemo(()=>{
    if(!appliedGroup) return null;
    const groups={};
    sortedData.forEach(e=>{const k=(e[appliedGroup]||"—");if(!groups[k])groups[k]=[];groups[k].push(e);});
    return groups;
  },[sortedData,appliedGroup]);

  const columns = useMemo(()=>[
    { id:"select", header:({table})=><input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} className="lp-chk"/>,
      cell:({row})=><input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="lp-chk"/>, size:40, enableSorting:false },
    { accessorKey:"equipmentId", header:"Equipment ID", size:120,
      cell:i=><span className="eq-id-link">{i.getValue()}</span> },
    { accessorKey:"name",          header:"Equipment Name",       size:220 },
    { accessorKey:"type",          header:"Equipment Type",       size:150,
      cell:i=>{ const v=i.getValue(); if(!v) return "—"; const c=EQ_TYPE_COLORS[v]||EQ_TYPE_COLORS.Other; return <span className="lp-type-badge" style={{background:c.bg,color:c.color}}>{v}</span>; } },
    { accessorKey:"serial",        header:"Serial Number",        size:140,
      cell:i=><span className="lp-mono">{i.getValue()||"—"}</span> },
    { accessorKey:"safetyCritical",header:"Safety Critical",      size:120,
      cell:i=><YNBadge value={i.getValue()||"No"}/> },
    { accessorKey:"calibRequired", header:"Calibration Required", size:150,
      cell:i=><YNBadge value={i.getValue()||"No"}/> },
    { accessorKey:"calibInterval", header:"Calibration Interval (days)", size:170,
      cell:i=>i.getValue()?`${i.getValue()} days`:"—" },
    { accessorKey:"lastCalib",     header:"Last Calibration",     size:120, cell:i=>i.getValue()||"—" },
    { accessorKey:"nextCalib",     header:"Next Calibration",     size:120,
      cell:i=>{
        const v=i.getValue(); if(!v) return "—";
        const d=new Date(v.split("-").reverse().join("-")), now=new Date();
        const diff=Math.ceil((d-now)/(1000*60*60*24));
        const cls = diff<0?"eq-overdue":diff<=30?"eq-due-soon":"";
        return <span className={cls}>{v}</span>;
      }},
    { accessorKey:"status",        header:"Status",               size:120,
      cell:i=><StatusBadge value={i.getValue()||"Active"}/> },
    { accessorKey:"location",      header:"Location",             size:110, cell:i=>i.getValue()||"—" },
    { accessorKey:"department",    header:"Department",           size:120, cell:i=>i.getValue()||"—" },
    { accessorKey:"vendor",        header:"Vendor",               size:150, cell:i=>i.getValue()||"—" },
    { accessorKey:"category",      header:"Category",             size:110, cell:i=>i.getValue()||"—" },
    { accessorKey:"purchaseDate",  header:"Purchase Date",        size:115, cell:i=>i.getValue()||"—" },
    { accessorKey:"cost",          header:"Purchase Cost",        size:120,
      cell:i=>i.getValue()?`₹${Number(i.getValue()).toLocaleString("en-IN")}`:"—" },
    { accessorKey:"warrantyExp",   header:"Warranty Expiration",  size:140, cell:i=>i.getValue()||"—" },
    { accessorKey:"notes",         header:"Notes",                size:180,
      cell:i=><span className="lp-notes">{i.getValue()||"—"}</span> },
    { accessorKey:"addedBy",       header:"Added By",             size:120, cell:i=>i.getValue()||"—" },
    { accessorKey:"dateAdded",     header:"Date Added",           size:110, cell:i=>i.getValue()||"—" },
    { id:"actions", header:"Actions", size:130, enableSorting:false,
      cell:({row})=>(
        <span className="lp-action-btns">
          <button className="lp-btn-edit" onClick={()=>{setForm({...row.original});setEditId(row.original.id);setShowModal(true);}}>Edit</button>
          <button className="lp-btn-del"  onClick={()=>setDeleteConfirm(row.original)}>Delete</button>
        </span>
      )},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[]);

  const table = useReactTable({
    data: sortedData, columns,
    state:{sorting,pagination,rowSelection,columnVisibility,columnOrder},
    onSortingChange:setSorting, onPaginationChange:setPagination,
    onRowSelectionChange:setRowSelection, onColumnVisibilityChange:setColumnVisibility,
    onColumnOrderChange:setColumnOrder,
    getCoreRowModel:getCoreRowModel(), getSortedRowModel:getSortedRowModel(),
    getPaginationRowModel:getPaginationRowModel(), enableRowSelection:true,
  });

  const openAdd = () => {
    setForm({...EMPTY_FORM, equipmentId:nextEqId(equipment)});
    setEditId(null); setShowModal(true); setAddDropOpen(false);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = () => {
    if (!form.name||!form.serial) { alert("Equipment Name and Serial Number are required."); return; }
    const now = today();
    if (editId) {
      setEquipment(prev=>prev.map(e=>e.id===editId?{...form,id:editId}:e));
    } else {
      const newId = Math.max(...equipment.map(e=>e.id),0)+1;
      setEquipment(prev=>[...prev,{...form,id:newId,dateAdded:now}]);
    }
    closeModal();
  };

  const handleDelete = (id) => { setEquipment(prev=>prev.filter(e=>e.id!==id)); setDeleteConfirm(null); };
  const togglePanel  = (name) => setActivePanel(p=>p===name?null:name);

  const filterActive = appliedFilter.rows.some(r=>r.field);
  const sortActive   = appliedSort.some(r=>r.field);
  const groupActive  = !!appliedGroup;
  const selectedCount = Object.keys(rowSelection).length;

  /* stats */
  const stats = useMemo(()=>({
    total:      equipment.length,
    active:     equipment.filter(e=>e.status==="Active").length,
    underRepair:equipment.filter(e=>e.status==="Under Repair").length,
    overdueCalib:equipment.filter(e=>{
      if(!e.nextCalib||e.calibRequired!=="Yes") return false;
      const d=new Date(e.nextCalib.split("-").reverse().join("-"));
      return d<new Date();
    }).length,
  }),[equipment]);

  /* form helper */
  const inp = (field, label, type="text", opts=null) => (
    <div className="lp-form-field">
      <label className="lp-form-label">{label}</label>
      {opts
        ? <select value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} className="lp-form-inp">{opts.map(o=><option key={o} value={o}>{o||"— none —"}</option>)}</select>
        : <input type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} className="lp-form-inp"/>}
    </div>
  );

  return (
    <div className="lp-page eq-page">

      {/* breadcrumb */}
      <div className="lp-page-header">
        <div className="lp-breadcrumb">
          <span className="lp-bread-home"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
          <span className="lp-bread-sep">›</span>
          <span className="lp-bread-cur">Equipment &amp; Maintenance</span>
        </div>
      </div>

      {/* stat cards */}
      <div className="eq-stats-row">
        {[
          {label:"Total Equipment", val:stats.total,       color:"#0D9488", border:"#0D9488"},
          {label:"Active",          val:stats.active,      color:"#166534", border:"#16A34A"},
          {label:"Under Repair",    val:stats.underRepair, color:"#92400E", border:"#D97706"},
          {label:"Overdue Calib.",  val:stats.overdueCalib,color:"#991B1B", border:"#DC2626"},
        ].map(s=>(
          <div key={s.label} className="eq-stat-card" style={{borderTop:`3px solid ${s.border}`}}>
            <div className="eq-stat-label">{s.label}</div>
            <div className="eq-stat-val" style={{color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* main card */}
      <div className="lp-card">

        {/* toolbar */}
        <div className="lp-toolbar">
          <div className="lp-toolbar-left"><h2 className="lp-card-title">Equipment</h2></div>
          <div className="lp-toolbar-right">
            {/* search */}
            <div className="lp-search-wrap">
              <svg className="lp-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="lp-search" placeholder="Search..." value={search} onChange={e=>{setSearch(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}/>
            </div>
            {/* filter */}
            <button className={`lp-tool-btn${activePanel==="filter"||filterActive?" lp-tool-btn--active":""}`} onClick={()=>togglePanel("filter")} title="Filter by">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </button>
            {/* sort */}
            <button className={`lp-tool-btn${activePanel==="sort"||sortActive?" lp-tool-btn--active":""}`} onClick={()=>togglePanel("sort")} title="Sort by">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="19" y2="18"/><polyline points="3 6 6 3 9 6"/><polyline points="3 18 6 21 9 18"/></svg>
            </button>
            {/* group */}
            <button className={`lp-tool-btn${activePanel==="group"||groupActive?" lp-tool-btn--active":""}`} onClick={()=>togglePanel("group")} title="Group by">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            {/* view */}
            <button className={`lp-tool-btn${activePanel==="view"?" lp-tool-btn--active":""}`} onClick={()=>togglePanel("view")} title="View options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            {/* ⋮ menu */}
            <div className="lp-menu-wrap" ref={exportRef}>
              <button className={`lp-tool-btn${exportOpen?" lp-tool-btn--active":""}`} onClick={()=>setExportOpen(o=>!o)} title="More options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
              </button>
              {exportOpen&&(
                <div className="lp-dropdown">
                  <button className="lp-dd-item" onClick={()=>{exportCSV(sortedData);setExportOpen(false);}}>Export as CSV</button>
                  <button className="lp-dd-item" onClick={()=>{alert("PDF export coming soon");setExportOpen(false);}}>Export as PDF</button>
                  <button className="lp-dd-item" onClick={()=>{alert("Excel export coming soon");setExportOpen(false);}}>Export as Excel</button>
                </div>
              )}
            </div>
            {/* Add */}
            <div className="lp-add-wrap" ref={addDropRef}>
              <div className="lp-add-split">
                <button className="lp-add-btn" onClick={openAdd}>Add</button>
                <button className="lp-add-arr" onClick={()=>setAddDropOpen(o=>!o)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              {addDropOpen&&(
                <div className="lp-dropdown lp-dropdown-right">
                  <button className="lp-dd-item" onClick={openAdd}>Add single record</button>
                  <button className="lp-dd-item" onClick={()=>{alert("Bulk import coming soon");setAddDropOpen(false);}}>Bulk import</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* active filter/sort/group badges */}
        {(filterActive||sortActive||groupActive)&&(
          <div className="lp-active-filters">
            {filterActive&&<span className="lp-filter-badge">Filter active<button onClick={()=>setAppliedFilter({matchMode:"All",rows:[]})}>✕</button></span>}
            {sortActive&&<span className="lp-filter-badge">Sorted by {FILTER_FIELDS.find(f=>f.key===appliedSort[0]?.field)?.label}<button onClick={()=>setAppliedSort([])}>✕</button></span>}
            {groupActive&&<span className="lp-filter-badge">Grouped by {FILTER_FIELDS.find(f=>f.key===appliedGroup)?.label}<button onClick={()=>setAppliedGroup("")}>✕</button></span>}
          </div>
        )}

        {/* collection bar */}
        <div className="lp-collection-bar">
          <span className="lp-collection-count">{sortedData.length} record{sortedData.length!==1?"s":""} in collection</span>
          {selectedCount>0&&<span className="lp-selected-info">{selectedCount} selected</span>}
        </div>

        {/* panels */}
        {activePanel==="filter"&&<FilterPanel initial={appliedFilter} onClose={()=>setActivePanel(null)} onApply={f=>{setAppliedFilter(f);setActivePanel(null);setPagination(p=>({...p,pageIndex:0}));}}/>}
        {activePanel==="sort"&&<SortPanel initial={appliedSort} onClose={()=>setActivePanel(null)} onApply={s=>{setAppliedSort(s);setActivePanel(null);}}/>}
        {activePanel==="group"&&<GroupByPanel initial={appliedGroup} onClose={()=>setActivePanel(null)} onApply={g=>{setAppliedGroup(g);setActivePanel(null);}}/>}
        {activePanel==="view"&&<ViewPanel visibility={columnVisibility} order={columnOrder} onToggle={id=>setColumnVisibility(v=>({...v,[id]:v[id]===false}))} onReset={()=>{setColumnVisibility({...DEFAULT_VISIBILITY});setColumnOrder([...DEFAULT_ORDER]);}} onReorder={setColumnOrder}/>}

        {/* table */}
        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              {table.getHeaderGroups().map(hg=>(
                <tr key={hg.id}>
                  {hg.headers.map(h=>(
                    <th key={h.id} className="lp-th" onClick={h.column.getToggleSortingHandler()} style={{width:h.getSize(),cursor:h.column.getCanSort()?"pointer":"default"}}>
                      {flexRender(h.column.columnDef.header,h.getContext())}
                      {h.column.getIsSorted()==="asc"?" ↑":h.column.getIsSorted()==="desc"?" ↓":h.column.getCanSort()?<span className="lp-sort-hint"> ↕</span>:""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {groupedData ? (
              Object.entries(groupedData).map(([key,rows])=>(
                <tbody key={key}>
                  <tr className="lp-group-header-row"><td colSpan={columns.length}><span className="lp-group-label">{FILTER_FIELDS.find(f=>f.key===appliedGroup)?.label}: </span><span className="lp-group-value">{key}</span><span className="lp-group-count">{rows.length}</span></td></tr>
                  {rows.map((row,i)=>(
                    <tr key={row.id} className={`lp-tr${i%2===0?"":" lp-tr-alt"}`}>
                      {columns.map(col=>{
                        const val=col.accessorKey?row[col.accessorKey]:null;
                        return <td key={col.id||col.accessorKey} className="lp-td">{col.cell?col.cell({getValue:()=>val,row:{original:row,getIsSelected:()=>false,getToggleSelectedHandler:()=>()=>{}}}):val??"—"}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              ))
            ) : (
              <tbody>
                {table.getRowModel().rows.length===0
                  ? <tr><td colSpan={columns.length} className="lp-empty">No equipment found</td></tr>
                  : table.getRowModel().rows.map((row,i)=>(
                    <tr key={row.id} className={`lp-tr${i%2===0?"":" lp-tr-alt"}${row.getIsSelected()?" lp-tr-sel":""}`}>
                      {row.getVisibleCells().map(cell=>(
                        <td key={cell.id} className="lp-td">{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>

        {/* pagination */}
        {!groupedData&&(()=>{
          const {pageIndex,pageSize}=table.getState().pagination;
          const total=sortedData.length, pageCount=table.getPageCount();
          const from=Math.min(pageIndex*pageSize+1,total), to=Math.min((pageIndex+1)*pageSize,total);
          return (
            <div className="lp-pagination">
              <span className="lp-pg-info">{total===0?"No results":`Showing ${from}–${to} of ${total}`}</span>
              <div className="lp-pg-btns">
                <button className="lp-pg-btn" disabled={!table.getCanPreviousPage()} onClick={()=>table.previousPage()}>← Prev</button>
                {Array.from({length:Math.min(pageCount,5)},(_,i)=>{
                  const pg=pageCount<=5?i:pageIndex<=2?i:pageIndex>=pageCount-3?pageCount-5+i:pageIndex-2+i;
                  return <button key={pg} className={`lp-pg-btn${pageIndex===pg?" lp-pg-btn--active":""}`} onClick={()=>table.setPageIndex(pg)}>{pg+1}</button>;
                })}
                <button className="lp-pg-btn" disabled={!table.getCanNextPage()} onClick={()=>table.nextPage()}>Next →</button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Add/Edit Modal */}
      {showModal&&(
        <div className="lp-overlay">
          <div className="lp-modal">
            <div className="lp-modal-header">
              <h2 className="lp-modal-title">{editId?"Edit Equipment":"Add New Equipment"}</h2>
              <button className="lp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="lp-modal-body">
              <div className="lp-form-grid">
                {inp("equipmentId",    "Equipment ID")}
                {inp("name",           "Equipment Name *")}
                {inp("type",           "Equipment Type",       "text", EQUIPMENT_TYPES)}
                {inp("serial",         "Serial Number *")}
                {inp("category",       "Category",             "text", CATEGORIES)}
                {inp("status",         "Status",               "text", STATUSES)}
                {inp("safetyCritical", "Safety Critical",      "text", ["Yes","No"])}
                {inp("calibRequired",  "Calibration Required", "text", ["Yes","No"])}
                {inp("calibInterval",  "Calibration Interval (days)", "number")}
                {inp("lastCalib",      "Last Calibration Date")}
                {inp("nextCalib",      "Next Calibration Date")}
                {inp("location",       "Location",             "text", LOCATIONS)}
                {inp("department",     "Department",           "text", DEPARTMENTS)}
                {inp("vendor",         "Vendor",               "text", VENDORS)}
                {inp("purchaseDate",   "Purchase Date")}
                {inp("cost",           "Purchase Cost (₹)",    "number")}
                {inp("warrantyExp",    "Warranty Expiration")}
                {inp("addedBy",        "Added By")}
              </div>
              {inp("notes","Notes")}
            </div>
            <div className="lp-modal-footer">
              <button className="lp-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="lp-btn-primary" onClick={handleSave}>{editId?"Update":"Save Equipment"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm&&(
        <div className="lp-overlay">
          <div className="lp-modal lp-modal-sm">
            <div className="lp-modal-header"><h2 className="lp-modal-title">Delete Equipment</h2><button className="lp-modal-close" onClick={()=>setDeleteConfirm(null)}>✕</button></div>
            <div className="lp-modal-body"><p className="lp-del-msg">Are you sure you want to delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.equipmentId})?</p></div>
            <div className="lp-modal-footer">
              <button className="lp-btn-ghost" onClick={()=>setDeleteConfirm(null)}>Cancel</button>
              <button className="lp-btn-danger" onClick={()=>handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* type badge colors */
const EQ_TYPE_COLORS = {
  "Pressure Rig":   { bg:"#FEE2E2", color:"#991B1B" },
  "Multimeter":     { bg:"#DBEAFE", color:"#1E40AF" },
  "Test Instrument":{ bg:"#F3E8FF", color:"#6B21A8" },
  "Generator":      { bg:"#FEF3C7", color:"#92400E" },
  "Monitor":        { bg:"#DCFCE7", color:"#166534" },
  "Safety Equipment":{ bg:"#FFE4E6",color:"#9F1239" },
  "Other":          { bg:"#F3F4F6", color:"#374151" },
};
