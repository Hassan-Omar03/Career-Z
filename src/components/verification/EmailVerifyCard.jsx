import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Shown on the onboarding and profile pages until the email is verified, so the code sent at sign-up
// can be entered before the account is approved.
export default function EmailVerifyCard() {
  const { user, refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  if (!user || user.emailVerified) return null;
  async function run(fn) { setBusy(true); setError(''); setNote(''); try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  const resend = () => run(async () => { await apiRequest('/auth/resend-verification', { method: 'POST' }); setNote('A new code was sent to ' + user.email + '.'); });
  const verify = (e) => { e.preventDefault(); run(async () => { await apiRequest('/auth/verify-email', { method: 'POST', body: { code: code.trim() } }); setNote('Email verified.'); await refreshProfile?.(); }); };
  return (
    <section className="vf-card" aria-labelledby="email-verify-title" style={{ marginBottom: 20 }}>
      <div className="vf-card-head"><div><h2 id="email-verify-title">Verify your email</h2><span className="vf-muted">We sent a 6-digit code to {user.email} when you signed up.</span></div></div>
      <form onSubmit={verify} className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 12 }}>
        <input className="form-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} style={{ maxWidth: 180 }} />
        <button type="submit" className="btn btn-primary" disabled={busy || code.length !== 6}>Verify</button>
        <button type="button" className="btn" disabled={busy} onClick={resend}>Send a new code</button>
      </form>
      {note && <p className="vf-muted" role="status" style={{ marginTop: 8 }}>{note}</p>}
      {error && <p className="vf-error" role="alert" style={{ marginTop: 8 }}>{error}</p>}
    </section>
  );
}
