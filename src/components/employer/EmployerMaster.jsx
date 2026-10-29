import { useEffect, useState } from 'react';
import { apiRequest, API_BASE, session } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import { ManualPayButton } from '../payments/ManualPay';
import '../../styles/employer-master.css';

// Master Part 12 employer screens: full dashboard, analytics, reviews & trust, promotions and
// packages, salary management, the employee's side, the public trust card and the Super Admin
// employers panel. `employer` = a company the user works for as staff (otherwise the user).

const q = (employer) => (employer ? `?employer=${employer}` : '');
const money = (n, c = 'PKR') => (n == null ? '—' : `${c} ${Number(n).toLocaleString()}`);
const date = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const thisMonth = () => new Date().toISOString().slice(0, 7);

function Tiles({ items }) {
  return (
    <div className="emp-tiles">
      {items.map((t) => (
        <div key={t.label} className="emp-tile"><span>{t.label}</span><strong>{t.value ?? '—'}</strong>{t.detail && <small>{t.detail}</small>}</div>
      ))}
    </div>
  );
}
function Section({ title, text, children, actions }) {
  return (
    <section className="card emp-section">
      <div className="emp-section-head"><div><h3>{title}</h3>{text && <p>{text}</p>}</div>{actions}</div>
      {children}
    </section>
  );
}
const Empty = ({ children }) => <p className="emp-empty">{children}</p>;
const Chip = ({ tone = '', children }) => <span className={`emp-chip ${tone}`}>{children}</span>;

// ---------------------------------------------------------------- Dashboard (12.1)
export function EmployerDashboardFull({ employer = null }) {
  const [d, setD] = useState(null);
  useEffect(() => { apiRequest(`/jobs/mine/employer-dashboard${q(employer)}`).then(setD).catch(() => setD({})); }, [employer]);
  const VER = { approved: 'Verified', pending: 'Waiting for review', rejected: 'Not approved', suspended: 'Suspended', none: 'Not submitted' };
  return (
    <Section title="Company overview" text="Every number comes from your real jobs, applicants and messages.">
      <Tiles items={[
        { label: 'Active jobs', value: d?.activeJobs }, { label: 'Closed jobs', value: d?.closedJobs, detail: 'Closed or filled' },
        { label: 'Drafts / paused', value: d ? `${d.draftJobs} / ${d.pausedJobs}` : null }, { label: 'Waiting for review', value: d?.pendingReview },
        { label: 'Applications', value: d?.applications }, { label: 'Shortlisted', value: d?.shortlisted, detail: 'And further stages' },
        { label: 'Upcoming interviews', value: d?.interviews }, { label: 'Hired', value: d?.hired },
        { label: 'Active employees', value: d?.employees }, { label: 'Unread messages', value: d?.unreadMessages },
        { label: 'Unread notifications', value: d?.unreadNotifications }, { label: 'Verification', value: d ? VER[d.verification] || d.verification : null },
        { label: 'Rating', value: d?.rating != null ? `${d.rating} / 5` : d ? 'No reviews' : null, detail: d ? `${d.reviewCount} review${d.reviewCount === 1 ? '' : 's'}` : '' },
        { label: 'Trust score', value: d ? `${d.trustScore} / 100` : null, detail: d?.trustLevel }
      ]} />
      {d?.sanction && d.sanction !== 'none' && <p className="emp-warn">CareerZ status: {d.sanction === 'warning' ? 'You have a warning on your account.' : d.sanction === 'suspended' ? 'Your account is suspended; you cannot post jobs until the date in your notification.' : 'Your employer account is banned.'}</p>}
    </Section>
  );
}

// ---------------------------------------------------------------- Analytics (12.19)
export function EmployerAnalyticsPanel({ employer = null }) {
  const [a, setA] = useState(null);
  useEffect(() => { apiRequest(`/jobs/mine/analytics${q(employer)}`).then(setA).catch(() => setA({ totals: {}, jobs: [] })); }, [employer]);
  const t = a?.totals || {};
  return (
    <>
      <Section title="Hiring analytics" text="Views count each time someone other than you opens a job. Qualified means shortlisted or further, or an AI match of 60 or more.">
        <Tiles items={[
          { label: 'Job views', value: t.views }, { label: 'Applied', value: t.applied }, { label: 'Qualified', value: t.qualified }, { label: 'Hired', value: t.hired },
          { label: 'Hiring time', value: t.hiringTimeDays != null ? `${t.hiringTimeDays} days` : a ? 'No hires yet' : null, detail: 'Application to hire' },
          { label: 'Cost per hire', value: t.costPerHirePKR != null ? money(t.costPerHirePKR) : a ? 'No hires yet' : null, detail: `Spent ${money(t.spendPKR || 0)}` },
          { label: 'AI match accuracy', value: t.aiMatchAccuracy != null ? `${t.aiMatchAccuracy}%` : a ? 'Not enough data' : null, detail: t.aiJudged ? `${t.aiJudged} decided applicants` : 'Use "Rank with AI" on applicants' }
        ]} />
      </Section>
      <Section title="Each job">
        {!a ? <Empty>Loading…</Empty> : !a.jobs.length ? <Empty>No jobs yet.</Empty> : (
          <div className="emp-cards">
            {a.jobs.map((j) => (
              <div key={j._id} className="emp-card">
                <div className="emp-card-top"><strong>{j.title}</strong><Chip>{j.status}</Chip></div>
                <dl className="emp-facts">
                  <div><dt>Views</dt><dd>{j.views}</dd></div><div><dt>Applied</dt><dd>{j.applied}</dd></div>
                  <div><dt>Qualified</dt><dd>{j.qualified}</dd></div><div><dt>Shortlisted</dt><dd>{j.shortlisted}</dd></div>
                  <div><dt>Hired</dt><dd>{j.hired}</dd></div><div><dt>View → apply</dt><dd>{j.conversion != null ? `${j.conversion}%` : '—'}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Trust score card (shared)
function TrustFactors({ trust }) {
  return (
    <div className="emp-trust">
      <div className={`emp-trust-score lvl-${(trust.level || '').toLowerCase()}`}><strong>{trust.score}</strong><span>/ 100</span><small>{trust.level} trust</small></div>
      <div className="emp-trust-factors">
        {trust.factors.map((f) => (
          <div key={f.key} className={`emp-factor${f.hasData ? '' : ' muted'}`}>
            <div><strong>{f.label}</strong><small>{f.value}</small></div>
            <span>{f.hasData ? `${f.points}/${f.max}` : 'No data'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Employer reviews (12.15, 12.16)
export function EmployerReviewsPanel({ onFlash }) {
  const [trust, setTrust] = useState(null), [reviews, setReviews] = useState(null);
  function load() {
    apiRequest('/employer-trust/reviews/employer/trust').then(setTrust).catch(() => {});
    apiRequest('/employer-trust/reviews/employer').then(setReviews).catch((e) => { setReviews([]); onFlash(e.message); });
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function act(path, label, placeholder, key) {
    const text = await showPrompt(label, { title: label, placeholder, required: true });
    if (!text) return;
    try { await apiRequest(path, { method: path.endsWith('respond') ? 'PATCH' : 'POST', body: { [key]: text } }); onFlash('Done.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  return (
    <>
      <Section title="Trust score" text="Job seekers see this score and your reviews on every job you post.">
        {trust ? <TrustFactors trust={trust} /> : <Empty>Loading…</Empty>}
      </Section>
      <Section title="Employee reviews" text="Only people who really worked for you can review. Their names stay private. You can answer publicly, or report a false review to CareerZ.">
        {reviews === null ? <Empty>Loading…</Empty> : !reviews.length ? <Empty>No reviews yet.</Empty> : (
          <div className="emp-cards">
            {reviews.map((r) => (
              <div key={r._id} className="emp-card">
                <div className="emp-card-top"><strong>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} {r.title}</strong>{r.status !== 'published' && <Chip tone="bad">Hidden</Chip>}</div>
                <small className="emp-muted">{r.reviewer} · {r.jobTitle} · {date(r.createdAt)}{r.salaryOnTime != null ? ` · Salary on time: ${r.salaryOnTime ? 'yes' : 'no'}` : ''}</small>
                <p className="emp-text">{r.comment}</p>
                {r.employerResponse && <p className="emp-reply"><strong>Your answer:</strong> {r.employerResponse.text}</p>}
                {r.report?.at && <small className="emp-muted">Reported {date(r.report.at)}{r.report.open ? ' · CareerZ is checking' : ` · Decision: ${r.moderationNote || 'kept'}`}</small>}
                {r.appeal?.status && <small className="emp-muted">Appeal: {r.appeal.status}{r.appeal.note ? ` · ${r.appeal.note}` : ''}</small>}
                <div className="emp-actions">
                  {r.status === 'published' && <button type="button" className="btn" onClick={() => act(`/employer-trust/reviews/${r._id}/respond`, 'Answer this review', 'Your public answer', 'text')}>{r.employerResponse ? 'Change answer' : 'Answer'}</button>}
                  {r.status === 'published' && !r.report?.at && <button type="button" className="btn staff-remove" onClick={() => act(`/employer-trust/reviews/${r._id}/report`, 'Report this review', 'Why is it false or unfair? Mention your evidence.', 'reason')}>Report</button>}
                  {r.report?.at && !r.report.open && r.status === 'published' && !r.appeal?.by && <button type="button" className="btn" onClick={() => act(`/employer-trust/reviews/${r._id}/appeal`, 'Appeal the decision', 'Explain your appeal', 'text')}>Appeal</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Promotions & packages (12.18)
export function EmployerPromotionsPanel({ onFlash, employer = null }) {
  const [d, setD] = useState(null), [jobFor, setJobFor] = useState({});
  function load() { apiRequest(`/employer-packages/mine${q(employer)}`).then(setD).catch((e) => { setD(null); onFlash(e.message); }); }
  useEffect(load, [employer]); // eslint-disable-line react-hooks/exhaustive-deps
  async function featureWithCredit(jobId) {
    try { await apiRequest(`/employer-packages/featured-credit/${jobId}`, { method: 'POST', body: employer ? { employer } : {} }); onFlash('Job featured with a credit.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function openInvoice(id) {
    try {
      const inv = await apiRequest(`/employer-packages/invoices/${id}`);
      const w = window.open('', '_blank');
      if (!w) return onFlash('Allow pop-ups to open the invoice.');
      const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      w.document.write(`<!doctype html><title>${esc(inv.invoiceNumber)}</title><body style="font-family:sans-serif;max-width:640px;margin:40px auto;color:#222"><h2>CareerZ invoice</h2><p><b>${esc(inv.invoiceNumber)}</b> · ${esc(new Date(inv.createdAt).toLocaleDateString())}</p><p>Billed to: ${esc(inv.employer.fullName)} (${esc(inv.employer.email)})<br>Bought by: ${esc(inv.boughtBy?.fullName)}</p><table style="width:100%;border-collapse:collapse" border="1" cellpadding="8"><tr><th align="left">Item</th><th align="right">Amount</th></tr><tr><td>${esc(inv.title)}</td><td align="right">${esc(inv.currency)} ${inv.baseAmount.toLocaleString()}</td></tr><tr><td>Tax (${inv.taxPercent}%)</td><td align="right">${esc(inv.currency)} ${inv.taxAmount.toLocaleString()}</td></tr><tr><th align="left">Total paid</th><th align="right">${esc(inv.currency)} ${inv.amount.toLocaleString()}</th></tr></table><p>Payment reference: ${esc(inv.paymentRef)} (bank transfer, verified by CareerZ)</p>${inv.expiresAt ? `<p>Active until ${esc(new Date(inv.expiresAt).toLocaleDateString())}</p>` : ''}<button onclick="print()">Print</button></body>`);
      w.document.close();
    } catch (e) { onFlash(e.message); }
  }
  if (!d) return <Section title="Promotions & packages"><Empty>Loading…</Empty></Section>;
  const { config, perks, purchases, jobs } = d;
  const tax = config.taxPercent ? ` + ${config.taxPercent}% tax` : '';
  return (
    <>
      <Section title="What you have now">
        <Tiles items={[
          { label: 'Live jobs', value: d.jobLimit ? `${d.liveJobs} / ${d.jobLimit}` : d.liveJobs, detail: d.jobLimit ? 'Your live-job limit' : 'No limit' },
          { label: 'Subscription', value: perks.subscription ? 'Active' : 'None', detail: perks.subscription ? `Until ${date(perks.planUntil)}` : '' },
          { label: 'Top Hiring badge', value: perks.topHiring ? 'Active' : 'None', detail: perks.topHiring ? `Until ${date(perks.topHiringUntil)}` : '' },
          { label: 'Premium tools', value: perks.premiumTools ? 'Active' : 'None', detail: perks.premiumTools ? `Until ${date(perks.premiumUntil)}` : '' },
          { label: 'Featured credits', value: perks.featuredCredits, detail: 'From Hiring Packages' }
        ]} />
      </Section>
      <Section title="Buy a package" text={`Prices are set by CareerZ${tax}. Pay by bank transfer; the package starts when CareerZ confirms your receipt.`}>
        <div className="emp-cards">
          {Object.values(config.packages).map((p) => (
            <div key={p.key} className="emp-card emp-package">
              <div className="emp-card-top"><strong>{p.label}</strong><Chip>{money(p.price, config.currency)}</Chip></div>
              <p className="emp-text">{p.about}</p>
              <small className="emp-muted">{p.days ? `${p.days} days` : 'No expiry'}{p.jobLimit ? ` · up to ${p.jobLimit} live jobs` : ''}{p.credits ? ` · ${p.credits} Featured credits` : ''}</small>
              {p.perJob && !jobs.length && <small className="emp-warn">You have no live or paused job. Post a job first, then promote it here.</small>}
              {p.perJob && jobs.length > 0 && (
                <label className="hiring-field"><span>Job</span>
                  <select className="form-select" value={jobFor[p.key] || ''} onChange={(e) => setJobFor({ ...jobFor, [p.key]: e.target.value })}>
                    <option value="">Choose a job</option>
                    {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}{j[p.key] ? ' (already on)' : ''}</option>)}
                  </select>
                </label>
              )}
              <ManualPayButton kind="employer_package" id={p.key} query={{ ...(p.perJob ? { job: jobFor[p.key] || '' } : {}), ...(employer ? { employer } : {}) }} disabled={!(p.price > 0) || (p.perJob && !jobFor[p.key])} label="Buy · bank transfer" onFlash={onFlash} onDone={load} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Your jobs" text="Featured Job is bought from My Jobs; with Featured credits you can feature a job here for free.">
        {!jobs.length ? <Empty>No live or paused jobs.</Empty> : (
          <div className="emp-cards">
            {jobs.map((j) => (
              <div key={j._id} className="emp-card">
                <div className="emp-card-top"><strong>{j.title}</strong><Chip>{j.status}</Chip></div>
                <div className="emp-chips">
                  {j.featured && <Chip tone="good">Featured until {date(j.featuredUntil)}</Chip>}
                  {j.sponsored && <Chip tone="good">Sponsored until {date(j.sponsoredUntil)}</Chip>}
                  {j.urgent && <Chip tone="warn">Urgent until {date(j.urgentUntil)}</Chip>}
                  {!j.featured && !j.sponsored && !j.urgent && <small className="emp-muted">No promotion</small>}
                </div>
                {!j.featured && perks.featuredCredits > 0 && <div className="emp-actions"><button type="button" className="btn btn-primary" onClick={() => featureWithCredit(j._id)}>Feature with a credit</button></div>}
              </div>
            ))}
          </div>
        )}
      </Section>
      <Section title="Invoices">
        {!purchases.length ? <Empty>No purchases yet.</Empty> : (
          <div className="emp-cards">
            {purchases.map((p) => (
              <div key={p._id} className="emp-card">
                <div className="emp-card-top"><strong>{p.title}</strong><Chip>{money(p.amount, p.currency)}</Chip></div>
                <small className="emp-muted">{p.invoiceNumber} · {date(p.createdAt)}{p.taxAmount ? ` · tax ${money(p.taxAmount, p.currency)}` : ''}{p.expiresAt ? ` · until ${date(p.expiresAt)}` : ''}</small>
                <div className="emp-actions"><button type="button" className="btn" onClick={() => openInvoice(p._id)}>Open invoice</button></div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// Premium tool: download applicants (used from My Jobs).
export async function downloadApplicantsCsv(jobId, onFlash) {
  try {
    const res = await fetch(`${API_BASE}/employer-packages/jobs/${jobId}/applicants.csv`, { headers: { Authorization: `Bearer ${session.getAccessToken()}` } });
    if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || 'Download failed.'); }
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url; a.download = 'applicants.csv'; a.click();
    URL.revokeObjectURL(url);
  } catch (e) { onFlash(e.message); }
}

// ---------------------------------------------------------------- Salary management (12.13)
const blankSlip = { employment: '', basic: '', allowances: [{ label: '', amount: '' }], bonus: '', deductions: [{ label: '', amount: '' }], workingDays: '', presentDays: '', leaveDays: '', absentDays: '', note: '' };

export function EmployerPayrollPanel({ onFlash, employer = null }) {
  const [month, setMonth] = useState(thisMonth()), [d, setD] = useState(null), [form, setForm] = useState(blankSlip);
  function load() { apiRequest(`/employer-payroll?month=${month}${employer ? `&employer=${employer}` : ''}`).then(setD).catch((e) => { setD(null); onFlash(e.message); }); }
  useEffect(load, [month, employer]); // eslint-disable-line react-hooks/exhaustive-deps
  const setLine = (key, i, field, v) => setForm({ ...form, [key]: form[key].map((l, n) => (n === i ? { ...l, [field]: v } : l)) });
  function pick(id) {
    const emp = d.employees.find((e) => e._id === id);
    const existing = d.payslips.find((p) => p.employment === id);
    setForm(existing ? { ...blankSlip, ...existing, employment: id, allowances: existing.allowances.length ? existing.allowances : blankSlip.allowances, deductions: existing.deductions.length ? existing.deductions : blankSlip.deductions } : { ...blankSlip, employment: id, basic: emp?.salary ?? '' });
  }
  async function save(e) {
    e.preventDefault();
    const n = (v) => (v === '' || v == null ? 0 : Number(v));
    try {
      await apiRequest('/employer-payroll', { method: 'POST', body: { ...form, month, employer: employer || undefined, basic: n(form.basic), bonus: n(form.bonus), workingDays: n(form.workingDays), presentDays: n(form.presentDays), leaveDays: n(form.leaveDays), absentDays: n(form.absentDays), allowances: form.allowances.filter((l) => l.label).map((l) => ({ label: l.label, amount: n(l.amount) })), deductions: form.deductions.filter((l) => l.label).map((l) => ({ label: l.label, amount: n(l.amount) })) } });
      onFlash('Payslip saved as draft.', 'success'); setForm(blankSlip); load();
    } catch (err) { onFlash(err.message); }
  }
  async function step(p, action) {
    try {
      if (action === 'paid') {
        const ref = await showPrompt('Bank or transfer reference (optional).', { title: 'Mark salary paid', placeholder: 'e.g. IBFT 123456', confirmLabel: 'Mark paid' });
        if (ref === null) return;
        await apiRequest(`/employer-payroll/${p._id}/paid`, { method: 'POST', body: { reference: ref, employer: employer || undefined } });
      } else if (action === 'delete') {
        if (!(await showConfirm('Delete this draft payslip?', { title: 'Delete draft', confirmLabel: 'Delete', danger: true }))) return;
        await apiRequest(`/employer-payroll/${p._id}${q(employer)}`, { method: 'DELETE' });
      } else await apiRequest(`/employer-payroll/${p._id}/issue`, { method: 'POST', body: { employer: employer || undefined } });
      onFlash('Done.', 'success'); load();
    } catch (err) { onFlash(err.message); }
  }
  const STATUS = { draft: ['', 'Draft'], issued: ['warn', 'Sent to employee'], paid: ['good', 'Paid'] };
  return (
    <>
      <Section title="Salary management" text="Optional. Keep monthly payslips with allowances, bonus, deductions, leave and attendance. Employees see issued payslips and confirm when the salary arrives." actions={<label className="hiring-field"><span>Month</span><input className="form-input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>}>
        <Tiles items={[{ label: 'Active employees', value: d?.employees.length }, { label: 'Payslips this month', value: d?.payslips.length }, { label: 'Paid', value: d?.totals.paid }, { label: 'Total net pay', value: d ? money(d.totals.net) : null }]} />
      </Section>
      <Section title="Payslip">
        {!d?.employees.length ? <Empty>No active employees. People you hire appear here after they join.</Empty> : (
          <form className="emp-form" onSubmit={save}>
            <label className="hiring-field"><span>Employee</span><select className="form-select" required value={form.employment} onChange={(e) => pick(e.target.value)}><option value="">Choose</option>{d.employees.map((e) => <option key={e._id} value={e._id}>{e.employee?.fullName} · {e.job?.title}</option>)}</select></label>
            <div className="emp-grid4">
              <label className="hiring-field"><span>Basic salary</span><input className="form-input" type="number" min="0" required value={form.basic} onChange={(e) => setForm({ ...form, basic: e.target.value })} /></label>
              <label className="hiring-field"><span>Bonus</span><input className="form-input" type="number" min="0" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} /></label>
              <label className="hiring-field"><span>Working days</span><input className="form-input" type="number" min="0" max="31" value={form.workingDays} onChange={(e) => setForm({ ...form, workingDays: e.target.value })} /></label>
              <label className="hiring-field"><span>Present days</span><input className="form-input" type="number" min="0" max="31" value={form.presentDays} onChange={(e) => setForm({ ...form, presentDays: e.target.value })} /></label>
              <label className="hiring-field"><span>Leave days</span><input className="form-input" type="number" min="0" max="31" value={form.leaveDays} onChange={(e) => setForm({ ...form, leaveDays: e.target.value })} /></label>
              <label className="hiring-field"><span>Absent days</span><input className="form-input" type="number" min="0" max="31" value={form.absentDays} onChange={(e) => setForm({ ...form, absentDays: e.target.value })} /></label>
            </div>
            {[['allowances', 'Allowances'], ['deductions', 'Deductions']].map(([key, label]) => (
              <div key={key} className="emp-lines">
                <h5>{label}</h5>
                {form[key].map((l, i) => (
                  <div key={i} className="emp-line">
                    <input className="form-input" placeholder={key === 'allowances' ? 'e.g. Transport' : 'e.g. Income tax'} value={l.label} onChange={(e) => setLine(key, i, 'label', e.target.value)} />
                    <input className="form-input" type="number" min="0" placeholder="Amount" value={l.amount} onChange={(e) => setLine(key, i, 'amount', e.target.value)} />
                    <button type="button" className="btn staff-remove" onClick={() => setForm({ ...form, [key]: form[key].filter((_, n) => n !== i) })}>Remove</button>
                  </div>
                ))}
                <button type="button" className="btn" onClick={() => setForm({ ...form, [key]: [...form[key], { label: '', amount: '' }] })}>Add {key === 'allowances' ? 'allowance' : 'deduction'}</button>
              </div>
            ))}
            <label className="hiring-field"><span>Note (optional)</span><input className="form-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
            <div className="emp-actions"><button type="submit" className="btn btn-primary">Save draft</button></div>
          </form>
        )}
      </Section>
      <Section title={`Payslips for ${month}`}>
        {!d?.payslips.length ? <Empty>No payslips this month.</Empty> : (
          <div className="emp-cards">
            {d.payslips.map((p) => (
              <div key={p._id} className="emp-card">
                <div className="emp-card-top"><strong>{p.employee?.fullName}</strong><Chip tone={STATUS[p.status][0]}>{STATUS[p.status][1]}</Chip></div>
                <dl className="emp-facts">
                  <div><dt>Gross</dt><dd>{money(p.gross, p.currency)}</dd></div><div><dt>Net</dt><dd>{money(p.net, p.currency)}</dd></div>
                  <div><dt>Present / leave / absent</dt><dd>{p.presentDays} / {p.leaveDays} / {p.absentDays}</dd></div>
                  <div><dt>Employee</dt><dd>{p.employeeConfirmation?.received == null ? '—' : p.employeeConfirmation.received ? 'Received' : 'Not received'}</dd></div>
                </dl>
                <div className="emp-actions">
                  {p.status === 'draft' && <><button type="button" className="btn" onClick={() => pick(p.employment)}>Edit</button><button type="button" className="btn btn-primary" onClick={() => step(p, 'issue')}>Send to employee</button><button type="button" className="btn staff-remove" onClick={() => step(p, 'delete')}>Delete</button></>}
                  {p.status === 'issued' && <button type="button" className="btn btn-primary" onClick={() => step(p, 'paid')}>Mark salary paid</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// ---------------------------------------------------------------- Employee side (reviews, payslips, fraud reports)
export function EmployeeCompanyPanel({ onFlash }) {
  const [reviewable, setReviewable] = useState([]), [mine, setMine] = useState([]), [slips, setSlips] = useState([]), [reports, setReports] = useState([]);
  const [form, setForm] = useState(null);
  function load() {
    apiRequest('/employer-trust/reviews/reviewable').then(setReviewable).catch(() => {});
    apiRequest('/employer-trust/reviews/mine').then(setMine).catch(() => {});
    apiRequest('/employer-payroll/mine').then(setSlips).catch(() => {});
    apiRequest('/employer-trust/fraud-reports/mine').then(setReports).catch(() => {});
  }
  useEffect(load, []);
  if (!reviewable.length && !mine.length && !slips.length && !reports.length) return null;
  async function submit(e) {
    e.preventDefault();
    try { const r = await apiRequest('/employer-trust/reviews', { method: 'POST', body: { ...form, rating: Number(form.rating), salaryOnTime: form.salaryOnTime === '' ? null : form.salaryOnTime === 'yes' } }); onFlash(r.status === 'published' ? 'Review published.' : 'Review sent. CareerZ checks it before it is published.', 'success'); setForm(null); load(); } catch (err) { onFlash(err.message); }
  }
  async function appeal(id) {
    const text = await showPrompt('Explain why your review should be shown. Mention your evidence.', { title: 'Appeal', placeholder: 'Your appeal', required: true });
    if (!text) return;
    try { await apiRequest(`/employer-trust/reviews/${id}/appeal`, { method: 'POST', body: { text } }); onFlash('Appeal sent.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function confirm(id, received) {
    const note = received ? '' : await showPrompt('What happened? (optional)', { title: 'Salary not received', placeholder: 'Note' });
    if (note === null) return;
    try { await apiRequest(`/employer-payroll/mine/${id}/confirm`, { method: 'PATCH', body: { received, note } }); onFlash('Thank you.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function evidence(id) {
    const note = await showPrompt('Add more evidence to your report.', { title: 'Add evidence', placeholder: 'What you can show (messages, receipts, dates)', required: true });
    if (!note) return;
    try { await apiRequest(`/employer-trust/fraud-reports/${id}/evidence`, { method: 'POST', body: { note } }); onFlash('Evidence added.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  const RS = { published: ['good', 'Published'], pending: ['warn', 'CareerZ is checking'], hidden: ['bad', 'Hidden'] };
  return (
    <div className="emp-employee">
      {(reviewable.length > 0 || mine.length > 0) && (
        <Section title="Review your employer" text="Only you can review a company you joined. Your name is never shown; readers see “Verified employee”.">
          {reviewable.length > 0 && !form && <div className="emp-chips">{reviewable.map((e) => <button key={e._id} type="button" className="btn btn-primary" onClick={() => setForm({ employment: e._id, rating: '5', title: '', comment: '', salaryOnTime: '', evidenceNote: '', _label: `${e.employer?.fullName} · ${e.job?.title}` })}>Review {e.employer?.fullName} ({e.job?.title})</button>)}</div>}
          {form && (
            <form className="emp-form" onSubmit={submit}>
              <strong>{form._label}</strong>
              <div className="emp-grid4">
                <label className="hiring-field"><span>Rating</span><select className="form-select" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} {n}</option>)}</select></label>
                <label className="hiring-field"><span>Salary on time?</span><select className="form-select" value={form.salaryOnTime} onChange={(e) => setForm({ ...form, salaryOnTime: e.target.value })}><option value="">Prefer not to say</option><option value="yes">Yes</option><option value="no">No</option></select></label>
              </div>
              <label className="hiring-field"><span>Title</span><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <label className="hiring-field"><span>Your review</span><textarea className="form-input" rows={4} required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></label>
              <label className="hiring-field"><span>Evidence for CareerZ (optional, not public)</span><input className="form-input" placeholder="e.g. I have my payslips and offer letter" value={form.evidenceNote} onChange={(e) => setForm({ ...form, evidenceNote: e.target.value })} /></label>
              <div className="emp-actions"><button type="submit" className="btn btn-primary">Submit review</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div>
            </form>
          )}
          {mine.length > 0 && (
            <div className="emp-cards">
              {mine.map((r) => (
                <div key={r._id} className="emp-card">
                  <div className="emp-card-top"><strong>{r.employer?.fullName} · {'★'.repeat(r.rating)}</strong><Chip tone={RS[r.status][0]}>{RS[r.status][1]}</Chip></div>
                  <p className="emp-text">{r.comment}</p>
                  {r.moderation?.note && <small className="emp-muted">CareerZ: {r.moderation.note}</small>}
                  {r.appeal?.status && <small className="emp-muted">Appeal: {r.appeal.status}{r.appeal.note ? ` · ${r.appeal.note}` : ''}</small>}
                  {r.status === 'hidden' && !r.appeal?.by && <div className="emp-actions"><button type="button" className="btn" onClick={() => appeal(r._id)}>Appeal</button></div>}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
      {slips.length > 0 && (
        <Section title="My payslips">
          <div className="emp-cards">
            {slips.map((p) => (
              <div key={p._id} className="emp-card">
                <div className="emp-card-top"><strong>{p.employer?.fullName} · {p.month}</strong><Chip tone={p.status === 'paid' ? 'good' : 'warn'}>{p.status === 'paid' ? 'Paid' : 'Issued'}</Chip></div>
                <dl className="emp-facts">
                  <div><dt>Basic</dt><dd>{money(p.basic, p.currency)}</dd></div>
                  {p.allowances.map((l) => <div key={`a${l.label}`}><dt>{l.label}</dt><dd>+ {money(l.amount, p.currency)}</dd></div>)}
                  {p.bonus > 0 && <div><dt>Bonus</dt><dd>+ {money(p.bonus, p.currency)}</dd></div>}
                  {p.deductions.map((l) => <div key={`d${l.label}`}><dt>{l.label}</dt><dd>− {money(l.amount, p.currency)}</dd></div>)}
                  <div><dt>Net pay</dt><dd><strong>{money(p.net, p.currency)}</strong></dd></div>
                  <div><dt>Present / leave / absent</dt><dd>{p.presentDays} / {p.leaveDays} / {p.absentDays}</dd></div>
                </dl>
                {p.status === 'paid' && (p.employeeConfirmation?.received == null
                  ? <div className="emp-actions"><button type="button" className="btn btn-primary" onClick={() => confirm(p._id, true)}>I received it</button><button type="button" className="btn staff-remove" onClick={() => confirm(p._id, false)}>Not received</button></div>
                  : <small className="emp-muted">You said: {p.employeeConfirmation.received ? 'received' : 'not received'}</small>)}
              </div>
            ))}
          </div>
        </Section>
      )}
      {reports.length > 0 && (
        <Section title="My fraud reports">
          <div className="emp-cards">
            {reports.map((r) => (
              <div key={r._id} className="emp-card">
                <div className="emp-card-top"><strong>{r.employer?.fullName}</strong><Chip tone={r.status === 'open' ? 'warn' : r.status === 'actioned' ? 'good' : ''}>{r.status === 'open' ? 'CareerZ is checking' : r.status === 'actioned' ? 'Action taken' : 'Closed'}</Chip></div>
                <small className="emp-muted">{r.category.replace(/_/g, ' ')}{r.job ? ` · ${r.job.title}` : ''} · {r.evidence?.length || 0} evidence item(s)</small>
                {r.status === 'open' && <div className="emp-actions"><button type="button" className="btn" onClick={() => evidence(r._id)}>Add evidence</button></div>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Public: trust card on a job
const FRAUD = { fake_job: 'Fake job', salary_scam: 'Salary scam', fake_interview: 'Fake interview', illegal_recruitment: 'Illegal recruitment', identity_fraud: 'Identity fraud' };

export function ReportEmployerButton({ employerId, jobId, onFlash = () => {} }) {
  const [open, setOpen] = useState(false), [form, setForm] = useState({ category: 'fake_job', description: '', evidence: '' }), [busy, setBusy] = useState(false);
  if (!session.getAccessToken()) return null;
  async function send(e) {
    e.preventDefault();
    setBusy(true);
    try { await apiRequest(`/employer-trust/companies/${employerId}/fraud-reports`, { method: 'POST', body: { ...form, job: jobId || undefined } }); onFlash('Report sent to CareerZ. You can add evidence from your dashboard.', 'success'); setOpen(false); }
    catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  if (!open) return <button type="button" className="btn staff-remove" onClick={() => setOpen(true)}>Report fraud</button>;
  return (
    <form className="emp-form emp-report" onSubmit={send}>
      <label className="hiring-field"><span>What happened?</span><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{Object.entries(FRAUD).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label className="hiring-field"><span>Details</span><textarea className="form-input" rows={3} required minLength={20} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className="hiring-field"><span>Evidence (optional)</span><input className="form-input" placeholder="Messages, receipts, dates" value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} /></label>
      <div className="emp-actions"><button type="submit" className="btn btn-primary" disabled={busy}>Send report</button><button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}

export function CompanyTrustCard({ employerId, jobId, onFlash }) {
  const [d, setD] = useState(null), [more, setMore] = useState(false);
  useEffect(() => { if (employerId) apiRequest(`/employer-trust/companies/${employerId}`, { auth: false }).then(setD).catch(() => setD(null)); }, [employerId]);
  if (!d) return null;
  const shown = more ? d.reviews : d.reviews.slice(0, 3);
  return (
    <section className="card emp-section emp-public-trust">
      <div className="emp-section-head"><div><h3>About {d.employer.fullName}</h3><p>CareerZ trust score and reviews from verified employees.</p></div><ReportEmployerButton employerId={employerId} jobId={jobId} onFlash={onFlash} /></div>
      <TrustFactors trust={d.trust} />
      {d.reviews.length > 0 && (
        <div className="emp-cards">
          {shown.map((r) => (
            <div key={r._id} className="emp-card">
              <div className="emp-card-top"><strong>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} {r.title}</strong></div>
              <small className="emp-muted">{r.reviewer} · {r.jobTitle} · {date(r.createdAt)}</small>
              <p className="emp-text">{r.comment}</p>
              {r.employerResponse && <p className="emp-reply"><strong>Company answer:</strong> {r.employerResponse.text}</p>}
            </div>
          ))}
        </div>
      )}
      {d.reviews.length > 3 && <button type="button" className="btn" onClick={() => setMore(!more)}>{more ? 'Show fewer reviews' : `Show all ${d.reviews.length} reviews`}</button>}
    </section>
  );
}

// ---------------------------------------------------------------- Super Admin employers panel (12.17, 12.20)
export function AdminEmployersPanel({ onFlash, isSuperAdmin }) {
  const [view, setView] = useState('overview');
  const VIEWS = [['overview', 'Overview'], ['employers', 'Employers'], ['fraud', 'Fraud reports'], ['archive', 'Evidence archive'], ['reviews', 'Review moderation'], ['packages', 'Packages & prices']];
  return (
    <div className="emp-admin">
      <nav className="cz-tabbar" aria-label="Employer management">{VIEWS.map(([k, l]) => <button key={k} type="button" className={`cz-tab${view === k ? ' active' : ''}`} aria-pressed={view === k} onClick={() => setView(k)}>{l}</button>)}</nav>
      {view === 'overview' && <AdminOverview />}
      {view === 'employers' && <AdminEmployerList onFlash={onFlash} />}
      {(view === 'fraud' || view === 'archive') && <AdminFraudCases key={view} status={view === 'fraud' ? 'open' : 'archive'} onFlash={onFlash} />}
      {view === 'reviews' && <AdminReviewQueue onFlash={onFlash} />}
      {view === 'packages' && <AdminPackages onFlash={onFlash} isSuperAdmin={isSuperAdmin} />}
    </div>
  );
}

function AdminOverview() {
  const [o, setO] = useState(null), [s, setS] = useState(null);
  useEffect(() => { apiRequest('/employer-trust/admin/overview').then(setO).catch(() => setO({})); apiRequest('/employer-packages/admin/sales').then(setS).catch(() => setS(null)); }, []);
  const companies = o?.companies ? Object.entries(o.companies).map(([k, n]) => `${k.replace(/_/g, ' ')}: ${n}`).join(' · ') : '';
  const revenue = (s?.byPackage || []).reduce((t, p) => t + p.total, 0);
  return (
    <>
      <Section title="Employers on CareerZ">
        <Tiles items={[
          { label: 'Total employers', value: o?.totalEmployers, detail: companies }, { label: 'Waiting verification', value: o?.pendingVerification },
          { label: 'Active jobs', value: o?.activeJobs }, { label: 'Filled jobs', value: o?.filledJobs },
          { label: 'Open fraud reports', value: o?.openFraud }, { label: 'Fraud actions taken', value: o?.actionedFraud },
          { label: 'Reviews to moderate', value: o?.reviewsWaiting },
          { label: 'Warned / suspended / banned', value: o ? `${o.sanctions?.warning || 0} / ${o.sanctions?.suspended || 0} / ${o.sanctions?.banned || 0}` : null },
          { label: 'Package sales', value: s ? money(revenue) : null, detail: s ? `${(s.byPackage || []).reduce((t, p) => t + p.count, 0)} purchases` : '' }
        ]} />
      </Section>
      <Section title="Jobs by country">
        {!o?.byCountry?.length ? <Empty>No employer jobs yet.</Empty> : <div className="emp-cards">{o.byCountry.map((c) => <div key={c.country} className="emp-card"><div className="emp-card-top"><strong>{c.country}</strong><Chip>{c.jobs} jobs</Chip></div><small className="emp-muted">{c.active} active</small></div>)}</div>}
      </Section>
      {s && (
        <Section title="Sales by package">
          <div className="emp-cards">
            {s.byPackage.map((p) => <div key={p._id} className="emp-card"><div className="emp-card-top"><strong>{p._id.replace(/_/g, ' ')}</strong><Chip>{p.count}</Chip></div><small className="emp-muted">{money(p.total)} · tax {money(p.tax)}</small></div>)}
            {s.featured.map((f) => <div key={f._id} className="emp-card"><div className="emp-card-top"><strong>Featured jobs</strong><Chip>{f.count}</Chip></div><small className="emp-muted">{money(f.total, f._id)}</small></div>)}
          </div>
        </Section>
      )}
    </>
  );
}

function AdminEmployerList({ onFlash }) {
  const [rows, setRows] = useState(null), [term, setTerm] = useState('');
  function load() { apiRequest(`/employer-trust/admin/employers?q=${encodeURIComponent(term)}`).then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function lift(u) {
    const note = await showPrompt(`Lift the restriction on ${u.fullName}?`, { title: 'Lift restriction', placeholder: 'Reason', required: true });
    if (!note) return;
    try { await apiRequest(`/employer-trust/admin/employers/${u._id}/lift`, { method: 'POST', body: { note } }); onFlash('Restriction lifted.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  const S = { warning: ['warn', 'Warning'], suspended: ['bad', 'Suspended'], banned: ['bad', 'Banned'] };
  return (
    <Section title="Employers" actions={<form className="emp-search" onSubmit={(e) => { e.preventDefault(); load(); }}><input className="form-input" placeholder="Name or email" value={term} onChange={(e) => setTerm(e.target.value)} /><button type="submit" className="btn">Search</button></form>}>
      {rows === null ? <Empty>Loading…</Empty> : !rows.length ? <Empty>No employers found.</Empty> : (
        <div className="emp-cards">
          {rows.map((u) => {
            const lvl = u.employerSanctions?.level;
            return (
              <div key={u._id} className="emp-card">
                <div className="emp-card-top"><div><strong>{u.fullName}</strong><small className="emp-muted emp-block">{u.email}</small></div>{S[lvl] && <Chip tone={S[lvl][0]}>{S[lvl][1]}</Chip>}</div>
                <dl className="emp-facts">
                  <div><dt>Jobs</dt><dd>{u.jobs.total}</dd></div><div><dt>Active</dt><dd>{u.jobs.active}</dd></div><div><dt>Filled</dt><dd>{u.jobs.filled}</dd></div>
                  <div><dt>Open reports</dt><dd>{u.openFraud}</dd></div><div><dt>Trust</dt><dd>{u.trust}/100</dd></div><div><dt>Warnings</dt><dd>{u.employerSanctions?.warnings || 0}</dd></div>
                </dl>
                {lvl && lvl !== 'none' && lvl !== 'banned' && <div className="emp-actions"><button type="button" className="btn" onClick={() => lift(u)}>Lift restriction</button></div>}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function AdminFraudCases({ status, onFlash }) {
  const [rows, setRows] = useState(null);
  function load() { apiRequest(`/employer-trust/admin/fraud-cases?status=${status}`).then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }
  useEffect(load, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(c, action) {
    let days;
    if (action === 'suspension' || (action === 'next' && c.employer?.employerSanctions?.level === 'warning')) {
      days = await showPrompt('How many days? (1 to 365)', { title: 'Temporary suspension', placeholder: '30', required: true });
      if (!days) return;
    }
    const note = await showPrompt('Reason (kept with the evidence and sent to the employer).', { title: action === 'dismiss' ? 'Dismiss report' : 'Take action', placeholder: 'Reason', required: true, danger: action === 'ban' });
    if (!note) return;
    try { await apiRequest(`/employer-trust/admin/fraud-cases/${c._id}`, { method: 'PATCH', body: { action, days: days ? Number(days) : undefined, note } }); onFlash('Decision saved.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function addEvidence(c) {
    const note = await showPrompt('Evidence to add (it cannot be removed later).', { title: 'Add evidence', placeholder: 'What you found', required: true });
    if (!note) return;
    try { await apiRequest(`/employer-trust/admin/fraud-cases/${c._id}/evidence`, { method: 'POST', body: { note } }); onFlash('Evidence added.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function authority(c) {
    if (!(await showConfirm('Record a report to a government authority only where the law allows it and the evidence is enough. Continue?', { title: 'Report to authority', confirmLabel: 'The law allows it' }))) return;
    const name = await showPrompt('Which authority?', { title: 'Authority', placeholder: 'e.g. FIA Cyber Crime Wing', required: true });
    if (!name) return;
    const note = await showPrompt('Reference or note (optional).', { title: 'Note', placeholder: 'Complaint number, date' });
    if (note === null) return;
    try { await apiRequest(`/employer-trust/admin/fraud-cases/${c._id}/authority-report`, { method: 'POST', body: { authority: name, note, lawAllows: true } }); onFlash('Recorded.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  const NEXT = { none: 'Warning', warning: 'Temporary suspension', suspended: 'Permanent ban', banned: 'Permanent ban' };
  return (
    <Section title={status === 'open' ? 'Open fraud reports' : 'Evidence archive'} text={status === 'open' ? 'Ladder: Warning → Temporary Suspension → Permanent Ban. Every decision and its evidence is archived.' : 'Decided cases with all their evidence. Nothing here can be deleted.'}>
      {rows === null ? <Empty>Loading…</Empty> : !rows.length ? <Empty>{status === 'open' ? 'No open reports.' : 'The archive is empty.'}</Empty> : (
        <div className="emp-cards emp-cards-wide">
          {rows.map((c) => (
            <div key={c._id} className="emp-card">
              <div className="emp-card-top"><div><strong>{FRAUD[c.category]} · {c.employer?.fullName}</strong><small className="emp-muted emp-block">Reported by {c.reportedBy?.fullName || 'CareerZ'} · {date(c.createdAt)}{c.job ? ` · ${c.job.title}` : ''}</small></div><Chip tone={c.status === 'open' ? 'warn' : c.status === 'actioned' ? 'bad' : ''}>{c.status === 'actioned' ? c.action : c.status}</Chip></div>
              <p className="emp-text">{c.description}</p>
              <div className="emp-evidence">
                <h5>Evidence ({c.evidence.length})</h5>
                {c.evidence.length ? c.evidence.map((e, i) => <p key={i}><small className="emp-muted">{date(e.at)} · {e.by?.fullName || ''}</small><br />{e.note}</p>) : <small className="emp-muted">None yet.</small>}
              </div>
              {c.decisionNote && <small className="emp-muted">Decision: {c.decisionNote}{c.suspendedUntil ? ` · until ${date(c.suspendedUntil)}` : ''}</small>}
              {c.authorityReport?.at && <small className="emp-muted">Reported to {c.authorityReport.authority} on {date(c.authorityReport.at)}{c.authorityReport.note ? ` · ${c.authorityReport.note}` : ''}</small>}
              <div className="emp-actions">
                <button type="button" className="btn" onClick={() => addEvidence(c)}>Add evidence</button>
                {c.status === 'open' && <>
                  <button type="button" className="btn btn-primary" onClick={() => decide(c, 'next')}>Next step: {NEXT[c.employer?.employerSanctions?.level || 'none']}</button>
                  <button type="button" className="btn" onClick={() => decide(c, 'warning')}>Warning</button>
                  <button type="button" className="btn" onClick={() => decide(c, 'suspension')}>Suspend</button>
                  <button type="button" className="btn staff-remove" onClick={() => decide(c, 'ban')}>Permanent ban</button>
                  <button type="button" className="btn" onClick={() => decide(c, 'dismiss')}>Dismiss</button>
                </>}
                {c.status === 'actioned' && !c.authorityReport?.at && <button type="button" className="btn" onClick={() => authority(c)}>Report to authority</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function AdminReviewQueue({ onFlash }) {
  const [rows, setRows] = useState(null), [ai, setAi] = useState({});
  function load() { apiRequest('/employer-trust/admin/reviews').then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(r, status) {
    const note = await showPrompt(status === 'published' ? 'Note (optional).' : 'Why is it hidden? The reviewer is told and may appeal once.', { title: status === 'published' ? 'Publish review' : 'Hide review', placeholder: 'Note', required: status === 'hidden' });
    if (note === null || (status === 'hidden' && !note)) return;
    try { await apiRequest(`/employer-trust/admin/reviews/${r._id}`, { method: 'PATCH', body: { status, note } }); onFlash('Saved.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function appeal(r, upheld) {
    const note = await showPrompt('Note for the person who appealed.', { title: upheld ? 'Accept appeal' : 'Reject appeal', placeholder: 'Note' });
    if (note === null) return;
    try { await apiRequest(`/employer-trust/admin/reviews/${r._id}/appeal`, { method: 'PATCH', body: { upheld, note } }); onFlash('Appeal decided.', 'success'); load(); } catch (e) { onFlash(e.message); }
  }
  async function aiCheck(r) {
    try { const res = await apiRequest(`/employer-trust/admin/reviews/${r._id}/ai-check`, { method: 'POST' }); setAi({ ...ai, [r._id]: res }); } catch (e) { onFlash(e.message); }
  }
  return (
    <Section title="Review moderation" text="Held reviews (automatic fake-review checks), reviews an employer reported, and appeals. “AI check” uses your own AI provider and only advises.">
      {rows === null ? <Empty>Loading…</Empty> : !rows.length ? <Empty>Nothing to moderate.</Empty> : (
        <div className="emp-cards emp-cards-wide">
          {rows.map((r) => {
            const check = ai[r._id] || (r.aiCheck?.at ? r.aiCheck : null);
            return (
              <div key={r._id} className="emp-card">
                <div className="emp-card-top"><div><strong>{'★'.repeat(r.rating)} {r.title} · {r.employer?.fullName}</strong><small className="emp-muted emp-block">By {r.reviewer?.fullName} ({r.reviewer?.email}) · {r.employment?.job?.title} · worked from {date(r.employment?.startDate)} · employment {r.employment?.status}</small></div>
                  <Chip tone={r.appeal?.status === 'pending' ? 'warn' : r.report?.open ? 'bad' : 'warn'}>{r.appeal?.status === 'pending' ? `Appeal by ${r.appeal.by}` : r.report?.open ? 'Reported by employer' : 'Held'}</Chip></div>
                <p className="emp-text">{r.comment}</p>
                {r.flags?.length > 0 && <div className="emp-chips">{r.flags.map((f) => <Chip key={f.code} tone="warn">{f.label}</Chip>)}</div>}
                {r.evidenceNote && <small className="emp-muted">Reviewer evidence: {r.evidenceNote}</small>}
                {r.report?.open && <small className="emp-muted">Employer says: {r.report.reason}</small>}
                {r.appeal?.status === 'pending' && <small className="emp-muted">Appeal: {r.appeal.text}</small>}
                {check && <small className="emp-muted">AI: {check.verdict} · {check.reason}</small>}
                <div className="emp-actions">
                  <button type="button" className="btn" onClick={() => aiCheck(r)}>AI check</button>
                  {r.appeal?.status === 'pending'
                    ? <><button type="button" className="btn btn-primary" onClick={() => appeal(r, true)}>Accept appeal</button><button type="button" className="btn staff-remove" onClick={() => appeal(r, false)}>Reject appeal</button></>
                    : <><button type="button" className="btn btn-primary" onClick={() => decide(r, 'published')}>Publish / keep</button><button type="button" className="btn staff-remove" onClick={() => decide(r, 'hidden')}>Hide</button></>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function AdminPackages({ onFlash, isSuperAdmin }) {
  const [cfg, setCfg] = useState(null);
  useEffect(() => { apiRequest('/employer-packages').then(setCfg).catch(() => {}); }, []);
  if (!cfg) return <Section title="Packages & prices"><Empty>Loading…</Empty></Section>;
  const setPkg = (k, field, v) => setCfg({ ...cfg, packages: { ...cfg.packages, [k]: { ...cfg.packages[k], [field]: v } } });
  async function save(e) {
    e.preventDefault();
    const packages = Object.fromEntries(Object.entries(cfg.packages).map(([k, p]) => [k, { price: Number(p.price), days: Number(p.days), ...(p.jobLimit != null ? { jobLimit: Number(p.jobLimit) } : {}), ...(p.credits != null ? { credits: Number(p.credits) } : {}) }]));
    try { setCfg(await apiRequest('/employer-packages/admin/config', { method: 'PATCH', body: { taxPercent: Number(cfg.taxPercent), freeActiveJobs: Number(cfg.freeActiveJobs), packages } })); onFlash('Package prices saved.', 'success'); } catch (err) { onFlash(err.message); }
  }
  return (
    <Section title="Packages & prices" text={isSuperAdmin ? 'Employers pay these by bank transfer. Featured Job has its own fee under Job Review.' : 'Only the Super Admin can change these.'}>
      <form className="emp-form" onSubmit={save}>
        <div className="emp-grid4">
          <label className="hiring-field"><span>Tax %</span><input className="form-input" type="number" min="0" max="50" step="0.5" disabled={!isSuperAdmin} value={cfg.taxPercent} onChange={(e) => setCfg({ ...cfg, taxPercent: e.target.value })} /></label>
          <label className="hiring-field"><span>Free live jobs (0 = no limit)</span><input className="form-input" type="number" min="0" disabled={!isSuperAdmin} value={cfg.freeActiveJobs} onChange={(e) => setCfg({ ...cfg, freeActiveJobs: e.target.value })} /></label>
        </div>
        <div className="emp-cards">
          {Object.values(cfg.packages).map((p) => (
            <div key={p.key} className="emp-card">
              <strong>{p.label}</strong>
              <div className="emp-grid2">
                <label className="hiring-field"><span>Price ({cfg.currency})</span><input className="form-input" type="number" min="0" disabled={!isSuperAdmin} value={p.price} onChange={(e) => setPkg(p.key, 'price', e.target.value)} /></label>
                <label className="hiring-field"><span>Days</span><input className="form-input" type="number" min="0" max="365" disabled={!isSuperAdmin} value={p.days} onChange={(e) => setPkg(p.key, 'days', e.target.value)} /></label>
                {p.jobLimit != null && <label className="hiring-field"><span>Live-job limit</span><input className="form-input" type="number" min="1" disabled={!isSuperAdmin} value={p.jobLimit} onChange={(e) => setPkg(p.key, 'jobLimit', e.target.value)} /></label>}
                {p.credits != null && <label className="hiring-field"><span>Featured credits</span><input className="form-input" type="number" min="1" disabled={!isSuperAdmin} value={p.credits} onChange={(e) => setPkg(p.key, 'credits', e.target.value)} /></label>}
              </div>
            </div>
          ))}
        </div>
        {isSuperAdmin && <div className="emp-actions"><button type="submit" className="btn btn-primary">Save prices</button></div>}
      </form>
    </Section>
  );
}

// ---------------------------------------------------------------- Review from My applications
// Which applications can be reviewed (joined an employer's job) or already have a review.
export function useCompanyReviewLookup() {
  const [map, setMap] = useState(new Map());
  function load() {
    Promise.all([apiRequest('/employer-trust/reviews/reviewable').catch(() => []), apiRequest('/employer-trust/reviews/mine').catch(() => [])]).then(([open, mine]) => {
      const m = new Map();
      open.forEach((e) => m.set(String(e.application), { kind: 'reviewable', employment: e }));
      mine.forEach((r) => r.employment?.application && m.set(String(r.employment.application), { kind: 'reviewed', review: r }));
      setMap(m);
    });
  }
  useEffect(load, []);
  return [map, load];
}

const REVIEW_STATE = { published: ['good', 'Review published'], pending: ['warn', 'Review: CareerZ is checking'], hidden: ['bad', 'Review hidden'] };

export function ReviewCompanyButton({ item, onFlash, onDone }) {
  const [form, setForm] = useState(null), [busy, setBusy] = useState(false);
  if (!item) return null;
  if (item.kind === 'reviewed') { const s = REVIEW_STATE[item.review.status] || ['', item.review.status]; return <Chip tone={s[0]}>{s[1]}</Chip>; }
  const e = item.employment;
  async function submit(ev) {
    ev.preventDefault();
    setBusy(true);
    try {
      const r = await apiRequest('/employer-trust/reviews', { method: 'POST', body: { employment: e._id, rating: Number(form.rating), title: form.title, comment: form.comment, evidenceNote: form.evidenceNote, salaryOnTime: form.salaryOnTime === '' ? null : form.salaryOnTime === 'yes' } });
      onFlash(r.status === 'published' ? 'Review published.' : 'Review sent. CareerZ checks it before it is published.', 'success');
      setForm(null); onDone?.();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <>
      <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setForm({ rating: '5', title: '', comment: '', salaryOnTime: '', evidenceNote: '' })}>Review company</button>
      {form && (
        <div className="emp-modal" role="dialog" aria-modal="true" aria-label="Review your employer" onClick={(ev) => { if (ev.target === ev.currentTarget) setForm(null); }}>
          <form className="card emp-form emp-modal-card" onSubmit={submit}>
            <div><h3 style={{ margin: 0 }}>Review {e.employer?.fullName}</h3><p className="emp-muted" style={{ margin: '4px 0 0' }}>{e.job?.title} · Your name is never shown; readers see “Verified employee”.</p></div>
            <div className="emp-grid2">
              <label className="hiring-field"><span>Rating</span><select className="form-select" value={form.rating} onChange={(ev) => setForm({ ...form, rating: ev.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} {n}</option>)}</select></label>
              <label className="hiring-field"><span>Salary on time?</span><select className="form-select" value={form.salaryOnTime} onChange={(ev) => setForm({ ...form, salaryOnTime: ev.target.value })}><option value="">Prefer not to say</option><option value="yes">Yes</option><option value="no">No</option></select></label>
            </div>
            <label className="hiring-field"><span>Title</span><input className="form-input" value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} /></label>
            <label className="hiring-field"><span>Your review</span><textarea className="form-input" rows={4} required value={form.comment} onChange={(ev) => setForm({ ...form, comment: ev.target.value })} /></label>
            <label className="hiring-field"><span>Evidence for CareerZ (optional, not public)</span><input className="form-input" value={form.evidenceNote} onChange={(ev) => setForm({ ...form, evidenceNote: ev.target.value })} /></label>
            <div className="emp-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Submit review'}</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div>
          </form>
        </div>
      )}
    </>
  );
}
