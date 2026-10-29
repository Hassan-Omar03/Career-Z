import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { showPrompt } from '../../utils/appDialog';
import { downloadCvPdf } from './CvDesigner';
import { openPrivateFile } from '../recruitment/files';
import { OfferForm, OfferLetterForm, OfferSummary, ViewOfferLetterButton } from './OfferTools';

// Shared applicant tools for whoever manages a job (agent, employer, institute): the Master 12.10
// hiring stages with an optional note to the candidate, the applicant's contact details and cover
// letter, and their CV as a file to download and forward by email or WhatsApp.

export const HIRING_STAGES = [
  ['pending', 'Applied'], ['viewed', 'Screening'], ['shortlisted', 'Shortlisted'], ['interview', 'Interview'], ['final_interview', 'Final interview'],
  ['selected', 'Offer'], ['accepted', 'Offer accepted'], ['hired', 'Joined'], ['completed', 'Completed'], ['rejected', 'Not selected'], ['withdrawn', 'Withdrawn']
];
export const STAGE_LABEL = Object.fromEntries(HIRING_STAGES);

// Which stages can be chosen now, and why not (the server enforces the same rules).
export function stageBlock(v, application, agentJob = false) {
  const emp = application.employment;
  if (v === application.status) return '';
  if (agentJob && v === 'selected') return 'use Request offer';
  if (agentJob && v === 'accepted') return 'the candidate accepts';
  if (v === 'withdrawn') return 'only the candidate';
  if (v === 'accepted' && emp?.status !== 'offered') return 'after an offer';
  if (v === 'hired' && emp?.status === 'offered') return 'offer not accepted yet';
  if (v === 'hired' && ['declined', 'withdrawn'].includes(emp?.status)) return 'make a new offer first';
  if (v === 'completed' && !(application.status === 'hired' && application.joining?.confirmed)) return 'after joining is confirmed';
  return '';
}
function StageSelect({ value, onChange, application, agentJob = false }) {
  return (
    <select className="form-select" aria-label="Hiring stage" value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.8rem' }}>
      {HIRING_STAGES.filter(([v]) => v !== 'withdrawn' || application.status === 'withdrawn').map(([v, l]) => { const why = stageBlock(v, application, agentJob); return <option key={v} value={v} disabled={Boolean(why)}>{l}{why ? ` (${why})` : ''}</option>; })}
    </select>
  );
}

export const MEETING_PROVIDERS = [['careerz', 'CareerZ video (built-in)'], ['google_meet', 'Google Meet'], ['zoom', 'Zoom'], ['teams', 'Microsoft Teams'], ['custom', 'Custom meeting link']];

// Interview / Final interview: schedule it (date, online link or address); the candidate sees it
// in their Interviews tab and is emailed.
function InterviewForm({ application, round, onSaved, onFlash, onCancel }) {
  const [f, setF] = useState({ scheduledDate: '', mode: 'online', location: '', provider: 'careerz', externalUrl: '' }), [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/jobs/applications/${application._id}/schedule-interview`, { method: 'POST', body: { ...f, round } });
      onFlash?.(`${round === 'final_interview' ? 'Final interview' : 'Interview'} scheduled. The candidate was emailed.`, 'success');
      onSaved?.();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  const small = { padding: '6px 8px', fontSize: '0.8rem' };
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 6 }}>
      <strong className="text-xs">Schedule the {round === 'final_interview' ? 'final interview' : 'interview'}</strong>
      <input className="form-input" style={small} type="datetime-local" required aria-label="Date and time" value={f.scheduledDate} onChange={(e) => setF({ ...f, scheduledDate: e.target.value })} />
      <select className="form-select" style={small} aria-label="Interview mode" value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}><option value="online">Online</option><option value="physical">In person</option></select>
      {f.mode === 'online' && <select className="form-select" style={small} aria-label="Meeting service" value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })}>{MEETING_PROVIDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
      {f.mode === 'online' && f.provider !== 'careerz' && <input className="form-input" style={small} type="url" required placeholder={`${MEETING_PROVIDERS.find(([v]) => v === f.provider)[1]} link (https://…)`} value={f.externalUrl} onChange={(e) => setF({ ...f, externalUrl: e.target.value })} />}
      {f.mode === 'online'
        ? <small style={{ color: 'var(--ink-soft)' }}>{f.provider === 'careerz' ? "Held in CareerZ's own video room. You and the candidate get a Join Interview button." : 'The candidate gets a Join button that opens this link.'}</small>
        : <input className="form-input" style={small} required placeholder="Address / room" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />}
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>{busy ? 'Scheduling…' : 'Schedule'}</button>
        <button type="button" className="btn" onClick={onCancel} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>Cancel</button>
      </div>
    </form>
  );
}

// Agent's job: ask the institute for an offer, then forward what the institute sends.
function AgentOfferTools({ application, onSaved, onFlash, hideRequest = false }) {
  const emp = application.employment, [busy, setBusy] = useState(false), [asking, setAsking] = useState(false), [note, setNote] = useState('');
  const pendingForward = emp?.offer?.sentAt && (!emp.offer.forwardedAt || (emp.offerLetter?.sentAt && !emp.offerLetter.forwardedAt));
  async function call(path, body, msg) {
    setBusy(true);
    try { const r = await apiRequest(`/jobs/applications/${application._id}/${path}`, { method: 'POST', body }); onFlash?.(msg || 'Done.', 'success'); setAsking(false); onSaved?.(r); } catch (e) { onFlash?.(e.message); } finally { setBusy(false); }
  }
  if (['hired', 'completed', 'rejected', 'withdrawn'].includes(application.status)) return null;
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {!hideRequest && application.offerRequest?.at && !emp?.offer?.sentAt && <small style={{ color: 'var(--ink-soft)' }}>Offer requested from the institute on {new Date(application.offerRequest.at).toLocaleDateString()}. Waiting for it.</small>}
      {!hideRequest && !emp?.offer?.sentAt && (asking
        ? <div style={{ display: 'grid', gap: 6 }}>
            <textarea className="form-input" rows={2} maxLength={1000} placeholder="Why this candidate (interview result, notes for the institute)" value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.78rem' }} />
            <div style={{ display: 'flex', gap: 6 }}><button type="button" className="btn btn-primary" disabled={busy} onClick={() => call('request-offer', { note }, 'Offer requested. The institute was notified.')} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>Send request</button><button type="button" className="btn" onClick={() => setAsking(false)} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>Cancel</button></div>
          </div>
        : <button type="button" className="btn" onClick={() => setAsking(true)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{application.offerRequest?.at ? 'Remind the institute' : 'Request offer from institute'}</button>)}
      {pendingForward && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => call('forward-offer', {}, null)} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>{!emp.offer.forwardedAt ? `Forward offer${emp.offerLetter?.sentAt ? ' and letter' : ''} to candidate` : 'Forward offer letter to candidate'}</button>}
      {emp?.offer?.sentAt && !pendingForward && <small style={{ color: 'var(--emerald)' }}>Forwarded to the candidate.</small>}
      {emp?.offerLetter?.sentAt && <ViewOfferLetterButton employment={emp} candidate={application.applicant?.fullName} label="View offer letter" onFlash={onFlash} />}
    </div>
  );
}

// Agent's job, once the institute selected the candidate: Interview, Selected (asks the institute
// for the offer), Not selected; then forward the offer and mark Joined.
function AgentJobControl({ application, onSaved, onFlash }) {
  const [mode, setMode] = useState(''), [round, setRound] = useState('interview'), [busy, setBusy] = useState(false);
  const emp = application.employment, sel = application.institutionSelection || {};
  const closed = ['hired', 'completed', 'rejected', 'withdrawn'].includes(application.status);
  async function setStage(status, note) {
    setBusy(true);
    try { const r = await apiRequest(`/jobs/applications/${application._id}/status`, { method: 'PATCH', body: { status, note } }); onFlash?.(status === 'rejected' ? 'Marked not selected. The candidate and institute were told.' : status === 'hired' ? 'Marked as joined. The institute will be asked to confirm.' : 'Updated.', 'success'); onSaved?.(r); } catch (e) { onFlash?.(e.message); } finally { setBusy(false); }
  }
  async function notSelected() {
    const reason = await showPrompt('Why is this candidate not selected? (optional, shared with the candidate)', { title: 'Not selected', confirmLabel: 'Not selected', danger: true });
    if (reason !== null) setStage('rejected', reason);
  }
  const small = { padding: '5px 10px', fontSize: '0.75rem' };
  if (mode === 'interview') return (
    <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
      <select className="form-select" aria-label="Round" value={round} onChange={(e) => setRound(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.8rem' }}><option value="interview">Interview</option><option value="final_interview">Final interview</option></select>
      <InterviewForm application={application} round={round} onFlash={onFlash} onSaved={() => { setMode(''); onSaved?.(); }} onCancel={() => setMode('')} />
    </div>
  );
  return (
    <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
      <small style={{ color: 'var(--emerald)', fontWeight: 600 }}>{sel.direct ? 'Selected by the institute (no interview): it will send the offer' : 'Selected by the institute for interview'}{sel.note ? ` · “${sel.note}”` : ''}</small>
      <small style={{ color: 'var(--ink-soft)' }}>Stage: {STAGE_LABEL[application.status] || application.status}</small>
      {!closed && !emp?.offer?.sentAt && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {!sel.direct && <button type="button" className="btn" disabled={busy} style={small} onClick={() => setMode('interview')}>Interview</button>}
        {!application.offerRequest?.at && !sel.direct && <button type="button" className="btn btn-primary" disabled={busy} style={small} onClick={async () => { const note = await showPrompt('Selected: tell the institute why (interview result). It then sends the offer to you.', { title: 'Selected', confirmLabel: 'Send to institute' }); if (note === null) return; setBusy(true); try { await apiRequest(`/jobs/applications/${application._id}/request-offer`, { method: 'POST', body: { note } }); onFlash?.('Sent to the institute. It will send the offer to you.', 'success'); onSaved?.(); } catch (e) { onFlash?.(e.message); } finally { setBusy(false); } }}>Selected</button>}
        <button type="button" className="btn" disabled={busy} style={small} onClick={notSelected}>Not selected</button>
      </div>}
      {application.offerRequest?.at && !emp?.offer?.sentAt && <small style={{ color: 'var(--gold)' }}>Selected and sent to the institute on {new Date(application.offerRequest.at).toLocaleDateString()}. Waiting for its offer.</small>}
      {emp?.offer?.sentAt && <OfferSummary employment={emp} />}
      <AgentOfferTools application={application} onSaved={onSaved} onFlash={onFlash} hideRequest />
      {application.status === 'accepted' && <button type="button" className="btn btn-primary" disabled={busy} style={small} onClick={() => setStage('hired', '')}>Joined</button>}
      {application.status === 'hired' && <small style={{ color: application.joining?.confirmed ? 'var(--emerald)' : 'var(--gold)' }}>{application.joining?.confirmed ? 'Joining confirmed by the institute' : 'Waiting for the institute to confirm joining'}</small>}
    </div>
  );
}

// `job` (title, company, salary, currency) prefills the offer and the offer letter.
export function HiringStatusControl({ application, onSaved, onFlash, institutionConfirms = false, job = null }) {
  const [status, setStatus] = useState(application.status), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [revise, setRevise] = useState(false);
  const emp = application.employment;
  const agentJob = Boolean(job?.agreement);
  if (agentJob && !application.institutionSelection?.at && !['rejected', 'withdrawn'].includes(application.status)) {
    return <div style={{ display: 'grid', gap: 4, minWidth: 220 }}><small style={{ color: 'var(--gold)', fontWeight: 600 }}>Waiting for the institute to select this candidate</small><small style={{ color: 'var(--ink-soft)' }}>The institute reviews applicants for this job. You can interview and move the stage once it selects them.</small></div>;
  }
  if (agentJob) return <AgentJobControl application={application} onSaved={onSaved} onFlash={onFlash} />;
  // Choosing "Offer" opens the offer form (salary, joining date, terms) instead of a plain update.
  if (!agentJob && ((status === 'selected' && application.status !== 'selected') || revise)) {
    return (
      <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
        {!revise && <StageSelect value={status} onChange={setStatus} application={application} agentJob={agentJob} />}
        <OfferForm application={application} job={job} onFlash={onFlash} onSaved={() => { setRevise(false); onSaved?.(); }} onCancel={() => { setRevise(false); setStatus(application.status); }} />
      </div>
    );
  }
  // Choosing an interview round opens the scheduling form.
  if (['interview', 'final_interview'].includes(status) && status !== application.status) {
    return (
      <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
        <StageSelect value={status} onChange={setStatus} application={application} agentJob={agentJob} />
        <InterviewForm application={application} round={status} onFlash={onFlash} onSaved={() => onSaved?.()} onCancel={() => setStatus(application.status)} />
      </div>
    );
  }
  const changed = status !== application.status || note.trim();
  async function save(e) {
    e.preventDefault();
    if (status === 'rejected' && !window.confirm('Mark this candidate as not selected? Any pending offer is withdrawn and upcoming interviews are cancelled. The candidate is told.')) return;
    setBusy(true);
    try {
      const updated = await apiRequest(`/jobs/applications/${application._id}/status`, { method: 'PATCH', body: { status, note } });
      onFlash?.(status === 'hired' && !updated?.joining?.confirmed ? (institutionConfirms ? 'Marked as joined. The institute will be asked to confirm.' : 'Marked as joined. The candidate will be asked to confirm.') : `Moved to ${STAGE_LABEL[status]}. The candidate was notified.`, 'success');
      setNote(''); onSaved?.(updated);
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  // The offer letter has its own form, so it sits next to (not inside) the stage form.
  return (
    <div style={{ display: 'grid', gap: 6, minWidth: 200 }}>
    <form onSubmit={save} style={{ display: 'grid', gap: 6 }}>
      <StageSelect value={status} onChange={setStatus} application={application} agentJob={agentJob} />
      <input className="form-input" aria-label="Note to the candidate" placeholder={status === 'rejected' ? 'Reason (optional, the candidate sees it)' : status === 'completed' ? 'e.g. Contract finished' : 'Note to the candidate (optional)'} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: '6px 8px', fontSize: '0.78rem' }} />
      <button type="submit" className="btn" disabled={!changed || busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>{busy ? 'Saving…' : 'Update'}</button>
    </form>
      <OfferSummary employment={emp} />
      {agentJob && <AgentOfferTools application={application} onSaved={onSaved} onFlash={onFlash} />}
      {!agentJob && application.status === 'selected' && emp?.status === 'offered' && <button type="button" className="btn" onClick={() => setRevise(true)} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Revise offer</button>}
      {!agentJob && application.status === 'selected' && (!emp?.offer?.sentAt || emp?.status === 'declined') && <button type="button" className="btn" onClick={() => setRevise(true)} style={{ padding: '4px 10px', fontSize: '0.72rem' }}>{emp?.status === 'declined' ? 'Make a new offer' : 'Make an offer (salary & terms)'}</button>}
      {!agentJob && ['accepted', 'active'].includes(emp?.status) && emp?.offer?.sentAt && <OfferLetterForm application={application} job={job} onFlash={onFlash} onSaved={onSaved} />}
      {application.status === 'hired' && <small style={{ color: application.joining?.confirmed ? 'var(--emerald)' : 'var(--gold)' }}>{application.joining?.confirmed ? `Joining confirmed${application.joining.via === 'candidate' ? ' by the candidate' : application.joining.via === 'hiring_organization' && institutionConfirms ? ' by the institute' : ''}` : institutionConfirms ? 'Waiting for the institute to confirm joining' : 'Waiting for the candidate to confirm joining'}</small>}
    </div>
  );
}

export function CvDownload({ application, onFlash }) {
  const [busy, setBusy] = useState(false);
  const snap = application.resumeSnapshot || {};
  const person = { fullName: application.applicant?.fullName || '', email: application.applicant?.email || '', phone: application.applicant?.phone || '', city: application.applicant?.city || '', country: application.applicant?.country || '' };
  const hasContent = snap.summary || (snap.experience || []).length || (snap.education || []).length || (snap.skills || []).length;
  // The file the applicant uploaded and chose to send, kept private on CareerZ.
  const fileButton = snap.cvFile && <button type="button" className="btn" onClick={() => openPrivateFile(`/jobs/applications/${application._id}/cv-file`, { download: true, filename: snap.cvFileName || 'CV' }).catch((e) => onFlash?.(e.message))} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Download uploaded CV</button>;
  const sent = snap.cvSource === 'variant' && snap.variantName ? <small style={{ color: 'var(--ink-soft)' }}> ({snap.variantName})</small> : null;
  if (snap.cvSource === 'file' || (!hasContent && snap.cvFile)) return <>{fileButton}{sent}</>;
  if (snap.cvFileUrl && !hasContent) return <a href={snap.cvFileUrl} target="_blank" rel="noreferrer" download>Download CV</a>;
  if (!hasContent) return <span style={{ color: 'var(--ink-soft)' }}>No CV</span>;
  async function make() {
    setBusy(true);
    try { await downloadCvPdf(snap, person, snap.template || 'ats'); } catch (err) { onFlash?.(err.message || 'Could not create the PDF.'); } finally { setBusy(false); }
  }
  return <>{fileButton}{fileButton && ' '}<button type="button" className="btn" onClick={make} disabled={busy} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{busy ? 'Creating…' : 'Download CV (PDF)'}</button>{sent}{snap.cvFileUrl && <> · <a href={snap.cvFileUrl} target="_blank" rel="noreferrer">CV link</a></>}</>;
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
