import PageSeo from '../components/PageSeo';
import SiteFooter from '../components/SiteFooter';
import { FaGraduationCap, FaUsers, FaChalkboardUser, FaSchool, FaHandshake, FaHeart, FaStore, FaArrowLeft } from 'react-icons/fa6';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';

// Account kinds that change which documents and profile fields are mandatory.
const SUBTYPES = {
  agent: [['individual', 'Individual agent'], ['agency', 'Registered agency']],
  donor: [['individual', 'Individual donor'], ['organization', 'Organization']],
  marketplace: [['individual', 'Individual seller'], ['business', 'Business']]
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTRY_CITY = {
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  Pakistan: ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi'],
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  Germany: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  Egypt: ['Cairo', 'Alexandria', 'Giza', 'Luxor'],
  Nigeria: ['Lagos', 'Abuja', 'Ibadan', 'Kano'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu'],
  China: ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou'],
  Japan: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya'],
  Singapore: ['Singapore'],
  Malaysia: ['Kuala Lumpur', 'Penang', 'Johor Bahru'],
  Indonesia: ['Jakarta', 'Surabaya', 'Bandung'],
  Brazil: ['São Paulo', 'Rio de Janeiro', 'Brasília'],
  Turkey: ['Istanbul', 'Ankara', 'Izmir']
};

const ROLE_OPTIONS = [
  { value: 'student', icon: FaGraduationCap, label: 'Student' },
  { value: 'parent', icon: FaUsers, label: 'Parent' },
  { value: 'teacher', icon: FaChalkboardUser, label: 'Teacher' },
  { value: 'institute', icon: FaSchool, label: 'Institute' },
  { value: 'agent', icon: FaHandshake, label: 'Agent' },
  { value: 'donor', icon: FaHeart, label: 'Donor' },
  { value: 'marketplace', icon: FaStore, label: 'Marketplace' }
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    accountType: 'student', subtype: '', country: '', city: ''
  });
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password || form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword || form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    if (!terms || !privacy) next.terms = 'Please accept both the Terms & Conditions and the Privacy Policy to continue.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        country: form.country || undefined,
        accountType: form.accountType,
        subtype: SUBTYPES[form.accountType] ? (form.subtype || SUBTYPES[form.accountType][0][0]) : undefined
      });

      setSuccess(true);
      // Next step: upload the mandatory documents for admin verification.
      setTimeout(() => navigate('/onboarding'), 1200);
    } catch (err) {
      setServerError(err.message || 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  const cities = COUNTRY_CITY[form.country] || [];

  return (
    <>
      <PageSeo title="Create account" description="Secure CareerZ account access" path="/signup" noindex/><AuthNavbar />
      <section className="auth-shell">
        <div className="auth-wrap auth-wrap-wide">
          <Link to="/" className="auth-back flex items-center" style={{ gap: 5 }}><FaArrowLeft aria-hidden="true" /> Back to home</Link>

          <div className="auth-card reveal in">
            <div className="auth-head">
              <div className="eyebrow">Join CareerZ</div>
              <h1>Create your account</h1>
              <p>One account for the entire CareerZ ecosystem — personalize it below.</p>
            </div>

            {success && (
              <div className="auth-success show">
                <span className="dot"></span>
                <span>Account created. Next, upload your verification documents.</span>
              </div>
            )}
            {serverError && (
              <div className="auth-success show" style={{ background: 'var(--rose)', color: '#fff' }}>
                <span>{serverError}</span>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="signup-name">Full name</label>
                <input
                  className="form-input" type="text" id="signup-name" placeholder="Your full name" autoComplete="name"
                  value={form.fullName} onChange={(e) => update('fullName', e.target.value)}
                />
                {errors.fullName && <div className="form-error show">{errors.fullName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email address</label>
                <input
                  className="form-input" type="email" id="signup-email" placeholder="you@example.com" autoComplete="email"
                  value={form.email} onChange={(e) => update('email', e.target.value)}
                />
                {errors.email && <div className="form-error show">{errors.email}</div>}
              </div>

              <div className="form-row-split">
                <PasswordField
                  id="signup-password" label="Password" placeholder="Create a password" autoComplete="new-password"
                  value={form.password} onChange={(e) => update('password', e.target.value)}
                  error={errors.password} showStrength
                />
                <PasswordField
                  id="signup-confirm" label="Confirm password" placeholder="Re-enter your password" autoComplete="new-password"
                  value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                />
              </div>

              <fieldset className="form-group signup-role-group" aria-describedby="account-type-hint">
                <legend>Account type</legend>
                <p id="account-type-hint" className="form-hint" style={{ margin: '0 0 12px' }}>
                  Choose how you'll use CareerZ. Every account is verified: after signing up you upload the required documents, our team approves them, and then you complete your profile.
                </p>
                <div className="auth-role-grid">
                  {ROLE_OPTIONS.map((role) => (
                    <label key={role.value} className={`role-option${form.accountType === role.value ? ' active' : ''}`}>
                      <span className="role-icon"><role.icon aria-hidden="true" /></span>
                      <span className="role-label">{role.label}</span>
                      <input
                        type="radio" name="accountType" value={role.value}
                        checked={form.accountType === role.value}
                        onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value, subtype: '' }))}
                      />
                    </label>
                  ))}
                </div>
                {SUBTYPES[form.accountType] && (
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label htmlFor="signup-subtype">Account kind</label>
                    <select className="form-select" id="signup-subtype" value={form.subtype || SUBTYPES[form.accountType][0][0]} onChange={(e) => update('subtype', e.target.value)}>
                      {SUBTYPES[form.accountType].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                )}
              </fieldset>

              <div className="form-row-split">
                <div className="form-group">
                  <label htmlFor="signup-country">Country</label>
                  <select
                    className="form-select" id="signup-country"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, city: '' }))}
                  >
                    <option value="">Select Country</option>
                    {Object.keys(COUNTRY_CITY).sort().map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="signup-city">City</label>
                  <select
                    className="form-select" id="signup-city" disabled={cities.length === 0}
                    value={form.city} onChange={(e) => update('city', e.target.value)}
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="signup-consents">
                <label className="form-check">
                  <input type="checkbox" id="signup-terms" name="terms" required aria-invalid={Boolean(errors.terms && !terms)} aria-describedby={errors.terms && !terms ? "consent-error" : undefined} checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                  <span>I agree to the <a href="/terms">Terms &amp; Conditions</a></span>
                </label>
                <label className="form-check">
                  <input type="checkbox" id="signup-privacy" name="privacy" required aria-invalid={Boolean(errors.terms && !privacy)} aria-describedby={errors.terms && !privacy ? "consent-error" : undefined} checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
                  <span>I agree to the <a href="/privacy">Privacy Policy</a></span>
                </label>
                {errors.terms && (!terms || !privacy) && <div id="consent-error" role="alert" className="form-error show">{errors.terms}</div>}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="auth-foot">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </section><SiteFooter />
    </>
  );
}
