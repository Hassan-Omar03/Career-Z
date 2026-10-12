import { useState } from 'react';
import { apiRequest } from '../../api/client';
export default function ObservationCard({ row, staff = false, onSaved }) {
  const [action,setAction]=useState(''),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const closed=row.status==='resolved';
  const [success,setSuccess]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{
    await apiRequest(`/parents/observations/${row._id}/respond`,{method:'POST',body:{action,text}});
    setSuccess('Response saved.');
    setAction('');setText('');
    try{await onSaved();}catch{setError('Request saved, but the latest details could not refresh. Refresh this page; do not submit again.');}
  }catch(e){setError(e.message);}finally{setBusy(false);}}
  const labels={acknowledged:'Acknowledge',parent_reply:'Reply / action taken',follow_up:'Add teacher follow-up',resolved:'Resolve after review',reopened:'Reopen complaint'};
  return <article className="card" style={{padding:20,overflowWrap:'anywhere'}}>
    <h3>{row.student?.fullName||'Linked child'}</h3>
    <p><strong style={{textTransform:'capitalize'}}>{row.type}</strong> · {row.institution?.name}</p>
    <p><strong>Reported by:</strong> {row.actor?.fullName||'School staff'}<br/><strong>Subject:</strong> {row.subject||'Not recorded on this earlier update'}</p>
    <p style={{whiteSpace:'pre-wrap'}}>{row.text}</p>
    <p>{new Date(row.createdAt).toLocaleString()} · <strong>{({open:'Awaiting guardian response',awaiting_teacher:'Awaiting teacher follow-up',resolved:'Resolved'})[row.status||'open']}</strong></p>
    {!!row.history?.length&&<details><summary>Response & follow-up history ({row.history.length})</summary>{row.history.map((h,index)=><div key={h._id||index} style={{borderLeft:'3px solid var(--sand-line)',paddingLeft:12,marginTop:12}}><strong>{h.actor?.fullName||'Account'} · {h.action.replaceAll('_',' ')}</strong><p style={{whiteSpace:'pre-wrap'}}>{h.text||'Update acknowledged.'}</p><time dateTime={h.at}>{new Date(h.at).toLocaleString()}</time></div>)}</details>}
    {!action&&<div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>{(staff?(closed?['reopened']:['follow_up','resolved']):(closed?[]:[...(!row.acknowledgedByMe?['acknowledged']:[]),'parent_reply'])).map(a=><button type="button" className="btn" key={a} onClick={()=>setAction(a)}>{labels[a]}</button>)}</div>}
    {action&&<form onSubmit={submit} style={{marginTop:16}}><fieldset disabled={busy} style={{border:0,padding:0}}><h4>{labels[action]}</h4>
      {action==='acknowledged'?<p>Confirm you have seen this update.</p>:<label>Details<textarea className="form-input" rows={3} required maxLength={5000} value={text} onChange={e=>setText(e.target.value)}/></label>}
      <div style={{display:'flex',gap:10,marginTop:12}}><button type="submit" className="btn btn-primary">{busy?'Saving…':'Submit'}</button><button type="button" className="btn" onClick={()=>{setAction('');setText('');setError('');}}>Cancel</button></div>
    </fieldset></form>}{success&&<p role="status">{success}</p>}{error&&<p role="alert">{error}</p>}
  </article>;
}
