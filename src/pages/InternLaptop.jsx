import { useState, useMemo, useEffect, useCallback } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import INITIAL_DATA from "../data/internLaptopData";
import { getInternLaptops, createInternLaptop, updateInternLaptop, deleteInternLaptop } from "../api/internLaptops";
import "./Laptops.css";

const BADGE = {
  Active:    { bg:"rgba(40,120,200,0.12)", color:"#2878C8" },
  Returned:  { bg:"rgba(176,194,31,0.15)", color:"#6a7a00" },
  Overdue:   { bg:"#fee2e2", color:"#991b1b" },
  Available: { bg:"#f3f4f6", color:"#374151" },
};
const EMPTY = { brand:"", model:"", serial:"", intern:"", department:"", startDate:"", endDate:"", status:"Active", location:"", remark:"" };
const BRANDS      = ["Apple","HP","Lenovo","Dell","Asus","Other"];
const STATUSES    = ["Active","Returned","Overdue","Available"];
const DEPARTMENTS = ["Engineering","Design","HR","Finance","Marketing","QA","Other"];
const LOCATIONS   = ["ABIL","TEERTH","AMBROSIA",""];

export default function InternLaptop() {
  const [assets, setAssets] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await getInternLaptops();
      const items = res.data?.laptops ?? res.data ?? [];
      setAssets(items.length ? items : INITIAL_DATA);
    } catch {
      setAssets(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus]=useState("");
  const [fDept, setFDept]   =useState("");
  const [showModal,setShowModal]=useState(false);
  const [editId,setEditId]  =useState(null);
  const [form,setForm]      =useState(EMPTY);
  const [delConfirm,setDelConfirm]=useState(null);
  const [sorting,setSorting]=useState([]);
  const [pagination,setPagination]=useState({pageIndex:0,pageSize:15});

  const filtered=useMemo(()=>assets.filter(a=>{
    const q=search.toLowerCase();
    return(!q||[a.brand,a.model,a.serial,a.intern,a.department].some(v=>v?.toLowerCase().includes(q)))
      &&(!fStatus||a.status===fStatus)&&(!fDept||a.department===fDept);
  }),[assets,search,fStatus,fDept]);

  const columns=useMemo(()=>[
    {accessorKey:"id",header:"#",size:50},
    {accessorKey:"brand",header:"Brand",size:90},
    {accessorKey:"model",header:"Model",size:140},
    {accessorKey:"serial",header:"Serial No",size:160,cell:i=><span className="lp-mono">{i.getValue()||"—"}</span>},
    {accessorKey:"intern",header:"Intern Name",size:180},
    {accessorKey:"department",header:"Dept",size:120},
    {accessorKey:"startDate",header:"Start Date",size:110,cell:i=>i.getValue()||"—"},
    {accessorKey:"endDate",header:"End Date",size:110,cell:i=>i.getValue()||"—"},
    {accessorKey:"status",header:"Status",size:110,cell:i=>{const b=BADGE[i.getValue()]||BADGE.Available;return<span className="lp-status-badge" style={b}>{i.getValue()}</span>;}},
    {accessorKey:"location",header:"Location",size:90},
    {id:"actions",header:"Actions",size:120,enableSorting:false,cell:({row})=><span className="lp-action-btns"><button className="lp-btn-edit" onClick={()=>{setForm({...row.original});setEditId(row.original.id);setShowModal(true);}}>Edit</button><button className="lp-btn-del" onClick={()=>setDelConfirm(row.original)}>Delete</button></span>},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[]);

  const table=useReactTable({data:filtered,columns,state:{sorting,pagination},onSortingChange:setSorting,onPaginationChange:setPagination,getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getPaginationRowModel:getPaginationRowModel()});
  const save=async()=>{if(!form.brand||!form.model){alert("Brand and Model required.");return;}try{setSaving(true);if(editId){await updateInternLaptop(editId,form);}else{await createInternLaptop(form);}await fetchData();setShowModal(false);setEditId(null);}catch(err){setError(err.response?.data?.message||"Save failed.");}finally{setSaving(false);}};

  const stats={total:assets.length,active:assets.filter(a=>a.status==="Active").length,returned:assets.filter(a=>a.status==="Returned").length,overdue:assets.filter(a=>a.status==="Overdue").length};
  const {pageIndex,pageSize}=table.getState().pagination,total=filtered.length,pc=table.getPageCount(),from=Math.min(pageIndex*pageSize+1,total),to=Math.min((pageIndex+1)*pageSize,total);
  const Field=({field,label,type="text",opts=null})=><div className="lp-form-field"><label className="lp-form-label">{label}</label>{opts?<select className="lp-form-inp" value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}>{opts.map(o=><option key={o} value={o}>{o||"— none —"}</option>)}</select>:<input type={type} className="lp-form-inp" value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}/>}</div>;

  if (loading) return (
    <div className="lp-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:300 }}>
      <span style={{ color:"#9ca3af", fontSize:14 }}>Loading…</span>
    </div>
  );

  return (
    <div className="lp-page">
      {error && (
        <div style={{ margin:"12px 20px 0", padding:"10px 14px", background:"#FEE2E2", color:"#991B1B", borderRadius:8, fontSize:13 }}>
          {error}
        </div>
      )}
      <div className="lp-page-header" style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:12}}>
          <div><h1 style={{margin:0,fontSize:20,fontWeight:700,color:"#111827"}}>Intern Laptops</h1><p style={{margin:"2px 0 0",fontSize:12,color:"#6b7280"}}>{assets.length} total assigned</p></div>
          <button className="lp-add-btn" style={{borderRadius:7,padding:"8px 18px"}} onClick={()=>{setForm(EMPTY);setEditId(null);setShowModal(true);}}>+ Assign Laptop</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {[{label:"Total",val:stats.total,color:"#2878C8",border:"#2878C8"},{label:"Active",val:stats.active,color:"#2878C8",border:"#2878C8"},{label:"Returned",val:stats.returned,color:"#6a7a00",border:"#b0c21f"},{label:"Overdue",val:stats.overdue,color:"#dc2626",border:"#dc2626"}].map(s=>(
            <div key={s.label} style={{background:"#fff",border:"1px solid #e5e7eb",borderTop:`3px solid ${s.border}`,borderRadius:8,padding:"10px 14px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:10,color:"#9ca3af",marginBottom:4,textTransform:"uppercase",letterSpacing:".07em",fontWeight:700}}>{s.label}</div>
              <div style={{fontSize:26,fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-card" style={{margin:"0 20px 20px"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",background:"#fafafa"}}>
          <input className="lp-search" placeholder="Search brand, model, intern…" value={search} onChange={e=>{setSearch(e.target.value);setPagination(p=>({...p,pageIndex:0}));}} style={{width:220}}/>
          <select className="lp-sel lp-sel-sm" value={fDept} onChange={e=>{setFDept(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}><option value="">All departments</option>{DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}</select>
          <select className="lp-sel lp-sel-sm" value={fStatus} onChange={e=>{setFStatus(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}><option value="">All statuses</option>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>
          {(search||fDept||fStatus)&&<button className="lp-btn-ghost" onClick={()=>{setSearch("");setFDept("");setFStatus("");setPagination({pageIndex:0,pageSize:15});}}>Clear</button>}
          <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{total} results</span>
        </div>
        <div className="lp-table-wrap"><table className="lp-table">
          <thead>{table.getHeaderGroups().map(hg=><tr key={hg.id}>{hg.headers.map(h=><th key={h.id} className="lp-th" onClick={h.column.getToggleSortingHandler()} style={{cursor:h.column.getCanSort()?"pointer":"default",width:h.getSize()}}>{flexRender(h.column.columnDef.header,h.getContext())}<span className="lp-sort-hint">{h.column.getIsSorted()==="asc"?" ↑":h.column.getIsSorted()==="desc"?" ↓":h.column.getCanSort()?" ↕":""}</span></th>)}</tr>)}</thead>
          <tbody>{table.getRowModel().rows.length===0?<tr><td colSpan={columns.length} className="lp-empty">No intern laptops found</td></tr>:table.getRowModel().rows.map((row,i)=><tr key={row.id} className={`lp-tr${i%2!==0?" lp-tr-alt":""}`}>{row.getVisibleCells().map(cell=><td key={cell.id} className="lp-td">{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)}</tbody>
        </table></div>
        <div className="lp-pagination">
          <span className="lp-pg-info">{total===0?"No results":`Showing ${from}–${to} of ${total}`}</span>
          <div className="lp-pg-btns">
            <button className="lp-pg-btn" disabled={!table.getCanPreviousPage()} onClick={()=>table.previousPage()}>← Prev</button>
            {Array.from({length:Math.min(pc,5)},(_,i)=>{const pg=pc<=5?i:pageIndex<=2?i:pageIndex>=pc-3?pc-5+i:pageIndex-2+i;return<button key={pg} className={`lp-pg-btn${pageIndex===pg?" lp-pg-btn--active":""}`} onClick={()=>table.setPageIndex(pg)}>{pg+1}</button>;})}
            <button className="lp-pg-btn" disabled={!table.getCanNextPage()} onClick={()=>table.nextPage()}>Next →</button>
          </div>
        </div>
      </div>
      {showModal&&<div className="lp-overlay"><div className="lp-modal"><div className="lp-modal-header"><h2 className="lp-modal-title">{editId?"Edit Record":"Assign Laptop"}</h2><button className="lp-modal-close" onClick={()=>{setShowModal(false);setEditId(null);}}>×</button></div><div className="lp-modal-body"><div className="lp-form-grid"><Field field="brand" label="Brand *" opts={BRANDS}/><Field field="model" label="Model *"/><Field field="serial" label="Serial No"/><Field field="intern" label="Intern Name"/><Field field="department" label="Department" opts={DEPARTMENTS}/><Field field="status" label="Status" opts={STATUSES}/><Field field="startDate" label="Start Date" type="date"/><Field field="endDate" label="End Date" type="date"/><Field field="location" label="Location" opts={LOCATIONS}/><Field field="remark" label="Remark"/></div></div><div className="lp-modal-footer"><button className="lp-btn-ghost" onClick={()=>{setShowModal(false);setEditId(null);}}>Cancel</button><button className="lp-btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":editId?"Update":"Save"}</button></div></div></div>}
      {delConfirm&&<div className="lp-overlay"><div className="lp-modal lp-modal-sm"><div className="lp-modal-header"><h3 className="lp-modal-title">Delete Record</h3><button className="lp-modal-close" onClick={()=>setDelConfirm(null)}>×</button></div><div className="lp-modal-body"><p className="lp-del-msg">Delete record for <strong>{delConfirm.intern}</strong> — {delConfirm.brand} {delConfirm.model}?</p></div><div className="lp-modal-footer"><button className="lp-btn-ghost" onClick={()=>setDelConfirm(null)}>Cancel</button><button className="lp-btn-danger" onClick={async()=>{try{await deleteInternLaptop(delConfirm._id||delConfirm.id);setDelConfirm(null);await fetchData();}catch(err){setError(err.response?.data?.message||"Delete failed.");setDelConfirm(null);}}}>Delete</button></div></div></div>}
    </div>
  );
}
