import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMEZONES = ['Asia/Karachi', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Kolkata', 'Asia/Dhaka', 'Europe/London', 'America/New_York', 'UTC'];
const POLICIES = [
  ['teacher_choice', 'Teachers may record their classes'],
  ['always_allowed', 'Always record live classes'],
  ['disabled', 'Recording is not allowed']
];

// Institution → "Institute Settings": classroom recording rules, branding/theme, public pages,
// subdomain, timezone and working week.
export default function InstitutionSettingsPanel({ institution, onFlash }) {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (institution?._id) apiRequest(`/institutions/${institution._id}/settings`).then(setS).catch((err) => onFlash?.(err.message)); }, [institution?._id, onFlash]);

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;
  if (!s) return <p role="status" className="admin-notice">Loading settings...</p>;
  const patch = (path, value) => setS((cur) => { const next = structuredClone(cur); const keys = path.split('.'); let o = next; keys.slice(0, -1).forEach((k) => { o[k] = o[k] || {}; o = o[k]; }); o[keys[keys.length - 1]] = value; return next; });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { classroom: s.classroom, branding: s.branding, pages: s.pages, subdomain: s.subdomain || '', timezone: s.timezone, workingDays: s.workingDays, schoolHours: s.schoolHours };
      setS(await apiRequest(`/institutions/${institution._id}/settings`, { method: 'PUT', body }));
      onFlash?.('Institution settings saved.', 'success');
    } catch (err) { onFlash?.(err.message); } finally { setSaving(false); }
  }

  const publicUrl = s.subdomain ? `${window.location.origin}/i/${s.subdomain}` : null;
  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <h3 className="font-semibold">Institute Settings</h3>

      <section className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
        <strong>Classroom recording</strong>
        {POLICIES.map(([value, label]) => (
          <label key={value} className="text-sm flex items-center gap-2"><input type="radio" name="recording-policy" checked={s.classroom?.recordingPolicy === value} onChange={() => patch('classroom.recordingPolicy', value)} /> {label}</label>
        ))}
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={Boolean(s.classroom?.requireStudentConsent)} disabled={s.classroom?.recordingPolicy === 'disabled'} onChange={(e) => patch('classroom.requireStudentConsent', e.target.checked)} /> Ask every student for consent when a class is recorded</label>
        <label className="text-xs">Delete recordings after (days, 0 = keep)<input className="form-input" type="number" min="0" max="3650" value={s.classroom?.recordingRetentionDays ?? 0} onChange={(e) => patch('classroom.recordingRetentionDays', Number(e.target.value))} style={{ width: 120, marginTop: 4 }} /></label>
      </section>

      <section className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
        <strong>Branding & theme</strong>
        <div className="flex gap-3 flex-wrap items-center">
          <label className="text-xs">Primary colour<input type="color" value={s.branding?.primaryColor || '#123c2f'} onChange={(e) => patch('branding.primaryColor', e.target.value)} style={{ display: 'block', marginTop: 4 }} /></label>
          <label className="text-xs">Accent colour<input type="color" value={s.branding?.accentColor || '#d4a017'} onChange={(e) => patch('branding.accentColor', e.target.value)} style={{ display: 'block', marginTop: 4 }} /></label>
          <input className="form-input" placeholder="Tagline" value={s.branding?.tagline || ''} onChange={(e) => patch('branding.tagline', e.target.value)} style={{ flex: '2 1 220px' }} />
        </div>
        <input className="form-input" placeholder="Banner image URL (https://...)" value={s.branding?.bannerUrl || ''} onChange={(e) => patch('branding.bannerUrl', e.target.value)} />
        <div style={{ borderRadius: 10, padding: 12, color: '#fff', background: `linear-gradient(135deg, ${s.branding?.primaryColor || '#123c2f'}, ${s.branding?.accentColor || '#d4a017'})` }}><strong>{institution.name}</strong>{s.branding?.tagline ? ` — ${s.branding.tagline}` : ''}</div>
      </section>

      <section className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
        <strong>Public address & pages</strong>
        <label className="text-xs">Subdomain<input className="form-input" placeholder="e.g. gcuf" value={s.subdomain || ''} onChange={(e) => patch('subdomain', e.target.value.toLowerCase())} style={{ marginTop: 4 }} /></label>
        {publicUrl && <p className="text-xs">Public page: <a href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a> (or <strong>{s.subdomain}.careerz.pk</strong> once the domain is connected)</p>}
        {(s.pages || []).map((p, i) => (
          <div key={i} className="card" style={{ padding: 10, display: 'grid', gap: 6, background: 'var(--sand)' }}>
            <div className="flex gap-2 flex-wrap">
              <input className="form-input" placeholder="Title (e.g. About us)" value={p.title} onChange={(e) => patch('pages', s.pages.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} style={{ flex: '2 1 180px' }} />
              <input className="form-input" placeholder="address (about-us)" value={p.slug} onChange={(e) => patch('pages', s.pages.map((x, j) => (j === i ? { ...x, slug: e.target.value.toLowerCase() } : x)))} style={{ flex: '1 1 120px' }} />
              <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={Boolean(p.published)} onChange={(e) => patch('pages', s.pages.map((x, j) => (j === i ? { ...x, published: e.target.checked } : x)))} /> Published</label>
              <button type="button" className="btn" onClick={() => patch('pages', s.pages.filter((_, j) => j !== i))}>Remove</button>
            </div>
            <textarea className="form-input" rows={4} placeholder="Page content" value={p.body || ''} onChange={(e) => patch('pages', s.pages.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} />
          </div>
        ))}
        <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={() => patch('pages', [...(s.pages || []), { title: '', slug: '', body: '', published: false }])}>+ Add page</button>
      </section>

      <section className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
        <strong>Timezone & working week</strong>
        <select className="form-select" value={s.timezone} onChange={(e) => patch('timezone', e.target.value)} style={{ maxWidth: 260 }}>
          {[...new Set([s.timezone, ...TIMEZONES])].map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select>
        <div className="flex gap-3 flex-wrap">
          {DAYS.map((d, i) => (
            <label key={d} className="text-sm flex items-center gap-1"><input type="checkbox" checked={(s.workingDays || []).includes(i)} onChange={() => patch('workingDays', (s.workingDays || []).includes(i) ? s.workingDays.filter((x) => x !== i) : [...(s.workingDays || []), i].sort())} /> {d}</label>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="text-xs">School day starts<input className="form-input" type="time" value={s.schoolHours?.start || '08:00'} onChange={(e) => patch('schoolHours.start', e.target.value)} style={{ marginTop: 4 }} /></label>
          <label className="text-xs">Ends<input className="form-input" type="time" value={s.schoolHours?.end || '14:00'} onChange={(e) => patch('schoolHours.end', e.target.value)} style={{ marginTop: 4 }} /></label>
        </div>
      </section>

      <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
    </form>
  );
}
