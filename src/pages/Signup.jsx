import BrandLogo from '../components/BrandLogo';
import PageSeo from '../components/PageSeo';
import SiteFooter from '../components/SiteFooter';
import { FaGraduationCap, FaUsers, FaChalkboardUser, FaSchool, FaHandshake, FaHeart, FaStore, FaArrowLeft, FaBriefcase } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import PasswordField from '../components/PasswordField';
import { passwordError } from '../utils/passwordPolicy';
import SearchSelect from '../components/SearchSelect';
import { loadCountries, loadCities } from '../utils/geo';
import { useAuth } from '../context/AuthContext';

// Account kinds that change which documents and profile fields are mandatory.
const SUBTYPES = {
  agent: [['individual', 'Individual agent'], ['agency', 'Registered agency']],
  donor: [['individual', 'Individual donor'], ['organization', 'Organization']],
  marketplace: [['individual', 'Individual seller'], ['business', 'Business']],
  employer: [['company', 'Registered company'], ['recruitment_agency', 'Recruitment / visa agency'], ['startup', 'Startup (company documents later)']]
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const ROLE_OPTIONS = [
  { value: 'student', icon: FaGraduationCap, label: 'Student' },
  { value: 'parent', icon: FaUsers, label: 'Parent' },
  { value: 'teacher', icon: FaChalkboardUser, label: 'Teacher' },
  { value: 'institute', icon: FaSchool, label: 'Institute' },
  { value: 'agent', icon: FaHandshake, label: 'Agent' },
  { value: 'donor', icon: FaHeart, label: 'Donor' },
  { value: 'marketplace', icon: FaStore, label: 'Marketplace' },
  { value: 'employer', icon: FaBriefcase, label: 'Employer / Company' }
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ?type=teacher etc. preselects the account (from a homepage "Register as…" card or a listing).
  const requestedType = new URLSearchParams(window.location.search).get('type');
  // ?email=&name= come from a guest application's invite, so they sign up with that same email.
  const invite = new URLSearchParams(window.location.search);
  const [form, setForm] = useState({
    fullName: (invite.get('name') || '').slice(0, 120), email: (invite.get('email') || '').slice(0, 160), password: '', confirmPassword: '',
    parentEmail:'', parentName:'', parentRelationship:'guardian', accountType: ['student', 'parent', 'teacher', 'institute', 'agent', 'donor', 'marketplace', 'employer'].includes(requestedType) ? requestedType : 'student', subtype: '', country: '', city: ''
  });
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => { loadCountries().then(setCountries).catch(() => setServerError('Could not load the country list. Refresh the page.')); }, []);
  useEffect(() => {
    const code = countries.find((c) => c.name === form.country)?.code;
    setCities([]);
    if (!code) return;
    let live = true;
    setCitiesLoading(true);
    loadCities(code).then((list) => { if (live) setCities(list); }).finally(() => { if (live) setCitiesLoading(false); });
    return () => { live = false; };
  }, [form.country, countries]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.';
    if(form.accountType==='student'){if(!form.parentName.trim())next.parentName='Parent / guardian name is required.';if(!['father','mother','guardian'].includes(form.parentRelationship))next.parentRelationship='Choose your relationship.';if(!EMAIL_RE.test(form.parentEmail.trim()))next.parentEmail='Enter your parent / guardian email.';else if(form.parentEmail.trim().toLowerCase()===form.email.trim().toLowerCase())next.parentEmail='Use your parent email, different from your own email.';}
    if (passwordError(form.password)) next.password = passwordError(form.password);
    if (!form.confirmPassword || form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    if (!form.country) next.country = 'Select your country.';
    if (!form.city) next.city = 'Select your city.';
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
        country: form.country,
        city: form.city,
        acceptedTerms: terms && privacy,
        accountType: form.accountType,
        ...(form.accountType==='student'?{parentEmail:form.parentEmail,parentName:form.parentName,parentRelationship:form.parentRelationship}:{}),
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


  return (
    <>
      <PageSeo title="Create account" description="Secure CareerZ account access" path="/signup" noindex/><AuthNavbar />
      <section className="auth-shell">
        <div className="auth-wrap auth-wrap-wide">
          <Link to="/" className="auth-back flex items-center" style={{ gap: 5 }}><FaArrowLeft aria-hidden="true" /> Back to home</Link>

          <div className="auth-card reveal in">
            <div className="auth-form-brand"><BrandLogo /></div>
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

              {form.accountType==='student'&&<fieldset className="form-group"><legend>Parent / guardian details</legend><p className="form-hint">Your enrolled institute will use these details to invite your parent. School records open after account approval and guardian verification.</p><label htmlFor="signup-parent-email">Parent / guardian email *</label><input className="form-input" type="email" id="signup-parent-email" required value={form.parentEmail} onChange={e=>update('parentEmail',e.target.value)} placeholder="parent@example.com"/>{errors.parentEmail&&<div className="form-error show">{errors.parentEmail}</div>}<label htmlFor="signup-parent-name">Parent / guardian name *</label><input className="form-input" id="signup-parent-name" required value={form.parentName} onChange={e=>update('parentName',e.target.value)}/>{errors.parentName&&<div className="form-error show">{errors.parentName}</div>}<label htmlFor="signup-parent-relation">Relationship</label><select className="form-select" id="signup-parent-relation" value={form.parentRelationship} onChange={e=>update('parentRelationship',e.target.value)}>{['father','mother','guardian'].map(v=><option key={v}>{v}</option>)}</select></fieldset>}
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
                <SearchSelect
                  id="signup-country" label="Country" required placeholder="Search country…"
                  value={form.country} options={countries.map((c) => c.name)} loading={!countries.length}
                  onChange={(name) => setForm((f) => ({ ...f, country: name, city: '' }))}
                  error={errors.country && !form.country ? errors.country : ''}
                />
                <SearchSelect
                  id="signup-city" label="City" required allowCustom placeholder={form.country ? 'Search city…' : 'Choose a country first'}
                  value={form.city} options={cities} loading={citiesLoading} disabled={!form.country}
                  onChange={(name) => update('city', name)} emptyText="No matching city — type its name to add it"
                  error={errors.city && !form.city ? (form.country ? errors.city : 'Select your country first, then your city.') : ''}
                />
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
