import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '../../api/client';
import { openPrivateFile, readAsDataUrl } from '../recruitment/files';
import { showConfirm, showPrompt } from '../../utils/appDialog';

// Manual payments: the buyer pays CareerZ's service fee to the CareerZ account (QR), then the
// price straight to the seller's account, and uploads both receipts. CareerZ's finance team
// checks them (and can call either side) before the purchase is granted.

const money = (cur, n) => `${cur} ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const MAX = 2 * 1024 * 1024;
const box = { padding: 12, background: 'var(--sand)', borderRadius: 10, display: 'grid', gap: 8 };
const STATUS_LABEL = { commission_submitted: 'Service fee sent, CareerZ is checking', commission_verified: 'Service fee confirmed: pay the seller now', submitted: 'Being checked by CareerZ', approved: 'Verified' };
const KIND_LABEL = { fee: 'Fee', course: 'Course', tutoring: 'Tuition', marketplace_order: 'Order', donation: 'Donation', featured_job: 'Featured job', subscription: 'Plan', wallet_topup: 'Wallet top-up' };

function Account({ a }) {
  return (
    <div className="text-sm" style={{ display: 'grid', gap: 2 }}>
      <span><strong>{a.accountTitle}</strong></span>
      <span>{a.bankName}{a.method === 'mobile_wallet' ? ' wallet' : ''}: <strong style={{ userSelect: 'all' }}>{a.accountNumber}</strong></span>
      {a.iban && <span>IBAN: <strong style={{ userSelect: 'all' }}>{a.iban}</strong></span>}
    </div>
  );
}

function LegFields({ value, onChange, idPrefix }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <input className="form-input" id={`${idPrefix}-txn`} placeholder="Transaction ID from your bank / wallet app" value={value.transactionId} onChange={(e) => onChange({ ...value, transactionId: e.target.value })} />
      <label className="text-xs">Date you paid<input className="form-input" type="date" max={today()} value={value.paidOn} onChange={(e) => onChange({ ...value, paidOn: e.target.value })} /></label>
      <label className="text-xs">Receipt or screenshot (PDF/PNG/JPG, up to 2 MB)<input className="form-input" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => onChange({ ...value, file: e.target.files?.[0] || null })} /></label>
    </div>
  );
}

// "Pay by bank transfer": shows both accounts and amounts, then takes both receipts.
// `query` carries extra choices for the quote (donation / top-up amount, plan).
export function ManualPayButton({ kind, id = '', query = {}, onFlash, onDone, label = 'Pay by bank transfer', disabled = false }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(null);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [legC, setLegC] = useState({ transactionId: '', paidOn: today(), file: null });
  const [legS, setLegS] = useState({ transactionId: '', paidOn: today(), file: null });
  const [busy, setBusy] = useState(false);
  const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== '' && v != null)).toString();

  async function start() {
    setOpen(true); setQ(null); setError('');
    try { setQ(await apiRequest(`/manual-payments/quote/${kind}/${id}${qs ? `?${qs}` : ''}`)); } catch (e) { setError(e.message); }
  }
  async function asLeg(leg, amount) {
    if (!leg.transactionId.trim()) throw new Error('Enter the transaction ID of each transfer.');
    if (!leg.file) throw new Error('Attach the receipt of each transfer.');
    if (leg.file.size > MAX) throw new Error('Each receipt must be 2 MB or smaller.');
    return { amount, transactionId: leg.transactionId.trim(), paidOn: leg.paidOn, file: { name: leg.file.name, data: await readAsDataUrl(leg.file) } };
  }
  // With a CareerZ fee the buyer goes step by step: the fee first; the seller's account is shown
  // only after CareerZ confirms it. Plans, featured jobs and top-ups are one payment to CareerZ.
  const payCommission = q && q.commission > 0 && (q.stage === 'commission' || !q.seller);
  const paySeller = q && q.seller && q.sellerAmount > 0 && q.stage === 'seller';
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...query, phone: phone.trim() || undefined };
      if (payCommission) body.commission = await asLeg(legC, q.commission);
      if (paySeller) body.seller = await asLeg(legS, q.sellerAmount);
      await apiRequest(`/manual-payments/${kind}/${id}`, { method: 'POST', body });
      onFlash?.(payCommission && q.seller ? 'Service fee receipt sent. Once CareerZ confirms it, you will be told to pay the seller.' : 'Receipt sent. CareerZ will check it and confirm; you will get a notification.', 'success');
      setOpen(false);
      onDone?.();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  const button = <button type="button" className="btn btn-primary" disabled={disabled || open} onClick={start}>{label}</button>;
  if (!open) return button;
  const close = () => { if (!busy) setOpen(false); };
  // Opened as a dialog over the page, so it is never squeezed into a table cell.
  return (<>
    {button}
    {createPortal(
      <div className="u-modal-overlay open" onClick={close}>
        <form onSubmit={submit} className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Pay by bank transfer">
          <div className="u-modal-head">
            <h3>Pay by bank transfer</h3>
            <button type="button" className="u-modal-close" aria-label="Close" onClick={close}>×</button>
          </div>
          <div className="u-modal-body" style={{ display: 'grid', gap: 14 }}>
            {!q && !error && <p role="status" className="text-sm">Loading…</p>}
            {error && <p className="text-sm" style={{ color: 'var(--rose)', margin: 0 }}>{error}</p>}
            {q && <>
              <div>
                <strong>{q.title}</strong>
                <p className="text-sm" style={{ margin: '4px 0 0', color: 'var(--ink-soft)' }}>Total: <strong style={{ color: 'var(--ink)' }}>{money(q.currency, q.total)}</strong>{q.seller && q.commission > 0 ? ` (${money(q.currency, q.commission)} CareerZ service fee + ${money(q.currency, q.sellerAmount)} to ${q.seller.name})` : ''}. Send from your own bank or wallet app, then add the transaction ID and receipt.</p>
              </div>
              {q.stage === 'waiting' && <p className="admin-notice" style={{ margin: 0 }}>CareerZ is checking your service fee payment. As soon as it is confirmed you will get a notification, and then you can pay {q.seller?.name}.</p>}
              {q.stage === 'checking' && <p className="admin-notice" style={{ margin: 0 }}>Your receipts were sent. CareerZ is checking them; you will get a notification.</p>}
              {(payCommission || paySeller || q.stage === 'waiting') && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, alignItems: 'start' }}>
                {q.commission > 0 && <div style={box}>
                  <span className="text-sm"><strong>{q.seller ? 'Step 1: CareerZ service fee' : 'Pay CareerZ'}: {money(q.currency, q.commission)}</strong></span>
                  {payCommission ? <>
                    {q.careerzAccount.qr && <img src={q.careerzAccount.qr} alt="CareerZ payment QR code" style={{ width: '100%', maxWidth: 200, maxHeight: 220, objectFit: 'contain', justifySelf: 'center', borderRadius: 8, background: '#fff' }} />}
                    <Account a={q.careerzAccount} />
                    <LegFields value={legC} onChange={setLegC} idPrefix="mp-c" />
                  </> : <span className="text-sm" style={{ color: q.stage === 'seller' ? 'var(--emerald)' : 'var(--gold)' }}>{q.stage === 'seller' ? '✓ Confirmed by CareerZ' : 'Receipt sent, CareerZ is checking'}</span>}
                </div>}
                {q.seller && q.sellerAmount > 0 && <div style={{ ...box, opacity: paySeller ? 1 : 0.6 }}>
                  <span className="text-sm"><strong>{q.commission > 0 ? 'Step 2: ' : ''}Pay {q.seller.name}: {money(q.currency, q.sellerAmount)}</strong></span>
                  {paySeller ? <>
                    <Account a={q.seller.account} />
                    <LegFields value={legS} onChange={setLegS} idPrefix="mp-s" />
                  </> : <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>🔒 The account to pay opens after CareerZ confirms your service fee.</span>}
                </div>}
              </div>}
              {(payCommission || paySeller) && <label className="text-xs" style={{ maxWidth: 320 }}>Your phone number (CareerZ may call to confirm)<input className="form-input" type="tel" placeholder="03XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>}
            </>}
          </div>
          <div className="u-modal-foot">
            <button type="button" className="btn" disabled={busy} onClick={close}>{payCommission || paySeller ? 'Cancel' : 'Close'}</button>
            {(payCommission || paySeller) && <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : payCommission && q.seller ? 'Send service fee receipt' : 'Send receipt'}</button>}
          </div>
        </form>
      </div>,
      document.body
    )}
  </>);
}

// The buyer's own manual payments and their status.
export function MyManualPayments({ onFlash }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { apiRequest('/manual-payments/mine').then(setRows).catch(() => setRows([])); }, []);
  if (!rows?.length) return null;
  return (
    <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
      <h5 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>My bank transfer payments</h5>
      {rows.map((m) => (
        <div key={m._id} className="text-xs" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', borderTop: '1px solid var(--sand-line)', paddingTop: 6 }}>
          <span>{m.title} · {money(m.currency, m.commission + m.sellerAmount)} · {m.number}</span>
          <span style={{ color: m.status === 'approved' ? 'var(--emerald)' : m.status === 'rejected' ? 'var(--rose)' : 'var(--gold)' }}>{m.status === 'rejected' ? `Rejected: ${m.review?.note || ''}` : STATUS_LABEL[m.status]}</span>
        </div>
      ))}
    </div>
  );
}

// The account buyers pay this person into (institute, teacher, seller, student receiving donations).
export function ReceivingAccount({ onFlash }) {
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ method: 'bank_transfer', bankName: '', accountTitle: '', accountNumber: '' });
  const load = () => apiRequest('/wallet/payout-account').then((d) => { setData(d); if (d.account) setF({ method: d.account.method, bankName: d.account.bankName, accountTitle: d.account.accountTitle, accountNumber: d.account.accountNumber }); }).catch(() => setData({ account: null, banks: [], wallets: [] }));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return null;
  async function save(e) {
    e.preventDefault();
    try { await apiRequest('/wallet/payout-account', { method: 'PUT', body: f }); onFlash?.('Account saved. Buyers will pay you here.', 'success'); setEdit(false); load(); } catch (err) { onFlash?.(err.message); }
  }
  return (
    <div style={{ ...box, marginTop: 12 }}>
      <span className="text-sm"><strong>Account where buyers pay you</strong></span>
      {!edit && data.account && <><Account a={data.account} /><button type="button" className="btn" style={{ justifySelf: 'start', padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setEdit(true)}>Change</button></>}
      {!edit && !data.account && <><span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Add your bank or wallet account so students, parents and buyers can pay you for fees, courses, tuition and orders.</span><button type="button" className="btn btn-primary" style={{ justifySelf: 'start', padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setEdit(true)}>Add account</button></>}
      {edit && <form onSubmit={save} style={{ display: 'grid', gap: 6, maxWidth: 360 }}>
        <select className="form-select" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value, bankName: '' })}>
          <option value="bank_transfer">Bank account</option>
          <option value="mobile_wallet">Mobile wallet</option>
        </select>
        <select className="form-select" value={f.bankName} onChange={(e) => setF({ ...f, bankName: e.target.value })}>
          <option value="">{f.method === 'mobile_wallet' ? 'Choose the wallet' : 'Choose the bank'}</option>
          {(f.method === 'mobile_wallet' ? data.wallets : data.banks).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <input className="form-input" placeholder="Account holder's name (as on the account)" value={f.accountTitle} onChange={(e) => setF({ ...f, accountTitle: e.target.value })} />
        <input className="form-input" placeholder={f.method === 'mobile_wallet' ? 'Wallet number (03XXXXXXXXX)' : 'IBAN (PK...) or account number'} value={f.accountNumber} onChange={(e) => setF({ ...f, accountNumber: e.target.value })} />
        <div className="flex gap-2"><button type="submit" className="btn btn-primary">Save</button><button type="button" className="btn" onClick={() => setEdit(false)}>Cancel</button></div>
      </form>}
    </div>
  );
}

// Payments buyers say they sent to this person: confirm whether the money arrived.
export function IncomingManualPayments({ onFlash }) {
  const [rows, setRows] = useState(null);
  const load = () => apiRequest('/manual-payments/incoming').then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!rows?.length) return null;
  async function answer(m, received) {
    const note = received ? '' : await showPrompt('What did you find? (CareerZ will call both sides)', { title: 'Money not received', required: true });
    if (!received && !note) return;
    try { await apiRequest(`/manual-payments/${m._id}/confirm`, { method: 'PATCH', body: { received, note } }); onFlash?.('Thank you. CareerZ was told.', 'success'); load(); } catch (e) { onFlash?.(e.message); }
  }
  return (
    <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
      <h5 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Payments sent to your account</h5>
      {rows.map((m) => (
        <div key={m._id} className="text-xs" style={{ display: 'grid', gap: 4, borderTop: '1px solid var(--sand-line)', paddingTop: 6 }}>
          <span><strong>{money(m.currency, m.sellerAmount)}</strong> from {m.payerSnapshot?.name} for {m.title} · transaction {m.sellerLeg?.transactionId} · {m.sellerLeg?.paidOn ? new Date(m.sellerLeg.paidOn).toLocaleDateString() : ''}</span>
          <div className="flex gap-2 flex-wrap" style={{ alignItems: 'center' }}>
            <button type="button" className="btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => openPrivateFile(`/manual-payments/${m._id}/proof/seller`).catch((e) => onFlash?.(e.message))}>View receipt</button>
            {m.status === 'submitted' && m.recipientConfirmation?.received == null && <>
              <button type="button" className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => answer(m, true)}>Money received</button>
              <button type="button" className="btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => answer(m, false)}>Not received</button>
            </>}
            {m.recipientConfirmation?.received != null && <span>{m.recipientConfirmation.received ? 'You confirmed it arrived.' : 'You said it did not arrive.'}</span>}
            <span style={{ color: 'var(--ink-soft)' }}>{m.status === 'submitted' ? 'CareerZ is checking' : m.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Super Admin: the CareerZ account and QR buyers pay the service fee into.
export function PlatformAccountForm({ onFlash }) {
  const [f, setF] = useState(null);
  useEffect(() => { apiRequest('/manual-payments/platform-account').then(setF).catch(() => setF({ accountTitle: '', bankName: '', accountNumber: '', iban: '', qr: '' })); }, []);
  if (!f) return null;
  async function pickQr(file) {
    if (!file) return;
    if (file.size > 1024 * 1024) return onFlash?.('The QR image must be under 1 MB.');
    setF({ ...f, qr: await readAsDataUrl(file) });
  }
  async function save(e) {
    e.preventDefault();
    try { setF(await apiRequest('/manual-payments/platform-account', { method: 'PUT', body: f })); onFlash?.('CareerZ payment account saved.', 'success'); } catch (err) { onFlash?.(err.message); }
  }
  return (
    <form onSubmit={save} className="card" style={{ padding: 16, display: 'grid', gap: 8, maxWidth: 520, marginBottom: 16 }}>
      <h4 className="font-semibold" style={{ margin: 0 }}>CareerZ payment account</h4>
      <p className="text-xs" style={{ margin: 0, color: 'var(--ink-soft)' }}>Buyers pay the CareerZ service fee (and plans, featured jobs, wallet top-ups) into this account.</p>
      <input className="form-input" placeholder="Account title" value={f.accountTitle} onChange={(e) => setF({ ...f, accountTitle: e.target.value })} />
      <input className="form-input" placeholder="Bank" value={f.bankName} onChange={(e) => setF({ ...f, bankName: e.target.value })} />
      <input className="form-input" placeholder="Account number" value={f.accountNumber} onChange={(e) => setF({ ...f, accountNumber: e.target.value })} />
      <input className="form-input" placeholder="IBAN (PK...)" value={f.iban} onChange={(e) => setF({ ...f, iban: e.target.value })} />
      <label className="text-xs">QR code image<input className="form-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => pickQr(e.target.files?.[0])} /></label>
      {f.qr && <img src={f.qr} alt="CareerZ QR" style={{ width: 160, borderRadius: 8, background: '#fff' }} />}
      <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Save</button>
    </form>
  );
}

// Finance admin: every manual payment to check, with both people's numbers to call.
export function AdminManualPayments({ onFlash, isSuperAdmin }) {
  const [status, setStatus] = useState('submitted');
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState('');
  const load = () => apiRequest(`/manual-payments/admin?status=${status}`).then(setRows).catch((e) => { setRows([]); onFlash?.(e.message); });
  useEffect(() => { setRows(null); load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(m, decision) {
    let note = '';
    if (decision === 'reject') { note = await showPrompt('Why is it rejected? The buyer is told.', { title: 'Reject payment', required: true }); if (!note) return; }
    else {
      if (m.recipientConfirmation?.received === false) { note = await showPrompt('The seller said the money did not arrive. What did you confirm when you called?', { title: 'Approve anyway', required: true }); if (!note) return; }
      else if (!(await showConfirm(m.status === 'commission_submitted' ? 'Confirm only after you see this service fee in the CareerZ account statement. The buyer can then pay the seller.' : 'Approve only after checking the seller receipt (and calling the seller if needed). The buyer then gets access.', { confirmLabel: m.status === 'commission_submitted' ? 'Fee received' : 'Approve' }))) return;
    }
    setBusy(m._id);
    try { await apiRequest(`/manual-payments/${m._id}/decide`, { method: 'PATCH', body: { decision, note } }); onFlash?.(decision !== 'approve' ? 'Rejected. The buyer was told.' : m.status === 'commission_submitted' ? 'Service fee confirmed. The buyer was told to pay the seller.' : 'Approved. The buyer now has access.', 'success'); load(); } catch (e) { onFlash?.(e.message); } finally { setBusy(''); }
  }
  async function suspend(user, who) {
    if (!user?._id || !(await showConfirm(`Suspend ${user.fullName}'s account (${who})? They are logged out and cannot sign in.`, { confirmLabel: 'Suspend' }))) return;
    try { await apiRequest(`/users/${user._id}/status`, { method: 'PATCH', body: { status: 'suspended' } }); onFlash?.(`${user.fullName} suspended.`, 'success'); load(); } catch (e) { onFlash?.(e.message); }
  }
  const person = (snap, user, who) => (
    <span className="text-xs" style={{ display: 'grid', gap: 2 }}>
      <span><strong>{who}:</strong> {user?.fullName || snap?.name} {user?.status && user.status !== 'active' && <em>({user.status})</em>}</span>
      <span>Phone: {(snap?.phone || user?.phone) ? <a href={`tel:${snap?.phone || user?.phone}`}>{snap?.phone || user?.phone}</a> : 'not given'} · {user?.email || snap?.email}</span>
    </span>
  );
  const legView = (m, key, label) => {
    const l = m[`${key}Leg`];
    if (!l) return null;
    return <span className="text-xs">{label}: <strong>{money(m.currency, l.amount)}</strong> · transaction <strong>{l.transactionId}</strong> · paid {l.paidOn ? new Date(l.paidOn).toLocaleDateString() : ''} <button type="button" className="btn" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => openPrivateFile(`/manual-payments/${m._id}/proof/${key}`).catch((e) => onFlash?.(e.message))}>View receipt</button></span>;
  };
  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <h4 className="font-semibold mb-2">Bank transfer payments</h4>
      <nav className="cz-tabbar" style={{ marginBottom: 10 }}>{[['submitted', 'To check'], ['commission_verified', 'Waiting for buyer to pay seller'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([k, l]) => <button key={k} type="button" className={`cz-tab${status === k ? ' active' : ''}`} onClick={() => setStatus(k)}>{l}</button>)}</nav>
      {rows === null && <p role="status" className="text-sm">Loading…</p>}
      {rows?.length === 0 && <p className="admin-notice">Nothing here.</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {(rows || []).map((m) => (
          <article key={m._id} style={{ ...box, background: 'var(--card, #fff)', border: '1px solid var(--sand-line)' }}>
            <span className="text-sm"><strong>{KIND_LABEL[m.kind]}: {m.title}</strong> · {m.number} · {new Date(m.createdAt).toLocaleString()}</span>
            {person(m.payerSnapshot, m.payer, 'Paid by')}
            {(m.recipient || m.recipientSnapshot) && <>{person(m.recipientSnapshot, m.recipient, 'Paid to')}<span className="text-xs">Their account: {m.recipientSnapshot?.account?.accountTitle} · {m.recipientSnapshot?.account?.bankName} {m.recipientSnapshot?.account?.accountNumber}</span></>}
            {legView(m, 'commission', m.recipient ? `CareerZ service fee (${m.commissionRate}%)` : 'Paid to CareerZ')}
            {legView(m, 'seller', 'Paid to the seller')}
            <span className="text-xs"><strong>Status:</strong> {m.status === 'rejected' ? 'Rejected' : STATUS_LABEL[m.status]}</span>
            {m.recipient && m.sellerLeg && <span className="text-xs">Seller says: {m.recipientConfirmation?.received == null ? 'not answered yet' : m.recipientConfirmation.received ? 'money received ✓' : `NOT received — ${m.recipientConfirmation.note || ''}`}</span>}
            {m.review?.note && <span className="text-xs">Note: {m.review.note}</span>}
            <div className="flex gap-2 flex-wrap">
              {['commission_submitted', 'submitted'].includes(m.status) && <>
                <button type="button" className="btn btn-primary" disabled={busy === m._id} onClick={() => decide(m, 'approve')}>{m.status === 'commission_submitted' ? 'Service fee received' : 'Approve'}</button>
                <button type="button" className="btn" disabled={busy === m._id} onClick={() => decide(m, 'reject')}>Reject</button>
              </>}
              {isSuperAdmin && m.payer?.status === 'active' && <button type="button" className="btn" onClick={() => suspend(m.payer, 'buyer')}>Suspend buyer</button>}
              {isSuperAdmin && m.recipient?.status === 'active' && <button type="button" className="btn" onClick={() => suspend(m.recipient, 'seller')}>Suspend seller</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
