import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

const SETTINGS = ['branding', 'theme', 'seo', 'emergency', 'compliance', 'versions'];
const RESOURCES = [
  ['communication_template', 'Communication Templates'], ['tax_rule', 'Tax Rules'],
  ['settlement', 'Settlements / Payouts'], ['compliance_request', 'GDPR / Compliance'],
  ['incident', 'Incident Response'], ['task', 'Internal Tasks'], ['staff_message', 'Staff Communication'],
  ['plugin', 'Plugins'], ['api_version', 'API Versions']
];

function JsonEditor({ value, onChange }) {
  return <textarea className="form-input" rows={5} value={value} onChange={(e) => onChange(e.target.value)} placeholder='JSON data, e.g. {"rate":5,"country":"PK"}' />;
}

function SettingsPanel({ section, onFlash }) {
  const [all, setAll] = useState(null);
  const [text, setText] = useState('');
  useEffect(() => { apiRequest('/admin-ops/settings').then((data) => { setAll(data); setText(JSON.stringify(data[section], null, 2)); }).catch((e) => onFlash(e.message)); }, [section]);
  async function save() {
    try { const value = JSON.parse(text); const saved = await apiRequest(`/admin-ops/settings/${section}`, { method: 'PATCH', body: value }); setAll({ ...all, [section]: saved }); onFlash(`${section} settings saved.`, 'success'); }
    catch (e) { onFlash(e instanceof SyntaxError ? 'Settings JSON is invalid.' : e.message); }
  }
  if (!all) return <p role="status">Loading…</p>;
  return <div className="card" style={{ padding: 18 }}><h4 style={{ textTransform: 'capitalize' }}>{section}</h4><p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>These values are versioned in the platform settings store. Emergency switches are enforced by their consuming modules.</p><JsonEditor value={text} onChange={setText} /><button className="btn btn-primary mt-2" type="button" onClick={save}>Save settings</button></div>;
}

function ResourcePanel({ type, label, onFlash }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ title: '', key: '', status: 'active', data: '{}' });
  const load = () => apiRequest(`/admin-ops/resources/${type}`).then(setRows).catch((e) => onFlash(e.message));
  useEffect(load, [type]);
  async function create(e) {
    e.preventDefault();
    try { await apiRequest(`/admin-ops/resources/${type}`, { method: 'POST', body: { ...form, data: JSON.parse(form.data || '{}') } }); setForm({ title: '', key: '', status: 'active', data: '{}' }); onFlash(`${label} record created.`, 'success'); load(); }
    catch (err) { onFlash(err instanceof SyntaxError ? 'Data JSON is invalid.' : err.message); }
  }
  async function setStatus(row, status) { try { await apiRequest(`/admin-ops/resources/${type}/${row._id}`, { method: 'PATCH', body: { status } }); load(); } catch (e) { onFlash(e.message); } }
  return <div><form onSubmit={create} className="card" style={{ padding: 18, display: 'grid', gap: 10, marginBottom: 16 }}><h4>{label}</h4><div className="flex gap-2 flex-wrap"><input className="form-input" required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input className="form-input" placeholder="Unique key (optional)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} /></div><JsonEditor value={form.data} onChange={(data) => setForm({ ...form, data })} /><button className="btn btn-primary" type="submit" style={{ justifySelf: 'start' }}>Create</button></form>{rows === null ? <p role="status">Loading…</p> : <div className="space-y-2">{rows.map((row) => <div className="card flex items-center justify-between flex-wrap gap-2" style={{ padding: 12 }} key={row._id}><div><strong className="text-sm">{row.title}</strong><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{row.key || row._id} · {row.status}</p></div><div className="flex gap-2"><button className="btn" onClick={() => setStatus(row, row.status === 'active' ? 'disabled' : 'active')}>{row.status === 'active' ? 'Disable' : 'Activate'}</button>{['task', 'incident', 'compliance_request', 'settlement'].includes(type) && <button className="btn btn-primary" onClick={() => setStatus(row, 'completed')}>Complete</button>}</div></div>)}{rows.length === 0 && <p className="admin-notice">No records yet.</p>}</div>}</div>;
}

function DataPanel({ endpoint, title, onFlash }) {
  const [data, setData] = useState(null);
  const load = () => apiRequest(endpoint).then(setData).catch((e) => onFlash(e.message));
  useEffect(load, [endpoint]);
  return <div><div className="flex items-center justify-between mb-3"><h3>{title}</h3><button className="btn" onClick={load}>Refresh</button></div>{data ? <pre className="card text-xs" style={{ padding: 16, overflow: 'auto', maxHeight: 600, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre> : <p role="status">Loading…</p>}</div>;
}

function BackupRestorePanel({ onFlash }) {
  const [rows, setRows] = useState(null);
  const load = () => apiRequest('/admin/backups').then(setRows).catch((e) => onFlash(e.message));
  useEffect(load, []);
  async function restore(id) {
    try {
      const preview = await apiRequest(`/admin-ops/backups/${id}/restore`, { method: 'POST', body: {} });
      const typed = window.prompt(`Validated ${preview.collections.length} collections. This replaces live data. Type exactly:\n${preview.confirmationRequired}`);
      if (typed !== preview.confirmationRequired) return;
      await apiRequest(`/admin-ops/backups/${id}/restore`, { method: 'POST', body: { confirm: typed } });
      onFlash('Backup restored. Verify platform health now.', 'success');
    } catch (e) { onFlash(e.message); }
  }
  return <div><h3 className="mb-3">Guarded Backup Restore</h3><p className="admin-notice">Restore first validates every backup file, then requires an exact typed confirmation. MongoDB transactions must be available.</p>{(rows || []).map((row) => <div className="card flex justify-between items-center gap-2" style={{ padding: 12 }} key={row._id}><span className="text-sm">{row.folder} · {row.status}</span><button className="btn" disabled={row.status !== 'completed'} onClick={() => restore(row._id)}>Validate / Restore</button></div>)}</div>;
}

function FavoritesPanel({ onFlash }) {
  const [items, setItems] = useState([]);
  const [value, setValue] = useState('');
  useEffect(() => { apiRequest('/admin-ops/favorites').then(setItems).catch((e) => onFlash(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(next) { try { const saved = await apiRequest('/admin-ops/favorites', { method: 'PUT', body: { items: next } }); setItems(saved); onFlash('Admin favorites saved.', 'success'); } catch (e) { onFlash(e.message); } }
  return <div><h3 className="mb-3">My Admin Favorites</h3><div className="card" style={{ padding: 16 }}><div className="flex gap-2"><input className="form-input" placeholder="Dashboard shortcut label" value={value} onChange={(e) => setValue(e.target.value)} /><button className="btn btn-primary" onClick={() => { if (value.trim()) { save([...items, value.trim()]); setValue(''); } }}>Add</button></div><div className="flex flex-wrap gap-2 mt-3">{items.map((item, index) => <button className="btn" key={`${item}-${index}`} onClick={() => save(items.filter((_, i) => i !== index))}>{item} ×</button>)}</div></div></div>;
}

export default function AdminOperationsCenter({ onFlash }) {
  const [tab, setTab] = useState('branding');
  const resource = RESOURCES.find(([key]) => key === tab);
  const dataTabs = {
    monitoring: ['/admin-ops/monitoring', 'Platform Monitoring'], audit: ['/admin-ops/audit-logs', 'Permission & Admin Audit'],
    financeAudit: ['/admin-ops/finance-audit', 'Financial Audit Trail'], refunds: ['/admin-ops/refunds', 'Centralized Refund Dashboard'],
    safety: ['/admin-ops/child-safety', 'Global Child Safety'], anomalies: ['/admin-ops/anomalies', 'Fraud & Anomaly Detection']
  };
  const tabs = [...SETTINGS.map((x) => [x, x]), ...RESOURCES, ['monitoring', 'Monitoring'], ['audit', 'Audit Log'], ['financeAudit', 'Finance Audit'], ['refunds', 'Refunds'], ['safety', 'Child Safety'], ['anomalies', 'Anomalies'], ['favorites', 'My Favorites'], ['restore', 'Backup Restore']];
  return <div><h3 className="font-semibold mb-2">Admin Operations Center</h3><nav className="cz-tabbar" style={{ marginBottom: 18, flexWrap: 'wrap' }}>{tabs.map(([key, label]) => <button key={key} className={`cz-tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label.replaceAll('_', ' ')}</button>)}</nav>{SETTINGS.includes(tab) && <SettingsPanel section={tab} onFlash={onFlash} />}{resource && <ResourcePanel type={resource[0]} label={resource[1]} onFlash={onFlash} />}{dataTabs[tab] && <DataPanel endpoint={dataTabs[tab][0]} title={dataTabs[tab][1]} onFlash={onFlash} />}{tab === 'favorites' && <FavoritesPanel onFlash={onFlash} />}{tab === 'restore' && <BackupRestorePanel onFlash={onFlash} />}</div>;
}
