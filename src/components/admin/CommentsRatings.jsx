import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import '../../styles/comments-ratings.css';

// Super Admin Comments & Ratings desk: every rating in one list (marketplace products,
// companies, institutes, teachers) with hide / show / edit / delete, plus the ratings report:
// totals, star split, institute-wise averages and a monthly graph.

const SOURCES = [['all', 'All'], ['product', 'Marketplace'], ['company', 'Companies'], ['institution', 'Institutes'], ['teacher', 'Teachers']];
const COLORS = { product: '#2563eb', company: '#d97706', institution: '#16a34a', teacher: '#9333ea' };
const stars = (n) => '★★★★★'.slice(0, Math.round(n || 0)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n || 0));
const date = (d) => (d ? new Date(d).toLocaleDateString() : '');

export function AdminCommentsRatingsPanel({ onFlash }) {
  const [view, setView] = useState('list');
  return (
    <div className="cr-wrap">
      <div className="cr-tabs">
        <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>All comments & ratings</button>
        <button type="button" className={view === 'report' ? 'on' : ''} onClick={() => setView('report')}>Ratings report</button>
      </div>
      {view === 'list' ? <RatingsList onFlash={onFlash} /> : <RatingsReport onFlash={onFlash} />}
    </div>
  );
}

function RatingsList({ onFlash }) {
  const [f, setF] = useState({ source: 'all', status: '', rating: '', q: '' });
  const [rows, setRows] = useState(null);
  const load = (filters = f) => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    apiRequest(`/admin/comments-ratings?${qs}`).then(setRows).catch((e) => { onFlash(e.message); setRows([]); });
  };
  useEffect(() => { load(); }, [f.source, f.status, f.rating]);
  async function act(r, action) {
    let body = { action };
    if (action === 'hide' || action === 'delete') {
      const note = await showPrompt(action === 'hide' ? 'Why is this rating hidden? The writer is told.' : 'Why is this rating deleted? The writer is told.', { title: 'Reason', required: true });
      if (!note) return;
      if (action === 'delete' && !(await showConfirm('Delete this rating for good?'))) return;
      body.note = note;
    }
    if (action === 'edit') {
      const text = await showPrompt('Edit the comment (for example remove abusive words):', { title: 'Edit comment', initialValue: r.text });
      if (text == null) return;
      body = { action, text, note: 'Edited by CareerZ' };
    }
    try {
      const res = await apiRequest(`/admin/comments-ratings/${r.source}/${r._id}`, { method: 'PATCH', body });
      setRows((list) => (res.deleted ? list.filter((x) => x._id !== r._id) : list.map((x) => (x._id === r._id ? res : x))));
      onFlash(res.deleted ? 'Rating deleted.' : 'Saved.');
    } catch (e) { onFlash(e.message); }
  }
  return (
    <section className="card">
      <form className="cr-filters" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <div className="cr-chips">{SOURCES.map(([k, l]) => <button key={k} type="button" className={f.source === k ? 'on' : ''} onClick={() => setF({ ...f, source: k })}>{l}</button>)}</div>
        <select className="form-input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">Any status</option><option value="visible">Visible</option><option value="hidden">Hidden</option><option value="reported">Reported</option></select>
        <select className="form-input" value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })}><option value="">Any stars</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}</select>
        <input className="form-input" type="search" placeholder="Search comments" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <button className="btn btn-outline btn-sm">Search</button>
      </form>
      {rows === null ? <p>Loading…</p> : !rows.length ? <p className="text-muted">No ratings match.</p> : (
        <ul className="cr-list">
          {rows.map((r) => (
            <li key={`${r.source}-${r._id}`} className={`cr-item${r.hidden ? ' hidden' : ''}`}>
              <div className="cr-item-head">
                <span className="cr-src" style={{ background: COLORS[r.source] }}>{r.sourceLabel}</span>
                <strong>{r.target}</strong>
                <span className="cr-stars" title={`${r.rating} of 5`}>{stars(r.rating)}</span>
                {r.hidden && <span className="tag">Hidden</span>}
                {r.reported && <span className="tag rejected">Reported{r.reportReason ? `: ${r.reportReason}` : ''}</span>}
                {r.moderation?.edited && <span className="tag">Edited</span>}
              </div>
              {r.text ? <p className="cr-text">{r.text}</p> : <p className="cr-text text-muted">No comment, stars only.</p>}
              <p className="text-xs text-muted">By {r.author?.fullName || 'deleted user'}{r.fromRole ? ` (${r.fromRole})` : ''} · {date(r.createdAt)}{r.moderation?.note ? ` · CareerZ note: ${r.moderation.note}` : ''}</p>
              <div className="cr-actions">
                {r.hidden ? <button type="button" className="btn btn-outline btn-sm" onClick={() => act(r, 'show')}>Show again</button> : <button type="button" className="btn btn-outline btn-sm" onClick={() => act(r, 'hide')}>Hide</button>}
                {r.reported && !r.hidden && <button type="button" className="btn btn-outline btn-sm" onClick={() => act(r, 'dismiss_report')}>Report is wrong</button>}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => act(r, 'edit')}>Edit</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => act(r, 'delete')}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RatingsReport({ onFlash }) {
  const [r, setR] = useState(null), [months, setMonths] = useState(12);
  useEffect(() => { apiRequest(`/admin/comments-ratings/report?months=${months}`).then(setR).catch((e) => onFlash(e.message)); }, [months]);
  if (!r) return <p>Loading…</p>;
  const keys = Object.keys(r.totals);
  const peak = Math.max(1, ...r.timeline.map((m) => keys.reduce((s, k) => s + (m[k]?.count || 0), 0)));
  return (
    <div className="cr-report">
      <div className="cr-cards">
        {keys.map((k) => {
          const t = r.totals[k], seen = Object.values(t.stars).reduce((a, b) => a + b, 0) || 1;
          return (
            <section key={k} className="card cr-card">
              <span className="cr-src" style={{ background: COLORS[k] }}>{t.label}</span>
              <p className="cr-big">{t.average ?? '–'}<small> / 5</small></p>
              <p className="text-xs text-muted">{t.count} ratings · {t.hidden} hidden</p>
              {[5, 4, 3, 2, 1].map((n) => <div key={n} className="cr-starbar"><span>{n}★</span><i><b style={{ width: `${(t.stars[n] / seen) * 100}%`, background: COLORS[k] }} /></i><span>{t.stars[n]}</span></div>)}
            </section>
          );
        })}
      </div>
      {r.reported > 0 && <p className="cr-alert">{r.reported} reported rating{r.reported > 1 ? 's' : ''} waiting in the list (filter “Reported”).</p>}

      <section className="card">
        <div className="cr-head"><h3>Ratings per month</h3>
          <select className="form-input" value={months} onChange={(e) => setMonths(Number(e.target.value))}>{[6, 12, 24].map((n) => <option key={n} value={n}>Last {n} months</option>)}</select>
        </div>
        <div className="cr-legend">{keys.map((k) => <span key={k}><i style={{ background: COLORS[k] }} />{r.totals[k].label}</span>)}</div>
        <div className="cr-chart" role="img" aria-label="Ratings per month by type">
          {r.timeline.map((m) => (
            <div key={m.month} className="cr-col" title={keys.map((k) => `${r.totals[k].label}: ${m[k]?.count || 0}${m[k] ? ` (avg ${m[k].average})` : ''}`).join('\n')}>
              <div className="cr-stack">{keys.map((k) => (m[k]?.count ? <b key={k} style={{ height: `${(m[k].count / peak) * 100}%`, background: COLORS[k] }} /> : null))}</div>
              <span>{m.month.slice(2).replace('-', '/')}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Institute-wise ratings</h3>
        {!r.institutions.length ? <p className="text-muted">No institute ratings yet.</p> : (
          <div className="cr-table-wrap"><table className="cr-table">
            <thead><tr><th>Institute</th><th>Parents’ rating</th><th>Teachers’ rating</th><th>Total</th></tr></thead>
            <tbody>{r.institutions.map((i) => (
              <tr key={i._id}>
                <td><strong>{i.name}</strong>{i.city && <div className="text-xs text-muted">{i.city}</div>}</td>
                <td>{i.instituteAverage ?? '–'} <span className="text-xs text-muted">({i.instituteCount})</span></td>
                <td>{i.teacherAverage ?? '–'} <span className="text-xs text-muted">({i.teacherCount})</span></td>
                <td>{i.instituteCount + i.teacherCount}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
}
