import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import '../../styles/moderation.css';

// Super Admin moderation after automatic publishing: remove any fake or suspicious job,
// marketplace product (for example priced far above the market) or scholarship, with a reason the
// owner sees; restore it later. Plus every user with full details (phone, roles, documents,
// activity). The owner-side notice is AdminRemovedNote.

const date = (d) => (d ? new Date(d).toLocaleDateString() : '');
const money = (cur, n) => (n || n === 0 ? `${cur || 'PKR'} ${Number(n).toLocaleString()}` : '');

// Shown to the owner on their own list when CareerZ removed the item.
export function AdminRemovedNote({ item }) {
  if (item?.status !== 'removed_by_admin') return null;
  return (
    <div className="mod-removed" role="note">
      <strong>Removed by CareerZ admin{item.adminRemoval?.at ? ` on ${date(item.adminRemoval.at)}` : ''}</strong>
      {item.adminRemoval?.reason && <span>Reason: {item.adminRemoval.reason}</span>}
      <span>It is hidden from everyone. Contact CareerZ support if you think this is wrong.</span>
    </div>
  );
}

const KINDS = [['job', 'Jobs'], ['product', 'Marketplace products'], ['scholarship', 'Scholarships']];
const VIEW = { job: (id) => `/jobs/${id}`, product: (id) => `/marketplace/${id}`, scholarship: (id) => `/scholarships/${id}` };

export function AdminModerationPanel({ onFlash }) {
  const [kind, setKind] = useState('job'), [status, setStatus] = useState(''), [q, setQ] = useState(''), [rows, setRows] = useState(null);
  const load = (k = kind, s = status) => {
    setRows(null);
    apiRequest(`/admin/moderation/listings?kind=${k}${s ? `&status=${s}` : ''}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}`).then(setRows).catch((e) => { onFlash(e.message); setRows([]); });
  };
  useEffect(() => { load(); }, [kind, status]); // eslint-disable-line react-hooks/exhaustive-deps
  async function remove(r) {
    const reason = await showPrompt(`Why are you removing "${r.title}"? The owner will see this reason.`, { title: 'Remove as fake or suspicious', required: true, placeholder: kind === 'product' ? 'e.g. Price far above the market' : 'e.g. Asks candidates for money' });
    if (!reason) return;
    try { await apiRequest(`/admin/moderation/${kind}/${r._id}/remove`, { method: 'POST', body: { reason } }); onFlash('Removed. The owner was told why.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function restore(r) {
    if (!(await showConfirm(`Put "${r.title}" back live?`))) return;
    try { await apiRequest(`/admin/moderation/${kind}/${r._id}/restore`, { method: 'POST' }); onFlash('Restored.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  return (
    <div className="mod-wrap">
      <p className="text-sm text-muted">Everything goes live after the automatic check. Remove anything that looks fake or suspicious, or a product priced far above the market. The owner sees the reason and cannot put it back; you can restore it.</p>
      <div className="mod-tabs">{KINDS.map(([k, l]) => <button key={k} type="button" className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{l}</button>)}</div>
      <form className="mod-filters" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input className="form-input" type="search" placeholder="Search title or text" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option><option value="live">Live</option><option value="removed">Removed by admin</option></select>
        <button className="btn btn-outline btn-sm">Search</button>
      </form>
      {rows === null ? <p>Loading…</p> : !rows.length ? <p className="text-muted">Nothing found.</p> : (
        <ul className="mod-list">
          {rows.map((r) => (
            <li key={r._id} className={`mod-item${r.status === 'removed_by_admin' ? ' removed' : ''}`}>
              {r.image && <img src={r.image} alt="" />}
              <div className="mod-body">
                <div className="mod-head">
                  <a href={VIEW[kind](r._id)} target="_blank" rel="noreferrer"><strong>{r.title}</strong></a>
                  <span className={`tag ${r.status === 'removed_by_admin' ? 'rejected' : ['active', 'open'].includes(r.status) ? 'approved' : ''}`}>{r.status === 'removed_by_admin' ? 'Removed by admin' : r.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-muted">
                  {[r.company, r.category, r.place, kind === 'job' ? (r.salary ? `${r.currency} ${r.salary}` : '') : money(r.currency, r.price), `Posted ${date(r.createdAt)}`].filter(Boolean).join(' · ')}
                </p>
                {r.owner && <p className="text-xs">By <strong>{r.owner.fullName}</strong> · {r.owner.email}{r.owner.phone ? <> · <a href={`tel:${r.owner.phone}`}>{r.owner.phone}</a></> : ''} · {(r.owner.roles || []).join(', ').replace(/_/g, ' ')}</p>}
                {r.adminRemoval && <p className="text-xs mod-reason">Removed {date(r.adminRemoval.at)}: {r.adminRemoval.reason}</p>}
              </div>
              <div className="mod-actions">
                {r.status === 'removed_by_admin'
                  ? <button type="button" className="btn btn-outline btn-sm" onClick={() => restore(r)}>Restore</button>
                  : <button type="button" className="btn btn-sm mod-danger" onClick={() => remove(r)}>Remove</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ROLES = ['student', 'parent', 'teacher', 'institution_owner', 'academy_owner', 'institution_staff', 'employer', 'education_agent', 'donor', 'marketplace_seller', 'admin', 'super_admin', 'platform_staff'];
const label = (s) => String(s || '').replace(/_/g, ' ');

export function AdminUsersPanel({ onFlash }) {
  const [q, setQ] = useState(''), [role, setRole] = useState(''), [page, setPage] = useState(1), [data, setData] = useState(null), [open, setOpen] = useState(null);
  const load = (p = page) => apiRequest(`/admin/moderation/users?page=${p}${role ? `&role=${role}` : ''}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}`).then(setData).catch((e) => onFlash(e.message));
  useEffect(() => { load(1); setPage(1); }, [role]); // eslint-disable-line react-hooks/exhaustive-deps
  async function setStatus(u, status) {
    if (!(await showConfirm(`${status === 'active' ? 'Activate' : 'Suspend'} ${u.fullName}?`))) return;
    try { await apiRequest(`/users/${u._id}/status`, { method: 'PATCH', body: { status } }); onFlash('Saved.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  return (
    <div className="mod-wrap">
      <form className="mod-filters" onSubmit={(e) => { e.preventDefault(); setPage(1); load(1); }}>
        <input className="form-input" type="search" placeholder="Name, email, phone or city" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All account types</option>{ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select>
        <button className="btn btn-outline btn-sm">Search</button>
      </form>
      {!data ? <p>Loading…</p> : (
        <>
          <p className="text-xs text-muted">{data.total} user{data.total === 1 ? '' : 's'}</p>
          <div className="mod-table-wrap"><table className="mod-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Account type</th><th>City</th><th>Status</th><th>Joined</th><th /></tr></thead>
            <tbody>{data.users.map((u) => (
              <tr key={u._id}>
                <td><button type="button" className="mod-link" onClick={() => setOpen(u._id)}>{u.fullName}</button></td>
                <td className="text-xs">{u.email}{u.emailVerified ? ' ✓' : ''}</td>
                <td className="text-xs">{u.phone ? <a href={`tel:${u.phone}`}>{u.phone}</a> : '–'}</td>
                <td className="text-xs">{(u.requests.length ? u.requests.map((r) => `${label(r.role)} (${label(r.status)})`) : u.roles.map(label)).join(', ')}</td>
                <td className="text-xs">{u.city || '–'}</td>
                <td><span className={`tag ${u.status === 'active' ? 'approved' : 'rejected'}`}>{u.status}</span></td>
                <td className="text-xs">{date(u.createdAt)}</td>
                <td className="mod-row-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(u._id)}>Details</button>
                  {!u.roles.includes('super_admin') && (u.status === 'active' ? <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus(u, 'suspended')}>Suspend</button> : <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus(u, 'active')}>Activate</button>)}
                </td>
              </tr>
            ))}</tbody>
          </table></div>
          {data.pages > 1 && <div className="mod-pages"><button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}>Previous</button><span className="text-xs">Page {page} of {data.pages}</span><button type="button" className="btn btn-outline btn-sm" disabled={page >= data.pages} onClick={() => { setPage(page + 1); load(page + 1); }}>Next</button></div>}
        </>
      )}
      {open && <UserDetail id={open} onClose={() => setOpen(null)} onFlash={onFlash} />}
    </div>
  );
}

function UserDetail({ id, onClose, onFlash }) {
  const [d, setD] = useState(null);
  useEffect(() => { apiRequest(`/admin/moderation/users/${id}`).then(setD).catch((e) => { onFlash(e.message); onClose(); }); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const u = d?.user;
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-lg mod-detail" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head"><h3>{u ? u.fullName : 'Loading…'}</h3><button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Close</button></div>
        {u && (
          <div className="mod-detail-body">
            <section>
              <h4>Contact and account</h4>
              <dl className="mod-dl">
                <div><dt>Email</dt><dd><a href={`mailto:${u.email}`}>{u.email}</a> {u.emailVerified ? '(verified)' : '(not verified)'}</dd></div>
                <div><dt>Phone</dt><dd>{u.phone ? <a href={`tel:${u.phone}`}>{u.phone}</a> : '–'} {u.phone && (u.phoneVerified ? '(verified)' : '')}</dd></div>
                <div><dt>City / country</dt><dd>{[u.city, u.country].filter(Boolean).join(', ') || '–'}</dd></div>
                <div><dt>Status</dt><dd>{u.status}</dd></div>
                <div><dt>Roles</dt><dd>{u.roles.map(label).join(', ') || '–'}</dd></div>
                <div><dt>Joined</dt><dd>{date(u.createdAt)}</dd></div>
                <div><dt>Last login</dt><dd>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '–'}</dd></div>
              </dl>
            </section>
            {d.requests.length > 0 && <section><h4>Account verification</h4><ul>{d.requests.map((r) => <li key={r._id}>{label(r.requestedRole)}{r.subtype ? ` (${label(r.subtype)})` : ''}: <strong>{label(r.status)}</strong>{r.approvedAt ? ` · approved ${date(r.approvedAt)}` : ''}</li>)}</ul></section>}
            {d.profiles.filter((p) => Object.keys(p.fields).length).map((p) => (
              <section key={p.role}><h4>{label(p.role)} profile ({p.percent}%)</h4><dl className="mod-dl">{Object.entries(p.fields).map(([k, v]) => <div key={k}><dt>{label(k.replace(/([A-Z])/g, ' $1'))}</dt><dd>{String(v)}</dd></div>)}</dl></section>
            ))}
            {d.documents.length > 0 && <section><h4>Documents ({d.documents.length})</h4><ul>{d.documents.map((x) => <li key={x._id}>{label(x.documentType)} · {x.originalName || x.contentType} · {date(x.createdAt)}</li>)}</ul><p className="text-xs text-muted">Open the files from User Verification &amp; Approval.</p></section>}
            {d.institutions.length > 0 && <section><h4>Institutes</h4><ul>{d.institutions.map((i) => <li key={i._id}>{i.name} ({label(i.type)}{i.city ? `, ${i.city}` : ''}) · {String(i.owner) === String(u._id) ? 'owner' : 'staff'} · {label(i.verificationStatus)}</li>)}</ul></section>}
            {d.children.length > 0 && <section><h4>Family links</h4><ul>{d.children.map((c) => <li key={c._id}>{c.parent?.fullName} → {c.student?.fullName} ({c.relationship}, {c.status})</li>)}</ul></section>}
            <section>
              <h4>Activity</h4>
              <p className="text-sm">Jobs posted: {d.counts.jobs} · Job applications: {d.counts.applications} · Listings: {d.counts.products} · Orders bought: {d.counts.ordersBought} · Orders sold: {d.counts.ordersSold}</p>
              {d.jobs.length > 0 && <ul>{d.jobs.map((j) => <li key={j._id}>{j.title} · {j.company} · {label(j.status)}</li>)}</ul>}
              {d.products.length > 0 && <ul>{d.products.map((p) => <li key={p._id}>{p.title} · {money(p.currency, p.price)} · {label(p.status)}</li>)}</ul>}
              {d.scholarships.length > 0 && <ul>{d.scholarships.map((s) => <li key={s._id}>{s.title} · {money(s.currency, s.amount)} · {label(s.status)}</li>)}</ul>}
            </section>
            {(d.wallets.length > 0 || d.payments.length > 0) && <section>
              <h4>Money</h4>
              {d.wallets.map((w) => <p key={w._id} className="text-sm">Wallet {w.currency}: {Number(w.available ?? w.balance ?? 0).toLocaleString()}{w.pending ? ` (pending ${Number(w.pending).toLocaleString()})` : ''}</p>)}
              {d.payments.length > 0 && <ul>{d.payments.map((p) => <li key={p._id}>{p.number} · {p.title} · {money(p.currency, (p.commission || 0) + (p.sellerAmount || 0))} · {label(p.status)}</li>)}</ul>}
            </section>}
          </div>
        )}
      </div>
    </div>
  );
}
