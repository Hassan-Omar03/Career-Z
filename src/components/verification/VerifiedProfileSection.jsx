import { Link } from 'react-router-dom';
import { FaIdCard, FaFolderOpen } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import RoleProfileForm from './RoleProfileForm';
import { StatusBadge } from './VerificationParts';

// "My Profile" for a verified account type: the mandatory profile (editable) plus verification
// status and a link to the private documents. Shown at the top of each workspace's profile tab.
export default function VerifiedProfileSection({ role, onFlash }) {
  const { accountStatus, refreshAccountStatus } = useAuth();
  const roleStatus = accountStatus?.roles?.find((r) => r.role === role);
  if (!roleStatus) return null;
  const others = accountStatus.roles.filter((r) => r.role !== role && !(r.status === 'approved' && r.profileCompleted));
  return (
    <section className="vf-card vf-in-dashboard" aria-labelledby={`my-profile-${role}`}>
      <div className="vf-card-head">
        <div>
          <h2 id={`my-profile-${role}`}><FaIdCard aria-hidden="true" /> My {roleStatus.label} Profile</h2>
          <span className="vf-muted">Required details for your {roleStatus.label.toLowerCase()} account. Changing verified identity details (CNIC, father&apos;s name, date of birth) sends the account for re-verification.</span>
        </div>
        <div className="vf-head-side">
          <StatusBadge status={roleStatus.status} />
          <Link to="/onboarding" className="btn btn-ghost vf-small"><FaFolderOpen aria-hidden="true" /> Verification documents</Link>
        </div>
      </div>
      {others.length > 0 && (
        <p className="vf-banner vf-banner-neutral">
          {others.map((r) => `${r.label}: ${r.status === 'approved' ? 'profile incomplete' : r.status.replaceAll('_', ' ')}`).join(' · ')} — <Link to="/onboarding">manage</Link>
        </p>
      )}
      {roleStatus.status === 'approved'
        ? <RoleProfileForm roleStatus={roleStatus} onFlash={onFlash} onSaved={refreshAccountStatus} completeLabel="Save profile" />
        : <p className="vf-banner vf-banner-warn">Your profile can be edited again after the admin team finishes re-verifying this account.</p>}
    </section>
  );
}
