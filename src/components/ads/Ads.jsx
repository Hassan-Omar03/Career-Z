import { useEffect, useState } from 'react';
import { apiRequest, API_BASE } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';
import { ManualPayButton } from '../payments/ManualPay';
import '../../styles/ads.css';

// Super Admin Ad Management on the screens: the ad slot shown on allowed pages, the admin
// Ads desk, and the institute's "turn off ads" purchase. Live classes, exams, chat, wallet and
// payment screens never render an AdSlot (and the server refuses those placements anyway).

const PLACES = [['home', 'Home page'], ['blog', 'Blog'], ['courses', 'Courses'], ['institutes', 'Institutes'], ['jobs', 'Jobs'], ['marketplace', 'Marketplace'], ['dashboard', 'Dashboards']];
const date = (d) => (d ? new Date(d).toLocaleDateString() : '');
const readFile = (file) => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });

export function AdSlot({ placement, className = '' }) {
  const [ad, setAd] = useState(null);
  useEffect(() => { let on = true; apiRequest(`/ads/slot?placement=${placement}`).then((a) => on && setAd(a)).catch(() => {}); return () => { on = false; }; }, [placement]);
  if (!ad) return null;
  return (
    <a className={`ad-slot ${className}`} href={`${API_BASE}/ads/${ad._id}/go`} target="_blank" rel="noreferrer sponsored">
      {ad.image && <img src={ad.image} alt="" loading="lazy" />}
      <span className="ad-slot-body">
        <span className="ad-slot-tag">Ad{ad.advertiser ? ` · ${ad.advertiser}` : ''}</span>
        <strong>{ad.title}</strong>
        {ad.text && <span className="ad-slot-text">{ad.text}</span>}
      </span>
    </a>
  );
}

const blank = { title: '', advertiser: '', text: '', link: 'https://', image: '', placements: ['home'], startsAt: '', endsAt: '', active: true };

export function AdminAdsPanel({ onFlash }) {
  const [cfg, setCfg] = useState(null), [ads, setAds] = useState([]), [free, setFree] = useState([]), [form, setForm] = useState(null), [busy, setBusy] = useState(false);
  const load = () => {
    apiRequest('/ads/admin/config').then(setCfg).catch((e) => onFlash(e.message));
    apiRequest('/ads/admin').then(setAds).catch(() => setAds([]));
    apiRequest('/ads/admin/ad-free').then(setFree).catch(() => setFree([]));
  };
  useEffect(load, []);
  async function saveCfg(patch) {
    try { setCfg(await apiRequest('/ads/admin/config', { method: 'PUT', body: patch })); onFlash('Ad settings saved.'); } catch (e) { onFlash(e.message); }
  }
  async function edit(id) {
    try { const a = await apiRequest(`/ads/admin/${id}`); setForm({ ...a, startsAt: a.startsAt?.slice(0, 10) || '', endsAt: a.endsAt?.slice(0, 10) || '' }); } catch (e) { onFlash(e.message); }
  }
  async function save(e) {
    e.preventDefault(); setBusy(true);
    const body = { ...form, startsAt: form.startsAt || null, endsAt: form.endsAt || null };
    try {
      await apiRequest(form._id ? `/ads/admin/${form._id}` : '/ads/admin', { method: form._id ? 'PATCH' : 'POST', body });
      onFlash('Ad saved.'); setForm(null); load();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function toggle(a) { try { await apiRequest(`/ads/admin/${a._id}`, { method: 'PATCH', body: { active: !a.active } }); load(); } catch (e) { onFlash(e.message); } }
  async function remove(a) {
    if (!(await showConfirm(`Delete the ad "${a.title}"?`))) return;
    try { await apiRequest(`/ads/admin/${a._id}`, { method: 'DELETE' }); load(); } catch (e) { onFlash(e.message); }
  }
  async function pickImage(file) {
    if (!file) return;
    if (file.size > 600 * 1024) return onFlash('Use an image under 600 KB.');
    setForm((f) => ({ ...f, image: '' })); const data = await readFile(file); setForm((f) => ({ ...f, image: data }));
  }
  if (!cfg) return <p>Loading…</p>;
  return (
    <div className="ads-admin">
      <section className="card">
        <div className="ads-head">
          <div><h3>Ads</h3><p className="text-muted text-sm">Ads never show on live classes, exams, chat, wallet or payment screens.</p></div>
          <label className="ads-switch"><input type="checkbox" checked={cfg.enabled} onChange={(e) => saveCfg({ enabled: e.target.checked })} /> {cfg.enabled ? 'Ads are ON' : 'Ads are OFF'}</label>
        </div>
        <div className="ads-places">
          {PLACES.map(([k, l]) => <label key={k} className="ads-place"><input type="checkbox" checked={cfg.placements[k]} disabled={!cfg.enabled} onChange={(e) => saveCfg({ placements: { [k]: e.target.checked } })} /> {l}</label>)}
        </div>
        <div className="ads-price">
          <b>Ad-free dashboards price for institutes (PKR)</b>
          <label>Monthly <input className="form-input" type="number" min="0" defaultValue={cfg.adFree.monthly} onBlur={(e) => Number(e.target.value) !== cfg.adFree.monthly && saveCfg({ adFree: { monthly: e.target.value } })} /></label>
          <label>Yearly <input className="form-input" type="number" min="0" defaultValue={cfg.adFree.yearly} onBlur={(e) => Number(e.target.value) !== cfg.adFree.yearly && saveCfg({ adFree: { yearly: e.target.value } })} /></label>
        </div>
      </section>

      <section className="card">
        <div className="ads-head"><h3>All ads</h3>{!form && <button type="button" className="btn btn-primary btn-sm" onClick={() => setForm(blank)}>New ad</button>}</div>
        {form && (
          <form className="ads-form" onSubmit={save}>
            <input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="form-input" placeholder="Advertiser (optional)" value={form.advertiser} onChange={(e) => setForm({ ...form, advertiser: e.target.value })} />
            <textarea className="form-input" rows={2} placeholder="Short text (optional)" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            <input className="form-input" placeholder="Link (https://…)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} required />
            <label className="text-sm">Image (optional)<input className="form-input" type="file" accept=".png,.jpg,.jpeg,.webp,.gif" onChange={(e) => pickImage(e.target.files?.[0])} /></label>
            {form.image && <div className="ads-preview"><img src={form.image} alt="" /><button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, image: '' })}>Remove image</button></div>}
            <div className="ads-places">{PLACES.map(([k, l]) => <label key={k} className="ads-place"><input type="checkbox" checked={form.placements.includes(k)} onChange={(e) => setForm({ ...form, placements: e.target.checked ? [...form.placements, k] : form.placements.filter((p) => p !== k) })} /> {l}</label>)}</div>
            <div className="ads-dates">
              <label className="text-sm">Starts<input className="form-input" type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></label>
              <label className="text-sm">Ends<input className="form-input" type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></label>
            </div>
            <div className="ads-actions"><button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : 'Save ad'}</button><button type="button" className="btn btn-outline btn-sm" onClick={() => setForm(null)}>Cancel</button></div>
          </form>
        )}
        {!ads.length ? <p className="text-muted">No ads yet.</p> : (
          <div className="ads-table-wrap"><table className="ads-table">
            <thead><tr><th>Ad</th><th>Where</th><th>Dates</th><th>Seen</th><th>Clicks</th><th>CTR</th><th /></tr></thead>
            <tbody>{ads.map((a) => (
              <tr key={a._id} className={a.active ? '' : 'off'}>
                <td><strong>{a.title}</strong>{a.advertiser && <div className="text-xs text-muted">{a.advertiser}</div>}</td>
                <td className="text-xs">{a.placements.map((p) => PLACES.find(([k]) => k === p)?.[1] || p).join(', ')}</td>
                <td className="text-xs">{date(a.startsAt) || 'Now'} – {date(a.endsAt) || 'No end'}</td>
                <td>{a.impressions}</td><td>{a.clicks}</td><td>{a.impressions ? `${((a.clicks / a.impressions) * 100).toFixed(1)}%` : '–'}</td>
                <td className="ads-row-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => toggle(a)}>{a.active ? 'Pause' : 'Run'}</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => edit(a._id)}>Edit</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => remove(a)}>Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <section className="card">
        <h3>Ad-free institutes</h3>
        {!free.length ? <p className="text-muted">No institute has bought ad-free time.</p> : <ul className="ads-free-list">{free.map((i) => <li key={i._id}><strong>{i.name}</strong>{i.city ? `, ${i.city}` : ''} · until {date(i.adFreeUntil)}</li>)}</ul>}
      </section>
    </div>
  );
}

// Institute owner: pay to turn ads off on the dashboards of its staff and students.
export function AdFreeCard({ institution, onFlash, onDone }) {
  const [price, setPrice] = useState(null);
  useEffect(() => { apiRequest('/ads/ad-free/price', { auth: false }).then(setPrice).catch(() => {}); }, []);
  if (!institution || !price) return null;
  const until = institution.adFreeUntil && new Date(institution.adFreeUntil) > new Date() ? institution.adFreeUntil : null;
  return (
    <section className="card ads-free-card">
      <h3>Ad-free dashboards</h3>
      <p className="text-sm text-muted">Turn off CareerZ ads on the dashboards of your staff and students.{until ? '' : ' Pay by bank transfer; CareerZ checks the receipt and switches ads off.'}</p>
      {until && <p className="ads-free-on">Ads are off until {date(until)}. Buying more adds to this time.</p>}
      <div className="ads-actions">
        <ManualPayButton kind="ad_free" id={institution._id} query={{ period: 'monthly' }} label={`1 month · PKR ${price.monthly.toLocaleString()}`} onFlash={onFlash} onDone={onDone} />
        <ManualPayButton kind="ad_free" id={institution._id} query={{ period: 'yearly' }} label={`1 year · PKR ${price.yearly.toLocaleString()}`} onFlash={onFlash} onDone={onDone} />
      </div>
    </section>
  );
}
