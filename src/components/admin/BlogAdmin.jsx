import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';
import '../../styles/blog.css';

// Super Admin / content staff blog editor. A published post goes live at once on the home page
// ("Latest from the education blog"), the /blog list and its own page.
// Writing: a blank line starts a new paragraph, "## " a heading, "- " a bullet point.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function textToHtml(text) {
  return String(text || '').trim().split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return '';
    if (lines.every((l) => l.startsWith('- '))) return `<ul>${lines.map((l) => `<li>${esc(l.slice(2))}</li>`).join('')}</ul>`;
    if (lines.length === 1 && lines[0].startsWith('## ')) return `<h2>${esc(lines[0].slice(3))}</h2>`;
    return lines.map((l) => (l.startsWith('## ') ? `<h2>${esc(l.slice(3))}</h2>` : `<p>${esc(l)}</p>`)).join('');
  }).join('\n');
}
export function htmlToText(html) {
  if (!/<[a-z]/i.test(String(html || ''))) return String(html || '');
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  const out = [];
  doc.body.childNodes.forEach((n) => {
    const tag = n.nodeName.toLowerCase();
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') out.push(`## ${n.textContent.trim()}`);
    else if (tag === 'ul' || tag === 'ol') out.push([...n.querySelectorAll('li')].map((li) => `- ${li.textContent.trim()}`).join('\n'));
    else if (n.textContent.trim()) out.push(n.textContent.trim());
  });
  return out.join('\n\n');
}

// Shrinks an uploaded photo to a web-friendly JPEG (max 1400px wide).
async function resizeImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const scale = Math.min(1, 1400 / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    let q = 0.82, data = canvas.toDataURL('image/jpeg', q);
    while (data.length > 850000 && q > 0.4) { q -= 0.12; data = canvas.toDataURL('image/jpeg', q); }
    return data;
  } finally { URL.revokeObjectURL(url); }
}

const EMPTY = { title: '', category: '', excerpt: '', coverImage: '', text: '' };
const coverSrc = (c) => c || '';

export default function BlogAdmin({ onFlash }) {
  const [items, setItems] = useState(null), [form, setForm] = useState(EMPTY), [editing, setEditing] = useState(null), [busy, setBusy] = useState(false);
  function load() { apiRequest('/blog/admin/all').then(setItems).catch((e) => { setItems([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function pickCover(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return onFlash('Choose a PNG, JPG or WEBP image.');
    try { setForm((f) => ({ ...f, coverImage: '' })); const data = await resizeImage(file); setForm((f) => ({ ...f, coverImage: data })); } catch { onFlash('This image could not be read.'); }
  }
  async function save(status) {
    if (!form.title.trim()) return onFlash('Write the title.');
    if (status === 'published' && form.text.trim().length < 50) return onFlash('Write the post (at least a few lines) before publishing.');
    setBusy(true);
    const body = { title: form.title.trim(), category: form.category.trim(), excerpt: form.excerpt.trim(), coverImage: form.coverImage, content: textToHtml(form.text), status };
    try {
      if (editing) await apiRequest(`/blog/${editing}`, { method: 'PATCH', body });
      else await apiRequest('/blog', { method: 'POST', body });
      onFlash(status === 'published' ? 'Published. It is live on the home page and the blog now.' : 'Saved as draft.', 'success');
      setForm(EMPTY); setEditing(null); load();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  function edit(p) {
    setEditing(p._id);
    setForm({ title: p.title, category: p.category || '', excerpt: p.excerpt || '', coverImage: p.coverImage || '', text: htmlToText(p.content) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function toggle(p) {
    try { await apiRequest(`/blog/${p._id}`, { method: 'PATCH', body: { status: p.status === 'published' ? 'draft' : 'published' } }); onFlash(p.status === 'published' ? 'Unpublished. It is no longer live.' : 'Published. It is live now.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function remove(p) {
    if (!(await showConfirm(`Delete "${p.title}"? This cannot be undone.`, { title: 'Delete post', confirmLabel: 'Delete', danger: true }))) return;
    try { await apiRequest(`/blog/${p._id}`, { method: 'DELETE' }); onFlash('Deleted.', 'success'); if (editing === p._id) { setEditing(null); setForm(EMPTY); } load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="blog-admin">
      <section className="card blog-editor">
        <div className="blog-editor-head"><div><h3>{editing ? 'Edit post' : 'New blog post'}</h3><p>Published posts show at once on the home page, on /blog and on their own page.</p></div>{editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel edit</button>}</div>
        <label className="hiring-field"><span>Title</span><input className="form-input" maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 10 tips to prepare for your first teaching interview" /></label>
        <div className="blog-editor-row">
          <label className="hiring-field"><span>Category</span><input className="form-input" maxLength={60} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Careers, Scholarships, Study tips" /></label>
          <label className="hiring-field"><span>Short summary (shown on cards)</span><input className="form-input" maxLength={240} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="One or two lines about the post" /></label>
        </div>
        <div className="blog-cover-field">
          <div className="blog-cover-preview">{form.coverImage ? <img src={coverSrc(form.coverImage)} alt="Cover preview" /> : <span>No cover image</span>}</div>
          <div className="blog-cover-actions">
            <strong>Cover image</strong>
            <small>Upload a photo (PNG, JPG or WEBP). It is resized for the web automatically.</small>
            <div className="blog-actions"><label className="btn">Upload image<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickCover} /></label>{form.coverImage && <button type="button" className="btn staff-remove" onClick={() => setForm({ ...form, coverImage: '' })}>Remove</button>}</div>
          </div>
        </div>
        <label className="hiring-field"><span>Post</span><textarea className="form-input blog-text" rows={14} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder={'Write your post here.\n\nLeave a blank line for a new paragraph.\n## A heading\n- A bullet point'} /></label>
        <small className="blog-hint">Blank line = new paragraph · start a line with <b>## </b> for a heading · start lines with <b>- </b> for bullet points.</small>
        <div className="blog-actions">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save('published')}>{busy ? 'Saving…' : editing ? 'Save and publish' : 'Publish now'}</button>
          <button type="button" className="btn" disabled={busy} onClick={() => save('draft')}>Save as draft</button>
        </div>
      </section>

      <section className="blog-list">
        <h3>All posts</h3>
        {items === null ? <p className="text-sm">Loading…</p> : !items.length ? <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No posts yet. Write the first one above.</p> : (
          <div className="blog-admin-cards">
            {items.map((p) => (
              <article key={p._id} className="card blog-admin-card">
                <div className="blog-admin-thumb">{p.coverImage ? <img src={coverSrc(p.coverImage)} alt="" /> : <span>{(p.title || '?')[0]}</span>}</div>
                <div className="blog-admin-body">
                  <div className="blog-admin-top"><strong>{p.title}</strong><span className={`blog-status ${p.status}`}>{p.status === 'published' ? 'Live' : 'Draft'}</span></div>
                  <small>{p.category || 'No category'} · {p.status === 'published' && p.publishedAt ? `Published ${new Date(p.publishedAt).toLocaleDateString()}` : `Updated ${new Date(p.updatedAt).toLocaleDateString()}`}{p.author?.fullName ? ` · ${p.author.fullName}` : ''}</small>
                  {p.excerpt && <p>{p.excerpt}</p>}
                  <div className="blog-actions">
                    <button type="button" className="btn" onClick={() => edit(p)}>Edit</button>
                    <button type="button" className={p.status === 'published' ? 'btn' : 'btn btn-primary'} onClick={() => toggle(p)}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                    {p.status === 'published' && <a className="btn" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">View live</a>}
                    <button type="button" className="btn staff-remove" onClick={() => remove(p)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
