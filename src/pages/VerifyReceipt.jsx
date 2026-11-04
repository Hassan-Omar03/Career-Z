import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import PageSeo from '../components/PageSeo';
import '../styles/finance.css';

// The page a receipt's QR code opens. It proves the receipt is genuine without naming the people.
export default function VerifyReceipt() {
  const { number } = useParams();
  const [state, setState] = useState({ loading: true });
  useEffect(() => { apiRequest(`/receipts/verify/${encodeURIComponent(number)}`, { auth: false }).then((receipt) => setState({ receipt })).catch((e) => setState({ error: e.message })); }, [number]);
  return (
    <main className="fin-verify">
      <PageSeo title="Check a receipt" description="Check a CareerZ payment receipt." path={`/verify-receipt/${number}`} noindex />
      <section className="card">
        <h1>Receipt check</h1>
        {state.loading && <p>Checking…</p>}
        {state.error && <p role="alert">{state.error}</p>}
        {state.receipt && (
          <dl className="fin-verify-list">
            <div><dt>Status</dt><dd>Genuine CareerZ receipt</dd></div>
            <div><dt>Number</dt><dd>{state.receipt.receiptNumber}</dd></div>
            <div><dt>For</dt><dd>{state.receipt.title}</dd></div>
            <div><dt>Amount</dt><dd>{state.receipt.currency} {Number(state.receipt.grossAmount).toLocaleString()}</dd></div>
            <div><dt>Issued</dt><dd>{new Date(state.receipt.issuedAt).toLocaleDateString()}</dd></div>
          </dl>
        )}
        <Link className="btn btn-outline" to="/">Back to CareerZ</Link>
      </section>
    </main>
  );
}
