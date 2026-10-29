import { useState } from 'react';
import { apiRequest } from '../../api/client';
import CampusReports from './CampusReports';

// "Ask the assistant to do something": the AI turns the request into one action from a fixed
// list, the server shows exactly what will happen, and nothing is sent or created until you press
// Confirm. Each action needs your own staff permission.

const EXAMPLES = ['Remind parents and students about overdue fees', 'Tell parents of students absent today', 'Announce to all students that school is closed on Friday', 'Create a sports day event on 20 November at the main ground', 'Show the campus report for this month', 'Draft a timetable for all classes'];

export default function InstitutionAssistantActions({ institutionId, enabled, onFlash }) {
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState(null), [result, setResult] = useState(null);
  const [busy, setBusy] = useState(''), [error, setError] = useState('');

  async function ask(e) {
    e.preventDefault();
    setBusy('plan'); setError(''); setPlan(null); setResult(null);
    try { setPlan(await apiRequest(`/institutions/${institutionId}/assistant/plan`, { method: 'POST', body: { message } })); } catch (err) { setError(err.message); } finally { setBusy(''); }
  }
  async function confirm() {
    setBusy('run'); setError('');
    try {
      const r = await apiRequest(`/institutions/${institutionId}/assistant/execute`, { method: 'POST', body: { action: plan.action, params: plan.params } });
      setResult(r); onFlash?.(r.done, 'success'); setPlan(null); setMessage('');
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  }

  return (
    <div className="card ops-task-composer" style={{ padding: 20, marginTop: 20 }}>
      <span className="ops-eyebrow">Plan an action</span>
      <h3>What would you like to get done?</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Prepare announcements, reminders, events or a timetable. Review the proposed action before you confirm it.</p>
      <form onSubmit={ask} style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        <label className="ops-message-label">Your request<textarea className="form-input" rows={3} maxLength={1500} required placeholder="For example: Remind parents about overdue fees" value={message} onChange={(e) => setMessage(e.target.value)} disabled={!enabled} /></label>
        <div className="ops-suggestions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{EXAMPLES.map((x, i) => <button key={x} type="button" className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setMessage(x)} disabled={!enabled} title={x}>{['Fee reminders', 'Absence alerts', 'School announcement', 'Create an event', 'Campus report', 'Draft a timetable'][i]}<span aria-hidden="true">↗</span></button>)}</div>
        <button type="submit" className="btn btn-primary" disabled={!enabled || busy === 'plan' || !message.trim()}>{busy === 'plan' ? 'Preparing…' : 'Preview action'}</button>
      </form>
      {!enabled && <p className="text-xs">Connect the institution text provider above first.</p>}
      {error && <p role="alert" className="discover-error">{error}</p>}
      {plan && <div className="dp-action" style={{ marginTop: 12 }}>
        {plan.reply && <p>{plan.reply}</p>}
        {plan.action ? <>
          <p><strong>{plan.label}</strong>{plan.preview ? ` — ${plan.preview.summary}` : ''}</p>
          {plan.problem && <p className="dp-error">{plan.problem}</p>}
          {plan.preview?.sample?.length > 0 && <ul className="dp-list">{plan.preview.sample.map((s, i) => <li key={i}>{Object.values(s).filter(Boolean).map((v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? new Date(v).toLocaleDateString() : v)).join(' · ')}</li>)}</ul>}
          {plan.params?.title && plan.action === 'send_announcement' && <blockquote style={{ margin: 0 }}><strong>{plan.params.title}</strong><br />{plan.params.body}</blockquote>}
          {!plan.allowed && <p className="dp-error">You do not have the "{plan.permission}" permission for this. Ask the institution owner.</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={confirm} disabled={!plan.allowed || !!plan.problem || busy === 'run'}>{busy === 'run' ? 'Working…' : 'Confirm'}</button>
            <button type="button" className="btn" onClick={() => setPlan(null)}>Cancel</button>
          </div>
        </> : null}
      </div>}
      {result && <div className="dp-action ok" style={{ marginTop: 12 }}>
        <p><strong>{result.done}</strong></p>
        {result.report && <CampusReports institutionId={institutionId} onFlash={onFlash} />}
        {result.timetable?.unplaced?.length > 0 && <ul className="dp-list">{result.timetable.unplaced.map((u) => <li key={u.section + u.course}>{u.section}: {u.course} — {u.missing} period(s) could not be placed</li>)}</ul>}
      </div>}
    </div>
  );
}
