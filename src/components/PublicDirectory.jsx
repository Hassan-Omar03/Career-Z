import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function PublicDirectory({ kind }) {
  const [items, setItems] = useState([]), [query, setQuery] = useState(''), [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    apiRequest('/' + kind, { auth: false }).then(data => { if (alive) setItems(Array.isArray(data) ? data : []); }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [kind, retry]);
  const results = items.filter(item => [item.title, item.name, item.country, item.city, item.subject, item.institution?.name].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase()));
  return <section aria-label={'Browse ' + kind}>
    <label htmlFor="directory-search">Search {kind}</label>
    <input id="directory-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, subject or location" />
    {loading && <p role="status">Loading {kind}...</p>}
    {error && <p role="alert">{error} <button onClick={() => setRetry(n => n + 1)}>Retry</button></p>}
    {!loading && !error && !results.length && <p>No matching published listings are available.</p>}
    <div className="public-page-links">{results.map(item => <article className="discovery-card" key={item._id}>
      <h2>{item.title || item.name}</h2>
      <p>{[item.institution?.name, item.subject, item.city, item.country].filter(Boolean).join(' · ')}</p>
      <p>{String(item.description || item.summary || '').replace(/<[^>]*>/g, '').slice(0, 280)}</p>
      <Link to="/signup">{kind === 'institutions' ? 'Join this institution' : kind === 'courses' ? 'Sign up to enroll' : 'Sign up to apply'}</Link>
    </article>)}</div>
  </section>;
}
