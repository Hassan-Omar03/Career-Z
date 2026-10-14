import { useState } from 'react';
import MarkdownText from '../shared/MarkdownText';

// AI Operations Assistant output: the AI's Markdown report rendered as headings, lists and tables
// (React elements only, never injected HTML), and the exact per-person records it was built from,
// so every name and figure in the report can be checked against the database rows.

export function AiReport({ text }) {
  return <MarkdownText text={text} className="ops-ai-report" />;
}

const money = (n) => (typeof n === 'number' ? n.toLocaleString() : n ?? '');
const list = (a) => (a?.length ? a.join(', ') : '—');
const pct = (n) => (n === null || n === undefined ? 'No data' : `${n}%`);

const SECTIONS = [
  {
    key: 'fees', label: 'Fees', empty: 'No fee records yet.',
    columns: [
      ['Student', (r) => r.student], ['Category', (r) => r.category], ['Program', (r) => r.program || '—'], ['Department', (r) => r.department || '—'],
      ['Fee', (r) => `${r.fee} (${r.feeType})`], ['Amount', (r) => `${r.currency} ${money(r.amount)}`], ['Paid', (r) => money(r.paid)],
      ['Remaining', (r) => money(r.remaining)], ['Status', (r) => r.state], ['Due', (r) => r.dueDate || '—'], ['Paid on', (r) => r.paidOn || '—']
    ]
  },
  {
    key: 'studentAttendance', label: 'Attendance', empty: 'No attendance has been marked yet.',
    columns: [
      ['Student', (r) => r.student], ['Program', (r) => r.program || '—'], ['Department', (r) => r.department || '—'], ['Class', (r) => r.class],
      ['Present', (r) => r.present], ['Late', (r) => r.late], ['Half day', (r) => r.halfDay], ['Absent', (r) => r.absent], ['Excused', (r) => r.excused],
      ['Attendance', (r) => pct(r.attendancePercent)], ['Absent dates', (r) => list(r.absentDates)]
    ]
  },
  {
    key: 'results', label: 'Results', empty: 'No graded exams or assignments yet.',
    columns: [
      ['Student', (r) => r.student], ['Program', (r) => r.program || '—'], ['Class', (r) => r.class], ['Teacher', (r) => r.teacher || '—'],
      ['Assessment', (r) => `${r.assessment} (${r.kind})`], ['Score', (r) => `${r.score} / ${r.maxMarks}`], ['Percent', (r) => pct(r.percent)]
    ]
  },
  {
    key: 'staff', label: 'Staff', empty: 'No staff linked yet.',
    columns: [
      ['Name', (r) => r.name], ['Category', (r) => r.category], ['Designation', (r) => r.designation || '—'], ['Department', (r) => r.department || '—'],
      ['Check-ins', (r) => r.checkIns], ['Late', (r) => r.late], ['Late dates', (r) => list(r.lateDates)], ['Last check-in', (r) => r.lastCheckIn || 'None recorded']
    ]
  },
  {
    key: 'payroll', label: 'Payroll', empty: 'No payslips yet.',
    columns: [
      ['Name', (r) => r.name], ['Category', (r) => r.category], ['Department', (r) => r.department || '—'], ['Period', (r) => r.period],
      ['Net amount', (r) => `${r.currency} ${money(r.netAmount)}`], ['Status', (r) => r.status], ['Paid on', (r) => r.paidOn || '—']
    ]
  },
  {
    key: 'openTickets', label: 'Open tickets', empty: 'No open help-desk tickets.',
    columns: [
      ['Ticket', (r) => r.ticket], ['Raised by', (r) => r.raisedBy], ['Their category', (r) => r.raisedByCategory], ['Department', (r) => r.department || '—'],
      ['Category', (r) => r.category], ['Subject', (r) => r.subject], ['Priority', (r) => r.priority], ['Status', (r) => r.status], ['Opened', (r) => r.openedOn]
    ]
  }
];

function downloadCsv(section, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [section.columns.map(([h]) => esc(h)).join(','), ...rows.map((r) => section.columns.map(([, get]) => esc(get(r))).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `institution-${section.key}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function OpsRecordTables({ details }) {
  const [active, setActive] = useState('fees');
  const [query, setQuery] = useState('');
  const section = SECTIONS.find((s) => s.key === active);
  const data = details?.[active] || { rows: [], total: 0 };
  const q = query.trim().toLowerCase();
  const rows = q ? data.rows.filter((r) => section.columns.some(([, get]) => String(get(r)).toLowerCase().includes(q))) : data.rows;

  return (
    <div className="ops-records">
      <h3>Exact records</h3>
      <p className="text-xs">Straight from your institution's records, not written by AI. Use these to check every name and figure in the report above.</p>
      <nav className="cz-tabbar" aria-label="Record type">
        {SECTIONS.map((s) => (
          <button key={s.key} type="button" aria-pressed={active === s.key} className={`cz-tab${active === s.key ? ' active' : ''}`} onClick={() => { setActive(s.key); setQuery(''); }}>
            {s.label} ({details?.[s.key]?.total ?? 0})
          </button>
        ))}
      </nav>
      <div className="ops-records-toolbar">
        <input className="form-input" type="search" placeholder="Search by name, class, department…" aria-label={`Search ${section.label}`} value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" className="btn" disabled={!rows.length} onClick={() => downloadCsv(section, rows)}>Download CSV</button>
      </div>
      {data.truncated && <p className="text-xs">Showing the first {data.rows.length} of {data.total} records.</p>}
      {rows.length ? (
        <div className="account-table-wrap ops-table-wrap">
          <table>
            <thead><tr>{section.columns.map(([h]) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i}>{section.columns.map(([h, get]) => <td key={h}>{get(r)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : <p>{q ? 'No records match your search.' : section.empty}</p>}
    </div>
  );
}
