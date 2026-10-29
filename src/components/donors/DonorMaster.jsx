import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';

// Master donor rules: the donor's AI (best applications, impact report, giving forecast) and
// Super Admin donor management (list, activity, verify, suspend, large-donation rule).

const pkr = (n) => `PKR ${Math.round(n || 0).toLocaleString()}`;
const small = { padding: '3px 10px', fontSize: '0.72rem' };

// Giving by month and the next three months (records; "Explain with AI" uses the donor's key).
export function DonorForecastCard({ onFlash }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/scholarships/mine/forecast').then(setData).catch(() => setData(null)); }, []);
  if (!data) return null;
  const max = Math.max(1, ...data.history.map((m) => m.amountPkr), ...data.forecastPkr);
  async function explain() {
    setBusy(true);
    try { setData(await apiRequest('/scholarships/mine/forecast?ai=1')); } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="card" style={{ padding: 16, margin: '16px 0', display: 'grid', gap: 10 }}>
      <h4 className="font-semibold" style={{ margin: 0 }}>Your giving and forecast</h4>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 90 }} aria-label="Giving per month">
        {data.history.map((m) => <div key={m.month} title={`${m.month}: ${pkr(m.amountPkr)}`} style={{ flex: 1, height: `${Math.max(2, (m.amountPkr / max) * 100)}%`, background: 'var(--emerald)', borderRadius: 3 }} />)}
        {data.forecastPkr.map((v, i) => <div key={i} title={`Forecast: ${pkr(v)}`} style={{ flex: 1, height: `${Math.max(2, (v / max) * 100)}%`, background: 'var(--gold)', opacity: 0.6, borderRadius: 3 }} />)}
      </div>
      <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Green: last 12 months. Gold: next 3 months ({data.forecastPkr.map(pkr).join(', ')}). {data.method}</span>
      {data.insight && <div className="text-sm" style={{ whiteSpace: 'pre-wrap', background: 'var(--sand)', padding: 10, borderRadius: 8 }}>{data.insight}</div>}
      <button type="button" className="btn" style={{ justifySelf: 'start', ...small }} disabled={busy} onClick={explain}>{busy ? 'Reading…' : 'Explain with AI'}</button>
    </div>
  );
}

// Impact report from the donor's records; AI writes it up on request.
const totals = (byCurrency) => Object.entries(byCurrency || {}).map(([c, v]) => `${c} ${Number(v).toLocaleString()}`).join(' + ');
export function DonorImpactCard({ onFlash }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/scholarships/mine/impact').then(setData).catch(() => setData(null)); }, []);
  if (!data) return null;
  const f = data.facts;
  async function write() {
    setBusy(true);
    try { setData(await apiRequest('/scholarships/mine/impact?ai=1')); } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="card" style={{ padding: 16, margin: '0 0 16px', display: 'grid', gap: 8 }}>
      <h4 className="font-semibold" style={{ margin: 0 }}>Your impact</h4>
      <span className="text-sm">{f.studentsSponsored} student(s) sponsored · {pkr(f.sponsorshipPaid)} paid of {pkr(f.sponsorshipCommitted)} committed · {f.completedSponsorships} sponsorship(s) completed · {f.scholarshipsPosted} scholarship(s) posted · {f.donationsCount} donation(s)</span>
      <span className="text-sm"><strong>Donated:</strong> {totals(f.donatedTotal) || 'nothing approved yet'}{f.donationsBeingChecked > 0 && <> · {f.donationsBeingChecked} donation(s) of {totals(f.beingCheckedTotal)} being checked by CareerZ</>}</span>
      {data.given?.length > 0 && <div style={{ display: 'grid', gap: 4 }}>{data.given.map((g, i) => <span key={i} className="text-xs" style={{ borderTop: '1px solid var(--sand-line)', paddingTop: 4 }}>{new Date(g.at).toLocaleDateString()} · {g.title} · <strong>{g.currency} {Number(g.amount || 0).toLocaleString()}</strong> · <span style={{ color: g.status === 'received' ? 'var(--emerald)' : 'var(--gold)' }}>{g.status}</span></span>)}</div>}
      {Object.keys(f.donatedByRecipientType || {}).length > 0 && <span className="text-xs">Given to: {Object.entries(f.donatedByRecipientType).map(([k, v]) => `${k} ${Number(v).toLocaleString()}`).join(' · ')}</span>}
      {data.report && <div className="text-sm" style={{ whiteSpace: 'pre-wrap', background: 'var(--sand)', padding: 10, borderRadius: 8 }}>{data.report}</div>}
      <button type="button" className="btn" style={{ justifySelf: 'start', ...small }} disabled={busy} onClick={write}>{busy ? 'Writing…' : 'Write my impact report with AI'}</button>
    </div>
  );
}

// "Rank with AI" on a scholarship's applicants.
export function RankScholarshipApplicants({ scholarshipId, onFlash }) {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try { setRows((await apiRequest(`/scholarships/${scholarshipId}/ai/rank-applications`, { method: 'POST' })).ranking); } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  return (
    <div style={{ display: 'grid', gap: 6, margin: '8px 0' }}>
      <button type="button" className="btn" style={{ justifySelf: 'start', ...small }} disabled={busy} onClick={run}>{busy ? 'Ranking…' : 'Find the best applications with AI'}</button>
      {rows && (rows.length ? rows.map((r, i) => <span key={r.applicationId} className="text-xs">{i + 1}. <strong>{r.name}</strong> · {r.score}/100 · {r.reason}</span>) : <span className="text-xs">No pending applications.</span>)}
      {rows && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>AI suggestion only; you decide.</span>}
    </div>
  );
}

// Super Admin / admin: donors, their activity, suspension and the large-donation rule.
export function AdminDonorsPanel({ onFlash, isSuperAdmin }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [act, setAct] = useState(null);
  const [threshold, setThreshold] = useState('');
  const load = () => apiRequest(`/admin/donors${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setRows).catch((e) => { setRows([]); onFlash(e.message); });
  useEffect(() => { load(); apiRequest('/admin/donation-settings').then((s) => setThreshold(String(s.thresholdPkr || ''))).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function showActivity(d) {
    if (open === d._id) { setOpen(null); return; }
    setOpen(d._id); setAct(null);
    try { setAct(await apiRequest(`/admin/donors/${d._id}/activity`)); } catch (e) { onFlash(e.message); }
  }
  async function suspend(d) {
    const next = d.status === 'suspended' ? 'active' : 'suspended';
    if (!(await showConfirm(`${next === 'suspended' ? 'Suspend' : 'Reactivate'} ${d.fullName}'s account?`, { confirmLabel: next === 'suspended' ? 'Suspend' : 'Reactivate' }))) return;
    try { await apiRequest(`/users/${d._id}/status`, { method: 'PATCH', body: { status: next } }); onFlash('Updated.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function saveThreshold(e) {
    e.preventDefault();
    try { await apiRequest('/admin/donation-settings', { method: 'PUT', body: { thresholdPkr: Number(threshold) || 0 } }); onFlash('Saved.', 'success'); } catch (err) { onFlash(err.message); }
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Donors</h2>
      <form onSubmit={saveThreshold} className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap', maxWidth: 620 }}>
        <label className="text-xs" style={{ display: 'grid', gap: 4 }}>Large donation (PKR): donors state the source of funds at or above
          <input className="form-input" type="number" min="0" disabled={!isSuperAdmin} value={threshold} onChange={(e) => setThreshold(e.target.value)} style={{ maxWidth: 180 }} placeholder="0 = off" />
        </label>
        {isSuperAdmin && <button type="submit" className="btn btn-primary">Save</button>}
      </form>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2" style={{ maxWidth: 420 }}>
        <input className="form-input" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn">Search</button>
      </form>
      {rows === null && <p role="status">Loading…</p>}
      {rows?.length === 0 && <p className="admin-notice">No donors.</p>}
      {(rows || []).map((d) => (
        <article key={d._id} className="card" style={{ padding: 14, display: 'grid', gap: 6 }}>
          <span className="text-sm"><strong>{d.fullName}</strong> · {d.organization || (d.kind === 'individual' ? 'Individual' : '—')} · {d.country || '—'} · verification: {d.verification} · account: {d.status}</span>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{d.email}{d.phone ? ` · ${d.phone}` : ''} · {d.scholarships} scholarship(s) · {d.sponsorships} sponsorship(s), {d.sponsoredPaid.toLocaleString()} paid · {d.donations} donation(s), {d.donated.toLocaleString()} given</span>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="btn" style={small} onClick={() => showActivity(d)}>{open === d._id ? 'Hide activity' : 'Activity'}</button>
            <button type="button" className="btn" style={small} onClick={() => suspend(d)}>{d.status === 'suspended' ? 'Reactivate account' : 'Suspend account'}</button>
          </div>
          {open === d._id && (act ? <div className="text-xs" style={{ display: 'grid', gap: 4, padding: 10, background: 'var(--sand)', borderRadius: 8 }}>
            <strong>Scholarships ({act.scholarships.length})</strong>
            {act.scholarships.map((s) => <span key={s._id}>{s.title} · {s.currency} {s.amount} · {s.status || ''}</span>)}
            <strong>Sponsorships ({act.sponsorships.length})</strong>
            {act.sponsorships.map((s) => <span key={s._id}>{s.student?.fullName} · {s.scholarship?.title} · {s.currency} {s.paidAmount}/{s.amount} · {s.status}</span>)}
            <strong>Donations ({act.donations.length})</strong>
            {act.donations.map((x) => <span key={x._id}>{x.fundingRequest?.title} ({x.fundingRequest?.requestType}) · {x.currency} {x.amount} · {x.status}</span>)}
            <strong>Bank transfer payments ({act.payments.length})</strong>
            {act.payments.map((p) => <span key={p._id}>{p.number} · {p.title} · {p.currency} {p.price} · {p.status}{p.sourceOfFunds ? ` · source: ${p.sourceOfFunds}` : ''}</span>)}
            <strong>Complaints ({act.complaints.length})</strong>
            {act.complaints.map((c) => <span key={c._id}>{c.subject} · {c.status}</span>)}
          </div> : <span className="text-xs">Loading…</span>)}
        </article>
      ))}
    </div>
  );
}
