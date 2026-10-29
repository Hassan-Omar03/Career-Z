import SavedForm from '../shared/SavedForm';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

export function CourseInsights({ id, busy, onRestore, onError }) {
  const [data, setData] = useState(null), [backups, setBackups] = useState([]);
  useEffect(() => { let alive = true; Promise.all([apiRequest(`/learning/${id}/analytics`), apiRequest(`/learning/${id}/backups`)]).then(([report, rows]) => { if (alive) { setData(report); setBackups(rows); } }).catch(onError); return () => { alive = false; }; }, [id, busy]);
  const pctOr = (v, none) => (v == null ? none : `${v}%`);
  return <><section className="lc-card" id="lc-analytics"><h4>Course analytics</h4>{!data ? <p className="lc-muted">Loading…</p> : <>
    <div className="lc-stats"><div><strong>{data.enrolled}</strong><span>enrolled</span></div><div><strong>{data.completionRate}%</strong><span>completed</span></div><div><strong>{data.averageScore}%</strong><span>average completion score</span></div><div><strong>{pctOr(data.averageAssessmentScore, '—')}</strong><span>graded assessment average</span></div></div>
    {data.lessons.length > 0 && <div className="lc-table-wrap"><table className="lc-table"><thead><tr><th>Lesson</th><th>Completed</th><th>Video viewers</th><th>Graded score</th><th>Waiting for it</th></tr></thead><tbody>{data.lessons.map(l => <tr key={l.lesson}><td>{l.title}</td><td>{l.completed}</td><td>{l.videoViewers}</td><td>{pctOr(l.averageAssessmentScore, '—')}</td><td title="Students who finished the previous lesson and are waiting on this one">{l.awaitingAfterPrevious || 0}</td></tr>)}</tbody></table></div>}
    {data.difficultLessons?.length > 0 && <p className="lc-muted"><strong>Lowest assessment scores:</strong> {data.difficultLessons.slice(0, 3).map(l => `${l.title} (${l.averageAssessmentScore}%, ${l.gradedAttempts} graded attempts)`).join(', ')}</p>}
    {data.popularContent?.length > 0 && <p className="lc-muted"><strong>Most studied:</strong> {data.popularContent.slice(0, 3).map(l => `${l.title} (${l.engagedStudents} students)`).join(', ')}</p>}
    {data.students.length > 0 && <div className="lc-table-wrap"><table className="lc-table"><thead><tr><th>Student</th><th>Lesson progress</th><th>Overall score</th><th>Status</th></tr></thead><tbody>{data.students.map(s => <tr key={s.student?._id}><td>{s.student?.fullName || 'Student'}</td><td>{s.progress}%</td><td>{s.score}%</td><td><span className="lc-chip">{String(s.status || '').replace(/_/g, ' ')}</span></td></tr>)}</tbody></table></div>}
  </>}</section>
    <section className="lc-card" id="lc-snapshots"><h4>Automatic recovery snapshots</h4><p className="lc-muted">The most recent 30 content snapshots are retained. Restoring adds a new revision and keeps newer items; staged content needs approval again.</p>{backups.length === 0 ? <p className="lc-muted">No snapshots yet.</p> : <ul className="lc-list">{backups.map(b => <li key={b._id}><span>{new Date(b.createdAt).toLocaleString()}</span><button className="btn lc-small" disabled={busy} onClick={() => onRestore(b._id)}>Restore</button></li>)}</ul>}</section></>;
}

export function VideoEditor({ lesson, onChange }) {
  function rows(field, label, columns) {
    return <fieldset><legend>{label}</legend>{(lesson[field] || []).map((row, n) => <div key={n}>{columns.map(([key, placeholder, type]) => <input key={key} className="form-input" type={type || 'text'} min={type === 'number' ? 0 : undefined} placeholder={placeholder} value={row[key] ?? ''} onChange={e => onChange({ ...lesson, [field]: lesson[field].map((item, i) => i === n ? { ...item, [key]: type === 'number' ? Number(e.target.value) : e.target.value } : item) })} />)}<button className="btn" type="button" onClick={() => onChange({ ...lesson, [field]: lesson[field].filter((_, i) => i !== n) })}>Remove</button></div>)}<button className="btn" type="button" onClick={() => onChange({ ...lesson, [field]: [...(lesson[field] || []), Object.fromEntries(columns.map(([key, , type]) => [key, type === 'number' ? 0 : '']))] })}>Add {label.toLowerCase()}</button></fieldset>;
  }
  return <details><summary>Video captions, chapters and quality</summary><label><input type="checkbox" checked={lesson.videoDownloadAllowed !== false} onChange={e => onChange({ ...lesson, videoDownloadAllowed: e.target.checked })} />Allow this video to be downloaded offline</label>{rows('videoSources', 'Quality source', [['label', 'Quality label (e.g. 720p)'], ['url', 'HTTPS video file URL', 'url']])}{rows('captions', 'Subtitle track', [['label', 'Caption label'], ['language', 'Language code (e.g. en)'], ['url', 'HTTPS WebVTT subtitle file', 'url']])}{rows('videoChapters', 'Video chapter', [['title', 'Chapter title'], ['seconds', 'Start time in seconds', 'number']])}</details>;
}

export function ReviewerSettings({ id, busy, onChange, onError }) {
  const [data, setData] = useState(null);
  useEffect(() => { let alive = true; setData(null); apiRequest(`/learning/${id}/reviewers`).then(value => { if (alive) setData({...value,staff:value.staff.map(row=>({...row,originalPermissions:[...row.permissions]}))}); }).catch(onError); return () => { alive = false; }; }, [id]);
  function change(user,permission,on) { setData(prev=>({...prev,staff:prev.staff.map(row=>row.user?._id===user?{...row,permissions:on?[...new Set([...row.permissions,permission])]:row.permissions.filter(p=>p!==permission)}:row)})); }
  return data && <section className="lc-card" id="lc-reviewers"><h4>Department and principal reviewers</h4><p className="lc-muted">Reviewers must already belong to the institution. The institution owner grants and revokes these roles.</p><SavedForm key={id} className="lc-reviewer-form" canEdit={data.canGrant} value={data} onRestore={setData} onSubmit={async()=>{
    const rows=data.staff.filter(row=>row.user&&JSON.stringify(row.permissions)!==JSON.stringify(row.originalPermissions));
    for(const row of rows){const result=await onChange(row.user._id,{department:row.permissions.includes('content:review:department'),principal:row.permissions.includes('content:review:principal')});if(result!==true)return false;}
    setData(prev=>({...prev,staff:prev.staff.map(row=>({...row,originalPermissions:[...row.permissions]}))}));return true;
  }}>{data.staff.filter(row=>row.user).map(row=><div key={row.user._id} className="lc-reviewer"><strong>{row.user.fullName}</strong>{[['department','content:review:department','Department reviewer'],['principal','content:review:principal','Principal reviewer']].map(([field,permission,label])=><label key={field}><input type="checkbox" disabled={!data.canGrant||busy} checked={row.permissions.includes(permission)} onChange={e=>change(row.user._id,permission,e.target.checked)}/>{label}</label>)}</div>)}<button type="submit" className="btn btn-primary" disabled={busy}>Save reviewers</button></SavedForm></section>;
}

export function TranslationDraft({ lesson, institutionId, onDraft, onError }) {
  const [language, setLanguage] = useState('Urdu'), [scope, setScope] = useState('personal'), [busy, setBusy] = useState(false);
  async function translate() {
    setBusy(true);
    try { const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'teacher_notes', institutionId: scope === 'institution' ? institutionId : undefined, prompt: `Translate these teaching notes into ${language}. Preserve meaning, equations and examples. Return only translated notes:\n${lesson.content || ''}` } }); onDraft({ ...lesson, _id: undefined, title: `${lesson.title} (${language})`, content: result }); }
    catch (error) { onError(error); }
    finally { setBusy(false); }
  }
  return <details><summary>Create a translated lesson draft</summary><label>Target language<input className="form-input" value={language} onChange={e => setLanguage(e.target.value)} /></label><label>AI service<select className="form-select" value={scope} onChange={e => setScope(e.target.value)}><option value="personal">My configured AI service</option>{institutionId && <option value="institution">Institution AI service (permission required)</option>}</select></label><button className="btn" disabled={busy || !language.trim() || !lesson.content} onClick={translate}>{busy ? 'Translating…' : 'Generate draft'}</button><p>The original lesson stays available. Review the draft before saving; the course publishing policy applies.</p></details>;
}
