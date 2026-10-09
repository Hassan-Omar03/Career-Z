import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMagnifyingGlass, FaTriangleExclamation, FaIdCard } from 'react-icons/fa6';
import { listVerifications, getVerification, decideVerification } from '../../api/onboarding';
import { StatusBadge, DocumentPreview } from '../verification/VerificationParts';

const STATUS_FILTERS = [
  ['open', 'Needs action (pending + under review)'], ['pending_approval', 'Pending approval'], ['under_review', 'Under review'],
  ['resubmission_required', 'Resubmission required'], ['awaiting_documents', 'Awaiting documents'], ['approved', 'Approved'],
  ['rejected', 'Rejected'], ['suspended', 'Suspended'], ['all', 'All']
];
const ROLE_FILTERS = [['', 'All account types'], ['student', 'Student'], ['parent', 'Parent'], ['teacher', 'Teacher'], ['institution_owner', 'Institute'], ['education_agent', 'Agent'], ['donor', 'Donor'], ['marketplace_seller', 'Marketplace']];
const ACTION_LABELS = { under_review: 'Mark under review', approve: 'Approve', reject: 'Reject', request_resubmission: 'Request resubmission', suspend: 'Suspend', reinstate: 'Reinstate' };
const NEEDS_REASON = ['reject', 'request_resubmission', 'suspend'];
const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');
const pretty = (v) => String(v || '').replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase());

function Detail({ id, onBack, onFlash, currentUserId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () => getVerification(id).then(setData).catch((err) => setError(err.message));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function decide(e) {
    e.preventDefault();
    if (NEEDS_REASON.includes(action) && !reason.trim()) { setError('Write a reason the user will see.'); return; }
    if (action === 'request_resubmission' && !docs.length) { setError('Choose the documents to re-upload.'); return; }
    setBusy(true); setError('');
    try {
      await decideVerification(id, { action, reason, documents: docs });
      onFlash?.(`${ACTION_LABELS[action]} — done.`);
      setAction(''); setReason(''); setDocs([]);
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  if (error && !data) return <section className="vf-card"><button type="button" className="btn btn-ghost vf-small" onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back</button><p className="vf-error">{error}</p></section>;
  if (!data) return <section className="vf-card"><p>Loading…</p></section>;
  const { request, documents, profile, history, actions, requirements, documentTypes } = data;
  const own = String(request.user?._id) === String(currentUserId);

  return (
    <div className="vf-main" style={{ maxWidth: 'none', padding: 0 }}>
      <section className="vf-card">
        <div className="vf-card-head">
          <div>
            <button type="button" className="btn btn-ghost vf-small" onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back to list</button>
            <h2>{request.user?.fullName} — {request.accountType}{request.subtype ? ` (${pretty(request.subtype)})` : ''}</h2>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <dl className="vf-detail-grid">
          <div><dt>Email</dt><dd>{request.user?.email}</dd></div>
          <div><dt>Phone</dt><dd>{request.user?.phone || '—'}</dd></div>
          <div><dt>Registered</dt><dd>{fmt(request.user?.createdAt)}</dd></div>
          <div><dt>Submitted</dt><dd>{fmt(request.submittedAt)}</dd></div>
          <div><dt>Last reviewed</dt><dd>{fmt(request.reviewedAt)}{request.reviewedBy ? ` by ${request.reviewedBy.fullName}` : ''}</dd></div>
          <div><dt>Profile</dt><dd>{profile.completed ? 'Complete' : `${profile.percent}% complete`}</dd></div>
        </dl>
        {request.legacy && <p className="vf-banner vf-banner-neutral">Existing account, approved automatically when verification was introduced.</p>}
        {request.reviewNotes && <p className="vf-reason"><strong>Last note:</strong> {request.reviewNotes}</p>}
      </section>

      <section className="vf-card">
        <h2>Documents {requirements.complete ? <span className="vf-badge vf-ok">All mandatory uploaded</span> : <span className="vf-badge vf-bad">Mandatory missing</span>}</h2>
        {requirements.groups.filter((g) => g.mandatory && !g.satisfied).map((g) => <p key={g.label} className="vf-error"><FaTriangleExclamation aria-hidden="true" /> Missing: {g.label}</p>)}
        <div className="vf-docs">
          {documents.length === 0 && <p className="vf-muted">No documents uploaded yet.</p>}
          {documents.map((d) => (
            <div key={d._id} className={`vf-doc${d.active ? '' : ' vf-doc-inactive'}`}>
              <div className="vf-card-head">
                <div><strong>{d.label}</strong><span className="vf-muted">{d.contentType} · {(d.size / 1024).toFixed(0)} KB · uploaded {fmt(d.createdAt)}{!d.active ? ` · replaced ${fmt(d.replacedAt)}` : ''}</span></div>
                <span className={`vf-badge vf-${d.verificationStatus === 'approved' ? 'ok' : d.verificationStatus === 'rejected' ? 'bad' : 'warn'}`}>{d.active ? pretty(d.verificationStatus) : 'Previous version'}</span>
              </div>
              {d.rejectionReason && <span className="vf-error">Reason: {d.rejectionReason}</span>}
              {d.alsoUsedBy.length > 0 && <p className="vf-banner vf-banner-bad"><FaTriangleExclamation aria-hidden="true" /> The same file was also submitted by: {d.alsoUsedBy.join(', ')}</p>}
              <DocumentPreview id={d._id} label={d.label} compact />
            </div>
          ))}
        </div>
      </section>

      <section className="vf-card">
        <h2>Profile details</h2>
        <dl className="vf-detail-grid">
          {profile.fields.map((f) => <div key={f.key}><dt>{f.label}{f.required ? ' *' : ''}</dt><dd>{f.value || <span className="vf-muted">—</span>}</dd></div>)}
        </dl>
      </section>

      <section className="vf-card">
        <h2>Decision</h2>
        {own ? <p className="vf-banner vf-banner-warn">You cannot review your own account.</p> : actions.length === 0 ? <p className="vf-muted">No action is available in this status{request.status === 'awaiting_documents' ? ' — the user has not submitted documents yet' : ''}.</p> : (
          <form className="vf-decision" onSubmit={decide}>
            <div className="vf-checks" role="radiogroup" aria-label="Action">
              {actions.map((a) => <label key={a}><input type="radio" name="vf-action" checked={action === a} onChange={() => { setAction(a); setError(''); }} /> {ACTION_LABELS[a]}</label>)}
            </div>
            {action === 'request_resubmission' && (
              <fieldset className="vf-group">
                <legend>Documents to re-upload</legend>
                <div className="vf-checks">
                  {documentTypes.map((t) => <label key={t.type}><input type="checkbox" checked={docs.includes(t.type)} onChange={(e) => setDocs((list) => (e.target.checked ? [...list, t.type] : list.filter((x) => x !== t.type)))} /> {t.label}</label>)}
                </div>
              </fieldset>
            )}
            {action && (
              <div className="form-group">
                <label htmlFor="vf-reason">{NEEDS_REASON.includes(action) ? 'Reason (shown to the user) *' : 'Note (optional)'}</label>
                <textarea id="vf-reason" className="form-input" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
              </div>
            )}
            {error && <p className="vf-error" role="alert">{error}</p>}
            <div className="vf-actions"><button type="submit" className={`btn ${['reject', 'suspend'].includes(action) ? 'btn-outline' : 'btn-primary'}`} disabled={!action || busy}>{action ? ACTION_LABELS[action] : 'Choose an action'}</button></div>
          </form>
        )}
      </section>

      <section className="vf-card">
        <h2>Verification history</h2>
        {history.length === 0 ? <p className="vf-muted">No history yet.</p> : (
          <ol className="vf-history">
            {history.map((h) => (
              <li key={h._id}>
                <span className="vf-muted">{fmt(h.createdAt)} · {h.admin?.fullName || 'User / system'}</span>
                <span>{h.previousStatus ? `${pretty(h.previousStatus)} → ` : ''}<strong>{pretty(h.newStatus)}</strong></span>
                {h.remarks && <span className="vf-muted">{h.remarks}</span>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

// Admin → User Verification & Approval: queue with filters/search, then a full review screen.
export default function AdminVerificationPanel({ onFlash, currentUserId }) {
  const [filters, setFilters] = useState({ status: 'open', role: '', q: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (openId) return;
    setError('');
    listVerifications({ ...filters, page }).then(setData).catch((err) => setError(err.message));
  }, [filters, page, openId]);

  if (openId) return <Detail id={openId} onBack={() => setOpenId(null)} onFlash={onFlash} currentUserId={currentUserId} />;

  const pages = data ? Math.max(1, Math.ceil(data.total / 50)) : 1;
  return (
    <section className="vf-card">
      <div className="vf-card-head">
        <div><h2><FaIdCard aria-hidden="true" /> User Verification &amp; Approval</h2><span className="vf-muted">Review submitted documents, then approve, reject or ask for new copies.</span></div>
        {data && <span className="vf-badge vf-neutral">{data.total} request{data.total === 1 ? '' : 's'}</span>}
      </div>
      <form className="vf-admin-filters" onSubmit={(e) => { e.preventDefault(); setPage(1); setFilters((f) => ({ ...f, q: search.trim() })); }}>
        <select className="form-select" aria-label="Status" value={filters.status} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}>
          {STATUS_FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="form-select" aria-label="Account type" value={filters.role} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, role: e.target.value })); }}>
          {ROLE_FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className="form-input" type="search" placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn btn-outline vf-small"><FaMagnifyingGlass aria-hidden="true" /> Search</button>
      </form>
      {error && <p className="vf-error">{error}</p>}
      {!data ? <p>Loading…</p> : data.rows.length === 0 ? <p className="vf-muted">No requests match these filters.</p> : (
        <div className="vf-table-wrap">
          <table className="vf-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Account type</th><th>Registered</th><th>Docs</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone || '—'}</td>
                  <td>{r.accountType}{r.subtype ? <span className="vf-muted"> · {pretty(r.subtype)}</span> : ''}</td>
                  <td>{new Date(r.registeredAt).toLocaleDateString()}</td>
                  <td>{r.documents}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td><button type="button" className="btn btn-primary vf-small" onClick={() => setOpenId(r._id)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="vf-pager">
          <button type="button" className="btn btn-ghost vf-small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="vf-muted">Page {page} of {pages}</span>
          <button type="button" className="btn btn-ghost vf-small" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </section>
  );
}
