import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { downloadCvPdf } from '../dashboard/CvDesigner';
import { uploadCvFile, CV_ACCEPT } from '../dashboard/CvFileUpload';
import { openPrivateFile } from '../recruitment/files';
import GuidedResumeBuilder from '../dashboard/GuidedResumeBuilder';

// "CV to send" on the job apply form (Indeed-style): the main CV, any CV Version, or the
// uploaded CV file, each with a preview. With no CV yet: upload one here, or build one.
const hasContent = (cv) => cv && (cv.summary || cv.headline || (cv.experience || []).length || (cv.education || []).length || (cv.skills || []).length);

export default function CvChoice({ value, onChange }) {
  const { user } = useAuth();
  const [resume, setResume] = useState(null), [variants, setVariants] = useState([]), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [building, setBuilding] = useState(null);
  useEffect(() => {
    Promise.all([apiRequest('/resumes/me'), apiRequest('/resumes/variants').catch(() => [])]).then(([r, v]) => {
      setResume(r); setVariants(v);
      const def = v.find((x) => x.isDefault);
      onChange(def ? def._id : hasContent(r) ? 'main' : r.cvFile ? 'file' : '');
    }).catch((e) => setError(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (error) return <p className="dp-error">{error}</p>;
  if (!resume) return <p className="dp-note">Loading your CVs…</p>;

  const person = { fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '', city: user?.city || '', country: user?.country || '' };
  const options = [
    ...variants.map((v) => ({ value: v._id, label: `${v.name}${v.isDefault ? ' (default)' : ''}`, note: v.targetRole || 'CV Version', preview: () => downloadCvPdf(v, person, v.template) })),
    ...(hasContent(resume) ? [{ value: 'main', label: 'My CareerZ CV', note: 'From CV/Resume Builder', preview: () => downloadCvPdf(resume, person, resume.template || 'ats') }] : []),
    ...(resume.cvFile ? [{ value: 'file', label: resume.cvFileName || 'Uploaded CV file', note: 'Uploaded file', preview: () => openPrivateFile('/resumes/me/cv-file') }] : [])
  ];
  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setError('');
    try { const r = await uploadCvFile(file); setResume(r); onChange('file'); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const preview = (o) => Promise.resolve(o.preview()).catch((e) => setError(e.message || 'Could not open the CV.'));

  // The CV builder right here; what is built is saved as the person's CareerZ CV.
  if (building) return <GuidedResumeBuilder resume={building} setResume={setBuilding} user={user} onFlash={(m, kind) => (kind === 'success' ? null : setError(m))}
    onExit={() => setBuilding(null)} onFinish={(cv) => { setResume(cv); setBuilding(null); onChange('main'); }} finishLabel="Use this CV for my application" />;

  return (
    <fieldset style={{ border: '1px solid var(--sand-line)', borderRadius: 12, padding: 12, display: 'grid', gap: 8, margin: 0 }}>
      <legend style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 6px' }}>CV to send</legend>
      {options.length === 0 && <p className="dp-note" style={{ margin: 0 }}>You have no CV yet. Build one here (manually or with AI), or upload a CV file.</p>}
      {options.map((o) => (
        <label key={o.value} style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, flexWrap: 'wrap' }}>
          <input type="radio" name="cv-choice" checked={value === o.value} onChange={() => onChange(o.value)} required />
          <span style={{ flex: '1 1 160px', minWidth: 0 }}><strong>{o.label}</strong> <small style={{ color: 'var(--ink-soft)' }}>· {o.note}</small></span>
          <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.75rem' }} onClick={() => preview(o)}>Preview</button>
        </label>
      ))}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setBuilding({ ...resume })}>{hasContent(resume) ? 'Edit my CareerZ CV here' : 'Build a CV here'}</button>
      <label className="btn" style={{ cursor: busy ? 'wait' : 'pointer', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600 }}>
        {busy ? 'Uploading…' : resume.cvFile ? 'Upload a different CV file' : 'Upload a CV file (PDF/Word, up to 2 MB)'}
        <input type="file" accept={CV_ACCEPT} onChange={upload} disabled={busy} style={{ display: 'none' }} />
      </label>
      <Link className="text-xs" to="/dashboard" state={{ workspace: (user?.roles || []).includes('student') ? 'student' : 'teacher', tab: 'jobs', sub: 'resume' }}>Full CV builder &amp; templates</Link>
      </div>
    </fieldset>
  );
}
