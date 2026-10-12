import PtmJoin from './PtmJoin';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

const blank = { title: '', requestedDate: '', mode: 'video', location: '', notes: '' };
const contextKey = row => [row.student._id, row.courseId, row.timetableId].join(':');
export default function TeacherSchedulePtm({ onFlash, onCreated }) {
  const [roster, setRoster] = useState([]), [chosen, setChosen] = useState(''), [parentId, setParentId] = useState('');
  const [form, setForm] = useState(blank), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(null);
  const selected = roster.find(row => contextKey(row) === chosen);
  const guardian = selected?.guardians?.find(row => String(row.parentId) === parentId);
  useEffect(() => { apiRequest('/ptm/teaching-roster').then(setRoster).catch(err => setError(err.message)); }, []);
  function choose(value) {
    setChosen(value);
    const guardians = roster.find(row => contextKey(row) === value)?.guardians || [];
    setParentId(guardians.length === 1 ? String(guardians[0].parentId) : '');
  }
  async function create(event) {
    event.preventDefault();
    if (busy || !selected || !guardian) return;
    const date = new Date(form.requestedDate);
    if (!Number.isFinite(date.getTime()) || date <= new Date()) { setError('Choose a future date and time.'); return; }
    setBusy(true); setError('');
    try {
      const meeting = await apiRequest('/ptm/schedule', { method: 'POST', body: { ...form, requestedDate: date.toISOString(), parentId, studentId: selected.student._id, courseId: selected.courseId, timetableId: selected.timetableId, institutionId: selected.institution } });
      setSaved({ meeting, context: selected, guardian });
      onFlash?.('Meeting scheduled and parent notified.', 'success');
      onCreated?.();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <section className="admin-section" style={{ marginTop: 24 }}><h2>Schedule Parent-Teacher Meeting</h2>
    {saved ? <article className="card" style={{ padding: 20 }}>
      <h3>{saved.meeting.title}</h3><p role="status">Meeting confirmed. The parent has been notified.</p>
      <p><strong>Student:</strong> {saved.context.student.fullName} · <strong>Class:</strong> {saved.context.className || 'Not assigned'} · <strong>Roll:</strong> {saved.context.rollNumber || 'Not assigned'}<br />
        <strong>Parent:</strong> {saved.guardian.name} ({saved.guardian.relationship})<br /><strong>Teacher:</strong> {saved.context.teacher.fullName} · <strong>Subject:</strong> {saved.context.subject} · <strong>School:</strong> {saved.context.schoolName || 'Independent teaching'}</p>
      <p>{new Date(saved.meeting.confirmedDate).toLocaleString()} · {saved.meeting.mode === 'video' ? 'Video' : saved.meeting.location}</p>
      {saved.meeting.mode === 'video' && <PtmJoin meeting={saved.meeting} />}
      <button className="btn" type="button" onClick={() => { setSaved(null); setForm(blank); setChosen(''); setParentId(''); }}>Schedule another meeting</button>
    </article> : <>
      <p>Choose the student, parent and full date/time. Creating the meeting confirms it and sends the parent its details and Join Meeting button.</p>
      <form onSubmit={create} className="card" style={{ padding: 20 }}><fieldset disabled={busy} style={{ border: 0, padding: 0, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))' }}>
        <label>Child / class / subject<select className="form-select" required value={chosen} onChange={event => choose(event.target.value)}><option value="">Choose child and teaching subject</option>{roster.map(row => <option key={contextKey(row)} value={contextKey(row)}>{row.student.fullName} · {row.className || 'Class not assigned'} · {row.subject} · {row.schoolName || 'Independent teaching'}</option>)}</select></label>
        <label>Meeting title<input className="form-input" required maxLength={200} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
        <label>Date and time<input className="form-input" type="datetime-local" required value={form.requestedDate} onChange={event => setForm({ ...form, requestedDate: event.target.value })} /></label>
        <label>Parent / guardian<select className="form-select" required value={parentId} onChange={event => setParentId(event.target.value)}><option value="">Choose parent / guardian</option>{(selected?.guardians || []).map(row => <option key={row.parentId} value={row.parentId}>{row.name} ({row.relationship})</option>)}</select></label>
        <label>Mode<select className="form-select" value={form.mode} onChange={event => setForm({ ...form, mode: event.target.value })}><option value="video">Video</option><option value="physical">In person</option></select></label>
        {form.mode === 'physical' && <label>Location<input className="form-input" required value={form.location} onChange={event => setForm({ ...form, location: event.target.value })} /></label>}
        <label>Notes (optional)<textarea className="form-input" maxLength={5000} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></label>
        {selected && <div style={{ gridColumn: '1 / -1' }}><p><strong>Student:</strong> {selected.student.fullName} · <strong>Class:</strong> {selected.className || 'Not assigned'} · <strong>Roll:</strong> {selected.rollNumber || 'Not assigned'}<br /><strong>Teacher:</strong> {selected.teacher.fullName} · <strong>Subject:</strong> {selected.subject} · <strong>School:</strong> {selected.schoolName || 'Independent teaching'}</p>
          <p><strong>Parent / guardian:</strong> {guardian ? `${guardian.name} (${guardian.relationship}) · Verified` : selected.guardians?.length ? 'Choose the recipient above.' : 'No verified guardian is connected. Complete guardian verification first.'}</p></div>}
        <button type="submit" className="btn btn-primary" disabled={!guardian || busy}>{busy ? 'Scheduling…' : 'Schedule meeting & notify parent'}</button>
      </fieldset></form>
    </>}{error && <p role="alert">{error}</p>}
  </section>;
}
