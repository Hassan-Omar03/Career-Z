import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { downloadCvPdf } from './CvDesigner';

// Shared applicant tools for whoever manages a job (agent, employer, institute): the Master 12.10
// hiring stages with an optional note to the candidate, the applicant's contact details and cover
// letter, and their CV as a file to download and forward by email or WhatsApp.

export const HIRING_STAGES = [
  ['pending', 'Applied'], ['viewed', 'Screening'], ['shortlisted', 'Shortlisted'], ['interview', 'Interview'], ['final_interview', 'Final interview'],
  ['selected', 'Offer'], ['accepted', 'Offer accepted'], ['hired', 'Joined'], ['completed', 'Completed'], ['rejected', 'Not selected'], ['withdrawn', 'Withdrawn']
];
export const STAGE_LABEL = Object.fromEntries(HIRING_STAGES);

export function HiringStatusControl({ application, onSaved, onFlash, institutionConfirms = false }) {
  const [status, setStatus] = useState(application.status), [note, setNote] = useState(''), [busy, setBusy] = useState(false);
  const changed = status !== application.status || note.trim();
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await apiRequest(`/jobs/applications/${application._id}/status`, { method: 'PATCH', body: { status, note } });
      onFlash?.(status === 'hired' && !updated?.joining?.confirmed ? (institutionConfirms ? 'Marked as joined. The institute will be asked to confirm.' : 'Marked as joined. The candidate will be asked to confirm.') : `Moved to ${STAGE_LABEL[status]}. The candidate was notified.`, 'success');
      setNote(''); onSaved?.(updated);
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 6, minWidth: 200 }}>
      <select className="form-select" aria-label="Hiring stage" value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.8rem' }}>
        {HIRING_STAGES.filter(([v]) => v !== 'withdrawn' || application.status === 'withdrawn').map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <input className="form-input" aria-label="Note to the candidate" placeholder="Note to the candidate (optional)" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.78rem' }} />
      <button type="submit" className="btn" disabled={!changed || busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>{busy ? 'Saving…' : 'Update'}</button>
      {application.status === 'hired' && <small style={{ color: application.joining?.confirmed ? 'var(--emerald)' : 'var(--gold)' }}>{application.joining?.confirmed ? `Joining confirmed${application.joining.via === 'candidate' ? ' by the candidate' : application.joining.via === 'hiring_organization' && institutionConfirms ? ' by the institute' : ''}` : institutionConfirms ? 'Waiting for the institute to confirm joining' : 'Waiting for the candidate to confirm joining'}</small>}
    </form>
  );
}

export function CvDownload({ application, onFlash }) {
  const [busy, setBusy] = useState(false);
  const snap = application.resumeSnapshot || {};
  const person = { fullName: application.applicant?.fullName || '', email: application.applicant?.email || '', phone: application.applicant?.phone || '', city: application.applicant?.city || '', country: application.applicant?.country || '' };
  if (snap.cvFileUrl) return <a href={snap.cvFileUrl} target="_blank" rel="noreferrer" download>Download CV</a>;
  const hasContent = snap.summary || (snap.experience || []).length || (snap.education || []).length || (snap.skills || []).length;
  if (!hasContent) return <span style={{ color: 'var(--ink-soft)' }}>No CV</span>;
  async function make() {
    setBusy(true);
    try { await downloadCvPdf(snap, person); } catch (err) { onFlash?.(err.message || 'Could not create the PDF.'); } finally { setBusy(false); }
  }
  return <button type="button" className="btn" onClick={make} disabled={busy} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{busy ? 'Creating…' : 'Download CV (PDF)'}</button>;
}

export function ApplicantContact({ application }) {
  const [open, setOpen] = useState(false);
  const a = application.applicant || {};
  return (
    <div className="text-xs" style={{ display: 'grid', gap: 2 }}>
      {a.email && <span>Email: <a href={`mailto:${a.email}`}>{a.email}</a></span>}
      {a.phone && <span>Phone: {a.phone}</span>}
      {(a.city || a.country) && <span>{[a.city, a.country].filter(Boolean).join(', ')}</span>}
      {application.coverLetter && <button type="button" className="btn" onClick={() => setOpen(!open)} style={{ padding: '2px 8px', fontSize: '0.72rem', justifySelf: 'start' }}>{open ? 'Hide cover letter' : 'Cover letter'}</button>}
      {open && <p style={{ whiteSpace: 'pre-wrap', margin: '4px 0 0', maxWidth: 420 }}>{application.coverLetter}</p>}
    </div>
  );
}
