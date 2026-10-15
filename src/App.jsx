import SocialCallback from './pages/SocialCallback';
import PublicPage from './pages/PublicPage';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import VerifyStudentId from './pages/VerifyStudentId';
import PublicPortfolio from './pages/PublicPortfolio';
import TeacherPortfolio from './pages/TeacherPortfolio';
import SiteAssistant from './components/SiteAssistant';
import { ListingPage, JobDetail, ScholarshipDetail, InstituteDetail, ProductDetail, DonorDetail, CourseDetail } from './pages/Discover';
import { takeIntent } from './utils/continueIntent';
import VerifyFeeReceipt from './pages/VerifyFeeReceipt';
import InstitutionPublic from './pages/InstitutionPublic';
import AccountVerification from './pages/AccountVerification';
import CompleteProfile from './pages/CompleteProfile';
import { useAuth } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';

// gcuf.careerz.pk (an institution subdomain) opens that institution's public page.
function subdomainOf(hostname) {
  const match = /^([a-z0-9-]+)\.careerz\.pk$/i.exec(hostname || '');
  return match && !['www', 'app', 'api'].includes(match[1].toLowerCase()) ? match[1].toLowerCase() : null;
}

function PublicPageBlog() { return <PublicPage />; }

// The homepage AI assistant appears on public pages only (not inside dashboards or sign-up flows).
function PublicAssistant() {
  const { pathname } = useLocation();
  if (/^\/(dashboard|onboarding|complete-profile|login|signup|social-callback|reset-password|forgot-password)/.test(pathname)) return null;
  return <SiteAssistant />;
}

function HomeOrInstitution() {
  const sub = subdomainOf(window.location.hostname);
  return sub ? <Navigate to={`/i/${sub}`} replace /> : <Home />;
}

// A listing the visitor tried to act on before signing in (see utils/continueIntent.js): once the
// account can act, open it instead of the dashboard, exactly once.
function ContinueOrDashboard({ children }) {
  const [target] = useState(() => takeIntent()?.path || null);
  return target ? <Navigate to={target} replace /> : children;
}

function SignedInRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// The dashboard opens only when the server says the account is verified and its profile complete;
// the API enforces the same gate, this just sends the user to the page they need.
function ProtectedRoute({ children }) {
  const { user, loading, accountStatus, refreshAccountStatus } = useAuth();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (user && !accountStatus && !loading) refreshAccountStatus().then((s) => setFailed(!s));
  }, [user, accountStatus, loading, refreshAccountStatus]);
  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!accountStatus) {
    return (
      <div style={{ padding: 40 }}>
        {failed ? <>Could not check your account status. <button type="button" className="btn btn-outline" onClick={() => { setFailed(false); refreshAccountStatus().then((s) => setFailed(!s)); }}>Retry</button></> : 'Loading…'}
      </div>
    );
  }
  if (accountStatus.state === 'profile_incomplete') return <Navigate to="/complete-profile" replace />;
  if (accountStatus.state !== 'ok') return <Navigate to="/onboarding" replace />;
  return <ContinueOrDashboard>{children}</ContinueOrDashboard>;
}

export default function App() {
  return (
    <>
    <PublicAssistant />
    <Routes>
      <Route path="/" element={<HomeOrInstitution />} />
      <Route path="/social-callback" element={<SocialCallback />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />
      <Route path="/verify-student-id/:code" element={<VerifyStudentId />} />
      <Route path="/verify-fee-receipt/:code" element={<VerifyFeeReceipt />} />
      <Route path="/portfolio/:userId" element={<PublicPortfolio />} />
      <Route path="/teacher/:teacherId" element={<TeacherPortfolio />} />
      <Route path="/i/:subdomain" element={<InstitutionPublic />} />
      <Route path="/i/:subdomain/:page" element={<InstitutionPublic />} />
      <Route path="/onboarding" element={<SignedInRoute><AccountVerification /></SignedInRoute>} />
      <Route path="/complete-profile" element={<SignedInRoute><CompleteProfile /></SignedInRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RealtimeProvider>
              <Dashboard />
            </RealtimeProvider>
          </ProtectedRoute>
        }
      />
      <Route path="/blog/:postSlug" element={<PublicPageBlog />} />
      <Route path="/courses" element={<ListingPage kind="courses" />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/jobs" element={<ListingPage kind="jobs" />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/scholarships" element={<ListingPage kind="scholarships" />} />
      <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
      <Route path="/institutes" element={<ListingPage kind="institutes" />} />
      <Route path="/institutes/:id" element={<InstituteDetail />} />
      <Route path="/institutions" element={<Navigate to="/institutes" replace />} />
      <Route path="/marketplace" element={<ListingPage kind="marketplace" />} />
      <Route path="/marketplace/:id" element={<ProductDetail />} />
      <Route path="/donors" element={<ListingPage kind="donors" />} />
      <Route path="/donors/:id" element={<DonorDetail />} />
      <Route path="/:slug" element={<PublicPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
