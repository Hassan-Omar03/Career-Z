const TICKER_ITEMS = [
  'Ayesha K. admitted to FAST-NU Lahore',
  'Punjab Group of Colleges awarded 12 new scholarships',
  'Systems Limited posted 8 new internship roles',
  'Bilal H. earned $4,200 commission as Education Agent',
  'LUMS Open House scheduled for next month',
  'Sara M. completed AI-recommended IELTS prep course',
  'NUST announces merit scholarship pool of $5,000,000',
  'Coca-Cola hiring management trainees via CareerZ'
];

export default function LiveTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {doubled.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}
