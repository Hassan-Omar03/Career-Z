import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import useUrlTab from '../../hooks/useUrlTab';
import { uploadToPlatformStorage } from '../../utils/platformUpload';
import OrderWorkspace from './OrderWorkspace';
import { CATEGORY_LABEL, TIER_LABEL, money, Reputation } from './shared';

const TABS = [['orders', 'My Orders'], ['services', 'My Services'], ['proposals', 'Proposals'], ['profile', 'Freelancer Profile'], ['earnings', 'Earnings']];
const STATUS_LABEL = { active: 'Active', paused: 'Paused', pending_review: 'CareerZ is checking it', removed: 'Removed by CareerZ', completed: 'Completed', cancelled: 'Cancelled', disputed: 'In dispute', submitted: 'Sent', accepted: 'Accepted', declined: 'Declined', withdrawn: 'Withdrawn' };

function Orders({ onFlash }) {
  const [rows, setRows] = useState(null);
  const location = useLocation(), navigate = useNavigate();
  const open = new URLSearchParams(location.search).get('order');
  const setOpen = (id) => { const q = new URLSearchParams(window.location.search); if (id) q.set('order', id); else q.delete('order'); navigate({ search: `?${q}` }); };
  useEffect(() => { if (!open) apiRequest('/freelance/orders').then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (open) return <OrderWorkspace id={open} onBack={() => setOpen('')} onFlash={onFlash} />;
  if (!rows) return <p>Loading…</p>;
  if (!rows.length) return <section className="card fl-card"><p>No orders yet.</p><Link className="btn btn-primary fl-self-start" to="/freelance">Browse services</Link></section>;
  return (
    <div className="fl-list">{rows.map((o) => {
      const paid = o.milestones.filter((m) => m.status === 'approved').length;
      return (
        <button key={o._id} type="button" className="card fl-row" onClick={() => setOpen(o._id)}>
          <span><strong>{o.title}</strong><span className="fl-muted">{o.role === 'client' ? `Freelancer: ${o.seller?.fullName}` : `Client: ${o.buyer?.fullName}`} · {paid} of {o.milestones.length} milestones paid</span></span>
          <span className="vf-badge vf-neutral">{STATUS_LABEL[o.status] || o.status}</span>
        </button>
      );
    })}</div>
  );
}

const blankPackages = () => ['basic', 'standard', 'premium'].map((tier) => ({ tier, name: '', price: '', deliveryDays: '', revisions: '', includes: '' }));
function ServiceForm({ initial, onSaved, onCancel, onFlash }) {
  const [form, setForm] = useState(() => initial ? { ...initial, packages: blankPackages().map((p) => ({ ...p, ...(initial.packages.find((x) => x.tier === p.tier) || {}) })) } : { title: '', category: 'online_tuition', description: '', image: '', currency: 'PKR', packages: blankPackages() });
  const [busy, setBusy] = useState(false);
  const setPack = (tier, key, value) => setForm((f) => ({ ...f, packages: f.packages.map((p) => (p.tier === tier ? { ...p, [key]: value } : p)) }));
  async function image(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return onFlash('Choose a JPG, PNG or WEBP image.');
    if (file.size > 5 * 1048576) return onFlash('The image must be 5 MB or smaller.');
    try { const url = await uploadToPlatformStorage(file, 'freelance'); setForm((f) => ({ ...f, image: url })); } catch (err) { onFlash(err.message); }
    return undefined;
  }
  async function save(e) {
    e.preventDefault(); setBusy(true);
    const body = { ...form, packages: form.packages.filter((p) => p.price !== '').map((p) => ({ ...p, price: Number(p.price), deliveryDays: Number(p.deliveryDays), revisions: Number(p.revisions || 0) })) };
    try {
      const saved = await apiRequest(initial ? `/freelance/services/${initial._id}` : '/freelance/services', { method: initial ? 'PATCH' : 'POST', body });
      onFlash(saved.status === 'pending_review' ? 'Saved. The automatic check asked CareerZ to look at it first.' : 'Saved. Your service is live.', 'success');
      onSaved();
    } catch (err) { onFlash(err.message); }
    setBusy(false);
  }
  return (
    <form className="card fl-card" onSubmit={save}>
      <h3>{initial ? 'Edit service' : 'New service'}</h3>
      <label className="hiring-field"><span>Title</span><input className="form-input" required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="For example Online maths tuition for matric" /></label>
      <label className="hiring-field"><span>Category</span><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="hiring-field"><span>Description</span><textarea className="form-input" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="hiring-field">
        <span>Image (optional)</span>
        {form.image && <img className="fl-thumb" src={form.image} alt="" />}
        <label className="btn btn-ghost btn-sm fl-self-start">{form.image ? 'Change image' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={image} /></label>
      </div>
      <div className="fl-scroll"><table className="fl-table">
        <thead><tr><th>Package</th><th>Name</th><th>Price ({form.currency})</th><th>Delivery days</th><th>Revisions</th><th>What is included</th></tr></thead>
        <tbody>{form.packages.map((p) => (
          <tr key={p.tier}>
            <th scope="row">{TIER_LABEL[p.tier]}</th>
            <td><input className="form-input" aria-label={`${p.tier} name`} value={p.name} onChange={(e) => setPack(p.tier, 'name', e.target.value)} /></td>
            <td><input className="form-input" aria-label={`${p.tier} price`} type="number" min="1" value={p.price} onChange={(e) => setPack(p.tier, 'price', e.target.value)} /></td>
            <td><input className="form-input" aria-label={`${p.tier} delivery days`} type="number" min="1" max="365" value={p.deliveryDays} onChange={(e) => setPack(p.tier, 'deliveryDays', e.target.value)} /></td>
            <td><input className="form-input" aria-label={`${p.tier} revisions`} type="number" min="0" max="50" value={p.revisions} onChange={(e) => setPack(p.tier, 'revisions', e.target.value)} /></td>
            <td><input className="form-input" aria-label={`${p.tier} includes`} value={p.includes} onChange={(e) => setPack(p.tier, 'includes', e.target.value)} /></td>
          </tr>
        ))}</tbody>
      </table></div>
      <p className="fl-muted">Fill at least one package. Leave a package's price empty to skip it.</p>
      <div className="fl-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save service'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
function Services({ onFlash }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(null);
  const load = () => apiRequest('/freelance/my/services').then(setRows).catch((e) => { setRows([]); onFlash(e.message); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function toggle(s) {
    try { await apiRequest(`/freelance/services/${s._id}/status`, { method: 'POST', body: { status: s.status === 'active' ? 'paused' : 'active' } }); load(); } catch (e) { onFlash(e.message); }
  }
  if (form) return <ServiceForm initial={form === 'new' ? null : form} onFlash={onFlash} onCancel={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />;
  return (
    <div className="fl-list">
      <button type="button" className="btn btn-primary fl-self-start" onClick={() => setForm('new')}>New service</button>
      {rows === null ? <p>Loading…</p> : !rows.length ? <section className="card fl-card"><p>You have no services yet. Add one and clients can order it.</p></section> : rows.map((s) => (
        <div key={s._id} className="card fl-row">
          <span><strong>{s.title}</strong><span className="fl-muted">{CATEGORY_LABEL[s.category]} · from {money(s.currency, Math.min(...s.packages.map((p) => p.price)))}</span>{s.adminRemoval?.reason && <span className="vf-error">Reason: {s.adminRemoval.reason}</span>}</span>
          <span className="fl-actions">
            <span className="vf-badge vf-neutral">{STATUS_LABEL[s.status]}</span>
            {s.status === 'active' && <Link className="btn btn-ghost btn-sm" to={`/freelance/${s._id}`}>View</Link>}
            {s.status !== 'removed' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(s)}>Edit</button>}
            {['active', 'paused'].includes(s.status) && <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggle(s)}>{s.status === 'active' ? 'Pause' : 'Resume'}</button>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Proposals({ onFlash }) {
  const [sent, setSent] = useState(null), [received, setReceived] = useState(null);
  const navigate = useNavigate();
  const load = () => {
    apiRequest('/freelance/proposals/sent').then(setSent).catch(() => setSent([]));
    apiRequest('/freelance/proposals/received').then(setReceived).catch(() => setReceived([]));
  };
  useEffect(load, []);
  async function decide(p, decision) {
    try {
      const r = await apiRequest(`/freelance/proposals/${p._id}/decision`, { method: 'POST', body: { decision } });
      if (r.order) navigate(`/dashboard?tab=freelance&order=${r.order._id}`); else load();
    } catch (e) { onFlash(e.message); }
  }
  async function withdraw(p) { try { await apiRequest(`/freelance/proposals/${p._id}/withdraw`, { method: 'POST' }); load(); } catch (e) { onFlash(e.message); } }
  const Steps = ({ p }) => <ol className="fl-mini">{p.milestones.map((m, i) => <li key={i}>{m.title}: {money(p.currency, m.amount)}</li>)}</ol>;
  if (!sent || !received) return <p>Loading…</p>;
  return (
    <div className="fl-list">
      <section className="card fl-card">
        <h3>Received on my freelance jobs</h3>
        {!received.length ? <p className="fl-muted">When you post a job with the type Freelance, proposals appear here.</p> : received.map((p) => (
          <div key={p._id} className="fl-box">
            <strong>{p.job?.title}: <Link to={`/freelancer/${p.freelancer?._id}`}>{p.freelancer?.fullName}</Link> offers {money(p.currency, p.fee)}</strong>
            <p>{p.coverLetter}</p>
            <Steps p={p} />
            {p.attachments?.map((f) => <a key={f.url} href={f.url} target="_blank" rel="noreferrer">{f.name}</a>)}
            <Reputation data={p.reputation} />
            {p.status === 'submitted' ? <div className="fl-actions"><button type="button" className="btn btn-primary" onClick={() => decide(p, 'accept')}>Accept</button><button type="button" className="btn btn-ghost" onClick={() => decide(p, 'decline')}>Decline</button></div> : <span className="vf-badge vf-neutral fl-self-start">{STATUS_LABEL[p.status]}</span>}
          </div>
        ))}
      </section>
      <section className="card fl-card">
        <h3>Sent by me</h3>
        {!sent.length ? <p className="fl-muted">Open a job with the type Freelance and send a proposal from its page. <Link to="/jobs?type=freelance">See freelance jobs</Link></p> : sent.map((p) => (
          <div key={p._id} className="fl-box">
            <strong>{p.job?.title}: {money(p.currency, p.fee)}</strong>
            <Steps p={p} />
            <div className="fl-actions"><span className="vf-badge vf-neutral">{STATUS_LABEL[p.status]}</span>{p.status === 'submitted' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => withdraw(p)}>Withdraw</button>}{p.order && <Link className="btn btn-ghost btn-sm" to={`/dashboard?tab=freelance&order=${p.order}`}>Open order</Link>}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Profile({ onFlash }) {
  const [form, setForm] = useState(null), [types, setTypes] = useState([]);
  useEffect(() => {
    apiRequest('/freelance/profile/me').then((p) => setForm({ ...p, skillsText: (p.skills || []).join(', '), portfolio: p.portfolio || [] })).catch((e) => onFlash(e.message));
    apiRequest('/freelance/options', { auth: false }).then((o) => setTypes(o.types)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!form) return <p>Loading…</p>;
  const setItem = (i, key, value) => setForm((f) => ({ ...f, portfolio: f.portfolio.map((p, n) => (n === i ? { ...p, [key]: value } : p)) }));
  async function save(e) {
    e.preventDefault();
    try { await apiRequest('/freelance/profile/me', { method: 'PUT', body: { type: form.type, headline: form.headline, about: form.about, skills: form.skillsText.split(',').map((s) => s.trim()).filter(Boolean), portfolio: form.portfolio.filter((p) => p.title || p.url) } }); onFlash('Profile saved.', 'success'); } catch (err) { onFlash(err.message); }
  }
  return (
    <form className="card fl-card" onSubmit={save}>
      <h3>Freelancer profile</h3>
      <label className="hiring-field"><span>What you offer</span><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{types.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label className="hiring-field"><span>Headline</span><input className="form-input" maxLength={120} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></label>
      <label className="hiring-field"><span>About you</span><textarea className="form-input" rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></label>
      <label className="hiring-field"><span>Skills (comma separated)</span><input className="form-input" value={form.skillsText} onChange={(e) => setForm({ ...form, skillsText: e.target.value })} /></label>
      <div className="hiring-field">
        <span>Portfolio</span>
        {form.portfolio.map((p, i) => (
          <div key={i} className="fl-actions">
            <input className="form-input fl-grow" aria-label="Portfolio title" placeholder="Title" value={p.title} onChange={(e) => setItem(i, 'title', e.target.value)} />
            <input className="form-input fl-grow" aria-label="Portfolio link" placeholder="https://" value={p.url} onChange={(e) => setItem(i, 'url', e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, portfolio: form.portfolio.filter((_, n) => n !== i) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm fl-self-start" onClick={() => setForm({ ...form, portfolio: [...form.portfolio, { title: '', url: '' }] })}>Add portfolio item</button>
      </div>
      <button type="submit" className="btn btn-primary fl-self-start">Save profile</button>
    </form>
  );
}

function Earnings({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/freelance/earnings').then(setData).catch((e) => { setData({ totals: [] }); onFlash(e.message); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return <p>Loading…</p>;
  return (
    <section className="card fl-card">
      <h3>Earnings</h3>
      <p className="fl-muted">Paid milestones go to your wallet, and you withdraw from there.</p>
      {!data.totals.length ? <p>No earnings yet.</p> : <dl className="dp-facts fl-facts">{data.totals.flatMap((t) => [
        <div key={`${t.currency}r`}><dt>In your wallet from freelancing</dt><dd>{money(t.currency, t.released)}</dd></div>,
        <div key={`${t.currency}h`}><dt>Held by CareerZ</dt><dd>{money(t.currency, t.held)}</dd></div>,
        <div key={`${t.currency}w`}><dt>Waiting for client payment</dt><dd>{money(t.currency, t.waiting)}</dd></div>
      ])}</dl>}
      {data.history?.length > 0 && <>
        <h3>Payments received</h3>
        <div className="fl-scroll"><table className="fl-table"><thead><tr><th>Date</th><th>For</th><th>Amount</th></tr></thead><tbody>{data.history.map((h) => <tr key={h._id}><td>{new Date(h.createdAt).toLocaleDateString()}</td><td>{h.note}</td><td>{money(h.currency, h.amount)}</td></tr>)}</tbody></table></div>
      </>}
      <h3>Reputation</h3>
      <Reputation data={data.reputation} />
    </section>
  );
}

// In every account type's dashboard: any verified user can buy and sell services.
export default function FreelanceHub({ onFlash }) {
  const [tab, setTab] = useUrlTab('freelanceHub', 'orders');
  return (
    <div className="fl-hub">
      <div className="fl-hub-head">
        <div><h2>Freelancer Hub</h2><p className="fl-muted">Offer your services, or hire someone. CareerZ holds each payment until the work is approved.</p></div>
        <Link className="btn btn-outline" to="/freelance">Browse services</Link>
      </div>
      <nav className="cz-tabbar" aria-label="Freelancer Hub sections">{TABS.map(([k, label]) => <button key={k} type="button" className={`cz-tab${tab === k ? ' active' : ''}`} aria-pressed={tab === k} onClick={() => setTab(k)}>{label}</button>)}</nav>
      {tab === 'orders' && <Orders onFlash={onFlash} />}
      {tab === 'services' && <Services onFlash={onFlash} />}
      {tab === 'proposals' && <Proposals onFlash={onFlash} />}
      {tab === 'profile' && <Profile onFlash={onFlash} />}
      {tab === 'earnings' && <Earnings onFlash={onFlash} />}
    </div>
  );
}
