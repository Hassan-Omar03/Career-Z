import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { openPrivateFile, readAsDataUrl } from '../recruitment/files';

// Upload, replace, download or remove the student's own CV file (PDF/Word, private).
// `resume` is the current Resume; `onChange(resume)` receives the updated one.
export const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export async function uploadCvFile(file) {
  if (file.size > 2 * 1024 * 1024) throw new Error('The CV must be 2 MB or smaller.');
  return apiRequest('/resumes/me/cv-file', { method: 'POST', body: { name: file.name, data: await readAsDataUrl(file) } });
}

export default function CvFileUpload({ resume, onChange, onFlash }) {
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadCvFile(file)); onFlash?.('CV uploaded.', 'success'); } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!window.confirm('Remove your uploaded CV file? Applications you already sent keep their copy.')) return;
    setBusy(true);
    try { onChange(await apiRequest('/resumes/me/cv-file', { method: 'DELETE' })); onFlash?.('CV file removed.', 'success'); } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
      <label className="btn btn-primary" style={{ cursor: busy ? 'wait' : 'pointer', padding: '6px 16px', fontSize: '0.8rem' }}>
        {busy ? 'Uploading…' : resume?.cvFile ? 'Replace CV file' : 'Upload CV (PDF/Word, up to 2 MB)'}
        <input type="file" accept={CV_ACCEPT} onChange={pick} disabled={busy} style={{ display: 'none' }} />
      </label>
      {resume?.cvFile && <>
        <span className="text-xs">{resume.cvFileName || 'CV file'}</span>
        <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => openPrivateFile('/resumes/me/cv-file', { download: true, filename: resume.cvFileName || 'CV' }).catch((e) => onFlash?.(e.message))}>Download</button>
        <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} disabled={busy} onClick={remove}>Remove</button>
      </>}
    </div>
  );
}
