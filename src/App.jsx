import PublicPage from './pages/PublicPage';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import VerifyStudentId from './pages/VerifyStudentId';
import PublicPortfolio from './pages/PublicPortfolio';
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

function HomeOrInstitution() {
  const sub = subdomainOf(window.location.hostname);
  return sub ? <Navigate to={`/i/${sub}`} replace /> : <Home />;
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
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeOrInstitution />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-certificate/:code" element={<VerifyCertificate />} />
      <Route path="/verify-student-id/:code" element={<VerifyStudentId />} />
      <Route path="/verify-fee-receipt/:code" element={<VerifyFeeReceipt />} />
      <Route path="/portfolio/:userId" element={<PublicPortfolio />} />
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
      <Route path="/:slug" element={<PublicPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
