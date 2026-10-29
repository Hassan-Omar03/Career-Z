import { useState } from 'react';
import { showPrompt } from '../../utils/appDialog';

// Institute–Employer partnership MoU: the institute gives students, the employer gives them jobs.
// The requesting side signs when it asks; the other side signs when it accepts.

export async function askMouSignature(otherSide) {
  const name = await showPrompt(`You are signing a partnership MoU with ${otherSide}: the institute shares its students, the employer shares genuine jobs and internships, and no student pays any fee. Type your full name to sign.`, { title: 'Sign the partnership MoU', placeholder: 'Your full name', confirmLabel: 'Sign', required: true });
  return name && name.trim().length >= 3 ? name.trim() : null;
}

const when = (d) => (d ? new Date(d).toLocaleDateString() : '');

export function PartnerStats({ p }) {
  if (p.status !== 'active' && !p.stats?.referred) return null;
  return (
    <dl className="mou-stats">
      <div><dt>Open jobs shared</dt><dd>{p.openJobs ?? 0}</dd></div>
      <div><dt>Students referred</dt><dd>{p.stats?.referred ?? 0}</dd></div>
      <div><dt>Applied</dt><dd>{p.stats?.applied ?? 0}</dd></div>
      <div><dt>Hired</dt><dd>{p.stats?.hired ?? 0}</dd></div>
    </dl>
  );
}

export function MouButton({ p }) {
  const [open, setOpen] = useState(false);
  if (!p.mou?.requesterSign?.name) return null;
  const institute = p.institution?.name || 'The institute';
  const employer = p.employer?.companyName || p.employer?.fullName || 'The employer';
  const requester = p.requestedSide === 'institution' ? institute : employer;
  const responder = p.requestedSide === 'institution' ? employer : institute;
  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>View MoU</button>
      {open && (
        <div className="mou-modal" role="dialog" aria-modal="true" aria-label="Partnership MoU" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <article className="card mou-paper">
            <p className="mou-kicker">CareerZ partnership</p>
            <h3>Memorandum of Understanding</h3>
            <p>Between <strong>{institute}</strong> (the institute) and <strong>{employer}</strong> (the employer).</p>
            <ol>{(p.mouTerms || []).map((t) => <li key={t}>{t}</li>)}</ol>
            {p.message && <p className="mou-note"><strong>Message:</strong> {p.message}</p>}
            <div className="mou-signs">
              <div><span>Signed for {requester}</span><strong>{p.mou.requesterSign.name}</strong><small>{when(p.mou.requesterSign.at)}</small></div>
              <div><span>Signed for {responder}</span>{p.mou.responderSign?.name ? <><strong>{p.mou.responderSign.name}</strong><small>{when(p.mou.responderSign.at)}</small></> : <small>Not signed yet</small>}</div>
            </div>
            <p className="mou-status">Status: {p.status}{p.status === 'ended' && p.respondedAt ? ` on ${when(p.respondedAt)}` : ''}</p>
            <div className="mou-actions"><button type="button" className="btn btn-primary" onClick={() => window.print()}>Print</button><button type="button" className="btn" onClick={() => setOpen(false)}>Close</button></div>
          </article>
        </div>
      )}
    </>
  );
}
