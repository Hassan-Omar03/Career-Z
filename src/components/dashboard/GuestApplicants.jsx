import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { HIRING_STAGES, STAGE_LABEL } from './ApplicantTools';
import { openPrivateFile } from '../recruitment/files';

// Applicants who applied without an account (they confirmed their email first). Same hiring
// stages; each change is emailed to them. Their CV is a private file, downloaded here.
export default function GuestApplicants({ jobId, onFlash }) {
  const [list, setList] = useState(null);
  const load = () => apiRequest(`/jobs/${jobId}/guest-applicants`).then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!list || !list.length) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: '0 0 8px' }}>Applied without an account ({list.length})</h4>
      <div style={{ display: 'grid', gap: 10 }}>
        {list.map((a) => <GuestRow key={`${a._id}-${a.status}`} a={a} onFlash={onFlash} onSaved={load} />)}
      </div>
    </div>
  );
}

function GuestRow({ a, onFlash, onSaved }) {
  const [status, setStatus] = useState(a.status), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [open, setOpen] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/jobs/guest-applications/${a._id}/status`, { method: 'PATCH', body: { status, note } });
      onFlash?.(`Moved to ${STAGE_LABEL[status]}. ${a.name} was emailed.`, 'success');
      onSaved();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  async function cv() {
    try { await openPrivateFile(`/jobs/guest-applications/${a._id}/cv`, { download: true, filename: `${a.name.replace(/[^\w ]/g, '')} CV` }); } catch (err) { onFlash?.(err.message); }
  }
  return (
    <div className="card" style={{ padding: 12, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <div className="text-sm" style={{ display: 'grid', gap: 2, minWidth: 0 }}>
        <strong>{a.name} <span className="badge" style={{ marginLeft: 6 }}>Guest</span></strong>
        <span className="text-xs">Email: <a href={`mailto:${a.email}`}>{a.email}</a>{a.phone ? ` · Phone: ${a.phone}` : ''}{a.city ? ` · ${a.city}` : ''}</span>
        <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Applied {new Date(a.createdAt).toLocaleDateString()} · {STAGE_LABEL[a.status]}</span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={cv} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Download CV</button>
          {a.coverLetter && <button type="button" className="btn" onClick={() => setOpen(!open)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{open ? 'Hide cover letter' : 'Cover letter'}</button>}
        </span>
        {open && <p style={{ whiteSpace: 'pre-wrap', margin: '4px 0 0', maxWidth: 420 }}>{a.coverLetter}</p>}
      </div>
      <form onSubmit={save} style={{ display: 'grid', gap: 6, minWidth: 200 }}>
        <select className="form-select" aria-label="Hiring stage" value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.8rem' }}>
          {HIRING_STAGES.filter(([v]) => v !== 'withdrawn' || a.status === 'withdrawn').map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className="form-input" aria-label="Note to the candidate" placeholder="Note to the candidate (optional)" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.78rem' }} />
        <button type="submit" className="btn" disabled={busy || (status === a.status && !note.trim())} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>{busy ? 'Saving…' : 'Update'}</button>
        {a.status === 'hired' && <small style={{ color: a.joining?.confirmed ? 'var(--emerald)' : 'var(--gold)' }}>{a.joining?.confirmed ? 'Joining confirmed' : 'Waiting for joining confirmation'}</small>}
      </form>
    </div>
  );
}
