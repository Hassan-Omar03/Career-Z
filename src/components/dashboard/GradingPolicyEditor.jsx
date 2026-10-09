import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Institution grading scale: grade bands (min %, label, points), passing % and GPA scale.
// Results, transcripts and GPA/CGPA all use it.
export default function GradingPolicyEditor({ institutionId, onFlash }) {
  const [policy, setPolicy] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() { apiRequest(`/institutions/${institutionId}/grading-policy`).then(setPolicy).catch((err) => onFlash?.(err.message)); }
  useEffect(load, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  function setBand(index, field, value) {
    setPolicy((p) => ({ ...p, bands: p.bands.map((b, i) => (i === index ? { ...b, [field]: value } : b)) }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { gpaScaleMax: Number(policy.gpaScaleMax), passingPercent: Number(policy.passingPercent), bands: policy.bands.map((b) => ({ minPercent: Number(b.minPercent), grade: b.grade, points: Number(b.points) })) };
      setPolicy(await apiRequest(`/institutions/${institutionId}/grading-policy`, { method: 'PUT', body }));
      onFlash?.('Grading scale saved. New results and transcripts will use it.', 'success');
      setOpen(false);
    } catch (err) { onFlash?.(err.message); } finally { setSaving(false); }
  }

  async function reset() {
    try { setPolicy(await apiRequest(`/institutions/${institutionId}/grading-policy`, { method: 'DELETE' })); onFlash?.('Grading scale reset to the default 4.0 scale.', 'success'); setOpen(false); }
    catch (err) { onFlash?.(err.message); }
  }

  if (!policy) return null;
  const summary = policy.bands.map((b) => `${b.grade} ≥${b.minPercent}% (${b.points})`).join(' · ');

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <strong>Grading scale {policy.isDefault && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>(platform default)</span>}</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>GPA out of {Number(policy.gpaScaleMax).toFixed(1)} · pass at {policy.passingPercent}% · {summary}</p>
        </div>
        {!open && <button type="button" className="btn" onClick={() => setOpen(true)}>Edit scale</button>}
      </div>
      {open && (
        <form onSubmit={save} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <div className="flex gap-3 flex-wrap">
            <label className="text-xs">GPA scale
              <select className="form-select" value={policy.gpaScaleMax} onChange={(e) => setPolicy({ ...policy, gpaScaleMax: Number(e.target.value) })}>
                {[4, 5, 10].map((n) => <option key={n} value={n}>{n}.0</option>)}
              </select>
            </label>
            <label className="text-xs">Passing %
              <input className="form-input" type="number" min="0" max="100" value={policy.passingPercent} onChange={(e) => setPolicy({ ...policy, passingPercent: e.target.value })} style={{ width: 100 }} />
            </label>
          </div>
          <table className="text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ textAlign: 'left' }}>From %</th><th style={{ textAlign: 'left' }}>Grade</th><th style={{ textAlign: 'left' }}>Points</th><th /></tr></thead>
            <tbody>
              {policy.bands.map((b, i) => (
                <tr key={i}>
                  <td><input className="form-input" type="number" min="0" max="100" step="0.01" value={b.minPercent} onChange={(e) => setBand(i, 'minPercent', e.target.value)} style={{ width: 90 }} /></td>
                  <td><input className="form-input" value={b.grade} maxLength={8} onChange={(e) => setBand(i, 'grade', e.target.value)} style={{ width: 80 }} /></td>
                  <td><input className="form-input" type="number" min="0" step="0.01" value={b.points} onChange={(e) => setBand(i, 'points', e.target.value)} style={{ width: 90 }} /></td>
                  <td><button type="button" className="btn" style={{ padding: '4px 10px' }} disabled={policy.bands.length <= 2} onClick={() => setPolicy({ ...policy, bands: policy.bands.filter((_, j) => j !== i) })}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>The lowest band must start at 0%. Higher bands cannot be worth fewer points than lower ones.</p>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="btn" onClick={() => setPolicy({ ...policy, bands: [...policy.bands, { minPercent: '', grade: '', points: '' }] })}>Add band</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save scale'}</button>
            {!policy.isDefault && <button type="button" className="btn" onClick={reset}>Reset to default</button>}
            <button type="button" className="btn" onClick={() => { setOpen(false); load(); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
