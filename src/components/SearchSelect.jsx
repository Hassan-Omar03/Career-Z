import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FaChevronDown, FaXmark } from 'react-icons/fa6';

const MAX_SHOWN = 80;
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Accessible searchable dropdown (combobox + listbox). Type to filter, arrows to move,
// Enter to choose, Escape to close. With allowCustom, a value not in the list can be used
// (e.g. a village missing from the dataset).
export default function SearchSelect({ id, label, value, options, onChange, placeholder = 'Search…', disabled = false, loading = false, allowCustom = false, error, required = false, emptyText = 'No matches' }) {
  const autoId = useId();
  const inputId = id || autoId;
  const listId = `${inputId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const matches = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return options.slice(0, MAX_SHOWN);
    const starts = [], contains = [];
    for (const o of options) {
      const f = fold(o);
      if (f.startsWith(q)) starts.push(o); else if (f.includes(q)) contains.push(o);
      if (starts.length >= MAX_SHOWN) break;
    }
    return [...starts, ...contains].slice(0, MAX_SHOWN);
  }, [options, query]);
  const custom = allowCustom && query.trim() && !options.some((o) => fold(o) === fold(query.trim())) ? query.trim() : null;
  const items = custom ? [...matches, { custom }] : matches;

  useEffect(() => { setActive(0); }, [query, open]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!wrapRef.current?.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  useEffect(() => { listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' }); }, [active]);

  function choose(item) {
    const v = typeof item === 'string' ? item : item.custom;
    onChange(v);
    setOpen(false);
    setQuery('');
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && open && items[active]) { e.preventDefault(); choose(items[active]); }
    else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  }

  return (
    <div className="form-group search-select" ref={wrapRef}>
      {label && <label htmlFor={inputId}>{label}{required && <span className="vf-req"> *</span>}</label>}
      <div className={`search-select-control${disabled ? ' disabled' : ''}`}>
        <input
          id={inputId} className="form-input" type="text" autoComplete="off" role="combobox"
          aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-invalid={Boolean(error)}
          aria-activedescendant={open && items[active] ? `${listId}-${active}` : undefined}
          disabled={disabled} placeholder={loading ? 'Loading…' : value || placeholder}
          value={open ? query : value || ''}
          onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
        />
        {value && !disabled
          ? <button type="button" className="search-select-icon" aria-label={`Clear ${label || 'selection'}`} onClick={() => { onChange(''); setQuery(''); }}><FaXmark aria-hidden="true" /></button>
          : <span className="search-select-icon" aria-hidden="true"><FaChevronDown /></span>}
      </div>
      {open && !disabled && (
        <ul className="search-select-list" id={listId} role="listbox" ref={listRef} aria-label={label}>
          {items.length === 0 && <li className="search-select-empty">{loading ? 'Loading…' : emptyText}</li>}
          {items.map((item, i) => {
            const text = typeof item === 'string' ? item : `Use “${item.custom}”`;
            const selected = typeof item === 'string' && item === value;
            return (
              <li key={typeof item === 'string' ? item : '__custom'} id={`${listId}-${i}`} data-index={i} role="option" aria-selected={selected}
                className={`${i === active ? 'active' : ''}${selected ? ' selected' : ''}${typeof item === 'string' ? '' : ' custom'}`}
                onMouseDown={(e) => { e.preventDefault(); choose(item); }} onMouseEnter={() => setActive(i)}>
                {text}
              </li>
            );
          })}
          {matches.length === MAX_SHOWN && <li className="search-select-more" aria-hidden="true">Keep typing to narrow the list…</li>}
        </ul>
      )}
      {error && <div className="form-error show">{error}</div>}
    </div>
  );
}
