import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

const initial = { bloodGroup: '', allergies: [], medicalNotes: '', vaccinations: [], emergencyContact: { name: '', phone: '', relation: '' } };
export default function MedicalHealth({ mode = 'student', onFlash }) {
  const [institutions, setInstitutions] = useState([]);
  const [students, setStudents] = useState([]);
  const [institution, setInstitution] = useState('');
  const [student, setStudent] = useState('');
  const [record, setRecord] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [incident, setIncident] = useState({ description: '', actionTaken: '', severity: 'minor', occurredAt: '' });
  const [follow, setFollow] = useState(null);
  const manage = mode === 'institution';
  const edit = manage || mode === 'parent';
  const base = '/institution-ops';
  useEffect(() => {
    let alive = true;
    const path = manage ? '/institutions/mine/list' : mode === 'parent' ? '/parents/children' : null;
    if (path) apiRequest(path).then(rows => {
      if (!alive) return;
      if (manage) { setInstitutions(rows); setInstitution(rows[0]?._id || ''); }
      else { const allowed = rows.filter(r => ['father', 'mother', 'guardian'].includes(r.relationship) && r.permissions?.viewHealth); setStudents(allowed.map(r => r.student)); setStudent(allowed[0]?.student?._id || ''); }
    }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [mode]);
  useEffect(() => {
    if (!manage || !institution) return;
    let alive = true; setStudent(''); setStudents([]); setRecord(null);
    apiRequest(`${base}/${institution}/health-students`).then(rows => { if (alive) { setStudents(rows); setStudent(rows[0]?._id || ''); } }).catch(e => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [institution, mode]);
  useEffect(() => {
    let alive = true; setError(''); setRecord(null); setIncidents([]); setLoading(true);
    async function load() {
      if (mode === 'teacher') { const data = await apiRequest(`${base}/health/teacher`); if (alive) { setTeacherStudents(data.students); setIncidents(data.incidents); } return; }
      if (manage && institution) { const rows = await apiRequest(`${base}/${institution}/health-incidents`); if (alive) setIncidents(rows); }
      const path = mode === 'student' ? '/students/me/health' : student ? manage ? `${base}/students/${student}/health?institution=${institution}` : `/parents/children/${student}/health` : null;
      if (path) { const data = await apiRequest(path); if (alive) { setRecord({ ...initial, ...data, emergencyContact: { ...initial.emergencyContact, ...data.emergencyContact } }); if (!manage) setIncidents(data.incidents || []); } }
    }
    load().catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [mode, institution, student, revision]);
  async function run(work) {
    if (busy) return; setBusy(true);
    try { const result = await work(); setRevision(r => r + 1); setFollow(null); return result; }
    catch (e) { setError(e.message); onFlash(e.message, 'error'); }
    finally { setBusy(false); }
  }
  const button = (label, fn) => <button className="btn" type="button" disabled={busy} onClick={fn}>{label}</button>;
  const change = (key, value) => setRecord({ ...record, [key]: value });
  return <section>
    <h2>{mode === 'teacher' ? 'Report a Student Health Incident' : 'Medical & Health'}</h2>
    <p>Health details are private. Access is limited to the student, permitted guardians and authorized institution staff.</p>
    {manage && <label>Institution<select className="form-select" value={institution} onChange={e => setInstitution(e.target.value)}>{institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}</select></label>}
    {edit && <label>Student<select className="form-select" value={student} onChange={e => setStudent(e.target.value)}><option value="">Select student</option>{students.map(s => <option key={s._id} value={s._id}>{s.fullName}</option>)}</select></label>}
    {mode === 'parent' && !loading && !students.length && <p>No linked child with guardian health permission. Check My Children permissions.</p>}
    {manage && !loading && !institutions.length && <p>No institution available.</p>}
    {error && <p role="alert">{error} {button('Retry', () => setRevision(r => r + 1))}</p>}
    {loading && <p role="status">Loading health information…</p>}
    {record && <form className="dash-card" onSubmit={e => { e.preventDefault(); run(async () => {
      const path = manage ? `${base}/students/${student}/health?institution=${institution}` : `/parents/children/${student}/health`;
      const body = Object.fromEntries(Object.keys(initial).map(key => [key, record[key]]));
      await apiRequest(path, { method: 'PATCH', body }); onFlash('Health record saved.', 'success');
    }); }}>
      <h3>Student health record</h3>
      <label>Blood group<select className="form-select" disabled={!edit} value={record.bloodGroup} onChange={e => change('bloodGroup', e.target.value)}>{['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g || 'Not recorded'}</option>)}</select></label>
      <label>Allergies (comma-separated)<input className="form-input" readOnly={!edit} value={record.allergies.join(', ')} onChange={e => change('allergies', e.target.value.split(',').map(a => a.trim()))} /></label>
      <label>Medical history / notes<textarea className="form-input" readOnly={!edit} value={record.medicalNotes} onChange={e => change('medicalNotes', e.target.value)} /></label>
      {['name', 'phone', 'relation'].map(key => <label key={key}>Emergency contact {key}<input className="form-input" readOnly={!edit} value={record.emergencyContact[key]} onChange={e => change('emergencyContact', { ...record.emergencyContact, [key]: e.target.value })} /></label>)}
      <h3>Vaccinations</h3>
      {record.vaccinations.map((v, index) => <div key={index} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>{['name', 'date', 'notes'].map(key => <label key={key}>{key}<input className="form-input" required={key === 'name'} readOnly={!edit} type={key === 'date' ? 'date' : 'text'} value={key === 'date' ? v.date?.slice(0, 10) || '' : v[key] || ''} onChange={e => change('vaccinations', record.vaccinations.map((row, i) => i === index ? { ...row, [key]: e.target.value } : row))} /></label>)}{edit && button('Remove vaccine', () => change('vaccinations', record.vaccinations.filter((_, i) => i !== index)))}</div>)}
      {!record.vaccinations.length && <p>No vaccination records.</p>}
      {edit && <>{button('Add vaccination', () => change('vaccinations', [...record.vaccinations, { name: '', date: '', notes: '' }]))}<button className="btn btn-primary" disabled={busy}>Save health record</button></>}
      <details><summary>Record change history</summary>{record.healthChanges?.map((h, i) => <p key={i}>{new Date(h.at).toLocaleString()} · Updated {h.fields.join(', ')}</p>)}{!record.healthChanges?.length && <p>No changes recorded yet.</p>}</details>
    </form>}
    {(manage || mode === 'teacher') && <form className="dash-card" onSubmit={e => { e.preventDefault(); run(async () => {
      const id = mode === 'teacher' ? teacherStudents.find(m => m._id === student)?.institution?._id : institution;
      const studentId = mode === 'teacher' ? teacherStudents.find(m => m._id === student)?.student?._id : student;
      const result = await apiRequest(`${base}/${id}/health-incidents`, { method: 'POST', body: { ...incident, occurredAt: incident.occurredAt ? new Date(incident.occurredAt).toISOString() : null, student: studentId } });
      onFlash(result.parentNotified ? 'Incident recorded; guardian notification created.' : 'Incident recorded; no guardian notification was created. Check permissions or retry.', result.parentNotified ? 'success' : 'error');
      setIncident({ description: '', actionTaken: '', severity: 'minor', occurredAt: '' });
    }); }}>
      <h3>Record incident</h3>
      {mode === 'teacher' && <label>Student<select className="form-select" required value={student} onChange={e => setStudent(e.target.value)}><option value="">Select active student</option>{teacherStudents.map(m => <option key={m._id} value={m._id}>{m.student?.fullName} · {m.institution?.name}</option>)}</select></label>}
      <label>What happened<textarea className="form-input" required value={incident.description} onChange={e => setIncident({ ...incident, description: e.target.value })} /></label>
      <label>Action taken<input className="form-input" value={incident.actionTaken} onChange={e => setIncident({ ...incident, actionTaken: e.target.value })} /></label>
      <label>Severity<select className="form-select" value={incident.severity} onChange={e => setIncident({ ...incident, severity: e.target.value })}>{['minor', 'moderate', 'severe'].map(s => <option key={s}>{s}</option>)}</select></label>
      <label>Occurred at<input className="form-input" type="datetime-local" value={incident.occurredAt} onChange={e => setIncident({ ...incident, occurredAt: e.target.value })} /></label>
      <button className="btn btn-primary" disabled={busy || !student}>Record incident</button>
    </form>}
    <h3>{mode === 'teacher' ? 'Incidents I reported' : 'Incident history'}</h3>
    {!loading && !incidents.length && <p>No incidents recorded.</p>}
    {incidents.map(row => <article className="dash-card" key={row._id}>
      <strong>{row.student?.fullName || row.institution?.name || 'Incident'} · {row.severity} · {row.status || 'open'}</strong><p>{new Date(row.occurredAt).toLocaleString()} · {row.description}</p><p>Action taken: {row.actionTaken || '—'}</p>
      {manage && <p>Guardian notification: {row.parentNotified ? 'Created (email delivery not guaranteed)' : 'Not created'}</p>}
      {row.followUps?.map((f, i) => <p key={i}>{new Date(f.at).toLocaleString()} · {f.notes}</p>)}
      {manage && <>{button('Follow up / resolve', () => setFollow({ id: row._id, status: row.status || 'open', notes: '' }))}{button('Retry guardian notification', () => run(async () => { const result = await apiRequest(`${base}/health-incidents/${row._id}`, { method: 'PATCH', body: { action: 'retry_notification' } }); onFlash(result.parentNotified ? 'Guardian notification on record.' : 'No eligible guardian or notification failed.', result.parentNotified ? 'success' : 'error'); }))}</>}
    </article>)}
    {follow && <form className="dash-card" onSubmit={e => { e.preventDefault(); run(() => apiRequest(`${base}/health-incidents/${follow.id}`, { method: 'PATCH', body: follow })); }}><label>Status<select className="form-select" value={follow.status} onChange={e => setFollow({ ...follow, status: e.target.value })}>{['open', 'acknowledged', 'resolved'].map(s => <option key={s}>{s}</option>)}</select></label><label>Follow-up notes<textarea className="form-input" required value={follow.notes} onChange={e => setFollow({ ...follow, notes: e.target.value })} /></label><button className="btn btn-primary" disabled={busy}>Save follow-up</button>{button('Cancel', () => setFollow(null))}</form>}
  </section>;
}
