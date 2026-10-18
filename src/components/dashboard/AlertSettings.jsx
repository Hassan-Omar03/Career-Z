import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Notification settings (Master 35, Job Marketplace 19): which alerts arrive in the app and by
// email, the weekly job digest, and the job categories and cities the person follows for
// job alerts. Every alert email also carries a one-click unsubscribe link.

const SWITCHES = [
  ['jobAlertsInApp', 'New job alerts in CareerZ'], ['jobAlertsEmail', 'New job alerts by email'], ['weeklyDigest', 'Weekly job digest email'],
  ['applicationEmails', 'Application updates by email'], ['scholarshipAlertsInApp', 'New scholarship alerts in CareerZ'], ['scholarshipAlertsEmail', 'New scholarship alerts by email']
];
const CATEGORY_LABEL = { teaching: 'Teaching', academic_leadership: 'Academic leadership', administration: 'Administration', finance_accounts: 'Finance & accounts', it_technical: 'IT & technical', transport: 'Transport / driver', hostel: 'Hostel / warden', security: 'Security', library: 'Library', lab: 'Laboratory', maintenance_cleaning: 'Maintenance & cleaning', healthcare: 'Healthcare', sales_marketing: 'Sales & marketing', engineering: 'Engineering', customer_service: 'Customer service', other: 'Other' };

export default function AlertSettings({ onFlash, compact = false }) {
  const [data, setData] = useState(null), [cities, setCities] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/notifications/settings').then((d) => { setData(d); setCities(d.jobPreferences.cities.join(', ')); }).catch((e) => onFlash?.(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return <p role="status" className="admin-notice">Loading settings…</p>;
  const toggle = (k) => setData({ ...data, preferences: { ...data.preferences, [k]: !data.preferences[k] } });
  const toggleCat = (c) => { const has = data.jobPreferences.categories.includes(c); setData({ ...data, jobPreferences: { ...data.jobPreferences, categories: has ? data.jobPreferences.categories.filter((x) => x !== c) : [...data.jobPreferences.categories, c] } }); };
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await apiRequest('/notifications/settings', { method: 'PUT', body: { preferences: data.preferences, jobPreferences: { ...data.jobPreferences, cities } } });
      setData(d); setCities(d.jobPreferences.cities.join(', ')); onFlash?.('Notification settings saved.', 'success');
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="card" style={{ padding: 18, display: 'grid', gap: 14, marginBottom: compact ? 0 : 20 }}>
      <div><h3 style={{ margin: 0 }}>Notification settings</h3><p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>Choose what reaches you. Job alerts follow your saved alerts, your CV skills, and the categories and cities below.</p></div>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <legend className="text-xs" style={{ fontWeight: 700, marginBottom: 6 }}>Alerts and emails</legend>
        {SWITCHES.map(([k, label]) => <label key={k} className="text-sm" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={data.preferences[k]} onChange={() => toggle(k)} />{label}</label>)}
      </fieldset>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="text-xs" style={{ fontWeight: 700, marginBottom: 6 }}>Job categories I want alerts for</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.categories.map((c) => { const on = data.jobPreferences.categories.includes(c); return <button key={c} type="button" aria-pressed={on} onClick={() => toggleCat(c)} className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: on ? 'var(--forest)' : 'transparent', color: on ? '#fff' : 'var(--ink)', border: '1px solid var(--sand-line)' }}>{CATEGORY_LABEL[c] || c}</button>; })}
        </div>
      </fieldset>
      <label className="text-sm" style={{ display: 'grid', gap: 4, maxWidth: 480 }}>Preferred cities (comma separated)
        <input className="form-input" value={cities} onChange={(e) => setCities(e.target.value)} placeholder="e.g. Lahore, Islamabad" />
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifySelf: 'start' }}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}
