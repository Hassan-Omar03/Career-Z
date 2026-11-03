import { useEffect, useRef, useState } from 'react';
import { FaCircleCheck, FaCircleXmark, FaClock, FaFilePdf, FaUpload, FaArrowsRotate, FaEye, FaDownload, FaTriangleExclamation, FaBan, FaMagnifyingGlass, FaHourglassHalf, FaPlus, FaTrashCan } from 'react-icons/fa6';
import { uploadVerificationDocument, fetchVerificationDocument, removeVerificationDocument } from '../../api/onboarding';

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

// Quick checks for a friendly message — the server re-checks the real bytes.
function fileProblem(file, imageOnly, limits) {
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const isImage = /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
  if (!isPdf && !isImage) return `${file.name}: upload a JPG, PNG or PDF file.`;
  if (imageOnly && isPdf) return 'This must be a JPG or PNG image.';
  const maxMb = isPdf ? limits.pdfMb : limits.imageMb;
  if (file.size > maxMb * 1048576) return `${file.name} is too large — maximum ${maxMb} MB.`;
  return '';
}

// A further file under one document, with its own view and remove buttons.
function FileRow({ doc, label, editable, onRemoved, onError, badge }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm('Remove this file?')) return;
    setBusy(true); onError('');
    try { await removeVerificationDocument(doc._id); await onRemoved?.(); } catch (err) { onError(err.message); setBusy(false); }
  }
  return (
    <div className="vf-file">
      <div className="vf-slot-main">
        <Thumb id={doc._id} contentType={doc.contentType} label={label} />
        <div className="vf-slot-text">
          <strong>{doc.originalName || label}</strong>
          <span className="vf-muted">{(doc.size / 1024).toFixed(0)} KB</span>
          {badge && <span className="vf-badge vf-info">{badge}</span>}
          {doc.alternateNote && <span className="vf-muted">{doc.alternateNote}</span>}
          {DOC_STATUS[doc.verificationStatus] && <span className={`vf-badge vf-${DOC_STATUS[doc.verificationStatus][1]}`}>{DOC_STATUS[doc.verificationStatus][0]}</span>}
          {doc.verificationStatus === 'rejected' && doc.rejectionReason && <span className="vf-error">Reason: {doc.rejectionReason}</span>}
        </div>
        <div className="vf-slot-actions">
          <button type="button" className="btn btn-ghost vf-small" onClick={() => setShow((v) => !v)}><FaEye aria-hidden="true" /> {show ? 'Hide' : 'View'}</button>
          {editable && <button type="button" className="btn btn-ghost vf-small" disabled={busy} onClick={remove}><FaTrashCan aria-hidden="true" /> Remove</button>}
        </div>
      </div>
      {show && <DocumentPreview id={doc._id} label={label} />}
    </div>
  );
}

// One document slot: shows what is uploaded (private preview), upload/replace with progress.
export function DocumentSlot({ role, option, mandatory, limits, editable, highlight, onUploaded, warnReverify }) {
  const inputRef = useRef(null);
  const addRef = useRef(null);
  const more = option.files?.slice(1) || [];
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const doc = option.uploaded;
  const accept = option.imageOnly ? 'image/jpeg,image/png' : 'image/jpeg,image/png,application/pdf';

  // add keeps the files already here. Several files go up one after another.
  async function pick(list, add = false) {
    setError('');
    const chosen = [...(list || [])];
    if (!chosen.length) return;
    const problem = chosen.map((f) => fileProblem(f, option.imageOnly, limits)).find(Boolean);
    if (problem) { setError(problem); return; }
    if (!add && warnReverify && !window.confirm('Your account is already approved. Replacing this document sends your account back for re-verification. Continue?')) return;
    setProgress(0);
    try {
      for (let i = 0; i < chosen.length; i += 1) {
        await uploadVerificationDocument({ role, documentType: option.type, file: chosen[i], add, onProgress: (p) => setProgress(Math.round((i + p / 100) / chosen.length * 100)) });
      }
      setShowPreview(false);
      await onUploaded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
      if (addRef.current) addRef.current.value = '';
    }
  }

  async function removeFirst() {
    if (!window.confirm('Remove this file?')) return;
    setError('');
    try { await removeVerificationDocument(doc._id); await onUploaded?.(); } catch (err) { setError(err.message); }
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
              <input ref={inputRef} type="file" accept={accept} hidden multiple={option.multiple && !doc} disabled={progress !== null} onChange={(e) => pick(e.target.files, option.multiple && !doc)} />
            </label>
          )}
          {editable && doc && option.multiple && <button type="button" className="btn btn-ghost vf-small" onClick={removeFirst}><FaTrashCan aria-hidden="true" /> Remove</button>}
        </div>
      </div>
      {progress !== null && <div className="vf-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>}
      {error && <p className="vf-error" role="alert">{error}</p>}
      {showPreview && doc && <DocumentPreview id={doc._id} label={option.label} />}
      {more.map((f) => <FileRow key={f._id} doc={f} label={option.label} editable={editable} onRemoved={onUploaded} onError={setError} />)}
      {editable && doc && option.multiple && (
        <label className={`btn btn-outline vf-small vf-add-file${progress !== null ? ' vf-disabled' : ''}`}>
          <FaPlus aria-hidden="true" /> Add another file
          <input ref={addRef} type="file" accept={accept} hidden multiple disabled={progress !== null} onChange={(e) => pick(e.target.files, true)} />
        </label>
      )}
    </div>
  );
}

// For someone who does not have a required document: another paper, and a note saying what it is.
function AlternateForm({ role, group, limits, onUploaded, onClose }) {
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  async function send() {
    setError('');
    if (note.trim().length < 5) { setError('Write what this document is and why you do not have the required one.'); return; }
    if (!files.length) { setError('Choose at least one file.'); return; }
    const problem = files.map((f) => fileProblem(f, false, limits)).find(Boolean);
    if (problem) { setError(problem); return; }
    setProgress(0);
    try {
      for (let i = 0; i < files.length; i += 1) {
        await uploadVerificationDocument({ role, documentType: group.alternateType, file: files[i], alternate: note.trim(), onProgress: (p) => setProgress(Math.round((i + p / 100) / files.length * 100)) });
      }
      await onUploaded?.();
      onClose();
    } catch (err) { setError(err.message); setProgress(null); }
  }
  return (
    <div className="vf-alternate-form">
      <strong>Upload an alternate document</strong>
      <span className="vf-muted">The admin team will read your note and decide whether this document is enough.</span>
      <label className="hiring-field"><span>What is this document, and why don't you have "{group.label}"?</span>
        <textarea className="form-input" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: my CNIC is not issued yet, so I am sending my Matric certificate." />
      </label>
      <input className="form-input" type="file" multiple accept="image/jpeg,image/png,application/pdf" aria-label="Alternate document files" onChange={(e) => setFiles([...e.target.files])} />
      {progress !== null && <div className="vf-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>}
      {error && <p className="vf-error" role="alert">{error}</p>}
      <div className="vf-slot-actions">
        <button type="button" className="btn btn-primary vf-small" disabled={progress !== null} onClick={send}><FaUpload aria-hidden="true" /> Upload</button>
        <button type="button" className="btn btn-ghost vf-small" disabled={progress !== null} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// A requirement group; groups with alternatives (CNIC front+back OR B-Form) get a switch.
export function DocumentGroup({ role, group, limits, editable, resubmission = [], onUploaded, warnReverify }) {
  const uploadedIndex = group.options.findIndex((set) => set.some((o) => o.uploaded));
  const [choice, setChoice] = useState(uploadedIndex >= 0 ? uploadedIndex : 0);
  const set = group.options[choice] || group.options[0];
  const [altOpen, setAltOpen] = useState(false);
  const [altError, setAltError] = useState('');
  const hasOwnDocument = group.options.some((s) => s.every((o) => o.uploaded));
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
      {group.alternates?.map((d) => <FileRow key={d._id} doc={d} label={group.label} editable={editable} onRemoved={onUploaded} onError={setAltError} badge="Alternate document" />)}
      {altError && <p className="vf-error" role="alert">{altError}</p>}
      {editable && group.mandatory && group.alternateType && !hasOwnDocument && (altOpen
        ? <AlternateForm role={role} group={group} limits={limits} onUploaded={onUploaded} onClose={() => setAltOpen(false)} />
        : <button type="button" className="btn btn-ghost vf-small vf-add-file" onClick={() => setAltOpen(true)}>{group.alternates?.length ? 'Add another alternate document' : "I don't have this document"}</button>)}
    </fieldset>
  );
}
