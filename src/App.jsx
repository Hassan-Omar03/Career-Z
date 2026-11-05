import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import SiteAssistant from './components/SiteAssistant';
import FloatingShare from './components/FloatingShare';
import { takeIntent } from './utils/continueIntent';
import { useAuth } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';

// A deploy deletes the old page files, so a tab opened before it reloads once to get the new ones.
function pageLoader(load) {
  return lazy(() => load().then((page) => { try { sessionStorage.removeItem('cz_page_reload'); } catch { /* storage off */ } return page; }).catch((err) => {
    let reloaded = true;
    try { reloaded = sessionStorage.getItem('cz_page_reload') === '1'; if (!reloaded) sessionStorage.setItem('cz_page_reload', '1'); } catch { /* storage off */ }
    if (reloaded) throw err;
    window.location.reload();
    return new Promise(() => {});
  }));
}
const SocialCallback = pageLoader(() => import('./pages/SocialCallback'));
const PublicPage = pageLoader(() => import('./pages/PublicPage'));
const Login = pageLoader(() => import('./pages/Login'));
const Signup = pageLoader(() => import('./pages/Signup'));
const ForgotPassword = pageLoader(() => import('./pages/ForgotPassword'));
const ResetPassword = pageLoader(() => import('./pages/ResetPassword'));
const Dashboard = pageLoader(() => import('./pages/Dashboard'));
const VerifyCertificate = pageLoader(() => import('./pages/VerifyCertificate'));
const VerifyStudentId = pageLoader(() => import('./pages/VerifyStudentId'));
const PublicPortfolio = pageLoader(() => import('./pages/PublicPortfolio'));
const TeacherPortfolio = pageLoader(() => import('./pages/TeacherPortfolio'));
const ApplicationStatus = pageLoader(() => import('./pages/ApplicationStatus'));
const MyOrders = pageLoader(() => import('./pages/MyOrders'));
const VisaPage = pageLoader(() => import('./pages/VisaPage'));
const InvitePage = pageLoader(() => import('./pages/InvitePage'));
const VerifyFeeReceipt = pageLoader(() => import('./pages/VerifyFeeReceipt'));
const VerifyReceipt = pageLoader(() => import('./pages/VerifyReceipt'));
const VerifyLookup = pageLoader(() => import('./pages/VerifyLookup'));
const FreelanceList = pageLoader(() => import('./pages/Freelance').then((m) => ({ default: m.FreelanceList })));
const FreelanceDetail = pageLoader(() => import('./pages/Freelance').then((m) => ({ default: m.FreelanceDetail })));
const FreelancerProfile = pageLoader(() => import('./pages/Freelance').then((m) => ({ default: m.FreelancerProfile })));
const InstitutionPublic = pageLoader(() => import('./pages/InstitutionPublic'));
const AccountVerification = pageLoader(() => import('./pages/AccountVerification'));
const CompleteProfile = pageLoader(() => import('./pages/CompleteProfile'));
const discover = (name) => pageLoader(() => import('./pages/Discover').then((m) => ({ default: m[name] })));
const ListingPage = discover('ListingPage');
const JobDetail = discover('JobDetail');
const ScholarshipDetail = discover('ScholarshipDetail');
const InstituteDetail = discover('InstituteDetail');
const ProductDetail = discover('ProductDetail');
const DonorDetail = discover('DonorDetail');
const CourseDetail = discover('CourseDetail');

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
  if (user.quickBuyer && !(user.roles || []).length) return <Navigate to="/my-orders" replace />;
  if (accountStatus.state === 'profile_incomplete') return <Navigate to="/complete-profile" replace />;
  if (accountStatus.state !== 'ok') return <Navigate to="/onboarding" replace />;
  return <ContinueOrDashboard>{children}</ContinueOrDashboard>;
}

// Opening a new page (footer links, cards, menus) starts at the top, like a normal website.
// Links to a #section and the back button keep their own position.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    if (window.history.state?.idx !== undefined && window.__czPopNav) { window.__czPopNav = false; return; }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  useEffect(() => {
    const onPop = () => { window.__czPopNav = true; };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return null;
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <FloatingShare />
    <PublicAssistant />
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
    <Routes>
      <Route path="/" element={<HomeOrInstitution />} />
      <Route path="/social-callback" element={<SocialCallback />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-certificate" element={<VerifyLookup title="Certificate Verification" label="Verification ID" placeholder="Enter the Verification ID" hint="The Verification ID is printed on the certificate, under its QR code." path="/verify-certificate" />} />
      <Route path="/verify-student-id" element={<VerifyLookup title="Student ID Verification" label="Student ID number" placeholder="Enter the student ID number" hint="The number is shown on the student's Digital Student ID, next to its QR code." path="/verify-student-id" />} />
      <Route path="/verify-fee-receipt" element={<VerifyLookup title="Fee Receipt Verification" label="Receipt number" placeholder="Enter the receipt number" hint="The number is printed on the fee receipt." path="/verify-fee-receipt" />} />
      <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />
      <Route path="/verify-student-id/:code" element={<VerifyStudentId />} />
      <Route path="/verify-fee-receipt/:code" element={<VerifyFeeReceipt />} />
      <Route path="/verify-receipt/:number" element={<VerifyReceipt />} />
      <Route path="/freelance" element={<FreelanceList />} />
      <Route path="/freelance/:id" element={<FreelanceDetail />} />
      <Route path="/freelancer/:id" element={<FreelancerProfile />} />
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
      <Route path="/application-status" element={<ApplicationStatus />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/visa" element={<VisaPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
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
    </Suspense>
    </>
  );
}
