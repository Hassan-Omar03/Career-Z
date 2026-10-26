import { useState } from 'react';
import { apiRequest } from '../../api/client';

// Add, edit and remove portfolio projects right here (saved to the CV's portfolio section,
// so they also appear on the CV and the public portfolio page).
const EMPTY = { title: '', url: '', description: '' };

export default function PortfolioEditor({ projects, onSaved, onFlash }) {
  const [edit, setEdit] = useState(null), [busy, setBusy] = useState(false);
  async function persist(next, message) {
    setBusy(true);
    try { await apiRequest('/resumes/me', { method: 'PATCH', body: { portfolio: next } }); onFlash?.(message, 'success'); setEdit(null); onSaved?.(); }
    catch (e) { onFlash?.(e.message); } finally { setBusy(false); }
  }
  function save(e) {
    e.preventDefault();
    const row = { title: edit.title.trim(), url: edit.url.trim(), description: edit.description.trim() };
    if (!row.title) return onFlash?.('Give the project a title.');
    if (row.url && !/^https?:\/\//i.test(row.url)) row.url = `https://${row.url}`;
    const next = edit.index == null ? [...projects, row] : projects.map((p, i) => (i === edit.index ? row : p));
    persist(next, edit.index == null ? 'Project added.' : 'Project updated.');
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {projects.map((p, i) => (
        <div key={i} className="border border-[var(--sand-line)] rounded-xl p-4">
          <strong className="text-sm">{p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.title || p.url}</a> : p.title}</strong>
          {p.description && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{p.description}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => setEdit({ ...EMPTY, ...p, index: i })}>Edit</button>
            <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} disabled={busy} onClick={() => { if (window.confirm(`Remove “${p.title}”?`)) persist(projects.filter((_, j) => j !== i), 'Project removed.'); }}>Remove</button>
          </div>
        </div>
      ))}
      {edit ? (
        <form onSubmit={save} className="card" style={{ padding: 16, display: 'grid', gap: 8, maxWidth: 640 }}>
          <strong className="text-sm">{edit.index == null ? 'Add a project' : 'Edit project'}</strong>
          <input className="form-input" required maxLength={160} placeholder="Project title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
          <input className="form-input" maxLength={500} placeholder="Link (optional), e.g. https://github.com/you/project" value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} />
          <textarea className="form-input" rows={3} maxLength={1000} placeholder="What you did and the result" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
          <div style={{ display: 'flex', gap: 8 }}><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save project'}</button><button type="button" className="btn" onClick={() => setEdit(null)}>Cancel</button></div>
        </form>
      ) : <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', justifySelf: 'start' }} onClick={() => setEdit({ ...EMPTY })}>Add Project</button>}
    </div>
  );
}
