import { useState } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Buy without an account: name, email and phone, then the 6-digit code from the email.
// The light buyer account is signed in right here, so the order form appears next.
export default function QuickCheckout() {
  const { signInWith } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '' }), [code, setCode] = useState(''), [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function start(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await apiRequest('/marketplace/quick-checkout/start', { method: 'POST', auth: false, body: f }); setSent(true); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function verify(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { const data = await apiRequest('/marketplace/quick-checkout/verify', { method: 'POST', auth: false, body: { email: f.email, code } }); await signInWith(data); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  if (sent) return (
    <form className="quick-checkout" onSubmit={verify}>
      <strong>Enter the code we emailed to {f.email}</strong>
      <label>6-digit code<input className="form-input" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" /></label>
      {error && <p className="dp-error" role="alert">{error}</p>}
      <div className="dc-actions"><button type="submit" className="btn btn-primary" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Confirm and continue'}</button><button type="button" className="btn" disabled={busy} onClick={() => { setSent(false); setCode(''); }}>Change details</button></div>
      <small>No email? Check spam, or press “Change details” and send again.</small>
    </form>
  );
  return (
    <form className="quick-checkout" onSubmit={start}>
      <strong>Buy without an account</strong>
      <p>No sign-up needed. We email you a code to confirm it is you; then you order and pay right here, and track the order at “My orders”.</p>
      <label>Full name<input className="form-input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label>Email<input className="form-input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label>Phone<input className="form-input" type="tel" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="03001234567" /></label>
      {error && <p className="dp-error" role="alert">{error}</p>}
      <div className="dc-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Email me a code'}</button></div>
    </form>
  );
}
