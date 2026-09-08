import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import PasswordField from '../components/PasswordField';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Email is required.';
    if (!code.trim()) next.code = 'Enter the reset code from your email.';
    if (!password || password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!confirm || confirm !== password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await resetPassword({ email, code, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setServerError(err.message || 'Could not reset your password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthNavbar />
      <section className="auth-shell">
        <div className="auth-wrap">
          <Link to="/login" className="auth-back">← Back to sign in</Link>

          <div className="auth-card reveal in">
            <div className="auth-head">
              <div className="eyebrow">Account recovery</div>
              <h1>Set a new password</h1>
              <p>Enter the reset code we sent you and choose a strong new password.</p>
            </div>

            {success && (
              <div className="auth-success show">
                <span className="dot"></span>
                <span>Your password has been updated. Redirecting to sign in…</span>
              </div>
            )}
            {serverError && (
              <div className="auth-success show" style={{ background: 'var(--rose)', color: '#fff' }}>
                <span>{serverError}</span>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="reset-email">Email address</label>
                <input
                  className="form-input" type="email" id="reset-email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div className="form-error show">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="reset-code">Reset code</label>
                <input
                  className="form-input" type="text" id="reset-code" placeholder="6-digit code from your email" maxLength={6}
                  value={code} onChange={(e) => setCode(e.target.value)}
                />
                {errors.code && <div className="form-error show">{errors.code}</div>}
              </div>

              <PasswordField
                id="reset-password" label="New password" placeholder="Enter new password" autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} showStrength
              />
              <PasswordField
                id="reset-confirm" label="Confirm new password" placeholder="Re-enter new password" autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm}
              />

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Updating…' : 'Update Password'}
              </button>
            </form>

            <div className="auth-foot">
              <Link to="/login">Back to Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
