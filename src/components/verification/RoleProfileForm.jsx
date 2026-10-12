import { useEffect, useMemo, useState } from 'react';
import { FaFloppyDisk, FaCircleCheck, FaPen } from 'react-icons/fa6';
import { saveProfile } from '../../api/onboarding';

const PATTERNS = {
  cnic: [/^\d{5}-?\d{7}-?\d$/, 'Enter 13 digits, e.g. 35202-1234567-1.'],
  phone: [/^\+?[0-9][0-9\s-]{8,16}$/, 'Enter a valid phone number.'],
  email: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
  year: [/^(19[5-9]\d|20\d\d)$/, 'Enter a 4-digit year.'],
  url: [/^https?:\/\/\S+$/, 'Enter a full link starting with http(s)://']
};
const MASK = '••••';
const pretty = (v) => String(v).replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase());

// The mandatory, role-specific profile. Progress is saved to the server; "complete" is only
// accepted by the server when every required field is valid.
export default function RoleProfileForm({ roleStatus, onSaved, onFlash, completeLabel = 'Complete profile' }) {
  const fields = roleStatus.profile.fields;
  const student = roleStatus.role === 'student';
  const initial = useMemo(() => Object.fromEntries(fields.map((f) => [f.key, f.value ?? ''])), [fields]);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [showMissing, setShowMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(!roleStatus.profileCompleted && !roleStatus.profile.saved);
  const [savedValues, setSavedValues] = useState(initial);
  useEffect(() => { if (!editing) { setValues(initial); setSavedValues(initial); } }, [initial]);

  const filled = (f) => (f.sensitive ? Boolean(values[f.key]) : String(values[f.key] ?? '').trim() !== '');
  const required = fields.filter((f) => f.required);
  const missing = required.filter((f) => !filled(f));
  // Recalculated live, including when a value is removed.
  const percent = required.length ? Math.round(((required.length - missing.length) / required.length) * 100) : 100;

  function localErrors() {
    const next = {};
    for (const f of fields) {
      const v = String(values[f.key] ?? '').trim();
      if (!v || v === MASK) continue;
      if (f.pattern && PATTERNS[f.pattern] && !PATTERNS[f.pattern][0].test(v)) next[f.key] = PATTERNS[f.pattern][1];
      if (f.type === 'date' && (Number.isNaN(new Date(v).getTime()) || new Date(v) > new Date())) next[f.key] = 'Enter a valid date in the past.';
    }
    return next;
  }

  async function save(finish) {
    if (!editing || busy) return;
    setMessage('');
    // Editing an already-complete profile just saves; the server recalculates completion, so
    // clearing a required field makes it incomplete again (and locks that dashboard).
    const complete = finish && (student || !roleStatus.profileCompleted);
    const errs = localErrors();
    setErrors(errs);
    if (finish) setShowMissing(true);
    if (!student && finish && roleStatus.profileCompleted && missing.length && !window.confirm('Some required fields are empty. Saving will mark your profile incomplete and lock this dashboard until you fill them. Continue?')) return;
    if (Object.keys(errs).length) return;
    if (complete && missing.length) { setMessage('Fill in the highlighted required fields.'); return; }
    // Only send fields that changed; the masked CNIC means "keep the saved one".
    const changed = Object.fromEntries(fields.filter((f) => student || values[f.key] !== initial[f.key]).map((f) => [f.key, values[f.key]]));
    setBusy(true);
    try {
      const result = await saveProfile(roleStatus.role, changed, complete);
      setSavedValues({ ...values });
      setEditing(false);
      setMessage(result.reverification ? 'Saved. Because you changed verified identity details, the admin team will re-verify your account.' : result.completed ? 'Your profile is complete.' : `Progress saved (${result.percent}%).`);
      onFlash?.(result.completed && !roleStatus.profileCompleted ? 'Your profile is complete. You can now access your dashboard.' : 'Profile saved.');
      await onSaved?.(result);
    } catch (err) {
      if (err.errors?.fields) setErrors(err.errors.fields);
      if (err.errors?.missing) setShowMissing(true);
      setMessage(err.message);
    } finally { setBusy(false); }
  }

  function input(f) {
    const common = { id: `pf-${f.key}`, className: f.type === 'select' ? 'form-select' : 'form-input', 'aria-invalid': Boolean(errors[f.key] || (showMissing && f.required && !filled(f))), value: values[f.key] ?? '', onChange: (e) => setValues((v) => ({ ...v, [f.key]: e.target.value })) };
    if (f.sensitive && values[f.key] === MASK) {
      return <div className="vf-masked"><span>Saved · ending in {f.last4 || '••••'}</span><button type="button" className="btn btn-ghost vf-small" onClick={() => setValues((v) => ({ ...v, [f.key]: '' }))}><FaPen aria-hidden="true" /> Change</button></div>;
    }
    if(f.type === 'image') return <div>{values[f.key]&&<img src={values[f.key]} alt="Your profile" style={{width:80,height:80,objectFit:'cover',borderRadius:12,marginBottom:10}}/>}<input id={`pf-${f.key}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{
      const file=e.target.files?.[0];if(!file)return;
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){setErrors(prev=>({...prev,[f.key]:'Choose a JPG, PNG or WebP image up to 5 MB.'}));return;}
      try {const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');const scale=Math.min(1,320/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);setValues(prev=>({...prev,[f.key]:canvas.toDataURL('image/jpeg',0.8)}));setErrors(prev=>({...prev,[f.key]:''}));}finally{URL.revokeObjectURL(url);}}catch{setErrors(prev=>({...prev,[f.key]:'This image could not be opened.'}));}
    }}/>{values[f.key]&&<button type="button" className="btn btn-ghost vf-small" onClick={()=>setValues(prev=>({...prev,[f.key]:''}))}>Remove photo</button>}</div>;
    if (f.type === 'select') return <select {...common}><option value="">Select…</option>{f.options.map((o) => <option key={o} value={o}>{pretty(o)}</option>)}</select>;
    if (f.type === 'textarea') return <textarea {...common} rows={3} />;
    if (f.type === 'date') return <input {...common} type="date" max={new Date().toISOString().slice(0, 10)} />;
    return <input {...common} type={f.pattern === 'email' ? 'email' : f.pattern === 'phone' ? 'tel' : 'text'} placeholder={f.pattern === 'cnic' ? '35202-1234567-1' : f.pattern === 'phone' ? '+92 300 1234567' : ''} />;
  }

  return (
    <form className="vf-profile" noValidate onSubmit={(e) => { e.preventDefault(); save(true); }}>
      {!editing && <div className="vf-actions"><button type="button" className="btn btn-outline" disabled={busy} onClick={() => { setErrors({}); setShowMissing(false); setMessage(''); setEditing(true); }}><FaPen aria-hidden="true" /> Edit profile</button></div>}
      <div className="vf-percent">
        <div className="vf-percent-head"><strong>{percent}% complete</strong><span className="vf-muted">{missing.length ? `${missing.length} required field${missing.length > 1 ? 's' : ''} left` : 'All required fields filled'}</span></div>
        <div className="vf-progress"><span style={{ width: `${percent}%` }} /></div>
      </div>
      <fieldset className="saved-form-fields" disabled={busy}><div className="vf-fields">
        {fields.map((f) => {
          const isMissing = showMissing && f.required && !filled(f);
          return (
            <div key={f.key} className={`form-group${f.type === 'textarea' ? ' vf-wide' : ''}${isMissing || errors[f.key] ? ' vf-field-missing' : ''}`}>
              <label htmlFor={`pf-${f.key}`}>{f.label}{f.required ? <span className="vf-req"> *</span> : <span className="vf-muted"> (optional)</span>}</label>
              {editing ? input(f) : <div className="vf-saved-value">{f.type === 'image' ? (values[f.key] ? <img src={values[f.key]} alt="Your profile" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} /> : 'No photo') : f.sensitive && values[f.key] ? `Saved · ending in ${f.last4 || '••••'}` : String(values[f.key] ?? '').trim() || 'Not provided'}</div>}
              {errors[f.key] ? <div className="form-error show">{errors[f.key]}</div> : isMissing ? <div className="form-error show">This field is required.</div> : null}
            </div>
          );
        })}
      </div></fieldset>
      {message && <p className="vf-note" role="status">{message}</p>}
      {editing && <div className="vf-actions">
        {!student&&<button type="button" className="btn btn-outline" disabled={busy} onClick={() => save(false)}><FaFloppyDisk aria-hidden="true" /> Save progress</button>}
        <button type="submit" className="btn btn-primary" disabled={busy}><FaCircleCheck aria-hidden="true" /> {student?'Save profile':roleStatus.profileCompleted ? 'Save changes' : completeLabel}</button>
        {(roleStatus.profileCompleted || roleStatus.profile.saved) && <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => { setValues(savedValues); setErrors({}); setShowMissing(false); setMessage(''); setEditing(false); }}>Cancel</button>}
      </div>}
    </form>
  );
}
