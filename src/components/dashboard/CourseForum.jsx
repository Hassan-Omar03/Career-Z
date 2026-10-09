import { useEffect, useState } from 'react';
import { FaThumbtack, FaLock, FaEyeSlash, FaCircleCheck, FaThumbsUp } from 'react-icons/fa6';
import { apiRequest } from '../../api/client';

function ThreadView({ threadId, onFlash, onBack, onChanged }) {
  const [data, setData] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  function load() { apiRequest(`/forum/threads/${threadId}`).then(setData).catch((err) => onFlash?.(err.message)); }
  useEffect(load, [threadId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(fn, message) {
    setBusy(true);
    try { await fn(); if (message) onFlash?.(message, 'success'); load(); onChanged?.(); } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  async function postReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    await act(() => apiRequest(`/forum/threads/${threadId}/replies`, { method: 'POST', body: { body: reply } }), 'Reply posted.');
    setReply('');
  }

  if (!data) return <p className="text-xs">Loading discussion...</p>;
  const { thread, replies, canModerate } = data;
  const moderate = (patch, msg) => act(() => apiRequest(`/forum/threads/${threadId}`, { method: 'PATCH', body: patch }), msg);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button type="button" className="btn" style={{ justifySelf: 'start', padding: '4px 10px', fontSize: '0.75rem' }} onClick={onBack}>← All discussions</button>
      <div className="card" style={{ padding: 14 }}>
        <strong>{thread.title}</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{thread.author?.fullName} · {new Date(thread.createdAt).toLocaleString()}{thread.lesson?.title ? ` · Lesson: ${thread.lesson.title}` : ''}{thread.locked ? ' · Locked' : ''}{thread.hidden ? ` · Hidden${thread.hiddenReason ? ` (${thread.hiddenReason})` : ''}` : ''}</p>
        {thread.body && <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{thread.body}</p>}
        {canModerate && (
          <div className="flex gap-2 flex-wrap" style={{ marginTop: 10 }}>
            <button type="button" className="btn" disabled={busy} onClick={() => moderate({ pinned: !thread.pinned }, thread.pinned ? 'Unpinned.' : 'Pinned.')}><FaThumbtack aria-hidden="true" /> {thread.pinned ? 'Unpin' : 'Pin'}</button>
            <button type="button" className="btn" disabled={busy} onClick={() => moderate({ locked: !thread.locked }, thread.locked ? 'Unlocked.' : 'Locked.')}><FaLock aria-hidden="true" /> {thread.locked ? 'Unlock' : 'Lock'}</button>
            <button type="button" className="btn" disabled={busy} onClick={() => { const reason = thread.hidden ? '' : window.prompt('Reason for hiding (shown to the author):', '') ?? null; if (reason !== null) moderate({ hidden: !thread.hidden, hiddenReason: reason }, thread.hidden ? 'Visible again.' : 'Hidden.'); }}><FaEyeSlash aria-hidden="true" /> {thread.hidden ? 'Unhide' : 'Hide'}</button>
          </div>
        )}
      </div>
      {replies.map((r) => {
        const accepted = String(thread.acceptedReply) === r._id;
        return (
          <div key={r._id} className="card" style={{ padding: 12, marginLeft: 16, borderLeft: accepted ? '3px solid var(--emerald)' : r.byTeacher ? '3px solid var(--gold)' : undefined, opacity: r.hidden ? 0.6 : 1 }}>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
              <strong>{r.author?.fullName}</strong>{r.byTeacher ? ' · Teacher' : ''} · {new Date(r.createdAt).toLocaleString()}{r.editedAt ? ' · edited' : ''}{r.hidden ? ' · hidden' : ''}
              {accepted && <span style={{ color: 'var(--emerald)', fontWeight: 700 }}> · <FaCircleCheck aria-hidden="true" /> Answer</span>}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{r.body}</p>
            <div className="flex gap-2 flex-wrap" style={{ marginTop: 6 }}>
              <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.72rem' }} disabled={busy || r.hidden} onClick={() => act(() => apiRequest(`/forum/replies/${r._id}/like`, { method: 'POST' }))}><FaThumbsUp aria-hidden="true" /> {r.likes?.length || 0}</button>
              {!r.hidden && <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.72rem' }} disabled={busy} onClick={() => act(() => apiRequest(`/forum/threads/${threadId}/accept`, { method: 'POST', body: { replyId: accepted ? null : r._id } }), accepted ? 'Answer cleared.' : 'Marked as the answer.')}>{accepted ? 'Unmark answer' : 'Mark as answer'}</button>}
              {canModerate && <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.72rem' }} disabled={busy} onClick={() => act(() => apiRequest(`/forum/replies/${r._id}`, { method: 'PATCH', body: { hidden: !r.hidden } }), r.hidden ? 'Reply visible again.' : 'Reply hidden.')}>{r.hidden ? 'Unhide' : 'Hide'}</button>}
            </div>
          </div>
        );
      })}
      {(!thread.locked || canModerate) ? (
        <form onSubmit={postReply} style={{ display: 'grid', gap: 6, marginLeft: 16 }}>
          <textarea className="form-input" rows={3} placeholder="Write a reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={busy || !reply.trim()}>Reply</button>
        </form>
      ) : <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>This discussion is locked.</p>}
    </div>
  );
}

// Course discussion forum (questions → replies), optionally scoped to one lesson.
export default function CourseForum({ courseId, lesson = null, onFlash, compact = false }) {
  const [open, setOpen] = useState(!compact);
  const [threads, setThreads] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({ title: '', body: '' });
  const [q, setQ] = useState('');
  const lessonId = lesson?._id || null;

  function load() {
    const params = new URLSearchParams();
    if (lessonId) params.set('lesson', lessonId);
    if (q) params.set('q', q);
    apiRequest(`/forum/courses/${courseId}/threads?${params}`).then(setThreads).catch((err) => onFlash?.(err.message));
  }
  useEffect(() => { if (open) { const t = setTimeout(load, 200); return () => clearTimeout(t); } return undefined; }, [open, courseId, lessonId, q]); // eslint-disable-line react-hooks/exhaustive-deps

  async function ask(e) {
    e.preventDefault();
    try {
      await apiRequest(`/forum/courses/${courseId}/threads`, { method: 'POST', body: { ...form, lesson: lessonId } });
      onFlash?.('Question posted.', 'success');
      setForm({ title: '', body: '' });
      load();
    } catch (err) { onFlash?.(err.message); }
  }

  if (!open) return <button type="button" className="btn" style={{ marginTop: 8, padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setOpen(true)}>Discuss this lesson</button>;
  return (
    <div className="card" style={{ padding: 16, marginTop: 12 }}>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="font-semibold">{lesson ? `Lesson discussion: ${lesson.title}` : 'Course discussion forum'}</h4>
        {compact && <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.72rem' }} onClick={() => setOpen(false)}>Close</button>}
      </div>
      {activeId ? <ThreadView threadId={activeId} onFlash={onFlash} onBack={() => { setActiveId(null); load(); }} onChanged={load} /> : (
        <>
          <form onSubmit={ask} style={{ display: 'grid', gap: 6, margin: '10px 0' }}>
            <input className="form-input" placeholder="Ask a question about this course" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={3} maxLength={200} />
            <textarea className="form-input" rows={2} placeholder="Details (optional)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Post question</button>
          </form>
          <input className="form-input" placeholder="Search discussions" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 8 }} />
          {threads === null && <p className="text-xs">Loading...</p>}
          {threads?.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No discussions yet. Ask the first question.</p>}
          <div style={{ display: 'grid', gap: 6 }}>
            {threads?.map((t) => (
              <button type="button" key={t._id} className="card" onClick={() => setActiveId(t._id)} style={{ padding: 10, textAlign: 'left', cursor: 'pointer', opacity: t.hidden ? 0.6 : 1 }}>
                <strong>{t.pinned && <FaThumbtack aria-hidden="true" />} {t.title}</strong>
                <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', marginTop: 2 }}>
                  {t.author?.fullName} · {t.replyCount} repl{t.replyCount === 1 ? 'y' : 'ies'}{t.acceptedReply ? ' · answered' : ''}{t.locked ? ' · locked' : ''}{t.hidden ? ' · hidden' : ''}{!lesson && t.lesson?.title ? ` · ${t.lesson.title}` : ''} · {new Date(t.lastActivityAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
