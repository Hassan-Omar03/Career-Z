import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Super Admin: connect the platform's own AI key for the homepage assistant. The key is stored
// encrypted on the server and only a short preview ever comes back.
const PROVIDERS = [['openai', 'OpenAI (ChatGPT)'], ['claude', 'Anthropic Claude'], ['gemini', 'Google Gemini'], ['deepseek', 'DeepSeek']];

export default function SiteAssistantSettings({ onFlash }) {
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ provider: 'openai', apiKey: '', model: '' });
  const [busy, setBusy] = useState(false);
  const load = () => apiRequest('/admin/site-assistant').then(setStatus).catch((e) => onFlash(e.message));
  useEffect(() => { load(); }, []);

  async function connect(e) {
    e.preventDefault();
    setBusy(true);
    try { setStatus(await apiRequest('/admin/site-assistant', { method: 'PUT', body: form })); setForm({ ...form, apiKey: '' }); onFlash('Homepage assistant connected.', 'success'); }
    catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function disconnect() {
    if (!window.confirm('Turn off the homepage assistant? Visitors will no longer see it.')) return;
    try { setStatus(await apiRequest('/admin/site-assistant', { method: 'DELETE' })); onFlash('Homepage assistant disconnected.', 'success'); } catch (err) { onFlash(err.message); }
  }

  if (!status) return null;
  return (
    <section className="card" style={{ padding: 20, marginTop: 20, display: 'grid', gap: 12 }}>
      <div>
        <h3 className="font-semibold">Homepage AI assistant</h3>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
          Answers visitors' questions about CareerZ using live public data (jobs, scholarships, institutes, courses, marketplace). This key is the platform's own and is billed to its provider account. Visitors are limited to 8 messages a minute and 120 a day.
        </p>
      </div>
      {status.enabled
        ? <p className="text-sm"><strong style={{ color: 'var(--emerald)' }}>On</strong> · {PROVIDERS.find(([k]) => k === status.provider)?.[1] || status.provider} · model {status.model}{status.keyPreview ? ` · key ${status.keyPreview}` : ''}{status.source === 'env' ? ' · set in server environment' : ''}</p>
        : <p className="text-sm"><strong>Off</strong> — visitors do not see the assistant until a key is connected.</p>}
      <form onSubmit={connect} className="flex flex-wrap" style={{ gap: 10 }}>
        <select className="form-select" aria-label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} style={{ maxWidth: 200 }}>{PROVIDERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <input className="form-input" type="password" autoComplete="off" placeholder={status.enabled ? 'New API key (replaces the current one)' : 'API key'} value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} style={{ flex: '1 1 260px' }} required />
        <input className="form-input" placeholder="Model (optional)" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} style={{ maxWidth: 200 }} />
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Connect'}</button>
        {status.enabled && status.source === 'admin' && <button type="button" className="btn" onClick={disconnect}>Disconnect</button>}
      </form>
    </section>
  );
}
