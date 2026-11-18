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
  { kind: 'terms', title: 'Semesters / Terms', add: 'Add Term', fields: [['name', 'Name (e.g. Semester 1)', 'text', true], ['program', 'Program', 'programs', true], ['session', 'Session', 'sessions'], ['order', 'Order', 'number'], ['startDate', 'Starts', 'date'], ['endDate', 'Ends', 'date']] },
  { kind: 'subjects', title: 'Subjects', add: 'Add Subject', fields: [['name', 'Subject name', 'text', true], ['code', 'Code', 'text'], ['department', 'Department', 'departments'], ['program', 'Program', 'programs'], ['term', 'Term', 'terms'], ['classSection', 'Class section', 'sections'], ['teacher', 'Teacher', 'teachers'], ['creditHours', 'Credit hours', 'number']] }
];

export default function AcademicStructure({ institutionId, sections = [], teachers = [], onFlash, Table }) {
  const [rows, setRows] = useState({ sessions: [], faculties: [], departments: [], terms: [], subjects: [] });
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
    kinds: [['year', 'Academic year'], ['spring', 'Spring'], ['fall', 'Fall'], ['summer', 'Summer'], ['other', 'Other']],
    sessions: rows.sessions.map((x) => [x._id, `${x.name}${x.current ? ' (current)' : ''}`]),
    faculties: rows.faculties.map((x) => [x._id, x.name]),
    departments: rows.departments.map((x) => [x._id, x.name]),
    terms: rows.terms.map((x) => [x._id, `${x.name}${programs.find((p) => p._id === x.program) ? ' · ' + programs.find((p) => p._id === x.program).name : ''}`]),
    programs: programs.map((p) => [p._id, p.name]),
    sections: sections.map((s) => [s._id, s.name]),
    teachers: teachers.map((t) => [t.user._id, t.user.fullName])
  };
  const nameOf = (list, id) => (options[list] || []).find(([v]) => v === id)?.[1] || '—';

  async function add(level, e) {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(forms[level.kind] || {}).filter(([, v]) => v !== '' && v !== false));
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
  const set = (kind, key, value) => setForms({ ...forms, [kind]: { ...(forms[kind] || {}), [key]: value } });

  return (
    <section className="institution-class-section">
      <h3 className="font-semibold mb-2 mt-6">Academic Structure</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Sessions, faculties, departments, semesters and subjects. A student you admit is linked to the current session, the program&apos;s first semester and its subjects, and gets a student ID automatically.</p>
      {error && <p className="form-error show">{error} <button type="button" className="btn" onClick={load}>Try again</button></p>}
      {LEVELS.map((level) => (
        <div key={level.kind} className="mb-4">
          <h4 className="font-semibold mb-2">{level.title}</h4>
          <form onSubmit={(e) => add(level, e)} className="institution-form-grid institution-class-form">
            {level.fields.map(([key, label, type, required]) => (
              <label key={key} className="institution-field"><span>{label}{required || type === 'checkbox' ? '' : ' (optional)'}</span>
                {type === 'checkbox'
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
              <span key="d" className="flex gap-2">{level.kind === 'sessions' && !row.current && <button type="button" className="btn" onClick={() => makeCurrent(row)}>Make current</button>}<button type="button" className="btn" onClick={() => remove(level, row)}>Delete</button></span>
            ])}
            empty={`No ${level.title.toLowerCase()} yet.`}
          />
        </div>
      ))}
    </section>
  );
}
