// Homepage ticker (same design as before), now showing the newest real listings passed in from
// the homepage data. With nothing published yet it is simply not shown.
export default function LiveTicker({ items = [] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];
  // About 7.5px per letter plus the gap between items, moving 40px each second.
  const width = items.reduce((sum, t) => sum + String(t).length * 7.5 + 48, 0);
  const seconds = Math.max(40, Math.round(width / 40));
  return (
    <div className="ticker-bar" aria-label="Latest on CareerZ">
      <div className="ticker-track" style={{ animationDuration: `${seconds}s` }}>
        {doubled.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}
