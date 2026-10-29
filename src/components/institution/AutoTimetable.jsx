import { useMemo, useState } from 'react';
import { apiRequest } from '../../api/client';

// Builds the weekly timetable for the institution's class sections automatically from Course
// Academic Assignments (course → section → teacher). "Preview" shows the draft; "Save timetable"
// replaces those sections' slots and tells each teacher. The server rebuilds the draft itself, so
// what is saved always follows the same rules: no class or teacher is ever double-booked.

const DAYS = [['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'], ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun']];
const DAY_LABEL = Object.fromEntries(DAYS);

export default function AutoTimetable({ institution, sections, courses, onFlash, onSaved }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({ days: ['mon', 'tue', 'wed', 'thu', 'fri'], dayStart: '08:00', periodMinutes: 45, periodsPerDay: 7, breakAfter: 4, breakMinutes: 30 });
  const [chosen, setChosen] = useState([]);
  const [periods, setPeriods] = useState({});
  const [draft, setDraft] = useState(null), [busy, setBusy] = useState(''), [error, setError] = useState('');
  const [view, setView] = useState('');

  const linked = useMemo(() => courses.filter((c) => c.classSection && (chosen.length === 0 || chosen.includes(c.classSection?._id || c.classSection))), [courses, chosen]);
  const body = () => ({ settings: { ...settings, periodMinutes: Number(settings.periodMinutes), periodsPerDay: Number(settings.periodsPerDay), breakAfter: Number(settings.breakAfter), breakMinutes: Number(settings.breakMinutes) }, sections: chosen, periodsPerCourse: periods });

  async function preview() {
    setBusy('preview'); setError('');
    try {
      const d = await apiRequest(`/institutions/${institution._id}/timetable/auto/preview`, { method: 'POST', body: body() });
      setDraft(d); setView(d.sections[0]?._id || '');
    } catch (e) { setError(e.message); setDraft(null); } finally { setBusy(''); }
  }
  async function apply() {
    if (!draft) return;
    const partial = draft.unplaced.length > 0;
    if (!window.confirm(`Replace the current timetable of ${draft.sections.length} section${draft.sections.length === 1 ? '' : 's'} with this draft (${draft.entries.length} classes)?${partial ? ' Some classes could not be placed and will be missing.' : ''} Teachers will be notified.`)) return;
    setBusy('apply'); setError('');
    try {
      const r = await apiRequest(`/institutions/${institution._id}/timetable/auto/apply`, { method: 'POST', body: { ...body(), acceptPartial: partial } });
      onFlash(`Timetable saved: ${r.saved} classes. Teachers were notified.`, 'success');
      setDraft(null); onSaved?.();
    } catch (e) { setError(e.message); } finally { setBusy(''); }
  }

  const grid = useMemo(() => {
    if (!draft || !view) return null;
    const cell = new Map(draft.entries.filter((e) => e.classSection === view).map((e) => [`${e.dayOfWeek}|${e.period}`, e]));
    return { cell, days: draft.settings.days };
  }, [draft, view]);
  const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <section className="institution-class-section auto-tt"><h3 className="font-semibold mb-2 mt-6">Auto-generate timetable</h3>
      {!open ? <><p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Builds the whole week from your course assignments: no class or teacher is booked twice, and each subject is spread over different days.</p><button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>Set up auto timetable</button></> : <>
        <fieldset className="auto-tt-group"><legend>Teaching days</legend>
          <div className="auto-tt-chips">{DAYS.map(([v, l]) => <label key={v} className={`auto-tt-chip${settings.days.includes(v) ? ' on' : ''}`}><input type="checkbox" checked={settings.days.includes(v)} onChange={() => setSettings({ ...settings, days: toggle(settings.days, v) })} />{l}</label>)}</div>
        </fieldset>
        <div className="auto-tt-settings">
          <label className="institution-field"><span>Day starts at</span><input type="time" className="form-input" value={settings.dayStart} onChange={(e) => setSettings({ ...settings, dayStart: e.target.value })} /></label>
          <label className="institution-field"><span>Period length (minutes)</span><input type="number" min={15} max={180} className="form-input" value={settings.periodMinutes} onChange={(e) => setSettings({ ...settings, periodMinutes: e.target.value })} /></label>
          <label className="institution-field"><span>Periods per day</span><input type="number" min={1} max={14} className="form-input" value={settings.periodsPerDay} onChange={(e) => setSettings({ ...settings, periodsPerDay: e.target.value })} /></label>
          <label className="institution-field"><span>Break after period</span><input type="number" min={0} max={14} className="form-input" value={settings.breakAfter} onChange={(e) => setSettings({ ...settings, breakAfter: e.target.value })} /></label>
          <label className="institution-field"><span>Break length (minutes)</span><input type="number" min={0} max={120} className="form-input" value={settings.breakMinutes} onChange={(e) => setSettings({ ...settings, breakMinutes: e.target.value })} /></label>
        </div>
        <fieldset className="auto-tt-group"><legend>Sections <span>(none chosen = all)</span></legend>
          <div className="auto-tt-chips">{sections.map((s) => <label key={s._id} className={`auto-tt-chip${chosen.includes(s._id) ? ' on' : ''}`}><input type="checkbox" checked={chosen.includes(s._id)} onChange={() => setChosen(toggle(chosen, s._id))} />{s.name}</label>)}</div>
        </fieldset>
        {linked.length > 0 && <details className="auto-tt-periods"><summary>Periods per week for each course <span>(default: its credit hours)</span></summary>
          <div className="auto-tt-period-list">
            {linked.map((c) => <label key={c._id} className="auto-tt-period"><span><strong>{c.title}</strong><small>{c.classSection?.name || ''}{!c.teacher && ' · no teacher, skipped'}</small></span><input type="number" min={0} max={30} className="form-input" placeholder={String(Math.max(1, Math.round(c.creditHours || 3)))} value={periods[c._id] ?? ''} onChange={(e) => setPeriods({ ...periods, [c._id]: e.target.value })} /></label>)}
          </div></details>}
        <div className="auto-tt-actions">
          <button type="button" className="btn btn-primary" onClick={preview} disabled={!!busy}>{busy === 'preview' ? 'Building…' : 'Preview timetable'}</button>
          {draft && <button type="button" className="btn btn-primary" onClick={apply} disabled={!!busy}>{busy === 'apply' ? 'Saving…' : 'Save timetable'}</button>}
          <button type="button" className="btn" onClick={() => { setOpen(false); setDraft(null); }}>Close</button>
        </div>
        {error && <p role="alert" className="discover-error">{error}</p>}
        {draft && <div style={{ marginTop: 14 }}>
          <p className="text-sm"><strong>{draft.entries.length}</strong> classes placed across {draft.sections.length} section{draft.sections.length === 1 ? '' : 's'}.{draft.unplaced.length === 0 ? ' Everything fits.' : ''}</p>
          {draft.unplaced.length > 0 && <div className="u-alert warning mb-3"><span className="u-alert-ic">!</span><div className="u-alert-body"><strong>Could not place everything</strong><ul>{draft.unplaced.map((u) => <li key={u.section + u.course}>{u.section}: {u.course} ({u.teacher}) — {u.missing} period{u.missing === 1 ? '' : 's'} missing. Add periods or days, or reduce this teacher's load.</li>)}</ul></div></div>}
          {draft.skipped.length > 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Skipped: {draft.skipped.map((s) => `${s.course} (${s.section}) — ${s.reason}`).join('; ')}</p>}
          <label className="institution-field" style={{ maxWidth: 320 }}><span>Show section</span><select className="form-select" value={view} onChange={(e) => setView(e.target.value)}>{draft.sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select></label>
          {grid && <div style={{ overflowX: 'auto' }}><table className="w-full text-sm account-table-wrap" style={{ minWidth: 640 }}>
            <thead><tr><th>Period</th>{grid.days.map((d) => <th key={d}>{DAY_LABEL[d]}</th>)}</tr></thead>
            <tbody>{draft.periods.map((p) => <tr key={p.period}><td><strong>{p.period}</strong><br /><small>{p.startTime}–{p.endTime}</small></td>{grid.days.map((d) => { const e = grid.cell.get(`${d}|${p.period}`); return <td key={d}>{e ? <><strong>{e.subject}</strong><br /><small>{e.teacherName}</small></> : <small style={{ color: 'var(--ink-soft)' }}>Free</small>}</td>; })}</tr>)}</tbody>
          </table></div>}
        </div>}
      </>}
    </section>
  );
}
