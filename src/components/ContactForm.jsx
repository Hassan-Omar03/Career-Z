import { useState } from 'react';
import { apiRequest } from '../api/client';

// Enquiry form on the Contact page (audit point 1): name, email, what it is about and the message are
// required; organisation and phone are optional. Errors show next to each field; the button shows progress.
const TYPES = [['support', 'Help with my account or the website'], ['institution', 'Registering or managing an institute'], ['partnership', 'Partnership'], ['advertising', 'Advertising'], ['media', 'Press and media'], ['other', 'Something else']];
const EMPTY = { name: '', email: '', organization: '', phone: '', enquiryType: '', message: '', website: '' };

export default function ContactForm() {
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, sent: '', error: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (f.name.trim().length < 2) next.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) next.email = 'Enter a valid email address.';
    if (!f.enquiryType) next.enquiryType = 'Choose what your message is about.';
    if (f.message.trim().length < 10) next.message = 'Write your message (at least 10 characters).';
    setErrors(next);
    if (Object.keys(next).length) return;
    setState({ busy: true, sent: '', error: '' });
    try {
      const r = await apiRequest('/public/contact', { method: 'POST', body: f });
      setState({ busy: false, sent: r?.message || 'Thank you. Your message has been sent.', error: '' });
      setF(EMPTY);
    } catch (err) {
      setErrors(err.errors?.fields || {});
      setState({ busy: false, sent: '', error: err.message || 'Your message could not be sent. Please email info@careerz.pk.' });
    }
  }

  const field = (k, label, input, hint) => (
    <label htmlFor={`cf-${k}`} style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
      {input}
      {hint && <small style={{ color: 'var(--ink-soft)' }}>{hint}</small>}
      {errors[k] && <small role="alert" style={{ color: 'var(--rose)' }}>{errors[k]}</small>}
    </label>
  );

  return (
    <section aria-labelledby="contact-form-title" style={{ marginBottom: 28 }}>
      <h2 id="contact-form-title">Send us a message</h2>
      {state.sent ? <p role="status" className="admin-notice">{state.sent}</p> : (
        <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {field('name', 'Your name *', <input id="cf-name" className="form-input" autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />)}
            {field('email', 'Email *', <input id="cf-email" type="email" className="form-input" autoComplete="email" value={f.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} />)}
            {field('organization', 'Organisation (optional)', <input id="cf-organization" className="form-input" autoComplete="organization" value={f.organization} onChange={set('organization')} />)}
            {field('phone', 'Phone (optional)', <input id="cf-phone" type="tel" className="form-input" autoComplete="tel" value={f.phone} onChange={set('phone')} />)}
          </div>
          {field('enquiryType', 'What is it about? *', (
            <select id="cf-enquiryType" className="form-select" value={f.enquiryType} onChange={set('enquiryType')} aria-invalid={Boolean(errors.enquiryType)}>
              <option value="">Choose…</option>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ), 'Questions about admissions, classes or results at a particular institute are answered by that institute.')}
          {field('message', 'Message *', <textarea id="cf-message" className="form-input" rows={5} maxLength={4000} value={f.message} onChange={set('message')} aria-invalid={Boolean(errors.message)} />, 'Please do not include passwords, verification codes or card numbers.')}
          {/* Hidden from people; filled only by spam bots. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
          {state.error && <p role="alert" style={{ color: 'var(--rose)', margin: 0 }}>{state.error}</p>}
          <div><button type="submit" className="btn btn-primary" disabled={state.busy}>{state.busy ? 'Sending…' : 'Send message'}</button></div>
        </form>
      )}
    </section>
  );
}
