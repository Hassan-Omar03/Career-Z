import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { CvDownload, STAGE_LABEL } from '../dashboard/ApplicantTools';
import { OfferForm, OfferLetterForm, OfferSummary } from '../dashboard/OfferTools';
import InterviewJoin from '../dashboard/InterviewJoin';
import { day } from './files';
import { showPrompt } from '../../utils/appDialog';

// Institute side of an agent's job: the candidates the agent recommends. The institute makes the
// offer and the offer letter here; both go to the agent, who forwards them to the candidate.
export default function AgentCandidates({ institution, onFlash }) {
  const [list, setList] = useState(null), [open, setOpen] = useState(null);
  const load = () => apiRequest(`/recruitment/candidates?institution=${institution._id}`).then(setList).catch((e) => { setList([]); onFlash(e.message); });
  useEffect(() => { load(); }, [institution._id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!list) return <p role="status">Loading…</p>;
  if (!list.length) return <p className="admin-notice">Applicants for the jobs your agent posts appear here. You choose which ones the agent may interview.</p>;
  async function decide(c, decision) {
    const text = { reject: [`Turn down ${c.applicant?.fullName}? Add a reason (optional).`, 'Not selected', 'Turn down'], direct: [`Select ${c.applicant?.fullName} without an interview? You make the offer next. Note for the agent (optional).`, 'Select', 'Select'], interview: [`Send ${c.applicant?.fullName} to interview? The agent interviews them. Note for the agent (optional).`, 'Select for interview', 'Select for interview'] }[decision];
    const note = await showPrompt(text[0], { title: text[1], confirmLabel: text[2] });
    if (note === null) return;
    try { await apiRequest(`/recruitment/candidates/${c._id}/select`, { method: 'POST', body: { decision, note } }); onFlash(decision === 'reject' ? 'Turned down. The agent and candidate were told.' : decision === 'direct' ? 'Selected. Now make the offer.' : 'Sent to interview. The agent was told.', 'success'); load(); if (decision === 'direct') setOpen(c._id); } catch (e) { onFlash(e.message); }
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p className="text-sm" style={{ margin: 0, color: 'var(--ink-soft)', maxWidth: 760 }}>Applicants for the jobs your agent posts. Select the ones the agent should interview; the agent works only with those. Your offer and offer letter go to the agent, who forwards them to the candidate.</p>
      {list.map((c) => {
        const e = c.employment;
        const application = { _id: c._id, applicant: c.applicant, employment: e, resumeSnapshot: c.resumeSnapshot, status: c.status };
        const forwarded = e?.offer?.forwardedAt;
        return (
          <article key={c._id} className="card" style={{ padding: 16, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div className="text-sm" style={{ display: 'grid', gap: 3 }}>
                <strong>{c.applicant?.fullName} · {c.job?.title}</strong>
                <span style={{ color: 'var(--ink-soft)' }}>Through {c.agent || 'your agent'} · applied {day(c.createdAt)} · stage {STAGE_LABEL[c.status] || c.status}</span>
                {c.offerRequest?.at && <span>Agent requested an offer on {day(c.offerRequest.at)}{c.offerRequest.note ? `: “${c.offerRequest.note}”` : ''}</span>}
                <span><CvDownload application={application} onFlash={onFlash} /></span>
                {c.nextInterview && <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{c.nextInterview.round === 'final_interview' ? 'Final interview' : 'Interview'}: {new Date(c.nextInterview.scheduledDate).toLocaleString()} <InterviewJoin interview={{ ...c.nextInterview, job: c.job }} /></span>}
              </div>
              <div style={{ display: 'grid', gap: 6, minWidth: 240 }}>
                {c.status === 'rejected' ? <small style={{ color: 'var(--rose)' }}>Not selected</small>
                  : !c.institutionSelection?.at ? <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => decide(c, 'direct')}>Select</button>
                    <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => decide(c, 'interview')}>Select for interview</button>
                    <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => decide(c, 'reject')}>Not selected</button>
                  </div>
                  : <small style={{ color: 'var(--emerald)' }}>{c.institutionSelection.direct ? `Selected ${day(c.institutionSelection.at)} (no interview): make the offer` : `Sent to interview ${day(c.institutionSelection.at)}`}</small>}
                {c.institutionSelection?.at && <OfferSummary employment={e} />}
                {e?.offer?.sentAt && <small style={{ color: forwarded ? 'var(--emerald)' : 'var(--gold)' }}>{forwarded ? 'Forwarded to the candidate by the agent' : 'With the agent, not yet forwarded'}</small>}
                {c.institutionSelection?.at && !['hired', 'completed', 'rejected', 'withdrawn'].includes(c.status) && (open === c._id
                  ? <OfferForm application={application} job={c.job} onFlash={onFlash} onSaved={() => { setOpen(null); load(); }} onCancel={() => setOpen(null)} />
                  : (!e || ['offered', 'declined'].includes(e.status)) && <button type="button" className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(c._id)}>{!e ? 'Make offer' : e.status === 'declined' ? 'Make a new offer' : 'Revise offer'}</button>)}
                {c.institutionSelection?.at && e && ['offered', 'accepted', 'active'].includes(e.status) && <OfferLetterForm key={`${c._id}-${e.offerLetter?.sentAt || ''}`} application={application} job={c.job} onFlash={onFlash} onSaved={load} />}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
