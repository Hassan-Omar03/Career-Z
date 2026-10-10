import fs from 'node:fs';
import { PUBLIC_PAGES } from '../src/content/publicPages.js';
const origin = (process.env.VITE_PUBLIC_SITE_URL || 'https://careerz.pk').replace(/\/$/, '');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const base = fs.readFileSync('dist/index.html', 'utf8');
let pages = PUBLIC_PAGES.map(page => ({...page, path: '/'+page.slug}));
// Optional published CMS snapshot. This endpoint is public; no credentials are used.
if (process.env.PUBLIC_API_URL) {
  const api = process.env.PUBLIC_API_URL.replace(/\/$/, '');
  for (const kind of ['pages', 'blog']) {
    const response = await fetch(api+'/'+kind, {signal: AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('Published '+kind+' SEO snapshot failed: '+response.status);
    const payload = await response.json();
    const records = Array.isArray(payload) ? payload : payload.data;
    if (!Array.isArray(records)) throw new Error('Unexpected '+kind+' SEO snapshot');
    for (const record of records) {
      if (!/^[a-z0-9-]+$/i.test(record.slug)) continue;
      const page = {...record, title: record.seoTitle || record.title, description: record.seoDescription || record.excerpt || record.description || record.title, path: (kind==='blog'?'/blog/':'/')+record.slug};
      pages = pages.filter(existing => existing.path !== page.path); pages.push(page);
    }
  }
}
pages.unshift({path:'/',title:'Global AI-Powered Education Ecosystem',description:'Connect education, learning and career opportunities with CareerZ.',content:'CareerZ connects students, teachers, institutions, parents, employers, agents and donors. Explore courses, institutions, jobs and scholarships.'});
for (const page of pages) {
  const url = origin+page.path, title = page.title+' | CareerZ.pk';
  const schema = {'@context':'https://schema.org','@graph':[{'@type':'WebPage',name:page.title,description:page.description,url},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},...(page.path==='/'?[]:[{'@type':'ListItem',position:2,name:page.title,item:url}])]}]};
  const meta = `<link rel="canonical" href="${esc(url)}"/><meta name="robots" content="index,follow"/><meta name="keywords" content="CareerZ, education, ${esc(page.title)}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="CareerZ.pk"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(page.description)}"/><meta property="og:url" content="${esc(url)}"/><meta property="og:image" content="${origin}/logo2.png"/><meta property="og:image:alt" content="CareerZ - Empowering Global Futures"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(title)}"/><meta name="twitter:description" content="${esc(page.description)}"/><meta name="twitter:image" content="${origin}/logo2.png"/><script id="page-schema" type="application/ld+json">${json(schema)}</script>`;
  const body = String(page.content || '').replace(/<[^>]*>/g,'').split('\n\n').map(block=>'<p>'+esc(block)+'</p>').join('');
  const html = base.replace(/<title>.*?<\/title>/,'<title>'+esc(title)+'</title>').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+esc(page.description)+'"/>').replace('</head>',meta+'</head>').replace('<div id="root"></div>','<div id="root"><main><h1>'+esc(page.title)+'</h1>'+body+'<nav aria-label="Public pages">'+PUBLIC_PAGES.map(p=>'<a href="/'+p.slug+'">'+esc(p.title)+'</a>').join(' ')+'</nav></main></div>');
  const dir = 'dist'+(page.path==='/'?'':page.path); fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/index.html',html);
}
fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>'<url><loc>'+esc(origin+p.path)+'</loc></url>').join('')+'</urlset>');
fs.writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\n'+['social-callback','dashboard','onboarding','complete-profile','login','signup','forgot-password','reset-password'].map(p=>'Disallow: /'+p).join('\n')+'\nSitemap: '+origin+'/sitemap.xml\n');
console.log('SEO: generated '+pages.length+' public pages and sitemap.');
