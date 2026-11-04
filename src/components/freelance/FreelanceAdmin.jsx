import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { showPrompt } from '../../utils/appDialog';
import { money, CATEGORY_LABEL } from './shared';

// Super Admin: disputes, services the automatic check held, and every order.
export default function FreelanceAdmin({ onFlash }) {
  const [data, setData] = useState(null);
  const load = () => apiRequest('/freelance/admin/overview').then(setData).catch((e) => { setData({ disputes: [], services: [], orders: [] }); onFlash(e.message); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(d, decision) {
    const note = await showPrompt(decision === 'release' ? 'Why is the freelancer paid? Both sides see this.' : 'Why is the client refunded? Both sides see this.', { title: decision === 'release' ? 'Pay the freelancer' : 'Refund the client' });
    if (!note) return;
    try { await apiRequest(`/freelance/admin/disputes/${d._id}`, { method: 'POST', body: { decision, note } }); onFlash('Decision saved.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function service(s, action) {
    const reason = action === 'remove' ? await showPrompt(`Why are you removing "${s.title}"? The owner sees this.`, { title: 'Remove service' }) : '';
    if (action === 'remove' && !reason) return;
    try { await apiRequest(`/freelance/admin/services/${s._id}`, { method: 'POST', body: { action, reason } }); onFlash('Saved.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  if (!data) return <p>Loading…</p>;
  const open = data.disputes.filter((d) => d.status === 'open');
  const held = data.services.filter((s) => s.status === 'pending_review');
  return (
    <div className="fl-list">
      {data.totals?.length > 0 && (
        <section className="card fl-card">
          <h3>Money</h3>
          <dl className="dp-facts fl-facts">{data.totals.flatMap((t) => [
            <div key={`${t.currency}h`}><dt>CareerZ is holding</dt><dd>{money(t.currency, t.held)}</dd></div>,
            <div key={`${t.currency}r`}><dt>Paid to freelancers</dt><dd>{money(t.currency, t.released)}</dd></div>,
            <div key={`${t.currency}x`}><dt>Refunded to clients</dt><dd>{money(t.currency, t.refunded)}</dd></div>,
            <div key={`${t.currency}f`}><dt>CareerZ fees</dt><dd>{money(t.currency, t.fees)}</dd></div>
          ])}</dl>
        </section>
      )}
      <section className="card fl-card">
        <h3>Open disputes ({open.length})</h3>
        {!open.length ? <p className="fl-muted">No open disputes.</p> : open.map((d) => (
          <div key={d._id} className="fl-box">
            <strong>{d.order?.title}: {d.milestoneRow?.title} ({money(d.order?.currency, d.milestoneRow?.amount)})</strong>
            <span className="fl-muted">Client {d.order?.buyer?.fullName} · Freelancer {d.order?.seller?.fullName} · Opened by {d.initiator?.fullName}</span>
            <p>{d.reason}</p>
            {d.evidence?.map((f) => <a key={f.url} href={f.url} target="_blank" rel="noreferrer">{f.name}</a>)}
            {(d.milestoneRow?.note || d.milestoneRow?.files?.length > 0) && <div className="fl-note"><strong>What the freelancer delivered</strong>{d.milestoneRow.note && <p>{d.milestoneRow.note}</p>}{d.milestoneRow.files?.map((f) => <a key={f.url} href={f.url} target="_blank" rel="noreferrer">{f.name}</a>)}</div>}
            {d.order?.messages?.length > 0 && <details><summary>Their messages ({d.order.messages.length})</summary><ul className="fl-log">{d.order.messages.map((m) => <li key={m._id}><strong>{m.from?.fullName}</strong> <span className="fl-muted">{new Date(m.at).toLocaleString()}</span><p>{m.text}</p></li>)}</ul></details>}
            <div className="fl-actions"><button type="button" className="btn btn-primary" onClick={() => decide(d, 'release')}>Pay the freelancer</button><button type="button" className="btn btn-outline" onClick={() => decide(d, 'refund')}>Refund the client</button></div>
          </div>
        ))}
      </section>
      <section className="card fl-card">
        <h3>Services held by the automatic check ({held.length})</h3>
        {!held.length ? <p className="fl-muted">Nothing is waiting.</p> : held.map((s) => (
          <div key={s._id} className="fl-box">
            <strong>{s.title}</strong><span className="fl-muted">{s.seller?.fullName} · {CATEGORY_LABEL[s.category]}</span>
            <span className="vf-error">{(s.moderation?.flags || []).map((f) => f.label).join(', ')}</span><p>{s.description}</p>
            <div className="fl-actions"><button type="button" className="btn btn-primary" onClick={() => service(s, 'approve')}>Allow</button><button type="button" className="btn btn-outline" onClick={() => service(s, 'remove')}>Remove</button></div>
          </div>
        ))}
      </section>
      <section className="card fl-card">
        <h3>All services</h3>
        <div className="fl-scroll"><table className="fl-table"><thead><tr><th>Service</th><th>Seller</th><th>Status</th><th aria-label="Actions" /></tr></thead>
          <tbody>{data.services.map((s) => <tr key={s._id}><td>{s.status === 'active' ? <Link to={`/freelance/${s._id}`}>{s.title}</Link> : s.title}</td><td>{s.seller?.fullName}</td><td>{s.status.replace('_', ' ')}</td><td>{s.status !== 'removed' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => service(s, 'remove')}>Remove</button>}</td></tr>)}</tbody></table></div>
      </section>
      <section className="card fl-card">
        <h3>Recent orders</h3>
        <div className="fl-scroll"><table className="fl-table"><thead><tr><th>Order</th><th>Client</th><th>Freelancer</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{data.orders.map((o) => <tr key={o._id}><td>{o.title}</td><td>{o.buyer?.fullName}</td><td>{o.seller?.fullName}</td><td>{money(o.currency, o.milestones.reduce((n, m) => n + m.amount, 0))}</td><td>{o.status}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
