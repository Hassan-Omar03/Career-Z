import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Admin Job Review queue (Master 12.5): jobs the automatic risk scan held before publishing.
// Approve publishes the job (and sends its job alerts); reject needs a reason the publisher sees.

const TABS = [['pending_review', 'Waiting for review'], ['rejected', 'Rejected'], ['active', 'Approved by admin']];
const when = (d) => (d ? new Date(d).toLocaleString() : '—');

export default function AdminJobReviewPanel({ onFlash }) {
  const [tab, setTab] = useState('pending_review');
  const [jobs, setJobs] = useState(null), [open, setOpen] = useState(null);
  const [note, setNote] = useState(''), [busy, setBusy] = useState('');
  const load = () => { setJobs(null); apiRequest(`/admin/jobs/review?status=${tab}`).then(setJobs).catch((e) => { setJobs([]); onFlash?.(e.message); }); };
  useEffect(load, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function decide(job, decision) {
    if (decision === 'reject' && !note.trim()) return onFlash?.('Write the reason so the publisher knows what to fix.');
    setBusy(job._id + decision);
    try {
      await apiRequest(`/admin/jobs/${job._id}/decision`, { method: 'POST', body: { decision, note } });
      onFlash?.(decision === 'approve' ? `“${job.title}” approved and published.` : `“${job.title}” rejected. The publisher was told why.`, 'success');
      setOpen(null); setNote(''); load();
    } catch (e) { onFlash?.(e.message); } finally { setBusy(''); }
  }

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Job Review</h2>
      <p className="text-sm" style={{ color: 'var(--ink-soft)', maxWidth: 720 }}>Jobs the automatic risk check held before publishing: requests for money, guaranteed visas, duplicates, startup employers without documents, or visa jobs from unlicensed publishers. Approve to publish, or reject with a reason the publisher will see.</p>
      <nav className="cz-tabbar" style={{ margin: '12px 0 16px' }}>
        {TABS.map(([key, label]) => <button key={key} type="button" aria-pressed={tab === key} className={`cz-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>)}
      </nav>
      {!jobs ? <p role="status">Loading…</p> : jobs.length === 0 ? <p className="admin-notice">{tab === 'pending_review' ? 'No jobs are waiting for review.' : 'Nothing here yet.'}</p> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {jobs.map((j) => (
            <article key={j._id} className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <strong>{j.title}</strong> · {j.company}{j.city ? ` · ${j.city}` : ''}
                  <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                    Posted by {j.postedBy?.fullName || 'unknown'}{j.institution ? ` for ${j.institution.name}` : ''} · submitted {when(j.moderation?.submittedAt || j.createdAt)} · risk score {j.moderation?.riskScore ?? 0}
                  </div>
                </div>
                <button type="button" className="btn" onClick={() => { setOpen(open === j._id ? null : j._id); setNote(''); }}>{open === j._id ? 'Hide' : 'Review'}</button>
              </div>
              {(j.moderation?.flags || []).length > 0 && <ul style={{ margin: 0, paddingLeft: 18 }}>{j.moderation.flags.map((f) => <li key={f.code} className="text-sm">{f.label} <small style={{ color: 'var(--ink-soft)' }}>(+{f.points})</small></li>)}</ul>}
              {j.moderation?.note && <p className="text-sm" style={{ margin: 0 }}><strong>Admin note:</strong> {j.moderation.note}{j.moderation.reviewedBy?.fullName ? ` — ${j.moderation.reviewedBy.fullName}, ${when(j.moderation.reviewedAt)}` : ''}</p>}
              {open === j._id && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div className="text-sm" style={{ whiteSpace: 'pre-wrap', background: 'var(--sand)', padding: 12, borderRadius: 10 }}>{j.description || 'No description.'}</div>
                  <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                    {j.salaryMin || j.salaryMax ? `Salary ${j.currency} ${[j.salaryMin, j.salaryMax].filter(Boolean).join(' – ')} · ` : ''}{j.visaSponsorship ? 'Visa sponsorship · ' : ''}{j.contactEmail ? `Email ${j.contactEmail} · ` : ''}{j.contactPhone ? `Phone ${j.contactPhone}` : ''}
                  </div>
                  {tab === 'pending_review' && <>
                    <label className="text-sm" style={{ display: 'grid', gap: 4 }}>Note to the publisher (required to reject)
                      <textarea className="form-input" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => decide(j, 'approve')}>{busy === j._id + 'approve' ? 'Publishing…' : 'Approve & publish'}</button>
                      <button type="button" className="btn" disabled={!!busy} onClick={() => decide(j, 'reject')}>{busy === j._id + 'reject' ? 'Rejecting…' : 'Reject'}</button>
                    </div>
                  </>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
