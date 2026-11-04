import { useState } from 'react';
import { uploadToPlatformStorage } from '../../utils/platformUpload';

export const CATEGORY_LABEL = { home_tuition: 'Home tuition', online_tuition: 'Online tuition', admission_consultancy: 'Admission consultancy', career_counselling: 'Career counselling', visa_consultancy: 'Visa consultancy', research_assistance: 'Research assistance', translation: 'Translation', certification_support: 'Certification support', training: 'Training', mentoring: 'Mentoring', design: 'Design', development: 'Development', writing: 'Writing', other: 'Other services' };
export const TIER_LABEL = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
export const money = (currency, value) => `${currency} ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
export const day = (d) => (d ? new Date(d).toLocaleDateString() : '');

// Rating, completion, response time and complaints (master A4: reputation system).
export function Reputation({ data }) {
  if (!data) return null;
  const rows = [
    data.trustScore != null && ['Trust score', `${data.trustScore}/100`],
    data.rating != null && ['Rating', `${data.rating} of 5 (${data.reviewCount})`],
    data.completionRate != null && ['Completion rate', `${data.completionRate}%`],
    ['Completed orders', data.completedOrders],
    data.responseHours != null && ['Usually responds in', `${data.responseHours} hours`],
    ['Complaints', data.complaints]
  ].filter(Boolean);
  return <dl className="dp-facts fl-facts">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

// Picks and uploads files; the list goes up to the parent as { name, url }.
export function FilePicker({ value, onChange, onFlash, label = 'Add a file', folder = 'freelance' }) {
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const chosen = [...(e.target.files || [])];
    e.target.value = '';
    if (!chosen.length) return;
    if (chosen.some((f) => f.size > 25 * 1048576)) { onFlash?.('Each file must be 25 MB or smaller.'); return; }
    setBusy(true);
    try {
      const added = [];
      for (const f of chosen) added.push({ name: f.name.slice(0, 120), url: await uploadToPlatformStorage(f, folder) });
      onChange([...value, ...added].slice(0, 10));
    } catch (err) { onFlash?.(err.message || 'The file could not be uploaded.'); }
    setBusy(false);
  }
  return (
    <div className="fl-files">
      {value.map((f, i) => <span key={f.url} className="fl-file">{f.name}<button type="button" aria-label={`Remove ${f.name}`} onClick={() => onChange(value.filter((_, n) => n !== i))}>×</button></span>)}
      <label className={`btn btn-ghost btn-sm${busy ? ' vf-disabled' : ''}`}>{busy ? 'Uploading…' : label}<input type="file" multiple hidden disabled={busy} onChange={pick} /></label>
    </div>
  );
}
