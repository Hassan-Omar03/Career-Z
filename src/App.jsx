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
import { useAuth } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';

// gcuf.careerz.pk (an institution subdomain) opens that institution's public page.
function subdomainOf(hostname) {
  const match = /^([a-z0-9-]+)\.careerz\.pk$/i.exec(hostname || '');
  return match && !['www', 'app', 'api'].includes(match[1].toLowerCase()) ? match[1].toLowerCase() : null;
}

function HomeOrInstitution() {
  const sub = subdomainOf(window.location.hostname);
  return sub ? <Navigate to={`/i/${sub}`} replace /> : <Home />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
