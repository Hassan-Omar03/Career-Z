import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Agent scholarship listings for providers. The agent lists; the provider decides. With a CareerZ
// Donor as provider the donor confirms and decides applications on CareerZ; otherwise students
// apply on the provider's own page. Every listing is approved by an admin before going live.

const PROVIDERS = [['university', 'University'], ['government', 'Government'], ['foundation', 'Foundation / trust'], ['company', 'Company'], ['other', 'Other organization'], ['careerz_donor', 'A CareerZ donor']];
const REVIEW = { awaiting_donor: 'Waiting for the donor to confirm', pending: 'Waiting for admin review', approved: 'Published', rejected: 'Not approved' };
const EMPTY = { title: '', amount: '', currency: 'PKR', country: 'PK', applicationDeadline: '', seatsAvailable: 1, eligibilityCriteria: '', description: '', externalUrl: '', audience: ['students'],
  provider: { type: 'university', name: '', website: '', authorization: '', donor: '' } };
const row = { display: 'flex', gap: 10, flexWrap: 'wrap' }, grow = { flex: '1 1 180px', minWidth: 0 };

export default function AgentScholarshipsPanel({ onFlash }) {
  const [list, setList] = useState(null), [f, setF] = useState(EMPTY), [busy, setBusy] = useState(false), [showForm, setShowForm] = useState(false);
  const load = () => apiRequest('/scholarships/agent/mine').then(setList).catch((e) => { setList([]); onFlash(e.message); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setP = (k) => (e) => setF({ ...f, provider: { ...f.provider, [k]: e.target.value } });
  const donorProvider = f.provider.type === 'careerz_donor';
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f, amount: Number(f.amount), seatsAvailable: Number(f.seatsAvailable) || 1, applicationDeadline: f.applicationDeadline || undefined };
      if (donorProvider) delete body.externalUrl;
      await apiRequest('/scholarships/agent', { method: 'POST', body });
      onFlash(donorProvider ? 'Sent to the donor to confirm, then to admin review.' : 'Sent to admin review before it goes live.', 'success');
      setF(EMPTY); setShowForm(false); load();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function close(s) {
    if (!window.confirm(`Close “${s.title}”? It stops taking applications.`)) return;
    try { await apiRequest(`/scholarships/agent/${s._id}`, { method: 'PATCH', body: { status: 'closed' } }); onFlash('Closed.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Scholarship Listings</h2>
      <p className="text-sm" style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: 760 }}>List scholarships you are authorized to publish for a university, government body, foundation, company or a CareerZ donor. You publish the listing only; the provider decides who gets it and pays it.</p>
      {!showForm && <button type="button" className="btn btn-primary" style={{ justifySelf: 'start' }} onClick={() => setShowForm(true)}>+ List a scholarship</button>}
      {showForm && (
        <form onSubmit={submit} className="card" style={{ padding: 16, display: 'grid', gap: 10, maxWidth: 760 }}>
          <strong>Provider</strong>
          <div style={row}>
            <select className="form-select" style={grow} value={f.provider.type} onChange={setP('type')} aria-label="Provider type">{PROVIDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            {donorProvider ? <DonorPicker value={f.provider.donor} onChange={(id) => setF({ ...f, provider: { ...f.provider, donor: id } })} onFlash={onFlash} /> : <input className="form-input" style={grow} required placeholder="Provider name, e.g. HEC Pakistan" value={f.provider.name} onChange={setP('name')} />}
          </div>
          {!donorProvider && <input className="form-input" placeholder="Provider website (https://…)" value={f.provider.website} onChange={setP('website')} />}
          <label className="text-xs">How the provider authorized you to list this (who, when, reference)<textarea className="form-input" rows={2} required minLength={20} maxLength={2000} value={f.provider.authorization} onChange={setP('authorization')} /></label>
          <strong>Scholarship</strong>
          <input className="form-input" required placeholder="Title" value={f.title} onChange={set('title')} />
          <div style={row}>
            <input className="form-input" style={grow} type="number" min={0} required placeholder="Amount (0 if it varies)" value={f.amount} onChange={set('amount')} />
            <input className="form-input" style={{ ...grow, flex: '0 1 100px' }} maxLength={3} aria-label="Currency" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value.toUpperCase() })} />
            <input className="form-input" style={{ ...grow, flex: '0 1 100px' }} placeholder="Country" value={f.country} onChange={set('country')} />
            <input className="form-input" style={{ ...grow, flex: '0 1 120px' }} type="number" min={1} aria-label="Seats" placeholder="Seats" value={f.seatsAvailable} onChange={set('seatsAvailable')} />
          </div>
          <label className="text-xs">Application deadline<input className="form-input" type="date" value={f.applicationDeadline} onChange={set('applicationDeadline')} style={{ maxWidth: 220 }} /></label>
          <textarea className="form-input" rows={2} placeholder="Who can apply" value={f.eligibilityCriteria} onChange={set('eligibilityCriteria')} />
          <textarea className="form-input" rows={3} placeholder="Description" value={f.description} onChange={set('description')} />
          {donorProvider
            ? <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>Students apply on CareerZ and the donor decides and funds. The donor must confirm this listing first.</p>
            : <input className="form-input" required placeholder="Provider's application page (https://…)" value={f.externalUrl} onChange={set('externalUrl')} />}
          <label className="text-sm" style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={f.audience.includes('teachers')} onChange={(e) => setF({ ...f, audience: e.target.checked ? ['students', 'teachers'] : ['students'] })} /> Teachers can apply too</label>
          <div style={row}><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Submit for review'}</button><button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button></div>
        </form>
      )}
      {!list ? <p role="status">Loading…</p> : list.length === 0 ? <p className="admin-notice">No listings yet.</p> : list.map((s) => (
        <article key={s._id} className="card" style={{ padding: 14, display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div className="text-sm" style={{ display: 'grid', gap: 2 }}>
            <strong>{s.title}</strong>
            <span>{s.provider?.name} · {s.currency} {Number(s.amount).toLocaleString()} · {s.status === 'closed' ? 'Closed' : REVIEW[s.review?.status] || s.status}</span>
            {s.review?.note && <span style={{ color: 'var(--ink-soft)' }}>Note: {s.review.note}</span>}
            {s.applicationMode === 'internal' && <span style={{ color: 'var(--ink-soft)' }}>{s.applicationCount} application(s), decided by the donor</span>}
          </div>
          {s.status === 'open' && <button type="button" className="btn" onClick={() => close(s)} style={{ alignSelf: 'center' }}>Close</button>}
        </article>
      ))}
    </section>
  );
}

function DonorPicker({ value, onChange, onFlash }) {
  const [donors, setDonors] = useState([]);
  useEffect(() => { apiRequest('/public/donors?limit=100', { auth: false }).then((d) => setDonors(d.items || [])).catch((e) => onFlash(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <select className="form-select" style={grow} required value={value} onChange={(e) => onChange(e.target.value)} aria-label="Donor">
      <option value="">Choose the donor</option>
      {donors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
    </select>
  );
}

// Donor side: listings an agent made naming this donor as the provider.
export function DonorListingRequests({ scholarships, onFlash, onChanged }) {
  const waiting = (scholarships || []).filter((s) => s.publishedBy && s.review?.status === 'awaiting_donor');
  if (!waiting.length) return null;
  async function decide(s, decision) {
    let note = '';
    if (decision === 'decline') { note = window.prompt('Why are you declining? (optional)'); if (note === null) return; }
    try { await apiRequest(`/scholarships/${s._id}/donor-confirm`, { method: 'POST', body: { decision, note } }); onFlash(decision === 'confirm' ? 'Confirmed. An admin will review it.' : 'Declined.', 'success'); onChanged(); } catch (e) { onFlash(e.message); }
  }
  return (
    <div className="u-alert warning mb-3" style={{ display: 'grid', gap: 10 }}>
      <strong>An agent listed {waiting.length === 1 ? 'a scholarship' : `${waiting.length} scholarships`} with you as the provider</strong>
      {waiting.map((s) => (
        <div key={s._id} className="card" style={{ padding: 12, display: 'grid', gap: 6 }}>
          <span className="text-sm"><strong>{s.title}</strong> · {s.currency} {Number(s.amount).toLocaleString()} · {s.seatsAvailable} seat(s)</span>
          <span className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>Agent's note on your authorization: {s.provider?.authorization}</span>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Confirm only if you agreed to fund this. Applications will come to you here, and you decide them.</span>
          <div style={row}><button type="button" className="btn btn-primary" onClick={() => decide(s, 'confirm')}>Confirm</button><button type="button" className="btn" onClick={() => decide(s, 'decline')}>Decline</button></div>
        </div>
      ))}
    </div>
  );
}
