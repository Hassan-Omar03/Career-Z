// Static SEO, run after `vite build`. Every fixed public page gets its own HTML file (dist/<path>/
// index.html) in English and, for the main pages, in Urdu (dist/ur/<path>/index.html), each with its
// title, description, keywords, canonical and hreflang links, social tags, its own share card image
// (dist/og/*.png), schema.org data (FAQPage on the FAQ) and a readable text copy, so search engines
// see the page without running JavaScript.
// dist/app.html stays the plain app shell: nginx serves it for app-only routes, and the backend
// (seo.service) fills its <!--seo:head--> / <!--seo:body--> markers for detail pages.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { PUBLIC_PAGES } from '../src/content/publicPages.js';
import { PAGE_SEO, PAGE_SEO_UR, BASE_KEYWORDS } from '../src/content/seo.js';

const require = createRequire(import.meta.url);
const ogCard = require('./og-card.cjs');
const origin = (process.env.VITE_PUBLIC_SITE_URL || 'https://careerz.pk').replace(/\/$/, '');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const shell = fs.readFileSync('dist/index.html', 'utf8');
if (!shell.includes('<!--seo:head-->') || !shell.includes('<!--seo:body-->')) throw new Error('index.html is missing the seo markers');
fs.writeFileSync('dist/app.html', shell);
fs.mkdirSync('dist/og', { recursive: true });

const LISTINGS = ['/jobs', '/scholarships', '/institutes', '/courses', '/marketplace', '/donors', '/visa', '/blog'];
const LABEL = { '/': 'CareerZ', '/jobs': 'Jobs', '/scholarships': 'Scholarships', '/institutes': 'Admissions', '/courses': 'Courses', '/marketplace': 'Marketplace', '/donors': 'Donors', '/visa': 'Visa Center', '/blog': 'Blog', '/faq': 'FAQ' };
const LABEL_UR = { '/': 'CareerZ', '/jobs': 'نوکریاں', '/scholarships': 'اسکالرشپس', '/institutes': 'داخلے', '/courses': 'کورسز', '/marketplace': 'مارکیٹ پلیس', '/donors': 'ڈونرز', '/visa': 'ویزا سینٹر', '/blog': 'بلاگ', '/faq': 'سوالات' };
const content = new Map(PUBLIC_PAGES.map((p) => ['/' + p.slug, p]));
let pages = [...new Set(['/', ...LISTINGS, ...Object.keys(PAGE_SEO), ...PUBLIC_PAGES.map((p) => '/' + p.slug)])]
  .filter((path) => path !== '/institutions') // redirects to /institutes
  .map((path) => {
    const seo = PAGE_SEO[path] || {}, page = content.get(path) || {};
    return { path, title: seo.title || page.title, description: seo.description || page.description, keywords: seo.keywords || [], h1: seo.h1 || page.title || seo.title, text: seo.text || '', content: page.content || '' };
  })
  .filter((p) => p.title && p.description);

// Optional published CMS snapshot (public endpoints, no credentials).
if (process.env.PUBLIC_API_URL) {
  const api = process.env.PUBLIC_API_URL.replace(/\/$/, '');
  const response = await fetch(api + '/pages', { signal: AbortSignal.timeout(15000) });
  if (response.ok) {
    const payload = await response.json();
    for (const record of (Array.isArray(payload) ? payload : payload.data) || []) {
      if (!/^[a-z0-9-]+$/i.test(record.slug)) continue;
      const path = '/' + record.slug, prev = pages.find((p) => p.path === path);
      const page = { path, title: record.seoTitle || prev?.title || record.title, description: record.seoDescription || prev?.description || record.description || record.title, keywords: prev?.keywords || [], h1: record.title, text: prev?.text || '', content: record.content || '' };
      pages = pages.filter((p) => p.path !== path); pages.push(page);
    }
  }
}

const urPath = (path) => '/ur' + (path === '/' ? '' : path);
const slugOf = (path) => (path === '/' ? 'home' : path.slice(1).replace(/\//g, '-'));
// Question / answer pairs from a page's text: a block whose first line ends with "?".
function faqOf(text) {
  const out = [];
  for (const block of String(text || '').replace(/<[^>]*>/g, '').split('\n\n')) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1 && lines[0].endsWith('?')) out.push([lines[0], lines.slice(1).join(' ')]);
    else if (lines.length === 1) for (const m of lines[0].matchAll(/([^.?]+\?)\s+([^?]+?\.)(?=\s+[A-Z]|$)/g)) out.push([m[1].trim(), m[2].trim()]);
  }
  return out;
}
const nav = [['Jobs in Pakistan', '/jobs'], ['Scholarships', '/scholarships'], ['Schools, colleges & universities', '/institutes'], ['Online courses', '/courses'], ['Student marketplace', '/marketplace'], ['Visa Center', '/visa'], ['Blog', '/blog'], ['Donors', '/donors'], ['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq']];
const navUr = [['پاکستان میں نوکریاں', '/jobs'], ['اسکالرشپس', '/scholarships'], ['اسکول، کالج اور یونیورسٹیاں', '/institutes'], ['آن لائن کورسز', '/courses'], ['مارکیٹ پلیس', '/marketplace'], ['ویزا سینٹر', '/visa'], ['بلاگ', '/blog'], ['ہمارے بارے میں', '/about'], ['رابطہ', '/contact'], ['سوالات', '/faq']];

function write(page, lang) {
  const ur = lang === 'ur';
  const t = ur ? { ...page, ...PAGE_SEO_UR[page.path] } : page;
  const own = ur ? urPath(page.path) : page.path;
  const url = origin + own, title = /^CareerZ/i.test(t.title) ? t.title : t.title + ' | CareerZ.pk';
  const hasUr = Boolean(PAGE_SEO_UR[page.path]);
  const words = [...new Set([...(t.keywords || []), ...(ur ? [] : page.keywords), ...BASE_KEYWORDS])];
  const image = `${origin}/og/${slugOf(page.path)}${ur ? '-ur' : ''}.png`;
  fs.writeFileSync(`dist/og/${slugOf(page.path)}${ur ? '-ur' : ''}.png`, ogCard.png({ title: t.h1 || t.title, sub: ur ? 'careerz.pk/ur' : 'careerz.pk', label: (ur ? LABEL_UR : LABEL)[page.path] || 'CareerZ', lang }));
  const main = { '@type': LISTINGS.includes(page.path) ? 'CollectionPage' : page.path === '/about' ? 'AboutPage' : page.path === '/contact' ? 'ContactPage' : page.path === '/faq' ? 'FAQPage' : 'WebPage', name: t.title, description: t.description, url, inLanguage: ur ? 'ur-PK' : 'en-PK', isPartOf: { '@id': origin + '/#website' }, primaryImageOfPage: image };
  if (page.path === '/faq' && !ur) main.mainEntity = faqOf(page.content).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }));
  const crumbs = { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: ur ? 'ہوم' : 'Home', item: origin + (ur ? '/ur' : '/') }, ...(page.path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: t.h1 || t.title, item: url }])] };
  const alternates = hasUr ? `<link rel="alternate" hreflang="en" href="${esc(origin + page.path)}"/><link rel="alternate" hreflang="ur" href="${esc(origin + urPath(page.path))}"/><link rel="alternate" hreflang="x-default" href="${esc(origin + page.path)}"/>` : '';
  const head = `<title>${esc(title)}</title><meta name="description" content="${esc(t.description)}"/><meta name="keywords" content="${esc(words.join(', '))}"/><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"/><link rel="canonical" href="${esc(url)}"/>${alternates}`
    + `<meta property="og:type" content="website"/><meta property="og:site_name" content="CareerZ.pk"/><meta property="og:locale" content="${ur ? 'ur_PK' : 'en_PK'}"/>${hasUr ? `<meta property="og:locale:alternate" content="${ur ? 'en_PK' : 'ur_PK'}"/>` : ''}<meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(t.description)}"/><meta property="og:url" content="${esc(url)}"/><meta property="og:image" content="${image}"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:image:alt" content="${esc(t.h1 || t.title)}"/>`
    + `<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(title)}"/><meta name="twitter:description" content="${esc(t.description)}"/><meta name="twitter:image" content="${image}"/>`
    + '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2364552447227705" crossorigin="anonymous"></script>'
    + `<script id="page-schema" data-path="${esc(page.path)}" type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': [main, crumbs] })}</script>`;
  const blocks = ur ? '' : String(page.content || '').replace(/<[^>]*>/g, '').split('\n\n').filter(Boolean).map((block) => { const lines = block.split('\n'); return lines.length > 1 ? `<h2>${esc(lines.shift())}</h2><p>${esc(lines.join(' '))}</p>` : `<p>${esc(block)}</p>`; }).join('');
  const links = (ur ? navUr : nav).map(([n, p]) => `<a href="${ur ? urPath(p) : p}">${esc(n)}</a>`).join(' · ');
  const body = `<main class="seo-snapshot"><h1>${esc(t.h1 || t.title)}</h1>${t.text ? `<p>${esc(t.text)}</p>` : ''}${blocks}<nav aria-label="${ur ? 'CareerZ دیکھیں' : 'Explore CareerZ'}">${links}</nav></main>`;
  const base = ur ? shell.replace(/<html[^>]*>/, '<html lang="ur" dir="rtl">') : shell;
  const html = base.replace(/<!--seo:head-->[\s\S]*?<!--\/seo:head-->/, `<!--seo:head-->${head}<!--/seo:head-->`).replace(/<!--seo:body-->[\s\S]*?<!--\/seo:body-->/, `<!--seo:body-->${body}<!--/seo:body-->`);
  const dir = 'dist' + (own === '/' ? '' : own);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dir + '/index.html', html);
}
for (const page of pages) { write(page, 'en'); if (PAGE_SEO_UR[page.path]) write(page, 'ur'); }
fs.copyFileSync('dist/og/home.png', 'dist/og/default.png');

// Fallback sitemap of the fixed pages (the full one with every job, course, post… comes from the API).
const priority = (p) => (p === '/' ? '1.0' : LISTINGS.includes(p) ? '0.9' : '0.5');
const entry = (loc, page) => `<url><loc>${esc(origin + loc)}</loc>${PAGE_SEO_UR[page.path] ? `<xhtml:link rel="alternate" hreflang="en" href="${esc(origin + page.path)}"/><xhtml:link rel="alternate" hreflang="ur" href="${esc(origin + urPath(page.path))}"/><xhtml:link rel="alternate" hreflang="x-default" href="${esc(origin + page.path)}"/>` : ''}<changefreq>${LISTINGS.includes(page.path) || page.path === '/' ? 'daily' : 'monthly'}</changefreq><priority>${priority(page.path)}</priority></url>`;
const sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + pages.map((p) => entry(p.path, p) + (PAGE_SEO_UR[p.path] ? entry(urPath(p.path), p) : '')).join('') + '</urlset>';
fs.writeFileSync('dist/sitemap-static.xml', sitemap);
fs.writeFileSync('dist/sitemap.xml', sitemap);
fs.writeFileSync('dist/robots.txt', [
  'User-agent: *', 'Allow: /',
  ...['/dashboard', '/onboarding', '/complete-profile', '/login', '/signup', '/forgot-password', '/reset-password', '/social-callback', '/my-orders', '/application-status', '/verify-certificate/', '/verify-student-id/', '/verify-fee-receipt/'].flatMap((p) => ['Disallow: ' + p, 'Disallow: /ur' + p]),
  'Disallow: /api/', 'Allow: /api/blog/cover/', 'Allow: /api/marketplace/products/', 'Allow: /api/seo/og.png',
  '', `Sitemap: ${origin}/sitemap.xml`, ''
].join('\n'));
const ur = pages.filter((p) => PAGE_SEO_UR[p.path]).length;
console.log(`SEO: wrote ${pages.length} English + ${ur} Urdu pages with share cards, app.html, sitemap and robots.txt.`);
