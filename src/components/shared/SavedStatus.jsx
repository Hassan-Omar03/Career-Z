import { useEffect, useState } from 'react';
import SavedForm from './SavedForm';

export default function SavedStatus({ value, options, label, onSave }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  return <SavedForm value={draft} onRestore={setDraft} onSubmit={() => onSave(draft)} style={{ display: 'grid', gap: 8 }}>
    <select className="form-select" aria-label={label} value={draft} onChange={event => setDraft(event.target.value)}>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <button type="submit" className="btn btn-primary">Save status</button>
  </SavedForm>;
}
