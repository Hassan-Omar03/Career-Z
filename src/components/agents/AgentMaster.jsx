import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import { ManualPayButton } from '../payments/ManualPay';

// Master "Jobs" chapter: an agent recruits for an employer on CareerZ; the employer accepts and
// pays the agent's commission on a hire. Master Super Admin: agents list, activity, posting ban,
// licence cancellation.

const money = (cur, n) => `${cur} ${Number(n || 0).toLocaleString()}`;
const tagStyle = (s) => ({ fontSize: 12, fontWeight: 600, color: s === 'accepted' || s === 'paid' ? 'var(--emerald)' : s === 'declined' || s === 'cancelled' ? 'var(--rose)' : 'var(--gold)' });

// Shown on the agent's Post a Job form: the employer the job is for.
export function EmployerEmailField({ value, onChange }) {
  return (
    <label className="text-sm" style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontWeight: 600 }}>Employer you recruit for (their CareerZ email)</span>
      <input className="form-input" type="email" placeholder="hr@company.com" value={value} onChange={(e) => onChange(e.target.value)} />
      <small style={{ color: 'var(--ink-soft)' }}>The employer must accept on CareerZ. On a successful hire, that employer pays your commission through CareerZ. Leave empty only if you will not claim a commission here.</small>
    </label>
  );
}

// The employer's side: agent requests to accept, and commissions to pay.
export function EmployerAgentRequests({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  const [due, setDue] = useState(null);
  const load = () => {
    apiRequest('/jobs/mine/agent-requests').then(setJobs).catch(() => setJobs([]));
    apiRequest('/jobs/mine/agent-commissions').then(setDue).catch(() => setDue([]));
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!jobs?.length && !due?.length) return null;
  async function answer(job, accept) {
    const note = accept ? '' : await showPrompt('Why do you decline? The agent is told.', { title: 'Decline agent', required: true });
    if (!accept && !note) return;
    if (accept && !(await showConfirm(`Accept ${job.postedBy?.fullName} as your recruiter for "${job.title}"? On a successful hire you pay ${job.employerConsent?.ratePercent}% of the salary as the agent's commission through CareerZ.`, { confirmLabel: 'Accept' }))) return;
    try { await apiRequest(`/jobs/${job._id}/agent-request`, { method: 'PATCH', body: { accept, note } }); onFlash(accept ? 'Accepted. The agent was told.' : 'Declined. The agent was told.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  return (
    <div className="card" style={{ padding: 16, marginBottom: 16, display: 'grid', gap: 10 }}>
      <h4 className="font-semibold" style={{ margin: 0 }}>Agent requests</h4>
      {(jobs || []).map((j) => (
        <div key={j._id} className="text-sm" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--sand-line)', paddingTop: 8 }}>
          <span style={{ flex: 1, minWidth: 220 }}><strong>{j.title}</strong> · agent {j.postedBy?.fullName} ({j.postedBy?.phone || j.postedBy?.email}) · commission {j.employerConsent?.ratePercent}% of salary</span>
          {j.employerConsent?.status === 'pending' ? <>
            <button type="button" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => answer(j, true)}>Accept</button>
            <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => answer(j, false)}>Decline</button>
          </> : <span style={tagStyle(j.employerConsent?.status)}>{j.employerConsent?.status}</span>}
        </div>
      ))}
      {(due || []).length > 0 && <h5 style={{ margin: '6px 0 0', fontSize: 13 }}>Agent commissions</h5>}
      {(due || []).map((c) => (
        <div key={c._id} className="text-sm" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--sand-line)', paddingTop: 8 }}>
          <span style={{ flex: 1, minWidth: 220 }}><strong>{money(c.currency, c.amount)}</strong> to {c.agent?.fullName} for {c.job?.title || 'a hire'}</span>
          {['pending', 'approved', 'available'].includes(c.status) ? <ManualPayButton kind="agent_commission" id={c._id} label="Pay commission" onFlash={onFlash} onDone={load} /> : <span style={tagStyle(c.status)}>{c.status}</span>}
        </div>
      ))}
    </div>
  );
}

// Badge in the agent's job list.
export function EmployerConsentBadge({ job }) {
  const s = job?.employerConsent?.status;
  if (!s) return null;
  return <span style={tagStyle(s)}>{s === 'pending' ? 'Waiting for the employer' : s === 'accepted' ? 'Employer accepted' : 'Employer declined'}</span>;
}

// "Improve with AI" for the job description (the poster's own AI key).
export function ImproveDescriptionButton({ form, setForm, onFlash }) {
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      const r = await apiRequest('/jobs/ai/improve-description', { method: 'POST', body: { title: form.title, company: form.company, description: form.description, skills: String(form.skills || '').split(',').map((s) => s.trim()).filter(Boolean) } });
      setForm((f) => ({ ...f, description: r.description }));
      onFlash('Description improved. Check it before posting.', 'success');
    } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  return <button type="button" className="btn" style={{ justifySelf: 'start', padding: '4px 12px', fontSize: '0.78rem' }} disabled={busy} onClick={run}>{busy ? 'Writing…' : 'Improve with AI'}</button>;
}

// "Rank with AI" for a job's applicants.
export function RankApplicantsButton({ jobId, onFlash }) {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try { setRows((await apiRequest(`/jobs/${jobId}/ai/rank-applicants`, { method: 'POST' })).ranking); } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  return (
    <div style={{ display: 'grid', gap: 6, margin: '8px 0' }}>
      <button type="button" className="btn" style={{ justifySelf: 'start', padding: '4px 12px', fontSize: '0.78rem' }} disabled={busy} onClick={run}>{busy ? 'Ranking…' : 'Rank candidates with AI'}</button>
      {rows && (rows.length ? rows.map((r, i) => <span key={r.applicationId} className="text-xs">{i + 1}. <strong>{r.name}</strong> · {r.score}/100 · {r.reason}</span>) : <span className="text-xs">No candidates to rank yet.</span>)}
      {rows && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>AI suggestion only; you decide.</span>}
    </div>
  );
}

// Market trends from CareerZ's own jobs (last 90 days); "Explain with AI" uses the person's key.
export function MarketTrendsCard({ onFlash }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/jobs/ai/market-trends').then(setData).catch(() => setData(null)); }, []);
  if (!data) return null;
  const s = data.stats;
  const pretty = (v) => String(v || '').replace(/_/g, ' ');
  async function explain() {
    setBusy(true);
    try { setData(await apiRequest('/jobs/ai/market-trends?ai=1')); } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  const line = { fontSize: 12, display: 'block' };
  return (
    <div className="card" style={{ padding: 16, margin: '16px 0', display: 'grid', gap: 10 }}>
      <h4 className="font-semibold" style={{ margin: 0 }}>Market trends (last {s.periodDays} days on CareerZ)</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div><strong className="text-xs">Most jobs by field</strong>{s.jobsByField.map((r) => <span key={r.field} style={line}>{pretty(r.field)}: {r.jobs}</span>)}</div>
        <div><strong className="text-xs">Most jobs by city</strong>{s.jobsByCity.map((r) => <span key={r.city} style={{ ...line, textTransform: 'capitalize' }}>{r.city}: {r.jobs}</span>)}</div>
        <div><strong className="text-xs">Average salary (PKR)</strong>{s.salaryPkr.map((r) => <span key={r.field} style={line}>{pretty(r.field)}: {r.avgMin.toLocaleString()}{r.avgMax ? ' – ' + r.avgMax.toLocaleString() : ''}</span>)}</div>
        <div><strong className="text-xs">Applicants per job</strong>{s.competition.map((r) => <span key={r.field} style={line}>{pretty(r.field)}: {r.perJob}</span>)}</div>
        <div><strong className="text-xs">Skills employers ask for</strong>{s.topSkills.map((r) => <span key={r.skill} style={line}>{r.skill} ({r.jobs})</span>)}</div>
      </div>
      {data.insight && <div className="text-sm" style={{ whiteSpace: 'pre-wrap', background: 'var(--sand)', padding: 10, borderRadius: 8 }}>{data.insight}</div>}
      <button type="button" className="btn" style={{ justifySelf: 'start', padding: '4px 12px', fontSize: '0.78rem' }} disabled={busy} onClick={explain}>{busy ? 'Reading…' : 'Explain with AI'}</button>
    </div>
  );
}

// Super Admin / admin: every agent, their work, and the master sanctions.
export function AdminAgentsPanel({ onFlash, isSuperAdmin }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [act, setAct] = useState(null);
  const load = () => apiRequest(`/admin/agents${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setRows).catch((e) => { setRows([]); onFlash(e.message); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function showActivity(a) {
    if (open === a._id) { setOpen(null); return; }
    setOpen(a._id); setAct(null);
    try { setAct(await apiRequest(`/admin/agents/${a._id}/activity`)); } catch (e) { onFlash(e.message); }
  }
  async function ban(a, banned) {
    let body = { banned };
    if (banned) {
      const reason = await showPrompt('Why is posting paused? The agent is told.', { title: 'Pause job posting', required: true });
      if (!reason) return;
      const days = await showPrompt('For how many days? (leave empty = until lifted)', { title: 'Pause job posting' });
      body = { banned, reason, days: Number(days) || 0 };
    }
    try { await apiRequest(`/admin/agents/${a._id}/posting-ban`, { method: 'PATCH', body }); onFlash(banned ? 'Job posting paused.' : 'Posting allowed again.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function suspend(a) {
    if (!(await showConfirm(`Suspend ${a.fullName}'s whole account? They are logged out.`, { confirmLabel: 'Suspend' }))) return;
    try { await apiRequest(`/users/${a._id}/status`, { method: 'PATCH', body: { status: a.status === 'suspended' ? 'active' : 'suspended' } }); onFlash('Updated.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function cancelLicence(a) {
    const reason = await showPrompt(`Cancel ${a.fullName}'s agent licence? Their agent role is removed and open jobs close. Reason:`, { title: 'Cancel agent licence', required: true });
    if (!reason) return;
    try { const r = await apiRequest(`/admin/agents/${a._id}/cancel-licence`, { method: 'POST', body: { reason } }); onFlash(`Licence cancelled; ${r.closedJobs} job(s) closed.`, 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  const small = { padding: '3px 10px', fontSize: '0.72rem' };
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Agents</h2>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2" style={{ maxWidth: 420 }}>
        <input className="form-input" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn">Search</button>
      </form>
      {rows === null && <p role="status">Loading…</p>}
      {rows?.length === 0 && <p className="admin-notice">No agents.</p>}
      {(rows || []).map((a) => {
        const banned = a.agentSanctions?.postingBanned;
        return (
          <article key={a._id} className="card" style={{ padding: 14, display: 'grid', gap: 6 }}>
            <span className="text-sm"><strong>{a.fullName}</strong> · {a.company || '—'} · {a.country || '—'} · {a.kind || 'agent'} · verification: {a.verification} · account: {a.status}{banned ? ' · posting paused' : ''}</span>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{a.email}{a.phone ? ` · ${a.phone}` : ''} · {a.jobs} job(s) · {a.hires} hire(s) · joined {new Date(a.createdAt).toLocaleDateString()}</span>
            <div className="flex gap-2 flex-wrap">
              <button type="button" className="btn" style={small} onClick={() => showActivity(a)}>{open === a._id ? 'Hide activity' : 'Activity'}</button>
              <button type="button" className="btn" style={small} onClick={() => ban(a, !banned)}>{banned ? 'Allow posting' : 'Pause job posting'}</button>
              <button type="button" className="btn" style={small} onClick={() => suspend(a)}>{a.status === 'suspended' ? 'Reactivate account' : 'Suspend account'}</button>
              {isSuperAdmin && <button type="button" className="btn" style={small} onClick={() => cancelLicence(a)}>Cancel licence</button>}
            </div>
            {open === a._id && (act ? <div className="text-xs" style={{ display: 'grid', gap: 4, padding: 10, background: 'var(--sand)', borderRadius: 8 }}>
              <strong>Profile</strong>
              <span>Experience: {act.profile.experienceYears?.replace(/_/g, ' ') || '—'} · {act.profile.experienceDetails || ''}</span>
              <span>Office: {act.profile.agencyAddress || '—'} · Agreement: {act.profile.agentAgreement ? 'accepted' : 'not accepted'}</span>
              <strong>Jobs ({act.jobs.length})</strong>
              {act.jobs.map((j) => <span key={j._id}>{j.title} · {j.company} · {j.status}{j.representedEmployer ? ` · for ${j.representedEmployer.fullName} (${j.employerConsent?.status})` : ''}</span>)}
              <span>Applications by stage: {Object.entries(act.applicationsByStage).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'}</span>
              <strong>Commissions ({act.commissions.length})</strong>
              {act.commissions.map((c) => <span key={c._id}>{money(c.currency, c.amount)} · {c.job?.title} · {c.employer ? `paid by ${c.employer.fullName}` : c.source} · {c.status}</span>)}
              <strong>Scholarship listings ({act.scholarships.length})</strong>
              <strong>Complaints ({act.complaints.length})</strong>
              {act.complaints.map((c) => <span key={c._id}>{c.subject} · {c.category} · {c.status}</span>)}
            </div> : <span className="text-xs">Loading…</span>)}
          </article>
        );
      })}
    </div>
  );
}
