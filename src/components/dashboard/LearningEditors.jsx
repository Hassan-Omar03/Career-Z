import { useEffect, useState } from 'react';

export function ReviewControls({ item, kind, data, busy, onReview }) {
  const [notes, setNotes] = useState('');
  const stage = item.approvalStatus;
  const canReview = stage === 'department_review' ? data.canReviewDepartment : stage === 'principal_review' && data.canReviewPrincipal;
  if (data.course.approvalWorkflow !== 'staged') return null;
  return <div>
    {data.canManage && ['draft', 'rejected'].includes(stage) && <button className="btn" disabled={busy} onClick={() => onReview(item._id, kind, 'submit')}>Submit for review</button>}
    {canReview && <><button className="btn" disabled={busy} onClick={() => onReview(item._id, kind, 'approve')}>Approve {stage === 'department_review' ? 'department' : 'principal'} review</button><input className="form-input" aria-label="Revision feedback" placeholder="Explain what needs revision" value={notes} onChange={e => setNotes(e.target.value)} /><button className="btn" disabled={busy || !notes.trim()} onClick={() => onReview(item._id, kind, 'reject', notes)}>Request revision</button></>}
    {item.approvalHistory?.length > 0 && <details><summary>Review history</summary>{item.approvalHistory.map((row, n) => <p key={n}>{row.action} · {new Date(row.at).toLocaleString()} {row.notes}</p>)}</details>}
  </div>;
}

export function CourseMetadata({ course, busy, onSave, canSetPolicy }) {
  const [form, setForm] = useState({});
  useEffect(() => { setForm({ ...course, tags: (course.tags || []).join(', ') }); }, [course]);
  return <details><summary>Course details and content permissions</summary><form style={{ display: 'grid', gap: 10 }} onSubmit={e => { e.preventDefault(); const fields = ['title', 'courseCode', 'description', 'level', 'language', 'duration', 'category', 'tags', 'coverImage', 'copyrightNotice', ...(canSetPolicy ? ['contentLicense', 'offlineDownloadAllowed'] : [])]; onSave({ ...Object.fromEntries(fields.map(field => [field, form[field]])), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }); }}>
    {['title', 'courseCode', 'description', 'level', 'language', 'duration', 'category', 'tags', 'coverImage', 'copyrightNotice'].map(field => <label key={field}>{({ courseCode: 'Course code', coverImage: 'Cover image URL', copyrightNotice: 'Copyright notice' })[field] || field}<input className="form-input" value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} /></label>)}
    {canSetPolicy && <><label>License<select className="form-select" value={form.contentLicense || 'internal'} onChange={e => setForm({ ...form, contentLicense: e.target.value })}><option value="internal">Internal use only</option><option value="copyright">All rights reserved</option><option value="creative_commons">Creative Commons (specify terms in notice)</option><option value="commercial">Commercial license</option></select></label>
    <label><input type="checkbox" checked={form.offlineDownloadAllowed !== false} onChange={e => setForm({ ...form, offlineDownloadAllowed: e.target.checked })} />Allow offline downloads</label></>}
    <button className="btn" disabled={busy}>Save course details</button>
  </form></details>;
}

export function CurriculumUnit({ unit, busy, canManage, onSave, onRemove }) {
  const [title, setTitle] = useState(unit.title), [order, setOrder] = useState(unit.order || 0), [editing, setEditing] = useState(false);
  useEffect(() => { setTitle(unit.title); setOrder(unit.order || 0); }, [unit]);
  return <div style={{ padding: 8 }}><strong>{unit.type}: {unit.title}</strong>{canManage && <>{editing ? <form onSubmit={e => { e.preventDefault(); onSave({ title, order }); setEditing(false); }}><input className="form-input" required value={title} onChange={e => setTitle(e.target.value)} /><label>Display order<input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} /></label><button className="btn" disabled={busy}>Save unit</button><button className="btn" type="button" onClick={() => setEditing(false)}>Cancel</button></form> : <button className="btn" onClick={() => setEditing(true)} disabled={busy}>Edit unit</button>}<button className="btn" disabled={busy} onClick={onRemove}>Remove empty unit</button></>}</div>;
}

const question = () => ({ question: '', options: ['', ''], answer: 0 });
const defaults = () => ({ title: '', lesson: '', type: 'quiz', content: { questions: [question()] } });
export function ActivityBuilder({ lessons, busy, onSave, editing, onCancel }) {
  const [form, setForm] = useState(defaults);
  useEffect(() => { setForm(editing || defaults()); }, [editing]);
  const content = form.content;
  const change = patch => setForm({ ...form, content: { ...content, ...patch } });
  function choose(type) {
    const empty = { quiz: { questions: [question()] }, flashcards: { cards: [{ front: '', back: '' }] }, sorting: { items: ['', ''] }, coding: { instructions: '', starter: 'console.log("Hello");' }, simulation: { url: '', instructions: '' }, virtual_lab: { url: '', instructions: '' }, game: { url: '', instructions: '' } };
    setForm({ ...form, type, content: empty[type] });
  }
  return <form style={{ display: 'grid', gap: 10, marginTop: 16 }} onSubmit={e => { e.preventDefault(); onSave(form); }}><h3>{editing ? 'Edit practice activity' : 'Add practice activity'}</h3>
    <input className="form-input" required aria-label="Activity title" placeholder="Activity title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
    <select className="form-select" required disabled={!!editing} value={form.lesson} onChange={e => setForm({ ...form, lesson: e.target.value })}><option value="">Choose lesson</option>{lessons.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}</select>
    <select className="form-select" value={form.type} onChange={e => choose(e.target.value)}>{['quiz', 'flashcards', 'sorting', 'coding', 'simulation', 'virtual_lab', 'game'].map(type => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</select>
    {form.type === 'quiz' && <>{content.questions.map((q, n) => <fieldset key={n}><legend>Question {n + 1}</legend><input className="form-input" required placeholder="Question" value={q.question} onChange={e => change({ questions: content.questions.map((row, i) => i === n ? { ...row, question: e.target.value } : row) })} /><label>Options (one per line)<textarea className="form-input" required value={q.options.join('\n')} onChange={e => change({ questions: content.questions.map((row, i) => i === n ? { ...row, options: e.target.value.split('\n') } : row) })} /></label><label>Correct option<select className="form-select" value={q.answer} onChange={e => change({ questions: content.questions.map((row, i) => i === n ? { ...row, answer: Number(e.target.value) } : row) })}>{q.options.map((option, i) => <option value={i} key={i}>{i + 1}. {option}</option>)}</select></label>{content.questions.length > 1 && <button className="btn" type="button" onClick={() => change({ questions: content.questions.filter((_, i) => i !== n) })}>Remove question</button>}</fieldset>)}<button className="btn" type="button" disabled={content.questions.length >= 30} onClick={() => change({ questions: [...content.questions, question()] })}>Add question</button></>}
    {form.type === 'flashcards' && <>{content.cards.map((card, n) => <fieldset key={n}><legend>Card {n + 1}</legend>{['front', 'back'].map(side => <input className="form-input" key={side} required placeholder={side} value={card[side]} onChange={e => change({ cards: content.cards.map((row, i) => i === n ? { ...row, [side]: e.target.value } : row) })} />)}{content.cards.length > 1 && <button className="btn" type="button" onClick={() => change({ cards: content.cards.filter((_, i) => i !== n) })}>Remove card</button>}</fieldset>)}<button className="btn" type="button" onClick={() => change({ cards: [...content.cards, { front: '', back: '' }] })}>Add card</button></>}
    {form.type === 'sorting' && <label>Items in correct order (one per line)<textarea className="form-input" required value={content.items.join('\n')} onChange={e => change({ items: e.target.value.split('\n') })} /></label>}
    {['coding', 'simulation', 'virtual_lab', 'game'].includes(form.type) && <label>Instructions<textarea className="form-input" required value={content.instructions || ''} onChange={e => change({ instructions: e.target.value })} /></label>}
    {form.type === 'coding' && <label>Starter JavaScript<textarea className="form-input" rows={6} value={content.starter || ''} onChange={e => change({ starter: e.target.value })} /></label>}
    {['simulation', 'virtual_lab', 'game'].includes(form.type) && <label>Teacher-selected interactive resource URL<input className="form-input" type="url" pattern="https://.*" required placeholder="https://..." value={content.url || ''} onChange={e => change({ url: e.target.value })} /></label>}
    <button className="btn" disabled={busy}>Save activity</button>{editing && <button className="btn" type="button" onClick={onCancel}>Cancel edit</button>}
  </form>;
}
