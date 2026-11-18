import { useState } from 'react';
import { apiRequest } from '../../api/client';

// Two-step sign-in with an authenticator app (master 5.7), next to the email-code option.
// Setup: scan the QR code, type the app's code to confirm, keep the one-use backup codes.
export default function AuthenticatorApp({ user, onFlash, onChanged }) {
  const on = user?.twoFactorMethod === 'totp' && user?.twoFactorEnabled;
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run(fn) {
    setBusy(true);
    try { await fn(); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  const start = () => run(async () => { setSetup(await apiRequest('/auth/2fa/totp/setup', { method: 'POST' })); setCode(''); });
  const confirm = (e) => { e.preventDefault(); run(async () => {
    const r = await apiRequest('/auth/2fa/totp/enable', { method: 'POST', body: { code: code.trim() } });
    setBackupCodes(r.backupCodes); setSetup(null); setCode('');
    onFlash('Authenticator app turned on.', 'success'); onChanged?.();
  }); };
  const turnOff = (e) => { e.preventDefault(); run(async () => {
    await apiRequest('/auth/2fa/totp/disable', { method: 'POST', body: { code: code.trim() } });
    setCode(''); setBackupCodes(null);
    onFlash('Authenticator app turned off. Sign-in codes come by email again.', 'success'); onChanged?.();
  }); };
  const newCodes = () => run(async () => {
    const r = await apiRequest('/auth/2fa/totp/backup-codes', { method: 'POST', body: { code: code.trim() } });
    setBackupCodes(r.backupCodes); setCode('');
  });
  const saveCodes = () => {
    const blob = new Blob([`CareerZ backup codes for ${user?.email}\nEach code works once.\n\n${backupCodes.join('\n')}\n`], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'careerz-backup-codes.txt'; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <section className="acct-section"><div className="acct-section-head"><h4>Authenticator App</h4><p>Use Google Authenticator, Microsoft Authenticator or a similar app instead of email codes.</p></div>
      <div className="acct-form">
        <p className="text-sm" style={{ fontWeight: 700, margin: 0 }}><span className={`acct-2fa-state${on ? ' on' : ''}`}>{on ? 'On' : 'Off'}</span></p>
        {backupCodes && (
          <div className="admin-notice">
            <p style={{ marginTop: 0 }}><strong>Your backup codes.</strong> Save them now; they are shown only once. Each code signs you in once if you lose your phone.</p>
            <p style={{ fontFamily: 'monospace', columns: 2, margin: '8px 0' }}>{backupCodes.map((c) => <span key={c} style={{ display: 'block' }}>{c}</span>)}</p>
            <button type="button" className="btn" onClick={saveCodes}>Download codes</button>
          </div>
        )}
        {!on && !setup && <button type="button" className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={busy} onClick={start}>Set up authenticator app</button>}
        {!on && setup && (
          <form onSubmit={confirm} className="acct-form">
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>1. Open your authenticator app and scan this code. 2. Type the 6-digit code it shows.</p>
            <img src={setup.qr} alt="QR code for your authenticator app" width={180} height={180} style={{ background: '#fff', padding: 8, borderRadius: 12 }} />
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>Cannot scan? Enter this key in the app: <code style={{ wordBreak: 'break-all' }}>{setup.secret}</code></p>
            <label className="institution-field"><span>Code from the app</span><input className="form-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} /></label>
            <span className="flex gap-2"><button type="submit" className="btn btn-primary" disabled={busy || code.length !== 6}>Turn on</button><button type="button" className="btn" onClick={() => setSetup(null)}>Cancel</button></span>
          </form>
        )}
        {on && (
          <form onSubmit={turnOff} className="acct-form">
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>At sign-in you type the code from your app. To turn it off or make new backup codes, enter a current code (or a backup code).</p>
            <label className="institution-field"><span>Current code</span><input className="form-input" autoComplete="one-time-code" maxLength={11} value={code} onChange={(e) => setCode(e.target.value)} /></label>
            <span className="flex gap-2"><button type="button" className="btn" disabled={busy || !code.trim()} onClick={newCodes}>New backup codes</button><button type="submit" className="btn" disabled={busy || !code.trim()}>Turn off</button></span>
          </form>
        )}
      </div>
    </section>
  );
}
