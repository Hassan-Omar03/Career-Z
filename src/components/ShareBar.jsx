import { useState } from 'react';
import { FaFacebookF, FaWhatsapp, FaXTwitter, FaLinkedinIn, FaTelegram, FaLink, FaShareNodes } from 'react-icons/fa6';
import '../styles/social.css';

// "Share this" buttons on public pages: WhatsApp, Facebook, X, LinkedIn, Telegram, copy link and
// the phone's own share sheet. Links always point at careerz.pk so the shared card (title, image)
// comes from the page's own SEO.
export default function ShareBar({ title = '', text = '' }) {
  const [copied, setCopied] = useState(false);
  if (typeof window === 'undefined') return null;
  const url = `https://careerz.pk${window.location.pathname}${window.location.search}`;
  const u = encodeURIComponent(url), t = encodeURIComponent(title ? `${title} – CareerZ` : 'CareerZ');
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
  async function native() {
    try { await navigator.share({ title: title || 'CareerZ', text: text || title, url }); } catch { /* closed */ }
  }
  return (
    <div className="share-bar" aria-label="Share this page">
      <span className="share-label">Share</span>
      {links.map(([k, l, Icon, href]) => <a key={k} className={`share-btn ${k}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${l}`} title={`Share on ${l}`}><Icon aria-hidden="true" /></a>)}
      <button type="button" className="share-btn copy" onClick={copy} aria-label="Copy link" title="Copy link"><FaLink aria-hidden="true" /></button>
      {typeof navigator !== 'undefined' && navigator.share && <button type="button" className="share-btn more" onClick={native} aria-label="More ways to share" title="More"><FaShareNodes aria-hidden="true" /></button>}
      {copied && <span className="share-copied" role="status">Link copied</span>}
    </div>
  );
}
