import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { openPrivateFile, readAsDataUrl } from '../recruitment/files';
import { showPrompt } from '../../utils/appDialog';

// Funding requests: a student (for themselves) or an institute owner (for the institute or a
// project) asks donors for money with supporting documents; CareerZ verifies it; then donors see
// it and donate by bank transfer.

const CATEGORIES = [['scholarship', 'Scholarship / study costs'], ['course_fee', 'Course fee'], ['institution_support', 'Institution support'], ['education_project', 'Education project'], ['learning_resources', 'Learning resources'], ['emergency_assistance', 'Emergency assistance']];
const LEVELS = [['', 'Education level'], ['primary', 'Primary'], ['secondary', 'Secondary'], ['undergraduate', 'Undergraduate'], ['graduate', 'Graduate'], ['vocational', 'Vocational']];
const statusColor = (s) => (s === 'verified' || s === 'fulfilled' || s === 'funded' ? 'var(--emerald)' : s === 'rejected' ? 'var(--rose)' : 'var(--gold)');

export function FundingDocumentLinks({ request, onFlash }) {
  const docs = request.documents || [];
  if (!docs.length) return <span>None attached</span>;
  return docs.map((d, i) => d.file
    ? <button key={i} type="button" className="btn" style={{ padding: '1px 8px', fontSize: '0.7rem', marginRight: 6 }} onClick={() => openPrivateFile(`/funding-requests/${request._id}/documents/${d.file}`).catch((e) => onFlash?.(e.message))}>{d.name || `Document ${i + 1}`}</button>
    : <a key={i} href={d.url} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>{d.name || `Document ${i + 1}`}</a>);
}

export function MyFundingRequests({ onFlash, owner = false }) {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const blank = { requestType: owner ? 'institution' : 'student', category: owner ? 'institution_support' : 'scholarship', educationLevel: '', title: '', purpose: '', requiredAmount: '', currency: 'PKR', country: 'Pakistan', institution: '', applicationDeadline: '' };
  const [f, setF] = useState(blank);
  const [docs, setDocs] = useState([]); // [{ name, fileId, uploading }]
  const [docName, setDocName] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => apiRequest('/funding-requests/mine/list').then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); if (owner) apiRequest('/institutions/mine/list').then((list) => { setInstitutions(list || []); if (list?.[0]) setF((x) => ({ ...x, institution: list[0]._id })); }).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addDoc(file) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return onFlash('Each document must be 3 MB or smaller.');
    const name = docName.trim() || file.name;
    const tmp = { name, uploading: true };
    setDocs((d) => [...d, tmp]);
    try {
      const r = await apiRequest('/funding-requests/documents', { method: 'POST', body: { file: { name: file.name, data: await readAsDataUrl(file) } } });
      setDocs((d) => d.map((x) => (x === tmp ? { name, fileId: r.fileId } : x)));
      setDocName('');
    } catch (e) { onFlash(e.message); setDocs((d) => d.filter((x) => x !== tmp)); }
  }
  async function submit(e) {
    e.preventDefault();
    if (!docs.some((d) => d.fileId)) return onFlash('Upload at least one supporting document.');
    setBusy(true);
    try {
      await apiRequest('/funding-requests', { method: 'POST', body: { ...f, requiredAmount: Number(f.requiredAmount), applicationDeadline: f.applicationDeadline || null, institution: owner ? f.institution : undefined, educationLevel: owner ? undefined : f.educationLevel, documents: docs.filter((d) => d.fileId).map((d) => ({ name: d.name, fileId: d.fileId })) } });
      onFlash('Request sent. CareerZ checks it, then donors can see it.', 'success');
      setOpen(false); setF(blank); setDocs([]); load();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16, display: 'grid', gap: 10 }}>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
        <h4 className="font-semibold" style={{ margin: 0 }}>My funding requests</h4>
        {!open && <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>+ Request funding</button>}
      </div>
      {open && <form onSubmit={submit} style={{ display: 'grid', gap: 10, padding: 12, background: 'var(--sand)', borderRadius: 10 }}>
        {owner && <div className="flex gap-2 flex-wrap">
          <select className="form-select" value={f.requestType} onChange={(e) => setF({ ...f, requestType: e.target.value })} style={{ maxWidth: 220 }}><option value="institution">For the institute</option><option value="project">For a project</option></select>
          {institutions.length > 1 && <select className="form-select" value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} style={{ maxWidth: 260 }}>{institutions.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}</select>}
        </div>}
        <div className="flex gap-2 flex-wrap">
          <select className="form-select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} style={{ maxWidth: 260 }}>{CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          {!owner && <select className="form-select" value={f.educationLevel} onChange={(e) => setF({ ...f, educationLevel: e.target.value })} style={{ maxWidth: 200 }}>{LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
        </div>
        <input className="form-input" required maxLength={120} placeholder="Title (e.g. Semester 5 tuition fee, BS Computer Science)" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea className="form-input" required rows={4} placeholder="What is the money for, why you need it, and how it will be used (at least 50 characters)" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} />
        <div className="flex gap-2 flex-wrap">
          <input className="form-input" required type="number" min="1" placeholder="Amount needed" value={f.requiredAmount} onChange={(e) => setF({ ...f, requiredAmount: e.target.value })} style={{ maxWidth: 180 }} />
          <select className="form-select" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} style={{ maxWidth: 110 }}>{['PKR', 'USD', 'GBP', 'AED', 'SAR'].map((c) => <option key={c}>{c}</option>)}</select>
          <input className="form-input" placeholder="Country" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} style={{ maxWidth: 180 }} />
          <label className="text-xs" style={{ display: 'grid' }}>Needed by<input className="form-input" type="date" value={f.applicationDeadline} onChange={(e) => setF({ ...f, applicationDeadline: e.target.value })} /></label>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <span className="text-sm" style={{ fontWeight: 600 }}>Supporting documents (fee voucher, result card, estimate, CNIC… PDF/JPG, up to 3 MB)</span>
          {docs.map((d, i) => <span key={i} className="text-xs">{d.uploading ? 'Uploading… ' : '✓ '}{d.name} {!d.uploading && <button type="button" className="btn" style={{ padding: '0 6px', fontSize: '0.7rem' }} onClick={() => setDocs(docs.filter((x) => x !== d))}>Remove</button>}</span>)}
          {docs.length < 8 && <div className="flex gap-2 flex-wrap" style={{ alignItems: 'center' }}>
            <input className="form-input" placeholder="Document name (e.g. Fee voucher)" value={docName} onChange={(e) => setDocName(e.target.value)} style={{ maxWidth: 260 }} />
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => { addDoc(e.target.files?.[0]); e.target.value = ''; }} />
          </div>}
        </div>
        <div className="flex gap-2"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send for verification'}</button><button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button></div>
      </form>}
      {rows === null && <p role="status" className="text-sm">Loading…</p>}
      {rows?.length === 0 && !open && <p className="text-sm" style={{ color: 'var(--ink-soft)', margin: 0 }}>No requests yet. Ask donors for help with fees, courses or projects.</p>}
      {(rows || []).map((r) => (
        <div key={r._id} className="text-sm" style={{ borderTop: '1px solid var(--sand-line)', paddingTop: 8, display: 'grid', gap: 2 }}>
          <span><strong>{r.title}</strong> · {r.currency} {Number(r.collectedAmount || 0).toLocaleString()} of {Number(r.requiredAmount).toLocaleString()} collected</span>
          <span className="text-xs">CareerZ check: <strong style={{ color: statusColor(r.verificationStatus) }}>{r.verificationStatus === 'pending' ? 'being checked' : r.verificationStatus}</strong>{r.verificationNote ? ` · ${r.verificationNote}` : ''} · Status: <strong style={{ color: statusColor(r.status) }}>{r.status}</strong></span>
        </div>
      ))}
    </div>
  );
}

// CareerZ staff: check new requests and their documents before donors see them.
export function AdminFundingReview({ onFlash }) {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState(null);
  const load = () => apiRequest(`/funding-requests/admin/review?status=${status}`).then(setRows).catch((e) => { setRows([]); onFlash(e.message); });
  useEffect(() => { setRows(null); load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(r, verificationStatus) {
    const note = verificationStatus === 'rejected' ? await showPrompt('Why is it rejected? The person is told.', { title: 'Reject funding request', required: true }) : '';
    if (verificationStatus === 'rejected' && !note) return;
    try { await apiRequest(`/funding-requests/${r._id}/verify`, { method: 'PATCH', body: { verificationStatus, note } }); onFlash(verificationStatus === 'verified' ? 'Verified. Donors are told.' : 'Rejected. The person is told.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  return (
    <div className="card" style={{ padding: 16, margin: '16px 0', display: 'grid', gap: 10 }}>
      <h4 className="font-semibold" style={{ margin: 0 }}>Funding requests</h4>
      <nav className="cz-tabbar">{[['pending', 'To check'], ['verified', 'Verified'], ['rejected', 'Rejected']].map(([k, l]) => <button key={k} type="button" className={`cz-tab${status === k ? ' active' : ''}`} onClick={() => setStatus(k)}>{l}</button>)}</nav>
      {rows === null && <p role="status" className="text-sm">Loading…</p>}
      {rows?.length === 0 && <p className="admin-notice">Nothing here.</p>}
      {(rows || []).map((r) => (
        <article key={r._id} style={{ border: '1px solid var(--sand-line)', borderRadius: 10, padding: 12, display: 'grid', gap: 4 }}>
          <span className="text-sm"><strong>{r.title}</strong> · {r.requestType}{r.institution?.name ? ` · ${r.institution.name}` : ''} · {r.currency} {Number(r.requiredAmount).toLocaleString()}</span>
          <span className="text-xs">By {r.requestedBy?.fullName} · {r.requestedBy?.email}{r.requestedBy?.phone ? <> · <a href={`tel:${r.requestedBy.phone}`}>{r.requestedBy.phone}</a></> : ''} · {new Date(r.createdAt).toLocaleDateString()}</span>
          <span className="text-xs" style={{ whiteSpace: 'pre-wrap' }}>{r.purpose}</span>
          <span className="text-xs">Documents: <FundingDocumentLinks request={r} onFlash={onFlash} /></span>
          {r.verificationNote && <span className="text-xs">Note: {r.verificationNote}</span>}
          {status === 'pending' && <div className="flex gap-2"><button type="button" className="btn btn-primary" onClick={() => decide(r, 'verified')}>Verify</button><button type="button" className="btn" onClick={() => decide(r, 'rejected')}>Reject</button></div>}
        </article>
      ))}
    </div>
  );
}
