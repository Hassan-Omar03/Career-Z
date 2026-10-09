import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleProfileForm from '../components/verification/RoleProfileForm';
import { VerificationShell } from './AccountVerification';

// /complete-profile — mandatory once an account type is approved; the dashboard stays locked
// (server-side) until the server accepts the completed profile.
export default function CompleteProfile() {
  const { accountStatus, refreshAccountStatus } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => { refreshAccountStatus(); }, [refreshAccountStatus]);

  if (!accountStatus) return <VerificationShell title="Complete your profile"><p>Loading…</p></VerificationShell>;
  const approved = accountStatus.roles.filter((r) => r.status === 'approved');
  const current = approved.find((r) => r.role === params.get('role')) || approved.find((r) => !r.profileCompleted) || approved[0];

  if (!current) {
    return (
      <VerificationShell title="Complete your profile">
        <p className="vf-banner vf-banner-warn">Your profile can be completed once the admin team approves your account. <Link to="/onboarding">See verification status</Link></p>
      </VerificationShell>
    );
  }

  return (
    <VerificationShell title="Complete your profile" subtitle="These details are required before your dashboard opens. You can save your progress and come back later.">
      {accountStatus.state === 'ok' && <p className="vf-banner vf-banner-ok">Your dashboard is available. <Link className="btn btn-primary vf-small" to="/dashboard">Open dashboard</Link></p>}
      {approved.length > 1 && (
        <div className="vf-tabs" role="tablist">
          {approved.map((r) => (
            <button key={r.role} type="button" role="tab" aria-selected={r.role === current.role} className={r.role === current.role ? 'active' : ''} onClick={() => setParams({ role: r.role })}>
              {r.label} <span className="vf-muted">{r.profilePercent}%</span>
            </button>
          ))}
        </div>
      )}
      <section className="vf-card">
        <div className="vf-card-head"><h2>{current.label} profile</h2></div>
        <RoleProfileForm key={current.role} roleStatus={current} onSaved={async (result) => {
          const status = await refreshAccountStatus();
          if (result.completed && status?.state === 'ok') navigate('/dashboard');
        }} />
      </section>
    </VerificationShell>
  );
}
