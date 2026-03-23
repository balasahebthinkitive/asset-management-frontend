import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import INITIAL_DATA from "../data/converterData";
import "./Laptops.css";

const BADGE={Assigned:{bg:"rgba(40,120,200,0.12)",color:"#2878C8"},Available:{bg:"rgba(176,194,31,0.15)",color:"#6a7a00"},Maintenance:{bg:"#fef3c7",color:"#92400e"},"Not Found":{bg:"#fee2e2",color:"#991b1b"}};
const EMPTY={type:"HDMI to VGA",brand:"",serial:"",assigned:"",status:"Available",location:"",remark:""};
const TYPES=["HDMI to VGA","USB-C to HDMI","USB-C to VGA","VGA to HDMI","USB Hub","USB to LAN","Type-C Hub","Other"];
const STATUSES=["Assigned","Available","Maintenance","Not Found"];
const LOCATIONS=["ABIL","TEERTH","AMBROSIA",""];

export default function Converter() {
  const [assets,setAssets]=useState(INITIAL_DATA);
  const [search,setSearch]=useState("");
  const [fType,setFType]=useState("");
  const [fStatus,setFStatus]=useState("");
  const [fLoc,setFLoc]=useState("");
  const [showModal,setShowModal]=useState(false);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [delConfirm,setDelConfirm]=useState(null);
  const [sorting,setSorting]=useState([]);
  const [pagination,setPagination]=useState({pageIndex:0,pageSize:15});

  const filtered=useMemo(()=>assets.filter(a=>{const q=search.toLowerCase();return(!q||[a.type,a.brand,a.serial,a.assigned].some(v=>v?.toLowerCase().includes(q)))&&(!fType||a.type===fType)&&(!fStatus||a.status===fStatus)&&(!fLoc||a.location===fLoc);}),[assets,search,fType,fStatus,fLoc]);
  const columns=useMemo(()=>[
    {accessorKey:"id",header:"#",size:50},
    {accessorKey:"type",header:"Type",size:160},
    {accessorKey:"brand",header:"Brand",size:100},
    {accessorKey:"serial",header:"Serial No",size:160,cell:i=><span className="lp-mono">{i.getValue()||"—"}</span>},
    {accessorKey:"assigned",header:"Assigned To",size:200},
    {accessorKey:"status",header:"Status",size:110,cell:i=>{const b=BADGE[i.getValue()]||BADGE.Available;return<span className="lp-status-badge" style={b}>{i.getValue()}</span>;}},
    {accessorKey:"location",header:"Location",size:100},
    {accessorKey:"remark",header:"Remark",size:150,cell:i=><span className="lp-notes" title={i.getValue()}>{i.getValue()||"—"}</span>},
    {id:"actions",header:"Actions",size:120,enableSorting:false,cell:({row})=><span className="lp-action-btns"><button className="lp-btn-edit" onClick={()=>{setForm({...row.original});setEditId(row.original.id);setShowModal(true);}}>Edit</button><button className="lp-btn-del" onClick={()=>setDelConfirm(row.original)}>Delete</button></span>},
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ],[]);
  const table=useReactTable({data:filtered,columns,state:{sorting,pagination},onSortingChange:setSorting,onPaginationChange:setPagination,getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getPaginationRowModel:getPaginationRowModel()});
  const save=()=>{if(!form.type){alert("Type required.");return;}if(editId)setAssets(p=>p.map(a=>a.id===editId?{...form,id:editId}:a));else{const id=Math.max(...assets.map(a=>a.id),0)+1;setAssets(p=>[...p,{...form,id}]);}setShowModal(false);setEditId(null);};
  const stats={total:assets.length,assigned:assets.filter(a=>a.status==="Assigned").length,available:assets.filter(a=>a.status==="Available").length,issues:assets.filter(a=>["Maintenance","Not Found"].includes(a.status)).length};
  const {pageIndex,pageSize}=table.getState().pagination,total=filtered.length,pc=table.getPageCount(),from=Math.min(pageIndex*pageSize+1,total),to=Math.min((pageIndex+1)*pageSize,total);
  const Field=({field,label,type="text",opts=null})=><div className="lp-form-field"><label className="lp-form-label">{label}</label>{opts?<select className="lp-form-inp" value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}>{opts.map(o=><option key={o} value={o}>{o||"— none —"}</option>)}</select>:<input type={type} className="lp-form-inp" value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}/>}</div>;

  return (
    <div className="lp-page">
      <div className="lp-page-header" style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:12}}>
          <div><h1 style={{margin:0,fontSize:20,fontWeight:700,color:"#111827"}}>Converters</h1><p style={{margin:"2px 0 0",fontSize:12,color:"#6b7280"}}>{assets.length} total assets</p></div>
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
          <input className="lp-search" placeholder="Search type, serial, assigned…" value={search} onChange={e=>{setSearch(e.target.value);setPagination(p=>({...p,pageIndex:0}));}} style={{width:220}}/>
          <select className="lp-sel lp-sel-sm" value={fType} onChange={e=>{setFType(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}><option value="">All types</option>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>
          <select className="lp-sel lp-sel-sm" value={fStatus} onChange={e=>{setFStatus(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}><option value="">All statuses</option>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>
          <select className="lp-sel lp-sel-sm" value={fLoc} onChange={e=>{setFLoc(e.target.value);setPagination(p=>({...p,pageIndex:0}));}}><option value="">All locations</option>{LOCATIONS.filter(Boolean).map(l=><option key={l} value={l}>{l}</option>)}</select>
          {(search||fType||fStatus||fLoc)&&<button className="lp-btn-ghost" onClick={()=>{setSearch("");setFType("");setFStatus("");setFLoc("");setPagination({pageIndex:0,pageSize:15});}}>Clear</button>}
          <span style={{fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>{total} results</span>
        </div>
        <div className="lp-table-wrap"><table className="lp-table">
          <thead>{table.getHeaderGroups().map(hg=><tr key={hg.id}>{hg.headers.map(h=><th key={h.id} className="lp-th" onClick={h.column.getToggleSortingHandler()} style={{cursor:h.column.getCanSort()?"pointer":"default",width:h.getSize()}}>{flexRender(h.column.columnDef.header,h.getContext())}<span className="lp-sort-hint">{h.column.getIsSorted()==="asc"?" ↑":h.column.getIsSorted()==="desc"?" ↓":h.column.getCanSort()?" ↕":""}</span></th>)}</tr>)}</thead>
          <tbody>{table.getRowModel().rows.length===0?<tr><td colSpan={columns.length} className="lp-empty">No converters found</td></tr>:table.getRowModel().rows.map((row,i)=><tr key={row.id} className={`lp-tr${i%2!==0?" lp-tr-alt":""}`}>{row.getVisibleCells().map(cell=><td key={cell.id} className="lp-td">{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)}</tbody>
        </table></div>
        <div className="lp-pagination"><span className="lp-pg-info">{total===0?"No results":`Showing ${from}–${to} of ${total}`}</span><div className="lp-pg-btns"><button className="lp-pg-btn" disabled={!table.getCanPreviousPage()} onClick={()=>table.previousPage()}>← Prev</button>{Array.from({length:Math.min(pc,5)},(_,i)=>{const pg=pc<=5?i:pageIndex<=2?i:pageIndex>=pc-3?pc-5+i:pageIndex-2+i;return<button key={pg} className={`lp-pg-btn${pageIndex===pg?" lp-pg-btn--active":""}`} onClick={()=>table.setPageIndex(pg)}>{pg+1}</button>;})}<button className="lp-pg-btn" disabled={!table.getCanNextPage()} onClick={()=>table.nextPage()}>Next →</button></div></div>
      </div>
      {showModal&&<div className="lp-overlay"><div className="lp-modal"><div className="lp-modal-header"><h2 className="lp-modal-title">{editId?"Edit Asset":"Add New Asset"}</h2><button className="lp-modal-close" onClick={()=>{setShowModal(false);setEditId(null);}}>×</button></div><div className="lp-modal-body"><div className="lp-form-grid"><Field field="type" label="Type *" opts={TYPES}/><Field field="brand" label="Brand"/><Field field="serial" label="Serial No"/><Field field="status" label="Status" opts={STATUSES}/><Field field="assigned" label="Assigned To"/><Field field="location" label="Location" opts={LOCATIONS}/><Field field="remark" label="Remark"/></div></div><div className="lp-modal-footer"><button className="lp-btn-ghost" onClick={()=>{setShowModal(false);setEditId(null);}}>Cancel</button><button className="lp-btn-primary" onClick={save}>{editId?"Update":"Save"}</button></div></div></div>}
      {delConfirm&&<div className="lp-overlay"><div className="lp-modal lp-modal-sm"><div className="lp-modal-header"><h3 className="lp-modal-title">Delete Asset</h3><button className="lp-modal-close" onClick={()=>setDelConfirm(null)}>×</button></div><div className="lp-modal-body"><p className="lp-del-msg">Delete <strong>{delConfirm.type}</strong>{delConfirm.serial?` (${delConfirm.serial})`:""}{delConfirm.assigned?<><br/>Assigned to: <strong>{delConfirm.assigned}</strong></>:null}?</p></div><div className="lp-modal-footer"><button className="lp-btn-ghost" onClick={()=>setDelConfirm(null)}>Cancel</button><button className="lp-btn-danger" onClick={()=>{setAssets(p=>p.filter(a=>a.id!==delConfirm.id));setDelConfirm(null);}}>Delete</button></div></div></div>}
    </div>
  );
}
