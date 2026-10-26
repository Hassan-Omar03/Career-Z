import { useEffect, useState } from 'react';
import { loadCountries, loadCities } from '../../utils/geo';

// Pick several countries and several cities (from the same GeoNames lists as sign-up). Choose a
// country to add it, then pick that country's cities; each choice shows as a removable chip.
const chip = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, border: '1px solid var(--sand-line)', background: 'var(--sand)', fontSize: '0.8rem' };

export default function PlacesPicker({ countries = [], cities = [], onChange }) {
  const [all, setAll] = useState([]), [current, setCurrent] = useState(''), [cityList, setCityList] = useState([]), [typed, setTyped] = useState('');
  useEffect(() => { loadCountries().then(setAll).catch(() => setAll([])); }, []);
  useEffect(() => { setCityList([]); setTyped(''); const code = all.find((c) => c.name === current)?.code; if (code) loadCities(code).then(setCityList); }, [current, all]);
  const addCountry = (name) => { if (!name) return; setCurrent(name); if (!countries.includes(name)) onChange({ countries: [...countries, name], cities }); };
  const addCity = (name) => { const n = String(name || '').trim(); if (!n || cities.includes(n)) return; onChange({ countries: current && !countries.includes(current) ? [...countries, current] : countries, cities: [...cities, n] }); setTyped(''); };
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select className="form-select" style={{ flex: '1 1 200px', minWidth: 0 }} aria-label="Add a country" value={current} onChange={(e) => addCountry(e.target.value)}>
          <option value="">Add a country…</option>
          {all.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
        </select>
        <input className="form-input" style={{ flex: '2 1 240px', minWidth: 0 }} list="places-picker-cities" disabled={!current} aria-label="Add a city"
          placeholder={current ? `Add a city in ${current} (type and press Enter)` : 'Choose a country first, then add its cities'} value={typed}
          onChange={(e) => { setTyped(e.target.value); if (cityList.includes(e.target.value)) addCity(e.target.value); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(typed); } }} />
        <datalist id="places-picker-cities">{cityList.slice(0, 500).map((c) => <option key={c} value={c} />)}</datalist>
      </div>
      {countries.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><small style={{ color: 'var(--ink-soft)', alignSelf: 'center' }}>Countries:</small>
        {countries.map((c) => <span key={c} style={chip}>{c}<button type="button" aria-label={`Remove ${c}`} onClick={() => onChange({ countries: countries.filter((x) => x !== c), cities })} style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0 }}>×</button></span>)}</div>}
      {cities.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><small style={{ color: 'var(--ink-soft)', alignSelf: 'center' }}>Cities:</small>
        {cities.map((c) => <span key={c} style={chip}>{c}<button type="button" aria-label={`Remove ${c}`} onClick={() => onChange({ countries, cities: cities.filter((x) => x !== c) })} style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0 }}>×</button></span>)}</div>}
    </div>
  );
}
