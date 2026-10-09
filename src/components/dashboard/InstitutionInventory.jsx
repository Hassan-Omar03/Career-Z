import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

const categories = ['computer', 'projector', 'furniture', 'lab_equipment', 'sports_equipment', 'stationery', 'other'];
const blank = { name: '', category: 'other', quantity: 1, location: '', condition: 'good', purchaseDate: '', purchaseCost: 0, damagedQuantity: 0, notes: '' };
const text = value => String(value || '').replaceAll('_', ' ');
const available = item => item.assignedTo || ['damaged', 'needs_repair'].includes(item.condition) ? 0 : Math.max(0, item.quantity - (item.allocatedQuantity || 0) - (item.damagedQuantity || 0));

export default function InstitutionInventory({ manage = false, onFlash }) {
  const [data, setData] = useState({ institutions: [], items: [], loans: [], legacyItems: [] });
  const [institution, setInstitution] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [operation, setOperation] = useState(null);
  const [details, setDetails] = useState({ quantity: 1, recipient: '', reason: '', dueDate: '', notes: '', condition: 'good' });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(null);
  const base = '/institution-ops';
  async function load(id = institution) {
    setError('');
    if (manage) {
      const institutions = await apiRequest('/institutions/mine/list');
      const selected = id || institutions[0]?._id || '';
      setInstitution(selected);
      if (!selected) { setData({ institutions, items: [], loans: [], legacyItems: [] }); return; }
      const [items, loans, people] = await Promise.all([apiRequest(`${base}/${selected}/inventory`), apiRequest(`${base}/${selected}/inventory-loans`), apiRequest(`${base}/${selected}/inventory-recipients`)]);
      setRecipients(people); setData({ institutions, items, loans, legacyItems: [] });
    } else setData(await apiRequest(`${base}/inventory/mine`));
  }
  useEffect(() => { load().catch(error => { setError(error.message); onFlash(error.message, 'error'); }).finally(() => setLoading(false)); }, [manage]);
  async function run(work) {
    if (busy) return;
    setBusy(true);
    try { await work(); await load(); onFlash('Inventory updated.', 'success'); setOperation(null); }
    catch (error) { onFlash(error.message, 'error'); }
    finally { setBusy(false); }
  }
  const input = (key, type = 'text') => <input className="form-input" type={type} value={form[key] ?? ''} min={type === 'number' ? 0 : undefined} step={key === 'purchaseCost' ? '0.01' : type === 'number' ? 1 : undefined} required={key === 'name'} onChange={e => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />;
  const open = (action, row) => { setOperation({ action, row }); setDetails({ quantity: 1, recipient: '', reason: '', dueDate: '', notes: '', condition: row.damageReported ? 'damaged' : 'good' }); };
  async function save(e) {
    e.preventDefault();
    await run(async () => {
      await apiRequest(edit ? `${base}/inventory/${edit}` : `${base}/${institution}/inventory`, { method: edit ? 'PATCH' : 'POST', body: { ...form, purchaseDate: form.purchaseDate || null } });
      setEdit(null); setForm(blank);
    });
  }
  const button = (label, fn) => <button type="button" className="btn" disabled={busy} onClick={fn}>{label}</button>;
  if (loading) return <p role="status">Loading inventory…</p>;
  return <section>
    <h2>{manage ? 'Inventory Management' : 'My Institution Inventory'}</h2>
    {error && <p role="alert">{error} <button className="btn" onClick={() => { setLoading(true); load().catch(e => setError(e.message)).finally(() => setLoading(false)); }}>Retry</button></p>}
    {manage && <label>Institution<select className="form-select" value={institution} onChange={e => { setEdit(null); setForm(blank); load(e.target.value).catch(error => onFlash(error.message, 'error')); }}>{data.institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}</select></label>}
    {!error && !data.institutions.length && <p>No active institution connected. Check your approved enrollment in My Institutions.</p>}
    {manage && institution && <form onSubmit={save} className="dash-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
      <label>Item name{input('name')}</label>
      <label>Category<select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c} value={c}>{text(c)}</option>)}</select></label>
      <label>Total quantity{input('quantity', 'number')}</label><label>Location{input('location')}</label>
      <label>Condition<select className="form-select" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>{['new', 'good', 'needs_repair', 'damaged'].map(c => <option key={c} value={c}>{text(c)}</option>)}</select></label>
      <label>Unit cost (PKR){input('purchaseCost', 'number')}</label><label>Purchase date{input('purchaseDate', 'date')}</label>
      {edit && <label>Damaged units (reduce after repair){input('damagedQuantity', 'number')}</label>}
      <label>Notes{input('notes')}</label><button className="btn btn-primary" disabled={busy}>{edit ? 'Save changes' : 'Add item'}</button>
      {edit && button('Cancel edit', () => { setEdit(null); setForm(blank); })}
    </form>}
    <h3>Assets</h3>
    {!data.items.length && <p>No inventory items available.</p>}
    <div className="account-table-wrap"><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{['Item', 'Category', 'Location', 'Condition', 'Total', 'Available', 'Issued', 'Damaged', ...(manage ? ['Value (PKR)'] : []), 'Actions'].map(h => <th key={h} style={{ textAlign: 'left' }}>{h}</th>)}</tr></thead><tbody>{data.items.map(item => <tr key={item._id}>
      <td>{item.name}{!manage && <small> · {item.institution?.name}</small>}</td><td>{text(item.category)}</td><td>{item.location || '—'}</td><td>{text(item.condition)}</td><td>{item.quantity}</td><td>{available(item)}</td><td>{item.allocatedQuantity || 0}</td><td>{item.damagedQuantity || 0}</td>
      {manage && <td>{(item.quantity * item.purchaseCost).toLocaleString()}</td>}
      <td>{manage ? <>{button('Edit', () => { setEdit(item._id); setForm({ ...Object.fromEntries(Object.keys(blank).map(key => [key, item[key] ?? blank[key]])), purchaseDate: item.purchaseDate?.slice(0, 10) || '' }); })}{available(item) > 0 && button('Issue', () => open('issue', item))}{button('History', () => setHistory(item))}{button('Remove', () => open('remove', item))}{item.assignedTo && <><span>Legacy assignee: {item.assignedTo.fullName || 'Member'}</span>{button('Clear legacy assignment', () => open('legacy', item))}</>}</> : available(item) > 0 && button('Request', () => open('request', item))}</td>
    </tr>)}</tbody></table></div>
    <h3>{manage ? 'Requests and assignments' : 'My requests and assigned items'}</h3>
    {!data.loans.length && <p>No requests or assignments yet.</p>}
    {data.loans.map(loan => <article className="dash-card" key={loan._id} style={{ marginBottom: 12 }}>
      <strong>{loan.item?.name || 'Item'} · {loan.quantity} units</strong><p>{manage ? loan.recipient?.fullName : loan.institution?.name} · {text(loan.status)}{loan.dueDate && ` · Due ${new Date(loan.dueDate).toLocaleDateString()}${['issued', 'return_requested'].includes(loan.status) && new Date(loan.dueDate) < new Date() ? ' (overdue)' : ''}`}</p>
      {loan.reason && <p>{loan.reason}</p>}{loan.damageReported && <p>Damage reported: {loan.damageNotes}</p>}
      {manage && loan.status === 'pending' && <>{button('Approve and issue', () => open('approve', loan))}{button('Reject', () => open('reject', loan))}</>}
      {manage && ['issued', 'return_requested'].includes(loan.status) && button('Receive return', () => open('receive', loan))}
      {!manage && loan.status === 'pending' && button('Cancel request', () => open('cancel', loan))}
      {!manage && loan.status === 'issued' && button('Request return', () => open('return', loan))}
      {!manage && ['issued', 'return_requested'].includes(loan.status) && button('Report damage', () => open('damage', loan))}
      {button('History', () => setHistory(loan))}
    </article>)}
    {data.legacyItems?.map(item => <p key={item._id}>Legacy assignment: {item.name} ({item.institution?.name}). Contact your institute to record an issue/return.</p>)}
    {operation && <form className="dash-card" onSubmit={e => { e.preventDefault(); run(async () => {
      const { action, row } = operation;
      if (action === 'remove') await apiRequest(`${base}/inventory/${row._id}`, { method: 'DELETE' });
      else if (action === 'legacy') await apiRequest(`${base}/inventory/${row._id}`, { method: 'PATCH', body: { assignedTo: null } });
      else if (['request', 'issue'].includes(action)) await apiRequest(`${base}/inventory/${row._id}/${action}`, { method: 'POST', body: details });
      else await apiRequest(`${base}/inventory-loans/${row._id}`, { method: 'PATCH', body: { ...details, action } });
    }); }}>
      <h3>{text(operation.action)} · {operation.row.name || operation.row.item?.name}</h3>
      {operation.action === 'legacy' && <p>Confirm the existing asset has been returned before clearing this assignment. Then use Issue to record a new assignment with a quantity.</p>}
      {['request', 'issue'].includes(operation.action) && <><label>Quantity<input className="form-input" type="number" min="1" step="1" max={available(operation.row)} required value={details.quantity} onChange={e => setDetails({ ...details, quantity: Number(e.target.value) })} /></label><label>Reason<input className="form-input" value={details.reason} onChange={e => setDetails({ ...details, reason: e.target.value })} /></label></>}
      {operation.action === 'issue' && <label>Recipient<select className="form-select" required value={details.recipient} onChange={e => setDetails({ ...details, recipient: e.target.value })}><option value="">Select active member</option>{recipients.map(p => <option key={p._id} value={p._id}>{p.fullName} ({p.email})</option>)}</select></label>}
      {['issue', 'approve'].includes(operation.action) && <label>Return due date<input className="form-input" type="date" value={details.dueDate} onChange={e => setDetails({ ...details, dueDate: e.target.value })} /></label>}
      {operation.action === 'receive' && <label>Returned condition<select className="form-select" value={details.condition} onChange={e => setDetails({ ...details, condition: e.target.value })}><option value="good">Good — return to available stock</option><option value="damaged">Damaged — hold for repair</option></select></label>}
      <label>Notes<input className="form-input" required={operation.action === 'damage'} value={details.notes} onChange={e => setDetails({ ...details, notes: e.target.value })} /></label>
      <button className="btn btn-primary" disabled={busy}>Confirm {text(operation.action)}</button>{button('Cancel', () => setOperation(null))}
    </form>}
    {history && <div className="dash-card"><h3>History · {history.name || history.item?.name}</h3>{(history.history || []).map((h, i) => <p key={i}>{new Date(h.at).toLocaleString()} · {h.action} {h.notes}</p>)}{!history.history?.length && <p>No recorded movements yet.</p>}{button('Close history', () => setHistory(null))}</div>}
  </section>;
}
