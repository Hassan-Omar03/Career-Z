import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Per-campus report: sections, students, teachers, attendance and fees for each campus, from the
// institution's real records. Different currencies are shown separately, never added together.

const day = (d) => d.toISOString().slice(0, 10);

export default function CampusReports({ institutionId, onFlash }) {
  const [range, setRange] = useState({ from: day(new Date(Date.now() - 30 * 864e5)), to: day(new Date()) });
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(false);
  function load(e) {
    e?.preventDefault();
    setLoading(true); setError('');
    apiRequest(`/institutions/${institutionId}/reports/campuses?from=${range.from}&to=${range.to}`)
      .then(setData).catch((err) => { setError(err.message); onFlash?.(err.message); }).finally(() => setLoading(false));
  }
  useEffect(load, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="institution-class-section"><h3 className="font-semibold mb-2 mt-6">Campus reports</h3>
      <form onSubmit={load} className="institution-form-grid institution-class-form">
        <label className="institution-field"><span>From</span><input type="date" className="form-input" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
        <label className="institution-field"><span>To</span><input type="date" className="form-input" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Loading…' : 'Show report'}</button>
      </form>
      {error && <p role="alert" className="discover-error">{error}</p>}
      {data && (data.campuses.length === 0 ? <p className="discover-empty-line">No campuses yet. Add a campus above and assign class sections to it.</p> : <div style={{ overflowX: 'auto' }}>
        <table className="w-full text-sm account-table-wrap" style={{ minWidth: 760 }}>
          <thead><tr><th>Campus</th><th>Sections</th><th>Students</th><th>Teachers</th><th>Attendance ({range.from} – {range.to})</th><th>Fees billed / collected</th><th>Outstanding (overdue)</th></tr></thead>
          <tbody>{data.campuses.map((c) => {
            const fees = Object.entries(c.fees);
            return <tr key={c._id || 'unassigned'}>
              <td><strong>{c.name}</strong>{c.isMain ? ' · main' : ''}{c.city ? <><br /><small>{c.city}</small></> : null}</td>
              <td>{c.sections}</td><td>{c.students}</td><td>{c.teachers}</td>
              <td>{c.attendance.percent === null ? <small>No attendance marked</small> : <><strong>{c.attendance.percent}%</strong><br /><small>{c.attendance.sessions} sessions · {c.attendance.absent} absent · {c.attendance.late} late</small></>}</td>
              <td>{fees.length ? fees.map(([cur, f]) => <div key={cur}>{cur} {f.billed.toLocaleString()} / {f.collected.toLocaleString()}</div>) : '—'}</td>
              <td>{fees.length ? fees.map(([cur, f]) => <div key={cur}>{cur} {f.outstanding.toLocaleString()}{f.overdueCount ? <small style={{ color: 'var(--rose, #b42318)' }}> ({f.overdue.toLocaleString()} overdue, {f.overdueCount} fee{f.overdueCount === 1 ? '' : 's'})</small> : null}</div>) : '—'}</td>
            </tr>;
          })}</tbody>
        </table>
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Students count once, under the campus of the class section they study in. {data.note}</p>
      </div>)}
    </section>
  );
}
