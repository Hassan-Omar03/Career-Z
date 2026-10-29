import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';
import { useModules } from '../admin/Plugins';
import '../../styles/mock-interview.css';

// AI Mock Interview: the AI asks role questions, the candidate types or speaks each answer,
// gets a score, feedback, a model answer and a confidence level with the reasons, and at the end
// an overall report. Uses the candidate's own AI key from AI Settings.

const CONF = { low: ['bad', 'Low confidence'], medium: ['warn', 'Medium confidence'], high: ['good', 'High confidence'] };
const Speech = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export function MockInterviewCard({ onFlash, aiEnabled }) {
  const [open, setOpen] = useState(false);
  const modules = useModules();
  if (modules.mock_interview === false) return null;
  return (
    <div className="card mi-card" style={{ padding: 18 }}>
      <strong className="text-sm">AI Mock Interview</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Practise a full interview: the AI asks questions for your role, you answer by typing or speaking, and you get a score, feedback and your confidence level for every answer, then a final report.</p>
      {!aiEnabled && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Connect your AI key above to start.</p>}
      <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} disabled={!aiEnabled} onClick={() => setOpen(!open)}>{open ? 'Close' : 'Start practising'}</button>
      {open && <MockInterviewWorkspace onFlash={onFlash} />}
    </div>
  );
}

export function MockInterviewWorkspace({ onFlash }) {
  const [list, setList] = useState(null), [s, setS] = useState(null), [form, setForm] = useState({ role: '', level: 'junior', focus: 'mixed', count: 5 }), [busy, setBusy] = useState('');
  const load = () => apiRequest('/mock-interviews').then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  async function start(e) {
    e.preventDefault(); setBusy('start');
    try { setS(await apiRequest('/mock-interviews', { method: 'POST', body: form })); load(); } catch (err) { onFlash(err.message); } finally { setBusy(''); }
  }
  async function openOne(id) { try { setS(await apiRequest(`/mock-interviews/${id}`)); } catch (e) { onFlash(e.message); } }
  async function remove(id) {
    if (!(await showConfirm('Delete this practice interview?'))) return;
    try { await apiRequest(`/mock-interviews/${id}`, { method: 'DELETE' }); if (s?._id === id) setS(null); load(); } catch (e) { onFlash(e.message); }
  }
  if (s) return <Session s={s} setS={(x) => { setS(x); load(); }} onBack={() => setS(null)} onFlash={onFlash} />;
  return (
    <div className="mi-wrap">
      <form className="mi-start" onSubmit={start}>
        <input className="form-input" placeholder="Job role, e.g. Primary school maths teacher" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <div className="mi-row">
          <label>Level<select className="form-input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option value="fresher">Fresher</option><option value="junior">Junior</option><option value="mid">Mid-level</option><option value="senior">Senior</option></select></label>
          <label>Questions on<select className="form-input" value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })}><option value="mixed">Mixed</option><option value="technical">Technical</option><option value="behavioural">Behaviour</option><option value="hr">HR</option></select></label>
          <label>How many<select className="form-input" value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}>{[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        </div>
        <button className="btn btn-primary btn-sm" disabled={busy === 'start'}>{busy === 'start' ? 'AI is writing questions…' : 'Start interview'}</button>
      </form>
      {list?.length > 0 && (
        <div className="mi-history">
          <b className="text-sm">Past practice</b>
          {list.map((x) => (
            <div key={x._id} className="mi-hist-row">
              <button type="button" className="mi-link" onClick={() => openOne(x._id)}>{x.role}</button>
              <span className="text-xs text-muted">{new Date(x.createdAt).toLocaleDateString()} · {x.status === 'completed' ? `${x.summary?.overallScore ?? '–'}/100 · ${CONF[x.summary?.confidence]?.[1] || ''}` : `${x.questions.filter((q) => q.score != null).length}/${x.questions.length} answered`}</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => remove(x._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Session({ s, setS, onBack, onFlash }) {
  const first = s.questions.findIndex((q) => q.score == null);
  const [i, setI] = useState(first < 0 ? 0 : first), [text, setText] = useState(''), [busy, setBusy] = useState(''), [listening, setListening] = useState(false), [spoken, setSpoken] = useState(false);
  const began = useRef(Date.now()), rec = useRef(null);
  const q = s.questions[i];
  useEffect(() => { began.current = Date.now(); setText(''); setSpoken(false); }, [i]);
  useEffect(() => () => rec.current?.stop(), []);
  function speak() {
    if (!Speech) return onFlash('Your browser cannot listen. Type your answer, or use Chrome.');
    if (listening) { rec.current?.stop(); return; }
    const r = new Speech(); r.lang = 'en-US'; r.continuous = true; r.interimResults = false;
    r.onresult = (e) => { const said = Array.from(e.results).slice(e.resultIndex).map((x) => x[0].transcript).join(' '); setText((t) => `${t} ${said}`.trim()); setSpoken(true); };
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  }
  async function send() {
    rec.current?.stop(); setBusy('answer');
    try { const x = await apiRequest(`/mock-interviews/${s._id}/answer`, { method: 'POST', body: { index: i, answer: text, spoken, seconds: Math.round((Date.now() - began.current) / 1000) } }); setS(x); } catch (e) { onFlash(e.message); } finally { setBusy(''); }
  }
  async function finish() {
    setBusy('finish');
    try { setS(await apiRequest(`/mock-interviews/${s._id}/finish`, { method: 'POST' })); } catch (e) { onFlash(e.message); } finally { setBusy(''); }
  }
  const answered = s.questions.filter((x) => x.score != null).length;
  return (
    <div className="mi-wrap">
      <div className="mi-top"><button type="button" className="btn btn-outline btn-sm" onClick={onBack}>← Back</button><b>{s.role}</b><span className="text-xs text-muted">{answered}/{s.questions.length} answered</span></div>
      {s.status === 'completed' ? <Report s={s} /> : (
        <>
          <div className="mi-steps">{s.questions.map((x, n) => <button key={n} type="button" className={`${n === i ? 'on ' : ''}${x.score != null ? 'done' : ''}`} onClick={() => setI(n)}>{n + 1}</button>)}</div>
          <section className="mi-q">
            <span className="text-xs text-muted">Question {i + 1} · {q.kind}</span>
            <h4>{q.question}</h4>
            {q.score == null ? (
              <>
                <textarea className="form-input" rows={6} placeholder="Answer as you would in the real interview…" value={text} onChange={(e) => setText(e.target.value)} />
                <div className="mi-actions">
                  <button type="button" className={`btn btn-outline btn-sm${listening ? ' mi-rec' : ''}`} onClick={speak}>{listening ? '■ Stop listening' : '🎤 Speak answer'}</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={busy === 'answer' || text.trim().length < 3} onClick={send}>{busy === 'answer' ? 'AI is checking…' : 'Submit answer'}</button>
                </div>
              </>
            ) : <AnswerResult q={q} />}
          </section>
          <div className="mi-actions">
            {i < s.questions.length - 1 && <button type="button" className="btn btn-outline btn-sm" onClick={() => setI(i + 1)}>Next question →</button>}
            <button type="button" className="btn btn-primary btn-sm" disabled={!answered || busy === 'finish'} onClick={finish}>{busy === 'finish' ? 'Writing your report…' : 'Finish & get report'}</button>
          </div>
        </>
      )}
    </div>
  );
}

function AnswerResult({ q }) {
  const [tone, label] = CONF[q.confidence?.level] || ['', ''];
  return (
    <div className="mi-result">
      <p className="mi-answer"><b>Your answer{q.spoken ? ' (spoken)' : ''}:</b> {q.answer}</p>
      <div className="mi-scores"><span className="mi-score">{q.score}/10</span><span className={`mi-conf ${tone}`}>{label}{q.confidence?.score != null ? ` · ${q.confidence.score}/100` : ''}</span></div>
      {q.confidence?.signals?.length > 0 && <ul className="mi-signals">{q.confidence.signals.map((x) => <li key={x}>{x}</li>)}</ul>}
      <p><b>Feedback:</b> {q.feedback}</p>
      {q.betterAnswer && <p className="mi-better"><b>A stronger answer:</b> {q.betterAnswer}</p>}
    </div>
  );
}

function Report({ s }) {
  const sm = s.summary || {};
  const [tone, label] = CONF[sm.confidence] || ['', ''];
  return (
    <div className="mi-report">
      <div className="mi-scores"><span className="mi-score big">{sm.overallScore}/100</span><span className={`mi-conf ${tone}`}>{label}{sm.confidenceScore != null ? ` · ${sm.confidenceScore}/100` : ''}</span></div>
      {sm.verdict && <p>{sm.verdict}</p>}
      <div className="mi-cols">
        {sm.strengths?.length > 0 && <div><b>Strengths</b><ul>{sm.strengths.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        {sm.improvements?.length > 0 && <div><b>Improve</b><ul>{sm.improvements.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        {sm.nextSteps?.length > 0 && <div><b>Next steps</b><ul>{sm.nextSteps.map((x) => <li key={x}>{x}</li>)}</ul></div>}
      </div>
      <details><summary>Every answer</summary>{s.questions.map((q, n) => <div key={n} className="mi-q"><h4>{n + 1}. {q.question}</h4>{q.score != null ? <AnswerResult q={q} /> : <p className="text-muted">Not answered.</p>}</div>)}</details>
    </div>
  );
}
