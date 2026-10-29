import { useEffect, useState } from 'react';
import { apiRequest, API_BASE, session } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import '../../styles/marketplace-escrow.css';

// Master 16B on the screens: escrow state, the buyer's delivery code, confirm received, disputes
// with evidence, digital file access, the seller trust score and the admin escrow desk.

const ESCROW = {
  held: ['warn', 'Paid · CareerZ holds the money'],
  disputed: ['bad', 'In dispute · money frozen'],
  released: ['good', 'Payment released to seller'],
  refund_due: ['warn', 'Refund being sent'],
  refunded: ['bad', 'Refunded']
};
export function EscrowChip({ o }) {
  const s = ESCROW[o?.escrow?.status];
  return s ? <span className={`esc-chip ${s[0]}`}>{s[1]}</span> : null;
}

const readFile = (file) => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });

async function fetchPdf(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${session.getAccessToken()}` } });
  if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'The file could not be opened.'); }
  return URL.createObjectURL(await res.blob());
}
export async function openOrderFile(orderId, mode, onFlash) {
  const win = mode === 'view' ? window.open('', '_blank') : null;
  try {
    const url = await fetchPdf(`/marketplace/orders/${orderId}/file?mode=${mode}`);
    if (win) win.location.href = url;
    else { const a = document.createElement('a'); a.href = url; a.download = 'purchase.pdf'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
  } catch (e) { if (win) win.close(); onFlash(e.message); }
}

function EvidenceForm({ title, withReason, onSubmit, onCancel }) {
  const [reason, setReason] = useState(''), [note, setNote] = useState(''), [file, setFile] = useState(null), [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (file && file.size > 3 * 1024 * 1024) return;
    setBusy(true);
    try { await onSubmit({ reason, note, file: file ? { name: file.name, data: await readFile(file) } : undefined }); } finally { setBusy(false); }
  }
  return (
    <div className="esc-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <form className="card esc-modal-card" onSubmit={submit}>
        <h3>{title}</h3>
        {withReason && <label className="hiring-field"><span>What is wrong?</span><textarea className="form-input" rows={3} required minLength={15} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Not received, damaged, not as described" /></label>}
        <label className="hiring-field"><span>{withReason ? 'Your evidence (optional)' : 'Your evidence'}</span><textarea className="form-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dates, courier slip number, what you were told" /></label>
        <label className="hiring-field"><span>Photo or PDF (optional, max 3 MB)</span><input className="form-input" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        {file && file.size > 3 * 1024 * 1024 && <small className="esc-err">This file is larger than 3 MB.</small>}
        <div className="esc-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send'}</button><button type="button" className="btn" onClick={onCancel}>Cancel</button></div>
      </form>
    </div>
  );
}

function DisputeBox({ o, side, onFlash, onDone }) {
  const [adding, setAdding] = useState(false);
  const d = o.dispute;
  if (!d?.reason) return null;
  async function openEvidence(i) {
    const win = window.open('', '_blank');
    try { win.location.href = await fetchPdf(`/marketplace/orders/${o._id}/dispute/evidence/${i}`); } catch (e) { win?.close(); onFlash(e.message); }
  }
  return (
    <div className={`esc-dispute${d.open ? ' open' : ''}`}>
      <strong>{d.open ? 'Dispute open: CareerZ is checking' : `Dispute decided: ${d.decision === 'release' ? 'paid to the seller' : 'refund to the buyer'}`}</strong>
      <p>{d.reason}</p>
      {(d.evidence || []).map((ev, i) => <small key={i}>{ev.by === 'buyer' ? 'Buyer' : 'Seller'} · {new Date(ev.at).toLocaleDateString()}: {ev.note || 'file'}{ev.file && <> · <button type="button" className="esc-link" onClick={() => openEvidence(i)}>open file</button></>}</small>)}
      {!d.open && d.note && <small>CareerZ: {d.note}</small>}
      {d.open && <button type="button" className="btn" onClick={() => setAdding(true)}>{side === 'seller' ? 'Add your side / evidence' : 'Add evidence'}</button>}
      {adding && <EvidenceForm title="Add evidence" onCancel={() => setAdding(false)} onSubmit={async (b) => { try { await apiRequest(`/marketplace/orders/${o._id}/dispute/evidence`, { method: 'POST', body: b }); onFlash('Evidence added.', 'success'); setAdding(false); onDone(); } catch (e) { onFlash(e.message); } }} />}
    </div>
  );
}

// Buyer actions under one order.
export function BuyerEscrowActions({ o, onFlash, onDone }) {
  const [disputing, setDisputing] = useState(false);
  const held = o.escrow?.status === 'held';
  const digital = Boolean(o.product?.digital?.fileName);
  const canOpen = digital && o.paymentStatus === 'paid' && !['refund_due', 'refunded'].includes(o.escrow?.status);
  async function confirm() {
    if (!(await showConfirm('Confirm you received the item and it is as described? CareerZ then pays the seller. You cannot open a dispute after this.', { title: 'Confirm received', confirmLabel: 'Yes, I received it' }))) return;
    try { await apiRequest(`/marketplace/orders/${o._id}/confirm-received`, { method: 'POST' }); onFlash('Thank you. The seller has been paid.', 'success'); onDone(); } catch (e) { onFlash(e.message); }
  }
  if (!o.escrow?.status) return null;
  return (
    <div className="esc-box">
      <EscrowChip o={o} />
      {held && o.deliveryCode && <p className="esc-code">Your delivery code: <b>{o.deliveryCode}</b><small>Give it to the seller only when the item is in your hands. It releases the payment.</small></p>}
      {canOpen && <div className="esc-actions"><button type="button" className="btn btn-primary" onClick={() => openOrderFile(o._id, 'view', onFlash)}>Read online</button>{o.product.digital.access !== 'online' && <button type="button" className="btn" onClick={() => openOrderFile(o._id, 'download', onFlash)}>Download PDF</button>}</div>}
      {canOpen && <small className="esc-muted">Your copy carries your name, user ID and purchase date.</small>}
      {held && <div className="esc-actions"><button type="button" className="btn" onClick={confirm}>Confirm received</button><button type="button" className="btn staff-remove" onClick={() => setDisputing(true)}>Problem? Open a dispute</button></div>}
      {held && <small className="esc-muted">{digital ? 'If you do nothing, the seller is paid 3 days after you first open the file.' : 'If you do nothing, the seller is paid 7 days after delivery.'}</small>}
      <DisputeBox o={o} side="buyer" onFlash={onFlash} onDone={onDone} />
      {o.escrow.status === 'refunded' && o.escrow.refundRef && <small className="esc-muted">Refund transaction: {o.escrow.refundRef}</small>}
      {disputing && <EvidenceForm title="Open a dispute" withReason onCancel={() => setDisputing(false)} onSubmit={async (b) => { try { await apiRequest(`/marketplace/orders/${o._id}/dispute`, { method: 'POST', body: b }); onFlash('Dispute opened. CareerZ holds the money until it decides.', 'success'); setDisputing(false); onDone(); } catch (e) { onFlash(e.message); } }} />}
    </div>
  );
}

// Seller actions under one order.
export function SellerEscrowActions({ o, onFlash, onDone }) {
  if (!o.escrow?.status) return null;
  const held = o.escrow.status === 'held';
  const digital = Boolean(o.product?.digital?.fileName);
  async function deliver() {
    const code = await showPrompt('Ask the buyer for the 6-digit delivery code from their order, and enter it when you hand the item over.', { title: 'Delivered with code', placeholder: '123456', confirmLabel: 'Confirm delivery', required: true });
    if (!code) return;
    try { await apiRequest(`/marketplace/orders/${o._id}/deliver`, { method: 'POST', body: { code: code.trim() } }); onFlash('Delivered. The payment is in your wallet.', 'success'); onDone(); } catch (e) { onFlash(e.message); }
  }
  return (
    <div className="esc-box">
      <EscrowChip o={o} />
      {held && !digital && <div className="esc-actions"><button type="button" className="btn btn-primary" onClick={deliver}>Delivered (enter buyer's code)</button></div>}
      {held && <small className="esc-muted">{digital ? 'Paid out 3 days after the buyer opens the file, or when they confirm.' : o.deliveredAt ? 'Marked delivered: paid out after 7 days if the buyer does not object.' : 'Ship only now. Paid out when you enter the buyer\'s code, the buyer confirms, or 7 days after delivery.'}</small>}
      <DisputeBox o={o} side="seller" onFlash={onFlash} onDone={onDone} />
    </div>
  );
}

// ---------------------------------------------------------------- seller trust score
export function SellerTrustCard({ sellerId }) {
  const [t, setT] = useState(null);
  useEffect(() => { if (sellerId) apiRequest(`/marketplace/sellers/${sellerId}/trust`, { auth: false }).then(setT).catch(() => setT(null)); }, [sellerId]);
  if (!t) return null;
  return (
    <section className="esc-trust">
      <div className="esc-trust-score"><strong>{t.score ?? '—'}</strong><span>{t.score === null ? '' : '/ 100'}</span><small>{t.level}</small></div>
      <div className="esc-trust-factors">{t.factors.map((f) => <div key={f.key}><b>{f.label}</b><small>{f.value}</small></div>)}</div>
    </section>
  );
}

// ---------------------------------------------------------------- digital listing fields
export function DigitalListingFields({ form, setForm }) {
  return (
    <div className="esc-digital">
      <strong>Digital file (PDF)</strong>
      <small>For notes, past papers or e-books. Buyers see only the first 3 pages marked PREVIEW before paying. After paying they get a copy marked with their name, user ID and purchase date.</small>
      <input className="form-input" type="file" accept="application/pdf,.pdf" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 12 * 1024 * 1024) { e.target.value = ''; window.alert('The PDF must be 12 MB or smaller.'); return; } const data = await readFile(f); setForm((x) => ({ ...x, digitalFile: { name: f.name, data } })); }} />
      {form.digitalFile && <small>Selected: {form.digitalFile.name}</small>}
      <label className="esc-radio"><input type="radio" checked={(form.digitalAccess || 'download') === 'download'} onChange={() => setForm((x) => ({ ...x, digitalAccess: 'download' }))} /> Buyers may download the PDF</label>
      <label className="esc-radio"><input type="radio" checked={form.digitalAccess === 'online'} onChange={() => setForm((x) => ({ ...x, digitalAccess: 'online' }))} /> Read online only (no download)</label>
    </div>
  );
}

// ---------------------------------------------------------------- admin escrow desk
export function AdminEscrowPanel({ onFlash, isSuperAdmin }) {
  const [d, setD] = useState(null), [filter, setFilter] = useState('disputed');
  function load() { apiRequest('/marketplace/admin/escrow').then(setD).catch((e) => { setD({ rows: [], totals: {} }); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(o, decision) {
    const note = await showPrompt(decision === 'release' ? 'Why is the seller paid? Both sides see this.' : 'Why is the buyer refunded? Both sides see this.', { title: decision === 'release' ? 'Pay the seller' : 'Refund the buyer', placeholder: 'Reason', required: true });
    if (!note) return;
    try { await apiRequest(`/marketplace/admin/orders/${o._id}/dispute`, { method: 'PATCH', body: { decision, note } }); onFlash('Decision saved.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function refunded(o) {
    const reference = await showPrompt(`Send ${o.currency} ${(o.totalPrice + (o.escrow.fee || 0)).toLocaleString()} to ${o.buyer?.fullName} (${o.buyer?.phone || o.buyer?.email}), then enter the transaction ID.`, { title: 'Record refund', placeholder: 'Transaction ID', required: true });
    if (!reference) return;
    try { await apiRequest(`/marketplace/admin/orders/${o._id}/refunded`, { method: 'PATCH', body: { reference } }); onFlash('Refund recorded.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  const rows = (d?.rows || []).filter((o) => o.escrow.status === filter);
  const tabs = [['disputed', 'Disputes'], ['refund_due', 'Refunds to send'], ['held', 'Money held']];
  return (
    <div className="esc-admin">
      <div className="esc-admin-tiles">{tabs.map(([k, l]) => <div key={k}><span>{l}</span><strong>{(d?.rows || []).filter((o) => o.escrow.status === k).length}</strong><small>PKR {Math.round(d?.totals?.[k] || 0).toLocaleString()}</small></div>)}</div>
      <nav className="cz-tabbar">{tabs.map(([k, l]) => <button key={k} type="button" className={`cz-tab${filter === k ? ' active' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}</nav>
      {d === null ? <p>Loading…</p> : !rows.length ? <p className="esc-muted">Nothing here.</p> : (
        <div className="esc-admin-cards">
          {rows.map((o) => (
            <article key={o._id} className="card esc-admin-card">
              <div className="esc-admin-top"><strong>{o.product?.title} · {o.currency} {o.totalPrice.toLocaleString()}</strong><EscrowChip o={o} /></div>
              <small className="esc-muted">Order {String(o._id).slice(-8).toUpperCase()} · buyer {o.buyer?.fullName} ({o.buyer?.phone || o.buyer?.email}) · seller {o.seller?.fullName} ({o.seller?.phone || o.seller?.email}) · paid {new Date(o.escrow.heldAt).toLocaleDateString()}{o.deliveredAt ? ` · delivered ${new Date(o.deliveredAt).toLocaleDateString()}` : ''}{o.accessLog?.length ? ` · file opened ${o.accessLog.length}×` : ''}</small>
              <DisputeBox o={o} side="admin" onFlash={onFlash} onDone={load} />
              <div className="esc-actions">
                {o.escrow.status === 'disputed' && isSuperAdmin !== false && <><button type="button" className="btn btn-primary" onClick={() => decide(o, 'release')}>Pay the seller</button><button type="button" className="btn staff-remove" onClick={() => decide(o, 'refund')}>Refund the buyer</button></>}
                {o.escrow.status === 'refund_due' && <button type="button" className="btn btn-primary" onClick={() => refunded(o)}>Record refund sent</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- admin: listing review
const CATEGORY_LABEL = { books: 'Books', stationery: 'Stationery', uniform: 'Uniform', electronics: 'Electronics', notes: 'Notes (PDF)', courses: 'Courses', services: 'Services', other: 'Other' };
export function AdminListingReview({ onFlash }) {
  const [rows, setRows] = useState(null), [busy, setBusy] = useState(null);
  function load() { apiRequest('/marketplace/products/admin/pending').then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(p, status) {
    const reviewNotes = status === 'rejected' ? await showPrompt('Why is this listing not approved? The seller sees this and can fix it.', { title: 'Reject listing', placeholder: 'Reason', required: true }) : '';
    if (status === 'rejected' && !reviewNotes) return;
    setBusy(p._id);
    try { await apiRequest(`/marketplace/products/${p._id}/moderate`, { method: 'PATCH', body: { status, reviewNotes } }); onFlash(status === 'active' ? 'Approved. The listing is live on the marketplace.' : 'Rejected. The seller was told why.', 'success'); load(); }
    catch (e) { onFlash(e.message); } finally { setBusy(null); }
  }
  async function preview(p) {
    const win = window.open('', '_blank');
    try { win.location.href = await fetchPdf(`/marketplace/products/${p._id}/preview`); } catch (e) { win?.close(); onFlash(e.message); }
  }
  return (
    <div className="esc-admin">
      <div><h3 style={{ margin: 0 }}>Listings held by the automatic check</h3><p className="esc-muted" style={{ margin: '4px 0 0' }}>Verified sellers' listings go live by themselves. Only the ones the automatic check found suspicious wait here, with the reasons. Approve to publish, or reject with a reason the seller sees.</p></div>
      {rows === null ? <p>Loading…</p> : !rows.length ? <p className="esc-muted">Nothing is held. Every new listing passed the automatic check and is live.</p> : (
        <div className="esc-admin-cards">
          {rows.map((p) => (
            <article key={p._id} className="card esc-admin-card esc-listing">
              <div className="esc-listing-img">{p.images?.[0] ? <img src={p.images[0]} alt="" /> : <span>{(p.title || '?')[0]}</span>}</div>
              <div className="esc-listing-body">
                <div className="esc-admin-top"><strong>{p.title}</strong><span className="esc-chip warn">Held by the automatic check</span></div>
                {p.moderation?.flags?.length > 0 && <div className="esc-flags">{p.moderation.flags.map((f) => <span key={f.code} className={`esc-chip ${f.hold ? 'bad' : 'warn'}`}>{f.label}</span>)}</div>}
                <small className="esc-muted">{CATEGORY_LABEL[p.category] || p.category} · {p.currency} {Number(p.price).toLocaleString()}{p.digital?.fileName ? ` · PDF ${p.digital.pages || ''} pages · ${p.digital.access === 'online' ? 'online only' : 'download'}` : ` · stock ${p.stock}`} · by {p.seller?.fullName} ({p.seller?.email}) · {new Date(p.createdAt).toLocaleDateString()}</small>
                {p.description && <p className="esc-listing-desc">{p.description}</p>}
                <div className="esc-actions">
                  <button type="button" className="btn btn-primary" disabled={busy === p._id} onClick={() => decide(p, 'active')}>Approve</button>
                  <button type="button" className="btn staff-remove" disabled={busy === p._id} onClick={() => decide(p, 'rejected')}>Reject</button>
                  {p.digital?.fileName && <button type="button" className="btn" onClick={() => preview(p)}>Open file preview</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}


// ---------------------------------------------------------------- receiver details on the order form
const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir'];
export const EMPTY_SHIPPING = { name: '', phone: '', cnic: '', address: '', landmark: '', city: '', province: '', postalCode: '', locationUrl: '' };
export function useSavedShipping(signedIn) {
  const [s, setS] = useState(EMPTY_SHIPPING);
  useEffect(() => { if (signedIn) apiRequest('/marketplace/me/shipping').then((d) => setS({ ...EMPTY_SHIPPING, ...(d || {}) })).catch(() => {}); }, [signedIn]);
  return [s, setS];
}
export function ShippingFields({ value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <fieldset className="esc-ship">
      <legend>Who receives the parcel</legend>
      <p className="esc-muted">The seller sends your parcel to these details. Your CNIC is shared only with this seller and the courier.</p>
      <div className="esc-ship-grid">
        <label>Full name<input className="form-input" required minLength={3} value={value.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Phone (for the courier)<input className="form-input" type="tel" required value={value.phone} onChange={set('phone')} placeholder="03001234567" autoComplete="tel" /></label>
        <label>CNIC<input className="form-input" required value={value.cnic} onChange={set('cnic')} placeholder="35202-1234567-1" inputMode="numeric" /></label>
        <label>City<input className="form-input" required value={value.city} onChange={set('city')} autoComplete="address-level2" /></label>
        <label className="wide">Full address (house, street, area)<textarea className="form-input" rows={2} required minLength={10} value={value.address} onChange={set('address')} autoComplete="street-address" /></label>
        <label>Nearby landmark (optional)<input className="form-input" value={value.landmark} onChange={set('landmark')} placeholder="e.g. near Liberty Market" /></label>
        <label>Province<select className="form-select" value={value.province} onChange={set('province')}><option value="">Choose</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label>Postal code (optional)<input className="form-input" value={value.postalCode} onChange={set('postalCode')} inputMode="numeric" /></label>
        <label>Location link (optional)<input className="form-input" type="url" value={value.locationUrl} onChange={set('locationUrl')} placeholder="https://maps.google.com/…" /></label>
      </div>
    </fieldset>
  );
}

// ---------------------------------------------------------------- tracking
const STEP = { dispute: 'Dispute', pending: 'Order placed', paid: 'Payment confirmed (held by CareerZ)', confirmed: 'Seller confirmed', processing: 'Being packed', shipped: 'Shipped', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled', refunded: 'Refunded' };
export function OrderTracking({ o }) {
  const steps = o.timeline || [];
  if (!steps.length && !o.shipment?.courier) return null;
  return (
    <div className="esc-track">
      {o.shipment?.courier && <p className="esc-track-ship"><b>{o.shipment.courier}</b>{o.shipment.trackingNo ? <> · tracking <b>{o.shipment.trackingNo}</b></> : ''}{o.shipment.trackingUrl && <> · <a href={o.shipment.trackingUrl} target="_blank" rel="noreferrer">Track parcel</a></>}</p>}
      <ol>{steps.map((s, i) => <li key={i} className={i === steps.length - 1 ? 'now' : ''}><span>{STEP[s.status] || s.status}</span><small>{new Date(s.at).toLocaleString()}{s.note && s.note !== 'Order placed' ? ` · ${s.note}` : ''}</small></li>)}</ol>
    </div>
  );
}

// ---------------------------------------------------------------- the order's message thread
export function OrderThread({ orderId, onFlash, label = 'Messages' }) {
  const [open, setOpen] = useState(false), [d, setD] = useState(null), [text, setText] = useState(''), [busy, setBusy] = useState(false);
  function load() { apiRequest(`/marketplace/orders/${orderId}/messages`).then(setD).catch((e) => onFlash(e.message)); }
  useEffect(() => { if (open) load(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  async function send(e) {
    e.preventDefault();
    setBusy(true);
    try { setD(await apiRequest(`/marketplace/orders/${orderId}/messages`, { method: 'POST', body: { text } })); setText(''); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  if (!open) return <button type="button" className="btn" onClick={() => setOpen(true)}>{label}</button>;
  return (
    <div className="esc-thread">
      <div className="esc-thread-list">
        {!d ? <small className="esc-muted">Loading…</small> : !d.messages.length ? <small className="esc-muted">No messages yet.</small> : d.messages.map((m, i) => <p key={i} className={m.from === d.side ? 'me' : ''}><span>{m.text}</span><small>{m.from === d.side ? 'You' : m.from === 'seller' ? 'Seller' : 'Buyer'} · {new Date(m.at).toLocaleString()}</small></p>)}
      </div>
      <form className="esc-thread-form" onSubmit={send}><input className="form-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" maxLength={1000} /><button type="submit" className="btn btn-primary" disabled={busy || !text.trim()}>Send</button><button type="button" className="btn" onClick={() => setOpen(false)}>Close</button></form>
    </div>
  );
}

// ---------------------------------------------------------------- rating (buyers with or without an account)
const Stars = ({ value, onChange, label }) => (
  <div className="esc-stars" role="radiogroup" aria-label={label}>
    {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n === 1 ? '' : 's'}`} className={n <= value ? 'on' : ''} onClick={() => onChange(n)}>★</button>)}
  </div>
);
export function RateOrder({ o, onFlash, onDone }) {
  const [rating, setRating] = useState(0), [sellerRating, setSellerRating] = useState(0), [comment, setComment] = useState(''), [busy, setBusy] = useState(false);
  const [onTime, setOnTime] = useState(null), [described, setDescribed] = useState(null);
  const parcel = !o.product?.digital?.fileName;
  if (o.reviewed) return <small className="esc-muted">You rated this order. Thank you!</small>;
  if (!['delivered', 'completed'].includes(o.status)) return null;
  async function send() {
    if (!rating) return onFlash('Choose the stars for the product.');
    setBusy(true);
    try { await apiRequest(`/marketplace/orders/${o._id}/review`, { method: 'POST', body: { rating, sellerRating: sellerRating || null, comment, deliveredOnTime: parcel ? onTime : null, asDescribed: described } }); onFlash('Thank you for your rating.', 'success'); onDone(); }
    catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="esc-rate">
      <strong>Rate your order</strong>
      <div className="esc-rate-row"><span>The product</span><Stars value={rating} onChange={setRating} label="Product rating" /></div>
      <div className="esc-rate-row"><span>The seller</span><Stars value={sellerRating} onChange={setSellerRating} label="Seller rating" /></div>
      {parcel && <div className="esc-rate-row"><span>Arrived on time?</span><div className="esc-yn"><button type="button" className={onTime === true ? 'on' : ''} onClick={() => setOnTime(true)}>Yes</button><button type="button" className={onTime === false ? 'on no' : ''} onClick={() => setOnTime(false)}>No, it was late</button></div></div>}
      <div className="esc-rate-row"><span>As described?</span><div className="esc-yn"><button type="button" className={described === true ? 'on' : ''} onClick={() => setDescribed(true)}>Yes</button><button type="button" className={described === false ? 'on no' : ''} onClick={() => setDescribed(false)}>No</button></div></div>
      <textarea className="form-input" rows={2} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the item and the delivery? (optional)" />
      <div className="esc-actions"><button type="button" className="btn btn-primary" disabled={busy || !rating} onClick={send}>{busy ? 'Sending…' : 'Submit rating'}</button></div>
    </div>
  );
}

// ---------------------------------------------------------------- public reviews on the product page
export function ProductReviews({ productId }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { apiRequest(`/marketplace/products/${productId}/reviews`, { auth: false }).then(setRows).catch(() => setRows([])); }, [productId]);
  if (!rows) return null;
  const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : 0;
  const stars = (n) => `${'★'.repeat(n)}${'☆'.repeat(5 - n)}`;
  return (
    <section className="esc-reviews">
      <h2>Ratings & reviews</h2>
      {!rows.length ? <p className="esc-muted">No ratings yet. Buyers rate after delivery, from their order.</p> : <>
        <p className="esc-reviews-avg"><b>{avg.toFixed(1)}</b> <span className="esc-stars static">{stars(Math.round(avg))}</span> · {rows.length} rating{rows.length === 1 ? '' : 's'} from verified buyers</p>
        {rows.slice(0, 20).map((r) => (
          <article key={r._id} className="esc-review">
            <div><span className="esc-stars static">{stars(r.rating)}</span> <b>{r.buyer?.fullName}</b> · <small>Verified purchase · {new Date(r.createdAt).toLocaleDateString()}</small></div>
            {(r.sellerRating || r.deliveredOnTime !== null || r.asDescribed !== null) && <small className="esc-muted">{[r.sellerRating && `Seller: ${stars(r.sellerRating)}`, r.deliveredOnTime === true && 'Arrived on time', r.deliveredOnTime === false && 'Arrived late', r.asDescribed === true && 'As described', r.asDescribed === false && 'Not as described'].filter(Boolean).join(' · ')}</small>}
            {r.comment && <p>{r.comment}</p>}
            {r.sellerResponse && <p className="esc-reply"><b>Seller:</b> {r.sellerResponse}</p>}
          </article>
        ))}
      </>}
    </section>
  );
}

// ---------------------------------------------------------------- buyer: one order as a card
export function BuyerOrderCard({ o, onFlash, onDone, PayButton }) {
  const [qty, setQty] = useState(null), [ship, setShip] = useState(null), [busy, setBusy] = useState(false);
  const digital = Boolean(o.product?.digital?.fileName);
  const unpaid = o.paymentStatus === 'pending' && o.status === 'pending';
  const canCancelNow = !['cancelled', 'refunded', 'completed'].includes(o.status) && (unpaid || (o.escrow?.status === 'held' && ['pending', 'confirmed'].includes(o.status)));
  const canAsk = !canCancelNow && ['processing', 'shipped'].includes(o.status) && !o.cancellationRequested && o.status !== 'shipped';
  async function call(path, method, body, done) {
    setBusy(true);
    try { await apiRequest(path, { method, body }); onFlash(done, 'success'); setQty(null); setShip(null); onDone(); } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  async function cancel() {
    const reason = await showPrompt(o.paymentStatus === 'paid' ? 'Cancel this order? CareerZ refunds your payment. Tell the seller why (optional).' : 'Cancel this order? Tell the seller why (optional).', { title: 'Cancel order', placeholder: 'Reason', confirmLabel: 'Cancel order', danger: true });
    if (reason === null) return;
    call(`/marketplace/orders/${o._id}/cancel`, 'POST', { reason }, 'Order cancelled. The seller has been told.');
  }
  async function ask() {
    const reason = await showPrompt('The seller has started on your order. Ask them to cancel it, and say why.', { title: 'Ask to cancel', placeholder: 'Reason', required: true });
    if (!reason) return;
    call(`/marketplace/orders/${o._id}/request-cancellation`, 'POST', { reason }, 'Request sent to the seller.');
  }
  return (
    <article className="card esc-order">
      <div className="esc-order-top">
        <div><strong>{o.product?.title || 'Item'}</strong><small className="esc-muted">Order {String(o._id).slice(-8).toUpperCase()} · {o.quantity} × {o.currency} {Number(o.unitPrice).toLocaleString()} = <b>{o.currency} {Number(o.totalPrice).toLocaleString()}</b> · {new Date(o.createdAt).toLocaleDateString()}</small></div>
        <div className="esc-order-chips"><span className="esc-chip">{STEP[o.status] || o.status}</span>{!o.escrow?.status && <span className={`esc-chip ${o.paymentStatus === 'paid' ? 'good' : 'warn'}`}>{o.paymentStatus === 'paid' ? 'Paid' : o.status === 'cancelled' ? 'Not paid' : 'Waiting for your payment'}</span>}</div>
      </div>
      {!digital && o.shipping?.name && !ship && <div className="esc-order-ship"><b>Delivering to</b><span>{o.shipping.name} · {o.shipping.phone}</span><span>{[o.shipping.address, o.shipping.landmark, o.shipping.city, o.shipping.province].filter(Boolean).join(', ')}</span>{['pending', 'confirmed', 'processing'].includes(o.status) && <button type="button" className="esc-link" onClick={() => setShip({ ...EMPTY_SHIPPING, ...o.shipping })}>Change delivery details</button>}</div>}
      {ship && <div className="esc-edit"><ShippingFields value={ship} onChange={setShip} /><div className="esc-actions"><button type="button" className="btn btn-primary" disabled={busy} onClick={() => call(`/marketplace/orders/${o._id}/shipping`, 'PATCH', { shipping: ship }, 'Delivery details updated. The seller has been told.')}>Save</button><button type="button" className="btn" onClick={() => setShip(null)}>Back</button></div></div>}
      {unpaid && (qty === null
        ? <div className="esc-actions">{PayButton && <PayButton o={o} />}<button type="button" className="btn" onClick={() => setQty(o.quantity)}>Change quantity</button></div>
        : <div className="esc-actions"><label className="esc-qty">Quantity<input className="form-input" type="number" min={1} max={100} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></label><button type="button" className="btn btn-primary" disabled={busy} onClick={() => call(`/marketplace/orders/${o._id}/quantity`, 'PATCH', { quantity: qty }, 'Quantity updated.')}>Save</button><button type="button" className="btn" onClick={() => setQty(null)}>Back</button></div>)}
      <BuyerEscrowActions o={o} onFlash={onFlash} onDone={onDone} />
      <OrderTracking o={o} />
      <RateOrder o={o} onFlash={onFlash} onDone={onDone} />
      {o.cancellationRequested && <small className="esc-muted">You asked the seller to cancel. Waiting for their answer.</small>}
      <div className="esc-actions">
        {canCancelNow && <button type="button" className="btn staff-remove" disabled={busy} onClick={cancel}>Cancel order</button>}
        {canAsk && <button type="button" className="btn" disabled={busy} onClick={ask}>Ask seller to cancel</button>}
        <OrderThread orderId={o._id} onFlash={onFlash} label="Message the seller" />
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- seller: one order as a card
const COURIERS = ['TCS', 'Leopards', 'M&P', 'PostEx', 'Trax', 'BlueEx', 'Call Courier', 'Pakistan Post', 'Own delivery'];
const SELLER_NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['processing', 'shipped', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [] };
const NEXT_LABEL = { confirmed: 'Confirm order', processing: 'Start packing', shipped: 'Ship parcel', delivered: 'Mark delivered (no code)', cancelled: 'Cancel order' };
export function SellerOrderCard({ o, onFlash, onDone }) {
  const [ship, setShip] = useState(null), [busy, setBusy] = useState(false);
  const s = o.shipping || {};
  const digital = Boolean(o.product?.digital?.fileName);
  const paid = o.paymentStatus === 'paid';
  const lastNote = (o.timeline || []).filter((t) => t.status === 'cancelled').at(-1)?.note;
  async function move(status, extra = {}) {
    if (status === 'cancelled' && !(await showConfirm(paid ? 'Cancel this paid order? CareerZ refunds the buyer and you are not paid.' : 'Cancel this order?', { title: 'Cancel order', confirmLabel: 'Cancel order', danger: true }))) return;
    setBusy(true);
    try { await apiRequest(`/marketplace/orders/${o._id}/status`, { method: 'PATCH', body: { status, ...extra } }); onFlash('Order updated. The buyer has been told.', 'success'); setShip(null); onDone(); }
    catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  async function answer(kind, approve) {
    try { await apiRequest(`/marketplace/orders/${o._id}/${kind}-response`, { method: 'PATCH', body: { approve } }); onFlash(approve ? 'Done. The buyer has been told.' : 'Declined.', 'success'); onDone(); } catch (e) { onFlash(e.message); }
  }
  const next = (SELLER_NEXT[o.status] || []).filter((x) => !(digital && ['processing', 'shipped', 'delivered'].includes(x)));
  return (
    <article className="card esc-order">
      <div className="esc-order-top">
        <div><strong>{o.product?.title}</strong><small className="esc-muted">Order {String(o._id).slice(-8).toUpperCase()} · {o.quantity} × {o.currency} {Number(o.unitPrice).toLocaleString()} = <b>{o.currency} {Number(o.totalPrice).toLocaleString()}</b> · {new Date(o.createdAt).toLocaleDateString()} · buyer {o.buyer?.fullName}</small></div>
        <div className="esc-order-chips"><span className="esc-chip">{STEP[o.status] || o.status}</span>{o.escrow?.status ? <EscrowChip o={o} /> : <span className={`esc-chip ${paid ? 'good' : 'warn'}`}>{paid ? 'Paid' : o.status === 'cancelled' ? 'Not paid' : 'Waiting for payment'}</span>}</div>
      </div>
      {o.status === 'cancelled' && <div className="esc-dispute open"><strong>Order cancelled</strong><p>{lastNote || 'No reason given.'}</p><small>Stock for this order was put back on your listing. You can message the buyer to ask why.</small></div>}
      {!digital && (s.name || o.shippingAddress) && (
        <div className="esc-order-ship">
          <b>Send to</b>
          <span>{s.name}{s.phone && <> · <a href={`tel:${s.phone}`}>{s.phone}</a></>}{s.cnic && <> · CNIC {s.cnic}</>}</span>
          <span>{[s.address, s.landmark, s.city, s.province, s.postalCode].filter(Boolean).join(', ') || o.shippingAddress}</span>
          {s.locationUrl && <a href={s.locationUrl} target="_blank" rel="noreferrer">Open location</a>}
          {o.note && <span className="esc-muted">Buyer's note: {o.note}</span>}
        </div>
      )}
      {!paid && !['cancelled', 'refunded'].includes(o.status) && <p className="esc-muted" style={{ margin: 0 }}>Do not send anything yet: wait until CareerZ confirms the buyer's payment.</p>}
      {o.cancellationRequested && <div className="esc-dispute open"><strong>The buyer asked to cancel</strong>{o.cancellationReason && <p>{o.cancellationReason}</p>}<div className="esc-actions"><button type="button" className="btn btn-primary" onClick={() => answer('cancellation', true)}>Agree and cancel</button><button type="button" className="btn" onClick={() => answer('cancellation', false)}>Decline</button></div></div>}
      {o.refundRequested && <div className="esc-dispute open"><strong>The buyer asked for a refund/return</strong>{o.refundReason && <p>{o.refundReason}</p>}<div className="esc-actions"><button type="button" className="btn btn-primary" onClick={() => answer('refund', true)}>Approve</button><button type="button" className="btn" onClick={() => answer('refund', false)}>Decline</button></div></div>}
      <OrderTracking o={o} />
      {paid && next.length > 0 && !ship && <div className="esc-actions">{next.map((n) => <button key={n} type="button" className={n === 'cancelled' ? 'btn staff-remove' : n === 'shipped' ? 'btn btn-primary' : 'btn'} disabled={busy} onClick={() => (n === 'shipped' ? setShip({ courier: 'TCS', trackingNo: '', trackingUrl: '' }) : move(n))}>{NEXT_LABEL[n]}</button>)}</div>}
      {!paid && o.status === 'pending' && <div className="esc-actions"><button type="button" className="btn staff-remove" disabled={busy} onClick={() => move('cancelled')}>Cancel order</button></div>}
      {ship && (
        <div className="esc-shipform">
          <label>Courier<select className="form-select" value={ship.courier} onChange={(e) => setShip({ ...ship, courier: e.target.value })}>{COURIERS.map((c) => <option key={c}>{c}</option>)}</select></label>
          {ship.courier !== 'Own delivery' && <label>Tracking number<input className="form-input" value={ship.trackingNo} onChange={(e) => setShip({ ...ship, trackingNo: e.target.value })} placeholder="e.g. 1234567890" /></label>}
          {ship.courier !== 'Own delivery' && <label>Tracking link (optional)<input className="form-input" type="url" value={ship.trackingUrl} onChange={(e) => setShip({ ...ship, trackingUrl: e.target.value })} placeholder="https://…" /></label>}
          <div className="esc-actions"><button type="button" className="btn btn-primary" disabled={busy} onClick={() => move('shipped', ship)}>Save: parcel shipped</button><button type="button" className="btn" onClick={() => setShip(null)}>Back</button></div>
        </div>
      )}
      <SellerEscrowActions o={o} onFlash={onFlash} onDone={onDone} />
      <div className="esc-actions"><OrderThread orderId={o._id} onFlash={onFlash} label="Message the buyer" /></div>
    </article>
  );
}

// Seller orders with filters and a CSV of all sales.
const ORDER_FILTERS = [['todo', 'To do'], ['shipped', 'Shipped'], ['done', 'Completed'], ['cancelled', 'Cancelled'], ['all', 'All']];
export function SellerOrdersBoard({ onFlash }) {
  const [orders, setOrders] = useState(null), [f, setF] = useState('todo');
  function load() { apiRequest('/marketplace/orders/selling').then(setOrders).catch((e) => { setOrders([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  const matchKey = (o, k) => k === 'all' || (k === 'todo' ? ['pending', 'confirmed', 'processing'].includes(o.status) || o.cancellationRequested || o.refundRequested || o.dispute?.open
    : k === 'shipped' ? ['shipped', 'delivered'].includes(o.status) : k === 'done' ? o.status === 'completed' : ['cancelled', 'refunded'].includes(o.status));
  function csv() {
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Order', 'Date', 'Item', 'Qty', 'Total', 'Currency', 'Status', 'Payment', 'Receiver', 'Phone', 'City', 'Courier', 'Tracking']].concat((orders || []).map((o) => [String(o._id).slice(-8).toUpperCase(), new Date(o.createdAt).toISOString().slice(0, 10), o.product?.title, o.quantity, o.totalPrice, o.currency, o.status, o.escrow?.status || o.paymentStatus, o.shipping?.name, o.shipping?.phone, o.shipping?.city, o.shipment?.courier, o.shipment?.trackingNo]));
    const url = URL.createObjectURL(new Blob([`﻿${rows.map((r) => r.map(cell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'my-sales.csv'; a.click(); URL.revokeObjectURL(url);
  }
  const shown = (orders || []).filter((o) => matchKey(o, f));
  return (
    <div className="esc-orders">
      <div className="esc-order-filters">
        <nav className="cz-tabbar">{ORDER_FILTERS.map(([k, l]) => <button key={k} type="button" className={`cz-tab${f === k ? ' active' : ''}`} aria-pressed={f === k} onClick={() => setF(k)}>{l} ({(orders || []).filter((o) => matchKey(o, k)).length})</button>)}</nav>
        {orders?.length > 0 && <button type="button" className="btn" onClick={csv}>Download sales (CSV)</button>}
      </div>
      {orders === null ? <p>Loading…</p> : !shown.length ? <p className="esc-muted">No orders here.</p> : shown.map((o) => <SellerOrderCard key={o._id} o={o} onFlash={onFlash} onDone={load} />)}
    </div>
  );
}

// Buyer orders list (dashboard and /my-orders).
export function BuyerOrdersList({ onFlash, PayButton }) {
  const [orders, setOrders] = useState(null);
  function load() { apiRequest('/marketplace/orders/mine').then(setOrders).catch((e) => { setOrders([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (orders === null) return <p>Loading…</p>;
  if (!orders.length) return <p className="esc-muted">No orders yet. Browse the marketplace and order an item.</p>;
  return <div className="esc-orders">{orders.map((o) => <BuyerOrderCard key={o._id} o={o} onFlash={onFlash} onDone={load} PayButton={PayButton ? (p) => <PayButton {...p} onDone={load} /> : null} />)}</div>;
}

// ---------------------------------------------------------------- seller report
export function SellerReportPanel({ onFlash }) {
  const [d, setD] = useState(null);
  useEffect(() => { apiRequest('/marketplace/sellers/mine/report').then(setD).catch((e) => { setD({ totals: {}, products: [], months: [] }); onFlash(e.message); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p>Loading…</p>;
  const t = d.totals;
  const max = Math.max(1, ...d.months.map((m) => m.revenue));
  const money = (n) => `PKR ${Math.round(n || 0).toLocaleString()}`;
  return (
    <div className="esc-admin">
      <div className="esc-admin-tiles esc-report-tiles">
        {[['Revenue', money(t.revenue)], ['Units sold', t.unitsSold || 0], ['Paid orders', t.paidOrders || 0], ['All orders', t.orders || 0], ['Cancelled', t.cancelled || 0], ['Live listings', t.listings || 0]].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}
      </div>
      {d.bestSeller && <div className="esc-best"><span>Best seller</span><strong>{d.bestSeller.title}</strong><small>{d.bestSeller.unitsSold} sold · {money(d.bestSeller.revenue)}</small></div>}
      <section className="card esc-admin-card"><h3 style={{ margin: 0 }}>Last 12 months</h3>
        <div className="esc-bars">{d.months.map((m) => <div key={m.month} title={`${m.month}: ${money(m.revenue)}, ${m.orders} orders`}><span style={{ height: `${Math.round((m.revenue / max) * 100)}%` }} /><small>{m.month.slice(5)}</small></div>)}</div>
      </section>
      <section className="card esc-admin-card"><h3 style={{ margin: 0 }}>Each product</h3>
        {!d.products.length ? <p className="esc-muted">No listings yet.</p> : (
          <div className="esc-report-cards">
            {d.products.map((p, i) => (
              <div key={p._id} className="esc-report-card">
                <div className="esc-admin-top"><strong>{i === 0 && p.unitsSold > 0 ? '🏆 ' : ''}{p.title}</strong><span className="esc-chip">{p.status.replace('_', ' ')}</span></div>
                <dl>
                  <div><dt>Sold</dt><dd>{p.unitsSold}</dd></div><div><dt>Revenue</dt><dd>{money(p.revenue)}</dd></div><div><dt>Orders</dt><dd>{p.orders}</dd></div>
                  <div><dt>Cancelled</dt><dd>{p.cancelled}</dd></div><div><dt>Views</dt><dd>{p.views}</dd></div><div><dt>Rating</dt><dd>{p.rating ? `${p.rating} ★ (${p.ratings})` : '—'}</dd></div>
                  <div><dt>Stock</dt><dd>{p.stock}</dd></div><div><dt>View → order</dt><dd>{p.conversion != null ? `${p.conversion}%` : '—'}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
