import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { InvoiceLine } from '../recruitment/RecruitmentShared';
import { openPrivateFile, day } from '../recruitment/files';

// Admin side of Institute–Agent recruitment fees: verify that a bank transfer actually arrived
// before the agent's earning is released, decide replacement/refund reviews (never automatic),
// and (Super Admin) set the platform fee and where institutes pay.

const TABS = [['verify', 'Payments to verify'], ['review', 'Refund reviews'], ['all', 'All invoices'], ['settings', 'Settings']];

export default function AdminRecruitmentPanel({ onFlash, isSuperAdmin }) {
  const [tab, setTab] = useState('verify');
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Recruitment Payments</h2>
      <p className="text-sm" style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: 760 }}>Fees institutes owe agents under accepted recruitment agreements. Approve a payment only after checking the money reached the account; the agent's earning is released then.</p>
      <nav className="cz-tabbar">{TABS.filter(([k]) => k !== 'settings' || isSuperAdmin).map(([k, l]) => <button key={k} type="button" aria-pressed={tab === k} className={`cz-tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>)}</nav>
      {tab === 'settings' ? <Settings onFlash={onFlash} /> : <InvoiceList key={tab} tab={tab} onFlash={onFlash} />}
    </section>
  );
}

function InvoiceList({ tab, onFlash }) {
  const [list, setList] = useState(null), [note, setNote] = useState({}), [busy, setBusy] = useState('');
  const query = tab === 'verify' ? '?status=pending_verification' : tab === 'review' ? '?review=1' : '';
  const load = () => apiRequest(`/admin/recruitment/invoices${query}`).then(setList).catch((e) => { setList([]); onFlash(e.message); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function act(inv, path, body, msg) {
    setBusy(inv._id + path);
    try { await apiRequest(`/admin/recruitment/invoices/${inv._id}/${path}`, { method: 'POST', body: { ...body, note: note[inv._id] || '' } }); onFlash(msg, 'success'); setNote({ ...note, [inv._id]: '' }); load(); } catch (e) { onFlash(e.message); } finally { setBusy(''); }
  }
  if (!list) return <p role="status">Loading…</p>;
  if (!list.length) return <p className="admin-notice">Nothing here.</p>;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {list.map((inv) => (
        <article key={inv._id} className="card" style={{ padding: 14, display: 'grid', gap: 8 }}>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{inv.institution?.name} → {inv.agent?.fullName} ({inv.agent?.email})</span>
          <InvoiceLine inv={inv} />
          {(inv.proofs || []).map((p) => <span key={p._id} className="text-sm">Proof: ref. {p.reference} · {inv.currency} {p.amount} · paid {day(p.paidOn)} · sent {day(p.submittedAt)}{p.file && <> · <button type="button" className="btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => openPrivateFile(`/admin/recruitment/invoices/${inv._id}/proofs/${p._id}`).catch((e) => onFlash(e.message))}>View file</button></>}</span>)}
          {inv.wallet?.reference && inv.status === 'pending_verification' && <span className="text-sm" style={{ color: 'var(--emerald)' }}>Paid from the institute's CareerZ wallet ({inv.currency} {Number(inv.grossFee).toLocaleString()} held). Approve to send {inv.currency} {Number(inv.agentEarning).toLocaleString()} to the agent's wallet and {inv.currency} {Number(inv.platformFee).toLocaleString()} commission to CareerZ. Reject returns it to the institute.</span>}
          {inv.replacement?.reason && <span className="text-sm">Hire left: {inv.replacement.reason}</span>}
          {(inv.status === 'pending_verification' || inv.replacement?.status === 'refund_review') && <>
            <textarea className="form-input" rows={2} maxLength={1000} placeholder={inv.status === 'pending_verification' ? 'Note (required to reject or ask for more)' : 'Decision and amount, if any (required)'} value={note[inv._id] || ''} onChange={(e) => setNote({ ...note, [inv._id]: e.target.value })} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {inv.status === 'pending_verification' && <>
                <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => act(inv, 'verify', { decision: 'approve' }, inv.wallet?.reference ? 'Approved. The agent and CareerZ were paid from the held amount.' : 'Payment verified. Agent earning released.')}>{inv.wallet?.reference ? 'Approve and release' : 'Money received: approve'}</button>
                <button type="button" className="btn" disabled={!!busy} onClick={() => act(inv, 'verify', { decision: 'more_info' }, 'Asked the institute for more information.')}>Ask for more</button>
                <button type="button" className="btn" disabled={!!busy} onClick={() => act(inv, 'verify', { decision: 'reject' }, 'Payment not verified. The institute was told why.')}>Not received</button>
              </>}
              {inv.replacement?.status === 'refund_review' && <>
                <button type="button" className="btn" disabled={!!busy} onClick={() => act(inv, 'review', { outcome: 'refunded' }, 'Recorded as refunded; agent earning cancelled.')}>Refund</button>
                <button type="button" className="btn" disabled={!!busy} onClick={() => act(inv, 'review', { outcome: 'adjusted' }, 'Adjustment recorded.')}>Adjust</button>
                <button type="button" className="btn" disabled={!!busy} onClick={() => act(inv, 'review', { outcome: 'dismissed' }, 'Review dismissed.')}>Dismiss</button>
              </>}
            </div>
            {inv.replacement?.status === 'refund_review' && <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>Any refund money is sent outside CareerZ; this records the decision. Check the agreement's replacement and refund terms first.</p>}
          </>}
        </article>
      ))}
    </div>
  );
}

function Settings({ onFlash }) {
  const [s, setS] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/admin/recruitment/settings').then((d) => setS({ platformFeePercent: d.platformFeePercent, mode: d.payment?.mode || '', instructions: d.payment?.instructions || '' })).catch((e) => onFlash(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return <p role="status">Loading…</p>;
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try { await apiRequest('/admin/recruitment/settings', { method: 'PUT', body: { platformFeePercent: Number(s.platformFeePercent), payment: { mode: s.mode, instructions: s.instructions } } }); onFlash('Recruitment settings saved.', 'success'); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="card" style={{ padding: 16, display: 'grid', gap: 10, maxWidth: 640 }}>
      <label className="text-sm" style={{ display: 'grid', gap: 4 }}>CareerZ service fee (% of each recruitment fee)
        <input className="form-input" type="number" min={0} max={100} step="0.01" value={s.platformFeePercent} onChange={(e) => setS({ ...s, platformFeePercent: e.target.value })} style={{ maxWidth: 160 }} />
        <small style={{ color: 'var(--ink-soft)' }}>Applies to invoices issued after you save. Starts at 0%.</small>
      </label>
      <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>Institutes pay the full fee into the CareerZ account. After an admin verifies it, CareerZ keeps its service fee and the rest goes to the agent's wallet.</p>
      <label className="text-sm" style={{ display: 'grid', gap: 4 }}>Institutes pay to
        <select className="form-select" value={s.mode} onChange={(e) => setS({ ...s, mode: e.target.value })} style={{ maxWidth: 360 }}>
          <option value="">Not decided yet (no payment details shown)</option>
          <option value="platform">CareerZ's bank account</option>
        </select>
      </label>
      {s.mode === 'platform' && <label className="text-sm" style={{ display: 'grid', gap: 4 }}>CareerZ bank details shown to institutes
        <textarea className="form-input" rows={4} maxLength={2000} required value={s.instructions} onChange={(e) => setS({ ...s, instructions: e.target.value })} placeholder={'Account title:\nBank:\nIBAN:\nAccount number:'} />
      </label>}
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifySelf: 'start' }}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}
