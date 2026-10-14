// Homepage ticker (same design as before), now showing the newest real listings passed in from
// the homepage data. With nothing published yet it is simply not shown.
export default function LiveTicker({ items = [] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="ticker-bar" aria-label="Latest on CareerZ">
      <div className="ticker-track">
        {doubled.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}
