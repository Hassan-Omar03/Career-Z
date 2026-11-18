import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { uploadToPlatformStorage } from '../../utils/platformUpload';

// Accreditation, affiliations, social links and map location for the institution's public
// profile (shown on /institutes/:id). Saved with PATCH /institutions/:id; the server validates
// every link and the coordinates.

const KINDS = [['university', 'University'], ['board', 'Examination board'], ['government', 'Government body'], ['association', 'Association'], ['partner', 'Partner'], ['other', 'Other']];
const NETWORKS = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['x', 'X (Twitter)'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['whatsapp', 'WhatsApp (wa.me link)']];
const day = (d) => (d ? String(d).slice(0, 10) : '');

function fromInstitution(i) {
  return {
    accreditations: (i.accreditations || []).map((a) => ({ body: a.body || '', reference: a.reference || '', validUntil: day(a.validUntil), documentUrl: a.documentUrl || '' })),
    affiliations: (i.affiliations || []).map((a) => ({ name: a.name || '', kind: a.kind || 'other', since: a.since || '' })),
    socialLinks: Object.fromEntries(NETWORKS.map(([k]) => [k, i.socialLinks?.[k] || ''])),
    location: { lat: i.location?.lat ?? '', lng: i.location?.lng ?? '' },
    // Master 8.4 and 15D.21.
    vision: i.vision || '', mission: i.mission || '', history: i.history || '',
    principalMessage: { name: i.principalMessage?.name || '', title: i.principalMessage?.title || '', message: i.principalMessage?.message || '', photo: i.principalMessage?.photo || '' },
    gallery: (i.gallery || []).map((g) => ({ url: g.url, caption: g.caption || '' })),
    schoolLanguage: i.schoolLanguage || '', uniform: i.uniform || ''
  };
}

export default function InstitutionProfileExtras({ institution, onFlash, onSaved }) {
  const [form, setForm] = useState(() => fromInstitution(institution));
  const [saving, setSaving] = useState(false), [locating, setLocating] = useState(false), [uploading, setUploading] = useState('');
  // Photos go to CareerZ storage first; only the https link is saved with the profile.
  async function upload(files, onUrl, what) {
    const list = [...(files || [])].filter((f) => /^image\/(png|jpe?g|webp)$/.test(f.type));
    if (!list.length) return onFlash('Choose a PNG, JPG or WebP photo.');
    if (list.some((f) => f.size > 5 * 1024 * 1024)) return onFlash('Each photo must be 5 MB or smaller.');
    setUploading(what);
    try { for (const f of list) onUrl(await uploadToPlatformStorage(f, 'institution-gallery', 'image', `${institution.name}-${what}`)); }
    catch (err) { onFlash(err.message || 'The photo could not be uploaded.'); } finally { setUploading(''); }
  }
  useEffect(() => { setForm(fromInstitution(institution)); }, [institution._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setRow = (list, idx, patch) => setForm((f) => ({ ...f, [list]: f[list].map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));
  const addRow = (list, row) => setForm((f) => ({ ...f, [list]: [...f[list], row] }));
  const removeRow = (list, idx) => setForm((f) => ({ ...f, [list]: f[list].filter((_, i) => i !== idx) }));

  // Finds coordinates for the saved address with OpenStreetMap's free geocoder (no key).
  async function locate() {
    const q = [institution.address, institution.city].filter(Boolean).join(', ');
    if (!q) return onFlash('Add the address and city in Institution details first.');
    setLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { Accept: 'application/json' } });
      const [hit] = await res.json();
      if (!hit) onFlash('That address was not found on the map. Enter the latitude and longitude yourself (right-click the place in Google Maps to copy them).');
      else setForm((f) => ({ ...f, location: { lat: Number(hit.lat).toFixed(6), lng: Number(hit.lon).toFixed(6) } }));
    } catch { onFlash('The map search is not reachable right now. Enter the coordinates yourself.'); } finally { setLocating(false); }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        accreditations: form.accreditations.filter((a) => a.body.trim()).map((a) => ({ ...a, validUntil: a.validUntil || null })),
        affiliations: form.affiliations.filter((a) => a.name.trim()).map((a) => ({ ...a, since: a.since ? Number(a.since) : null })),
        socialLinks: form.socialLinks,
        location: form.location.lat === '' && form.location.lng === '' ? null : form.location,
        vision: form.vision, mission: form.mission, history: form.history, principalMessage: form.principalMessage,
        gallery: form.gallery, schoolLanguage: form.schoolLanguage, uniform: form.uniform
      };
      await apiRequest(`/institutions/${institution._id}`, { method: 'PATCH', body });
      onFlash('Profile saved. It now shows on your public profile.', 'success');
      onSaved?.();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  const { lat, lng } = form.location;
  const hasMap = lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  return (
    <form onSubmit={save} className="institution-details-card institution-extras card">
      <div className="institution-card-heading"><h3>Accreditation, affiliations, links and map</h3><p>Shown on your public profile so students and parents can check who recognises you and find your campus.</p></div>

      <fieldset className="institution-extras-group">
        <legend>About your institution</legend>
        {[['vision', 'Vision'], ['mission', 'Mission'], ['history', 'History']].map(([k, t]) => <label key={k} className="institution-field"><span>{t}</span><textarea className="form-input" rows={3} maxLength={k === 'history' ? 8000 : 3000} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} /></label>)}
      </fieldset>

      <fieldset className="institution-extras-group">
        <legend>Principal / head's message</legend>
        <div className="institution-extras-links">
          <label className="institution-field"><span>Name</span><input className="form-input" maxLength={120} value={form.principalMessage.name} onChange={(e) => setForm((f) => ({ ...f, principalMessage: { ...f.principalMessage, name: e.target.value } }))} /></label>
          <label className="institution-field"><span>Title</span><input className="form-input" maxLength={120} placeholder="e.g. Principal" value={form.principalMessage.title} onChange={(e) => setForm((f) => ({ ...f, principalMessage: { ...f.principalMessage, title: e.target.value } }))} /></label>
        </div>
        <label className="institution-field"><span>Message</span><textarea className="form-input" rows={4} maxLength={5000} value={form.principalMessage.message} onChange={(e) => setForm((f) => ({ ...f, principalMessage: { ...f.principalMessage, message: e.target.value } }))} /></label>
        <div className="institution-extras-map">
          {form.principalMessage.photo && <img src={form.principalMessage.photo} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12 }} />}
          <label className="btn">{uploading === 'principal' ? 'Uploading…' : form.principalMessage.photo ? 'Change photo' : 'Add photo'}<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => upload(e.target.files, (url) => setForm((f) => ({ ...f, principalMessage: { ...f.principalMessage, photo: url } })), 'principal')} /></label>
          {form.principalMessage.photo && <button type="button" className="btn" onClick={() => setForm((f) => ({ ...f, principalMessage: { ...f.principalMessage, photo: '' } }))}>Remove photo</button>}
        </div>
      </fieldset>

      <fieldset className="institution-extras-group">
        <legend>Gallery</legend>
        {form.gallery.map((g, i) => (
          <div key={g.url} className="institution-extras-row">
            <img src={g.url} alt={g.caption} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 8 }} />
            <input className="form-input" aria-label="Caption" placeholder="Caption (optional)" maxLength={160} value={g.caption} onChange={(e) => setRow('gallery', i, { caption: e.target.value })} />
            <button type="button" className="btn institution-extras-remove" onClick={() => removeRow('gallery', i)}>Remove</button>
          </div>
        ))}
        {form.gallery.length < 40 && <label className="btn institution-extras-add">{uploading === 'gallery' ? 'Uploading…' : '+ Add photos'}<input type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => upload(e.target.files, (url) => addRow('gallery', { url, caption: '' }), 'gallery')} /></label>}
      </fieldset>

      <fieldset className="institution-extras-group">
        <legend>Language and uniform</legend>
        <label className="institution-field"><span>Language of teaching</span><input className="form-input" maxLength={160} placeholder="e.g. English and Urdu" value={form.schoolLanguage} onChange={(e) => setForm((f) => ({ ...f, schoolLanguage: e.target.value }))} /></label>
        <label className="institution-field"><span>Uniform information</span><textarea className="form-input" rows={3} maxLength={3000} placeholder="e.g. Summer: white shirt, grey trousers. Winter: navy blazer. Where to buy." value={form.uniform} onChange={(e) => setForm((f) => ({ ...f, uniform: e.target.value }))} /></label>
      </fieldset>

      <fieldset className="institution-extras-group">
        <legend>Accreditations</legend>
        {form.accreditations.map((a, i) => (
          <div key={i} className="institution-extras-row">
            <input className="form-input" aria-label="Accrediting body" placeholder="Accrediting body, e.g. HEC Pakistan" required value={a.body} onChange={(e) => setRow('accreditations', i, { body: e.target.value })} />
            <input className="form-input" aria-label="Reference number" placeholder="Reference / certificate no." value={a.reference} onChange={(e) => setRow('accreditations', i, { reference: e.target.value })} />
            <label className="institution-field"><span>Valid until</span><input type="date" className="form-input" value={a.validUntil} onChange={(e) => setRow('accreditations', i, { validUntil: e.target.value })} /></label>
            <input type="url" className="form-input" aria-label="Certificate link" placeholder="Certificate link (https://…)" value={a.documentUrl} onChange={(e) => setRow('accreditations', i, { documentUrl: e.target.value })} />
            <button type="button" className="btn institution-extras-remove" onClick={() => removeRow('accreditations', i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn institution-extras-add" onClick={() => addRow('accreditations', { body: '', reference: '', validUntil: '', documentUrl: '' })}>+ Add accreditation</button>
      </fieldset>

      <fieldset className="institution-extras-group">
        <legend>Affiliations</legend>
        {form.affiliations.map((a, i) => (
          <div key={i} className="institution-extras-row">
            <input className="form-input" aria-label="Affiliated with" placeholder="Affiliated with, e.g. BISE Lahore" required value={a.name} onChange={(e) => setRow('affiliations', i, { name: e.target.value })} />
            <select className="form-select" aria-label="Kind" value={a.kind} onChange={(e) => setRow('affiliations', i, { kind: e.target.value })}>{KINDS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
            <input type="number" className="form-input" aria-label="Since year" placeholder="Since (year)" min={1800} max={new Date().getFullYear()} value={a.since} onChange={(e) => setRow('affiliations', i, { since: e.target.value })} />
            <button type="button" className="btn institution-extras-remove" onClick={() => removeRow('affiliations', i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn institution-extras-add" onClick={() => addRow('affiliations', { name: '', kind: 'university', since: '' })}>+ Add affiliation</button>
      </fieldset>

      <fieldset className="institution-extras-group">
        <legend>Social links</legend>
        <div className="institution-extras-links">
          {NETWORKS.map(([k, t]) => <label key={k} className="institution-field"><span>{t}</span><input type="url" className="form-input" placeholder="https://…" value={form.socialLinks[k]} onChange={(e) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [k]: e.target.value } }))} /></label>)}
        </div>
      </fieldset>

      <fieldset className="institution-extras-group">
        <legend>Map location</legend>
        <div className="institution-extras-map">
          <label className="institution-field"><span>Latitude</span><input className="form-input" inputMode="decimal" value={lat} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, lat: e.target.value } }))} /></label>
          <label className="institution-field"><span>Longitude</span><input className="form-input" inputMode="decimal" value={lng} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, lng: e.target.value } }))} /></label>
          <button type="button" className="btn" onClick={locate} disabled={locating}>{locating ? 'Finding…' : 'Find from my address'}</button>
          {hasMap && <button type="button" className="btn" onClick={() => setForm((f) => ({ ...f, location: { lat: '', lng: '' } }))}>Clear</button>}
        </div>
        {hasMap && <iframe title="Map preview" style={{ width: '100%', height: 240, border: 0, borderRadius: 12, marginTop: 10 }} loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.01}%2C${Number(lat) - 0.006}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`} />}
      </fieldset>

      <button type="submit" className="btn btn-primary institution-extras-save" disabled={saving || Boolean(uploading)}>{saving ? 'Saving...' : 'Save'}</button>
    </form>
  );
}
