import { useRef, useState } from 'react';
import { apiRequest } from '../../api/client';
import { CvPreview, downloadCvPdf } from './CvDesigner';
import { CvAutofillButton } from './CareerTools';
import AiCvDraftButton, { mergeDraft } from './AiCvDraft';
import './guided-resume.css';

const steps = [
  ['Contact & headline', 'Your account provides your name and contact details. Add a title that describes the work you want.'],
  ['Summary', 'Introduce your strengths and the work you want to do in a few clear sentences.'],
  ['Education', 'Add your qualifications, starting with the most recent.'],
  ['Experience', 'Include employment, internships, teaching or volunteer work. Focus on what you contributed.'],
  ['Skills', 'List relevant skills, languages and certifications.'],
  ['Portfolio/links', 'Share projects and links that help employers understand your work.'],
  ['Review', 'Check your details and selected design before downloading.']
];

// `save` replaces saving to the account (a guest's CV lives only in the page); `guest` hides the
// account-only helpers; `onFinish` adds a final button (e.g. "Use this CV" on the apply form).
export default function GuidedResumeBuilder({ resume, setResume, user, onFlash, onExit, onTemplates, save, guest = false, onFinish, finishLabel = 'Use this CV' }) {
  const [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  const lock = useRef(false), heading = useRef(null);
  const update = (key, value) => { setSaved(false); setResume(r => ({ ...r, [key]: value })); };
  const row = (key, index, field, value) => update(key, (resume[key] || []).map((r, i) => i === index ? { ...r, [field]: value } : r));
  const field = (key, label, hint, multiline = false) => <label className="guided-cv-field">{label}{multiline
    ? <textarea className="form-input" rows={4} value={resume[key] || ''} onChange={e => update(key, e.target.value)} />
    : <input className="form-input" value={resume[key] || ''} onChange={e => update(key, e.target.value)} />}{hint && <small>{hint}</small>}</label>;
  async function persist(next) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      if (save) await save(resume); else await apiRequest('/resumes/me', { method: 'PATCH', body: resume });
      setSaved(true);
      if (next !== undefined) { setStep(next); requestAnimationFrame(() => heading.current?.focus()); }
      return true;
    } catch (e) { setError(e.message || 'Could not save. Please try again.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  function rows(key, fields, blank, label) {
    return <div className="guided-cv-rows">{(resume[key] || []).map((item, index) => <div className="guided-cv-row" key={index}>
      <strong>{label} {index + 1}</strong>
      {fields.map(([name, title, multiline]) => <label className="guided-cv-field" key={name}>{title}{multiline
        ? <textarea className="form-input" rows={3} value={item[name] || ''} onChange={e => row(key, index, name, e.target.value)} />
        : <input className="form-input" value={item[name] || ''} onChange={e => row(key, index, name, e.target.value)} />}</label>)}
      <button type="button" className="btn" onClick={() => update(key, resume[key].filter((_, i) => i !== index))}>Remove {label.toLowerCase()}</button>
    </div>)}<button type="button" className="btn" onClick={() => update(key, [...(resume[key] || []), { ...blank }])}>+ Add {label.toLowerCase()}</button></div>;
  }
  return <section className={`guided-cv${step === 6 ? ' guided-cv-review' : ''}`}>
    <div className="guided-cv-top"><div><h3>Build your CV, one step at a time</h3><p>Your progress is saved whenever you choose Next or Skip.</p></div><button type="button" className="btn" disabled={busy} onClick={onExit}>Use single form</button></div>
    <ol className="guided-cv-progress" aria-label="CV building steps">{steps.map(([label], i) => <li key={label} aria-current={step === i ? 'step' : undefined}><span>{i < step ? '✓' : i + 1}</span>{label}</li>)}</ol>
    <div className="guided-cv-layout">
      <div role="form" aria-label="CV builder" className="card guided-cv-editor">
        <h3 ref={heading} tabIndex={-1}>Step {step + 1}: {steps[step][0]}</h3><p>{steps[step][1]}</p>
        {error && <p role="alert">{error} Your changes are still here. Retry saving before leaving.</p>}
        <fieldset disabled={busy}>
          {step === 0 && <>
            <div className="guided-cv-contact"><strong>{user?.fullName}</strong><p>{[user?.email, user?.phone].filter(Boolean).join(' · ')}</p><small>{guest ? 'Contact details come from the application form.' : 'Contact details come from your account profile.'}</small></div>
            {!guest && <div className="guided-cv-actions"><CvAutofillButton onFilled={r => { setResume(r); setSaved(false); }} onFlash={onFlash} /><AiCvDraftButton onFlash={onFlash} onDraft={d => { setResume(r => mergeDraft(r, d)); setSaved(false); }} /></div>}
            {field('headline', 'Professional headline', 'For example: Physics Teacher or Frontend Developer')}
            {field('location', 'Location', 'City and country')}
            <label className="guided-cv-field">Experience level<select className="form-select" value={resume.experienceLevel || ''} onChange={e => update('experienceLevel', e.target.value)}><option value="">Not specified</option>{['entry', 'mid', 'senior', 'lead'].map(v => <option key={v} value={v}>{v === 'lead' ? 'Lead / Manager' : v[0].toUpperCase() + v.slice(1)}</option>)}</select></label>
          </>}
          {step === 1 && field('summary', 'Professional summary', 'Use facts you can support. You can come back to this later.', true)}
          {step === 2 && rows('education', [['institution', 'Institution'], ['degree', 'Degree / qualification'], ['year', 'Year']], { institution: '', degree: '', year: '' }, 'Education')}
          {step === 3 && rows('experience', [['title', 'Job title'], ['company', 'Company / institution'], ['duration', 'Duration'], ['description', 'Responsibilities and achievements', true]], { title: '', company: '', duration: '', description: '' }, 'Experience')}
          {step === 4 && ['skills', 'languages', 'certifications'].map(key => <label className="guided-cv-field" key={key}>{key[0].toUpperCase() + key.slice(1)}<input className="form-input" value={(resume[key] || []).join(',')} onChange={e => update(key, e.target.value.split(','))} /><small>Separate entries with commas.</small></label>)}
          {step === 5 && <>{field('linkedinUrl', 'LinkedIn profile URL')}{rows('portfolio', [['title', 'Project title'], ['url', 'Project link'], ['description', 'Short description', true]], { title: '', url: '', description: '' }, 'Project')}</>}
          {step === 6 && <div className="guided-cv-actions"><button type="button" className="btn btn-primary" onClick={async () => { if (await persist()) { try { await downloadCvPdf(resume, user || {}, resume.template || 'modern'); } catch(e) { setError(e.message || 'Could not download PDF.'); } } }}>Download PDF</button>{onTemplates && <button type="button" className="btn" onClick={async () => { if(await persist()) onTemplates(); }}>Choose another template</button>}{onFinish && <button type="button" className="btn btn-primary" disabled={busy} onClick={async () => { if (await persist()) onFinish(resume); }}>{finishLabel}</button>}</div>}
        </fieldset>
        <div className="guided-cv-actions guided-cv-footer"><button type="button" className="btn" disabled={busy || step === 0} onClick={() => { setStep(s => s - 1); setError(''); }}>Back</button>{step > 0 && step < 6 && <button type="button" className="btn" disabled={busy} onClick={() => persist(step + 1)}>Skip</button>}<button type="button" className="btn btn-primary" disabled={busy} onClick={() => persist(step < 6 ? step + 1 : undefined)}>{busy ? 'Saving…' : step === 6 ? 'Save CV' : 'Next'}</button></div>
        <p role="status" className="guided-cv-save">{saved ? 'Progress saved.' : 'Changes save on Next, Skip or Save CV.'}</p>
      </div>
      <aside className="guided-cv-preview cv-designer" aria-label="Live CV preview"><h3>Live preview</h3><div className="cvd-preview"><CvPreview cv={resume} user={user} /></div></aside>
    </div>
  </section>;
}
