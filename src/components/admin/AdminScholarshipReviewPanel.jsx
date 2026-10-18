import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Admin review of scholarships Agents list for providers. Check the provider and the agent's
// authorization; approve to publish (and alert students), or reject with a reason.

const TABS = [['pending', 'Waiting for review'], ['approved', 'Approved'], ['rejected', 'Rejected']];
const PROVIDER = { careerz_donor: 'CareerZ donor', university: 'University', government: 'Government', foundation: 'Foundation', company: 'Company', other: 'Other' };

export default function AdminScholarshipReviewPanel({ onFlash }) {
  const [tab, setTab] = useState('pending'), [list, setList] = useState(null), [note, setNote] = useState({}), [busy, setBusy] = useState('');
  const load = () => { setList(null); apiRequest(`/admin/scholarships/review?status=${tab}`).then(setList).catch((e) => { setList([]); onFlash(e.message); }); };
  useEffect(load, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(s, decision) {
    setBusy(s._id + decision);
    try { await apiRequest(`/admin/scholarships/${s._id}/decision`, { method: 'POST', body: { decision, note: note[s._id] || '' } }); onFlash(decision === 'approve' ? `“${s.title}” published.` : `“${s.title}” rejected.`, 'success'); load(); } catch (e) { onFlash(e.message); } finally { setBusy(''); }
  }
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Scholarship Listing Review</h2>
      <p className="text-sm" style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: 760 }}>Scholarships Agents list for a provider. Listing never lets the agent award or fund: a CareerZ donor provider decides applications; any other provider takes applications on its own website.</p>
      <nav className="cz-tabbar">{TABS.map(([k, l]) => <button key={k} type="button" aria-pressed={tab === k} className={`cz-tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>)}</nav>
      {!list ? <p role="status">Loading…</p> : list.length === 0 ? <p className="admin-notice">Nothing here.</p> : list.map((s) => (
        <article key={s._id} className="card" style={{ padding: 14, display: 'grid', gap: 6 }}>
          <strong>{s.title} · {s.currency} {Number(s.amount).toLocaleString()}</strong>
          <span className="text-sm">Agent: {s.publishedBy?.fullName} ({s.publishedBy?.email})</span>
          <span className="text-sm">Provider: {s.provider?.name} · {PROVIDER[s.provider?.type] || s.provider?.type}{s.provider?.website && <> · <a href={s.provider.website} target="_blank" rel="noreferrer noopener">website</a></>}{s.donor ? ` · donor ${s.donor.fullName} confirmed ${s.review?.donorConfirmedAt ? new Date(s.review.donorConfirmedAt).toLocaleDateString() : ''}` : ''}</span>
          <span className="text-sm">{s.applicationMode === 'external' ? <>Applications on: <a href={s.externalUrl} target="_blank" rel="noreferrer noopener">{s.externalUrl}</a></> : 'Applications on CareerZ, decided by the donor'}</span>
          <span className="text-sm" style={{ whiteSpace: 'pre-wrap' }}><strong>Authorization:</strong> {s.provider?.authorization}</span>
          {s.eligibilityCriteria && <span className="text-sm">Eligibility: {s.eligibilityCriteria}</span>}
          {s.description && <span className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{s.description}</span>}
          {s.review?.note && <span className="text-sm">Note: {s.review.note}</span>}
          {tab === 'pending' && <>
            <textarea className="form-input" rows={2} maxLength={1000} placeholder="Note to the agent (required to reject)" value={note[s._id] || ''} onChange={(e) => setNote({ ...note, [s._id]: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => decide(s, 'approve')}>Approve & publish</button>
              <button type="button" className="btn" disabled={!!busy} onClick={() => decide(s, 'reject')}>Reject</button>
            </div>
          </>}
        </article>
      ))}
    </section>
  );
}
