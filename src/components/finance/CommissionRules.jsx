import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { loadCountries } from '../../utils/geo';
import '../../styles/finance.css';

const SERVICE_LABEL = { marketplace: 'Marketplace', course: 'Courses', tuition: 'School and institute fees', tutoring: 'Tutoring', recruitment: 'Recruitment', donation: 'Donations', scholarship: 'Scholarships', freelance: 'Freelance' };
const SCOPE_LABEL = { global: 'Everywhere', country: 'One country', category: 'One category', institution: 'One institution', product: 'One product' };
const blank = { name: '', serviceType: 'marketplace', scope: 'global', scopeValue: '', percentage: '', fixedFee: '', effectiveFrom: '', effectiveUntil: '' };
const day = (d) => (d ? new Date(d).toLocaleDateString() : '');
const toForm = (r) => ({ ...blank, ...r, effectiveFrom: r.effectiveFrom?.slice(0, 10) || '', effectiveUntil: r.effectiveUntil?.slice(0, 10) || '' });

// Rates by country, category, institution or product. With no matching rule, the plain service
// rate in Financial Management still applies.
export default function CommissionRules({ onFlash, canEdit }) {
  const [rules, setRules] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState('');
  const [countries, setCountries] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const load = () => apiRequest('/commission-rules').then((r) => setRules(r.rules)).catch((e) => { setRules([]); onFlash(e.message); });
  useEffect(() => {
    load();
    loadCountries().then(setCountries).catch(() => {});
    apiRequest('/institutions/admin/all').then((r) => setInstitutions(r || [])).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e) {
    e.preventDefault(); setBusy(true);
    const body = { ...form, percentage: Number(form.percentage), fixedFee: Number(form.fixedFee || 0), effectiveFrom: form.effectiveFrom || null, effectiveUntil: form.effectiveUntil || null };
    try {
      await apiRequest(form._id ? `/commission-rules/${form._id}` : '/commission-rules', { method: form._id ? 'PATCH' : 'POST', body });
      onFlash('Rule saved.', 'success'); setForm(null); await load();
    } catch (err) { onFlash(err.message); }
    setBusy(false);
  }
  async function toggle(rule) {
    try { await apiRequest(`/commission-rules/${rule._id}/status`, { method: 'POST', body: { status: rule.status === 'active' ? 'inactive' : 'active' } }); await load(); } catch (err) { onFlash(err.message); }
  }
  const targetName = (r) => {
    if (r.scope === 'global') return 'Everywhere';
    if (r.scope === 'country') return countries.find((c) => c.code === r.scopeValue)?.name || r.scopeValue;
    if (r.scope === 'institution') return institutions.find((i) => i._id === r.scopeValue)?.name || r.scopeValue;
    return r.scopeValue;
  };

  return (
    <div className="fin-panel">
      <section className="card">
        <div className="fin-head">
          <div><h3>Commission rules</h3><p className="text-sm text-muted">The most specific active rule wins: product, then institution, category, country, then everywhere. With no rule, the service rate in Financial Management applies.</p></div>
          {canEdit && !form && <button type="button" className="btn btn-primary" onClick={() => setForm(blank)}>New rule</button>}
        </div>
        {form && (
          <form className="fin-form" onSubmit={save}>
            <label>Name (optional)<input className="form-input" maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Service<select className="form-select" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>{Object.entries(SERVICE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label>Applies to<select className="form-select" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value, scopeValue: '' })}>{Object.entries(SCOPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            {form.scope === 'country' && <label>Country<select className="form-select" required value={form.scopeValue} onChange={(e) => setForm({ ...form, scopeValue: e.target.value })}><option value="">Choose</option>{countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label>}
            {form.scope === 'institution' && <label>Institution<select className="form-select" required value={form.scopeValue} onChange={(e) => setForm({ ...form, scopeValue: e.target.value })}><option value="">Choose</option>{institutions.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}</select></label>}
            {form.scope === 'category' && <label>Category<input className="form-input" required placeholder="For example books" value={form.scopeValue} onChange={(e) => setForm({ ...form, scopeValue: e.target.value })} /></label>}
            {form.scope === 'product' && <label>Product or course ID<input className="form-input" required value={form.scopeValue} onChange={(e) => setForm({ ...form, scopeValue: e.target.value })} /></label>}
            <label>Percentage<input className="form-input" type="number" required min="0" max="100" step="0.01" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} /></label>
            <label>Fixed fee (optional)<input className="form-input" type="number" min="0" step="0.01" value={form.fixedFee} onChange={(e) => setForm({ ...form, fixedFee: e.target.value })} /></label>
            <label>Starts (optional)<input className="form-input" type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} /></label>
            <label>Ends (optional)<input className="form-input" type="date" value={form.effectiveUntil} onChange={(e) => setForm({ ...form, effectiveUntil: e.target.value })} /></label>
            <div className="fin-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save rule'}</button>
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        )}
      </section>
      <section className="card">
        {rules === null ? <p>Loading…</p> : !rules.length ? <p className="text-muted">No rules yet. The plain service rates apply.</p> : (
          <div className="fin-scroll"><table className="fin-table">
            <thead><tr><th>Rule</th><th>Service</th><th>Applies to</th><th>Rate</th><th>Dates</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>{rules.map((r) => [
              <tr key={r._id}>
                <td>{r.name || '—'}</td><td>{SERVICE_LABEL[r.serviceType]}</td><td>{targetName(r)}</td>
                <td>{r.percentage}%{r.fixedFee ? ` + ${r.fixedFee}` : ''}</td>
                <td>{day(r.effectiveFrom) || 'Now'} to {day(r.effectiveUntil) || 'no end'}</td>
                <td>{r.status === 'active' ? 'Active' : 'Disabled'}</td>
                <td className="fin-actions">
                  {canEdit && <button type="button" className="btn btn-ghost vf-small" onClick={() => setForm(toForm(r))}>Edit</button>}
                  {canEdit && <button type="button" className="btn btn-ghost vf-small" onClick={() => toggle(r)}>{r.status === 'active' ? 'Disable' : 'Enable'}</button>}
                  <button type="button" className="btn btn-ghost vf-small" aria-expanded={open === r._id} onClick={() => setOpen(open === r._id ? '' : r._id)}>History</button>
                </td>
              </tr>,
              open === r._id && <tr key={`${r._id}-h`}><td colSpan={7}><ul className="fin-history">{[...(r.history || [])].reverse().map((h, i) => (
                <li key={i}><strong>{h.action}</strong> by {h.by?.fullName || 'admin'} on {new Date(h.at).toLocaleString()}{h.before && h.after ? `: ${h.before.percentage}% + ${h.before.fixedFee || 0} to ${h.after.percentage}% + ${h.after.fixedFee || 0}` : ''}</li>
              ))}</ul></td></tr>
            ])}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
}
