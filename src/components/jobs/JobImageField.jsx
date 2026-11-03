import { useState } from 'react';
import { FaImage, FaTrashCan } from 'react-icons/fa6';
import { uploadToPlatformStorage } from '../../utils/platformUpload';

const MAX_MB = 5;

// The optional picture of a job, such as its newspaper advert.
export default function JobImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setError('Choose a JPG, PNG or WEBP image.'); return; }
    if (file.size > MAX_MB * 1048576) { setError(`The image is too large. The limit is ${MAX_MB} MB.`); return; }
    setBusy(true);
    try { onChange(await uploadToPlatformStorage(file, 'job-images')); } catch (err) { setError(err.message || 'The image could not be uploaded. Try again.'); }
    setBusy(false);
  }
  return (
    <div className="hiring-field jd-image-field">
      <span>Job image (optional)</span>
      {value && <img className="jd-image-preview" src={value} alt="Job" />}
      <div className="jde-actions">
        <label className={`btn btn-outline btn-sm${busy ? ' vf-disabled' : ''}`}>
          <FaImage aria-hidden="true" /> {busy ? 'Uploading…' : value ? 'Change image' : 'Upload image'}
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={pick} />
        </label>
        {value && !busy && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}><FaTrashCan aria-hidden="true" /> Remove</button>}
      </div>
      <small className="jde-hint">JPG, PNG or WEBP, up to {MAX_MB} MB. For example the newspaper advert. You can post the job without an image.</small>
      {error && <p className="vf-error" role="alert" style={{ margin: 0 }}>{error}</p>}
    </div>
  );
}
