import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { rememberIntent, clearIntent } from '../../utils/continueIntent';

// The one place a public listing turns into an action (apply, order, admission). It decides what
// the visitor sees from their real account state; the server enforces the same rules again.
//   not signed in        → Log in / Create account, remembering this listing
//   pending / rejected…  → why they cannot act yet, and where to continue
//   wrong account type   → which accounts can do this
//   eligible             → the form, submitted to the existing endpoint

const STATE_TEXT = {
  awaiting_documents: ['Upload your verification documents', 'Your account needs its verification documents before you can continue.', '/onboarding'],
  pending_approval: ['Your account is waiting for approval', 'CareerZ is reviewing your account. You will be brought back here once it is approved.', '/onboarding'],
  under_review: ['Your documents are being reviewed', 'You will be brought back here once your account is approved.', '/onboarding'],
  resubmission_required: ['Some documents need to be uploaded again', 'Fix the requested documents, then you can continue here.', '/onboarding'],
  rejected: ['Your account was not approved', 'See the reason and how to correct it on your verification page.', '/onboarding'],
  profile_incomplete: ['Complete your profile first', 'Your account is approved. Fill in the remaining profile details to continue.', '/complete-profile'],
  suspended: ['Your account is suspended', 'Restricted actions are blocked while the account is suspended. Contact support for help.', '/contact']
};

const ROLE_LABEL = { student: 'Student', teacher: 'Teacher', parent: 'Parent' };

// `custom`: for an eligible account, show this instead of the built-in form (e.g. a full application dialog).
export default function ActionPanel({ kind, item, autoOpen, actionLabel, eligibleRoles, signupType, children, onSubmit, successText, trackLink, custom }) {
  const { user, accountStatus, refreshAccountStatus } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(false);
  const path = `/${kind}/${item._id}?action=${kind === 'marketplace' ? 'order' : kind === 'institutes' ? 'admission' : kind === 'courses' ? 'enroll' : 'apply'}`;
  const title = item.title || item.name;

  useEffect(() => { if (user && !accountStatus) refreshAccountStatus?.(); }, [user]);
  const roles = accountStatus?.accessibleRoles || [];
  const state = user ? accountStatus?.state : null;
  const eligible = !eligibleRoles || roles.some((r) => eligibleRoles.includes(r));
  useEffect(() => { if (autoOpen && state === 'ok' && eligible) { setOpen(true); clearIntent(); } }, [autoOpen, state, eligible]);

  function goAuth(target) {
    rememberIntent(path, title);
    navigate(target === 'signup' && signupType ? `/signup?type=${signupType}` : `/${target}`);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await onSubmit(); setDone(true); setOpen(false); }
    catch (err) {
      // The server re-checks everything; show its reason (e.g. already applied, closed, wrong account).
      setError(err.message || 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  if (done) return <div className="dp-action ok" role="status"><strong>{successText}</strong>{trackLink && <p><Link to={trackLink.to} state={trackLink.state}>{trackLink.label}</Link></p>}</div>;

  if (!user) {
    return <div className="dp-action">
      <strong>{actionLabel}</strong>
      <p>Browsing is free. To {actionLabel.toLowerCase()} you need a {eligibleRoles ? eligibleRoles.map((r) => ROLE_LABEL[r] || r).join(' or ') : 'verified'} account. After you sign in{signupType ? ' or register' : ''}, we bring you back to this {kind === 'institutes' ? 'institute' : 'listing'}.</p>
      <div className="dc-actions"><button type="button" className="btn btn-primary" onClick={() => goAuth('login')}>Log in to continue</button><button type="button" className="btn" onClick={() => goAuth('signup')}>Create account</button></div>
    </div>;
  }
  if (!accountStatus) return <div className="dp-action" role="status">Checking your account…</div>;
  if (state !== 'ok') {
    const [heading, text, to] = STATE_TEXT[state] || ['Your account is not ready yet', 'Finish your account setup to continue.', '/onboarding'];
    return <div className="dp-action warn" role="status"><strong>{heading}</strong><p>{text}</p>
      <button type="button" className="btn btn-primary" onClick={() => { if (state !== 'suspended') rememberIntent(path, title); navigate(to); }}>{state === 'suspended' ? 'Contact support' : 'Continue setup'}</button></div>;
  }
  if (!eligible) {
    return <div className="dp-action warn" role="status"><strong>This needs a {eligibleRoles.map((r) => ROLE_LABEL[r] || r).join(' or ')} account</strong>
      <p>You are signed in with a different account type. {actionLabel} is available to {eligibleRoles.map((r) => (ROLE_LABEL[r] || r).toLowerCase() + 's').join(' and ')}.</p></div>;
  }
  if (!open) return <div className="dp-action"><button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>{actionLabel}</button></div>;
  if (custom) return <div className="dp-action">{custom}</div>;
  return <form className="dp-action" onSubmit={submit}>
    <strong>{actionLabel}: {title}</strong>
    {children}
    {error && <p className="dp-error" role="alert">{error}</p>}
    <div className="dc-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : `Submit`}</button><button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button></div>
  </form>;
}

export const post = (path, body) => apiRequest(path, { method: 'POST', body });
