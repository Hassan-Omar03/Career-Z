import { useRef, useState } from 'react';

// Persisted records open in view mode. Handlers return true only after a successful save;
// validation failures and caught API failures leave the draft open for correction.
export default function SavedForm({ children, onSubmit, value, onRestore, saved = true, canEdit = true, showValues = true, editLabel = 'Edit', className = '', ...props }) {
  const [editing, setEditing] = useState(!saved);
  const [hasSaved, setHasSaved] = useState(saved);
  const [busy, setBusy] = useState(false);
  const snapshot = useRef(null);
  function edit() {
    snapshot.current = structuredClone(value);
    setEditing(true);
  }
  async function submit(event) {
    event.preventDefault();
    if (!editing || busy || !canEdit) return;
    setBusy(true);
    try {
      if (await onSubmit(event) === true) { setEditing(false); setHasSaved(true); }
    } finally { setBusy(false); }
  }
  return <form {...props} className={`${className} saved-form${editing ? '' : ' saved-form-view'}`} onSubmit={submit}>
    <div className="saved-form-toolbar">
      {!editing && canEdit && <button type="button" className="btn btn-outline" onClick={edit}>{editLabel}</button>}
      {editing && hasSaved && onRestore && <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => { onRestore(snapshot.current); setEditing(false); }}>Cancel</button>}
    </div>
    <fieldset key={editing ? 'edit' : 'view'} disabled={!editing || busy || !canEdit} className="saved-form-fields" style={!editing && !showValues ? { display: 'none' } : undefined}>{children}</fieldset>
  </form>;
}
