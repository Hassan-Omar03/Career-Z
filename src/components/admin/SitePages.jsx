import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';
import { PUBLIC_PAGES } from '../../content/publicPages';
import { textToHtml, htmlToText } from './BlogAdmin';
import '../../styles/moderation.css';

// Super Admin: edit the website's pages without code. Home page hero text, and every built-in page
// (About, Contact, FAQ, Privacy, Terms…). Saving publishes at once; "Back to original" removes the
// edit and shows the built-in text again.
// Writing: a blank line starts a new paragraph, "## " a heading, "- " a bullet point.

// Built-in page text ("Heading\nBody" blocks) as editor text.
const builtInText = (content) => String(content || '').split('\n\n').filter(Boolean).map((block) => {
  const lines = block.split('\n');
  return lines.length > 1 ? `## ${lines[0]}\n${lines.slice(1).join(' ')}` : block;
}).join('\n\n');

const HOME_FIELDS = [
  ['eyebrow', 'Small line above the title', 'The Global AI Education Ecosystem'],
  ['titleStart', 'Title – first part', 'The Complete'],
  ['titleEmphasis', 'Title – green italic part', 'AI-Powered'],
  ['titleEnd', 'Title – last part', 'Education Ecosystem'],
  ['lead', 'Text under the title', 'CareerZ.pk connects students, parents, teachers, institutions, employers, agents and donors — guided by AI, from admission to career. Built for students, institutions and educators worldwide.'],
  ['primaryLabel', 'First button', 'Explore CareerZ'],
  ['secondaryLabel', 'Second button', 'Register Your Institution'],
  ['announcement', 'Announcement bar (optional, leave empty to hide)', '']
];

export function AdminSitePagesPanel({ onFlash }) {
  const [cms, setCms] = useState(null), [editing, setEditing] = useState(null);
  const load = () => apiRequest('/pages/admin/all').then(setCms).catch((e) => { onFlash(e.message); setCms([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (editing === 'home') return <HomeEditor onFlash={onFlash} onBack={() => setEditing(null)} />;
  if (editing) return <PageEditor page={editing} saved={(cms || []).find((c) => c.slug === editing.slug)} onFlash={onFlash} onBack={() => { setEditing(null); load(); }} />;
  return (
    <div className="mod-wrap">
      <p className="text-sm text-muted">Change the text of any page on the website. Saving publishes it at once; no code needed.</p>
      <ul className="mod-list">
        <li className="mod-item"><div className="mod-body"><strong>Home page</strong><p className="text-xs text-muted">Main title, text under it, buttons and an optional announcement bar · careerz.pk</p></div><div className="mod-actions"><button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('home')}>Edit</button></div></li>
        {PUBLIC_PAGES.filter((p) => !['blog', 'sitemap', 'institutions'].includes(p.slug)).map((p) => {
          const saved = (cms || []).find((c) => c.slug === p.slug);
          return (
            <li key={p.slug} className="mod-item">
              <div className="mod-body"><strong>{saved?.title || p.title}</strong><p className="text-xs text-muted">careerz.pk/{p.slug} · {saved ? `Edited ${new Date(saved.updatedAt).toLocaleDateString()}${saved.status === 'published' ? '' : ' (not published)'}` : 'Original text'}</p></div>
              <div className="mod-actions"><button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(p)}>Edit</button></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PageEditor({ page, saved, onFlash, onBack }) {
  const [f, setF] = useState({ title: saved?.title || page.title, seoDescription: saved?.seoDescription || page.description || '', text: saved ? htmlToText(saved.content) : builtInText(page.content) });
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault(); setBusy(true);
    const body = { title: f.title.trim(), content: textToHtml(f.text), seoDescription: f.seoDescription.trim(), status: 'published' };
    try {
      if (saved) await apiRequest(`/pages/${saved._id}`, { method: 'PATCH', body });
      else await apiRequest('/pages', { method: 'POST', body: { ...body, slug: page.slug } });
      onFlash('Page saved and published.', 'success'); onBack();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function reset() {
    if (!saved || !(await showConfirm('Remove your changes and show the original text again?'))) return;
    try { await apiRequest(`/pages/${saved._id}`, { method: 'DELETE' }); onFlash('Original text is back.', 'success'); onBack(); } catch (err) { onFlash(err.message); }
  }
  return (
    <form className="mod-wrap card" style={{ padding: 18 }} onSubmit={save}>
      <div className="mod-head"><button type="button" className="btn btn-outline btn-sm" onClick={onBack}>← Back</button><strong>Edit careerz.pk/{page.slug}</strong><a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="text-xs">Open page</a></div>
      <label className="text-sm">Page title<input className="form-input" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <label className="text-sm">Short description (under the title and in Google)<input className="form-input" maxLength={300} value={f.seoDescription} onChange={(e) => setF({ ...f, seoDescription: e.target.value })} /></label>
      <label className="text-sm">Page text
        <textarea className="form-input" rows={18} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
      </label>
      <p className="text-xs text-muted">A blank line starts a new paragraph · start a line with <b>## </b> for a heading · start lines with <b>- </b> for bullet points.</p>
      <div className="mod-row-actions">
        <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : 'Save and publish'}</button>
        {saved && <button type="button" className="btn btn-outline btn-sm" onClick={reset}>Back to original</button>}
      </div>
    </form>
  );
}

function HomeEditor({ onFlash, onBack }) {
  const [f, setF] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/site-content/home', { auth: false }).then((v) => setF(Object.fromEntries(HOME_FIELDS.map(([k, , d]) => [k, v?.[k] ?? d])))).catch((e) => onFlash(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(e) {
    e.preventDefault(); setBusy(true);
    try { await apiRequest('/site-content/home', { method: 'PUT', body: f }); onFlash('Home page saved.', 'success'); onBack(); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  if (!f) return <p>Loading…</p>;
  return (
    <form className="mod-wrap card" style={{ padding: 18 }} onSubmit={save}>
      <div className="mod-head"><button type="button" className="btn btn-outline btn-sm" onClick={onBack}>← Back</button><strong>Edit the home page</strong><a href="/" target="_blank" rel="noreferrer" className="text-xs">Open home page</a></div>
      {HOME_FIELDS.map(([k, l]) => (
        <label key={k} className="text-sm">{l}
          {k === 'lead' ? <textarea className="form-input" rows={3} maxLength={400} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /> : <input className="form-input" value={f[k]} maxLength={k === 'announcement' ? 200 : 80} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
        </label>
      ))}
      <p className="text-xs text-muted">Preview of the title: {f.titleStart} <em style={{ color: 'var(--forest, #1b8a63)' }}>{f.titleEmphasis}</em> {f.titleEnd}</p>
      <div className="mod-row-actions"><button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : 'Save and publish'}</button></div>
    </form>
  );
}
