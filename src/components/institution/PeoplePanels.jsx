import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Institution people tools: bulk class promotion (spec 8.8) and teacher performance reviews
// (spec 8.9), plus the teacher's own view of reviews shared with them.

function useMyInstitution(onFlash) {
  const [institution, setInstitution] = useState(undefined);
  useEffect(() => { apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((e) => { onFlash?.(e.message); setInstitution(null); }); }, []);
  return institution;
}
const pct = (n) => (n === null || n === undefined ? '—' : `${n}%`);

// ------------------------------------------------------------------ Class promotion
export function ClassPromotionPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [sections, setSections] = useState([]), [from, setFrom] = useState(''), [to, setTo] = useState(''), [action, setAction] = useState('promote');
  const [preview, setPreview] = useState(null), [held, setHeld] = useState({}), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [history, setHistory] = useState([]);
  const [denied, setDenied] = useState(false);
  const loadHistory = (id) => apiRequest(`/institutions/${id}/promotions`).then(setHistory).catch((e) => { if (/permission/i.test(e.message)) setDenied(true); });
  useEffect(() => {
    if (!institution) return;
    apiRequest(`/institutions/${institution._id}/class-sections`).then(setSections).catch(() => setSections([]));
    loadHistory(institution._id);
  }, [institution]);
  useEffect(() => {
    setPreview(null); setHeld({});
    if (institution && from) apiRequest(`/institutions/${institution._id}/promotions/preview?fromSection=${from}`).then(setPreview).catch((e) => onFlash(e.message));
  }, [from]);

  async function run() {
    const heldBack = Object.entries(held).filter(([, h]) => h.on).map(([student, h]) => ({ student, reason: h.reason || '' }));
    const moving = (preview?.students.length || 0) - heldBack.length;
    const target = action === 'promote' ? sections.find((s) => s._id === to)?.name : 'graduated';
    if (!window.confirm(`${action === 'promote' ? 'Promote' : 'Graduate'} ${moving} student(s) from ${preview.section.name}${action === 'promote' ? ` to ${target}` : ''}? ${heldBack.length} will stay. Students and parents will be notified.`)) return;
    setBusy(true);
    try {
      await apiRequest(`/institutions/${institution._id}/promotions`, { method: 'POST', body: { action, fromSection: from, toSection: action === 'promote' ? to : undefined, heldBack, note } });
      onFlash(action === 'promote' ? `${moving} student(s) promoted to ${target}.` : `${moving} student(s) graduated.`, 'success');
      setFrom(''); setTo(''); setNote(''); loadHistory(institution._id);
    } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }

  if (institution === undefined) return null;
  if (!institution || denied) return null;
  const heldCount = Object.values(held).filter((h) => h.on).length;
  return (
    <section className="institution-ui people-panel">
      <div className="institution-card-heading"><h2>Class promotion</h2><p>Move a whole class up at the end of the year, keep anyone back with a reason, or graduate the final class. Course history and results are kept.</p></div>
      <div className="institution-form-grid">
        <label className="institution-field"><span>Action</span><select className="form-select" value={action} onChange={(e) => setAction(e.target.value)}><option value="promote">Promote to the next class</option><option value="graduate">Graduate (final class)</option></select></label>
        <label className="institution-field"><span>From class</span><select className="form-select" value={from} onChange={(e) => setFrom(e.target.value)}><option value="">Select class…</option>{sections.map((s) => <option key={s._id} value={s._id}>{s.name}{s.academicYear ? ` (${s.academicYear})` : ''}</option>)}</select></label>
        {action === 'promote' && <label className="institution-field"><span>To class</span><select className="form-select" value={to} onChange={(e) => setTo(e.target.value)}><option value="">Select class…</option>{sections.filter((s) => s._id !== from).map((s) => <option key={s._id} value={s._id}>{s.name}{s.academicYear ? ` (${s.academicYear})` : ''}</option>)}</select></label>}
      </div>
      {preview && (preview.students.length === 0 ? <p className="admin-notice">No students in {preview.section.name}.</p> : <>
        <div className="account-table-wrap"><table>
          <thead><tr><th>Student</th><th>Roll no.</th><th>Average result</th><th>Attendance</th><th>Keep in this class</th></tr></thead>
          <tbody>{preview.students.map((s) => <tr key={s.studentId}>
            <td>{s.name}</td><td>{s.rollNumber || '—'}</td>
            <td className={s.averagePercent !== null && s.averagePercent < 40 ? 'people-warn' : ''}>{pct(s.averagePercent)}</td>
            <td className={s.attendancePercent !== null && s.attendancePercent < 75 ? 'people-warn' : ''}>{pct(s.attendancePercent)}</td>
            <td><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!held[s.studentId]?.on} onChange={(e) => setHeld({ ...held, [s.studentId]: { ...held[s.studentId], on: e.target.checked } })} /> Keep back</label>
              {held[s.studentId]?.on && <input className="form-input" placeholder="Reason (shown to the family)" value={held[s.studentId]?.reason || ''} onChange={(e) => setHeld({ ...held, [s.studentId]: { ...held[s.studentId], reason: e.target.value } })} style={{ marginTop: 4 }} />}</td>
          </tr>)}</tbody>
        </table></div>
        <label className="institution-field"><span>Note (optional)</span><input className="form-input" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Annual promotion 2026-27" /></label>
        <button type="button" className="btn btn-primary" disabled={busy || (action === 'promote' && !to) || heldCount === preview.students.length} onClick={run}>
          {busy ? 'Working…' : action === 'promote' ? `Promote ${preview.students.length - heldCount} student(s)` : `Graduate ${preview.students.length - heldCount} student(s)`}
        </button>
      </>)}
      {history.length > 0 && <details className="people-history"><summary>Promotion history ({history.length})</summary>
        <ul>{history.map((h) => <li key={h._id}>{new Date(h.createdAt).toLocaleDateString()} · {h.action === 'promote' ? `${h.fromSection?.name} → ${h.toSection?.name}` : `Graduated ${h.fromSection?.name}`} · {h.movedCount} moved{h.heldBack.length ? `, ${h.heldBack.length} kept back (${h.heldBack.map((x) => x.student?.fullName).filter(Boolean).join(', ')})` : ''} · by {h.by?.fullName}</li>)}</ul>
      </details>}
    </section>
  );
}

// ------------------------------------------------------------------ Teacher reviews (institution)
const AREAS = [['teaching', 'Teaching quality'], ['studentResults', 'Student results'], ['punctuality', 'Punctuality'], ['communication', 'Communication'], ['professionalism', 'Professionalism']];
const blankReview = () => ({ period: '', ratings: Object.fromEntries(AREAS.map(([k]) => [k, 3])), strengths: '', improvements: '', goals: '' });

export function TeacherReviewsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [teachers, setTeachers] = useState(null), [open, setOpen] = useState(null), [data, setData] = useState(null), [form, setForm] = useState(blankReview()), [busy, setBusy] = useState(false);
  const loadTeachers = () => apiRequest(`/institutions/${institution._id}/review-teachers`).then(setTeachers).catch(() => setTeachers(false));
  useEffect(() => { if (institution) loadTeachers(); }, [institution]);
  async function openTeacher(t) {
    setOpen(t); setData(null); setForm(blankReview());
    try { setData(await apiRequest(`/institutions/${institution._id}/teachers/${t._id}/review-data`)); } catch (e) { onFlash(e.message); }
  }
  async function save(share) {
    setBusy(true);
    try {
      const draft = data.reviews.find((r) => r.status === 'draft' && r.period === form.period.trim());
      const review = draft
        ? await apiRequest(`/institutions/${institution._id}/reviews/${draft._id}`, { method: 'PATCH', body: { ...form, period: form.period.trim() } })
        : await apiRequest(`/institutions/${institution._id}/teachers/${open._id}/reviews`, { method: 'POST', body: { ...form, period: form.period.trim() } });
      if (share) await apiRequest(`/institutions/${institution._id}/reviews/${review._id}`, { method: 'PATCH', body: { share: true } });
      onFlash(share ? 'Review shared with the teacher.' : 'Draft saved.', 'success');
      await openTeacher(open); loadTeachers();
    } catch (e) { onFlash(e.message); } finally { setBusy(false); }
  }
  if (!institution || teachers === false || teachers === null) return null;
  const ev = data?.evidence;
  return (
    <section className="institution-ui people-panel">
      <div className="institution-card-heading"><h2>Teacher performance reviews</h2><p>Review each teacher once per period. Their real record is shown beside the form; once shared, the teacher can read it and respond.</p></div>
      {teachers.length === 0 ? <p className="admin-notice">No teachers on staff yet.</p> : <div className="account-table-wrap"><table>
        <thead><tr><th>Teacher</th><th>Latest review</th><th /></tr></thead>
        <tbody>{teachers.map((t) => <tr key={t._id}><td>{t.fullName}</td>
          <td>{t.latestReview ? `${t.latestReview.period} · ${t.latestReview.overall ?? '—'}/5 · ${t.latestReview.status === 'shared' ? (t.latestReview.acknowledgedAt ? 'responded' : 'shared') : 'draft'}` : 'None yet'}</td>
          <td><button type="button" className="btn" onClick={() => openTeacher(t)}>{open?._id === t._id ? 'Open' : 'Review'}</button></td></tr>)}</tbody>
      </table></div>}
      {open && <div className="people-review">
        <h3>{open.fullName}</h3>
        {!ev ? <p role="status">Loading record…</p> : <div className="people-evidence">
          <div><strong>{ev.checkIns}</strong><span>check-ins ({ev.lateCheckIns} late)</span></div>
          <div><strong>{pct(ev.classResults.averagePercent)}</strong><span>class results average ({ev.classResults.count})</span></div>
          <div><strong>{ev.ratings.student?.average ?? '—'}</strong><span>student rating ({ev.ratings.student?.count || 0})</span></div>
          <div><strong>{ev.ratings.parent?.average ?? '—'}</strong><span>parent rating ({ev.ratings.parent?.count || 0})</span></div>
          <div><strong>{ev.submissionsGraded}</strong><span>submissions graded · {ev.assignmentsSet} set</span></div>
          <div><strong>{ev.classesWithAttendance}</strong><span>classes with attendance · {ev.liveClasses} live</span></div>
        </div>}
        <div className="institution-form-grid">
          <label className="institution-field"><span>Review period</span><input className="form-input" placeholder="e.g. 2026 Term 1" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></label>
          {AREAS.map(([k, label]) => <label key={k} className="institution-field"><span>{label}: {form.ratings[k]}/5</span><input type="range" min="1" max="5" value={form.ratings[k]} onChange={(e) => setForm({ ...form, ratings: { ...form.ratings, [k]: Number(e.target.value) } })} /></label>)}
        </div>
        {[['strengths', 'Strengths'], ['improvements', 'Areas to improve'], ['goals', 'Goals for next period']].map(([k, label]) => <label key={k} className="institution-field"><span>{label}</span><textarea className="form-input" rows={2} maxLength={2000} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>)}
        <div className="flex gap-2">
          <button type="button" className="btn" disabled={busy || !form.period.trim()} onClick={() => save(false)}>Save draft</button>
          <button type="button" className="btn btn-primary" disabled={busy || !form.period.trim()} onClick={() => { if (window.confirm('Share this review with the teacher? It cannot be changed afterwards.')) save(true); }}>Share with teacher</button>
        </div>
        {data?.reviews?.length > 0 && <details className="people-history"><summary>Past reviews ({data.reviews.length})</summary>
          <ul>{data.reviews.map((r) => <li key={r._id}><strong>{r.period}</strong> · {r.overall ?? '—'}/5 · {r.status}{r.teacherResponse ? ` · teacher: “${r.teacherResponse}”` : ''}</li>)}</ul>
        </details>}
      </div>}
    </section>
  );
}

// ------------------------------------------------------------------ Teacher's own reviews
export function MyTeacherReviews({ onFlash }) {
  const [rows, setRows] = useState(null), [reply, setReply] = useState({});
  const load = () => apiRequest('/institutions/teacher-reviews/mine').then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  async function respond(id) {
    try { await apiRequest(`/institutions/teacher-reviews/${id}/respond`, { method: 'POST', body: { response: reply[id] || '' } }); onFlash('Response sent.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  if (!rows?.length) return null;
  return (
    <section className="admin-section admin-account-card people-panel" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>My performance reviews</h2><p>Reviews your institutions shared with you.</p></div></div>
      {rows.map((r) => <article key={r._id} className="people-review">
        <h3>{r.institution?.name} · {r.period} · {r.overall}/5</h3>
        <p className="text-xs">By {r.reviewer?.fullName} on {new Date(r.sharedAt).toLocaleDateString()}</p>
        <ul className="people-ratings">{AREAS.map(([k, label]) => <li key={k}>{label}: <strong>{r.ratings?.[k]}/5</strong></li>)}</ul>
        {r.strengths && <p><strong>Strengths:</strong> {r.strengths}</p>}
        {r.improvements && <p><strong>To improve:</strong> {r.improvements}</p>}
        {r.goals && <p><strong>Goals:</strong> {r.goals}</p>}
        {r.acknowledgedAt ? <p className="text-xs">You responded: “{r.teacherResponse || 'Acknowledged'}”</p> : <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <input className="form-input" style={{ flex: '1 1 240px' }} placeholder="Your response (optional)" value={reply[r._id] || ''} onChange={(e) => setReply({ ...reply, [r._id]: e.target.value })} />
          <button type="button" className="btn btn-primary" onClick={() => respond(r._id)}>Acknowledge</button>
        </div>}
      </article>)}
    </section>
  );
}
