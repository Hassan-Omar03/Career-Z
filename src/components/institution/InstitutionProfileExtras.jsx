import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

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
    location: { lat: i.location?.lat ?? '', lng: i.location?.lng ?? '' }
  };
}

export default function InstitutionProfileExtras({ institution, onFlash, onSaved }) {
  const [form, setForm] = useState(() => fromInstitution(institution));
  const [saving, setSaving] = useState(false), [locating, setLocating] = useState(false);
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
        location: form.location.lat === '' && form.location.lng === '' ? null : form.location
      };
      await apiRequest(`/institutions/${institution._id}`, { method: 'PATCH', body });
      onFlash('Accreditation, affiliations, links and map saved. They now show on your public profile.', 'success');
      onSaved?.();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  const { lat, lng } = form.location;
  const hasMap = lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  return (
    <form onSubmit={save} className="institution-details-card card" style={{ marginTop: 20 }}>
      <div className="institution-card-heading"><h3>Accreditation, affiliations, links and map</h3><p>Shown on your public profile so students and parents can check who recognises you and find your campus.</p></div>

      <fieldset className="institution-field" style={{ border: 0, padding: 0 }}>
        <legend style={{ fontWeight: 600 }}>Accreditations</legend>
        {form.accreditations.map((a, i) => (
          <div key={i} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', marginBottom: 8 }}>
            <input className="form-input" aria-label="Accrediting body" placeholder="Accrediting body, e.g. HEC Pakistan" required value={a.body} onChange={(e) => setRow('accreditations', i, { body: e.target.value })} />
            <input className="form-input" aria-label="Reference number" placeholder="Reference / certificate no." value={a.reference} onChange={(e) => setRow('accreditations', i, { reference: e.target.value })} />
            <label style={{ fontSize: 12 }}>Valid until<input type="date" className="form-input" value={a.validUntil} onChange={(e) => setRow('accreditations', i, { validUntil: e.target.value })} /></label>
            <input type="url" className="form-input" aria-label="Certificate link" placeholder="Certificate link (https://…)" value={a.documentUrl} onChange={(e) => setRow('accreditations', i, { documentUrl: e.target.value })} />
            <button type="button" className="btn" onClick={() => removeRow('accreditations', i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => addRow('accreditations', { body: '', reference: '', validUntil: '', documentUrl: '' })}>+ Add accreditation</button>
      </fieldset>

      <fieldset className="institution-field" style={{ border: 0, padding: 0 }}>
        <legend style={{ fontWeight: 600 }}>Affiliations</legend>
        {form.affiliations.map((a, i) => (
          <div key={i} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', marginBottom: 8 }}>
            <input className="form-input" aria-label="Affiliated with" placeholder="Affiliated with, e.g. BISE Lahore" required value={a.name} onChange={(e) => setRow('affiliations', i, { name: e.target.value })} />
            <select className="form-select" aria-label="Kind" value={a.kind} onChange={(e) => setRow('affiliations', i, { kind: e.target.value })}>{KINDS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
            <input type="number" className="form-input" aria-label="Since year" placeholder="Since (year)" min={1800} max={new Date().getFullYear()} value={a.since} onChange={(e) => setRow('affiliations', i, { since: e.target.value })} />
            <button type="button" className="btn" onClick={() => removeRow('affiliations', i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => addRow('affiliations', { name: '', kind: 'university', since: '' })}>+ Add affiliation</button>
      </fieldset>

      <fieldset className="institution-field" style={{ border: 0, padding: 0 }}>
        <legend style={{ fontWeight: 600 }}>Social links</legend>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {NETWORKS.map(([k, t]) => <label key={k} style={{ fontSize: 12 }}>{t}<input type="url" className="form-input" placeholder="https://…" value={form.socialLinks[k]} onChange={(e) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [k]: e.target.value } }))} /></label>)}
        </div>
      </fieldset>

      <fieldset className="institution-field" style={{ border: 0, padding: 0 }}>
        <legend style={{ fontWeight: 600 }}>Map location</legend>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <label style={{ fontSize: 12 }}>Latitude<input className="form-input" inputMode="decimal" value={lat} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, lat: e.target.value } }))} /></label>
          <label style={{ fontSize: 12 }}>Longitude<input className="form-input" inputMode="decimal" value={lng} onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, lng: e.target.value } }))} /></label>
          <button type="button" className="btn" onClick={locate} disabled={locating}>{locating ? 'Finding…' : 'Find from my address'}</button>
          {hasMap && <button type="button" className="btn" onClick={() => setForm((f) => ({ ...f, location: { lat: '', lng: '' } }))}>Clear</button>}
        </div>
        {hasMap && <iframe title="Map preview" style={{ width: '100%', height: 240, border: 0, borderRadius: 12, marginTop: 10 }} loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.01}%2C${Number(lat) - 0.006}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`} />}
      </fieldset>

      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
    </form>
  );
}
