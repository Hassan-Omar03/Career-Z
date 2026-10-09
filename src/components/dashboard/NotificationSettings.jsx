import { useEffect, useState } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa6';
import { apiRequest } from '../../api/client';
import { currentPushSubscription, disablePush, enablePush, pushSupported } from '../../utils/pushNotifications';

// "Browser notifications" switch for Settings: lets a user get CareerZ notifications as system
// notifications even when the site is closed.
export function PushNotificationToggle({ onFlash }) {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const supported = pushSupported();
  useEffect(() => { if (supported) currentPushSubscription().then((sub) => setOn(Boolean(sub))).catch(() => {}); }, [supported]);

  async function toggle() {
    setBusy(true);
    try {
      if (on) { await disablePush(); setOn(false); onFlash?.('Browser notifications turned off.', 'success'); }
      else { await enablePush(); setOn(true); onFlash?.('Browser notifications turned on.', 'success'); }
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{on ? <FaBell aria-hidden="true" /> : <FaBellSlash aria-hidden="true" />} Browser notifications</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
          {supported ? 'Get announcements, results and messages as phone/desktop notifications, even when CareerZ is closed.' : 'This browser does not support background notifications.'}
        </p>
      </div>
      {supported && <button type="button" className={on ? 'btn' : 'btn btn-primary'} disabled={busy} onClick={toggle}>{busy ? 'Working...' : on ? 'Turn off' : 'Turn on'}</button>}
    </div>
  );
}

// Owner-only editor for what an individual staff member may do (broadcasts, fees, grading...).
export function StaffPermissionsEditor({ institutionId, staff, onFlash, onSaved }) {
  const [catalogue, setCatalogue] = useState([]);
  const [selected, setSelected] = useState(() => new Set(staff.permissions || []));
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open && !catalogue.length) apiRequest('/institutions/meta/staff-permissions').then(setCatalogue).catch((err) => onFlash?.(err.message)); }, [open, catalogue.length, onFlash]);

  async function save() {
    setSaving(true);
    try {
      const keys = catalogue.map((c) => c.key);
      await apiRequest(`/institutions/${institutionId}/staff/${staff.user?._id || staff.user}/permissions`, { method: 'PATCH', body: { permissions: [...selected].filter((p) => keys.includes(p)) } });
      onFlash?.('Staff permissions saved.', 'success');
      setOpen(false);
      onSaved?.();
    } catch (err) { onFlash?.(err.message); } finally { setSaving(false); }
  }

  if (!open) return <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(true)}>Permissions</button>;
  return (
    <div style={{ display: 'grid', gap: 4, minWidth: 220 }}>
      {catalogue.map((c) => (
        <label key={c.key} className="text-xs" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={selected.has(c.key)} onChange={() => setSelected((prev) => { const next = new Set(prev); if (next.has(c.key)) next.delete(c.key); else next.add(c.key); return next; })} />
          {c.label}
        </label>
      ))}
      <div className="flex gap-2">
        <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save'}</button>
        <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}
