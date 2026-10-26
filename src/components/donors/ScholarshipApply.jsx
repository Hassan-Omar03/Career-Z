import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '../../api/client';
import { openPrivateFile, readAsDataUrl } from '../recruitment/files';

// Scholarship applications: the donor picks the documents every applicant must upload; the
// applicant fills the full form, explains why they apply and uploads each document; the donor
// reads it all before deciding.

// Donor's post form: tick the documents, add up to 5 named extra ones.
export function ScholarshipDocumentsPicker({ value = [], other = [], onChange }) {
  const [types, setTypes] = useState([]);
  const [extra, setExtra] = useState('');
  useEffect(() => { apiRequest('/scholarships/document-types', { auth: false }).then(setTypes).catch(() => setTypes([])); }, []);
  const toggle = (k) => onChange({ requiredDocuments: value.includes(k) ? value.filter((x) => x !== k) : [...value, k], otherDocuments: other });
  function addExtra() {
    const name = extra.trim();
    if (!name || other.length >= 5 || other.includes(name)) return;
    onChange({ requiredDocuments: value, otherDocuments: [...other, name] });
    setExtra('');
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <span className="text-sm" style={{ fontWeight: 600 }}>Documents every applicant must upload</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 6 }}>
        {types.map((t) => <label key={t.key} className="text-sm" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={value.includes(t.key)} onChange={() => toggle(t.key)} />{t.label}</label>)}
      </div>
      {other.map((o) => <span key={o} className="text-sm">• {o} <button type="button" className="btn" style={{ padding: '1px 8px', fontSize: '0.7rem' }} onClick={() => onChange({ requiredDocuments: value, otherDocuments: other.filter((x) => x !== o) })}>Remove</button></span>)}
      {other.length < 5 && <div className="flex gap-2" style={{ maxWidth: 420 }}>
        <input className="form-input" placeholder="Other document (e.g. Hafiz-e-Quran certificate)" value={extra} onChange={(e) => setExtra(e.target.value)} />
        <button type="button" className="btn" onClick={addExtra}>Add</button>
      </div>}
    </div>
  );
}

// The applicant's form: personal, contact, education, family, reason and documents.
export function ScholarshipApplyButton({ scholarship, onFlash, onDone }) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({});
  const [reason, setReason] = useState('');
  const [docs, setDocs] = useState({}); // key -> { fileId, name } | 'uploading'
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function start() {
    setOpen(true);
    try { const r = await apiRequest(`/scholarships/${scholarship._id}/apply-form`); setInfo(r); setForm(r.prefill || {}); } catch (e) { onFlash(e.message); setOpen(false); }
  }
  async function upload(key, file) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return onFlash('Each document must be 3 MB or smaller.');
    setDocs((d) => ({ ...d, [key]: 'uploading' }));
    try {
      const r = await apiRequest(`/scholarships/${scholarship._id}/documents`, { method: 'POST', body: { key, file: { name: file.name, data: await readAsDataUrl(file) } } });
      setDocs((d) => ({ ...d, [key]: { fileId: r.fileId, name: r.name } }));
    } catch (e) { onFlash(e.message); setDocs((d) => { const n = { ...d }; delete n[key]; return n; }); }
  }
  async function submit(e) {
    e.preventDefault();
    e.stopPropagation(); // the dialog may sit inside another form on the page
    const missing = info.documents.filter((d) => !docs[d.key]?.fileId);
    if (missing.length) return onFlash(`Upload: ${missing.map((d) => d.label).join(', ')}.`);
    setBusy(true); setErrors({});
    try {
      await apiRequest(`/scholarships/${scholarship._id}/apply`, { method: 'POST', body: { form, reason, documents: info.documents.map((d) => ({ key: d.key, fileId: docs[d.key].fileId })) } });
      onFlash('Application submitted. The donor will review it.', 'success');
      setOpen(false); onDone?.();
    } catch (err) { setErrors(err.errors || {}); onFlash(err.message); } finally { setBusy(false); }
  }

  if (!open) return <button type="button" className="btn btn-primary" onClick={start}>Apply</button>;
  const groups = info ? [...new Set(info.fields.map((f) => f.group))] : [];
  const input = (f) => {
    const common = { id: `sa-${f.key}`, className: f.type === 'select' ? 'form-select' : 'form-input', value: form[f.key] || '', 'aria-invalid': Boolean(errors[f.key]), onChange: (e) => setForm({ ...form, [f.key]: e.target.value }) };
    if (f.type === 'select') return <select {...common}><option value="">Select…</option>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
    if (f.type === 'textarea') return <textarea {...common} rows={2} />;
    return <input {...common} type={f.type === 'date' ? 'date' : f.pattern === 'email' ? 'email' : f.pattern === 'phone' ? 'tel' : 'text'} inputMode={f.pattern === 'number' ? 'numeric' : undefined} placeholder={f.pattern === 'cnic' ? '35202-1234567-1' : f.pattern === 'phone' ? '03XXXXXXXXX' : ''} />;
  };
  return (<>
    <button type="button" className="btn btn-primary" disabled>Apply</button>
    {createPortal(
      <div className="u-modal-overlay open" onClick={() => !busy && setOpen(false)}>
        <form onSubmit={submit} className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Scholarship application">
          <div className="u-modal-head"><h3>Apply: {scholarship.title}</h3><button type="button" className="u-modal-close" aria-label="Close" onClick={() => setOpen(false)}>×</button></div>
          <div className="u-modal-body" style={{ display: 'grid', gap: 16 }}>
            {!info && <p role="status">Loading…</p>}
            {info && groups.map((g) => (
              <fieldset key={g} style={{ border: '1px solid var(--sand-line)', borderRadius: 10, padding: 12 }}>
                <legend className="text-sm" style={{ fontWeight: 700, padding: '0 6px' }}>{g}</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {info.fields.filter((f) => f.group === g).map((f) => (
                    <label key={f.key} htmlFor={`sa-${f.key}`} className="text-xs" style={{ display: 'grid', gap: 4, gridColumn: f.type === 'textarea' ? '1 / -1' : undefined }}>
                      <span>{f.label}{f.required ? ' *' : ''}</span>{input(f)}
                      {errors[f.key] && <span style={{ color: 'var(--rose)' }}>{errors[f.key]}</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            {info && <label className="text-xs" style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontWeight: 700 }}>Why are you applying? * (at least {info.reasonMin} characters)</span>
              <textarea className="form-input" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Your situation, your goals and how this scholarship will help." />
              <span style={{ color: 'var(--ink-soft)' }}>{reason.trim().length} characters</span>
            </label>}
            {info?.documents.length > 0 && <fieldset style={{ border: '1px solid var(--sand-line)', borderRadius: 10, padding: 12, display: 'grid', gap: 8 }}>
              <legend className="text-sm" style={{ fontWeight: 700, padding: '0 6px' }}>Required documents (PDF/PNG/JPG, up to 3 MB each)</legend>
              {info.documents.map((d) => (
                <label key={d.key} className="text-sm" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ minWidth: 220 }}>{d.label} *</span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => upload(d.key, e.target.files?.[0])} />
                  <span className="text-xs" style={{ color: docs[d.key]?.fileId ? 'var(--emerald)' : 'var(--ink-soft)' }}>{docs[d.key] === 'uploading' ? 'Uploading…' : docs[d.key]?.fileId ? `✓ ${docs[d.key].name}` : 'Not uploaded'}</span>
                </label>
              ))}
            </fieldset>}
          </div>
          <div className="u-modal-foot">
            <button type="button" className="btn" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
            {info && <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button>}
          </div>
        </form>
      </div>, document.body)}
  </>);
}

// Donor: the full application and its documents.
export function ApplicationDetails({ application, onFlash }) {
  const [open, setOpen] = useState(false);
  const f = application.form || {};
  if (!open) return <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.72rem' }} onClick={() => setOpen(true)}>View application</button>;
  const row = (label, v) => v ? <span><strong>{label}:</strong> {v}</span> : null;
  return (
    <div className="text-xs" style={{ display: 'grid', gap: 3, padding: 10, background: 'var(--sand)', borderRadius: 8, minWidth: 260 }}>
      {row('Name', f.fullName)}{row("Father's name", f.fatherName)}{row('CNIC / B-Form', f.cnic)}{row('Date of birth', f.dateOfBirth)}{row('Gender', f.gender)}
      {row('Phone', f.phone)}{row('Email', f.email)}{row('Address', [f.address, f.city, f.province, f.country].filter(Boolean).join(', '))}
      {row('Studying', [f.currentDegree, f.currentYear, f.currentInstitution].filter(Boolean).join(' · '))}{row('Last degree', `${f.lastDegree || ''}${f.lastResult ? ` (${f.lastResult})` : ''}`)}{row('Designation', f.designation)}
      {row("Father's occupation", f.fatherOccupation)}{row('Family income (PKR / month)', f.monthlyFamilyIncome)}{row('Dependents', f.dependents)}
      {row('Reason for applying', application.statement)}
      {(application.documents || []).length > 0 && <strong style={{ marginTop: 4 }}>Documents</strong>}
      {(application.documents || []).map((d) => <span key={String(d.file)}>{d.label}: <button type="button" className="btn" style={{ padding: '1px 8px', fontSize: '0.7rem' }} onClick={() => openPrivateFile(`/scholarships/applications/${application._id}/documents/${d.file}`).catch((e) => onFlash(e.message))}>Open</button></span>)}
      <button type="button" className="btn" style={{ justifySelf: 'start', padding: '1px 8px', fontSize: '0.7rem', marginTop: 4 }} onClick={() => setOpen(false)}>Hide</button>
    </div>
  );
}
