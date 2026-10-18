import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { readAsDataUrl } from '../recruitment/files';

// "Apply without an account": name, email, CV file. The server emails a link; opening it
// confirms the email, sends the application to the employer and shows its status later.
const MAX = 2 * 1024 * 1024;

export default function GuestApplyPanel({ job }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState('');
  const [f, setF] = useState({ name: '', email: '', phone: '', city: '', coverLetter: '', consent: false, website: '' });
  const [file, setFile] = useState(null);
  if (user) return null;
  if (done) return <div className="dp-action ok" role="status"><strong>Check your email</strong><p>{done}</p></div>;
  if (!open) return <div className="dp-action"><strong>No account?</strong><p>Apply with your CV and email. You can track the application from the link we email you.</p><div className="dc-actions"><button type="button" className="btn" onClick={() => setOpen(true)}>Apply without an account</button></div></div>;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!file) return setError('Attach your CV.');
    if (file.size > MAX) return setError('The CV must be 2 MB or smaller.');
    setBusy(true);
    try {
      await apiRequest(`/jobs/${job._id}/guest-apply`, { method: 'POST', auth: false, body: { ...f, cv: { name: file.name, data: await readAsDataUrl(file) } } });
      setDone(`We sent a link to ${f.email}. Open it to send your application to the employer. The same link shows its status later, so keep the email.`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <form className="dp-action" onSubmit={submit}>
      <strong>Apply without an account: {job.title}</strong>
      <label>Full name<input className="form-input" required maxLength={120} value={f.name} onChange={set('name')} autoComplete="name" /></label>
      <label>Email<input className="form-input" type="email" required maxLength={160} value={f.email} onChange={set('email')} autoComplete="email" /></label>
      <label>Phone (optional)<input className="form-input" maxLength={40} value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
      <label>City (optional)<input className="form-input" maxLength={80} value={f.city} onChange={set('city')} /></label>
      <label>CV (PDF or Word, up to 2 MB)<input className="form-input" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
      <label>Cover letter (optional)<textarea className="form-input" rows={4} maxLength={4000} value={f.coverLetter} onChange={set('coverLetter')} /></label>
      {/* Left empty by people; bots fill it. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 400 }}><input type="checkbox" checked={f.consent} onChange={set('consent')} required /> I agree to share these details and my CV with the hiring organization. CareerZ keeps them for a limited time only.</label>
      {error && <p className="dp-error" role="alert">{error}</p>}
      <div className="dc-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send application'}</button><button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button></div>
    </form>
  );
}
