// FILE: assets/js/auth.js
/* =============================================================
   CAREERZ AI — AUTHENTICATION MODULE SCRIPT
   Powers: login, signup, forgot-password, reset-password pages.
   Self-contained (does not depend on assets/js/app.js, since the
   homepage script targets homepage-only elements like the ticker
   and AI console). Reuses the same design tokens/classes as the
   rest of the platform for a fully consistent look and feel.
================================================================= */

/* =========================================================
   THEME TOGGLE (same behavior as homepage: simple attribute
   flip + icon swap, no persistence — matches existing UX)
========================================================= */
function initThemeToggle(){
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;
  themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  });
}

/* =========================================================
   SHARED VALIDATION HELPERS
========================================================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value){
  return EMAIL_RE.test(String(value || '').trim());
}

function setFieldError(inputEl, errorEl, message){
  if (message){
    inputEl.classList.add('is-error');
    inputEl.classList.remove('is-valid');
    if (errorEl){ errorEl.textContent = message; errorEl.classList.add('show'); }
  } else {
    inputEl.classList.remove('is-error');
    inputEl.classList.add('is-valid');
    if (errorEl){ errorEl.textContent = ''; errorEl.classList.remove('show'); }
  }
}

function clearFieldState(inputEl, errorEl){
  inputEl.classList.remove('is-error', 'is-valid');
  if (errorEl){ errorEl.textContent = ''; errorEl.classList.remove('show'); }
}

/* =========================================================
   SHOW / HIDE PASSWORD
   Attach to any button with [data-toggle-password="inputId"]
========================================================= */
function initPasswordToggles(){
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    const targetId = btn.getAttribute('data-toggle-password');
    const input = document.getElementById(targetId);
    if (!input) return;
    btn.addEventListener('click', () => {
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.textContent = showing ? 'Show' : 'Hide';
      input.focus({ preventScroll: true });
    });
  });
}

/* =========================================================
   PASSWORD STRENGTH INDICATOR
========================================================= */
function scorePassword(pw){
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5);
}

function initPasswordStrength(inputId, barId, labelId){
  const input = document.getElementById(inputId);
  const bar = document.getElementById(barId);
  const label = document.getElementById(labelId);
  if (!input || !bar || !label) return;

  const levels = [
    { min: 0, width: '0%',   color: 'var(--sand-line)', text: '' },
    { min: 1, width: '20%',  color: 'var(--rose)',       text: 'Very weak' },
    { min: 2, width: '40%',  color: 'var(--rose)',       text: 'Weak' },
    { min: 3, width: '65%',  color: 'var(--gold)',       text: 'Fair' },
    { min: 4, width: '85%',  color: 'var(--emerald)',    text: 'Strong' },
    { min: 5, width: '100%', color: 'var(--emerald-bright)', text: 'Very strong' }
  ];

  input.addEventListener('input', () => {
    const score = scorePassword(input.value);
    const level = levels.slice().reverse().find(l => score >= l.min) || levels[0];
    bar.style.width = level.width;
    bar.style.background = level.color;
    label.textContent = input.value ? level.text : '';
  });
}

/* =========================================================
   CONFIRM PASSWORD MATCHING
========================================================= */
function initConfirmPasswordMatch(passwordId, confirmId, errorId){
  const pw = document.getElementById(passwordId);
  const confirm = document.getElementById(confirmId);
  const errorEl = document.getElementById(errorId);
  if (!pw || !confirm) return;

  function check(){
    if (!confirm.value){ clearFieldState(confirm, errorEl); return true; }
    const matches = confirm.value === pw.value;
    setFieldError(confirm, errorEl, matches ? '' : 'Passwords do not match.');
    return matches;
  }

  confirm.addEventListener('input', check);
  pw.addEventListener('input', () => { if (confirm.value) check(); });
  return check;
}

/* =========================================================
   REMEMBER ME (persists only the email, never the password)
========================================================= */
const REMEMBER_KEY = 'careerz_remembered_email';

function initRememberMe(emailInputId, checkboxId){
  const emailInput = document.getElementById(emailInputId);
  const checkbox = document.getElementById(checkboxId);
  if (!emailInput || !checkbox) return;

  const saved = localStorage.getItem(REMEMBER_KEY);
  if (saved){
    emailInput.value = saved;
    checkbox.checked = true;
  }
}

function persistRememberMe(emailInputId, checkboxId){
  const emailInput = document.getElementById(emailInputId);
  const checkbox = document.getElementById(checkboxId);
  if (!emailInput || !checkbox) return;

  if (checkbox.checked){
    localStorage.setItem(REMEMBER_KEY, emailInput.value.trim());
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

/* =========================================================
   ROLE SELECTOR (signup account type)
========================================================= */
function initRoleSelector(){
  const options = document.querySelectorAll('.role-option');
  if (!options.length) return;

  options.forEach(opt => {
    const input = opt.querySelector('input[type="radio"]');
    if (!input) return;
    const sync = () => opt.classList.toggle('active', input.checked);
    input.addEventListener('change', () => {
      options.forEach(o => o.classList.remove('active'));
      sync();
    });
    sync();
  });
}

/* =========================================================
   COUNTRY / CITY (shared demo dataset, consistent with the
   homepage search bar's global coverage)
========================================================= */
const countryCityData = {
  'Saudi Arabia': ['Riyadh','Jeddah','Dammam','Mecca','Medina'],
  'United Arab Emirates': ['Dubai','Abu Dhabi','Sharjah','Ajman'],
  'Pakistan': ['Lahore','Karachi','Islamabad','Faisalabad','Rawalpindi'],
  'India': ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai'],
  'United Kingdom': ['London','Manchester','Birmingham','Edinburgh'],
  'United States': ['New York','Los Angeles','Chicago','Houston'],
  'Canada': ['Toronto','Vancouver','Montreal','Calgary'],
  'Australia': ['Sydney','Melbourne','Brisbane','Perth'],
  'Germany': ['Berlin','Munich','Frankfurt','Hamburg'],
  'France': ['Paris','Lyon','Marseille','Toulouse'],
  'Egypt': ['Cairo','Alexandria','Giza','Luxor'],
  'Nigeria': ['Lagos','Abuja','Ibadan','Kano'],
  'South Africa': ['Johannesburg','Cape Town','Durban','Pretoria'],
  'Kenya': ['Nairobi','Mombasa','Kisumu'],
  'China': ['Beijing','Shanghai','Shenzhen','Guangzhou'],
  'Japan': ['Tokyo','Osaka','Yokohama','Nagoya'],
  'Singapore': ['Singapore'],
  'Malaysia': ['Kuala Lumpur','Penang','Johor Bahru'],
  'Indonesia': ['Jakarta','Surabaya','Bandung'],
  'Brazil': ['São Paulo','Rio de Janeiro','Brasília'],
  'Turkey': ['Istanbul','Ankara','Izmir']
};

function initCountryCity(countrySelectId, citySelectId){
  const countrySelect = document.getElementById(countrySelectId);
  const citySelect = document.getElementById(citySelectId);
  if (!countrySelect || !citySelect) return;

  Object.keys(countryCityData).sort().forEach(country => {
    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });

  countrySelect.addEventListener('change', () => {
    const cities = countryCityData[countrySelect.value] || [];
    citySelect.innerHTML = '<option value="">Select City</option>';
    cities.forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
    citySelect.disabled = cities.length === 0;
  });
}

/* =========================================================
   LOGIN FORM
========================================================= */
function initLoginForm(){
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const emailError = document.getElementById('login-email-error');
  const passwordError = document.getElementById('login-password-error');
  const submitBtn = document.getElementById('login-submit');

  initRememberMe('login-email', 'login-remember');

  emailInput.addEventListener('blur', () => {
    if (!emailInput.value.trim()){ setFieldError(emailInput, emailError, 'Email is required.'); }
    else if (!isValidEmail(emailInput.value)){ setFieldError(emailInput, emailError, 'Enter a valid email address.'); }
    else { setFieldError(emailInput, emailError, ''); }
  });

  passwordInput.addEventListener('blur', () => {
    if (!passwordInput.value){ setFieldError(passwordInput, passwordError, 'Password is required.'); }
    else { setFieldError(passwordInput, passwordError, ''); }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!emailInput.value.trim()){ setFieldError(emailInput, emailError, 'Email is required.'); valid = false; }
    else if (!isValidEmail(emailInput.value)){ setFieldError(emailInput, emailError, 'Enter a valid email address.'); valid = false; }
    else { setFieldError(emailInput, emailError, ''); }

    if (!passwordInput.value){ setFieldError(passwordInput, passwordError, 'Password is required.'); valid = false; }
    else { setFieldError(passwordInput, passwordError, ''); }

    if (!valid) return;

    persistRememberMe('login-email', 'login-remember');

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in…';

    // TODO: replace with real authentication API call.
    setTimeout(() => {
      const successBox = document.getElementById('login-success');
      if (successBox) successBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 900);
  });
}

/* =========================================================
   SIGNUP FORM
========================================================= */
function initSignupForm(){
  const form = document.getElementById('signup-form');
  if (!form) return;

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-confirm');
  const termsInput = document.getElementById('signup-terms');
  const privacyInput = document.getElementById('signup-privacy');

  const nameError = document.getElementById('signup-name-error');
  const emailError = document.getElementById('signup-email-error');
  const passwordError = document.getElementById('signup-password-error');
  const confirmError = document.getElementById('signup-confirm-error');
  const termsError = document.getElementById('signup-terms-error');

  const submitBtn = document.getElementById('signup-submit');

  initPasswordStrength('signup-password', 'signup-strength-bar', 'signup-strength-label');
  const checkConfirmMatch = initConfirmPasswordMatch('signup-password', 'signup-confirm', 'signup-confirm-error');
  initRoleSelector();
  initCountryCity('signup-country', 'signup-city');

  emailInput.addEventListener('blur', () => {
    if (!emailInput.value.trim()){ setFieldError(emailInput, emailError, 'Email is required.'); }
    else if (!isValidEmail(emailInput.value)){ setFieldError(emailInput, emailError, 'Enter a valid email address.'); }
    else { setFieldError(emailInput, emailError, ''); }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!nameInput.value.trim()){ setFieldError(nameInput, nameError, 'Full name is required.'); valid = false; }
    else { setFieldError(nameInput, nameError, ''); }

    if (!emailInput.value.trim()){ setFieldError(emailInput, emailError, 'Email is required.'); valid = false; }
    else if (!isValidEmail(emailInput.value)){ setFieldError(emailInput, emailError, 'Enter a valid email address.'); valid = false; }
    else { setFieldError(emailInput, emailError, ''); }

    if (!passwordInput.value || passwordInput.value.length < 8){
      setFieldError(passwordInput, passwordError, 'Password must be at least 8 characters.'); valid = false;
    } else { setFieldError(passwordInput, passwordError, ''); }

    if (!confirmInput.value || !checkConfirmMatch()){
      setFieldError(confirmInput, confirmError, 'Passwords do not match.'); valid = false;
    }

    const accountTypeChecked = document.querySelector('input[name="accountType"]:checked');
    if (!accountTypeChecked){ valid = false; }

    if (!termsInput.checked || !privacyInput.checked){
      if (termsError){ termsError.classList.add('show'); }
      valid = false;
    } else if (termsError){
      termsError.classList.remove('show');
    }

    if (!valid) return;

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account…';

    // TODO: replace with real registration API call.
    // accountTypeChecked.value personalizes the future dashboard only —
    // it does not grant any verified role. Verification (Phase 2) happens
    // later, inside the dashboard, without needing to redesign this page.
    setTimeout(() => {
      const successBox = document.getElementById('signup-success');
      if (successBox) successBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      form.reset();
      initRoleSelector();
    }, 900);
  });
}

/* =========================================================
   FORGOT PASSWORD FORM
========================================================= */
function initForgotPasswordForm(){
  const form = document.getElementById('forgot-form');
  if (!form) return;

  const emailInput = document.getElementById('forgot-email');
  const emailError = document.getElementById('forgot-email-error');
  const submitBtn = document.getElementById('forgot-submit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!emailInput.value.trim()){ setFieldError(emailInput, emailError, 'Email is required.'); valid = false; }
    else if (!isValidEmail(emailInput.value)){ setFieldError(emailInput, emailError, 'Enter a valid email address.'); valid = false; }
    else { setFieldError(emailInput, emailError, ''); }

    if (!valid) return;

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    // TODO: replace with real password-reset request API call.
    setTimeout(() => {
      const successBox = document.getElementById('forgot-success');
      if (successBox) successBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 900);
  });
}

/* =========================================================
   RESET PASSWORD FORM
========================================================= */
function initResetPasswordForm(){
  const form = document.getElementById('reset-form');
  if (!form) return;

  const passwordInput = document.getElementById('reset-password');
  const confirmInput = document.getElementById('reset-confirm');
  const passwordError = document.getElementById('reset-password-error');
  const confirmError = document.getElementById('reset-confirm-error');
  const submitBtn = document.getElementById('reset-submit');

  initPasswordStrength('reset-password', 'reset-strength-bar', 'reset-strength-label');
  const checkConfirmMatch = initConfirmPasswordMatch('reset-password', 'reset-confirm', 'reset-confirm-error');

  // Reserved for future backend wiring: reads a reset token from the URL
  // (e.g. reset-password.html?token=xyz) without changing this page's UI.
  const resetToken = new URLSearchParams(window.location.search).get('token') || '';
  const tokenField = document.getElementById('reset-token');
  if (tokenField) tokenField.value = resetToken;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (!passwordInput.value || passwordInput.value.length < 8){
      setFieldError(passwordInput, passwordError, 'Password must be at least 8 characters.'); valid = false;
    } else { setFieldError(passwordInput, passwordError, ''); }

    if (!confirmInput.value || !checkConfirmMatch()){
      setFieldError(confirmInput, confirmError, 'Passwords do not match.'); valid = false;
    }

    if (!valid) return;

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating…';

    // TODO: replace with real password-update API call using resetToken.
    setTimeout(() => {
      const successBox = document.getElementById('reset-success');
      if (successBox) successBox.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 900);
  });
}

/* =========================================================
   INIT — runs whichever forms exist on the current page
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initForgotPasswordForm();
  initResetPasswordForm();
});
