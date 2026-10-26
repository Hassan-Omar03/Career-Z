import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { readAsDataUrl } from '../recruitment/files';
import GuidedResumeBuilder from '../dashboard/GuidedResumeBuilder';
import { cvPdfDataUrl, downloadCvPdf } from '../dashboard/CvDesigner';

// "Apply without an account": name, email, CV file. The server emails a link; opening it
// confirms the email, sends the application to the employer and shows its status later.
const MAX = 2 * 1024 * 1024;

export default function GuestApplyPanel({ job }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState('');
  const [f, setF] = useState({ name: '', email: '', phone: '', city: '', coverLetter: '', consent: false, website: '' });
  const [file, setFile] = useState(null);
  // A guest can also build a CV here; it is sent as a PDF. Nothing is stored before applying.
  const [source, setSource] = useState('upload'), [built, setBuilt] = useState(null), [building, setBuilding] = useState(null);
  const person = { fullName: f.name, email: f.email, phone: f.phone, city: f.city };
  if (user) return null;
  if (done) return <div className="dp-action ok" role="status"><strong>Check your email</strong><p>{done}</p></div>;
  if (!open) return <div className="dp-action"><strong>No account?</strong><p>Apply with your CV and email. You can track the application from the link we email you.</p><div className="dc-actions"><button type="button" className="btn" onClick={() => setOpen(true)}>Apply without an account</button></div></div>;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (source === 'upload' && !file) return setError('Attach your CV.');
    if (source === 'upload' && file.size > MAX) return setError('The CV must be 2 MB or smaller.');
    if (source === 'build' && !built) return setError('Build your CV first, or upload a file.');
    setBusy(true);
    try {
      const cv = source === 'build' ? { name: `${f.name || 'My'} CV.pdf`, data: await cvPdfDataUrl(built, person, 'ats') } : { name: file.name, data: await readAsDataUrl(file) };
      await apiRequest(`/jobs/${job._id}/guest-apply`, { method: 'POST', auth: false, body: { ...f, cv } });
      setDone(`We sent a link to ${f.email}. Open it to send your application to the employer. The same link shows its status later, so keep the email.`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <form className="dp-action" onSubmit={submit}>
      <strong>Apply without an account: {job.title}</strong>
      <label>Full name<input className="form-input" required maxLength={120} value={f.name} onChange={set('name')} autoComplete="name" /></label>
      <label>Email<input className="form-input" type="email" required maxLength={160} value={f.email} onChange={set('email')} autoComplete="email" /></label>
      <label>Phone<input className="form-input" type="tel" required maxLength={40} pattern="\+?[0-9][0-9 \-]{6,18}" title="Phone number, e.g. 03001234567" placeholder="03001234567" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
      <label>City (optional)<input className="form-input" maxLength={80} value={f.city} onChange={set('city')} /></label>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 6, fontWeight: 400 }}><input type="radio" name="guest-cv" checked={source === 'upload'} onChange={() => setSource('upload')} /> Upload my CV</label>
        <label style={{ display: 'flex', gap: 6, fontWeight: 400 }}><input type="radio" name="guest-cv" checked={source === 'build'} onChange={() => setSource('build')} /> Build a CV here</label>
      </div>
      {source === 'upload' && <label>CV (PDF or Word, up to 2 MB)<input className="form-input" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>}
      {source === 'build' && (building
        ? <GuidedResumeBuilder guest resume={building} setResume={setBuilding} user={person} save={async () => {}} onFlash={(m, kind) => (kind === 'success' ? null : setError(m))} onExit={() => setBuilding(null)} onFinish={(cv) => { setBuilt(cv); setBuilding(null); }} finishLabel="Use this CV" />
        : <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {built && <span className="dp-note">Your CV is ready.</span>}
          <button type="button" className="btn" onClick={() => setBuilding(built || { education: [], experience: [], skills: [], languages: [], certifications: [], portfolio: [] })}>{built ? 'Edit CV' : 'Start building'}</button>
          {built && <button type="button" className="btn" onClick={() => downloadCvPdf(built, person, 'ats').catch((e) => setError(e.message))}>Preview PDF</button>}
          {!f.name && <small className="dp-note">Fill in your name above first; it goes on the CV.</small>}
        </div>)}
      <label>Cover letter (optional)<textarea className="form-input" rows={4} maxLength={4000} value={f.coverLetter} onChange={set('coverLetter')} /></label>
      {/* Left empty by people; bots fill it. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 400 }}><input type="checkbox" checked={f.consent} onChange={set('consent')} required /> I agree to share these details and my CV with the hiring organization. CareerZ keeps them for a limited time only.</label>
      {error && <p className="dp-error" role="alert">{error}</p>}
      <div className="dc-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send application'}</button><button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button></div>
    </form>
  );
}
