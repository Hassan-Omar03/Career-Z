import { FaEarthAmericas, FaChevronDown } from 'react-icons/fa6';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';

// Each language is listed in its own script (never translated), so anyone can find theirs
// whatever language the page is currently in. Codes replace flag emoji, which Windows shows as
// plain letters and which the page translator used to turn into nonsense.
const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ur', label: 'اردو', name: 'اردو', rtl: true },
  { code: 'ar', label: 'AR', name: 'العربية', rtl: true },
  { code: 'zh', label: '中文', name: '中文' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'tr', label: 'TR', name: 'Türkçe' },
  { code: 'hi', label: 'HI', name: 'हिन्दी' },
  { code: 'bn', label: 'BN', name: 'বাংলা' },
  { code: 'fa', label: 'FA', name: 'فارسی', rtl: true },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'ms', label: 'MS', name: 'Bahasa Melayu' },
  { code: 'id', label: 'ID', name: 'Bahasa Indonesia' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'ja', label: 'JA', name: '日本語' },
  { code: 'ko', label: 'KO', name: '한국어' }
];

// Real, live translation (see TranslationContext) drives this — not a hardcoded per-language
// dictionary. onChange is optional, for callers that want to react to the language change too.
export default function LanguageSelector({ onChange }) {
  const { lang: active, setLang, enabled, translating } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function selectLang(lang) {
    setOpen(false);
    setLang(lang.code);
    onChange?.(lang.code);
  }

  const current = LANGUAGES.find((l) => l.code === active) || LANGUAGES[0];

  return (
    <div className="lang-select-wrap" ref={wrapRef} data-no-translate>
      <button
        className="lang-select-btn"
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <FaEarthAmericas size={18} aria-hidden="true" />
        <span className="lang-label">{translating ? '…' : current.label}</span>
        <FaChevronDown size={10} aria-hidden="true" />
      </button>
      <div className={`lang-dropdown${open ? ' open' : ''}`} role="listbox" aria-label="Language options">
        {enabled === false && (
          <p style={{ padding: '8px 12px', fontSize: 12, color: 'var(--ink-soft, #6b7280)', margin: 0 }}>
            Live translation isn't set up yet — English only for now.
          </p>
        )}
        {LANGUAGES.map((l) => (
          <button key={l.code} type="button" role="option" aria-selected={l.code === active} className={l.code === active ? 'active' : ''} onClick={() => selectLang(l)}>
            <span className="lang-code" aria-hidden="true">{l.code.toUpperCase()}</span>
            <span className="lang-name" lang={l.code} dir={l.rtl ? 'rtl' : 'ltr'}>{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
