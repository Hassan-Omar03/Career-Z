import { FaArrowLeft, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest, ApiError } from '../api/client';

export default function VerifyFeeReceipt() {
  const { code } = useParams();
  const [state, setState] = useState({ loading: true, receipt: null, error: '' });
  useEffect(() => {
    let cancelled = false;
    apiRequest(`/institution-fees/receipts/verify/${encodeURIComponent(code)}`, { auth: false })
      .then((receipt) => { if (!cancelled) setState({ loading: false, receipt, error: '' }); })
      .catch((error) => { if (!cancelled) setState({ loading: false, receipt: null, error: error instanceof ApiError ? error.message : 'Could not verify this receipt.' }); });
    return () => { cancelled = true; };
  }, [code]);
  const r = state.receipt;
  return <main style={s.page}><section style={s.card} aria-live="polite">
    <h1 style={s.brand}>CareerZ.pk</h1><p style={s.subtitle}>Fee Receipt Verification</p>
    {state.loading && <p>Verifying receipt…</p>}
    {!state.loading && state.error && <><FaCircleXmark style={s.bad} /><h2 style={s.badTitle}>Receipt not verified</h2><p>{state.error}</p></>}
    {r && <><FaCircleCheck style={s.good} /><h2 style={s.goodTitle}>Verified Payment Receipt</h2><dl style={s.list}>
      <Row label="Receipt number" value={r.receiptNumber} /><Row label="Institution" value={r.institution} />
      <Row label="Student" value={r.student} /><Row label="Fee" value={r.title} />
      <Row label="Amount paid" value={`${r.currency} ${r.amountPaid}`} /><Row label="Payment method" value={r.paymentMethod || 'Recorded payment'} />
      {r.transactionReference && <Row label="Transaction reference" value={r.transactionReference} />}
      <Row label="Paid at" value={r.paidAt ? new Date(r.paidAt).toLocaleString() : '—'} /><Row label="Status" value={r.status} />
    </dl><p style={s.proof}>This verified record is permanent digital proof of payment.</p></>}
    <Link to="/" style={s.link}><FaArrowLeft /> Back to CareerZ</Link>
  </section></main>;
}
function Row({ label, value }) { return <div style={s.row}><dt style={s.dt}>{label}</dt><dd style={s.dd}>{value || '—'}</dd></div>; }
const s = {
  page:{minHeight:'100vh',display:'grid',placeItems:'center',background:'#073f35',padding:24},card:{width:'100%',maxWidth:520,background:'#fffdf7',borderRadius:20,padding:'32px 30px',boxShadow:'0 24px 70px rgba(0,0,0,.28)',textAlign:'center'},
  brand:{margin:0,fontSize:28,color:'#075244',fontFamily:'Georgia,serif'},subtitle:{margin:'5px 0 24px',color:'#68736f'},good:{color:'#14805e',fontSize:54},bad:{color:'#c94f43',fontSize:54},goodTitle:{color:'#075244'},badTitle:{color:'#b2372e'},list:{margin:'22px 0 0',textAlign:'left',borderTop:'1px solid #e7ddc9'},row:{padding:'10px 0',borderBottom:'1px solid #eee6d8'},dt:{color:'#7b817e',fontSize:11,textTransform:'uppercase'},dd:{margin:'3px 0 0',fontWeight:650,overflowWrap:'anywhere'},proof:{padding:12,background:'#e5f4ed',color:'#075244',borderRadius:10,fontSize:13},link:{marginTop:24,display:'inline-flex',alignItems:'center',gap:6,color:'#075244',textDecoration:'none',fontWeight:650}
};
