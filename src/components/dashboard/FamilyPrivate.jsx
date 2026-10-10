import {useEffect,useState} from 'react';
import {apiRequest} from '../../api/client';
export function FamilyPrivate({onFlash}) {
 const [form,setForm]=useState(null),[busy,setBusy]=useState(false),[accountNumber,setAccount]=useState(''),[replace,setReplace]=useState(false);
 useEffect(()=>{apiRequest('/parents/private-profile').then(setForm).catch(e=>onFlash(e.message));},[]);
 if(!form)return <p role="status">Loading private details…</p>;
 return <section className="admin-card"><h2>Private notes and bank details</h2><p>Only your account can view these notes. Account numbers are encrypted and displayed using their last four characters. Saving these details does not set up a payment or bank withdrawal.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{setForm(await apiRequest('/parents/private-profile',{method:'PUT',body:{bankName:form.bankName,accountTitle:form.accountTitle,notes:form.notes,...(replace?{accountNumber}: {})}}));setAccount('');setReplace(false);onFlash('Private details saved.','success');}catch(err){onFlash(err.message);}finally{setBusy(false);}}}>
 {['bankName','accountTitle'].map(k=><label key={k} style={{display:'block',marginTop:12}}>{k==='bankName'?'Bank name':'Account title'}<input className="form-input" disabled={busy} maxLength={150} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}
 <p>{form.accountLast4?`Saved account: •••• ${form.accountLast4}`:'No account number saved.'}</p><label><input type="checkbox" checked={replace} disabled={busy} onChange={e=>setReplace(e.target.checked)}/> Replace or remove saved account number</label>
 {replace&&<label style={{display:'block'}}>Account number or IBAN (leave empty to remove)<input className="form-input" autoComplete="off" disabled={busy} maxLength={40} value={accountNumber} onChange={e=>setAccount(e.target.value)}/></label>}
 <label style={{display:'block',marginTop:12}}>Private notes<textarea className="form-input" rows={5} maxLength={10000} disabled={busy} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><button className="btn btn-primary" disabled={busy}>{busy?'Saving…':'Save private details'}</button></form></section>;
}
export function FamilyAdminSummary({onFlash}) {
 const [data,setData]=useState(null);
 useEffect(()=>{apiRequest('/parents/admin/summary').then(setData).catch(e=>onFlash(e.message));},[]);
 if(!data)return <p role="status">Loading parent statistics…</p>;
 return <section className="admin-card"><h2>Parent operations</h2><div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>{[['Parent accounts',data.parents],['Active accounts',data.activeAccounts],['Signed in within 30 days',data.activeLast30Days],['Open complaints',data.openComplaints],['Successful parent AI requests',data.aiRequests||0],['School satisfaction',data.schoolSatisfaction.average==null?'No ratings':`${data.schoolSatisfaction.average.toFixed(1)} / 5 (${data.schoolSatisfaction.count})`]].map(([name,value])=><article key={name}><h3>{value}</h3><p>{name}</p></article>)}</div>{[['Connections',data.connections],['Meetings',data.meetings],['Consent decisions',data.consents]].map(([name,rows])=><div key={name}><h3>{name}</h3><p>{rows.length?rows.map(r=>`${r._id||'Not specified'}: ${r.count}`).join(' · '):'No records'}</p></div>)}<h3>Wallet fee payments</h3>{data.walletPayments.map(r=><p key={r._id}>{r._id}: {r.paid} paid · {r.refunded} refunded · {r.payments} payments</p>)}</section>;
}
