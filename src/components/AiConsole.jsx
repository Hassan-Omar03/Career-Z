import { useEffect, useRef, useState } from 'react';

const PROMPTS = [
  { label: 'Suggest Universities', q: '"Suggest universities for me"', a: "Based on your interests in Computer Science and a budget under $400,000/year, I'd suggest FAST-NU, COMSATS Islamabad, and Bahria University — all offer strong CS programs with active CareerZ admission support." },
  { label: 'Find Scholarships', q: '"Find scholarships for me"', a: 'You may qualify for the National Need-Based Scholarship and 3 institution-specific merit awards. I can auto-fill your application using your saved academic profile.' },
  { label: 'Recommend Courses', q: '"Recommend courses for me"', a: 'For a career in Data Science, I recommend: Python for Beginners → Statistics Foundations → Machine Learning Essentials, all available through verified CareerZ instructors.' },
  { label: 'Career Advice', q: '"Give me career advice"', a: 'Given your strengths in design and communication, UX Research and Digital Marketing are strong-fit paths. Want a 6-month skill roadmap?' },
  { label: 'Admission Guidance', q: '"Help me with admission guidance"', a: "Your target university's deadline is in 21 days. Required documents: academic transcript, national ID, 2 photos. I can track your application status automatically." }
];

export default function AiConsole() {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    const answer = PROMPTS[active].a;
    let i = 0;
    setTyped('');
    function type() {
      if (i <= answer.length) {
        setTyped(answer.slice(0, i));
        i++;
        timeoutRef.current = setTimeout(type, 14);
      }
    }
    type();
    return () => clearTimeout(timeoutRef.current);
  }, [active]);

  return (
    <div className="ai-console reveal in">
      <div className="console-top">
        <div className="console-dot-row"><span></span><span></span><span></span></div>
        <div className="console-label">CAREERZ AI · LIVE</div>
      </div>
      <div className="console-body">
        <div className="console-q">Ask CareerZ AI: {PROMPTS[active].q}</div>
        <div className="console-a">
          {typed}
          <span className="caret"></span>
        </div>
        <div className="console-prompts">
          {PROMPTS.map((p, i) => (
            <button key={p.label} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
