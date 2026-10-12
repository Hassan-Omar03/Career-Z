import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import ObservationCard from './ObservationCard';

export default function ParentUpdates() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  async function refresh() { setRows(await apiRequest('/parents/me/updates')); }
  useEffect(() => {
    let active = true;
    let pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const updates = await apiRequest('/parents/me/updates');
        if (active) { setRows(updates); setError(''); }
      } catch (e) {
        if (active) { setError(e.message); setRows(null); }
      } finally { pending = false; }
    }
    load();
    const timer = setInterval(load, 10000);
    window.addEventListener('focus', load);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', load); };
  }, []);
  return <section aria-label="Updates for all your children" style={{ marginBottom: 24 }}>
    <h2>Latest child updates</h2>
    <p>Updates for all your linked children appear here automatically, newest first.</p>
    {error && <p role="alert">{error}</p>}
    {rows === null && !error && <p role="status">Loading updates...</p>}
    {rows?.length === 0 && <p>No teacher updates yet.</p>}
    <div style={{ display: 'grid', gap: 12 }}>
      {rows?.map(row => <ObservationCard key={row._id} row={row} onSaved={refresh} />)}
    </div>
  </section>;
}
