// The language for a visitor: the one chosen in their browser's language settings, in the
// browser's own order. A language the site cannot translate into is skipped; English otherwise.
export function detectLanguage(browserLanguages, supported) {
  const list = browserLanguages || (typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : []) || [];
  const allowed = supported?.length ? new Set(supported) : null;
  for (const item of list) {
    const base = String(item || '').toLowerCase().split('-')[0];
    if (!base) continue;
    if (base === 'en') return 'en';
    if (!allowed || allowed.has(base)) return base;
  }
  return 'en';
}
