import { LANGUAGES } from './LanguageSelector';

// Shown once, when the site opened in the language of the visitor's region.
export default function LanguageNotice({ lang, onChange, onClose }) {
  const current = LANGUAGES.find((l) => l.code === lang);
  return (
    <div className="lang-notice" role="status">
      <span className="lang-notice-text">This site opened in <strong data-no-translate>{current?.name || lang}</strong> for your region.</span>
      <select className="form-select" aria-label="Choose language" data-no-translate value={lang} onChange={(e) => onChange(e.target.value)}>
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
      </select>
      <button type="button" className="btn btn-primary" onClick={onClose}>OK</button>
    </div>
  );
}
