import { useEffect, useRef, useState } from 'react';
import { FaCircleCheck, FaCircleXmark, FaClock, FaFilePdf, FaUpload, FaArrowsRotate, FaEye, FaDownload, FaTriangleExclamation, FaBan, FaMagnifyingGlass, FaHourglassHalf } from 'react-icons/fa6';
import { uploadVerificationDocument, fetchVerificationDocument } from '../../api/onboarding';

export const STATUS_META = {
  awaiting_documents: { label: 'Documents needed', tone: 'neutral', icon: FaUpload },
  pending_approval: { label: 'Pending approval', tone: 'warn', icon: FaHourglassHalf },
  under_review: { label: 'Under review', tone: 'info', icon: FaMagnifyingGlass },
  approved: { label: 'Approved', tone: 'ok', icon: FaCircleCheck },
  rejected: { label: 'Rejected', tone: 'bad', icon: FaCircleXmark },
  resubmission_required: { label: 'Resubmission required', tone: 'bad', icon: FaArrowsRotate },
  suspended: { label: 'Suspended', tone: 'bad', icon: FaBan }
};

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: 'neutral', icon: FaClock };
  return <span className={`vf-badge vf-${meta.tone}`}><meta.icon aria-hidden="true" /> {meta.label}</span>;
}

const DOC_STATUS = { pending: ['Awaiting check', 'warn'], approved: ['Verified', 'ok'], rejected: ['Rejected', 'bad'] };

// Loads a private document with the session token and keeps a blob URL for previews/downloads.
export function useDocumentBlob(id, enabled = true) {
  const [state, setState] = useState({ url: null, type: '', error: '' });
  useEffect(() => {
    if (!id || !enabled) return undefined;
    let url = null; let cancelled = false;
    fetchVerificationDocument(id).then((blob) => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      setState({ url, type: blob.type, error: '' });
    }).catch((err) => { if (!cancelled) setState({ url: null, type: '', error: err.message }); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [id, enabled]);
  return state;
}

export function DocumentPreview({ id, label, compact = false }) {
  const [open, setOpen] = useState(!compact);
  const { url, type, error } = useDocumentBlob(id, open);
  if (!open) return <button type="button" className="btn btn-ghost vf-small" onClick={() => setOpen(true)}><FaEye aria-hidden="true" /> Preview</button>;
  if (error) return <p className="vf-error">{error}</p>;
  if (!url) return <div className="vf-preview vf-loading">Loading…</div>;
  return (
    <div className="vf-preview">
      {type === 'application/pdf'
        ? <iframe title={label} src={url} />
        : <img src={url} alt={label} />}
      <div className="vf-preview-actions">
        <a className="btn btn-ghost vf-small" href={url} target="_blank" rel="noreferrer"><FaEye aria-hidden="true" /> Open</a>
        <a className="btn btn-ghost vf-small" href={url} download={`${label}${type === 'application/pdf' ? '.pdf' : type === 'image/png' ? '.png' : '.jpg'}`}><FaDownload aria-hidden="true" /> Download</a>
      </div>
    </div>
  );
}

function Thumb({ id, contentType, label }) {
  const isImage = contentType !== 'application/pdf';
  const { url } = useDocumentBlob(id, isImage);
  if (!isImage) return <span className="vf-thumb vf-thumb-pdf"><FaFilePdf aria-hidden="true" /></span>;
  return url ? <img className="vf-thumb" src={url} alt={label} /> : <span className="vf-thumb" />;
}

// One document slot: shows what is uploaded (private preview), upload/replace with progress.
export function DocumentSlot({ role, option, mandatory, limits, editable, highlight, onUploaded, warnReverify }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const doc = option.uploaded;
  const accept = option.imageOnly ? 'image/jpeg,image/png' : 'image/jpeg,image/png,application/pdf';

  async function pick(file) {
    setError('');
    if (!file) return;
    // Quick checks for a friendly message — the server re-checks the real bytes.
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    const isImage = /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!isPdf && !isImage) { setError('Upload a JPG, PNG or PDF file.'); return; }
    if (option.imageOnly && isPdf) { setError('This must be a JPG or PNG image.'); return; }
    const maxMb = isPdf ? limits.pdfMb : limits.imageMb;
    if (file.size > maxMb * 1048576) { setError(`File too large — maximum ${maxMb} MB.`); return; }
    if (warnReverify && !window.confirm('Your account is already approved. Replacing this document sends your account back for re-verification. Continue?')) return;
    setProgress(0);
    try {
      await uploadVerificationDocument({ role, documentType: option.type, file, onProgress: setProgress });
      setShowPreview(false);
      await onUploaded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const docStatus = doc ? DOC_STATUS[doc.verificationStatus] : null;
  return (
    <div className={`vf-slot${highlight ? ' vf-slot-highlight' : ''}${!doc && mandatory ? ' vf-slot-missing' : ''}`}>
      <div className="vf-slot-main">
        {doc ? <Thumb id={doc._id} contentType={doc.contentType} label={option.label} /> : <span className="vf-thumb vf-thumb-empty"><FaUpload aria-hidden="true" /></span>}
        <div className="vf-slot-text">
          <strong>{option.label}{mandatory && <span className="vf-req" title="Mandatory"> *</span>}</strong>
          <span className="vf-muted">{option.imageOnly ? `JPG or PNG, up to ${limits.imageMb} MB` : `JPG, PNG or PDF (images ${limits.imageMb} MB, PDF ${limits.pdfMb} MB)`}</span>
          {doc && <span className="vf-muted">{doc.originalName || 'Uploaded file'} · {(doc.size / 1024).toFixed(0)} KB</span>}
          {docStatus && <span className={`vf-badge vf-${docStatus[1]}`}>{docStatus[0]}</span>}
          {doc?.verificationStatus === 'rejected' && doc.rejectionReason && <span className="vf-error">Reason: {doc.rejectionReason}</span>}
          {highlight && <span className="vf-error"><FaTriangleExclamation aria-hidden="true" /> The admin asked you to upload this again.</span>}
        </div>
        <div className="vf-slot-actions">
          {doc && <button type="button" className="btn btn-ghost vf-small" onClick={() => setShowPreview((v) => !v)}><FaEye aria-hidden="true" /> {showPreview ? 'Hide' : 'View'}</button>}
          {editable && (
            <label className={`btn ${doc ? 'btn-outline' : 'btn-primary'} vf-small${progress !== null ? ' vf-disabled' : ''}`}>
              {doc ? <><FaArrowsRotate aria-hidden="true" /> Replace</> : <><FaUpload aria-hidden="true" /> Upload</>}
              <input ref={inputRef} type="file" accept={accept} hidden disabled={progress !== null} onChange={(e) => pick(e.target.files?.[0])} />
            </label>
          )}
        </div>
      </div>
      {progress !== null && <div className="vf-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>}
      {error && <p className="vf-error" role="alert">{error}</p>}
      {showPreview && doc && <DocumentPreview id={doc._id} label={option.label} />}
    </div>
  );
}

// A requirement group; groups with alternatives (CNIC front+back OR B-Form) get a switch.
export function DocumentGroup({ role, group, limits, editable, resubmission = [], onUploaded, warnReverify }) {
  const uploadedIndex = group.options.findIndex((set) => set.some((o) => o.uploaded));
  const [choice, setChoice] = useState(uploadedIndex >= 0 ? uploadedIndex : 0);
  const set = group.options[choice] || group.options[0];
  return (
    <fieldset className={`vf-group${group.satisfied ? ' vf-group-done' : ''}`}>
      <legend>
        {group.satisfied ? <FaCircleCheck className="vf-ok-icon" aria-hidden="true" /> : <FaClock aria-hidden="true" />} {group.label}
        {group.mandatory ? <span className="vf-req-tag">Mandatory</span> : <span className="vf-opt-tag">Optional</span>}
      </legend>
      {group.options.length > 1 && (
        <div className="vf-choice" role="radiogroup" aria-label={`${group.label} options`}>
          {group.options.map((opt, i) => (
            <label key={i} className={i === choice ? 'active' : ''}>
              <input type="radio" name={`${role}-${group.label}`} checked={i === choice} onChange={() => setChoice(i)} />
              {opt.map((o) => o.label).join(' + ')}
            </label>
          ))}
        </div>
      )}
      {set.map((option) => (
        <DocumentSlot key={option.type} role={role} option={option} mandatory={group.mandatory} limits={limits} editable={editable}
          highlight={resubmission.includes(option.type)} onUploaded={onUploaded} warnReverify={warnReverify} />
      ))}
    </fieldset>
  );
}
