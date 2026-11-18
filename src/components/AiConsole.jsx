import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api/client';
import { useTranslation } from '../context/TranslationContext';

const URDU_PROMPTS = [
  { label: 'جامعات کی تجاویز', q: 'کیریئر زی پر کون سی جامعات اور تعلیمی ادارے دستیاب ہیں؟' },
  { label: 'اسکالرشپس تلاش کریں', q: 'کیریئر زی پر کون سی اسکالرشپس کھلی ہیں اور درخواست کیسے دی جا سکتی ہے؟' },
  { label: 'کورسز کی تجاویز', q: 'کیریئر زی پر کون سے کورسز دستیاب ہیں؟' },
  { label: 'کیریئر کی رہنمائی', q: 'کیریئر زی ملازمت یا انٹرن شپ تلاش کرنے میں میری مدد کیسے کر سکتا ہے؟' },
  { label: 'داخلے کی رہنمائی', q: 'کیریئر زی کے ذریعے کسی ادارے میں داخلے کی درخواست کیسے دوں؟' }
];

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
  const { lang } = useTranslation();
  const prompts = lang === 'ur' ? URDU_PROMPTS : PROMPTS;
  const requestId = useRef(0);
  const [active, setActive] = useState(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => { apiRequest('/site-assistant/status', { auth: false }).then((s) => setEnabled(!!s.enabled)).catch(() => setEnabled(false)); }, []);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  useEffect(() => { requestId.current += 1; clearTimeout(timeoutRef.current); setTyped(''); setActive(null); setBusy(false); }, [lang]);

  function typeOut(text) {
    clearTimeout(timeoutRef.current);
    let i = 0;
    setTyped('');
    (function step() { if (i <= text.length) { setTyped(text.slice(0, i)); i += 2; timeoutRef.current = setTimeout(step, 12); } })();
  }

  async function ask(index) {
    if (busy) return;
    setActive(index);
    const { q } = prompts[index];
    const id = ++requestId.current;
    const key = `${lang}:${q}`;
    const display = text => lang === 'en' ? typeOut(text) : setTyped(text);
    // A saved answer is reused for 10 minutes only, so counts like "how many jobs" stay current (audit N-30).
    const cached = readCache()[key];
    if (cached && typeof cached === 'object' && Date.now() - cached.at < 10 * 60 * 1000) return display(cached.text);
    setBusy(true); setTyped('');
    try {
      const { reply } = await apiRequest('/site-assistant/chat', { method: 'POST', auth: false, body: { messages: [{ role: 'user', content: lang === 'en' || lang === 'ur' ? q : `${q}\nReply in language: ${lang}.` }] } });
      if (requestId.current !== id) return;
      const plain = String(reply || '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
      try { sessionStorage.setItem(CACHE, JSON.stringify({ ...readCache(), [key]: { text: plain, at: Date.now() } })); } catch { /* not cached */ }
      display(plain);
    } catch (err) {
      if (requestId.current === id) setTyped(lang === 'ur' ? 'معاون فی الحال دستیاب نہیں ہے۔ براہ کرم دوبارہ کوشش کریں۔' : err.message || 'The assistant is temporarily unavailable. Please try again.');
    } finally { if (requestId.current === id) setBusy(false); }
  }

  return (
    <div className="ai-console reveal in">
      <div className="console-top">
        <div className="console-dot-row"><span></span><span></span><span></span></div>
        <div className="console-label">CAREERZ AI · LIVE</div>
      </div>
      <div className="console-body">
        <div className="console-q" data-no-translate={lang === 'ur' || undefined}>{lang === 'ur' ? 'کیریئر زی اے آئی: ' : 'Ask CareerZ AI: '}{active === null ? lang === 'ur' ? 'نیچے سے کوئی سوال منتخب کریں' : 'choose a question below' : `"${prompts[active].q}"`}</div>
        <div className="console-a" aria-live="polite" data-no-translate lang={lang} dir={['ur','ar','fa','he'].includes(lang) ? 'rtl' : 'ltr'}>
          {enabled === false ? (lang === 'ur' ? 'کیریئر زی کا اے آئی معاون فی الحال دستیاب نہیں ہے۔' : 'The CareerZ AI assistant is not available right now.') : busy ? (lang === 'ur' ? 'جواب تیار ہو رہا ہے۔۔۔' : 'Thinking…') : active === null ? (lang === 'ur' ? 'کوئی سوال منتخب کریں۔ کیریئر زی دستیاب معلومات سے جواب تیار کرے گا۔' : 'Pick a question and CareerZ AI answers it live from what is on the platform today.') : typed}
          <span className="caret"></span>
        </div>
        <div className="console-prompts">
          {prompts.map((p, i) => (
            <button key={p.label} type="button" data-no-translate={lang === 'ur' || undefined} className={i === active ? 'active' : ''} disabled={enabled === false || busy} onClick={() => ask(i)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
