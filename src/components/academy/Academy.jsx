import { useEffect, useState } from 'react';
import { apiRequest, session } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import { ManualPayButton } from '../payments/ManualPay';
import '../../styles/academy.css';

// Academy flow (master 15A.6): Course → Batch → Students. Screens for the academy, the student,
// the teacher, the parent, the academy's public page and the first-login "connect" card.

const DAYS = [['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'], ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun']];
const DAY = Object.fromEntries(DAYS);
const MODE = { on_campus: 'On campus', online: 'Online', hybrid: 'Hybrid' };
const ENROL = { pending: ['warn', 'Waiting for the academy'], waitlisted: ['warn', 'On the waiting list'], active: ['good', 'Enrolled'], completed: ['good', 'Completed'], left: ['', 'Left'], rejected: ['bad', 'Not accepted'], transferred: ['', 'Moved to another batch'] };
const FEE_STATUS = { pending: ['warn', 'Due'], overdue: ['bad', 'Overdue'], paid: ['good', 'Paid'], partially_paid: ['warn', 'Part paid'], processing: ['warn', 'Being checked'], cancelled: ['', 'Cancelled'], waived: ['good', 'Waived'] };
const date = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const money = (n, c = 'PKR') => `${c} ${Number(n || 0).toLocaleString()}`;
const schedule = (s = []) => s.map((x) => `${DAY[x.day]} ${x.start}–${x.end}`).join(' · ');
const feeText = (f) => (f?.amount > 0 ? `${money(f.amount, f.currency)}${f.period === 'monthly' ? ' / month' : ' (full course)'}` : 'Free');
const Chip = ({ v }) => (v ? <span className={`ac-chip ${v[0]}`}>{v[1]}</span> : null);

// ---------------------------------------------------------------- the academy: courses & batches
const EMPTY = { courseId: '', courseTitle: '', name: '', teacher: '', schedule: [{ day: 'mon', start: '16:00', end: '17:00' }], mode: 'on_campus', room: '', meetingLink: '', startDate: '', endDate: '', seats: 20, fee: { amount: '', period: 'monthly' }, admission: 'approval', description: '' };
export function AcademyBatchesPanel({ onFlash }) {
  const [insts, setInsts] = useState(null), [inst, setInst] = useState(''), [d, setD] = useState(null), [form, setForm] = useState(null), [view, setView] = useState('batches'), [open, setOpen] = useState(null);
  useEffect(() => { apiRequest('/institutions/mine/list').then((r) => { setInsts(r); setInst(r[0]?._id || ''); }).catch(() => setInsts([])); }, []);
  function load() { if (inst) apiRequest(`/academy/institutions/${inst}/manage`).then(setD).catch((e) => { setD(null); onFlash(e.message); }); }
  useEffect(load, [inst]); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(e) {
    e.preventDefault();
    const body = { ...form, seats: Number(form.seats), fee: { amount: Number(form.fee.amount || 0), period: form.fee.period }, teacher: form.teacher || null, endDate: form.endDate || null };
    if (body.courseId) delete body.courseTitle; else delete body.courseId;
    try {
      if (form._id) await apiRequest(`/academy/batches/${form._id}`, { method: 'PATCH', body });
      else await apiRequest(`/academy/institutions/${inst}/batches`, { method: 'POST', body });
      onFlash(form._id ? 'Batch saved.' : 'Batch created. Students can join it from your page.', 'success'); setForm(null); load();
    } catch (err) { onFlash(err.message); }
  }
  async function setStatus(b, status) {
    if (['completed', 'cancelled'].includes(status) && !(await showConfirm(status === 'completed' ? 'Mark this batch completed? Its students complete the course.' : 'Cancel this batch? Students are told and future fees are cancelled.', { title: status === 'completed' ? 'Complete batch' : 'Cancel batch', confirmLabel: 'Yes', danger: status === 'cancelled' }))) return;
    try { await apiRequest(`/academy/batches/${b._id}`, { method: 'PATCH', body: { status } }); onFlash('Batch updated.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  if (insts === null) return <p>Loading…</p>;
  if (!insts.length) return <p className="ac-muted">Create your academy or institute first (My Institution).</p>;
  const setRow = (i, k, v) => setForm({ ...form, schedule: form.schedule.map((r, n) => (n === i ? { ...r, [k]: v } : r)) });
  return (
    <div className="ac-wrap">
      <div className="ac-head">
        <div><h3>Courses & Batches</h3><p>Course → Batch → Students. Each batch has its own teacher, days and times, seats and fee. Students join from your public page or their dashboard.</p></div>
        {insts.length > 1 && <select className="form-select" value={inst} onChange={(e) => setInst(e.target.value)}>{insts.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}</select>}
      </div>
      <nav className="cz-tabbar">{[['batches', 'Batches'], ['report', 'Report']].map(([k, l]) => <button key={k} type="button" className={`cz-tab${view === k ? ' active' : ''}`} aria-pressed={view === k} onClick={() => { setView(k); setOpen(null); }}>{l}</button>)}</nav>
      {view === 'report' && <AcademyReport inst={inst} onFlash={onFlash} />}
      {view === 'batches' && !d && <p>Loading…</p>}
      {view === 'batches' && d && !form && !open && <>
        <div className="ac-actions"><button type="button" className="btn btn-primary" onClick={() => setForm({ ...EMPTY, startDate: new Date().toISOString().slice(0, 10) })}>New batch</button></div>
        {!d.batches.length ? <p className="ac-muted">No batches yet. Create the first one: choose a course (or write a new one), the teacher, days and times, seats and fee.</p> : (
          <div className="ac-cards">
            {d.batches.map((b) => (
              <article key={b._id} className="card ac-card">
                <div className="ac-card-top"><div><strong>{b.course?.title} · {b.name}</strong><small>{schedule(b.schedule)} · {MODE[b.mode]}{b.room ? ` · ${b.room}` : ''}</small></div><span className={`ac-chip ${b.status === 'open' ? 'good' : ''}`}>{b.status}</span></div>
                <dl className="ac-facts">
                  <div><dt>Seats</dt><dd>{b.active} / {b.seats}</dd></div><div><dt>Requests</dt><dd>{b.pending}</dd></div><div><dt>Waiting list</dt><dd>{b.waitlisted}</dd></div>
                  <div><dt>Teacher</dt><dd>{b.teacher?.fullName || '—'}</dd></div><div><dt>Fee</dt><dd>{feeText(b.fee)}</dd></div><div><dt>Dates</dt><dd>{date(b.startDate)} – {b.endDate ? date(b.endDate) : 'open'}</dd></div>
                </dl>
                <small className="ac-muted">Admission: {b.admission === 'auto' ? 'automatic seat while seats last' : 'you accept each student'}</small>
                <div className="ac-actions">
                  <button type="button" className="btn btn-primary" onClick={() => setOpen(b._id)}>Students{b.pending ? ` (${b.pending} new)` : ''}</button>
                  <button type="button" className="btn" onClick={() => setForm({ ...EMPTY, ...b, courseId: b.course?._id, teacher: b.teacher?._id || '', startDate: b.startDate?.slice(0, 10), endDate: b.endDate?.slice(0, 10) || '', fee: { amount: b.fee?.amount ?? '', period: b.fee?.period || 'monthly' } })}>Edit</button>
                  {b.status === 'open' && <button type="button" className="btn" onClick={() => setStatus(b, 'closed')}>Stop new joins</button>}
                  {['closed', 'draft'].includes(b.status) && <button type="button" className="btn" onClick={() => setStatus(b, 'open')}>Open for joining</button>}
                  {['open', 'closed'].includes(b.status) && <button type="button" className="btn" onClick={() => setStatus(b, 'completed')}>Mark completed</button>}
                  {['open', 'closed', 'draft'].includes(b.status) && <button type="button" className="btn staff-remove" onClick={() => setStatus(b, 'cancelled')}>Cancel batch</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </>}
      {view === 'batches' && open && <BatchRoster batchId={open} manage onFlash={onFlash} onBack={() => { setOpen(null); load(); }} />}
      {view === 'batches' && form && d && (
        <form className="card ac-form" onSubmit={save}>
          <h3>{form._id ? 'Edit batch' : 'New batch'}</h3>
          {!form._id && <div className="ac-grid">
            <label>Course<select className="form-select" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}><option value="">+ New course</option>{d.courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}</select></label>
            {!form.courseId && <label>New course name<input className="form-input" required value={form.courseTitle} onChange={(e) => setForm({ ...form, courseTitle: e.target.value })} placeholder="e.g. O-level Maths" /></label>}
          </div>}
          <div className="ac-grid">
            <label>Batch name<input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Evening A" /></label>
            <label>Teacher<select className="form-select" value={form.teacher || ''} onChange={(e) => setForm({ ...form, teacher: e.target.value })}><option value="">Choose (staff of the academy)</option>{d.teachers.map((t) => <option key={t._id} value={t._id}>{t.fullName}</option>)}</select></label>
            <label>Starts<input className="form-input" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
            <label>Ends (optional)<input className="form-input" type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label>
            <label>Seats<input className="form-input" type="number" min={1} max={1000} required value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} /></label>
            <label>Mode<select className="form-select" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>{Object.entries(MODE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
            {form.mode !== 'online' && <label>Room (optional)<input className="form-input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></label>}
            {form.mode !== 'on_campus' && <label>Online class link (optional)<input className="form-input" type="url" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://…" /></label>}
            <label>Fee (PKR, 0 = free)<input className="form-input" type="number" min={0} value={form.fee.amount} onChange={(e) => setForm({ ...form, fee: { ...form.fee, amount: e.target.value } })} /></label>
            <label>Fee is charged<select className="form-select" value={form.fee.period} onChange={(e) => setForm({ ...form, fee: { ...form.fee, period: e.target.value } })}><option value="monthly">Every month</option><option value="one_time">Once, for the whole course</option></select></label>
            <label>Admission<select className="form-select" value={form.admission} onChange={(e) => setForm({ ...form, admission: e.target.value })}><option value="approval">I accept each student</option><option value="auto">Automatic seat while seats last</option></select></label>
          </div>
          <fieldset className="ac-sched"><legend>Class days and times</legend>
            {form.schedule.map((r, i) => (
              <div key={i} className="ac-sched-row">
                <select className="form-select" value={r.day} onChange={(e) => setRow(i, 'day', e.target.value)}>{DAYS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <input className="form-input" type="time" value={r.start} onChange={(e) => setRow(i, 'start', e.target.value)} />
                <input className="form-input" type="time" value={r.end} onChange={(e) => setRow(i, 'end', e.target.value)} />
                {form.schedule.length > 1 && <button type="button" className="btn staff-remove" onClick={() => setForm({ ...form, schedule: form.schedule.filter((_, n) => n !== i) })}>Remove</button>}
              </div>
            ))}
            <button type="button" className="btn" onClick={() => setForm({ ...form, schedule: [...form.schedule, { day: 'wed', start: form.schedule.at(-1)?.start || '16:00', end: form.schedule.at(-1)?.end || '17:00' }] })}>Add a day</button>
          </fieldset>
          <label className="ac-wide">About this batch (optional)<textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="ac-actions"><button type="submit" className="btn btn-primary">{form._id ? 'Save' : 'Create batch'}</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
    </div>
  );
}

// Students of a batch: requests to accept, the roster with progress, attendance and fees.
export function BatchRoster({ batchId, manage, onFlash, onBack }) {
  const [d, setD] = useState(null);
  function load() { apiRequest(`/academy/batches/${batchId}/students`).then(setD).catch((e) => onFlash(e.message)); }
  useEffect(load, [batchId]); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(e, approve) {
    const reason = approve ? '' : await showPrompt('Why is this student not accepted? They see this.', { title: 'Decline request', placeholder: 'Reason' });
    if (reason === null) return;
    try { await apiRequest(`/academy/enrollments/${e._id}/decide`, { method: 'PATCH', body: { approve, reason } }); onFlash('Saved. The student has been told.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function remove(e) {
    const reason = await showPrompt(`Remove ${e.student?.fullName} from this batch? Their future fees are cancelled. Write the reason.`, { title: 'Remove student', placeholder: 'Reason', required: true, danger: true });
    if (!reason) return;
    try { await apiRequest(`/academy/enrollments/${e._id}/remove`, { method: 'POST', body: { reason } }); onFlash('Removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  if (!d) return <p>Loading…</p>;
  const groups = [['pending', 'Requests'], ['waitlisted', 'Waiting list'], ['active', 'Students'], ['completed', 'Completed'], ['left', 'Left / moved'], ['rejected', 'Not accepted']];
  return (
    <div className="ac-roster">
      <div className="ac-head"><div><h3>{d.batch.course?.title} · {d.batch.name}</h3><p>{schedule(d.batch.schedule)}</p></div>{onBack && <button type="button" className="btn" onClick={onBack}>← Back to batches</button>}</div>
      {groups.map(([k, l]) => {
        const rows = d.students.filter((s) => (k === 'left' ? ['left', 'transferred'].includes(s.status) : s.status === k));
        if (!rows.length) return null;
        return (
          <section key={k} className="ac-group"><h4>{l} ({rows.length})</h4>
            <div className="ac-cards">
              {rows.map((s) => (
                <div key={s._id} className="ac-card ac-student">
                  <div className="ac-card-top"><div><strong>{s.student?.fullName}</strong><small>{s.student?.email}{s.student?.phone ? ` · ${s.student.phone}` : ''}</small></div><Chip v={ENROL[s.status]} /></div>
                  {s.note && <small className="ac-muted">“{s.note}”</small>}
                  {s.status === 'active' && <dl className="ac-facts"><div><dt>Progress</dt><dd>{s.progress}%</dd></div><div><dt>Attendance</dt><dd>{s.attendance == null ? 'No classes yet' : `${s.attendance}%`}</dd></div><div><dt>Fees due</dt><dd>{money(s.feesDue)}</dd></div><div><dt>Paid</dt><dd>{money(s.feesPaid)}</dd></div></dl>}
                  {s.reason && <small className="ac-muted">{s.reason}</small>}
                  {manage && <div className="ac-actions">
                    {['pending', 'waitlisted'].includes(s.status) && <><button type="button" className="btn btn-primary" onClick={() => decide(s, true)}>Accept</button><button type="button" className="btn" onClick={() => decide(s, false)}>Decline</button></>}
                    {['active', 'waitlisted'].includes(s.status) && <button type="button" className="btn staff-remove" onClick={() => remove(s)}>Remove</button>}
                  </div>}
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {!d.students.length && <p className="ac-muted">No students yet.</p>}
    </div>
  );
}

function AcademyReport({ inst, onFlash }) {
  const [d, setD] = useState(null);
  useEffect(() => { apiRequest(`/academy/institutions/${inst}/report`).then(setD).catch((e) => onFlash(e.message)); }, [inst]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p>Loading…</p>;
  const t = d.totals;
  return (
    <div className="ac-wrap">
      <div className="ac-tiles">{[['Open batches', t.open], ['Students', `${t.students} / ${t.seats} seats`], ['Requests', t.pending], ['Waiting list', t.waiting], ['Fees billed', money(t.billed)], ['Collected', money(t.collected)]].map(([l, v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div>
      <div className="ac-cards">{d.batches.map((b) => <div key={b._id} className="card ac-card"><div className="ac-card-top"><strong>{b.course} · {b.name}</strong><span className="ac-chip">{b.status}</span></div><dl className="ac-facts"><div><dt>Seats</dt><dd>{b.active}/{b.seats}</dd></div><div><dt>Waiting</dt><dd>{b.waiting}</dd></div><div><dt>Left</dt><dd>{b.left}</dd></div><div><dt>Completed</dt><dd>{b.completed}</dd></div><div><dt>Attendance</dt><dd>{b.attendance == null ? '—' : `${b.attendance}%`}</dd></div><div><dt>Collected</dt><dd>{money(b.collected)} of {money(b.billed)}</dd></div></dl></div>)}</div>
    </div>
  );
}

// ---------------------------------------------------------------- student: my academies + find one
function EnrolmentCard({ e, onFlash, onDone, readOnly }) {
  const [moving, setMoving] = useState(null);
  const b = e.batch;
  async function leave() {
    const reason = await showPrompt(`Leave ${b.name}? Your seat goes to the next student and future fees are cancelled.`, { title: 'Leave batch', placeholder: 'Reason (optional)', danger: true });
    if (reason === null) return;
    try { await apiRequest(`/academy/enrollments/${e._id}/leave`, { method: 'POST', body: { reason } }); onFlash('You left the batch.', 'success'); onDone(); } catch (err) { onFlash(err.message); }
  }
  async function startMove() {
    try { setMoving((await apiRequest(`/academy/institutions/${b.institution?._id}/batches`, { auth: false })).filter((x) => x._id !== b._id && x.seatsLeft > 0)); } catch (err) { onFlash(err.message); }
  }
  async function move(to) {
    try { await apiRequest(`/academy/enrollments/${e._id}/transfer`, { method: 'POST', body: { toBatch: to } }); onFlash('Moved to the new batch.', 'success'); setMoving(null); onDone(); } catch (err) { onFlash(err.message); }
  }
  return (
    <article className="card ac-card">
      <div className="ac-card-top"><div><strong>{b.course?.title} · {b.name}</strong><small>{b.institution?.name}{b.institution?.city ? ` · ${b.institution.city}` : ''}</small></div><Chip v={ENROL[e.status]} /></div>
      <dl className="ac-facts">
        <div><dt>Classes</dt><dd>{schedule(b.schedule)}</dd></div><div><dt>Teacher</dt><dd>{b.teacher?.fullName || '—'}</dd></div><div><dt>Where</dt><dd>{MODE[b.mode]}{b.room ? ` · ${b.room}` : ''}</dd></div>
        <div><dt>Dates</dt><dd>{date(b.startDate)} – {b.endDate ? date(b.endDate) : 'ongoing'}</dd></div><div><dt>Progress</dt><dd>{e.progress}%</dd></div><div><dt>Attendance</dt><dd>{e.attendance == null ? 'No classes yet' : `${e.attendance}%`}</dd></div>
      </dl>
      {e.status === 'active' && b.mode !== 'on_campus' && b.meetingLink && <a className="btn" href={b.meetingLink} target="_blank" rel="noreferrer">Join online class</a>}
      {e.reason && <small className="ac-muted">{e.reason}</small>}
      {e.fees?.length > 0 && <div className="ac-fees"><b>Fees</b>{e.fees.map((f) => <div key={f._id} className="ac-fee"><span>{f.title}</span><span>{money(f.amount, f.currency)} · due {date(f.dueDate)}</span><Chip v={FEE_STATUS[f.status]} />{!readOnly && ['pending', 'overdue', 'partially_paid'].includes(f.status) && <ManualPayButton kind="fee" id={f._id} label="Pay" onFlash={onFlash} onDone={onDone} />}</div>)}</div>}
      {!readOnly && <div className="ac-actions">
        {e.status === 'active' && !moving && <button type="button" className="btn" onClick={startMove}>Move to another batch</button>}
        {['pending', 'waitlisted', 'active'].includes(e.status) && <button type="button" className="btn staff-remove" onClick={leave}>{e.status === 'active' ? 'Leave batch' : 'Cancel request'}</button>}
      </div>}
      {moving && <div className="ac-move">{!moving.length ? <small className="ac-muted">No other batch of this academy has a free seat.</small> : moving.map((x) => <button key={x._id} type="button" className="btn" onClick={() => move(x._id)}>{x.course?.title} · {x.name} ({schedule(x.schedule)})</button>)}<button type="button" className="btn" onClick={() => setMoving(null)}>Close</button></div>}
    </article>
  );
}

export function StudentAcademies({ onFlash }) {
  const [rows, setRows] = useState(null), [q, setQ] = useState(''), [found, setFound] = useState(null), [pick, setPick] = useState(null);
  function load() { apiRequest('/academy/mine').then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function search(e) {
    e?.preventDefault();
    try { const r = await apiRequest(`/public/institutes?q=${encodeURIComponent(q)}&limit=20`, { auth: false }); setFound((r.items || []).filter((i) => i.type !== 'school' || q)); } catch (err) { onFlash(err.message); }
  }
  const current = (rows || []).filter((r) => ['pending', 'waitlisted', 'active'].includes(r.status));
  const past = (rows || []).filter((r) => !['pending', 'waitlisted', 'active'].includes(r.status));
  return (
    <div className="ac-wrap">
      <div className="ac-head"><div><h3>Academies & Batches</h3><p>Tuition, coaching and online academies you join, next to your own school. Each batch has its own classes, teacher, progress and fees; your school record does not change.</p></div></div>
      {rows === null ? <p>Loading…</p> : !current.length ? <p className="ac-muted">You are not in any batch yet. Find an academy below.</p> : <div className="ac-cards">{current.map((e) => <EnrolmentCard key={e._id} e={e} onFlash={onFlash} onDone={load} />)}</div>}
      <section className="card ac-find">
        <h4>Find an academy or tuition centre</h4>
        <form className="ac-search" onSubmit={search}><input className="form-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Academy name, subject or city" /><button type="submit" className="btn btn-primary">Search</button></form>
        {found && !found.length && <p className="ac-muted">Nothing found.</p>}
        {found && !pick && <div className="ac-cards">{found.map((i) => <button key={i._id} type="button" className="card ac-card ac-pick" onClick={() => setPick(i)}><strong>{i.name}</strong><small>{String(i.type || '').replace('_', ' ')} · {i.city}</small></button>)}</div>}
        {pick && <><div className="ac-actions"><button type="button" className="btn" onClick={() => setPick(null)}>← Back</button></div><OpenBatches institution={pick} onFlash={onFlash} onJoined={() => { setPick(null); load(); }} /></>}
      </section>
      {past.length > 0 && <section><h4>Earlier batches</h4><div className="ac-cards">{past.map((e) => <EnrolmentCard key={e._id} e={e} onFlash={onFlash} onDone={load} readOnly />)}</div></section>}
    </div>
  );
}

// The open batches of one academy, with Join (public page and student dashboard).
export function OpenBatches({ institution, onFlash, onJoined }) {
  const [rows, setRows] = useState(null), [busy, setBusy] = useState(null);
  useEffect(() => { apiRequest(`/academy/institutions/${institution._id}/batches`, { auth: false }).then(setRows).catch(() => setRows([])); }, [institution._id]);
  async function join(b) {
    if (!session.getAccessToken()) { window.location.href = `/login`; return; }
    const note = b.admission === 'approval' ? await showPrompt(`Ask ${institution.name} for a seat in ${b.name}. Anything they should know? (optional)`, { title: 'Join batch', placeholder: 'e.g. I am in Grade 9', confirmLabel: 'Send request' }) : '';
    if (note === null) return;
    setBusy(b._id);
    try { const r = await apiRequest(`/academy/batches/${b._id}/join`, { method: 'POST', body: { note } }); onFlash(r.status === 'active' ? 'You have a seat. See it in Academies & Batches.' : r.status === 'waitlisted' ? 'The batch is full: you are on the waiting list.' : 'Request sent. The academy will answer.', 'success'); onJoined?.(); }
    catch (err) { onFlash(err.message); } finally { setBusy(null); }
  }
  if (!rows) return <p>Loading…</p>;
  if (!rows.length) return <p className="ac-muted">{institution.name} has no batch open for joining right now.</p>;
  return (
    <div className="ac-cards">
      {rows.map((b) => (
        <article key={b._id} className="card ac-card">
          <div className="ac-card-top"><div><strong>{b.course?.title} · {b.name}</strong><small>{schedule(b.schedule)} · {MODE[b.mode]}</small></div><span className={`ac-chip ${b.seatsLeft ? 'good' : 'warn'}`}>{b.seatsLeft ? `${b.seatsLeft} seat${b.seatsLeft === 1 ? '' : 's'} left` : 'Full: waiting list'}</span></div>
          <dl className="ac-facts"><div><dt>Teacher</dt><dd>{b.teacher?.fullName || '—'}</dd></div><div><dt>Starts</dt><dd>{date(b.startDate)}</dd></div><div><dt>Fee</dt><dd>{feeText(b.fee)}</dd></div></dl>
          {b.description && <p className="ac-muted">{b.description}</p>}
          <div className="ac-actions"><button type="button" className="btn btn-primary" disabled={busy === b._id} onClick={() => join(b)}>{b.admission === 'auto' && b.seatsLeft ? 'Join now' : b.seatsLeft ? 'Ask to join' : 'Join waiting list'}</button></div>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- first login: connect your places of learning
export function ConnectLearningCard({ onNavigate }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try { dismissed = localStorage.getItem('cz-connect-dismissed') === '1'; } catch { /* private mode */ }
    if (dismissed) return;
    Promise.all([apiRequest('/students/me/institutions').catch(() => []), apiRequest('/academy/mine').catch(() => [])]).then(([m, b]) => setShow(!m.length && !b.length));
  }, []);
  if (!show) return null;
  const later = () => { try { localStorage.setItem('cz-connect-dismissed', '1'); } catch { /* ignore */ } setShow(false); };
  return (
    <section className="card ac-connect">
      <div><h3>Connect your school or academy</h3><p>Join your school, college or university to see your classes, timetable, results and fees here. You can also join a tuition centre or online academy at the same time.</p></div>
      <div className="ac-actions">
        <button type="button" className="btn btn-primary" onClick={() => onNavigate?.('institutions')}>My school / college / university</button>
        <button type="button" className="btn btn-primary" onClick={() => onNavigate?.('myAcademies')}>An academy or tuition centre</button>
        <button type="button" className="btn" onClick={later}>Later</button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- teacher and parent
export function TeacherBatches({ onFlash }) {
  const [rows, setRows] = useState(null), [open, setOpen] = useState(null);
  useEffect(() => { apiRequest('/academy/teaching').then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (open) return <BatchRoster batchId={open} onFlash={onFlash} onBack={() => setOpen(null)} />;
  return (
    <div className="ac-wrap">
      <div className="ac-head"><div><h3>My academy batches</h3><p>Batches you teach: students, progress, attendance and fees. Take attendance and post lessons from the course as usual.</p></div></div>
      {rows === null ? <p>Loading…</p> : !rows.length ? <p className="ac-muted">You do not teach any academy batch yet.</p> : <div className="ac-cards">{rows.map((b) => <article key={b._id} className="card ac-card"><div className="ac-card-top"><div><strong>{b.course?.title} · {b.name}</strong><small>{b.institution?.name} · {schedule(b.schedule)}</small></div><span className="ac-chip">{b.status}</span></div><dl className="ac-facts"><div><dt>Students</dt><dd>{b.students} / {b.seats}</dd></div><div><dt>Where</dt><dd>{MODE[b.mode]}{b.room ? ` · ${b.room}` : ''}</dd></div><div><dt>Dates</dt><dd>{date(b.startDate)} – {b.endDate ? date(b.endDate) : 'open'}</dd></div></dl><div className="ac-actions"><button type="button" className="btn btn-primary" onClick={() => setOpen(b._id)}>Students</button>{b.meetingLink && <a className="btn" href={b.meetingLink} target="_blank" rel="noreferrer">Online class link</a>}</div></article>)}</div>}
    </div>
  );
}

export function ParentAcademies({ onFlash }) {
  const [kids, setKids] = useState(null), [kid, setKid] = useState(''), [rows, setRows] = useState(null);
  useEffect(() => { apiRequest('/parents/children').then((r) => { setKids(r); setKid(r[0]?.student?._id || ''); }).catch(() => setKids([])); }, []);
  useEffect(() => { if (kid) apiRequest(`/academy/children/${kid}`).then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }, [kid]); // eslint-disable-line react-hooks/exhaustive-deps
  if (kids === null) return <p>Loading…</p>;
  if (!kids.length) return <p className="ac-muted">Link your child first (Children).</p>;
  return (
    <div className="ac-wrap">
      <div className="ac-head"><div><h3>Academies & tuition</h3><p>Your child's academy batches: classes, teacher, progress, attendance and fees.</p></div>{kids.length > 1 && <select className="form-select" value={kid} onChange={(e) => setKid(e.target.value)}>{kids.map((k) => <option key={k.student?._id} value={k.student?._id}>{k.student?.fullName}</option>)}</select>}</div>
      {rows === null ? <p>Loading…</p> : !rows.length ? <p className="ac-muted">Your child is not in any academy batch.</p> : <div className="ac-cards">{rows.map((e) => <EnrolmentCard key={e._id} e={e} onFlash={onFlash} onDone={() => setKid((k) => k)} readOnly />)}</div>}
    </div>
  );
}
