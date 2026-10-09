import { createBrandedPdf, addPdfFooter } from '../../utils/brandedPdf';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { loadDraft, saveDraft } from '../../utils/offlineLearning';

export default function OfflineCertificates() {
  const [saved, setSaved] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { loadDraft('certificates').then(value => setSaved(value || null)).catch(e => setError(e.message)); }, []);
  async function refresh() {
    setBusy(true); setError('');
    try { const value = { records: await apiRequest('/students/me/certificates'), savedAt: new Date().toISOString() }; await saveDraft('certificates', value); setSaved(value); await import('jspdf'); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function exportPdf(certificate) {
    try { const { jsPDF } = await import('jspdf'); const doc = await createBrandedPdf(jsPDF, { title: certificate.title, orientation: 'landscape' }); doc.setFontSize(15); doc.text(certificate.student?.fullName || '', 20, 65); doc.text(certificate.institution?.name || '', 20, 78); doc.setFontSize(11); doc.text(`Issued: ${new Date(certificate.issueDate).toLocaleDateString()}`, 20, 92); doc.text(`Verification code: ${certificate.verifyCode}`, 20, 104); if (certificate.qrDataUrl) doc.addImage(certificate.qrDataUrl, 'PNG', 230, 65, 45, 45); doc.text('Saved offline copy. Verify current validity online using the QR code.', 20, 122); addPdfFooter(doc); doc.save(`${certificate.verifyCode}.pdf`); }
    catch (e) { setError(e.message); }
  }
  return <section><h3>Offline certificates</h3><button className="btn" disabled={busy || !navigator.onLine} onClick={refresh}>Refresh saved certificates</button>{error && <p role="alert">{error}</p>}{saved && <p>Last refreshed: {new Date(saved.savedAt).toLocaleString()}. Offline copies retain the last known status; current verification requires internet.</p>}{saved?.records.map(c => <article key={c._id}><h4>{c.title}</h4><p>{c.institution?.name} · {c.student?.fullName} · {c.verifyCode}</p>{c.qrDataUrl && <img src={c.qrDataUrl} width="120" height="120" alt={`Verify ${c.title} online`} />}<button className="btn" onClick={() => exportPdf(c)}>Save PDF</button></article>)}</section>;
}
