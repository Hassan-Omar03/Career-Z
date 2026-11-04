import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { FilePicker } from './shared';
import { rememberIntent } from '../../utils/continueIntent';

// On a job with the type Freelance: the freelancer offers a fee split into milestones.
export default function ProposalPanel({ job }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ coverLetter: '', milestones: [{ title: '', amount: '', dueDate: '' }], attachments: [] });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const total = form.milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const setM = (i, key, value) => setForm((f) => ({ ...f, milestones: f.milestones.map((m, n) => (n === i ? { ...m, [key]: value } : m)) }));
  async function send(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await apiRequest(`/freelance/jobs/${job._id}/proposals`, { method: 'POST', body: { coverLetter: form.coverLetter, fee: total, attachments: form.attachments, milestones: form.milestones.map((m) => ({ title: m.title, amount: Number(m.amount), dueDate: m.dueDate || null })) } });
      navigate('/dashboard?tab=freelance&freelanceHub=proposals');
    } catch (err) { setError(err.message); setBusy(false); }
  }
  if (job.employerId && user && String(job.employerId) === String(user._id)) return null;
  if (!user) return <div className="dp-action"><p>This is freelance work. Sign in to send a proposal with your fee and milestones.</p><Link className="btn btn-primary" to="/login" onClick={() => rememberIntent(`/jobs/${job._id}`, job.title)}>Sign in</Link></div>;
  if (!open) return <div className="dp-action"><p>This is freelance work. Offer your fee and milestones. CareerZ holds each payment until the client approves the work.</p><button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>Send a proposal</button></div>;
  return (
    <form className="dp-action fl-box" onSubmit={send}>
      <h3>Your proposal</h3>
      <label className="hiring-field"><span>How would you do this work?</span><textarea className="form-input" rows={4} required value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} /></label>
      <div className="hiring-field">
        <span>Milestones</span>
        {form.milestones.map((m, i) => (
          <div key={i} className="fl-actions">
            <input className="form-input fl-grow" required aria-label={`Milestone ${i + 1} title`} placeholder="What you will deliver" value={m.title} onChange={(e) => setM(i, 'title', e.target.value)} />
            <input className="form-input fl-small" required type="number" min="1" aria-label={`Milestone ${i + 1} amount`} placeholder="Amount" value={m.amount} onChange={(e) => setM(i, 'amount', e.target.value)} />
            <input className="form-input fl-small" type="date" aria-label={`Milestone ${i + 1} due date`} value={m.dueDate} onChange={(e) => setM(i, 'dueDate', e.target.value)} />
            {form.milestones.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, milestones: form.milestones.filter((_, n) => n !== i) })}>Remove</button>}
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm fl-self-start" onClick={() => setForm({ ...form, milestones: [...form.milestones, { title: '', amount: '', dueDate: '' }] })}>Add milestone</button>
      </div>
      <p><strong>Your fee: {job.currency || 'PKR'} {total.toLocaleString()}</strong></p>
      <FilePicker value={form.attachments} onChange={(attachments) => setForm({ ...form, attachments })} onFlash={setError} label="Attach portfolio files" />
      {error && <p className="vf-error" role="alert">{error}</p>}
      <div className="fl-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send proposal'}</button><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}
