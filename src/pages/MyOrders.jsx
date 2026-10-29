import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import { ManualPayButton } from '../components/payments/ManualPay';
import { BuyerOrdersList } from '../components/marketplace/Escrow';
import '../styles/blog.css';

// Orders page for quick-checkout buyers (and any member): pay, follow the status, ask to cancel.
const STATUS = { pending: 'New', confirmed: 'Confirmed', processing: 'Being prepared', shipped: 'Shipped', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled', refunded: 'Refunded' };
const PAY = { pending: 'Not paid yet', paid: 'Paid', failed: 'Payment failed', refunded: 'Refunded' };

export default function MyOrders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState(null), [msg, setMsg] = useState(null);
  const flash = (text, type = 'error') => setMsg({ text, type });
  function load() { apiRequest('/marketplace/orders/mine').then(setOrders).catch((e) => { setOrders([]); flash(e.message); }); }
  useEffect(() => { if (user) load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  async function cancel(o) {
    try { await apiRequest(`/marketplace/orders/${o._id}/request-cancellation`, { method: 'POST', body: {} }); flash('Cancellation requested. The seller will answer.', 'success'); load(); } catch (e) { flash(e.message); }
  }
  return (
    <>
      <PageSeo title="My orders" description="Your CareerZ marketplace orders" path="/my-orders" noindex />
      <AuthNavbar />
      <main className="public-page my-orders-page">
        <header className="public-page-hero"><h1>My orders</h1><p>Pay for your orders by bank transfer and follow them until they reach you.</p></header>
        <div className="my-orders-wrap">
          {msg && <p role="status" className={`dash-toast ${msg.type}`}>{msg.text}</p>}
          {user.quickBuyer && <p className="blog-post-meta">You bought without an account. To come back later, use <Link to="/forgot-password">Forgot password</Link> with {user.email} to set a password.</p>}
          <BuyerOrdersList onFlash={flash} PayButton={({ o, onDone }) => <ManualPayButton kind="marketplace_order" id={o._id} label="Pay by bank transfer" onFlash={flash} onDone={onDone} />} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
