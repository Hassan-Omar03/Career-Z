import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
const base = '/institution-ops';
const types = ['sports_day', 'annual_function', 'seminar', 'workshop', 'competition', 'parent_meeting', 'convocation', 'other'];
const categories = ['academic', 'fee', 'teacher', 'student', 'staff', 'technical', 'harassment', 'discipline'];
const blank = { title: '', type: 'other', description: '', startDate: '', endDate: '', venue: '', audience: [], status: 'upcoming' };
const label = v => String(v || '').replaceAll('_', ' ');
const dateInput = v => { if (!v) return ''; const d = new Date(v); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
export default function InstitutionCommunity({ kind, manage = false, onFlash }) {
  const [institutions, setInstitutions] = useState([]), [id, setId] = useState('');
  const [rows, setRows] = useState([]), [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [form, setForm] = useState(blank), [edit, setEdit] = useState('');
  const [ticket, setTicket] = useState({ category: 'academic', priority: 'medium', subject: '', description: '' });
  const [changes, setChanges] = useState({});
  const manager = institutions.find(i => i._id === id)?.canManage;
  useEffect(() => { let alive = true; setLoading(true); apiRequest(`${base}/community/institutions`).then(list => { if (!alive) return; const options = manage ? list.filter(i => i.canManage) : list; setInstitutions(options); setId(options[0]?._id || ''); }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, [manage]);
  useEffect(() => { let alive = true; setRows([]); setPeople([]); setForm(blank); setEdit(''); setChanges({}); if (!id) return; setLoading(true); setError(''); Promise.all([apiRequest(`${base}/${id}/${kind === 'events' ? 'events' : 'tickets'}`), manager && kind === 'tickets' ? apiRequest(`${base}/${id}/ticket-recipients`) : Promise.resolve([])]).then(([list, recipients]) => { if (alive) { setRows(list); setPeople(recipients); } }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, [id, kind, manager]);
  async function reload() { setRows(await apiRequest(`${base}/${id}/${kind === 'events' ? 'events' : 'tickets'}`)); }
  async function run(work) { if (busy) return; setBusy(true); try { await work(); await reload(); onFlash('Saved successfully.', 'success'); } catch (e) { onFlash(e.message, 'error'); } finally { setBusy(false); } }
  const button = (text, fn) => <button type="button" className="btn" disabled={busy} onClick={fn}>{text}</button>;
  const field = (key, type = 'text') => <label>{label(key)}<input className="form-input" type={type} required={['title', 'startDate'].includes(key)} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>;
  return <section><h2>{kind === 'events' ? 'Events & Activities' : 'Complaint & Help Desk'}</h2>
    {error && <p role="alert">{error} {button('Retry', () => run(async () => { await reload(); setError(''); }))}</p>}
    {!!institutions.length && <label>Institution<select className="form-select" value={id} onChange={e => setId(e.target.value)}>{institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}</select></label>}
    {loading && <p role="status">Loading…</p>}
    {!loading && !id && <p>No active institution connected.</p>}
    {id && kind === 'events' && manager && <form className="dash-card" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }} onSubmit={e => { e.preventDefault(); run(async () => { await apiRequest(edit ? `${base}/events/${edit}` : `${base}/${id}/events`, { method: edit ? 'PATCH' : 'POST', body: { ...form, startDate: new Date(form.startDate).toISOString(), endDate: form.endDate ? new Date(form.endDate).toISOString() : null } }); setEdit(''); setForm(blank); }); }}>
      {field('title')}{field('startDate', 'datetime-local')}{field('endDate', 'datetime-local')}{field('venue')}
      <label>Type<select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{types.map(t => <option key={t} value={t}>{label(t)}</option>)}</select></label>
      <label>Description<textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <label>Status<select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => <option key={s}>{s}</option>)}</select></label>
      <div>Audience (empty means everyone){['students', 'teachers', 'parents', 'staff'].map(a => <label key={a} style={{ display: 'block' }}><input type="checkbox" checked={form.audience.includes(a)} onChange={e => setForm({ ...form, audience: e.target.checked ? [...form.audience, a] : form.audience.filter(v => v !== a) })} /> {a}</label>)}</div>
      <button className="btn btn-primary" disabled={busy}>{edit ? 'Save event' : 'Create event'}</button>{edit && button('Cancel edit', () => { setEdit(''); setForm(blank); })}
    </form>}
    {id && kind === 'tickets' && <form className="dash-card" style={{ display: 'grid', gap: 12 }} onSubmit={e => { e.preventDefault(); run(async () => { await apiRequest(`${base}/${id}/tickets`, { method: 'POST', body: ticket }); setTicket({ ...ticket, subject: '', description: '' }); }); }}>
      <label>Category<select className="form-select" value={ticket.category} onChange={e => setTicket({ ...ticket, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Priority<select className="form-select" value={ticket.priority} onChange={e => setTicket({ ...ticket, priority: e.target.value })}>{['low', 'medium', 'high', 'urgent'].map(p => <option key={p}>{p}</option>)}</select></label>
      <label>Subject<input className="form-input" required value={ticket.subject} onChange={e => setTicket({ ...ticket, subject: e.target.value })} /></label>
      <label>Description<textarea className="form-input" required value={ticket.description} onChange={e => setTicket({ ...ticket, description: e.target.value })} /></label><button className="btn btn-primary" disabled={busy}>Submit ticket</button>
    </form>}
    {!loading && id && !error && !rows.length && <p>{kind === 'events' ? 'No events available.' : 'No submitted or assigned tickets.'}</p>}
    {!loading && rows.map(row => <article key={row._id} className="dash-card" style={{ marginTop: 16, padding: 18 }}>
      <h3>{kind === 'events' ? row.title : `${row.ticketNumber} — ${row.subject}`}</h3><p>{label(kind === 'events' ? row.type : row.category)} · {label(row.status)}</p><p style={{ whiteSpace: 'pre-wrap' }}>{row.description}</p>
      {kind === 'events' ? <><p>{new Date(row.startDate).toLocaleString()}{row.endDate ? ` — ${new Date(row.endDate).toLocaleString()}` : ''} · {row.venue || 'No venue specified'}</p><p>{row.rsvpCount} attending · Audience: {row.audience.length ? row.audience.join(', ') : 'Everyone'}</p>
        {manager && button('Edit', () => { setEdit(row._id); setForm({ ...blank, ...row, startDate: dateInput(row.startDate), endDate: dateInput(row.endDate) }); })}
        {row.going ? button('Cancel RSVP', () => run(() => apiRequest(`${base}/events/${row._id}/rsvp`, { method: 'DELETE' }))) : ['upcoming', 'ongoing'].includes(row.status) && button('RSVP', () => run(() => apiRequest(`${base}/events/${row._id}/rsvp`, { method: 'POST' })))}
      </> : <><p>Raised by: {row.raisedBy?.fullName} · Assigned: {row.assignedTo?.fullName || 'Unassigned'} · Priority: {row.priority}</p><p>Resolution: {row.resolutionNotes || 'Pending'}</p>
        <details><summary>Ticket history</summary>{(row.history || []).map((h, n) => <p key={n}>{new Date(h.at).toLocaleString()} · {h.actor?.fullName || 'Staff'} · {label(h.action)} {h.notes}</p>)}</details>
        {(manager || row.canUpdate) && row.status !== 'closed' && <div style={{ display: 'grid', gap: 10 }}>
          {manager && <><label>Assign to<select className="form-select" value={changes[row._id]?.assignedTo ?? row.assignedTo?._id ?? ''} onChange={e => setChanges({ ...changes, [row._id]: { ...changes[row._id], assignedTo: e.target.value } })}><option value="">Unassigned</option>{people.map(p => <option key={p._id} value={p._id}>{p.fullName} ({p.email})</option>)}</select></label><label>Priority<select className="form-select" value={changes[row._id]?.priority ?? row.priority} onChange={e => setChanges({ ...changes, [row._id]: { ...changes[row._id], priority: e.target.value } })}>{['low', 'medium', 'high', 'urgent'].map(p => <option key={p}>{p}</option>)}</select></label></>}
          <label>Status<select className="form-select" value={changes[row._id]?.status ?? row.status} onChange={e => setChanges({ ...changes, [row._id]: { ...changes[row._id], status: e.target.value } })}>{[row.status, ...({ open: ['in_progress', 'resolved'], in_progress: ['resolved'], resolved: ['closed', 'in_progress'] }[row.status] || [])].map(s => <option key={s} value={s}>{label(s)}</option>)}</select></label>
          <label>Resolution notes<textarea className="form-input" value={changes[row._id]?.resolutionNotes ?? row.resolutionNotes} onChange={e => setChanges({ ...changes, [row._id]: { ...changes[row._id], resolutionNotes: e.target.value } })} /></label>{button('Save ticket', () => run(async () => {
            await apiRequest(`${base}/tickets/${row._id}`, { method: 'PATCH', body: changes[row._id] || {} });
            setChanges(current => { const next = { ...current }; delete next[row._id]; return next; });
          }))}
          <div role="status" style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-alt, #f0f5f2)', border: '1px solid var(--border, #d7e3dd)' }}>
            <strong>{row.assignedTo?.fullName ? `Ticket assigned to ${row.assignedTo.fullName}.` : 'Ticket is not assigned yet.'}</strong>
            <div>Saved status: {label(row.status)} · Priority: {row.priority}</div>
            {Object.keys(changes[row._id] || {}).length > 0 && <div>Changes are not saved yet. Click Save ticket to confirm.</div>}
          </div>
        </div>}
      </>}
    </article>)}
  </section>;
}
