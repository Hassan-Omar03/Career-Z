import { useEffect } from 'react';
import { BASE_KEYWORDS, seoFor, seoForUr } from '../content/seo';

// Head tags for the page in the browser: title, description, keywords, canonical and hreflang,
// Open Graph, Twitter and schema.org data. Fixed pages take their text from content/seo.js (unless
// `custom`), in Urdu on /ur/… addresses; detail pages pass their own. Every page has a share card:
// fixed pages use the one made at build time (/og/<page>.png), others the server's
// (/api/seo/og.png). When the server already rendered rich schema for this exact path
// (seo.service, data-path), it is kept instead of being replaced by the generic one.
const urdu = () => /^\/ur(\/|$)/.test(window.location.pathname);
const slugOf = (path) => (path === '/' ? 'home' : path.slice(1).replace(/\//g, '-'));

// Google AdSense loads only on public pages (PageSeo is never used on the dashboard), so ads never
// reach live classes, exams, chat, wallet or payment screens.
const ADSENSE = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2364552447227705';
function loadAdsense() {
  if (document.querySelector(`script[src="${ADSENSE}"]`)) return;
  const s = document.createElement('script');
  s.async = true; s.src = ADSENSE; s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}

export default function PageSeo({ title, description, path = '/', noindex = false, keywords = [], image, type = 'website', schema, custom = false }) {
  useEffect(() => { if (!noindex) loadAdsense(); }, [noindex]);
  useEffect(() => {
    const origin = (import.meta.env.VITE_PUBLIC_SITE_URL || 'https://careerz.pk').replace(/\/$/, '');
    const ur = urdu();
    const presetEn = custom ? null : seoFor(path);
    const presetUr = custom ? null : seoForUr(path);
    const preset = ur ? presetUr || presetEn : presetEn;
    const name = preset?.title || title;
    const desc = String(preset?.description || description || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const words = [...new Set([...(preset?.keywords || []), ...keywords, ...BASE_KEYWORDS].filter(Boolean))].slice(0, 25);
    const urPath = '/ur' + (path === '/' ? '' : path);
    const url = origin + (ur ? urPath : path);
    const card = presetEn
      ? `${origin}/og/${slugOf(path.split('?')[0])}${ur && presetUr ? '-ur' : ''}.png`
      : `${origin}/api/seo/og.png?path=${encodeURIComponent(ur ? urPath : path)}${ur ? '&lang=ur' : ''}`;
    const img = image && /^https:\/\//.test(image) ? image : card;
    document.title = /^CareerZ/i.test(name) ? name : `${name} | CareerZ.pk`;
    const set = (attr, key, value) => { let el = document.head.querySelector(`meta[${attr}="${key}"]`); if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); } el.content = value || ''; };
    set('name', 'description', desc);
    set('name', 'keywords', words.join(', '));
    set('name', 'robots', noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1');
    for (const [key, value] of Object.entries({ 'og:title': document.title, 'og:description': desc, 'og:url': url, 'og:type': type, 'og:site_name': 'CareerZ.pk', 'og:locale': ur ? 'ur_PK' : 'en_PK', 'og:image': img, 'og:image:alt': name })) set('property', key, value);
    for (const [key, value] of Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': document.title, 'twitter:description': desc, 'twitter:image': img })) set('name', key, value);
    let link = document.head.querySelector('link[rel="canonical"]'); if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = url;
    // English and Urdu versions point at each other (not for fixed pages that only exist in English).
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    if (!noindex && (!presetEn || presetUr)) {
      for (const [lang, href] of [['en', origin + path], ['ur', origin + urPath], ['x-default', origin + path]]) {
        const el = document.createElement('link'); el.rel = 'alternate'; el.hreflang = lang; el.href = href; document.head.appendChild(el);
      }
    }
    let el = document.getElementById('page-schema');
    if (el && el.dataset.path === path && !schema) return undefined; // the server's richer schema for this page
    if (!el) { el = document.createElement('script'); el.id = 'page-schema'; el.type = 'application/ld+json'; document.head.appendChild(el); }
    el.dataset.path = path;
    const crumbs = { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin + (ur ? '/ur' : '/') }, ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name, item: url }])] };
    el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [schema || { '@type': 'WebPage', name, description: desc, url, inLanguage: ur ? 'ur-PK' : 'en-PK', isPartOf: { '@id': 'https://careerz.pk/#website' } }, crumbs] });
    return () => { document.getElementById('page-schema')?.remove(); };
  }, [title, description, path, noindex, image, type, custom, JSON.stringify(keywords), JSON.stringify(schema || null)]);
  return null;
}
