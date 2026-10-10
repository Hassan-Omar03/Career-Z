import { useEffect, useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRightFromBracket, FaPaperPlane, FaUserPen, FaGauge, FaPlus, FaClockRotateLeft, FaCircleInfo } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { getRequirements, getMyVerificationHistory, submitForVerification, setAccountSubtype, addAccountType } from '../api/onboarding';
import { DocumentGroup, StatusBadge } from '../components/verification/VerificationParts';

const EDITABLE = ['awaiting_documents', 'rejected', 'resubmission_required'];
const MESSAGES = {
  awaiting_documents: 'Upload the mandatory documents below, then submit them for verification.',
  pending_approval: 'Your account has been submitted for verification. Please wait for admin approval.',
  under_review: 'Your documents are currently being reviewed by our administration team.',
  rejected: 'Your account verification was rejected. Please review the reason and resubmit the required documents.',
  resubmission_required: 'The admin team needs new copies of the highlighted documents.',
  suspended: 'Your account has been suspended. Contact CareerZ support if you think this is a mistake.'
};
const pretty = (v) => String(v).replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase());

export function VerificationShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="vf-page">
      <header className="vf-topbar">
        <BrandLogo className="vf-brand" />
        <div className="vf-topbar-user">
          <span className="vf-muted">{user?.email}</span>
          <button type="button" className="btn btn-ghost vf-small" onClick={async () => { await logout(); navigate('/login'); }}><FaArrowRightFromBracket aria-hidden="true" /> Log out</button>
        </div>
      </header>
      <main className="vf-main">
        <div className="vf-head"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
        {children}
      </main>
    </div>
  );
}

function RoleCard({ r, limits, onChanged }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const editable = EDITABLE.includes(r.status);
  const approved = r.status === 'approved';

  async function run(fn) {
    setError(''); setBusy(true);
    try { await fn(); await onChanged(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <section className="vf-card" aria-labelledby={`role-${r.role}`}>
      <div className="vf-card-head">
        <div><h2 id={`role-${r.role}`}>{r.label} account</h2>{r.subtype && <span className="vf-muted">{pretty(r.subtype)}</span>}</div>
        <StatusBadge status={r.status} />
      </div>

      {MESSAGES[r.status] && <p className={`vf-banner vf-banner-${['rejected', 'resubmission_required', 'suspended'].includes(r.status) ? 'bad' : r.status === 'awaiting_documents' ? 'neutral' : 'warn'}`}><FaCircleInfo aria-hidden="true" /> {MESSAGES[r.status]}</p>}
      {r.reason && ['rejected', 'resubmission_required', 'suspended'].includes(r.status) && <p className="vf-reason"><strong>Reason from the admin team:</strong> {r.reason}</p>}

      {approved && (
        <div className="vf-banner vf-banner-ok">
          {r.profileCompleted
            ? <>Your {r.label} account is active. <button type="button" className="btn btn-primary vf-small" onClick={() => navigate('/dashboard')}><FaGauge aria-hidden="true" /> Open dashboard</button></>
            : <>Your account has been approved. Complete your profile ({r.profilePercent}%) to access your dashboard. <button type="button" className="btn btn-primary vf-small" onClick={() => navigate(`/complete-profile?role=${r.role}`)}><FaUserPen aria-hidden="true" /> Complete profile</button></>}
        </div>
      )}

      {r.subtypes.length > 0 && editable && (
        <div className="form-group vf-subtype">
          <label htmlFor={`sub-${r.role}`}>Account kind</label>
          <select id={`sub-${r.role}`} className="form-select" value={r.subtype} disabled={busy} onChange={(e) => run(() => setAccountSubtype(r.role, e.target.value))}>
            {r.subtypes.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
          </select>
        </div>
      )}

      {r.status !== 'suspended' && (
        <div className="vf-groups">
          {r.documents.groups.map((g) => (
            <DocumentGroup key={`${r.subtype}-${g.label}`} role={r.role} group={g} limits={limits} editable={editable || approved}
              resubmission={r.status === 'resubmission_required' ? r.resubmissionDocuments : []} onUploaded={onChanged} warnReverify={approved} />
          ))}
        </div>
      )}

      {error && <p className="vf-error" role="alert">{error}</p>}
      {editable && (
        <div className="vf-actions">
          {!r.documents.complete && <span className="vf-muted">Upload every mandatory document to submit.</span>}
          <button type="button" className="btn btn-primary" disabled={busy || !r.documents.complete} onClick={() => run(() => submitForVerification(r.role))}>
            <FaPaperPlane aria-hidden="true" /> {r.status === 'awaiting_documents' ? 'Submit for verification' : 'Resubmit documents'}
          </button>
        </div>
      )}
    </section>
  );
}

// Verification centre: per account type status, private document uploads, submit/resubmit, history.
export default function AccountVerification() {
  const { accountStatus, refreshAccountStatus } = useAuth();
  const [limits, setLimits] = useState({ imageMb: 5, pdfMb: 10 });
  const [types, setTypes] = useState([]);
  const [history, setHistory] = useState([]);
  const [adding, setAdding] = useState({ accountType: '', subtype: '' });
  const [addError, setAddError] = useState('');

  async function reload() {
    await refreshAccountStatus();
    getMyVerificationHistory().then(setHistory).catch(() => {});
  }
  useEffect(() => {
    getRequirements().then((d) => { setLimits(d.limits); setTypes(d.accountTypes); }).catch(() => {});
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!accountStatus) return <VerificationShell title="Account verification"><p>Loading…</p></VerificationShell>;
  const held = new Set(accountStatus.roles.map((r) => r.role));
  const addable = types.filter((t) => !held.has(t.role));
  const chosen = types.find((t) => t.accountType === adding.accountType);

  async function add(e) {
    e.preventDefault(); setAddError('');
    try { await addAccountType(adding.accountType, adding.subtype || chosen?.subtypes[0]); setAdding({ accountType: '', subtype: '' }); await reload(); } catch (err) { setAddError(err.message); }
  }

  return (
    <VerificationShell title="Account verification" subtitle="Every CareerZ account is verified by our administration team before its dashboard opens. Your documents are stored privately and only you and authorized admins can see them.">
      {accountStatus.state === 'ok' && <p className="vf-banner vf-banner-ok">Your dashboard is available. <Link className="btn btn-primary vf-small" to="/dashboard"><FaGauge aria-hidden="true" /> Open dashboard</Link></p>}
      {accountStatus.roles.map((r) => <RoleCard key={r.role} r={r} limits={limits} onChanged={reload} />)}

      {addable.length > 0 && (
        <form className="vf-card vf-add" onSubmit={add}>
          <h2><FaPlus aria-hidden="true" /> Add another account type</h2>
          <div className="vf-add-row">
            <select className="form-select" aria-label="Account type" value={adding.accountType} onChange={(e) => setAdding({ accountType: e.target.value, subtype: '' })}>
              <option value="">Choose…</option>
              {addable.map((t) => <option key={t.accountType} value={t.accountType}>{t.label}</option>)}
            </select>
            {chosen?.subtypes.length > 0 && (
              <select className="form-select" aria-label="Account kind" value={adding.subtype || chosen.subtypes[0]} onChange={(e) => setAdding((a) => ({ ...a, subtype: e.target.value }))}>
                {chosen.subtypes.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
              </select>
            )}
            <button type="submit" className="btn btn-outline" disabled={!adding.accountType}>Add</button>
          </div>
          {addError && <p className="vf-error">{addError}</p>}
        </form>
      )}

      {history.length > 0 && (
        <section className="vf-card">
          <h2><FaClockRotateLeft aria-hidden="true" /> Verification history</h2>
          <ol className="vf-history">
            {history.map((h) => (
              <li key={h._id}>
                <span className="vf-muted">{new Date(h.createdAt).toLocaleString()}</span>
                <span>{pretty(h.role)}: {h.previousStatus ? `${pretty(h.previousStatus)} → ` : ''}<strong>{pretty(h.newStatus)}</strong></span>
                {h.remarks && <span className="vf-muted">{h.remarks}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </VerificationShell>
  );
}
