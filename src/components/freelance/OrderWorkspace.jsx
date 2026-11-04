import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { ManualPayButton } from '../payments/ManualPay';
import { FilePicker, money, day } from './shared';

const STATUS = {
  pending: ['Waiting for payment', 'warn'], funded: ['In progress, CareerZ holds the money', 'info'], submitted: ['Delivered, waiting for the client', 'info'],
  revision: ['Changes requested', 'warn'], approved: ['Approved and paid', 'ok'], disputed: ['In dispute, CareerZ will decide', 'bad'], refunded: ['Refunded to the client', 'neutral']
};

function Milestone({ order, m, reload, act, onFlash }) {
  const client = order.role === 'client';
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState('');
  const [text, setText] = useState('');
  const [evidence, setEvidence] = useState([]);
  const base = `/freelance/orders/${order._id}/milestones/${m._id}`;
  const [label, tone] = STATUS[m.status] || [m.status, 'neutral'];
  const open = order.status === 'active' || order.status === 'disputed';
  return (
    <li className="fl-milestone">
      <div className="fl-milestone-head">
        <div><strong>{m.title}</strong><span className="fl-muted">{money(order.currency, m.amount)}{m.dueDate ? ` · due ${day(m.dueDate)}${['funded', 'revision'].includes(m.status) && new Date(m.dueDate) < new Date() ? ' (late)' : ''}` : m.deliveryDays ? ` · ${m.deliveryDays} days after payment` : ''}</span></div>
        <span className={`vf-badge vf-${tone}`}>{label}</span>
      </div>
      {m.revisionNote && <p className="fl-note"><strong>Changes needed:</strong> {m.revisionNote}</p>}
      {(m.note || m.files?.length > 0) && (
        <div className="fl-note">
          {m.note && <p>{m.note}</p>}
          {m.files?.map((f) => <a key={f.url} href={f.url} target="_blank" rel="noreferrer">{f.name}</a>)}
        </div>
      )}
      {open && client && m.status === 'pending' && order.status === 'active' && <div className="fl-self-start"><ManualPayButton kind="freelance_milestone" id={m._id} onFlash={onFlash} onDone={reload} label="Pay this milestone" /></div>}
      {open && client && m.status === 'submitted' && (
        <div className="fl-actions">
          <button type="button" className="btn btn-primary" onClick={() => act(`${base}/approve`, {}, 'Approved. The freelancer is paid.')}>Approve and release payment</button>
          <button type="button" className="btn btn-outline" onClick={() => setMode(mode === 'revision' ? '' : 'revision')}>Ask for changes</button>
        </div>
      )}
      {open && !client && ['funded', 'revision'].includes(m.status) && (
        <div className="fl-box">
          <label className="hiring-field"><span>Your delivery</span><textarea className="form-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What you finished, and anything the client should know" /></label>
          <FilePicker value={files} onChange={setFiles} onFlash={onFlash} label="Add deliverable files" />
          <button type="button" className="btn btn-primary" onClick={() => act(`${base}/submit`, { note, files }, 'Delivered. The client has been told.')}>Submit delivery</button>
        </div>
      )}
      {open && ['funded', 'submitted', 'revision'].includes(m.status) && <button type="button" className="btn btn-ghost btn-sm fl-self-start" onClick={() => setMode(mode === 'dispute' ? '' : 'dispute')}>Report a problem</button>}
      {mode && (
        <div className="fl-box">
          <label className="hiring-field"><span>{mode === 'revision' ? 'What needs to change?' : 'What went wrong? CareerZ holds the money and decides.'}</span><textarea className="form-input" rows={3} value={text} onChange={(e) => setText(e.target.value)} /></label>
          {mode === 'dispute' && <FilePicker value={evidence} onChange={setEvidence} onFlash={onFlash} label="Add evidence" />}
          <button type="button" className="btn btn-primary" onClick={() => act(mode === 'revision' ? `${base}/revision` : `${base}/dispute`, mode === 'revision' ? { note: text } : { reason: text, evidence }, mode === 'revision' ? 'Sent to the freelancer.' : 'Dispute opened.').then((ok) => { if (ok) { setMode(''); setText(''); } })}>Send</button>
        </div>
      )}
    </li>
  );
}

export default function OrderWorkspace({ id, onBack, onFlash }) {
  const [order, setOrder] = useState(null);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const load = () => apiRequest(`/freelance/orders/${id}`).then(setOrder).catch((e) => { onFlash(e.message); onBack(); });
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function act(path, body, done) {
    try { await apiRequest(path, { method: 'POST', body }); if (done) onFlash(done, 'success'); await load(); return true; } catch (e) { onFlash(e.message); return false; }
  }
  if (!order) return <p>Loading…</p>;
  const other = order.role === 'client' ? order.seller : order.buyer;
  const canCancel = order.status === 'active' && order.milestones.every((m) => m.status === 'pending');
  return (
    <div className="fl-order">
      <button type="button" className="btn btn-ghost btn-sm fl-self-start" onClick={onBack}>Back to orders</button>
      <section className="card fl-card">
        <h3>{order.title}</h3>
        <p className="fl-muted">{order.role === 'client' ? 'Freelancer' : 'Client'}: {other?.fullName}{order.packageTier ? ` · ${order.packageTier} package` : ''} · CareerZ is holding {money(order.currency, order.escrowBalance)}</p>
        <ol className="fl-milestones">{order.milestones.map((m) => <Milestone key={m._id} order={order} m={m} reload={load} act={act} onFlash={onFlash} />)}</ol>
        {order.disputes?.map((d) => (
          <div key={d._id} className="fl-note">
            <strong>{d.status === 'open' ? 'Dispute open: CareerZ is checking it' : d.status === 'resolved' ? 'Dispute decided: the freelancer was paid' : 'Dispute decided: the client was refunded'}</strong>
            <p>{d.initiator?.fullName}: {d.reason}</p>
            {d.evidence?.map((f) => <a key={f.url} href={f.url} target="_blank" rel="noreferrer">{f.name}</a>)}
            {d.resolution?.note && <p>CareerZ: {d.resolution.note}</p>}
          </div>
        ))}
        {canCancel && <button type="button" className="btn btn-ghost btn-sm fl-self-start" onClick={() => act(`/freelance/orders/${order._id}/cancel`, {}, 'Order cancelled.')}>Cancel this order</button>}
      </section>
      {order.role === 'client' && order.milestones.some((m) => m.status === 'approved') && (
        <section className="card fl-card">
          <h3>Review</h3>
          {order.review?.rating ? <p>{order.review.rating} of 5{order.review.text ? `: ${order.review.text}` : ''}</p> : (
            <div className="fl-box">
              <label className="hiring-field"><span>Rating</span><select className="form-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} of 5</option>)}</select></label>
              <label className="hiring-field"><span>Your review (optional)</span><textarea className="form-input" rows={2} value={reviewText} onChange={(e) => setReviewText(e.target.value)} /></label>
              <button type="button" className="btn btn-primary fl-self-start" onClick={() => act(`/freelance/orders/${order._id}/review`, { rating, text: reviewText }, 'Thanks for your review.')}>Post review</button>
            </div>
          )}
        </section>
      )}
      <section className="card fl-card">
        <h3>Messages</h3>
        <ul className="fl-log">{order.messages.length ? order.messages.map((m) => <li key={m._id}><strong>{m.from?.fullName || 'User'}</strong> <span className="fl-muted">{new Date(m.at).toLocaleString()}</span><p>{m.text}</p></li>) : <li className="fl-muted">No messages yet.</li>}</ul>
        <form className="fl-actions" onSubmit={async (e) => { e.preventDefault(); if (await act(`/freelance/orders/${order._id}/messages`, { text })) setText(''); }}>
          <input className="form-input fl-grow" aria-label="Message" placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </section>
    </div>
  );
}
