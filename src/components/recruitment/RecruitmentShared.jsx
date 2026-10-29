import { showPrompt, showConfirm } from '../../utils/appDialog';
import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { money, day } from './files';

// Pieces both sides of an Institute–Agent recruitment use: request status, the message thread,
// the agreement terms form and summary, and invoice status. Every amount and term is typed in by
// the parties; nothing is pre-filled by CareerZ.

export const CATEGORY_LABEL = { teaching: 'Teaching', academic_leadership: 'Academic leadership', administration: 'Administration', finance_accounts: 'Finance & accounts', it_technical: 'IT & technical', transport: 'Transport / driver', hostel: 'Hostel / warden', security: 'Security', library: 'Library', lab: 'Laboratory', maintenance_cleaning: 'Maintenance & cleaning', healthcare: 'Healthcare', sales_marketing: 'Sales & marketing', engineering: 'Engineering', customer_service: 'Customer service', other: 'Other' };
export const REQUEST_STATUS = { sent: 'Waiting for the agent', clarification_requested: 'Agent asked a question', accepted: 'Accepted, agree the terms', rejected: 'Declined by the agent', agreed: 'Agreement active', cancelled: 'Cancelled', completed: 'Completed' };
export const INVOICE_STATUS = { issued: 'Unpaid', pending_verification: 'Payment being verified', more_info_requested: 'More information needed', paid: 'Paid', cancelled: 'Cancelled' };
export const REPLACEMENT_STATUS = { awaiting_replacement: 'Replacement pending', replaced: 'Replaced', refund_review: 'Admin review', refunded: 'Refunded', adjusted: 'Adjusted', dismissed: 'Review dismissed' };
export const label = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };
export const row = { display: 'flex', gap: 10, flexWrap: 'wrap' };
export const grow = { flex: '1 1 160px', minWidth: 0 };

export function Thread({ request, onFlash, onSaved }) {
  const [text, setText] = useState(''), [busy, setBusy] = useState(false);
  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try { await apiRequest(`/recruitment/requests/${request._id}/messages`, { method: 'POST', body: { text } }); setText(''); onSaved?.(); } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="hiring-message-thread" style={{ display: 'grid', gap: 6 }}>
      {(request.messages || []).map((m, i) => <p key={i} className={`text-sm recruit-msg ${m.side === 'agent' ? 'from-agent' : 'from-institute'}`}><strong>{m.side === 'agent' ? 'Agent' : 'Institute'}</strong>{m.text}<small>{new Date(m.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</small></p>)}
      {!['cancelled', 'completed', 'rejected'].includes(request.status) && <form onSubmit={send} style={row}>
        <input className="form-input" style={grow} maxLength={2000} placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={busy || !text.trim()}>Send</button>
      </form>}
    </div>
  );
}

export function feeText(a) {
  if (a.feeModel === 'fixed_per_hire') return `${money(a.currency, a.fixedAmount)} per successful hire`;
  if (a.feeModel === 'percentage') return `${a.percentage}% of the hire's ${a.salaryBase === 'annual_salary' ? 'annual' : 'monthly'} salary (${a.currency})`;
  return `${money(a.currency, a.packageAmount)} for ${a.packageHires} hire(s)`;
}

export function AgreementSummary({ a }) {
  const r = a.replacement || {};
  return (
    <div className="text-sm" style={{ display: 'grid', gap: 4 }}>
      <span><strong>Version {a.version}</strong> · {a.status === 'active' ? 'Active' : a.status === 'proposed' ? 'Proposed' : a.status} · proposed by the {a.proposedSide}</span>
      <span>Positions: {(a.positions || []).map((p) => `${p.vacancies} × ${p.title}`).join(', ')} ({a.vacancyCount} vacancies)</span>
      <span>Fee: {feeText(a)} · payable within {a.paymentDueDays} day(s) after joining is confirmed</span>
      <span>Replacement: {r.periodDays ? `if the hire leaves within ${r.periodDays} days, a replacement within ${r.deadlineDays} days${r.attempts ? `, ${r.attempts} attempt(s)` : ''}` : 'none agreed'}</span>
      {r.exceptions && <span>Exceptions: {r.exceptions}</span>}
      {r.refundTerms && <span>Refund terms: {r.refundTerms}</span>}
      {a.notes && <span style={{ whiteSpace: 'pre-wrap' }}>Notes: {a.notes}</span>}
      <span style={{ color: 'var(--ink-soft)' }}>Institute {a.institutionAcceptance?.by ? `accepted ${day(a.institutionAcceptance.at)}` : 'has not accepted'} · Agent {a.agentAcceptance?.by ? `accepted ${day(a.agentAcceptance.at)}` : 'has not accepted'}</span>
      {a.agentPaymentAccount?.accountNumber && <span className="text-xs">Agent's payment account: <strong>{a.agentPaymentAccount.accountTitle}</strong> · {a.agentPaymentAccount.bankName} {a.agentPaymentAccount.accountNumber}</span>}
      {!a.agentAcceptance?.by && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>When accepting, the agent names the bank or wallet account the institute pays the agent's fee into.</span>}
    </div>
  );
}

const EMPTY_TERMS = { feeModel: 'fixed_per_hire', currency: 'PKR', fixedAmount: '', percentage: '', salaryBase: 'monthly_salary', packageAmount: '', packageHires: '', paymentDueDays: '', notes: '', periodDays: '', deadlineDays: '', attempts: '', exceptions: '', refundTerms: '' };

export function TermsForm({ request, onFlash, onSaved }) {
  const [t, setT] = useState(EMPTY_TERMS), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setT({ ...t, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/recruitment/requests/${request._id}/agreements`, { method: 'POST', body: {
        feeModel: t.feeModel, currency: t.currency, fixedAmount: t.fixedAmount, percentage: t.percentage, salaryBase: t.salaryBase, packageAmount: t.packageAmount,
        packageHires: t.packageHires === '' ? '' : Number(t.packageHires), paymentDueDays: t.paymentDueDays === '' ? '' : Number(t.paymentDueDays), notes: t.notes,
        replacement: { periodDays: t.periodDays === '' ? null : Number(t.periodDays), deadlineDays: t.deadlineDays === '' ? null : Number(t.deadlineDays), attempts: t.attempts === '' ? null : Number(t.attempts), exceptions: t.exceptions, refundTerms: t.refundTerms }
      } });
      onFlash?.('Terms sent. The other side can accept them or propose changes.', 'success');
      setT(EMPTY_TERMS); onSaved?.();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="card" style={{ padding: 14, display: 'grid', gap: 10 }}>
      <span style={label}>Propose terms</span>
      <div style={row}>
        <label className="text-xs" style={grow}>Fee model
          <select className="form-select" value={t.feeModel} onChange={set('feeModel')}><option value="fixed_per_hire">Fixed amount per hire</option><option value="percentage">Percentage of salary</option><option value="package">Package for several hires</option></select>
        </label>
        <label className="text-xs" style={{ ...grow, flex: '0 1 110px' }}>Currency<input className="form-input" maxLength={3} required value={t.currency} onChange={(e) => setT({ ...t, currency: e.target.value.toUpperCase() })} /></label>
        <label className="text-xs" style={grow}>Pay within (days after joining)<input className="form-input" type="number" min={0} max={365} required value={t.paymentDueDays} onChange={set('paymentDueDays')} /></label>
      </div>
      {t.feeModel === 'fixed_per_hire' && <label className="text-xs">Amount per successful hire<input className="form-input" type="number" min={1} required value={t.fixedAmount} onChange={set('fixedAmount')} /></label>}
      {t.feeModel === 'percentage' && <div style={row}>
        <label className="text-xs" style={grow}>Percentage<input className="form-input" type="number" min={0.01} max={100} step="0.01" required value={t.percentage} onChange={set('percentage')} /></label>
        <label className="text-xs" style={grow}>Of the hire's<select className="form-select" value={t.salaryBase} onChange={set('salaryBase')}><option value="monthly_salary">Monthly salary</option><option value="annual_salary">Annual salary</option></select></label>
      </div>}
      {t.feeModel === 'package' && <div style={row}>
        <label className="text-xs" style={grow}>Package amount<input className="form-input" type="number" min={1} required value={t.packageAmount} onChange={set('packageAmount')} /></label>
        <label className="text-xs" style={grow}>Hires covered<input className="form-input" type="number" min={1} required value={t.packageHires} onChange={set('packageHires')} /></label>
      </div>}
      <span style={label}>Replacement (optional; leave empty if none)</span>
      <div style={row}>
        <label className="text-xs" style={grow}>If the hire leaves within (days)<input className="form-input" type="number" min={1} max={365} value={t.periodDays} onChange={set('periodDays')} /></label>
        <label className="text-xs" style={grow}>Replacement within (days)<input className="form-input" type="number" min={1} max={365} value={t.deadlineDays} onChange={set('deadlineDays')} /></label>
        <label className="text-xs" style={grow}>Attempts<input className="form-input" type="number" min={1} max={10} value={t.attempts} onChange={set('attempts')} /></label>
      </div>
      <label className="text-xs">Exceptions<input className="form-input" maxLength={1500} value={t.exceptions} onChange={set('exceptions')} placeholder="e.g. dismissal for misconduct" /></label>
      <label className="text-xs">Refund terms<input className="form-input" maxLength={1500} value={t.refundTerms} onChange={set('refundTerms')} placeholder="What happens if no replacement is found" /></label>
      <label className="text-xs">Other notes<textarea className="form-input" rows={2} maxLength={2000} value={t.notes} onChange={set('notes')} /></label>
      <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>The fee is due only after the institute confirms the candidate joined. Refunds are never automatic; an admin decides any refund case.</p>
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifySelf: 'start' }}>{busy ? 'Sending…' : 'Send terms'}</button>
    </form>
  );
}

// Versions list with accept / decline on the latest proposal (for whichever side is viewing).
export function Agreements({ request, side, onFlash, onSaved }) {
  const [list, setList] = useState(null), [open, setOpen] = useState(false);
  const load = () => apiRequest(`/recruitment/requests/${request._id}/agreements`).then(setList).catch((e) => onFlash?.(e.message));
  const toggle = () => { if (!open) load(); setOpen(!open); };
  async function act(a, action) {
    let note = '';
    if (action === 'decline') { note = await showPrompt('Why are you declining these terms? (optional)') ?? null; if (note === null) return; }
    if (action === 'end' && !(await showConfirm('End this agreement? Its open jobs will be closed. Issued invoices stay payable.'))) return;
    try { await apiRequest(`/recruitment/agreements/${a._id}/${action}`, { method: 'POST', body: { note } }); onFlash?.(action === 'accept' ? 'Accepted.' : action === 'end' ? 'Agreement ended.' : 'Declined.', 'success'); load(); onSaved?.(); } catch (e) { onFlash?.(e.message); }
  }
  // The institute writes the terms; the agent reads them and accepts, or asks for changes by message.
  const canPropose = side === 'institution' && ['accepted', 'agreed'].includes(request.status);
  async function askChanges(a) {
    const text = await showPrompt('What should the institute change in these terms?', { title: 'Ask for changes', placeholder: 'e.g. Please make the fee 50% and payment within 30 days', confirmLabel: 'Send to institute' });
    if (!text || !text.trim()) return;
    try {
      await apiRequest(`/recruitment/requests/${request._id}/messages`, { method: 'POST', body: { text: `Change request for terms version ${a.version}: ${text.trim()}` } });
      await apiRequest(`/recruitment/agreements/${a._id}/decline`, { method: 'POST', body: { note: text.trim() } });
      onFlash?.('Sent. The institute will send updated terms.', 'success'); load(); onSaved?.();
    } catch (e) { onFlash?.(e.message); }
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button type="button" className="btn" onClick={toggle} style={{ justifySelf: 'start' }}>{open ? 'Hide agreement' : 'Agreement & terms'}</button>
      {open && <>
        {!list ? <p role="status">Loading…</p> : list.length === 0 ? <p className="text-sm" style={{ margin: 0 }}>No terms proposed yet.</p> : list.map((a) => (
          <div key={a._id} className="card" style={{ padding: 12, display: 'grid', gap: 8, opacity: ['superseded', 'declined'].includes(a.status) ? 0.65 : 1 }}>
            <AgreementSummary a={a} />
            <div style={row}>
              {a.status === 'proposed' && !(side === 'institution' ? a.institutionAcceptance?.by : a.agentAcceptance?.by) && <><button type="button" className="btn btn-primary" onClick={() => act(a, 'accept')}>Accept terms</button>{side === 'agent' ? <button type="button" className="btn" onClick={() => askChanges(a)}>Ask for changes</button> : <button type="button" className="btn" onClick={() => act(a, 'decline')}>Withdraw these terms</button>}</>}
              {a.status === 'proposed' && (side === 'institution' ? a.institutionAcceptance?.by : a.agentAcceptance?.by) && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{side === 'institution' ? 'Sent to the agent. Waiting for them to accept or ask for changes.' : 'Waiting for the other side to accept.'}</span>}
              {a.status === 'active' && <button type="button" className="btn" onClick={() => act(a, 'end')}>End agreement</button>}
            </div>
          </div>
        ))}
        {side === 'agent' && ['accepted', 'agreed'].includes(request.status) && (list || []).length === 0 && <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>The institute sends the terms here. You can then accept them or ask for changes.</p>}
        {canPropose && <TermsForm request={request} onFlash={onFlash} onSaved={() => { load(); onSaved?.(); }} />}
      </>}
    </div>
  );
}

export function InvoiceLine({ inv }) {
  return (
    <div className="text-sm recruit-invoice">
      <div className="recruit-invoice-head"><strong>{inv.number}</strong><span className={`recruit-chip ${inv.status}`}>{INVOICE_STATUS[inv.status]}</span>{inv.replacement?.status && <span className="recruit-chip">{REPLACEMENT_STATUS[inv.replacement.status]}</span>}</div>
      <span>{inv.description}</span>
      <dl className="recruit-amounts"><div><dt>Fee</dt><dd>{money(inv.currency, inv.grossFee)}</dd></div><div><dt>CareerZ fee</dt><dd>{money(inv.currency, inv.platformFee)}</dd></div><div><dt>Agent earning</dt><dd>{money(inv.currency, inv.agentEarning)}</dd></div><div><dt>Due</dt><dd>{day(inv.dueDate)}</dd></div></dl>
      {inv.replacement?.deadline && inv.replacement.status === 'awaiting_replacement' && <span>Replacement due by {day(inv.replacement.deadline)}</span>}
      {inv.replacement?.resolutionNote && <span>Decision: {inv.replacement.resolutionNote}</span>}
      {(inv.history || []).slice(-1).map((h, i) => h.note ? <span key={i} style={{ color: 'var(--ink-soft)' }}>Last update: {h.note}</span> : null)}
    </div>
  );
}
