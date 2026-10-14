// "Continue where you left off": when a visitor clicks Apply / Order / Request on a public listing
// without being able to act yet, the listing is remembered here. After login, sign-up, document
// verification, approval and profile completion, the dashboard guard sends them straight back to
// it (with the action open). Only CareerZ listing paths are accepted, so this can never become an
// open redirect to another site.

const KEY = 'careerz_continue_v1';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // approval can take days
const ALLOWED = /^\/(jobs|scholarships|marketplace|institutes|donors)\/[a-f0-9]{24}(\?action=(apply|order|admission))?$/;

export function isSafeContinuePath(path) {
  return typeof path === 'string' && ALLOWED.test(path);
}

export function rememberIntent(path, label = '') {
  if (!isSafeContinuePath(path)) return;
  try { localStorage.setItem(KEY, JSON.stringify({ path, label: String(label).slice(0, 140), savedAt: Date.now() })); } catch { /* storage blocked: the user can still find the listing again */ }
}

export function peekIntent() {
  try {
    const intent = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!intent || !isSafeContinuePath(intent.path) || Date.now() - intent.savedAt > MAX_AGE_MS) return null;
    return intent;
  } catch { return null; }
}

export function takeIntent() {
  const intent = peekIntent();
  try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
  return intent;
}

export function clearIntent() {
  try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
}
