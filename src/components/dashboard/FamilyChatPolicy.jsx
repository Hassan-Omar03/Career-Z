import {useEffect,useState} from 'react';
import {apiRequest} from '../../api/client';
export default function FamilyChatPolicy({onFlash}){
 const [terms,setTerms]=useState(null),[busy,setBusy]=useState(false);
 useEffect(()=>{apiRequest('/parents/admin/chat-policy').then(r=>setTerms(r.terms.join('\n'))).catch(e=>onFlash(e.message));},[]);
 return <section className="admin-card"><h2>Communication safety policy</h2><p>Configured phrases are blocked before a direct or group message is saved. Private conversations stay private; complaint reviewers receive only the evidence selected in a report.</p>{terms!==null&&<form onSubmit={async e=>{e.preventDefault();setBusy(true);try{const r=await apiRequest('/parents/admin/chat-policy',{method:'PUT',body:{terms:terms.split('\n').map(s=>s.trim()).filter(Boolean)}});setTerms(r.terms.join('\n'));onFlash('Communication safety policy saved.','success');}catch(err){onFlash(err.message);}finally{setBusy(false);}}}><label>Blocked phrases (one per line, up to 200)<textarea className="form-input" rows={6} value={terms} disabled={busy} onChange={e=>setTerms(e.target.value)}/></label><button className="btn btn-primary" disabled={busy}>Save communication policy</button></form>}</section>;
}
