import { useState, useMemo, useEffect, useCallback } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import INITIAL_DATA from "../data/pendriveData";
import { getPendrives, createPendrive, updatePendrive, deletePendrive } from "../api/pendrive";
import "./Laptops.css";

const BADGE={Assigned:{bg:"rgba(40,120,200,0.12)",color:"#2878C8"},Available:{bg:"rgba(176,194,31,0.15)",color:"#6a7a00"},Faulty:{bg:"#fee2e2",color:"#991b1b"},"Not Found":{bg:"#fef3c7",color:"#92400e"}};
const EMPTY={brand:"",capacity:"16GB",serial:"",assigned:"",status:"Available",location:"",remark:""};
const BRANDS=["SanDisk","Kingston","HP","Samsung","Transcend","Other"];
const CAPACITIES=["8GB","16GB","32GB","64GB","128GB","256GB","Other"];
const STATUSES=["Assigned","Available","Faulty","Not Found"];
const LOCATIONS=["ABIL","TEERTH","AMBROSIA",""];

export default function Pendrive() {
  const [assets,setAssets]=useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await getPendrives();
      const items = res.data?.pendrives ?? res.data ?? [];
      setAssets(items.length ? items : INITIAL_DATA);
    } catch {
      setAssets(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  const [search,setSearch]=useState("");
  const [fBrand,setFBrand]=useState("");
  const [fStatus,setFStatus]=useState("");
  const [showModal,setShowModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [delConfirm,setDelConfirm]=useState(null);
  const [sorting,setSorting]=useState([]);
  const [pagination,setPagination]=useState({pageIndex:0,pageSize:15});

  const filtered=useMemo(()=>assets.filter(a=>{const q=search.toLowerCase();return(!q||[a.brand,a.capacity,a.serial,a.assigned].some(v=>v?.toLowerCase().includes(q)))&&(!fBrand||a.brand===fBrand)&&(!fStatus||a.status===fStatus);}),[assets,search,fBrand,fStatus]);
  const columns=useMemo(()=>[
    {accessorKey:"id",header:"#",size:50},
    {accessorKey:"brand",header:"Brand",size:110},
    {accessorKey:"capacity",header:"Capacity",size:90},
    {accessorKey:"serial",header:"Serial No",size:180,cell:i=><span className="lp-mono">{i.getValue()||"—"}</span>},
    {accessorKey:"assigned",header:"Assigned To",size:200},
    {accessorKey:"status",header:"Status",size:110,cell:i=>{const b=BADGE[i.getValue()]||BADGE.Available;return<span className="lp-status-badge" style={b}>{i.getValue()}</span>;}},
    {accessorKey:"location",header:"Location",size:90},
    {accessorKey:"remark",header:"Remark",size:150,cell:i=><span className="lp-notes" title={i.getValue()}>{i.getValue()||"—"}</span>},
    {id:"actions",header:"Actions",size:120,enableSorting:false,cell:({row})=><span className="lp-action-btns"><button className="lp-btn-edit" onClick={()=>{setForm({...row.original});setEditId(row.original.id);setShowModal(true);}}>Edit</button><button className="lp-btn-del" onClick={()=>setDelConfirm(row.original)}>Delete</button></span>},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[]);
  const table=useReactTable({data:filtered,columns,state:{sorting,pagination},onSortingChange:setSorting,onPaginationChange:setPagination,getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getPaginationRowModel:getPaginationRowModel()});
  const save=async()=>{if(!form.brand){alert("Brand required.");return;}try{setSaving(true);if(editId){await updatePendrive(editId,form);}else{await createPendrive(form);}await fetchData();setShowModal(false);setEditId(null);}catch(err){setError(err.response?.data?.message||"Save failed.");}finally{setSaving(false);}};

  const stats={total:assets.length,assigned:assets.filter(a=>a.status==="Assigned").length,available:assets.filter(a=>a.status==="Available").length,issues:assets.filter(a=>["Faulty","Not Found"].includes(a.status)).length};
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
          <div><h1 style={{margin:0,fontSize:20,fontWeight:700,color:"#111827"}}>Pendrives</h1><p style={{margin:"2px 0 0",fontSize:12,color:"#6b7280"}}>{assets.length} total assets</p></div>
          <button className="lp-add-btn" style={{borderRadius:7,padding:"8px 18px"}} onClick={()=>{setForm(EMPTY);setEditId(null);setShowModal(true);}}>+ Add New Asset</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {[{label:"Total",val:stats.total,color:"#2878C8",border:"#2878C8"},{label:"Assigned",val:stats.assigned,color:"#2878C8",border:"#2878C8"},{label:"Available",val:stats.available,color:"#6a7a00",border:"#b0c21f"},{label:"Issues",val:stats.issues,color:"#dc2626",border:"#dc2626"}].map(s=>(
            <div key={s.label} style={{background:"#fff",border:"1px solid #e5e7eb",borderTop:`3px solid ${s.border}`,borderRadius:8,padding:"10px 14px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:10,color:"#9ca3af",marginBottom:4,textTransform:"uppercase",letterSpacing:".07em",fontWeight:700}}>{s.label}</div>
              <div style={{fontSize:26,fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-card" style={{margin:"0 20px 20px"}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid #E5E7EB",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",background:"#fafafa"}}>
          <input className="lp-search" placeholder="Search brand, serial, assigned…" value={search} onChange={e=>{setSearch(e.target.value);setPagination(p=>({...p,pageIndex:0}));}} style={{width:220}}/>
          <select className="lp-sel lp-sel-sm" value={fBrand} onChange={e=>{setFBrand(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}><option value="">All brands</option>{BRANDS.map(b=><option key={b} value={b}>{b}</option>)}</select>
          <select className="lp-sel lp-sel-sm" value={fStatus} onChange={e=>{setFStatus(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}><option value="">All statuses</option>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>
          {(search||fBrand||fStatus)&&<button className="lp-btn-ghost" onClick={()=>{setSearch("");setFBrand("");setFStatus("");setPagination({pageIndex:0,pageSize:15});}}>Clear</button>}
          <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{total} results</span>
        </div>
        <div className="lp-table-wrap"><table className="lp-table"><thead>{table.getHeaderGroups().map(hg=><tr key={hg.id}>{hg.headers.map(h=><th key={h.id} className="lp-th" onClick={h.column.getToggleSortingHandler()} style={{cursor:h.column.getCanSort()?"pointer":"default",width:h.getSize()}}>{flexRender(h.column.columnDef.header,h.getContext())}<span className="lp-sort-hint">{h.column.getIsSorted()==="asc"?" ↑":h.column.getIsSorted()==="desc"?" ↓":h.column.getCanSort()?" ↕":""}</span></th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.length===0?<tr><td colSpan={columns.length} className="lp-empty">No assets found</td></tr>:table.getRowModel().rows.map((row,i)=><tr key={row.id} className={`lp-tr${i%2!==0?" lp-tr-alt":""}`}>{row.getVisibleCells().map(cell=><td key={cell.id} className="lp-td">{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)}</tbody></table></div>
        <div className="lp-pagination"><span className="lp-pg-info">{total===0?"No results":`Showing ${from}–${to} of ${total}`}</span><div className="lp-pg-btns"><button className="lp-pg-btn" disabled={!table.getCanPreviousPage()} onClick={()=>table.previousPage()}>← Prev</button>{Array.from({length:Math.min(pc,5)},(_,i)=>{const pg=pc<=5?i:pageIndex<=2?i:pageIndex>=pc-3?pc-5+i:pageIndex-2+i;return<button key={pg} className={`lp-pg-btn${pageIndex===pg?" lp-pg-btn--active":""}`} onClick={()=>table.setPageIndex(pg)}>{pg+1}</button>;})}<button className="lp-pg-btn" disabled={!table.getCanNextPage()} onClick={()=>table.nextPage()}>Next →</button></div></div>
      </div>
      {showModal&&<div className="lp-overlay"><div className="lp-modal"><div className="lp-modal-header"><h2 className="lp-modal-title">{editId?"Edit Asset":"Add New Asset"}</h2><button className="lp-modal-close" onClick={()=>{setShowModal(false);setEditId(null);}}>×</button></div><div className="lp-modal-body"><div className="lp-form-grid"><Field field="brand" label="Brand *" opts={BRANDS}/><Field field="capacity" label="Capacity" opts={CAPACITIES}/><Field field="serial" label="Serial No"/><Field field="status" label="Status" opts={STATUSES}/><Field field="assigned" label="Assigned To"/><Field field="location" label="Location" opts={LOCATIONS}/><Field field="remark" label="Remark"/></div></div><div className="lp-modal-footer"><button className="lp-btn-ghost" onClick={()=>{setShowModal(false);setEditId(null);}}>Cancel</button><button className="lp-btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":editId?"Update":"Save"}</button></div></div></div>}
      {delConfirm&&<div className="lp-overlay"><div className="lp-modal lp-modal-sm"><div className="lp-modal-header"><h3 className="lp-modal-title">Delete Asset</h3><button className="lp-modal-close" onClick={()=>setDelConfirm(null)}>×</button></div><div className="lp-modal-body"><p className="lp-del-msg">Delete <strong>{delConfirm.brand} {delConfirm.capacity}</strong>{delConfirm.serial?` (${delConfirm.serial})`:""}{delConfirm.assigned?<><br/>Assigned to: <strong>{delConfirm.assigned}</strong></>:null}?</p></div><div className="lp-modal-footer"><button className="lp-btn-ghost" onClick={()=>setDelConfirm(null)}>Cancel</button><button className="lp-btn-danger" onClick={async()=>{try{await deletePendrive(delConfirm._id||delConfirm.id);setDelConfirm(null);await fetchData();}catch(err){setError(err.response?.data?.message||"Delete failed.");setDelConfirm(null);}}}>Delete</button></div></div></div>}
    </div>
  );
}
