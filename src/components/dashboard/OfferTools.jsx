import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { readAsDataUrl } from '../recruitment/files';
import { letterData, OfferLetterViewer } from './OfferLetter';

// Offer stage tools for both sides of a job application:
//   hiring side: make / revise an offer (salary, joining date, reply-by, terms), then send the
//   offer letter once the candidate accepts; candidate: see and download the letter.
//   Both: the message thread on the application.

export const SALARY_CURRENCIES = ['PKR', 'USD', 'AED', 'SAR', 'GBP', 'EUR', 'QAR', 'OMR', 'KWD', 'CAD', 'AUD'];
const money = (c, n) => `${c} ${Number(n || 0).toLocaleString()}`;
const small = { padding: '6px 8px', fontSize: '0.8rem' };

export function OfferForm({ application, job, onSaved, onFlash, onCancel }) {
  const e = application.employment;
  const [f, setF] = useState({ salary: e?.salary || job?.salaryMin || '', currency: e?.currency || job?.currency || 'PKR', salaryPeriod: e?.offer?.salaryPeriod || 'month',
    startDate: e?.startDate ? e.startDate.slice(0, 10) : '', expiresAt: e?.offer?.expiresAt ? e.offer.expiresAt.slice(0, 10) : '', terms: e?.offer?.terms || '' });
  const [letter, setLetter] = useState(() => e?.offerLetter?.text || letterTemplate(application, job)), [letterFile, setLetterFile] = useState(null), [view, setView] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (ev) => setF({ ...f, [k]: ev.target.value });
  async function submit(ev) {
    ev.preventDefault();
    setBusy(true);
    try {
      if (letterFile && letterFile.size > 3 * 1024 * 1024) throw new Error('The PDF must be 3 MB or smaller.');
      await apiRequest(`/jobs/applications/${application._id}/offer`, { method: 'POST', body: { ...f, salary: Number(f.salary) } });
      await apiRequest(`/jobs/applications/${application._id}/offer-letter`, { method: 'POST', body: { text: letter, ...(letterFile ? { file: { name: letterFile.name, data: await readAsDataUrl(letterFile) } } : {}) } });
      onFlash?.('Offer and offer letter sent. The candidate was notified by email.', 'success');
      onSaved?.();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 6, minWidth: 220 }}>
      <strong className="text-xs">{e?.status === 'offered' ? 'Revise the offer' : 'Make an offer'}</strong>
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="form-input" style={{ ...small, flex: 1, minWidth: 0 }} type="number" min={1} required placeholder="Salary" aria-label="Salary offered" value={f.salary} onChange={set('salary')} />
        <select className="form-select" style={{ ...small, width: 78 }} aria-label="Currency" value={f.currency} onChange={set('currency')}>{[...new Set([f.currency, ...SALARY_CURRENCIES])].map((c) => <option key={c}>{c}</option>)}</select>
        <select className="form-select" style={{ ...small, width: 92 }} aria-label="Per" value={f.salaryPeriod} onChange={set('salaryPeriod')}><option value="month">/ month</option><option value="year">/ year</option><option value="hour">/ hour</option></select>
      </div>
      <label className="text-xs">Joining date<input className="form-input" style={small} type="date" value={f.startDate} onChange={set('startDate')} /></label>
      <label className="text-xs">Reply by (optional)<input className="form-input" style={small} type="date" value={f.expiresAt} onChange={set('expiresAt')} /></label>
      <textarea className="form-input" style={small} rows={2} maxLength={3000} placeholder="Terms: probation, hours, benefits… (optional)" value={f.terms} onChange={set('terms')} />
      <label className="text-xs">Offer letter (sent with the offer; salary, dates and signatures are added automatically)
        <textarea className="form-input" style={small} rows={6} maxLength={12000} required minLength={50} value={letter} onChange={(ev) => setLetter(ev.target.value)} />
      </label>
      <label className="text-xs">Signed letter PDF (optional)<input className="form-input" style={small} type="file" accept="application/pdf,.pdf" onChange={(ev) => setLetterFile(ev.target.files?.[0] || null)} /></label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => setView(letterData({ employment: { ...(e || {}), salary: Number(f.salary), currency: f.currency, startDate: f.startDate || null, offer: { ...(e?.offer || {}), salaryPeriod: f.salaryPeriod, expiresAt: f.expiresAt || null, terms: f.terms } }, job, candidate: application.applicant?.fullName, text: letter }))}>Preview letter</button>
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>{busy ? 'Sending…' : 'Send offer + letter'}</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel} style={{ padding: '5px 10px', fontSize: '0.75rem' }}>Cancel</button>}
      </div>
      {view && <OfferLetterViewer data={view} onClose={() => setView(null)} onFlash={onFlash} />}
    </form>
  );
}

// The employer's own words; the offer details table, terms and signatures are added by the design.
function letterTemplate(application, job) {
  const name = application.applicant?.fullName || 'Candidate';
  return `Dear ${name},

Further to your application and interviews, we are delighted to offer you the position of ${job?.title || 'the advertised role'} at ${job?.company || 'our organization'}. We were impressed by your experience and believe you will be a valuable addition to our team.

The details of this offer are set out below. Please bring your original CNIC and educational documents on your first day.

We look forward to welcoming you.`;
}

export function OfferLetterForm({ application, job, onSaved, onFlash }) {
  const sentText = application.employment?.offerLetter?.text;
  const [open, setOpen] = useState(false), [text, setText] = useState(() => sentText || letterTemplate(application, job)), [file, setFile] = useState(null), [busy, setBusy] = useState(false), [view, setView] = useState(null);
  const sent = application.employment?.offerLetter?.sentAt;
  const data = (body) => letterData({ employment: application.employment, job, candidate: application.applicant?.fullName, text: body });
  const viewer = view && <OfferLetterViewer data={view} onClose={() => setView(null)} onFlash={onFlash} />;
  if (!open) return <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {sent && <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => setView(data())}>View offer letter</button>}
    <button type="button" className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(true)}>{sent ? 'Update offer letter' : 'Send offer letter'}</button>
    {viewer}
  </span>;
  async function submit(ev) {
    ev.preventDefault();
    if (file && file.size > 3 * 1024 * 1024) return onFlash?.('The PDF must be 3 MB or smaller.');
    setBusy(true);
    try {
      await apiRequest(`/jobs/applications/${application._id}/offer-letter`, { method: 'POST', body: { text, ...(file ? { file: { name: file.name, data: await readAsDataUrl(file) } } : {}) } });
      onFlash?.('Offer letter sent to the candidate.', 'success');
      setOpen(false); onSaved?.();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="card" style={{ padding: 12, display: 'grid', gap: 8, width: '100%' }}>
      <strong className="text-sm">Offer letter</strong>
      <small style={{ color: 'var(--ink-soft)' }}>Write the letter in your words. The salary, joining date, terms and signature blocks are added to the design automatically.</small>
      <textarea className="form-input" rows={10} maxLength={12000} value={text} onChange={(ev) => setText(ev.target.value)} />
      <label className="text-xs">Also attach your signed letter (PDF, optional)<input className="form-input" type="file" accept="application/pdf,.pdf" onChange={(ev) => setFile(ev.target.files?.[0] || null)} /></label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button type="button" className="btn" onClick={() => setView(data(text))} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>Preview</button>
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>{busy ? 'Sending…' : 'Send letter'}</button>
        <button type="button" className="btn" onClick={() => setOpen(false)} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>Cancel</button>
      </div>
      {viewer}
    </form>
  );
}

// Offer status line for the hiring side.
export function OfferSummary({ employment }) {
  if (!employment?.offer?.sentAt) return null;
  const label = { offered: 'waiting for the candidate', accepted: 'accepted', declined: 'declined', active: 'joined' }[employment.status] || employment.status;
  return <small style={{ color: employment.status === 'declined' ? 'var(--rose)' : 'var(--ink-soft)' }}>Offer {money(employment.currency, employment.salary)} / {employment.offer.salaryPeriod || 'month'}: {label}{employment.signature?.name ? ` · signed by ${employment.signature.name}${employment.signature.at ? ' on ' + new Date(employment.signature.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}` : ''}{employment.offerLetter?.sentAt ? ' · letter sent' : ''}</small>;
}

// Candidate side: open the designed letter (with Download PDF and the signed copy, if any).
export function ViewOfferLetterButton({ employment, candidate, label = 'View offer letter', onFlash }) {
  const [view, setView] = useState(null);
  return <>
    <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setView(letterData({ employment, candidate }))}>{label}</button>
    {view && <OfferLetterViewer data={view} onClose={() => setView(null)} onFlash={onFlash} />}
  </>;
}

// The message thread on one application (both sides).
export function ApplicationThread({ applicationId, count = 0, onFlash }) {
  const [open, setOpen] = useState(false), [data, setData] = useState(null), [text, setText] = useState(''), [busy, setBusy] = useState(false);
  const load = () => apiRequest(`/jobs/applications/${applicationId}/messages`).then(setData).catch((e) => onFlash?.(e.message));
  async function send(ev) {
    ev.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try { await apiRequest(`/jobs/applications/${applicationId}/messages`, { method: 'POST', body: { text } }); setText(''); load(); } catch (e) { onFlash?.(e.message); } finally { setBusy(false); }
  }
  if (!open) return <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => { setOpen(true); load(); }}>Messages{count ? ` (${count})` : ''}</button>;
  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 8, width: '100%', maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><strong className="text-sm">Messages</strong><button type="button" className="btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => setOpen(false)}>Close</button></div>
      {!data ? <p className="text-xs" role="status">Loading…</p> : data.messages.length === 0 ? <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>No messages yet.</p> : (
        <div style={{ display: 'grid', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
          {data.messages.map((m) => (
            <p key={m._id || m.at} className="text-sm" style={{ margin: 0, padding: '6px 10px', borderRadius: 10, border: '1px solid var(--sand-line)', background: m.side === data.side ? 'var(--sand)' : 'transparent', justifySelf: m.side === data.side ? 'end' : 'start', maxWidth: '85%', whiteSpace: 'pre-wrap' }}>
              <strong>{m.side === data.side ? 'You' : m.name}:</strong> {m.text}<br /><small style={{ color: 'var(--ink-soft)' }}>{new Date(m.at).toLocaleString()}</small>
            </p>
          ))}
        </div>
      )}
      <form onSubmit={send} style={{ display: 'flex', gap: 6 }}>
        <input className="form-input" style={{ flex: 1, minWidth: 0, ...small }} maxLength={3000} placeholder="Write a message" value={text} onChange={(ev) => setText(ev.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={busy || !text.trim()} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>Send</button>
      </form>
    </div>
  );
}
