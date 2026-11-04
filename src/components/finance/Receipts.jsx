import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import '../../styles/finance.css';

const money = (currency, value) => `${currency} ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

async function downloadReceipt(r, onFlash) {
  try {
    const [{ jsPDF }, { createBrandedPdf, addPdfFooter }, QRCode] = await Promise.all([import('jspdf'), import('../../utils/brandedPdf'), import('qrcode')]);
    const pdf = await createBrandedPdf(jsPDF, { title: 'Payment Receipt', subtitle: r.receiptNumber });
    const rows = [
      ['Receipt number', r.receiptNumber], ['Issued', new Date(r.issuedAt).toLocaleString()], ['For', r.title], ['Reference', r.reference],
      ['Paid by', r.payerName], ['Paid to', r.recipientName], ['Payment method', r.paymentMethod],
      ['Total paid', money(r.currency, r.grossAmount)], ['CareerZ commission', money(r.currency, r.platformCommission)],
      ['Of which tax', money(r.currency, r.taxAmount)], ['Of which gateway charges', money(r.currency, r.gatewayFee)], ['Net to receiver', money(r.currency, r.netAmount)]
    ].filter(([, v]) => v);
    let y = 66;
    for (const [label, value] of rows) {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.text(String(label), 14, y);
      pdf.setFont('helvetica', 'normal'); pdf.text(pdf.splitTextToSize(String(value), 110), 80, y);
      y += 9;
    }
    const link = `${window.location.origin}/verify-receipt/${r.receiptNumber}`;
    pdf.addImage(await QRCode.toDataURL(link, { margin: 1, width: 240 }), 'PNG', 14, y + 2, 32, 32);
    pdf.setFontSize(8); pdf.text(`Scan to check this receipt: ${link}`, 50, y + 18);
    addPdfFooter(pdf);
    pdf.save(`${r.receiptNumber}.pdf`);
  } catch (err) { onFlash?.(err.message || 'The receipt could not be downloaded.'); }
}

function ReceiptTable({ rows, onFlash, withPeople }) {
  return (
    <div className="fin-scroll"><table className="fin-table">
      <thead><tr><th>Receipt</th><th>Date</th><th>For</th>{withPeople && <><th>Paid by</th><th>Paid to</th></>}<th>Total</th><th>Commission</th><th>Net</th><th aria-label="Download" /></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r._id}>
          <td>{r.receiptNumber}</td><td>{new Date(r.issuedAt).toLocaleDateString()}</td><td>{r.title}</td>
          {withPeople && <><td>{r.payerName || '—'}</td><td>{r.recipientName}</td></>}
          <td>{money(r.currency, r.grossAmount)}</td><td>{money(r.currency, r.platformCommission)}</td><td>{money(r.currency, r.netAmount)}</td>
          <td><button type="button" className="btn btn-ghost vf-small" onClick={() => downloadReceipt(r, onFlash)}>PDF</button></td>
        </tr>
      ))}</tbody>
    </table></div>
  );
}

export function MyReceipts({ onFlash }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { apiRequest('/receipts/mine').then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="fin-panel"><section className="card">
      <h3>My receipts</h3>
      <p className="text-sm text-muted">Every payment you made or received through CareerZ.</p>
      {rows === null ? <p>Loading…</p> : rows.length ? <ReceiptTable rows={rows} onFlash={onFlash} withPeople /> : <p className="text-muted">No receipts yet. A receipt appears here after a payment is confirmed.</p>}
    </section></div>
  );
}

export function AdminReceipts({ onFlash, canEdit }) {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [charges, setCharges] = useState(null);
  const load = (term = '') => apiRequest(`/receipts/admin/all?q=${encodeURIComponent(term)}`).then(setData).catch((e) => { setData({ rows: [], total: 0 }); onFlash(e.message); });
  useEffect(() => { load(); apiRequest('/receipts/admin/charges').then(setCharges).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function saveCharges(e) {
    e.preventDefault();
    try { setCharges(await apiRequest('/receipts/admin/charges', { method: 'PATCH', body: { taxPercent: Number(charges.taxPercent), gatewayFeePercent: Number(charges.gatewayFeePercent) } })); onFlash('Saved. New receipts use these rates.', 'success'); } catch (err) { onFlash(err.message); }
  }
  return (
    <div className="fin-panel">
      {charges && (
        <section className="card">
          <h3>Tax and gateway charges on receipts</h3>
          <p className="text-sm text-muted">Tax is a share of CareerZ's commission, and gateway charges apply only to gateway payments. Both come out of CareerZ's share, so sellers receive the same amount. Issued receipts never change.</p>
          <form className="fin-form" onSubmit={saveCharges}>
            <label>Tax (% of commission)<input className="form-input" type="number" min="0" max="100" step="0.01" disabled={!canEdit} value={charges.taxPercent} onChange={(e) => setCharges({ ...charges, taxPercent: e.target.value })} /></label>
            <label>Gateway charges (% of payment)<input className="form-input" type="number" min="0" max="100" step="0.01" disabled={!canEdit} value={charges.gatewayFeePercent} onChange={(e) => setCharges({ ...charges, gatewayFeePercent: e.target.value })} /></label>
            {canEdit && <div className="fin-actions"><button type="submit" className="btn btn-primary">Save</button></div>}
          </form>
        </section>
      )}
      <section className="card">
        <div className="fin-head">
          <h3>All receipts{data ? ` (${data.total})` : ''}</h3>
          <form className="fin-actions" onSubmit={(e) => { e.preventDefault(); load(q); }}>
            <input className="form-input" type="search" aria-label="Search receipts" placeholder="Number, reference or name" value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="submit" className="btn btn-outline">Search</button>
          </form>
        </div>
        {data === null ? <p>Loading…</p> : data.rows.length ? <ReceiptTable rows={data.rows} onFlash={onFlash} withPeople /> : <p className="text-muted">No receipts found.</p>}
      </section>
    </div>
  );
}
