import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaFacebookF, FaWhatsapp, FaXTwitter, FaLinkedinIn, FaTelegram, FaLink, FaShareNodes } from 'react-icons/fa6';
import '../styles/social.css';

// Share button on every public page (home, lists, about, blog, visa…): one round button bottom-right
// that opens WhatsApp, Facebook, X, LinkedIn, Telegram and copy link (phones also offer their own
// share sheet). Not on dashboards, sign-in or private pages.
const PRIVATE = /^\/(ur\/)?(dashboard|login|signup|onboarding|complete-profile|social-callback|forgot-password|reset-password|my-orders|application-status|invite|verify-)/;

export default function FloatingShare() {
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false), [copied, setCopied] = useState(false);
  const base = typeof window !== 'undefined' && /^\/ur(\/|$)/.test(window.location.pathname) ? '/ur' : '';
  const full = `${base}${pathname}`;
  if (PRIVATE.test(full)) return null;
  const url = `https://careerz.pk${full === '/ur/' ? '/ur' : full}${search}`;
  const title = typeof document !== 'undefined' ? document.title : 'CareerZ';
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const links = [
    ['whatsapp', 'WhatsApp', FaWhatsapp, `https://wa.me/?text=${t}%20${u}`],
    ['facebook', 'Facebook', FaFacebookF, `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['x', 'X', FaXTwitter, `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ['linkedin', 'LinkedIn', FaLinkedinIn, `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ['telegram', 'Telegram', FaTelegram, `https://t.me/share/url?url=${u}&text=${t}`]
  ];
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt('Copy this link', url); }
  }
  const toggle = () => setOpen(!open);
  return (
    <>
      <nav className={`float-share${open ? ' open' : ''}`} aria-label="Share this page">
        {links.map(([k, l, Icon, href]) => <a key={k} className={`share-btn ${k}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${l}`} title={`Share on ${l}`}><Icon aria-hidden="true" /></a>)}
        <button type="button" className="share-btn copy" onClick={copy} aria-label="Copy link" title={copied ? 'Link copied' : 'Copy link'}><FaLink aria-hidden="true" /></button>
        {copied && <span className="float-share-copied" role="status">Copied</span>}
      </nav>
      <button type="button" className="float-share-phone" onClick={toggle} aria-label="Share this page" aria-expanded={open} title="Share"><FaShareNodes aria-hidden="true" /></button>
    </>
  );
}
