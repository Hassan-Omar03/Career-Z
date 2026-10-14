import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api/client';

// Homepage console (same design as before). The suggested questions are only shortcuts: each
// answer is generated live by the CareerZ AI assistant (POST /api/site-assistant/chat), which
// answers from CareerZ's own data. Nothing here is a pre-written answer. The AI is called only
// when a visitor clicks a question, and each answer is reused for the rest of their visit.
const PROMPTS = [
  { label: 'Suggest Universities', q: 'Which universities and institutes can I find on CareerZ?' },
  { label: 'Find Scholarships', q: 'Which scholarships are open on CareerZ right now, and how do I apply?' },
  { label: 'Recommend Courses', q: 'What courses are available on CareerZ?' },
  { label: 'Career Advice', q: 'How can CareerZ help me find a job or internship?' },
  { label: 'Admission Guidance', q: 'How do I apply for admission to an institute through CareerZ?' }
];
const CACHE = 'careerz_console_answers_v1';
const readCache = () => { try { return JSON.parse(sessionStorage.getItem(CACHE) || '{}'); } catch { return {}; } };

export default function AiConsole() {
  const [active, setActive] = useState(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => { apiRequest('/site-assistant/status', { auth: false }).then((s) => setEnabled(!!s.enabled)).catch(() => setEnabled(false)); }, []);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function typeOut(text) {
    clearTimeout(timeoutRef.current);
    let i = 0;
    setTyped('');
    (function step() { if (i <= text.length) { setTyped(text.slice(0, i)); i += 2; timeoutRef.current = setTimeout(step, 12); } })();
  }

  async function ask(index) {
    if (busy) return;
    setActive(index);
    const { q } = PROMPTS[index];
    const cached = readCache()[q];
    if (cached) return typeOut(cached);
    setBusy(true); setTyped('');
    try {
      const { reply } = await apiRequest('/site-assistant/chat', { method: 'POST', auth: false, body: { messages: [{ role: 'user', content: q }] } });
      const plain = String(reply || '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
      try { sessionStorage.setItem(CACHE, JSON.stringify({ ...readCache(), [q]: plain })); } catch { /* not cached */ }
      typeOut(plain);
    } catch (err) {
      setTyped(err.message || 'The assistant is temporarily unavailable. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <div className="ai-console reveal in">
      <div className="console-top">
        <div className="console-dot-row"><span></span><span></span><span></span></div>
        <div className="console-label">CAREERZ AI · LIVE</div>
      </div>
      <div className="console-body">
        <div className="console-q">Ask CareerZ AI: {active === null ? 'choose a question below' : `"${PROMPTS[active].q}"`}</div>
        <div className="console-a" aria-live="polite">
          {enabled === false ? 'The CareerZ AI assistant is not available right now.' : busy ? 'Thinking…' : active === null ? 'Pick a question and CareerZ AI answers it live from what is on the platform today.' : typed}
          <span className="caret"></span>
        </div>
        <div className="console-prompts">
          {PROMPTS.map((p, i) => (
            <button key={p.label} type="button" className={i === active ? 'active' : ''} disabled={enabled === false || busy} onClick={() => ask(i)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
