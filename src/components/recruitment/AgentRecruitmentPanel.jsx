import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { CATEGORY_LABEL, REQUEST_STATUS, Thread, Agreements, AgreementSummary, InvoiceLine, label, row, grow } from './RecruitmentShared';
import { day } from './files';

// Agent side of Institute–Agent recruitment: the public recruitment profile institutes search,
// incoming requests (accept / decline / ask), agreeing terms, and publishing jobs for an
// institute under an active agreement. Joining is confirmed by the institute, not the agent.
// `renderPostJob(agreement, done)` draws the existing job form in agreement mode.

const SUBS = [['requests', 'Requests'], ['profile', 'Recruitment Profile'], ['invoices', 'Invoices & Earnings']];

export default function AgentRecruitmentPanel({ onFlash, renderPostJob }) {
  const [sub, setSub] = useState('requests');
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Institute Requests</h2>
      <p className="text-sm" style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: 720 }}>Institutes can ask you to recruit for them. Once you both accept the terms, you publish the jobs, manage applicants and mark who joined; the institute confirms the joining and the fee follows your agreement.</p>
      <nav className="cz-tabbar">{SUBS.map(([k, l]) => <button key={k} type="button" aria-pressed={sub === k} className={`cz-tab${sub === k ? ' active' : ''}`} onClick={() => setSub(k)}>{l}</button>)}</nav>
      {sub === 'requests' && <Requests onFlash={onFlash} renderPostJob={renderPostJob} />}
      {sub === 'profile' && <Profile onFlash={onFlash} />}
      {sub === 'invoices' && <Invoices onFlash={onFlash} />}
    </section>
  );
}

function Profile({ onFlash }) {
  const [p, setP] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/recruitment/agent-profile').then((d) => setP({ specialties: d.specialties || [], serviceCities: (d.serviceCities || []).join(', '), experienceYears: d.experienceYears || '', bio: d.bio || '', acceptingRequests: d.acceptingRequests !== false })).catch((e) => onFlash(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return <p role="status">Loading…</p>;
  const toggle = (c) => setP({ ...p, specialties: p.specialties.includes(c) ? p.specialties.filter((x) => x !== c) : [...p.specialties, c] });
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try { await apiRequest('/recruitment/agent-profile', { method: 'PUT', body: { ...p, experienceYears: Number(p.experienceYears) || 0 } }); onFlash('Recruitment profile saved.', 'success'); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="card" style={{ padding: 16, display: 'grid', gap: 10, maxWidth: 720 }}>
      <span style={label}>What you recruit for</span>
      <div style={{ ...row, gap: 6 }}>{Object.entries(CATEGORY_LABEL).map(([v, l]) => <label key={v} className="text-sm" style={{ display: 'flex', gap: 4, alignItems: 'center', border: '1px solid var(--sand-line)', borderRadius: 999, padding: '3px 10px' }}><input type="checkbox" checked={p.specialties.includes(v)} onChange={() => toggle(v)} />{l}</label>)}</div>
      <label className="text-xs">Cities you serve (comma separated)<input className="form-input" value={p.serviceCities} onChange={(e) => setP({ ...p, serviceCities: e.target.value })} /></label>
      <label className="text-xs">Years of recruitment experience<input className="form-input" type="number" min={0} max={60} value={p.experienceYears} onChange={(e) => setP({ ...p, experienceYears: e.target.value })} style={{ maxWidth: 160 }} /></label>
      <label className="text-xs">About your service<textarea className="form-input" rows={4} maxLength={1500} value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} /></label>
      <label className="text-sm" style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={p.acceptingRequests} onChange={(e) => setP({ ...p, acceptingRequests: e.target.checked })} /> Show me in Find Agents and accept new requests</label>
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifySelf: 'start' }}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}

function Requests({ onFlash, renderPostJob }) {
  const [list, setList] = useState(null), [posting, setPosting] = useState(null);
  const load = () => apiRequest('/recruitment/requests').then(setList).catch((e) => { setList([]); onFlash(e.message); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function respond(r, action) {
    let message = '';
    if (action !== 'accept') { message = window.prompt(action === 'clarify' ? 'Your question for the institute' : 'Reason for declining (optional)'); if (message === null || (action === 'clarify' && !message.trim())) return; }
    try { await apiRequest(`/recruitment/requests/${r._id}/respond`, { method: 'POST', body: { action, message } }); onFlash(action === 'accept' ? 'Accepted. Now agree the terms.' : 'Answer sent.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  if (!list) return <p role="status">Loading…</p>;
  if (posting) return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={() => setPosting(null)}>← Back to requests</button>
      <div className="card" style={{ padding: 12 }}><AgreementSummary a={posting.activeAgreement} /></div>
      {renderPostJob(posting, () => { setPosting(null); onFlash('Find the job in My Job Posts to manage its applicants.', 'success'); })}
    </div>
  );
  if (!list.length) return <p className="admin-notice">No requests yet. Complete your Recruitment Profile so institutes can find you.</p>;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {list.map((r) => (
        <article key={r._id} className="card" style={{ padding: 14, display: 'grid', gap: 10 }}>
          <div className="text-sm" style={{ display: 'grid', gap: 2 }}>
            <strong>{r.institution?.name || 'Institute'} · {REQUEST_STATUS[r.status]}</strong>
            <span>{r.positions.map((p) => `${p.vacancies} × ${p.title}`).join(', ')}{r.city ? ` · ${r.city}` : ''}</span>
            <span style={{ color: 'var(--ink-soft)' }}>Received {day(r.createdAt)}{r.hiringDeadline ? ` · hire by ${day(r.hiringDeadline)}` : ''}{r.proposedFee ? ` · proposed fee: ${r.proposedFee}` : ''}</span>
            {r.specialRequirements && <span>Requirements: {r.specialRequirements}</span>}
            {r.positions.map((p) => (p.qualifications || p.responsibilities || p.salaryMin) ? <span key={p._id} style={{ color: 'var(--ink-soft)' }}>{p.title}: {[p.qualifications, p.experienceYears ? `${p.experienceYears}+ yrs` : '', p.salaryMin || p.salaryMax ? `${p.currency} ${[p.salaryMin, p.salaryMax].filter(Boolean).join('–')}` : '', p.responsibilities].filter(Boolean).join(' · ')}</span> : null)}
          </div>
          {['sent', 'clarification_requested'].includes(r.status) && <div style={row}>
            <button type="button" className="btn btn-primary" onClick={() => respond(r, 'accept')}>Accept</button>
            <button type="button" className="btn" onClick={() => respond(r, 'clarify')}>Ask a question</button>
            <button type="button" className="btn" onClick={() => respond(r, 'reject')}>Decline</button>
          </div>}
          <Thread request={r} onFlash={onFlash} onSaved={load} />
          {['accepted', 'agreed', 'completed'].includes(r.status) && <Agreements request={r} side="agent" onFlash={onFlash} onSaved={load} />}
          {r.status === 'agreed' && r.activeAgreement?.status === 'active' && <button type="button" className="btn btn-primary" style={{ justifySelf: 'start' }} onClick={() => setPosting(r)}>Post a job for {r.institution?.name}</button>}
        </article>
      ))}
    </div>
  );
}

function Invoices({ onFlash }) {
  const [list, setList] = useState(null);
  useEffect(() => { apiRequest('/recruitment/invoices').then(setList).catch((e) => { setList([]); onFlash(e.message); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function escalate(inv) {
    const note = window.prompt('Why can no replacement be provided?');
    if (!note) return;
    try { await apiRequest(`/recruitment/invoices/${inv._id}/escalate`, { method: 'POST', body: { note } }); onFlash('Sent to admin review.', 'success'); setList(await apiRequest('/recruitment/invoices')); } catch (e) { onFlash(e.message); }
  }
  if (!list) return <p role="status">Loading…</p>;
  if (!list.length) return <p className="admin-notice">Invoices appear after an institute confirms a hire you made. Your earning becomes withdrawable once an admin verifies the institute's payment.</p>;
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {list.map((inv) => (
        <article key={inv._id} className="card" style={{ padding: 14, display: 'grid', gap: 8 }}>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{inv.institution?.name}</span>
          <InvoiceLine inv={inv} />
          {inv.status === 'paid' && inv.replacement?.status !== 'awaiting_replacement' && !['refunded', 'refund_review'].includes(inv.replacement?.status) && <span className="text-xs" style={{ color: 'var(--emerald)' }}>Earning released to your wallet (Commissions / Wallet tabs).</span>}
          {inv.replacement?.status === 'awaiting_replacement' && <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={() => escalate(inv)}>Cannot replace: ask admin</button>}
        </article>
      ))}
    </div>
  );
}
