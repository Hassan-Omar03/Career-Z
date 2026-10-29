import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';
import '../../styles/plugins.css';

// Plugin System (Super Admin): optional CareerZ modules switched on or off, and integrations
// that receive CareerZ events as signed requests at their own https address.

// Dashboard menu entries that belong to an optional module (hidden when it is off).
export const NAV_MODULE = { marketplace: 'marketplace', myAcademies: 'academy', academyBatches: 'academy', childAcademies: 'academy', batches: 'academy', visaCases: 'visa', transport: 'transport', polls: 'polls', magazine: 'magazine' };

let shared = null;
export function useModules() {
  const [on, setOn] = useState(shared || {});
  useEffect(() => {
    if (shared) return;
    apiRequest('/plugins/modules', { auth: false }).then((m) => { shared = m; setOn(m); }).catch(() => {});
  }, []);
  return on;
}

const date = (d) => (d ? new Date(d).toLocaleString() : '');
const blank = { name: '', description: '', url: 'https://', events: [] };

export function AdminPluginsPanel({ onFlash }) {
  const [mods, setMods] = useState(null), [plugins, setPlugins] = useState([]), [events, setEvents] = useState({}), [form, setForm] = useState(null), [secret, setSecret] = useState(null), [open, setOpen] = useState(''), [busy, setBusy] = useState('');
  const load = () => {
    apiRequest('/plugins/admin/modules').then(setMods).catch((e) => onFlash(e.message));
    apiRequest('/plugins/admin').then(setPlugins).catch(() => setPlugins([]));
  };
  useEffect(() => { load(); apiRequest('/plugins/admin/events').then(setEvents).catch(() => {}); }, []);
  async function toggleModule(m) {
    if (m.enabled && !(await showConfirm(`Turn off ${m.label}? Users will not be able to open it until you turn it on again. Existing data is kept.`))) return;
    try { setMods(await apiRequest(`/plugins/admin/modules/${m.key}`, { method: 'PATCH', body: { enabled: !m.enabled } })); shared = null; onFlash(`${m.label} turned ${m.enabled ? 'off' : 'on'}.`); } catch (e) { onFlash(e.message); }
  }
  async function save(e) {
    e.preventDefault(); setBusy('save');
    try {
      const r = await apiRequest(form._id ? `/plugins/admin/${form._id}` : '/plugins/admin', { method: form._id ? 'PATCH' : 'POST', body: { name: form.name, description: form.description, url: form.url, events: form.events } });
      if (r.secret) setSecret({ name: r.name, value: r.secret });
      setForm(null); load(); onFlash('Plugin saved.');
    } catch (err) { onFlash(err.message); } finally { setBusy(''); }
  }
  async function patch(p, body, msg) {
    try { const r = await apiRequest(`/plugins/admin/${p._id}`, { method: 'PATCH', body }); if (r.secret) setSecret({ name: r.name, value: r.secret }); load(); if (msg) onFlash(msg); } catch (e) { onFlash(e.message); }
  }
  async function test(p) {
    setBusy(p._id);
    try { const r = await apiRequest(`/plugins/admin/${p._id}/test`, { method: 'POST' }); onFlash(r.ok ? `Test sent: ${p.name} answered ${r.status}.` : `Test failed: ${r.error}`); load(); } catch (e) { onFlash(e.message); } finally { setBusy(''); }
  }
  async function remove(p) {
    if (!(await showConfirm(`Delete the plugin "${p.name}"? It stops receiving events.`))) return;
    try { await apiRequest(`/plugins/admin/${p._id}`, { method: 'DELETE' }); load(); } catch (e) { onFlash(e.message); }
  }
  const choosable = Object.entries(events).filter(([k]) => k !== 'plugin.test');
  return (
    <div className="pl-wrap">
      <section className="card">
        <h3>Modules</h3>
        <p className="text-sm text-muted">Optional CareerZ features. A module that is off disappears from the menus and its pages say it is turned off. Data is never deleted, and admins can still open it to finish open work.</p>
        {!mods ? <p>Loading…</p> : (
          <div className="pl-mods">
            {mods.map((m) => (
              <div key={m.key} className={`pl-mod${m.enabled ? '' : ' off'}`}>
                <div><strong>{m.label}</strong><p className="text-xs text-muted">{m.description}</p></div>
                <button type="button" className={`pl-switch${m.enabled ? ' on' : ''}`} role="switch" aria-checked={m.enabled} aria-label={`${m.label} ${m.enabled ? 'on' : 'off'}`} onClick={() => toggleModule(m)}><span /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="pl-head">
          <div><h3>Integrations</h3><p className="text-sm text-muted">Send CareerZ events to another app (CRM, Slack, Zapier, your ERP) at its own https address. No outside code runs inside CareerZ.</p></div>
          {!form && <button type="button" className="btn btn-primary btn-sm" onClick={() => setForm(blank)}>Add plugin</button>}
        </div>
        {secret && (
          <div className="pl-secret">
            <b>Secret for {secret.name}: copy it now, it is shown only once.</b>
            <code style={{ userSelect: 'all' }}>{secret.value}</code>
            <p className="text-xs">Each request has the headers <code>X-CareerZ-Event</code>, <code>X-CareerZ-Timestamp</code> and <code>X-CareerZ-Signature</code> = <code>sha256=</code>HMAC-SHA256(secret, timestamp + "." + body). Check it before trusting the request.</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSecret(null)}>I saved it</button>
          </div>
        )}
        {form && (
          <form className="pl-form" onSubmit={save}>
            <input className="form-input" placeholder="Name, e.g. HubSpot CRM" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="form-input" placeholder="What it is for (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="form-input" placeholder="https://… address that receives the events" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            <div className="pl-events">{choosable.map(([k, l]) => <label key={k}><input type="checkbox" checked={form.events.includes(k)} onChange={(e) => setForm({ ...form, events: e.target.checked ? [...form.events, k] : form.events.filter((x) => x !== k) })} /> <span><b>{k}</b> {l}</span></label>)}</div>
            <div className="pl-actions"><button className="btn btn-primary btn-sm" disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save plugin'}</button><button type="button" className="btn btn-outline btn-sm" onClick={() => setForm(null)}>Cancel</button></div>
          </form>
        )}
        {!plugins.length ? <p className="text-muted">No plugins yet.</p> : (
          <ul className="pl-list">
            {plugins.map((p) => (
              <li key={p._id} className={`pl-item${p.enabled ? '' : ' off'}`}>
                <div className="pl-item-head">
                  <strong>{p.name}</strong>
                  <span className={`tag ${p.enabled ? 'approved' : ''}`}>{p.enabled ? 'On' : 'Off'}</span>
                  {p.failures > 0 && <span className="tag rejected">{p.failures} failed in a row</span>}
                </div>
                {p.description && <p className="text-sm">{p.description}</p>}
                <p className="text-xs text-muted pl-url">{p.url}</p>
                <p className="text-xs">Events: {p.events.join(', ')}</p>
                <div className="pl-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => patch(p, { enabled: !p.enabled }, p.enabled ? 'Plugin turned off.' : 'Plugin turned on.')}>{p.enabled ? 'Turn off' : 'Turn on'}</button>
                  <button type="button" className="btn btn-outline btn-sm" disabled={busy === p._id} onClick={() => test(p)}>{busy === p._id ? 'Sending…' : 'Send test'}</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ _id: p._id, name: p.name, description: p.description, url: p.url, events: p.events })}>Edit</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={async () => { if (await showConfirm('Make a new secret? The old one stops working at once.')) patch(p, { rotateSecret: true }); }}>New secret</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(open === p._id ? '' : p._id)}>{open === p._id ? 'Hide log' : 'Delivery log'}</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => remove(p)}>Delete</button>
                </div>
                {open === p._id && (!p.deliveries.length ? <p className="text-xs text-muted">Nothing sent yet.</p> : (
                  <div className="pl-log-wrap"><table className="pl-log"><thead><tr><th>When</th><th>Event</th><th>Result</th><th>Time</th></tr></thead>
                    <tbody>{p.deliveries.map((d, n) => <tr key={n}><td>{date(d.at)}</td><td>{d.event}</td><td className={d.ok ? 'ok' : 'bad'}>{d.ok ? `OK ${d.status}` : d.error || `HTTP ${d.status}`}</td><td>{d.ms} ms</td></tr>)}</tbody></table></div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
