import { useEffect } from 'react';
import { openPrivateFile } from '../recruitment/files';

// The designed offer letter: letterhead, reference and date, the candidate, the employer's own
// words, an offer-details table, terms and a signature block. The same design is shown on screen
// (both sides can view it) and downloaded as a PDF.

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const money = (c, n) => `${c || ''} ${Number(n || 0).toLocaleString()}`.trim();

// Everything the letter shows, from an Employment (with offer / offerLetter) and its job.
export function letterData({ employment, job, candidate, text }) {
  const e = employment || {};
  const j = job || e.job || {};
  return {
    company: e.offerLetter?.issuer || j.company || 'Employer',
    logo: /^https:\/\//.test(j.companyLogo || '') ? j.companyLogo : null,
    place: [j.city, j.country].filter(Boolean).join(', '),
    title: j.title || 'the advertised position',
    candidate: candidate || 'Candidate',
    reference: `CZ-OL-${String(e._id || '').slice(-6).toUpperCase() || 'DRAFT'}`,
    date: fmtDate(e.offerLetter?.sentAt || new Date()),
    body: (text ?? e.offerLetter?.text ?? '').trim(),
    rows: [
      ['Position', j.title],
      ['Salary', e.salary ? `${money(e.currency, e.salary)} per ${e.offer?.salaryPeriod || 'month'}` : ''],
      ['Joining date', fmtDate(e.startDate)],
      ['Employment type', j.type ? j.type.replace('_', ' ') : ''],
      ['Work location', [j.city, j.country].filter(Boolean).join(', ')]
    ].filter(([, v]) => v),
    terms: e.offer?.terms || '',
    file: e.offerLetter?.file ? `/jobs/offer-letters/${e._id}/file` : null
  };
}

const ACCENT = '#0f3d2e';
const S = {
  page: { background: '#fff', color: '#1f2937', maxWidth: 760, margin: '0 auto', boxShadow: '0 10px 40px rgba(0,0,0,.18)', borderRadius: 6, overflow: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif' },
  head: { background: ACCENT, color: '#fff', padding: '26px 40px', display: 'flex', alignItems: 'center', gap: 16 },
  logo: { width: 52, height: 52, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4 },
  body: { padding: '28px 40px 36px', fontSize: 15, lineHeight: 1.7 },
  meta: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13, color: '#4b5563', borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 18 },
  th: { textAlign: 'left', padding: '8px 12px', background: '#f3f4f1', width: '38%', fontWeight: 600, borderBottom: '1px solid #e5e7eb' },
  td: { padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }
};

export function OfferLetterDoc({ data }) {
  return (
    <article style={S.page} aria-label="Offer letter">
      <header style={S.head}>
        {data.logo && <img src={data.logo} alt="" style={S.logo} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '.02em' }}>{data.company}</div>
          {data.place && <div style={{ fontSize: 13, opacity: 0.85 }}>{data.place}</div>}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.9 }}>Offer of Employment</div>
      </header>
      <div style={S.body}>
        <div style={S.meta}><span>Ref: {data.reference}</span><span>{data.date}</span></div>
        <p style={{ margin: '0 0 4px' }}><strong>To:</strong> {data.candidate}</p>
        <p style={{ margin: '0 0 18px' }}><strong>Subject:</strong> Offer of employment, {data.title}</p>
        {data.body && <div style={{ whiteSpace: 'pre-wrap', marginBottom: 20 }}>{data.body}</div>}
        {data.rows.length > 0 && <>
          <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: 6 }}>Offer details</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 20, border: '1px solid #e5e7eb' }}>
            <tbody>{data.rows.map(([k, v]) => <tr key={k}><th scope="row" style={S.th}>{k}</th><td style={S.td}>{v}</td></tr>)}</tbody>
          </table>
        </>}
        {data.terms && <>
          <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: ACCENT, fontWeight: 700, marginBottom: 6 }}>Terms and conditions</div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, marginBottom: 24 }}>{data.terms}</div>
        </>}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginTop: 34 }}>
          <div style={{ minWidth: 200 }}><div style={{ borderTop: '1px solid #9ca3af', paddingTop: 6, fontSize: 13 }}>For {data.company}<br /><span style={{ color: '#6b7280' }}>Authorized signatory</span></div></div>
          <div style={{ minWidth: 200 }}><div style={{ borderTop: '1px solid #9ca3af', paddingTop: 6, fontSize: 13 }}>Accepted by {data.candidate}<br /><span style={{ color: '#6b7280' }}>Signature and date</span></div></div>
        </div>
      </div>
      <footer style={{ background: '#f3f4f1', color: '#6b7280', fontSize: 11, padding: '10px 40px', fontFamily: 'Arial, sans-serif' }}>Issued through CareerZ.pk · {data.reference}</footer>
    </article>
  );
}

// The same letter as a PDF.
export async function offerLetterPdf(data) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), M = 20;
  const green = [15, 61, 46];
  let y;
  const ensure = (need) => { if (y + need > H - 22) { pdf.addPage(); y = 22; } };
  pdf.setFillColor(...green); pdf.rect(0, 0, W, 34, 'F');
  pdf.setTextColor(255, 255, 255); pdf.setFont('times', 'bold'); pdf.setFontSize(19);
  pdf.text(pdf.splitTextToSize(data.company, 120)[0], M, 17);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
  if (data.place) pdf.text(data.place, M, 24);
  pdf.text('OFFER OF EMPLOYMENT', W - M, 17, { align: 'right' });
  pdf.setTextColor(75, 85, 99); pdf.setFontSize(9.5);
  y = 44;
  pdf.text(`Ref: ${data.reference}`, M, y); pdf.text(data.date, W - M, y, { align: 'right' });
  pdf.setDrawColor(229, 231, 235); pdf.line(M, y + 3, W - M, y + 3);
  y += 12;
  pdf.setTextColor(31, 41, 55); pdf.setFont('times', 'bold'); pdf.setFontSize(11.5);
  pdf.text('To:', M, y); pdf.setFont('times', 'normal'); pdf.text(data.candidate, M + 9, y); y += 6;
  pdf.setFont('times', 'bold'); pdf.text('Subject:', M, y); pdf.setFont('times', 'normal'); pdf.text(`Offer of employment, ${data.title}`, M + 17, y); y += 10;
  pdf.setFontSize(11.5);
  for (const line of pdf.splitTextToSize(data.body || '', W - 2 * M)) { ensure(6); pdf.text(line, M, y); y += 5.6; }
  y += 4;
  if (data.rows.length) {
    ensure(14); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(...green); pdf.text('OFFER DETAILS', M, y); y += 3;
    pdf.setFontSize(10.5); pdf.setTextColor(31, 41, 55);
    for (const [k, v] of data.rows) {
      const lines = pdf.splitTextToSize(String(v), (W - 2 * M) * 0.62 - 4);
      const h = Math.max(8, lines.length * 5 + 3);
      ensure(h);
      pdf.setFillColor(243, 244, 241); pdf.rect(M, y, (W - 2 * M) * 0.38, h, 'F');
      pdf.setDrawColor(229, 231, 235); pdf.rect(M, y, W - 2 * M, h);
      pdf.setFont('helvetica', 'bold'); pdf.text(k, M + 3, y + 5.5);
      pdf.setFont('helvetica', 'normal'); pdf.text(lines, M + (W - 2 * M) * 0.38 + 3, y + 5.5);
      y += h;
    }
    y += 8;
  }
  if (data.terms) {
    ensure(14); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(...green); pdf.text('TERMS AND CONDITIONS', M, y); y += 6;
    pdf.setFont('times', 'normal'); pdf.setFontSize(11); pdf.setTextColor(31, 41, 55);
    for (const line of pdf.splitTextToSize(data.terms, W - 2 * M)) { ensure(6); pdf.text(line, M, y); y += 5.4; }
    y += 6;
  }
  ensure(30); y += 14;
  pdf.setDrawColor(156, 163, 175); pdf.line(M, y, M + 65, y); pdf.line(W - M - 65, y, W - M, y);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); pdf.setTextColor(55, 65, 81);
  pdf.text(`For ${data.company}`, M, y + 5); pdf.text(`Accepted by ${data.candidate}`, W - M - 65, y + 5);
  pdf.setTextColor(107, 114, 128); pdf.text('Authorized signatory', M, y + 10); pdf.text('Signature and date', W - M - 65, y + 10);
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) { pdf.setPage(i); pdf.setFillColor(243, 244, 241); pdf.rect(0, H - 12, W, 12, 'F'); pdf.setFontSize(8); pdf.setTextColor(107, 114, 128); pdf.text(`Issued through CareerZ.pk · ${data.reference}`, M, H - 5); pdf.text(`${i} / ${pages}`, W - M, H - 5, { align: 'right' }); }
  pdf.save(`Offer letter - ${data.candidate} - ${data.title}`.replace(/[^\w .-]+/g, '') + '.pdf');
}

// Full-screen viewer with Download PDF (and the employer's signed PDF, if attached).
export function OfferLetterViewer({ data, onClose, onFlash }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Offer letter" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,20,.62)', overflowY: 'auto', padding: '24px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto 14px', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-primary" onClick={() => offerLetterPdf(data).catch((e) => onFlash?.(e.message))}>Download PDF</button>
        {data.file && <button type="button" className="btn" onClick={() => openPrivateFile(data.file, { download: true, filename: 'Signed offer letter.pdf' }).catch((e) => onFlash?.(e.message))}>Signed copy (PDF)</button>}
        <button type="button" className="btn" onClick={onClose}>Close</button>
      </div>
      <OfferLetterDoc data={data} />
    </div>
  );
}
