import { useEffect, useState } from 'react';
import { FaRobot } from 'react-icons/fa6';
import { apiRequest } from '../../api/client';

// Lesson provenance line: author, department, AI-assisted flag, last reviewed. Teachers edit it;
// the teacher/institution staff can stamp "reviewed".
export default function LessonMetadata({ lessonId, canEdit = false, canReview = false, onFlash }) {
  const [meta, setMeta] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ authorName: '', department: '', aiAssisted: false, aiNote: '' });
  function load() { apiRequest(`/lesson-metadata/${lessonId}`).then((m) => { setMeta(m); setForm({ authorName: m.authorName || '', department: m.department || '', aiAssisted: Boolean(m.aiAssisted), aiNote: m.aiNote || '' }); }).catch(() => {}); }
  useEffect(load, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e) {
    e.preventDefault();
    try { await apiRequest(`/lesson-metadata/${lessonId}`, { method: 'PATCH', body: form }); onFlash?.('Lesson details saved.', 'success'); setEditing(false); load(); } catch (err) { onFlash?.(err.message); }
  }
  async function review() {
    try { await apiRequest(`/lesson-metadata/${lessonId}/review`, { method: 'POST' }); onFlash?.('Marked as reviewed.', 'success'); load(); } catch (err) { onFlash?.(err.message); }
  }

  if (!meta) return null;
  const author = meta.authorName || meta.author?.fullName || 'Unknown author';
  return (
    <div className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8, display: 'grid', gap: 6 }}>
      <span>
        By <strong>{author}</strong>{meta.department ? ` · ${meta.department}` : ''}
        {meta.aiAssisted && <span title={meta.aiNote || 'AI-assisted content'} style={{ color: 'var(--gold)', fontWeight: 700 }}> · <FaRobot aria-hidden="true" /> AI-assisted</span>}
        {' · '}{meta.lastReviewedAt ? `Last reviewed ${new Date(meta.lastReviewedAt).toLocaleDateString()}${meta.lastReviewedBy?.fullName ? ` by ${meta.lastReviewedBy.fullName}` : ''}` : 'Not reviewed yet'}
        {canEdit && !editing && <button type="button" className="btn" style={{ padding: '1px 8px', fontSize: '0.7rem', marginLeft: 8 }} onClick={() => setEditing(true)}>Edit details</button>}
        {canReview && <button type="button" className="btn" style={{ padding: '1px 8px', fontSize: '0.7rem', marginLeft: 6 }} onClick={review}>Mark reviewed</button>}
      </span>
      {editing && (
        <form onSubmit={save} className="flex gap-2 flex-wrap items-center">
          <input className="form-input" placeholder="Author (leave blank = course teacher)" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} style={{ flex: '1 1 180px' }} />
          <input className="form-input" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ flex: '1 1 140px' }} />
          <label className="flex items-center gap-1"><input type="checkbox" checked={form.aiAssisted} onChange={(e) => setForm({ ...form, aiAssisted: e.target.checked })} /> AI-assisted</label>
          {form.aiAssisted && <input className="form-input" placeholder="How was AI used?" value={form.aiNote} onChange={(e) => setForm({ ...form, aiNote: e.target.value })} style={{ flex: '2 1 200px' }} />}
          <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px' }}>Save</button>
          <button type="button" className="btn" style={{ padding: '4px 10px' }} onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
