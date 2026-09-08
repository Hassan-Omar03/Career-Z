import { useEffect, useRef, useState } from 'react';

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

const RTL_LANGS = ['ur', 'ar', 'fa', 'he'];

export default function LanguageSelector({ onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('en');
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function selectLang(lang) {
    setActive(lang.code);
    setOpen(false);
    document.documentElement.lang = lang.code;
    document.documentElement.dir = RTL_LANGS.includes(lang.code) ? 'rtl' : 'ltr';
    onChange?.(lang.code);
  }

  const current = LANGUAGES.find((l) => l.code === active);

  return (
    <div className="lang-select-wrap" ref={wrapRef}>
      <button
        className="lang-select-btn"
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        <span className="globe">🌐</span>
        <span className="lang-label">{current.label}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>
      <div className={`lang-dropdown${open ? ' open' : ''}`} role="listbox" aria-label="Language options">
        {LANGUAGES.map((l) => (
          <button key={l.code} className={l.code === active ? 'active' : ''} onClick={() => selectLang(l)}>
            <span className="flag">{l.flag}</span> {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
