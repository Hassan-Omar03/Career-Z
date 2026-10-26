import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { STAGE_LABEL } from '../dashboard/ApplicantTools';
import { ApplicationThread, ViewOfferLetterButton } from '../dashboard/OfferTools';

// On a job page: if the signed-in person already applied, show where their application stands
// (stage, offer, offer letter, messages) instead of the Apply button. Renders `children`
// (the Apply panel) when they have not applied.
export default function AppliedStatus({ jobId, children }) {
  const { user } = useAuth();
  const [app, setApp] = useState(user ? undefined : null);
  useEffect(() => {
    if (!user) { setApp(null); return; }
    apiRequest('/jobs/mine/applications').then((list) => setApp(list.find((a) => (a.job?._id || a.job) === jobId) || null)).catch(() => setApp(null));
  }, [user, jobId]);
  if (app === undefined) return <div className="dp-action" role="status">Checking your application…</div>;
  if (!app) return children;
  const e = app.employment;
  const stage = STAGE_LABEL[app.status] || app.status;
  return (
    <div className="dp-action ok" role="status">
      <strong>You applied for this job on {new Date(app.createdAt).toLocaleDateString()}</strong>
      <p>Current stage: <strong>{stage}</strong>
        {e?.offer?.sentAt && ` · Offer ${e.currency} ${Number(e.salary).toLocaleString()} per ${e.offer.salaryPeriod || 'month'} (${{ offered: 'waiting for your answer', accepted: 'accepted', declined: 'declined', active: 'joined' }[e.status] || e.status})`}
      </p>
      <div className="dc-actions" style={{ flexWrap: 'wrap' }}>
        {e?.offerLetter?.sentAt && <ViewOfferLetterButton employment={e} candidate={user?.fullName} />}
        <Link className="btn" to="/dashboard" state={{ workspace: (user?.roles || []).includes('student') ? 'student' : 'teacher', tab: 'jobs', sub: 'applications' }}>Open My Applications</Link>
        <ApplicationThread applicationId={app._id} count={app.messageCount} />
      </div>
    </div>
  );
}
