import { showPrompt, showConfirm } from '../../utils/appDialog';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { CATEGORY_LABEL, REQUEST_STATUS, Thread, Agreements, InvoiceLine, label, row, grow } from './RecruitmentShared';
import { readAsDataUrl, openPrivateFile, day } from './files';
import AgentCandidates from './AgentCandidates';
import { ManualPayButton } from '../payments/ManualPay';

// Institute side of Institute–Agent recruitment (optional; the institute can always post its own
// jobs). Find a verified agent → send a request → agree terms → the agent recruits and publishes
// → the institute confirms who actually joined → pays the invoice by bank transfer with proof.

const SUBS = [['find', 'Find Agents'], ['requests', 'Requests'], ['candidates', 'Candidates'], ['hires', 'Confirm Joining'], ['invoices', 'Invoices']];

export default function InstitutionAgentsPanel({ institution, onFlash }) {
  const [sub, setSub] = useState('requests'), [target, setTarget] = useState(null), [key, setKey] = useState(0);
  const refresh = () => setKey((k) => k + 1);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p className="text-sm" style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: 720 }}>Using an agent is optional. A verified agent recruits for you only under terms you both accept. You pay only after you confirm a candidate joined.</p>
      <nav className="cz-tabbar">{SUBS.map(([k, l]) => <button key={k} type="button" aria-pressed={sub === k} className={`cz-tab${sub === k ? ' active' : ''}`} onClick={() => setSub(k)}>{l}</button>)}</nav>
      {sub === 'find' && (target
        ? <RequestForm institution={institution} agent={target} onFlash={onFlash} onCancel={() => setTarget(null)} onSent={() => { setTarget(null); setSub('requests'); refresh(); }} />
        : <FindAgents onFlash={onFlash} onPick={setTarget} />)}
      {sub === 'requests' && <Requests key={key} institution={institution} onFlash={onFlash} />}
      {sub === 'candidates' && <AgentCandidates institution={institution} onFlash={onFlash} />}
      {sub === 'hires' && <Hires institution={institution} onFlash={onFlash} />}
      {sub === 'invoices' && <Invoices institution={institution} onFlash={onFlash} />}
    </div>
  );
}

function FindAgents({ onFlash, onPick }) {
  const [q, setQ] = useState({ q: '', country: '', city: '', category: '' }), [list, setList] = useState(null);
  const load = (query = q) => { setList(null); apiRequest(`/recruitment/agents?${new URLSearchParams(query)}`).then(setList).catch((e) => { setList([]); onFlash(e.message); }); };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} style={row}>
        <input className="form-input" style={grow} placeholder="Agent or agency name" value={q.q} onChange={(e) => setQ({ ...q, q: e.target.value })} />
        <input className="form-input" style={grow} placeholder="Country" value={q.country} onChange={(e) => setQ({ ...q, country: e.target.value })} />
        <input className="form-input" style={grow} placeholder="City" value={q.city} onChange={(e) => setQ({ ...q, city: e.target.value })} />
        <select className="form-select" style={grow} value={q.category} onChange={(e) => setQ({ ...q, category: e.target.value })} aria-label="Specialty"><option value="">Any specialty</option>{Object.entries(CATEGORY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {!list ? <p role="status">Loading…</p> : list.length === 0 ? <p className="admin-notice">No verified agents match. Try fewer filters.</p> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {list.map((a) => (
            <article key={a._id} className="card" style={{ padding: 14, display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div className="text-sm" style={{ display: 'grid', gap: 3, minWidth: 0 }}>
                <strong>{a.name} <span className="badge" style={{ marginLeft: 6 }}>Verified {a.agency ? 'agency' : 'agent'}</span></strong>
                <span style={{ color: 'var(--ink-soft)' }}>{[a.city, a.country].filter(Boolean).join(', ')}{a.serviceCountries?.length || a.serviceCities.length ? ` · serves ${[...(a.serviceCities || []), ...(a.serviceCountries || [])].join(', ')}` : ''}{a.experienceYears ? ` · ${a.experienceYears} years` : ''} · {a.confirmedHires} confirmed hire(s) on CareerZ</span>
                {a.specialties.length > 0 && <span>{a.specialties.map((s) => CATEGORY_LABEL[s] || s).join(', ')}</span>}
                {a.bio && <span style={{ whiteSpace: 'pre-wrap' }}>{a.bio}</span>}
              </div>
              <button type="button" className="btn btn-primary" onClick={() => onPick(a)} style={{ alignSelf: 'center' }}>Send request</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_POS = { title: '', category: 'teaching', vacancies: 1, qualifications: '', experienceYears: '', salaryMin: '', salaryMax: '', currency: 'PKR', employmentType: 'full_time', responsibilities: '' };
function RequestForm({ institution, agent, onFlash, onCancel, onSent }) {
  const [positions, setPositions] = useState([{ ...EMPTY_POS }]);
  const [f, setF] = useState({ city: institution.city || '', hiringDeadline: '', specialRequirements: '', proposedFee: '' }), [busy, setBusy] = useState(false);
  const setPos = (i, k, v) => setPositions(positions.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest('/recruitment/requests', { method: 'POST', body: { institution: institution._id, agent: agent._id, ...f, positions: positions.map((p) => ({ ...p, vacancies: Number(p.vacancies) })) } });
      onFlash(`Request sent to ${agent.name}.`, 'success'); onSent();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
      <h3 style={{ margin: 0 }}>Recruitment request to {agent.name}</h3>
      {positions.map((p, i) => (
        <div key={i} className="card" style={{ padding: 14, display: 'grid', gap: 8 }}>
          <span style={label}>Position {i + 1}</span>
          <div style={row}>
            <input className="form-input" style={{ ...grow, flex: '2 1 220px' }} required placeholder="Job title, e.g. Physics Lecturer" value={p.title} onChange={(e) => setPos(i, 'title', e.target.value)} />
            <select className="form-select" style={grow} value={p.category} onChange={(e) => setPos(i, 'category', e.target.value)} aria-label="Category">{Object.entries(CATEGORY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <input className="form-input" style={{ ...grow, flex: '0 1 110px' }} type="number" min={1} required aria-label="Vacancies" placeholder="Vacancies" value={p.vacancies} onChange={(e) => setPos(i, 'vacancies', e.target.value)} />
          </div>
          <div style={row}>
            <input className="form-input" style={grow} placeholder="Qualifications" value={p.qualifications} onChange={(e) => setPos(i, 'qualifications', e.target.value)} />
            <input className="form-input" style={grow} type="number" min={0} placeholder="Years of experience" value={p.experienceYears} onChange={(e) => setPos(i, 'experienceYears', e.target.value)} />
          </div>
          <div style={row}>
            <input className="form-input" style={grow} type="number" min={0} placeholder="Salary from" value={p.salaryMin} onChange={(e) => setPos(i, 'salaryMin', e.target.value)} />
            <input className="form-input" style={grow} type="number" min={0} placeholder="Salary to" value={p.salaryMax} onChange={(e) => setPos(i, 'salaryMax', e.target.value)} />
            <input className="form-input" style={{ ...grow, flex: '0 1 90px' }} maxLength={3} aria-label="Currency" value={p.currency} onChange={(e) => setPos(i, 'currency', e.target.value.toUpperCase())} />
          </div>
          <textarea className="form-input" rows={2} placeholder="Responsibilities" value={p.responsibilities} onChange={(e) => setPos(i, 'responsibilities', e.target.value)} />
          {positions.length > 1 && <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={() => setPositions(positions.filter((_, j) => j !== i))}>Remove position</button>}
        </div>
      ))}
      <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={() => setPositions([...positions, { ...EMPTY_POS }])}>+ Add another position</button>
      <div style={row}>
        <input className="form-input" style={grow} placeholder="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
        <label className="text-xs" style={grow}>Hiring deadline<input className="form-input" type="date" value={f.hiringDeadline} onChange={(e) => setF({ ...f, hiringDeadline: e.target.value })} /></label>
      </div>
      <textarea className="form-input" rows={2} placeholder="Special requirements (optional)" value={f.specialRequirements} onChange={(e) => setF({ ...f, specialRequirements: e.target.value })} />
      <input className="form-input" placeholder="Fee you propose, if any (you agree the exact terms next)" value={f.proposedFee} onChange={(e) => setF({ ...f, proposedFee: e.target.value })} />
      <div style={row}><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send request'}</button><button type="button" className="btn" onClick={onCancel}>Back</button></div>
    </form>
  );
}

function Requests({ institution, onFlash }) {
  const [list, setList] = useState(null);
  const load = () => apiRequest(`/recruitment/requests?institution=${institution._id}`).then(setList).catch((e) => { setList([]); onFlash(e.message); });
  useEffect(() => { load(); }, [institution._id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function cancel(r) {
    if (!(await showConfirm('Cancel this request? Any agreement under it ends and its jobs close.'))) return;
    try { await apiRequest(`/recruitment/requests/${r._id}/cancel`, { method: 'POST' }); onFlash('Request cancelled.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  if (!list) return <p role="status">Loading…</p>;
  if (!list.length) return <p className="admin-notice">No requests yet. Use Find Agents to send one.</p>;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {list.map((r) => (
        <article key={r._id} className="card" style={{ padding: 14, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div className="text-sm" style={{ display: 'grid', gap: 2 }}>
              <strong>{r.agent?.fullName || 'Agent'} · {REQUEST_STATUS[r.status]}</strong>
              <span>{r.positions.map((p) => `${p.vacancies} × ${p.title}`).join(', ')}</span>
              <span style={{ color: 'var(--ink-soft)' }}>Sent {day(r.createdAt)}{r.hiringDeadline ? ` · hire by ${day(r.hiringDeadline)}` : ''}{r.proposedFee ? ` · proposed fee: ${r.proposedFee}` : ''}</span>
            </div>
            {!['cancelled', 'completed', 'rejected'].includes(r.status) && <button type="button" className="btn" onClick={() => cancel(r)} style={{ alignSelf: 'start' }}>Cancel request</button>}
          </div>
          <Thread request={r} onFlash={onFlash} onSaved={load} />
          {['accepted', 'agreed', 'completed'].includes(r.status) && <Agreements request={r} side="institution" onFlash={onFlash} onSaved={load} />}
        </article>
      ))}
    </div>
  );
}

function Hires({ institution, onFlash }) {
  const [list, setList] = useState(null), [salary, setSalary] = useState({});
  const load = () => apiRequest(`/recruitment/hires?institution=${institution._id}`).then(setList).catch((e) => { setList([]); onFlash(e.message); });
  useEffect(() => { load(); }, [institution._id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function confirm(h) {
    if (!(await showConfirm(`Confirm that ${h.candidate} has actually joined? The agent's fee becomes payable under your agreement.`))) return;
    try { const r = await apiRequest(`/recruitment/hires/${h._id}/confirm`, { method: 'POST', body: { monthlySalary: salary[h._id] || '' } }); onFlash(r.invoice ? `Joining confirmed. Invoice ${r.invoice.number} issued.` : 'Joining confirmed.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function decline(h) {
    const reason = await showPrompt(`Why is ${h.candidate}'s joining not confirmed?`);
    if (!reason) return;
    try { await apiRequest(`/recruitment/hires/${h._id}/decline`, { method: 'POST', body: { reason } }); onFlash('The agent was told why.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  if (!list) return <p role="status">Loading…</p>;
  if (!list.length) return <p className="admin-notice">When your agent marks a candidate as joined, you confirm it here.</p>;
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {list.map((h) => (
        <div key={h._id} className="card" style={{ padding: 14, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-sm" style={{ display: 'grid', gap: 2 }}>
            <strong>{h.candidate}{h.guest ? ' (applied without an account)' : ''}</strong>
            <span>{h.job}</span>
            <span style={{ color: h.joining?.confirmed ? 'var(--emerald)' : 'var(--gold)' }}>{h.joining?.confirmed ? `Joining confirmed ${day(h.joining.confirmedAt)}` : 'Marked as joined by the agent; waiting for your confirmation'}</span>
          </div>
          {!h.joining?.confirmed && <div style={row}>
            <input className="form-input" type="number" min={0} style={{ width: 170 }} placeholder="Monthly salary agreed" aria-label="Monthly salary agreed" value={salary[h._id] || ''} onChange={(e) => setSalary({ ...salary, [h._id]: e.target.value })} title="Needed when the fee is a percentage of salary" />
            <button type="button" className="btn btn-primary" onClick={() => confirm(h)}>Confirm joined</button>
            <button type="button" className="btn" onClick={() => decline(h)}>Did not join</button>
          </div>}
        </div>
      ))}
    </div>
  );
}

function Invoices({ institution, onFlash }) {
  const [list, setList] = useState(null), [open, setOpen] = useState(null);
  const load = () => apiRequest(`/recruitment/invoices?institution=${institution._id}`).then(setList).catch((e) => { setList([]); onFlash(e.message); });
  useEffect(() => { load(); }, [institution._id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!list) return <p role="status">Loading…</p>;
  if (!list.length) return <p className="admin-notice">No invoices. An invoice is issued only after you confirm a hire joined.</p>;
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {list.map((inv) => (
        <article key={inv._id} className="card" style={{ padding: 14, display: 'grid', gap: 10 }}>
          <InvoiceLine inv={inv} />
          <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={() => setOpen(open === inv._id ? null : inv._id)}>{open === inv._id ? 'Close' : 'Pay / manage'}</button>
          {open === inv._id && <InvoiceActions id={inv._id} onFlash={onFlash} onSaved={load} />}
        </article>
      ))}
    </div>
  );
}

function InvoiceActions({ id, onFlash, onSaved }) {
  const [inv, setInv] = useState(null), [f, setF] = useState({ reference: '', amount: '', paidOn: '' }), [file, setFile] = useState(null), [busy, setBusy] = useState(false);
  const load = () => apiRequest(`/recruitment/invoices/${id}`).then((d) => { setInv(d); setF((x) => ({ ...x, amount: x.amount || d.grossFee })); }).catch((e) => onFlash(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!inv) return <p role="status">Loading…</p>;
  const done = () => { load(); onSaved(); };
  async function proof(e) {
    e.preventDefault();
    if (!file) return onFlash('Attach the bank transfer receipt (PDF or image).');
    if (file.size > 3 * 1024 * 1024) return onFlash('The proof file must be 3 MB or smaller.');
    setBusy(true);
    try {
      await apiRequest(`/recruitment/invoices/${id}/proof`, { method: 'POST', body: { ...f, amount: Number(f.amount), ...(file ? { file: { name: file.name, data: await readAsDataUrl(file) } } : {}) } });
      onFlash('Payment proof sent. An admin will verify the transfer.', 'success'); setFile(null); done();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function post(path, body, msg) {
    try { await apiRequest(`/recruitment/invoices/${id}/${path}`, { method: 'POST', body }); onFlash(msg, 'success'); done(); } catch (e) { onFlash(e.message); }
  }
  const rep = inv.replacement || {};
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {['issued', 'more_info_requested'].includes(inv.status) && <>
        {/* Main way: pay from the CareerZ wallet; the agent's share and CareerZ's commission settle at once. */}
        <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
          <span style={label}>Pay from your CareerZ wallet</span>
          <p className="text-sm" style={{ margin: 0 }}>Wallet balance: <strong>{inv.currency} {Number(inv.walletBalance || 0).toLocaleString()}</strong> · Invoice: <strong>{inv.currency} {Number(inv.grossFee).toLocaleString()}</strong></p>
          <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>Paid at once: the agent receives {inv.currency} {Number(inv.agentEarning).toLocaleString()} in their wallet and CareerZ keeps its {inv.currency} {Number(inv.platformFee).toLocaleString()} commission.</p>
          <button type="button" className="btn btn-primary" disabled={busy || (inv.walletBalance || 0) < inv.grossFee} style={{ justifySelf: 'start' }} onClick={async () => { if (!(await showConfirm(`Pay ${inv.currency} ${Number(inv.grossFee).toLocaleString()} from your wallet for ${inv.number}?`))) return; setBusy(true); try { await apiRequest(`/recruitment/invoices/${id}/pay-wallet`, { method: 'POST' }); onFlash('Paid. The agent has received their share.', 'success'); done(); } catch (e) { onFlash(e.message); } finally { setBusy(false); } }}>{busy ? 'Paying…' : 'Pay from wallet'}</button>
          {(inv.walletBalance || 0) < inv.grossFee && <small style={{ color: 'var(--gold)' }}>Not enough balance. Add money to your wallet (View Wallet at the top), or pay by bank transfer below.</small>}
        </div>
        {/* Bank transfer: the CareerZ service fee first, then the agent's share to the agent's own account. */}
        <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
          <span style={label}>Or pay by bank transfer</span>
          <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>Pay the CareerZ service fee, then the agent's share straight to the agent's account named in the agreement. CareerZ checks both receipts.</p>
          <ManualPayButton kind="recruitment_invoice" id={id} onFlash={onFlash} onDone={done} />
        </div>
        <details style={{ display: 'none' }}>
          <summary className="text-sm" style={{ cursor: 'pointer' }}>Or pay by bank transfer and send the proof</summary>
        <div className="card" style={{ padding: 12, marginTop: 8 }}>
          <span style={label}>Where to pay</span>
          {inv.payTo?.text ? <p className="text-sm" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{inv.payTo.text}</p> : <p className="text-sm" style={{ margin: 0 }}>CareerZ has not published payment details yet. Please wait before transferring; you will see them here.</p>}
        </div>
        <form onSubmit={proof} style={{ display: 'grid', gap: 8 }}>
          <span style={label}>After you transfer, send the proof</span>
          <div style={row}>
            <input className="form-input" style={grow} required maxLength={120} placeholder="Bank transfer reference" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} />
            <input className="form-input" style={grow} type="number" min={1} required placeholder="Amount transferred" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
            <label className="text-xs" style={grow}>Paid on<input className="form-input" type="date" value={f.paidOn} onChange={(e) => setF({ ...f, paidOn: e.target.value })} /></label>
          </div>
          <label className="text-xs">Receipt or screenshot (PDF/PNG/JPG, up to 3 MB)<input className="form-input" type="file" required accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
          <button type="submit" className="btn btn-primary" disabled={busy || !inv.payTo?.text} style={{ justifySelf: 'start' }}>{busy ? 'Sending…' : 'Send payment proof'}</button>
        </form>
        </details>
      </>}
      {inv.status === 'pending_verification' && inv.wallet?.reference && <p className="text-sm" style={{ margin: 0, color: 'var(--gold)' }}>Paid from your wallet ({inv.currency} {Number(inv.grossFee).toLocaleString()}).</p>}
      {(inv.proofs || []).length > 0 && <div className="text-sm" style={{ display: 'grid', gap: 4 }}>
        <span style={label}>Proofs sent</span>
        {inv.proofs.map((p) => <span key={p._id}>Ref. {p.reference} · {inv.currency} {p.amount} · {day(p.paidOn)}{p.file && <> · <button type="button" className="btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => openPrivateFile(`/recruitment/invoices/${id}/proofs/${p._id}`).catch((e) => onFlash(e.message))}>View file</button></>}</span>)}
      </div>}
      {inv.status === 'paid' && <div style={row}>
        {(!rep.status || rep.status === 'replaced') && <button type="button" className="btn" onClick={async () => { const reason = await showPrompt('When and why did the person leave?'); if (reason) post('left', { reason }, 'Reported. Your agreement terms decide what happens next.'); }}>Hire left the job</button>}
        {rep.status === 'awaiting_replacement' && <>
          <button type="button" className="btn btn-primary" onClick={async () => { const note = await showPrompt('Who is the replacement? (optional note)') ?? null; if (note !== null) post('replaced', { note }, 'Replacement recorded.'); }}>Replacement provided</button>
          <button type="button" className="btn" disabled={rep.deadline && new Date(rep.deadline) > new Date()} title="Available after the replacement deadline" onClick={async () => { const note = await showPrompt('What should the admin know?'); if (note) post('escalate', { note }, 'Sent to admin review.'); }}>No replacement: ask admin</button>
        </>}
      </div>}
    </div>
  );
}
