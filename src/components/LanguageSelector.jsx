import { FaEarthAmericas, FaChevronDown } from 'react-icons/fa6';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰', name: 'اردو' },
  { code: 'ar', label: 'AR', flag: '🇸🇦', name: 'Arabic' },
  { code: 'zh', label: '中文', flag: '🇨🇳', name: 'Chinese' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'French' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'German' },
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Spanish' },
  { code: 'tr', label: 'TR', flag: '🇹🇷', name: 'Turkish' },
  { code: 'hi', label: 'HI', flag: '🇮🇳', name: 'Hindi' },
  { code: 'bn', label: 'BN', flag: '🇧🇩', name: 'Bengali' },
  { code: 'fa', label: 'FA', flag: '🇮🇷', name: 'Persian' },
  { code: 'ru', label: 'RU', flag: '🇷🇺', name: 'Russian' },
  { code: 'ms', label: 'MS', flag: '🇲🇾', name: 'Malay' },
  { code: 'id', label: 'ID', flag: '🇮🇩', name: 'Indonesian' },
  { code: 'pt', label: 'PT', flag: '🇵🇹', name: 'Portuguese' },
  { code: 'it', label: 'IT', flag: '🇮🇹', name: 'Italian' },
  { code: 'ja', label: 'JA', flag: '🇯🇵', name: 'Japanese' },
  { code: 'ko', label: 'KO', flag: '🇰🇷', name: 'Korean' }
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
    <div className="lang-select-wrap" ref={wrapRef}>
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
          <button key={l.code} className={l.code === active ? 'active' : ''} onClick={() => selectLang(l)}>
            <span className="flag">{l.flag}</span> {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
