import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';

// Home page live activity: one small pop-up at a time in the bottom-left corner ("New job · Sales
// Officer at Engro Corporation, Karachi"), taken from the real newest jobs, scholarships, courses,
// marketplace listings, institutes and blog posts. Clicking opens the item; the × stops them.
const ago = (d) => {
  if (!d) return '';
  const m = Math.max(1, Math.round((Date.now() - new Date(d)) / 60000));
  return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};

export default function LiveActivityToasts() {
  const [items, setItems] = useState([]), [i, setI] = useState(-1), [show, setShow] = useState(false), [off, setOff] = useState(false);
  const timer = useRef(null), task = useRef(null), dueAt = useRef(0), remaining = useRef(0);
  const paused = useRef({ mouse: false, focus: false });
  const schedule = (fn, delay) => {
    clearTimeout(timer.current); task.current = fn; remaining.current = delay;
    if (paused.current.mouse || paused.current.focus) return;
    dueAt.current = Date.now() + delay;
    timer.current = setTimeout(fn, delay);
  };
  function pause(kind) {
    if (!paused.current.mouse && !paused.current.focus) remaining.current = Math.max(0, dueAt.current - Date.now());
    paused.current[kind] = true; clearTimeout(timer.current);
  }
  function resume(kind) {
    paused.current[kind] = false;
    if (!paused.current.mouse && !paused.current.focus && task.current) schedule(task.current, remaining.current);
  }
  useEffect(() => { apiRequest('/public/activity', { auth: false }).then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => {}); }, []);
  useEffect(() => {
    if (!items.length || off) return undefined;
    const showNext = () => {
      setI((n) => (n + 1) % items.length);
      setShow(true);
      schedule(() => { setShow(false); schedule(showNext, 3200); }, 4800);
    };
    schedule(showNext, 2500);
    return () => { clearTimeout(timer.current); task.current = null; };
  }, [items, off]);
  if (!items.length || off || i < 0) return null;
  const it = items[i];
  return (
    <div className="toast-stack" aria-live="polite">
      <div className={`toast live-toast${show ? ' show' : ''}`} role="status" onMouseEnter={() => pause('mouse')} onMouseLeave={() => resume('mouse')} onFocusCapture={() => pause('focus')} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) resume('focus'); }}>
        <span className="dot" aria-hidden="true" />
        <Link to={it.link} className="live-toast-text"><strong>{it.label}</strong> {it.text}{it.at && <small> · {ago(it.at)}</small>}</Link>
        <button type="button" className="live-toast-close" aria-label="Stop these notifications" onClick={() => setOff(true)}>×</button>
      </div>
    </div>
  );
}
