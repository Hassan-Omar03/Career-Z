import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { useState } from 'react';

function scorePassword(pw) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5);
}

const STRENGTH_LEVELS = [
  { min: 0, width: '0%', color: 'var(--sand-line)', text: '' },
  { min: 1, width: '20%', color: 'var(--rose)', text: 'Very weak' },
  { min: 2, width: '40%', color: 'var(--rose)', text: 'Weak' },
  { min: 3, width: '65%', color: 'var(--gold)', text: 'Fair' },
  { min: 4, width: '85%', color: 'var(--emerald)', text: 'Strong' },
  { min: 5, width: '100%', color: 'var(--emerald-bright)', text: 'Very strong' }
];

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  showStrength = false
}) {
  const [visible, setVisible] = useState(false);
  const level = showStrength
    ? STRENGTH_LEVELS.slice().reverse().find((l) => scorePassword(value) >= l.min) || STRENGTH_LEVELS[0]
    : null;

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          className="form-input"
          type={visible ? 'text' : 'password'}
          id={id}
          name={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        <button type="button" className="password-toggle" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
          {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
      {showStrength && (
        <>
          <div className="password-strength">
            <div className="password-strength-bar" style={{ width: level.width, background: level.color }} />
          </div>
          <span className="password-strength-label">{value ? level.text : ''}</span>
        </>
      )}
      {error && <div className="form-error show">{error}</div>}
    </div>
  );
}
