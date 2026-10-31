import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import PasswordField from '../components/PasswordField';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { rememberIntent } from '../utils/continueIntent';
import { startSocialLogin } from '../api/socialAuth';
import '../styles/invite.css';

// /invite/:token — the link in an institute's invitation email. New to CareerZ: choose a password
// (or continue with Google) and the account opens already joined to the institute. Already on
// CareerZ: sign in with the invited email and press Accept.
const KIND = { teacher: 'Teacher', staff: 'Staff', student: 'Student' };

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, signInWith, logout, refreshAccountStatus } = useAuth();
  const [inv, setInv] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [f, setF] = useState({ fullName: '', phone: '', password: '', acceptedTerms: false });
  useEffect(() => {
    apiRequest(`/invites/${token}`, { auth: false }).then((d) => { setInv(d); setF((x) => ({ ...x, fullName: d.name || '' })); }).catch((e) => setError(e.message));
  }, [token]);

  const sameEmail = user && inv && String(user.email).toLowerCase() === inv.email;
  async function signup(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { const data = await apiRequest(`/invites/${token}/signup`, { method: 'POST', auth: false, body: f }); await signInWith(data); navigate('/dashboard', { replace: true }); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function accept() {
    setBusy(true); setError('');
    try { await apiRequest(`/invites/${token}/accept`, { method: 'POST' }); await refreshAccountStatus?.(); navigate('/dashboard', { replace: true }); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  function signIn() { rememberIntent(`/invite/${token}`); navigate('/login'); }
  async function google() { rememberIntent(`/invite/${token}`); try { await startSocialLogin('google'); } catch (err) { setError(err.message); } }

  return (
    <>
      <PageSeo title="Invitation" description="Join your institute on CareerZ." path={`/invite/${token}`} noindex />
      <AuthNavbar />
      <main className="invite-page">
        <section className="invite-card">
          {!inv && !error && <p role="status">Opening your invitation…</p>}
          {!inv && error && <><h1>Invitation not found</h1><p className="invite-error">{error}</p><Link to="/" className="btn btn-primary">Go to CareerZ</Link></>}
          {inv && (
            <>
              <div className="invite-head">
                {inv.institution.logo ? <img src={inv.institution.logo} alt="" /> : <span className="invite-logo">{inv.institution.name?.[0]}</span>}
                <div>
                  <p className="invite-eyebrow">You are invited</p>
                  <h1>Join {inv.institution.name}</h1>
                  <p className="invite-sub">as a <b>{inv.role && inv.kind === 'staff' ? inv.role : KIND[inv.kind]}</b>{inv.designation ? ` · ${inv.designation}` : ''}{inv.department ? ` · ${inv.department}` : ''}{inv.classSection ? ` · ${inv.classSection}` : ''}{inv.institution.city ? ` · ${inv.institution.city}` : ''}</p>
                </div>
              </div>
              {inv.message && <blockquote className="invite-message">“{inv.message}”</blockquote>}

              {inv.status !== 'sent' ? (
                <p className="invite-error">{inv.status === 'accepted' ? 'This invitation was already used. Sign in to continue.' : `This invitation is ${inv.status}. Ask ${inv.institution.name} to send a new one.`}</p>
              ) : user ? (
                sameEmail ? (
                  <div className="invite-actions">
                    <p>Signed in as <b>{user.email}</b>.</p>
                    <button type="button" className="btn btn-primary" disabled={busy} onClick={accept}>{busy ? 'Joining…' : `Accept and join ${inv.institution.name}`}</button>
                  </div>
                ) : (
                  <div className="invite-actions">
                    <p>This invitation is for <b>{inv.email}</b>, but you are signed in as <b>{user.email}</b>.</p>
                    <button type="button" className="btn btn-outline" onClick={async () => { await logout(); }}>Sign out and continue</button>
                  </div>
                )
              ) : inv.accountExists ? (
                <div className="invite-actions">
                  <p>You already have a CareerZ account with <b>{inv.email}</b>. Sign in to accept.</p>
                  <button type="button" className="btn btn-primary" onClick={signIn}>Sign in to accept</button>
                </div>
              ) : (
                <form className="invite-form" onSubmit={signup}>
                  <p className="invite-note">Create your CareerZ account. Your dashboard opens straight away, already connected to {inv.institution.name}.</p>
                  <label>Email<input className="form-input" value={inv.email} readOnly /></label>
                  <label>Full name<input className="form-input" required value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></label>
                  <label>Phone (optional)<input className="form-input" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="03XX XXXXXXX" /></label>
                  <PasswordField id="invite-password" label="Choose a password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" showStrength />
                  <label className="invite-terms"><input type="checkbox" checked={f.acceptedTerms} onChange={(e) => setF({ ...f, acceptedTerms: e.target.checked })} required /> I accept the <Link to="/terms" target="_blank">Terms &amp; Conditions</Link> and the <Link to="/privacy" target="_blank">Privacy Policy</Link></label>
                  <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating your account…' : `Create account and join`}</button>
                  <div className="invite-or"><span>or</span></div>
                  <button type="button" className="btn btn-outline" onClick={google}>Continue with Google ({inv.email})</button>
                </form>
              )}
              {error && inv && <p className="invite-error">{error}</p>}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
