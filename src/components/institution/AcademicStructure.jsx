import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';

// Academic structure (master 15A.5): Faculty > Department > Program > Semester/Term > Class > Section >
// Subject. Programs and class sections already have their own screens; this adds the other levels.
// Admitted students are linked to the program's first term and its subjects automatically.
const LEVELS = [
  { kind: 'sessions', title: 'Academic Sessions', add: 'Add Session', fields: [['name', 'Name (e.g. 2026-2027 or Fall 2026)', 'text', true], ['kind', 'Type', 'kinds', true], ['startDate', 'Starts', 'date'], ['endDate', 'Ends', 'date'], ['current', 'Current session', 'checkbox']] },
  { kind: 'faculties', title: 'Faculties', add: 'Add Faculty', fields: [['name', 'Faculty name', 'text', true], ['code', 'Code', 'text']] },
  { kind: 'departments', title: 'Departments', add: 'Add Department', fields: [['name', 'Department name', 'text', true], ['code', 'Code', 'text'], ['faculty', 'Faculty', 'faculties']] },
  // A level is a grade, class or semester of a program. Students apply to a level that is open for admission.
  { kind: 'terms', title: 'Levels (Grade / Class / Semester)', add: 'Add Level', fields: [['name', 'Name (e.g. Grade 9 or Semester 1)', 'text', true], ['program', 'Program', 'programs', true], ['order', 'Order', 'number'], ['admissionStatus', 'Admission', 'admission'], ['intake', 'Intake', 'sessions'], ['admissionDeadline', 'Admission closes', 'date'], ['seats', 'Seats', 'number'], ['session', 'Session', 'sessions'], ['startDate', 'Starts', 'date'], ['endDate', 'Ends', 'date']] },
  { kind: 'subjects', title: 'Subjects', add: 'Add Subject', fields: [['name', 'Subject name', 'text', true], ['code', 'Code', 'text'], ['department', 'Department', 'departments'], ['program', 'Program', 'programs'], ['term', 'Level', 'terms'], ['classSection', 'Class section', 'sections'], ['teacher', 'Teacher', 'teachers'], ['creditHours', 'Credit hours', 'number']] },
  // Subject combinations for a level, e.g. Science or Arts: compulsory subjects plus electives to choose.
  { kind: 'groups', title: 'Subject Groups (e.g. Science / Arts)', add: 'Add Group', fields: [['name', 'Group name', 'text', true], ['program', 'Program', 'programs'], ['term', 'Level', 'terms', true], ['compulsory', 'Compulsory subjects', 'subjectList'], ['electives', 'Elective subjects', 'subjectList'], ['minElectives', 'Choose at least', 'number'], ['maxElectives', 'Choose at most', 'number'], ['guidance', 'Guidance for students (e.g. Biology for medicine)', 'text']] }
];

export default function AcademicStructure({ institutionId, sections = [], teachers = [], onFlash, Table }) {
  const [rows, setRows] = useState({ sessions: [], faculties: [], departments: [], terms: [], subjects: [], groups: [] });
  const [programs, setPrograms] = useState([]);
  const [forms, setForms] = useState({});
  const [error, setError] = useState('');

  function load() {
    setError('');
    Promise.all(LEVELS.map((l) => apiRequest(`/institutions/${institutionId}/academic/${l.kind}`)))
      .then((lists) => setRows(Object.fromEntries(LEVELS.map((l, i) => [l.kind, lists[i]]))))
      .catch((err) => setError(err.message));
    apiRequest(`/institutions/${institutionId}/programs`).then(setPrograms).catch(() => {});
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [institutionId]);

  const options = {
    admission: [['open', 'Open for admission'], ['upcoming', 'Upcoming'], ['closed', 'Closed']],
    subjectList: rows.subjects.map((x) => [x._id, x.name]),
    kinds: [['year', 'Academic year'], ['spring', 'Spring'], ['fall', 'Fall'], ['summer', 'Summer'], ['other', 'Other']],
    sessions: rows.sessions.map((x) => [x._id, `${x.name}${x.current ? ' (current)' : ''}`]),
    faculties: rows.faculties.map((x) => [x._id, x.name]),
    departments: rows.departments.map((x) => [x._id, x.name]),
    terms: rows.terms.map((x) => [x._id, `${x.name}${programs.find((p) => p._id === x.program) ? ' · ' + programs.find((p) => p._id === x.program).name : ''}`]),
    programs: programs.map((p) => [p._id, p.name]),
    sections: sections.map((s) => [s._id, s.name]),
    teachers: teachers.map((t) => [t.user._id, t.user.fullName])
  };
  const nameOf = (list, id) => (Array.isArray(id) ? id.map((x) => (options[list] || []).find(([v]) => v === x)?.[1]).filter(Boolean).join(', ') || '—' : (options[list] || []).find(([v]) => v === id)?.[1] || '—');

  async function add(level, e) {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(forms[level.kind] || {}).filter(([, v]) => v !== '' && v !== false && !(Array.isArray(v) && !v.length)));
    try {
      await apiRequest(`/institutions/${institutionId}/academic/${level.kind}`, { method: 'POST', body });
      setForms({ ...forms, [level.kind]: {} });
      onFlash(`${level.add.replace('Add ', '')} added.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(level, row) {
    if (!(await showConfirm(`Delete "${row.name}"?`))) return;
    try { await apiRequest(`/institutions/${institutionId}/academic/${level.kind}/${row._id}`, { method: 'DELETE' }); load(); } catch (err) { onFlash(err.message); }
  }
  async function makeCurrent(row) {
    try { await apiRequest(`/institutions/${institutionId}/academic/sessions/${row._id}`, { method: 'PATCH', body: { current: true } }); onFlash(`${row.name} is now the current session.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function setAdmission(row, admissionStatus) {
    try { await apiRequest(`/institutions/${institutionId}/academic/terms/${row._id}`, { method: 'PATCH', body: { admissionStatus } }); onFlash(`${row.name}: admission ${admissionStatus}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  // Gives an ID to current students who joined before student IDs existed.
  async function backfillIds() {
    try { const r = await apiRequest(`/institutions/${institutionId}/academic/student-ids`, { method: 'POST' }); onFlash(r.assigned ? `${r.assigned} student ID(s) given.` : 'Every current student already has an ID.', 'success'); } catch (err) { onFlash(err.message); }
  }
  const set = (kind, key, value) => setForms({ ...forms, [kind]: { ...(forms[kind] || {}), [key]: value } });

  return (
    <section className="institution-class-section">
      <h3 className="font-semibold mb-2 mt-6">Academic Structure</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Sessions, faculties, departments, levels, subjects and subject groups. A student you admit is linked to the level and subjects they applied for (or the program&apos;s first level), the session, and gets a student ID automatically.</p>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Admission: open a level, give it an intake and a closing date, and add its subject groups. Students then apply for that level and choose their subjects. <button type="button" className="btn" style={{ padding: '2px 10px', marginLeft: 6 }} onClick={backfillIds}>Give IDs to current students</button></p>
      {error && <p className="form-error show">{error} <button type="button" className="btn" onClick={load}>Try again</button></p>}
      {LEVELS.map((level) => (
        <div key={level.kind} className="mb-4">
          <h4 className="font-semibold mb-2">{level.title}</h4>
          <form onSubmit={(e) => add(level, e)} className="institution-form-grid institution-class-form">
            {level.fields.map(([key, label, type, required]) => (
              <label key={key} className="institution-field"><span>{label}{required || type === 'checkbox' ? '' : ' (optional)'}</span>
                {type === 'subjectList'
                  ? <span className="flex flex-wrap" style={{ gap: 8 }}>{options.subjectList.length ? options.subjectList.map(([v, l]) => { const list = forms[level.kind]?.[key] || []; return <label key={v} className="flex items-center text-xs" style={{ gap: 4 }}><input type="checkbox" checked={list.includes(v)} onChange={(e) => set(level.kind, key, e.target.checked ? [...list, v] : list.filter((x) => x !== v))} />{l}</label>; }) : <small>Add subjects first.</small>}</span>
                  : type === 'checkbox'
                  ? <input type="checkbox" checked={Boolean(forms[level.kind]?.[key])} onChange={(e) => set(level.kind, key, e.target.checked)} />
                  : options[type]
                  ? <select className="form-select" value={forms[level.kind]?.[key] || ''} required={required} onChange={(e) => set(level.kind, key, e.target.value)}><option value="">{required ? 'Choose' : 'None'}</option>{options[type].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  : <input className="form-input" type={type} min={type === 'number' ? 0 : undefined} value={forms[level.kind]?.[key] || ''} required={required} onChange={(e) => set(level.kind, key, e.target.value)} />}
              </label>
            ))}
            <button type="submit" className="btn btn-primary">{level.add}</button>
          </form>
          <Table
            headers={[...level.fields.filter(([, , type]) => type !== 'date').map(([, label]) => label.replace(/ \(.*\)$/, '')), 'Action']}
            rows={rows[level.kind].map((row) => [
              ...level.fields.filter(([, , type]) => type !== 'date').map(([key, , type]) => (type === 'checkbox' ? (row[key] ? 'Yes' : '—') : options[type] ? nameOf(type, row[key]) : (row[key] ?? '—') || '—')),
              <span key="d" className="flex gap-2">{level.kind === 'terms' && <select className="form-select" aria-label={`Admission for ${row.name}`} value={row.admissionStatus || 'closed'} onChange={(e) => setAdmission(row, e.target.value)} style={{ minWidth: 150 }}>{options.admission.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}{level.kind === 'sessions' && !row.current && <button type="button" className="btn" onClick={() => makeCurrent(row)}>Make current</button>}<button type="button" className="btn" onClick={() => remove(level, row)}>Delete</button></span>
            ])}
            empty={`No ${level.title.toLowerCase()} yet.`}
          />
        </div>
      ))}
    </section>
  );
}
