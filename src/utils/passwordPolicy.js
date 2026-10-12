// Mirrors the backend rule (src/utils/passwordPolicy.js): the server enforces it, this only
// gives instant feedback while typing.
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One capital letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One small letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'special', label: 'One special character (! @ # $ % …)', test: (p) => /[^A-Za-z0-9\s]/.test(p) }
];

export function passwordProblems(password = '') {
  return PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label);
}

export function passwordError(password = '') {
  const missing = passwordProblems(password);
  return missing.length ? `Password needs: ${missing.map((m) => m.toLowerCase()).join(', ')}.` : '';
}
