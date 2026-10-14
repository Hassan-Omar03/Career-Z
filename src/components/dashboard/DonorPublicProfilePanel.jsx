import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { uploadToPlatformStorage } from '../../utils/platformUpload';

// A donor decides whether, and how, they appear on the public homepage and /donors. Off by default;
// only these fields are ever shown publicly (never email, phone, documents or donation records).
export default function DonorPublicProfilePanel({ onFlash, userId }) {
  const [form, setForm] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/public/me/donor-profile').then((p) => setForm({ ...p, focusAreas: (p.focusAreas || []).join(', ') })).catch((e) => onFlash(e.message)); }, []);
  if (!form) return null;
  const set = (k, v) => setForm({ ...form, [k]: v });
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await apiRequest('/public/me/donor-profile', { method: 'PUT', body: { ...form, focusAreas: form.focusAreas } });
      setForm({ ...saved, focusAreas: (saved.focusAreas || []).join(', ') });
      onFlash(saved.enabled ? 'Your public donor profile is live on CareerZ.' : 'Saved. Your profile is not public.', 'success');
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="admin-section admin-account-card" style={{ marginTop: 20, display: 'grid', gap: 12 }}>
      <div className="admin-section-heading"><div><h2>Public donor profile</h2><p>Choose whether visitors can see you on the CareerZ homepage and Donors page. Your email, phone, documents and donation records are never shown.</p></div></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.enabled} onChange={(e) => set('enabled', e.target.checked)} /> Show my public profile{form.enabled && userId ? <a href={`/donors/${userId}`} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: 'var(--emerald)' }}>View it</a> : null}</label>
      <label className="text-xs" style={{ fontWeight: 600 }}>Public name<input className="form-input" maxLength={120} value={form.displayName || ''} onChange={(e) => set('displayName', e.target.value)} placeholder="e.g. Al-Noor Education Trust" /></label>
      <label className="text-xs" style={{ fontWeight: 600 }}>About<textarea className="form-input" rows={4} maxLength={1500} value={form.about || ''} onChange={(e) => set('about', e.target.value)} placeholder="What you fund and why" /></label>
      <label className="text-xs" style={{ fontWeight: 600 }}>Focus areas (comma separated)<input className="form-input" value={form.focusAreas || ''} onChange={(e) => set('focusAreas', e.target.value)} placeholder="Girls' education, STEM, Need-based" /></label>
      <div className="flex flex-wrap" style={{ gap: 10 }}>
        <label className="text-xs" style={{ fontWeight: 600, flex: '1 1 160px' }}>City<input className="form-input" value={form.city || ''} onChange={(e) => set('city', e.target.value)} /></label>
        <label className="text-xs" style={{ fontWeight: 600, flex: '1 1 160px' }}>Country<input className="form-input" value={form.country || ''} onChange={(e) => set('country', e.target.value)} /></label>
      </div>
      <label className="text-xs" style={{ fontWeight: 600 }}>Logo or photo
        <div className="flex" style={{ gap: 8 }}>
          <input className="form-input" placeholder="https://…" value={form.logoUrl || ''} onChange={(e) => set('logoUrl', e.target.value)} />
          <label className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0 }}>Upload<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { set('logoUrl', await uploadToPlatformStorage(f, 'donor-logos')); } catch (err) { onFlash(err.message); } }} /></label>
        </div>
      </label>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.showScholarships !== false} onChange={(e) => set('showScholarships', e.target.checked)} /> Show my open scholarships on my public profile</label>
      <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifySelf: 'start' }}>{busy ? 'Saving…' : 'Save public profile'}</button>
    </form>
  );
}
