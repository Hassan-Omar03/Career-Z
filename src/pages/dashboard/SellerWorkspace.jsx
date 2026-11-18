// Seller workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showPrompt } from '../../utils/appDialog';
import { FaBell, FaBoxOpen, FaBoxesStacked, FaCartShopping, FaChartLine, FaClipboardList, FaCommentDots, FaFileLines, FaMoneyBillWave, FaSackDollar, FaShieldHalved, FaStar, FaTriangleExclamation, FaTruck, FaUser, FaWallet, FaXmark } from 'react-icons/fa6';
import { AdminRemovedNote } from '../../components/admin/Moderation';
import SavedForm from '../../components/shared/SavedForm';
import { ReceivingAccount } from '../../components/payments/ManualPay';
import { SellerReportPanel } from '../../components/marketplace/Escrow';
import { QuickActions } from '../../components/dashboard/DashboardWidgets';
import { AddListingPanel, ComingSoon, CustomSelect, MyListingsPanel, NotificationsPanel, PRODUCT_STATUS, PayoutRequestForm, ProfilePanel, RolesPanel, SELLER_WITHDRAWAL_STATUS, SellerOrdersPanel, SellerWalletPanel, SummaryCard, SupportComplaintPanel, Table, Tag } from '../Dashboard';

// The real order-fulfillment lifecycle — New/Confirmed/Processing/Shipped/Delivered/Completed
// are all shown as "pending" (in-progress) tag color except the two terminal-success states;
// Cancelled/Refunded are the terminal-failure states. DB keeps 'pending' as the first enum value
// for backward compatibility — labeled "New" here, matching every other raw-enum/label split in this app.
const ORDER_STATUS = {
  pending: { tag: 'pending', label: 'New' },
  confirmed: { tag: 'pending', label: 'Confirmed' },
  processing: { tag: 'pending', label: 'Processing' },
  shipped: { tag: 'pending', label: 'Shipped' },
  delivered: { tag: 'approved', label: 'Delivered' },
  completed: { tag: 'approved', label: 'Completed' },
  cancelled: { tag: 'rejected', label: 'Cancelled' },
  refunded: { tag: 'rejected', label: 'Refunded' }
};

const PAYMENT_STATUS = {
  pending: { tag: 'pending', label: 'Pending' },
  paid: { tag: 'approved', label: 'Paid' },
  failed: { tag: 'rejected', label: 'Failed' },
  refunded: { tag: 'rejected', label: 'Refunded' }
};

// Seller item 11 — Reviews & Ratings. Every real review across every listing, with seller
// response and a report-inappropriate action.
function SellerReviewsPanel({ onFlash }) {
  const [reviews, setReviews] = useState(null);
  const [profile, setProfile] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');

  function load() {
    apiRequest('/marketplace/sellers/mine/reviews').then(setReviews).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/profile').then(setProfile).catch(() => {});
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitResponse(id) {
    if (!responseText.trim()) return;
    try {
      await apiRequest(`/marketplace/reviews/${id}/respond`, { method: 'PATCH', body: { response: responseText.trim() } });
      onFlash('Response posted.', 'success');
      setRespondingId(null); setResponseText('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function report(id) {
    const reason = await showPrompt('Explain why this review should be checked by the platform team.', { title: 'Report review', placeholder: 'Reason for reporting', confirmLabel: 'Report review', required: true });
    if (reason === null) return;
    try {
      await apiRequest(`/marketplace/reviews/${id}/report`, { method: 'POST', body: { reason } });
      onFlash('Review reported for Super Admin review.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (reviews === null) return <p role="status" className="admin-notice">Loading...</p>;

  // Product ratings — computed client-side from the same review list, one row per product.
  const byProduct = {};
  reviews.forEach((r) => {
    const key = r.product?._id || 'unknown';
    if (!byProduct[key]) byProduct[key] = { title: r.product?.title || 'Deleted listing', ratings: [] };
    byProduct[key].ratings.push(r.rating);
  });
  const productRatings = Object.values(byProduct).map((p) => ({ title: p.title, avg: Math.round((p.ratings.reduce((s, r) => s + r, 0) / p.ratings.length) * 10) / 10, count: p.ratings.length }));

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaStar aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Reviews & Ratings</h3>
      </div>

      <div className="card flex items-center" style={{ padding: 20, marginBottom: 24, gap: 16 }}>
        <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaStar aria-hidden="true" size={20} /></span>
        <div>
          <p style={fieldLabel}>Overall Seller Rating</p>
          <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>
            {profile?.sellerRating !== null && profile?.sellerRating !== undefined ? profile.sellerRating : 'No reviews yet'}
          </strong>
          {profile?.sellerRating !== null && profile?.sellerRating !== undefined && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{profile.totalReviews} review{profile.totalReviews === 1 ? '' : 's'}</span>}
        </div>
      </div>

      <p style={{ ...fieldLabel, marginBottom: 12 }}>Product Ratings</p>
      <Table
        headers={['Product', 'Average Rating', 'Reviews']}
        rows={productRatings.map((p) => [p.title, <span className="flex items-center" style={{ gap: 4 }}><FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} /> {p.avg}</span>, p.count])}
        empty="No product ratings yet."
      />

      <p style={{ ...fieldLabel, marginTop: 28, marginBottom: 12 }}>Buyer Reviews / Recent Feedback</p>
      {reviews.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaStar aria-hidden="true" />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {reviews.map((r) => (
            <div key={r._id} className="card" style={{ padding: 16 }}>
              <div className="flex items-start justify-between flex-wrap" style={{ gap: 12 }}>
                <div className="flex items-start" style={{ gap: 12, minWidth: 0 }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{(r.buyer?.fullName || '?')[0]}</span>
                  <div style={{ minWidth: 0 }}>
                    <strong className="text-sm">{r.buyer?.fullName}</strong>
                    <div className="flex items-center flex-wrap" style={{ gap: 6, marginTop: 2 }}>
                      <span className="text-xs flex items-center" style={{ color: 'var(--ink-soft)', gap: 4 }}>{r.product?.title} · <FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} /> {r.rating} · {new Date(r.createdAt).toLocaleDateString()}</span>
                      {r.reported && <Tag status="rejected" label="Reported" />}
                    </div>
                    {r.comment && <p className="text-xs" style={{ marginTop: 8, color: 'var(--ink)' }}>{r.comment}</p>}
                    {r.sellerResponse && (
                      <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: 'var(--sand)' }}>
                        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}><strong style={{ color: 'var(--ink)' }}>Your response:</strong> {r.sellerResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap" style={{ flexShrink: 0 }}>
                  {!r.sellerResponse && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { setRespondingId(respondingId === r._id ? null : r._id); setResponseText(''); }}>Respond</button>}
                  {!r.reported && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => report(r._id)}>Report</button>}
                </div>
              </div>
              {respondingId === r._id && (
                <div className="flex gap-2 items-end flex-wrap" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
                  <textarea className="form-input" placeholder="Your public response..." rows={2} value={responseText} onChange={(e) => setResponseText(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
                  <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => submitResponse(r._id)}>Post Response</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Seller item 12 — Messages, categorized: Buyers (people who've bought something from this
// seller), Marketplace Support, Super Admin. Same pattern as the Donor's categorized inbox.
function SellerMessagesPanel({ onFlash }) {
  const [conversations, setConversations] = useState(null);
  const [buyerIds, setBuyerIds] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/orders/selling').then((orders) => setBuyerIds(new Set(orders.map((o) => o.buyer?._id).filter(Boolean)))).catch(() => setBuyerIds(new Set()));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(load).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!activeUser || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: activeUser._id, text: text.trim() } });
      setText('');
      apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (conversations === null || buyerIds === null) return <p role="status" className="admin-notice">Loading...</p>;

  const hasRole = (u, role) => (u.roles || []).includes(role);
  const buyerMsgs = conversations.filter((c) => buyerIds.has(c.user._id));
  const supportMsgs = conversations.filter((c) => !buyerIds.has(c.user._id) && (hasRole(c.user, 'admin') || hasRole(c.user, 'platform_staff')));
  const superAdminMsgs = conversations.filter((c) => !buyerIds.has(c.user._id) && hasRole(c.user, 'super_admin'));
  const categorizedIds = new Set([...buyerMsgs, ...supportMsgs, ...superAdminMsgs].map((c) => c.user._id));
  const otherMsgs = conversations.filter((c) => !categorizedIds.has(c.user._id));

  const sellerMsgLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  function ConversationGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={sellerMsgLabel}>{title}</p>
        <div className="dash-list" style={{ marginTop: 10 }}>
          {items.map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
      <div>
        <h3 className="font-semibold" style={{ marginBottom: 4 }}>Messages</h3>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>To start a new conversation, ask for their User ID and use the "New Message" box on the right.</p>
        <ConversationGroup title="Buyers" items={buyerMsgs} />
        <ConversationGroup title="Marketplace Support" items={supportMsgs} />
        <ConversationGroup title="Super Admin" items={superAdminMsgs} />
        <ConversationGroup title="Other" items={otherMsgs} />
        {conversations.length === 0 && (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaCommentDots aria-hidden="true" />
            <p>No conversations yet</p>
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h3 className="font-semibold" style={{ marginBottom: 14 }}>{activeUser ? activeUser.fullName : 'New Message'}</h3>
        {!activeUser && (
          <label style={{ display: 'block' }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Recipient's User ID</span>
            <input className="form-input" placeholder="Paste a User ID and press Enter" onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) { openThread({ _id: e.target.value.trim(), fullName: 'New recipient' }); }
            }} />
          </label>
        )}
        {activeUser && (
          <>
            <div className="card reveal in" style={{ padding: '10px 14px', marginBottom: 14, maxHeight: 320, overflowY: 'auto' }}>
              {thread === null && <p role="status" className="admin-notice">Loading...</p>}
              {thread && thread.length === 0 && (
                <div className="student-empty-state" style={{ minHeight: 100, padding: '16px 0' }}>
                  <p>No messages yet</p>
                </div>
              )}
              {(thread || []).map((m, idx) => (
                <div key={m._id} style={{ padding: '10px 4px', borderBottom: idx < thread.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                  <div style={{ fontSize: 13 }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
              <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Seller sidebar — Verification/Documents. Same generic /roles/mine/:role/documents endpoint
// used by Agent and Donor, just pointed at 'marketplace_seller'.
function SellerVerificationPanel({ onFlash }) {
  const [request, setRequest] = useState(undefined);
  const [docUrl, setDocUrl] = useState('');

  function load() {
    apiRequest('/roles/my-requests').then((list) => setRequest(list.find((r) => r.requestedRole === 'marketplace_seller') || null)).catch(() => setRequest(null));
  }
  useEffect(load, []);

  async function addDocument() {
    if (!docUrl.trim() || !request) return;
    try {
      await apiRequest(`/roles/mine/marketplace_seller/documents`, { method: 'POST', body: { documents: [...(request.documents || []), docUrl.trim()] } });
      onFlash('Document submitted.', 'success');
      setDocUrl('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function removeDocument(url) {
    try {
      await apiRequest(`/roles/mine/marketplace_seller/documents`, { method: 'POST', body: { documents: (request.documents || []).filter((d) => d !== url) } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (request === undefined) return <p role="status" className="admin-notice">Loading...</p>;

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const status = request?.status || 'pending';

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Verification / Documents</h3>

      <div className="flex items-start" style={{ gap: 12, padding: 18, borderRadius: 16, background: 'var(--sand)', marginBottom: 20 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-raised)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <FaShieldHalved aria-hidden="true" size={15} />
        </span>
        <div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <strong className="text-sm">Status:</strong>
            <Tag status={VERIFICATION_TAG[status]} label={VERIFICATION_LABEL[status]} />
          </div>
          {status === 'rejected' && request?.reviewNotes && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 6 }}>{request.reviewNotes}</p>}
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.6 }}>Only a Super Admin-verified seller can list products or services. Submit documents (ID, business registration, etc.) for review.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="text-xs" style={{ fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>Submitted Documents</p>
        <div className="flex items-end flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
          <input className="form-input" placeholder="Paste a document link (PDF/image URL)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0 }} />
          <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={addDocument}>Add Document</button>
        </div>
        {(request?.documents || []).length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No documents submitted yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {(request?.documents || []).map((d) => (
              <div key={d} className="flex items-center justify-between flex-wrap" style={{ gap: 10, padding: 12, borderRadius: 12, background: 'var(--sand)' }}>
                <a href={d} target="_blank" rel="noreferrer" className="text-xs" style={{ overflowWrap: 'anywhere' }}><FaFileLines aria-hidden="true" /> {d}</a>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'var(--paper-raised)', flexShrink: 0 }} onClick={() => removeDocument(d)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Seller sidebar — Services: the same Products/Listings data, filtered to the digital categories
// (courses/services) that don't track stock.
function ServicesPanel({ onFlash }) {
  const [products, setProducts] = useState(null);
  function load() { apiRequest('/marketplace/products/mine/list').then(setProducts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function togglePause(p) {
    try {
      await apiRequest(`/marketplace/products/${p._id}`, { method: 'PATCH', body: { status: p.status === 'active' ? 'paused' : 'active' } });
      onFlash(p.status === 'active' ? 'Service paused.' : 'Service reactivated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(id) {
    try { await apiRequest(`/marketplace/products/${id}`, { method: 'DELETE' }); onFlash('Service removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (products === null) return <p role="status" className="admin-notice">Loading...</p>;
  const services = products.filter((p) => ['courses', 'services'].includes(p.category));

  return (
    <div>
      <h3 className="font-semibold mb-2">Services</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Digital listings only (Courses/Services) — no stock tracking applies to these.</p>
      <Table
        headers={['Name', 'Price', 'Status', 'Total Sales', 'Views', 'Actions']}
        rows={services.map((p) => {
          const st = PRODUCT_STATUS[p.status] || PRODUCT_STATUS.draft;
          return [
            p.title, `${p.currency} ${p.price}`, <><Tag status={st.tag} label={st.label} /><AdminRemovedNote item={p} /></>, `${p.totalSales ?? 0} sold`, p.views ?? 0,
            <div className="flex gap-2 flex-wrap">
              {(p.status === 'active' || p.status === 'paused') && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => togglePause(p)}>{p.status === 'active' ? 'Pause' : 'Reactivate'}</button>}
              <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => remove(p._id)}>Delete</button>
            </div>
          ];
        })}
        empty="No services/courses listed yet."
      />
    </div>
  );
}

// Seller sidebar — Inventory, standalone (same data/action as the home page's embedded version).
function InventoryPanel({ onFlash }) {
  const [inventory, setInventory] = useState(null);
  const [stockEdits, setStockEdits] = useState({});

  function load() { apiRequest('/marketplace/sellers/mine/inventory').then(setInventory).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStock(id) {
    const value = stockEdits[id];
    if (value === undefined || value === '') return;
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'PATCH', body: { stock: Number(value) } });
      onFlash('Stock updated.', 'success');
      setStockEdits((prev) => { const next = { ...prev }; delete next[id]; return next; });
      load(); return true;
    } catch (err) { onFlash(err.message); }
  }

  if (inventory === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxesStacked aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Inventory</h3>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 50, marginBottom: 28 }}>Physical listings only — digital products/services don't track stock.</p>
      {inventory.items.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaBoxOpen aria-hidden="true" />
          <p>No physical listings yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2" style={{ gap: 16, marginBottom: 32 }}>
            <div className="card" style={{ padding: 20, alignSelf: 'start' }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaTriangleExclamation aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Low Stock ({inventory.lowStock.length})</strong>
              </div>
              {inventory.lowStock.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>None.</p>}
              <div style={{ display: 'grid' }}>
                {inventory.lowStock.map((p, idx) => (
                  <p key={p._id} style={{ fontSize: 13.5, color: 'var(--ink)', padding: '11px 0', borderBottom: idx < inventory.lowStock.length - 1 ? '1px solid var(--sand-line)' : 'none', lineHeight: 1.6 }}>{p.title} — <span style={{ color: 'var(--ink-soft)' }}>{p.stock} left</span></p>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20, alignSelf: 'start' }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--rose, #e11d48)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Out of Stock ({inventory.outOfStock.length})</strong>
              </div>
              {inventory.outOfStock.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>None.</p>}
              <div style={{ display: 'grid' }}>
                {inventory.outOfStock.map((p, idx) => (
                  <p key={p._id} style={{ fontSize: 13.5, color: 'var(--ink)', padding: '11px 0', borderBottom: idx < inventory.outOfStock.length - 1 ? '1px solid var(--sand-line)' : 'none', lineHeight: 1.6 }}>{p.title}</p>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 12 }}>Full Inventory</p>
            <Table
              headers={['Product', 'Category', 'Available Stock', 'Status', 'Inventory Update']}
              rows={inventory.items.map((p) => [
                p.title, p.category, p.stock,
                <Tag status={PRODUCT_STATUS[p.status]?.tag} label={PRODUCT_STATUS[p.status]?.label} />,
                <SavedForm key={p._id} showValues={false} value={stockEdits[p._id]??''} onRestore={v=>setStockEdits(prev=>({...prev,[p._id]:v}))} onSubmit={()=>updateStock(p._id)} className="flex gap-2">
                  <input className="form-input" type="number" min="0" style={{ padding: '4px 6px', fontSize: '0.72rem', width: 80 }} placeholder={String(p.stock)} value={stockEdits[p._id] ?? ''} onChange={(e) => setStockEdits({ ...stockEdits, [p._id]: e.target.value })} />
                  <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Update</button>
                </SavedForm>
              ])}
              empty="No physical listings yet."
            />
          </div>
        </>
      )}
    </div>
  );
}

// Seller sidebar — Returns & Refunds: full history (pending + resolved), unlike Pending Actions'
// subset which only shows what's still open.
function ReturnsRefundsPanel({ onFlash }) {
  const [orders, setOrders] = useState(null);
  function load() { apiRequest('/marketplace/sellers/mine/returns-refunds').then(setOrders).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function respondCancellation(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/cancellation-response`, { method: 'PATCH', body: { approve } }); onFlash(`Cancellation ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function respondRefund(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/refund-response`, { method: 'PATCH', body: { approve } }); onFlash(`Refund ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (orders === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Returns & Refunds</h3>
      <Table
        headers={['Buyer', 'Product', 'Amount', 'Type', 'Reason', 'Status', 'Actions']}
        rows={orders.map((o) => {
          const isPendingCancellation = o.cancellationRequested;
          const isPendingRefund = o.refundRequested;
          const type = isPendingRefund || o.status === 'refunded' ? 'Refund/Return' : 'Cancellation';
          const reason = o.refundReason || o.cancellationReason || '—';
          return [
            o.buyer?.fullName, o.product?.title, `${o.currency} ${o.totalPrice}`, type, reason,
            <Tag status={ORDER_STATUS[o.status]?.tag} label={ORDER_STATUS[o.status]?.label} />,
            <div className="flex gap-2 flex-wrap">
              {isPendingCancellation && <>
                <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondCancellation(o._id, true)}>Approve</button>
                <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondCancellation(o._id, false)}>Deny</button>
              </>}
              {isPendingRefund && <>
                <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondRefund(o._id, true)}>Approve</button>
                <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondRefund(o._id, false)}>Deny</button>
              </>}
              {!isPendingCancellation && !isPendingRefund && '—'}
            </div>
          ];
        })}
        empty="No returns or refunds yet."
      />
    </div>
  );
}

// Seller sidebar — Sales Analytics (same data/graph as the home page's embedded Sales Overview).
function SalesAnalyticsPanel({ onFlash }) {
  const [salesOverview, setSalesOverview] = useState(null);
  useEffect(() => { apiRequest('/marketplace/sellers/mine/sales-overview').then(setSalesOverview).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Sales Analytics</h3>
      {Object.keys(salesOverview?.totalsByCurrency || {}).length === 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{salesOverview === null ? 'Loading...' : 'No sales yet.'}</p>
      )}
      {Object.entries(salesOverview?.totalsByCurrency || {}).map(([currency, s]) => {
        const maxDay = Math.max(...s.dailySales.map((d) => d.total), 1);
        return (
          <div key={currency} className="card" style={{ padding: 16, marginBottom: 20 }}>
            <strong className="text-sm">{currency}</strong>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 mb-3">
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Today: <strong>{currency} {s.today}</strong>{s.todayChangePct !== null && <span style={{ color: s.todayChangePct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}> ({s.todayChangePct >= 0 ? '+' : ''}{s.todayChangePct}% vs yesterday)</span>}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>This Week: <strong>{currency} {s.thisWeek}</strong>{s.weekChangePct !== null && <span style={{ color: s.weekChangePct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}> ({s.weekChangePct >= 0 ? '+' : ''}{s.weekChangePct}% vs last week)</span>}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>This Month: <strong>{currency} {s.thisMonth}</strong>{s.monthChangePct !== null && <span style={{ color: s.monthChangePct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}> ({s.monthChangePct >= 0 ? '+' : ''}{s.monthChangePct}% vs last month)</span>}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Total Revenue: <strong>{currency} {s.totalRevenue}</strong> · {s.orderCount} order{s.orderCount === 1 ? '' : 's'}</p>
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Last 14 days (delivered/completed orders only):</p>
            <div className="flex items-end gap-1" style={{ height: 70 }}>
              {s.dailySales.map((d) => (
                <div key={d.date} title={`${d.date}: ${currency} ${d.total}`} style={{ flex: 1, height: `${Math.max((d.total / maxDay) * 100, 3)}%`, background: 'var(--gold)', borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Seller sidebar — Earnings & Commission (same data as the home page's embedded version).
function EarningsCommissionPanel({ onFlash }) {
  const [earnings, setEarnings] = useState(null);
  useEffect(() => { apiRequest('/marketplace/sellers/mine/earnings').then(setEarnings).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaSackDollar aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Earnings & Commission</h3>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 50, marginBottom: 28, lineHeight: 1.6 }}>CareerZ's commission ({earnings?.commissionRate ?? '—'}%, set by Super Admin — may vary by category) is deducted automatically from delivered/completed sales. No real payment processor is integrated yet, so Payment Charges are honestly 0.</p>
      {Object.keys(earnings?.totalsByCurrency || {}).length === 0 && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{earnings === null ? 'Loading...' : 'No sales yet.'}</p>}
      {Object.entries(earnings?.totalsByCurrency || {}).map(([currency, e]) => {
        const rows = [
          { label: 'Gross Sales', value: e.grossSales, color: 'ink' },
          { label: 'Platform Commission', value: e.platformCommission, color: 'gold' },
          { label: 'Payment Charges', value: e.paymentCharges, color: 'ink' },
          { label: 'Refund Deductions', value: e.refundDeductions, color: 'rose, #e11d48' },
          { label: 'Net Earnings', value: e.netEarnings, color: 'emerald' },
          { label: 'Pending Earnings', value: e.pendingEarnings, color: 'gold' },
          { label: 'Available Earnings', value: e.availableEarnings, color: 'emerald' }
        ];
        return (
          <div key={currency} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {rows.map((r) => (
              <div key={r.label} className="card" style={{ padding: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{r.label}</span>
                <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 6, color: `var(--${r.color})` }}>{currency} {r.value}</strong>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Seller sidebar — Withdrawals, focused (Withdraw action + history only — full balance cards and
// transaction history live under Wallet & Transactions).
function WithdrawalsPanel({ onFlash }) {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  function load() {
    apiRequest('/marketplace/sellers/mine/wallet').then((data) => {
      setWallet(data);
      setSelectedCurrency((prev) => prev && data[prev] ? prev : Object.keys(data)[0] || null);
    }).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/withdrawals').then(setWithdrawals).catch((err) => onFlash(err.message));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function withdraw({ payoutMethod, payoutDetails, accountTitle }) {
    try {
      const result = await apiRequest('/marketplace/sellers/mine/withdraw', { method: 'POST', body: { currency: selectedCurrency, payoutMethod, payoutDetails, accountTitle } });
      onFlash(`Withdrawal requested — receipt ${result.transactionId}.`, 'success');
      load();
      return result;
    } catch (err) { onFlash(err.message); }
  }

  if (wallet === null || withdrawals === null) return <p role="status" className="admin-notice">Loading...</p>;
  const currencies = Object.keys(wallet);
  const available = selectedCurrency ? wallet[selectedCurrency]?.availableBalance ?? 0 : 0;

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaMoneyBillWave aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Withdrawals</h3>
      </div>

      {currencies.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 24 }}>
          <FaMoneyBillWave aria-hidden="true" />
          <p>No available balance yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 20, marginBottom: 28 }}>
          <p style={fieldLabel}>Withdraw Available Balance</p>
          <div className="flex flex-wrap items-end" style={{ gap: 14, marginTop: 12 }}>
            <div style={{ flex: '0 1 160px', minWidth: 120 }}>
              <CustomSelect value={selectedCurrency || ''} onChange={setSelectedCurrency} ariaLabel="Currency" minWidth="100%" options={currencies.map((c) => ({ value: c, label: c }))} />
            </div>
            <PayoutRequestForm onSubmit={withdraw} disabled={available <= 0} label={`Withdraw Funds (${selectedCurrency} ${available})`} />
          </div>
        </div>
      )}

      <p style={{ ...fieldLabel, marginBottom: 12 }}>Withdrawal History</p>
      <Table
        headers={['Amount', 'Currency', 'Status', 'Requested', 'Processed']}
        rows={withdrawals.map((wd) => [
          wd.amount, wd.currency,
          <Tag status={SELLER_WITHDRAWAL_STATUS[wd.status]?.tag} label={SELLER_WITHDRAWAL_STATUS[wd.status]?.label} />,
          new Date(wd.createdAt).toLocaleDateString(),
          wd.processedAt ? new Date(wd.processedAt).toLocaleDateString() : '—'
        ])}
        empty="No withdrawals requested yet."
      />
    </div>
  );
}

export function SellerWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <SellerDashboardPanel user={user} onFlash={onFlash} onChanged={onChanged} onNavigate={onNavigate} />;
  if (tab === 'listings') return <MyListingsPanel onFlash={onFlash} />;
  if (tab === 'orders') return <><ReceivingAccount onFlash={onFlash} onlyIfNeeded /><SellerOrdersPanel onFlash={onFlash} /></>;
  if (tab === 'sellerWallet') return <><ReceivingAccount onFlash={onFlash} /><SellerWalletPanel onFlash={onFlash} /></>;
  if (tab === 'sellerReviews') return <SellerReviewsPanel onFlash={onFlash} />;
  if (tab === 'sellerMessages') return <SellerMessagesPanel onFlash={onFlash} />;
  if (tab === 'sellerVerification') return <SellerVerificationPanel onFlash={onFlash} />;
  if (tab === 'addListing') return <AddListingPanel onFlash={onFlash} />;
  if (tab === 'services') return <ServicesPanel onFlash={onFlash} />;
  if (tab === 'inventory') return <InventoryPanel onFlash={onFlash} />;
  if (tab === 'returnsRefunds') return <ReturnsRefundsPanel onFlash={onFlash} />;
  if (tab === 'salesAnalytics') return <><SellerReportPanel onFlash={onFlash} /><SalesAnalyticsPanel onFlash={onFlash} /></>;
  if (tab === 'earningsCommission') return <EarningsCommissionPanel onFlash={onFlash} />;
  if (tab === 'withdrawals') return <WithdrawalsPanel onFlash={onFlash} />;
  if (tab === 'sellerNotifications') return <NotificationsPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

// Seller Dashboard Home — item 1 (Seller Profile): store name/logo (User fields, same reuse
// pattern as Employer/Agent/Donor), verification (RoleRequest), rating/review count computed
// live from real Review documents (never fabricated — shows "No reviews yet" honestly), and a
// donor-style profile-completion percentage.
function SellerDashboardPanel({ user, onFlash, onChanged, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [salesOverview, setSalesOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState(null);
  const [pendingActions, setPendingActions] = useState(null);
  const [bestSelling, setBestSelling] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [stockEdits, setStockEdits] = useState({});
  const [conversations, setConversations] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [products, setProducts] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);

  function load() {
    apiRequest('/marketplace/sellers/mine/profile').then(setProfile).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/summary').then(setSummary).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/sales-overview').then(setSalesOverview).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/orders/selling').then(setRecentOrders).catch(() => setRecentOrders([]));
    apiRequest('/marketplace/sellers/mine/pending-actions').then(setPendingActions).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/best-selling').then(setBestSelling).catch((err) => onFlash(err.message));
    apiRequest('/messages/conversations').then(setConversations).catch(() => setConversations([]));
    apiRequest('/marketplace/sellers/mine/inventory').then(setInventory).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/earnings').then(setEarnings).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/reviews').then(setReviews).catch(() => setReviews([]));
    apiRequest('/notifications/mine').then((list) => setNotifications(list.slice(0, 5))).catch(() => setNotifications([]));
    apiRequest('/marketplace/products/mine/list').then(setProducts).catch(() => setProducts([]));
    apiRequest('/marketplace/sellers/mine/withdrawals').then(setWithdrawals).catch(() => setWithdrawals([]));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStock(id) {
    const value = stockEdits[id];
    if (value === undefined || value === '') return;
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'PATCH', body: { stock: Number(value) } });
      onFlash('Stock updated.', 'success');
      setStockEdits((prev) => { const next = { ...prev }; delete next[id]; return next; });
      load(); return true;
    } catch (err) { onFlash(err.message); }
  }

  async function confirmOrder(id) {
    try { await apiRequest(`/marketplace/orders/${id}/status`, { method: 'PATCH', body: { status: 'confirmed' } }); onFlash('Order confirmed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function markShipped(id) {
    try { await apiRequest(`/marketplace/orders/${id}/status`, { method: 'PATCH', body: { status: 'shipped' } }); onFlash('Order marked shipped.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function respondCancellation(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/cancellation-response`, { method: 'PATCH', body: { approve } }); onFlash(`Cancellation ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function respondRefund(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/refund-response`, { method: 'PATCH', body: { approve } }); onFlash(`Refund ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  // Sales/earnings/balances span whatever currencies the seller's orders actually use — shown
  // per-currency rather than a single misleading sum across different currencies.
  const currencyEntries = summary ? Object.entries(summary.totalsByCurrency) : [];
  const fmtMoney = (field) => currencyEntries.length === 0 ? '0' : currencyEntries.map(([cur, t]) => `${cur} ${t[field]}`).join(', ');

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const verStatus = profile?.verificationStatus || 'pending';

  const profileFields = [user?.profilePhoto, user?.companyName, user?.country, user?.phone];
  const completeness = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  async function toggleStoreStatus() {
    const next = profile.storeStatus === 'open' ? 'closed' : 'open';
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: { storeStatus: next } });
      onFlash(`Store marked ${next}.`, 'success');
      onChanged?.();
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <>
      {/* 1. Seller Profile */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{(user?.companyName || user?.fullName || '?')[0]}</div>}
            <div>
              <strong className="text-sm">{user?.companyName || 'Store name not set'}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                {profile?.sellerRating !== null && profile?.sellerRating !== undefined ? <><FaStar size={11} style={{ color: 'var(--gold)', verticalAlign: -1 }} /> {profile.sellerRating} ({profile.totalReviews} review{profile.totalReviews === 1 ? '' : 's'})</> : 'No reviews yet'}
              </p>
              <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
                <Tag status={VERIFICATION_TAG[verStatus]} label={VERIFICATION_LABEL[verStatus]} />
                <Tag status={profile?.storeStatus === 'open' ? 'approved' : 'rejected'} label={profile?.storeStatus === 'open' ? 'Store Open' : 'Store Closed'} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end" style={{ gap: 10 }}>
            <div style={{ minWidth: 160 }}>
              <div className="student-progress-row" style={{ marginBottom: 6 }}>
                <span className="text-xs">Profile</span>
                <strong className="text-xs">{completeness}%</strong>
              </div>
              <progress className="student-progress-bar" max="100" value={completeness} aria-label="Profile completeness" />
            </div>
            {profile && <button type="button" className="btn" style={{ padding: '5px 14px', fontSize: '0.75rem' }} onClick={toggleStoreStatus}>{profile.storeStatus === 'open' ? 'Close Store' : 'Reopen Store'}</button>}
          </div>
        </div>
      </div>

      {/* 2. Main Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3" style={{ marginBottom: 20 }}>
        <SummaryCard title="Total Products/Listings" count={summary?.totalListings ?? '—'} onClick={() => onNavigate?.('listings')} />
        <SummaryCard title="Active Listings" count={summary?.activeListings ?? '—'} onClick={() => onNavigate?.('listings')} />
        <SummaryCard title="Pending Orders" count={summary?.pendingOrders ?? '—'} onClick={() => onNavigate?.('orders')} />
        <SummaryCard title="Completed Orders" count={summary?.completedOrders ?? '—'} onClick={() => onNavigate?.('orders')} />
        <SummaryCard title="Total Sales" count={fmtMoney('totalSales')} onClick={() => onNavigate?.('salesAnalytics')} />
        <SummaryCard title="Total Earnings" count={fmtMoney('totalEarnings')} onClick={() => onNavigate?.('earningsCommission')} />
        <SummaryCard title="Available Balance" count={fmtMoney('availableBalance')} onClick={() => onNavigate?.('sellerWallet')} />
        <SummaryCard title="Pending Balance" count={fmtMoney('pendingBalance')} onClick={() => onNavigate?.('sellerWallet')} />
      </div>

      {/* 3. Sales Overview */}
      <div className="dash-section-title"><h2>Sales Overview</h2></div>
      {Object.keys(salesOverview?.totalsByCurrency || {}).length === 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{salesOverview === null ? 'Loading...' : 'No sales yet.'}</p>
      )}
      {Object.entries(salesOverview?.totalsByCurrency || {}).map(([currency, s]) => {
        const maxDay = Math.max(...s.dailySales.map((d) => d.total), 1);
        return (
          <div key={currency} className="card" style={{ padding: 18, marginBottom: 20 }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaChartLine aria-hidden="true" size={14} /></span>
              <strong className="text-sm">Sales Overview — {currency}</strong>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Today', value: s.today, pct: s.todayChangePct, note: 'vs yesterday' },
                { label: 'This Week', value: s.thisWeek, pct: s.weekChangePct, note: 'vs last week' },
                { label: 'This Month', value: s.thisMonth, pct: s.monthChangePct, note: 'vs last month' },
                { label: 'Total Revenue', value: s.totalRevenue, pct: null, note: `${s.orderCount} order${s.orderCount === 1 ? '' : 's'}` }
              ].map((row) => (
                <div key={row.label} style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{row.label}</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>{currency} {row.value}</strong>
                  <span className="text-xs" style={{ color: row.pct !== null ? (row.pct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)') : 'var(--ink-soft)' }}>
                    {row.pct !== null ? `${row.pct >= 0 ? '+' : ''}${row.pct}% ${row.note}` : row.note}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Last 14 days (delivered/completed orders only):</p>
            <div className="flex items-end gap-1" style={{ height: 70 }}>
              {s.dailySales.map((d) => (
                <div key={d.date} title={`${d.date}: ${currency} ${d.total}`} style={{ flex: 1, height: `${Math.max((d.total / maxDay) * 100, 3)}%`, background: 'var(--gold)', borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
          </div>
        );
      })}

      {/* 4. Recent Orders */}
      <div className="dash-section-title"><h2>Recent Orders</h2></div>
      {(recentOrders?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaCartShopping aria-hidden="true" />
          <p>{recentOrders === null ? 'Loading...' : 'No orders received yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {recentOrders?.slice(0, 5).map((o) => (
            <div key={o._id} className="hover-card card flex items-center justify-between flex-wrap" style={{ padding: 14, gap: 12 }}>
              <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaCartShopping aria-hidden="true" size={13} /></span>
                <div style={{ minWidth: 0 }}>
                  <strong className="text-sm">{o.product?.title}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{o.buyer?.fullName} · Qty {o.quantity} · {o.currency} {o.totalPrice} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                <Tag status={PAYMENT_STATUS[o.paymentStatus]?.tag} label={PAYMENT_STATUS[o.paymentStatus]?.label} />
                <Tag status={ORDER_STATUS[o.status]?.tag} label={ORDER_STATUS[o.status]?.label} />
              </div>
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('orders')}>View All</button>
        </div>
      )}

      {/* Listings — per the parent layout order, a quick preview before Pending Actions */}
      <div className="dash-section-title"><h2>Listings</h2></div>
      {(products?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaBoxOpen aria-hidden="true" />
          <p>{products === null ? 'Loading...' : 'No listings yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {products?.slice(0, 5).map((p) => {
            const st = PRODUCT_STATUS[p.status] || PRODUCT_STATUS.draft;
            return (
              <div key={p._id} className="hover-card card flex items-center justify-between flex-wrap" style={{ padding: 14, gap: 12 }}>
                <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={13} /></span>
                  <div style={{ minWidth: 0 }}>
                    <strong className="text-sm">{p.title}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{p.category} · {p.currency} {p.price}</p>
                  </div>
                </div>
                <Tag status={st.tag} label={st.label} />
              </div>
            );
          })}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('listings')}>View All</button>
        </div>
      )}

      {/* 6. Pending Actions */}
      <div className="dash-section-title"><h2>Pending Actions</h2></div>
      {pendingActions === null && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>Loading...</p>}
      {pendingActions && (() => {
        const Header = ({ icon: Icon, color, title, count }) => (
          <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: `var(--${color})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon aria-hidden="true" size={13} /></span>
            <strong className="text-sm">{title} ({count})</strong>
          </div>
        );
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaCartShopping} color="forest" title="New Orders Requiring Confirmation" count={pendingActions.newOrders.length} />
              {pendingActions.newOrders.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.newOrders.slice(0, 5).map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs">{o.buyer?.fullName} — {o.product?.title}</span>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => confirmOrder(o._id)}>Confirm</button>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaClipboardList} color="gold" title="Listings held for a CareerZ check" count={pendingActions.pendingApprovalProducts.length} />
              {pendingActions.pendingApprovalProducts.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.pendingApprovalProducts.slice(0, 5).map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title}</p>)}
              {pendingActions.pendingApprovalProducts.length > 0 && <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Awaiting Super Admin review.</p>}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaTriangleExclamation} color="gold" title="Low-Stock Products" count={pendingActions.lowStockProducts.length} />
              {pendingActions.lowStockProducts.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.lowStockProducts.slice(0, 5).map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title} — {p.stock} left</p>)}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaTruck} color="forest" title="Orders Requiring Shipment" count={pendingActions.ordersRequiringShipment.length} />
              {pendingActions.ordersRequiringShipment.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.ordersRequiringShipment.slice(0, 5).map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs">{o.buyer?.fullName} — {o.product?.title}</span>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => markShipped(o._id)}>Mark Shipped</button>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaXmark} color="rose" title="Buyer Cancellation Requests" count={pendingActions.cancellationRequests.length} />
              {pendingActions.cancellationRequests.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.cancellationRequests.slice(0, 5).map((o) => (
                <div key={o._id} className="mt-2">
                  <p className="text-xs">{o.buyer?.fullName} — {o.product?.title}{o.cancellationReason ? `: "${o.cancellationReason}"` : ''}</p>
                  <div className="flex gap-2 mt-1">
                    <button type="button" className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondCancellation(o._id, true)}>Approve</button>
                    <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondCancellation(o._id, false)}>Deny</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaSackDollar} color="rose" title="Refund/Return Requests" count={pendingActions.refundRequests.length} />
              {pendingActions.refundRequests.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.refundRequests.slice(0, 5).map((o) => (
                <div key={o._id} className="mt-2">
                  <p className="text-xs">{o.buyer?.fullName} — {o.product?.title}{o.refundReason ? `: "${o.refundReason}"` : ''}</p>
                  <div className="flex gap-2 mt-1">
                    <button type="button" className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondRefund(o._id, true)}>Approve</button>
                    <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondRefund(o._id, false)}>Deny</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaCommentDots} color="forest" title="Unanswered Buyer Messages" count={pendingActions.unansweredMessages.length} />
              {pendingActions.unansweredMessages.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.unansweredMessages.slice(0, 5).map((m) => <p key={m.buyer._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{m.buyer.fullName}: "{m.lastMessage}"</p>)}
              {pendingActions.unansweredMessages.length > 0 && <button type="button" className="btn mt-2" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('sellerMessages')}>Reply</button>}
            </div>
          </div>
        );
      })()}

      {/* 7. Best-Selling Products */}
      <div className="dash-section-title"><h2>Best-Selling Products</h2></div>
      <Table
        headers={['Product Name', 'Units Sold', 'Total Revenue', 'Current Stock', 'Rating']}
        rows={(bestSelling || []).map((p) => [
          p.productName,
          p.unitsSold,
          `${p.currency} ${p.totalRevenue}`,
          p.currentStock ?? '—',
          p.rating !== null ? <span className="flex items-center" style={{ gap: 4 }}><FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} /> {p.rating}</span> : 'No reviews yet'
        ])}
        loading={bestSelling === null}
        empty="No sales yet."
      />

      {/* 8. Inventory Overview */}
      <div className="dash-section-title"><h2>Inventory Overview</h2></div>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Physical listings only — digital products/services don't track stock.</p>
      {inventory && inventory.items.length === 0 && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>No physical listings yet.</p>}
      {inventory && inventory.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-3">
            <div className="card" style={{ padding: 16 }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaTriangleExclamation aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Low Stock ({inventory.lowStock.length})</strong>
              </div>
              {inventory.lowStock.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {inventory.lowStock.map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title} — {p.stock} left</p>)}
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--rose, #e11d48)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Out of Stock ({inventory.outOfStock.length})</strong>
              </div>
              {inventory.outOfStock.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {inventory.outOfStock.map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title}</p>)}
            </div>
          </div>
          <Table
            headers={['Product', 'Category', 'Available Stock', 'Status', 'Inventory Update']}
            rows={inventory.items.map((p) => [
              p.title,
              p.category,
              p.stock,
              <Tag status={PRODUCT_STATUS[p.status]?.tag} label={PRODUCT_STATUS[p.status]?.label} />,
              <SavedForm key={p._id} showValues={false} value={stockEdits[p._id]??''} onRestore={v=>setStockEdits(prev=>({...prev,[p._id]:v}))} onSubmit={()=>updateStock(p._id)} className="flex gap-2">
                <input className="form-input" type="number" min="0" style={{ padding: '4px 6px', fontSize: '0.72rem', width: 80 }} placeholder={String(p.stock)} value={stockEdits[p._id] ?? ''} onChange={(e) => setStockEdits({ ...stockEdits, [p._id]: e.target.value })} />
                <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Update</button>
              </SavedForm>
            ])}
            empty="No physical listings yet."
          />
        </>
      )}

      {/* 9. Earnings & Commission */}
      <div className="dash-section-title"><h2>Earnings & Commission</h2></div>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>CareerZ's commission ({earnings?.commissionRate ?? '—'}%, set by Super Admin) is deducted automatically from delivered/completed sales. No real payment processor is integrated yet, so Payment Charges are honestly 0.</p>
      {Object.keys(earnings?.totalsByCurrency || {}).length === 0 && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{earnings === null ? 'Loading...' : 'No sales yet.'}</p>}
      {Object.entries(earnings?.totalsByCurrency || {}).map(([currency, e]) => {
        const rows = [
          { label: 'Gross Sales', value: e.grossSales, color: 'ink' },
          { label: 'Platform Commission', value: e.platformCommission, color: 'gold' },
          { label: 'Payment Charges', value: e.paymentCharges, color: 'ink' },
          { label: 'Refund Deductions', value: e.refundDeductions, color: 'rose, #e11d48' },
          { label: 'Net Earnings', value: e.netEarnings, color: 'emerald' },
          { label: 'Pending Earnings', value: e.pendingEarnings, color: 'gold' },
          { label: 'Available Earnings', value: e.availableEarnings, color: 'emerald' }
        ];
        return (
          <div key={currency} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {rows.map((r) => (
              <div key={r.label} className="card" style={{ padding: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{r.label}</span>
                <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: `var(--${r.color})` }}>{currency} {r.value}</strong>
              </div>
            ))}
          </div>
        );
      })}

      {/* Reviews — per the parent layout order, before Messages/Notifications */}
      <div className="dash-section-title"><h2>Reviews</h2></div>
      {(reviews?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaStar aria-hidden="true" />
          <p>{reviews === null ? 'Loading...' : 'No reviews yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {reviews?.slice(0, 3).map((r) => (
            <div key={r._id} className="card flex items-center" style={{ padding: 14, gap: 12 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{(r.buyer?.fullName || '?')[0]}</span>
              <div style={{ minWidth: 0 }}>
                <strong className="text-sm">{r.buyer?.fullName}</strong>
                <p className="text-xs flex items-center" style={{ color: 'var(--ink-soft)', marginTop: 2, gap: 4 }}>{r.product?.title} · <FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} /> {r.rating}{r.comment ? ` · "${r.comment}"` : ''}</p>
              </div>
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('sellerReviews')}>View All</button>
        </div>
      )}

      {/* Messages / Notifications preview — item 12's "Dashboard par recent messages aur unread
          count show hoga", plus item 13's Notifications feed */}
      <div className="dash-section-title"><h2>Messages / Notifications</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="flex items-center" style={{ gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--sand-line)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaCommentDots aria-hidden="true" size={13} /></span>
            <strong className="text-sm">Messages — Unread: {conversations?.reduce((sum, c) => sum + c.unread, 0) ?? 0}</strong>
          </div>
          <div style={{ padding: '6px 16px' }}>
            {(conversations?.length ?? 0) === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', padding: '8px 0' }}>{conversations === null ? 'Loading...' : 'No conversations yet.'}</p>}
            {conversations?.slice(0, 3).map((c) => (
              <p key={c.user._id} className="text-xs" style={{ color: c.unread > 0 ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: c.unread > 0 ? 600 : 400, padding: '6px 0' }}>{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''} — {c.lastMessage}</p>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('sellerMessages')}>View Messages</button>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="flex items-center" style={{ gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--sand-line)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBell aria-hidden="true" size={13} /></span>
            <strong className="text-sm">Notifications</strong>
          </div>
          <div style={{ padding: '6px 16px' }}>
            {(notifications?.length ?? 0) === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', padding: '8px 0' }}>{notifications === null ? 'Loading...' : 'No notifications yet.'}</p>}
            {notifications?.map((n) => (
              <div key={n._id} className="flex items-center justify-between gap-2" style={{ padding: '6px 0' }}>
                <p className="text-xs" style={{ color: n.read ? 'var(--ink-soft)' : 'var(--ink)', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('sellerNotifications')}>View All</button>
          </div>
        </div>
      </div>

      {/* 14. Recent Activity — every feed sourced from data already fetched above, no fabrication */}
      <div className="dash-section-title"><h2>Recent Activity</h2></div>
      {(() => {
        const feeds = [
          { title: 'New Listing Created', icon: FaBoxOpen, items: [...(products || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((p) => ({ date: p.createdAt, label: p.title })) },
          { title: 'Product Updated', icon: FaBoxesStacked, items: [...(products || [])].filter((p) => p.updatedAt !== p.createdAt).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((p) => ({ date: p.updatedAt, label: p.title })) },
          { title: 'Order Received', icon: FaCartShopping, items: [...(recentOrders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((o) => ({ date: o.createdAt, label: `${o.buyer?.fullName} — ${o.product?.title} (${o.currency} ${o.totalPrice})` })) },
          { title: 'Order Shipped/Delivered', icon: FaTruck, items: [...(recentOrders || [])].filter((o) => ['shipped', 'delivered', 'completed'].includes(o.status)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((o) => ({ date: o.updatedAt, label: `${o.product?.title} — ${ORDER_STATUS[o.status]?.label}` })) },
          { title: 'Payment Received', icon: FaMoneyBillWave, items: [...(recentOrders || [])].filter((o) => o.paymentStatus === 'paid').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((o) => ({ date: o.updatedAt, label: `${o.currency} ${o.totalPrice} — ${o.product?.title}` })) },
          { title: 'Refund Completed', icon: FaSackDollar, items: [...(recentOrders || [])].filter((o) => o.status === 'refunded').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((o) => ({ date: o.updatedAt, label: `${o.currency} ${o.totalPrice} — ${o.product?.title}` })) },
          { title: 'Withdrawal Requested', icon: FaWallet, items: [...(withdrawals || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((w) => ({ date: w.createdAt, label: `${w.currency} ${w.amount} (${SELLER_WITHDRAWAL_STATUS[w.status]?.label})` })) }
        ];
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
            {feeds.map((f) => (
              <div key={f.title} className="card" style={{ padding: 16 }}>
                <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><f.icon aria-hidden="true" size={13} /></span>
                  <strong className="text-sm">{f.title}</strong>
                </div>
                {f.items.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None yet.</p>}
                {f.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs">{it.label}</span>
                    <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(it.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })()}

      {/* 15. Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Add New Product', key: 'addListing' },
          { label: 'Add New Service', key: 'addListing' },
          { label: 'Manage Listings', key: 'listings' },
          { label: 'View Orders', key: 'orders' },
          { label: 'Update Inventory', key: 'inventory' },
          { label: 'View Earnings', key: 'earningsCommission' },
          { label: 'Withdraw Funds', key: 'withdrawals' },
          { label: 'View Messages', key: 'sellerMessages' }
        ]}
        onNavigate={onNavigate}
      />
    </>
  );
}
