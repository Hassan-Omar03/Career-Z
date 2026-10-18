import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../api/client';

// CV templates and downloads (master spec 10.6 / 13.5): the student fills their CV once, then
// picks a design. Preview, PDF and Word all come from one section layout, so they always match.
// The PDF is real text (not an image), so applicant tracking systems can read it.

const TEMPLATES = {
  modern: { label: 'Modern', desc: 'Two columns with a coloured header and sidebar.', layout: 'sidebar', accent: [27, 138, 99], font: 'helvetica', main: ['summary', 'experience', 'education', 'portfolio'], side: ['skills', 'languages', 'certifications'] },
  ats: { label: 'ATS-friendly', desc: 'Plain single column that hiring systems read reliably.', layout: 'single', plain: true, accent: [0, 0, 0], font: 'helvetica', main: ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'portfolio'], titles: { summary: 'Summary', experience: 'Work Experience', portfolio: 'Projects' } },
  professional: { label: 'Professional', desc: 'Classic layout that leads with experience.', layout: 'single', accent: [15, 61, 46], font: 'helvetica', main: ['summary', 'experience', 'skills', 'education', 'certifications', 'languages', 'portfolio'] },
  academic: { label: 'Academic', desc: 'For lecturers and researchers; education first.', layout: 'single', accent: [55, 48, 107], font: 'times', main: ['education', 'summary', 'experience', 'certifications', 'portfolio', 'skills', 'languages'], titles: { summary: 'Research Interests', experience: 'Academic & Research Experience', certifications: 'Publications & Certifications', portfolio: 'Publications & Projects' } },
  teacher: { label: 'Teacher', desc: 'Teaching experience, subjects and certifications.', layout: 'single', accent: [180, 83, 9], font: 'helvetica', main: ['summary', 'experience', 'education', 'certifications', 'skills', 'languages', 'portfolio'], titles: { summary: 'Teaching Philosophy', experience: 'Teaching Experience', skills: 'Subjects & Skills', certifications: 'Teaching Certifications' } },
  technical: { label: 'Technical', desc: 'For developers and engineers; skills and projects first.', layout: 'single', accent: [37, 99, 235], font: 'helvetica', main: ['summary', 'skills', 'experience', 'portfolio', 'education', 'certifications', 'languages'], titles: { skills: 'Technical Skills', portfolio: 'Projects' } },
  medical: { label: 'Medical', desc: 'Education, licenses and clinical experience.', layout: 'single', accent: [14, 116, 144], font: 'helvetica', main: ['summary', 'education', 'certifications', 'experience', 'skills', 'languages', 'portfolio'], titles: { certifications: 'Licenses & Certifications', experience: 'Clinical Experience' } },
  creative: { label: 'Creative', desc: 'Bold sidebar design that puts your work first.', layout: 'sidebar', accent: [190, 24, 93], font: 'helvetica', main: ['summary', 'portfolio', 'experience', 'education'], side: ['skills', 'languages', 'certifications'], titles: { portfolio: 'Selected Work' } },
  student: { label: 'Student', desc: 'For new graduates; education and projects first.', layout: 'single', accent: [27, 138, 99], font: 'helvetica', main: ['summary', 'education', 'portfolio', 'skills', 'experience', 'certifications', 'languages'], titles: { summary: 'Objective', portfolio: 'Projects', experience: 'Experience & Internships' } },
  freelance: { label: 'Freelance', desc: 'For freelancers; portfolio and clients first.', layout: 'single', accent: [217, 119, 6], font: 'helvetica', main: ['summary', 'portfolio', 'skills', 'experience', 'certifications', 'education', 'languages'], titles: { summary: 'About Me', portfolio: 'Portfolio & Client Work', experience: 'Clients & Engagements' } }
};
const DEFAULT_TITLES = { summary: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', certifications: 'Certifications', languages: 'Languages', portfolio: 'Portfolio' };

const clean = (s) => String(s || '').trim();
const list = (a) => (Array.isArray(a) ? a.map(clean).filter(Boolean) : []);

// One layout for every output: [{ key, title, kind: 'text'|'items'|'tags', ... }]
function sectionsFor(cv, template, keys) {
  return keys.map((key) => {
    const title = template.titles?.[key] || DEFAULT_TITLES[key];
    if (key === 'summary') return clean(cv.summary) ? { key, title, kind: 'text', text: clean(cv.summary) } : null;
    if (key === 'experience') {
      const items = (cv.experience || []).filter((e) => clean(e.title) || clean(e.company)).map((e) => ({ heading: clean(e.title) || clean(e.company), meta: [clean(e.title) ? clean(e.company) : '', clean(e.duration)].filter(Boolean).join(' · '), body: clean(e.description) }));
      return items.length ? { key, title, kind: 'items', items } : null;
    }
    if (key === 'education') {
      const items = (cv.education || []).filter((e) => clean(e.degree) || clean(e.institution)).map((e) => ({ heading: clean(e.degree) || clean(e.institution), meta: [clean(e.degree) ? clean(e.institution) : '', clean(e.year)].filter(Boolean).join(' · '), body: '' }));
      return items.length ? { key, title, kind: 'items', items } : null;
    }
    if (key === 'portfolio') {
      const items = (cv.portfolio || []).filter((p) => clean(p.title)).map((p) => ({ heading: clean(p.title), meta: clean(p.url), body: clean(p.description) }));
      return items.length ? { key, title, kind: 'items', items } : null;
    }
    const tags = list(cv[key]);
    return tags.length ? { key, title, kind: 'tags', tags } : null;
  }).filter(Boolean);
}

// Countries are stored as ISO codes (PK); show the name on the CV.
function countryName(code) {
  try { return /^[A-Z]{2}$/.test(code || '') ? new Intl.DisplayNames(['en'], { type: 'region' }).of(code) : code; } catch { return code; }
}

function contactLine(person, cv) {
  return [person.email, person.phone, clean(cv.location) || [person.city, countryName(person.country)].filter(Boolean).join(', '), cv.linkedinUrl].map(clean).filter(Boolean);
}

// Latin-only check: the built-in PDF fonts cannot draw Urdu, Arabic or other scripts.
const hasNonLatin = (cv, person) => /[^\u0000-ɏ -⁯]/.test(JSON.stringify([cv, person.fullName]));

// ------------------------------------------------------------------ PDF (jsPDF, real text)
async function buildPdf(cv, person, template) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  pdf.setProperties({ title: `${person.fullName} — CV`, author: person.fullName, creator: 'CareerZ.pk' });
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), M = 16;
  const accent = template.accent, ink = [31, 41, 55], muted = [100, 110, 120];
  const font = template.font;
  const sidebar = template.layout === 'sidebar';
  const sideW = 62;
  const col = sidebar ? { x: sideW + 8, w: W - sideW - 8 - M } : { x: M, w: W - 2 * M };
  const side = { x: 8, w: sideW - 14 };
  let y = M;

  function paintSidebar() { if (!sidebar) return; pdf.setFillColor(245, 243, 236); pdf.rect(0, 0, sideW, H, 'F'); }
  // Continue on the next page if one exists (the sidebar may have made it), else add one.
  function newPage() {
    const current = pdf.getCurrentPageInfo().pageNumber;
    if (current < pdf.getNumberOfPages()) pdf.setPage(current + 1); else { pdf.addPage(); paintSidebar(); }
    y = M;
  }
  function ensure(h) { if (y + h > H - M) newPage(); }
  function text(str, x, w, { size = 9.5, style = 'normal', color = ink, gap = 0.6 } = {}) {
    pdf.setFont(font, style); pdf.setFontSize(size); pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(str, w);
    const lh = size * 0.42 + gap;
    for (const line of lines) { ensure(lh); pdf.text(line, x, y + size * 0.35); y += lh; }
  }
  function heading(title, x, w) {
    ensure(12); y += 3;
    if (template.plain) { text(title.toUpperCase(), x, w, { size: 10.5, style: 'bold', color: ink }); pdf.setDrawColor(0); pdf.setLineWidth(0.2); pdf.line(x, y, x + w, y); y += 2.5; return; }
    text(title.toUpperCase(), x, w, { size: 10.5, style: 'bold', color: accent });
    pdf.setDrawColor(...accent); pdf.setLineWidth(0.5); pdf.line(x, y, x + Math.min(w, 22), y); y += 2.5;
  }
  function section(s, x, w, narrow) {
    heading(s.title, x, w);
    if (s.kind === 'text') { text(s.text, x, w); return; }
    if (s.kind === 'tags') {
      if (narrow) s.tags.forEach((t) => text(`• ${t}`, x, w, { size: 9 }));
      else text(s.tags.join('  •  '), x, w);
      return;
    }
    for (const it of s.items) {
      ensure(10);
      text(it.heading, x, w, { size: 10.5, style: 'bold' });
      if (it.meta) text(it.meta, x, w, { size: 9, style: template.plain ? 'normal' : 'italic', color: muted });
      if (it.body) it.body.split(/\n+/).map(clean).filter(Boolean).forEach((line) => text(line.startsWith('-') || line.startsWith('•') ? `• ${line.replace(/^[-•]\s*/, '')}` : line, x, w));
      y += 1.5;
    }
  }

  // Header
  const contact = contactLine(person, cv);
  if (sidebar) {
    paintSidebar();
    pdf.setFillColor(...accent); pdf.rect(0, 0, W, 34, 'F');
    pdf.setTextColor(255, 255, 255); pdf.setFont(font, 'bold'); pdf.setFontSize(21); pdf.text(person.fullName || 'Your name', M, 16);
    if (clean(cv.headline)) { pdf.setFont(font, 'normal'); pdf.setFontSize(11); pdf.text(pdf.splitTextToSize(clean(cv.headline), W - 2 * M)[0], M, 24); }
    y = 42;
    const top = y;
    // Sidebar: contact then side sections; main column restarts at the top.
    heading('Contact', side.x, side.w);
    contact.forEach((c) => text(c, side.x, side.w, { size: 8.5 }));
    for (const s of sectionsFor(cv, template, template.side)) section(s, side.x, side.w, true);
    pdf.setPage(1); y = top;
    for (const s of sectionsFor(cv, template, template.main)) section(s, col.x, col.w, false);
  } else {
    pdf.setTextColor(...(template.plain ? ink : accent)); pdf.setFont(font, 'bold'); pdf.setFontSize(21);
    pdf.text(person.fullName || 'Your name', M, y + 7); y += 11;
    if (clean(cv.headline)) text(clean(cv.headline), M, col.w, { size: 11.5, color: ink });
    if (contact.length) text(contact.join('   |   '), M, col.w, { size: 9, color: muted });
    if (!template.plain) { pdf.setDrawColor(...accent); pdf.setLineWidth(0.8); pdf.line(M, y + 1.5, W - M, y + 1.5); }
    y += 4;
    for (const s of sectionsFor(cv, template, template.main)) section(s, col.x, col.w, false);
  }
  return pdf;
}

// ------------------------------------------------------------------ Word (.doc as HTML)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function buildWordHtml(cv, person, template) {
  const color = `rgb(${template.accent.join(',')})`;
  const fontFamily = template.font === 'times' ? "'Times New Roman', serif" : 'Calibri, Arial, sans-serif';
  const sectionHtml = (s) => `<h2 style="font-size:12pt;color:${template.plain ? '#000' : color};text-transform:uppercase;border-bottom:1px solid ${template.plain ? '#000' : color};margin:14pt 0 4pt">${esc(s.title)}</h2>`
    + (s.kind === 'text' ? `<p>${esc(s.text)}</p>`
      : s.kind === 'tags' ? `<p>${s.tags.map(esc).join(' &bull; ')}</p>`
        : s.items.map((it) => `<p style="margin:6pt 0 0"><b>${esc(it.heading)}</b>${it.meta ? `<br/><i style="color:#555">${esc(it.meta)}</i>` : ''}</p>${it.body ? it.body.split(/\n+/).filter((l) => l.trim()).map((l) => `<p style="margin:2pt 0">${esc(l)}</p>`).join('') : ''}`).join(''));
  const keys = [...template.main, ...(template.side || [])];
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(person.fullName)} CV</title></head>
<body style="font-family:${fontFamily};font-size:10.5pt;color:#1f2937">
<h1 style="font-size:22pt;color:${template.plain ? '#000' : color};margin:0">${esc(person.fullName || '')}</h1>
${clean(cv.headline) ? `<p style="font-size:12pt;margin:2pt 0">${esc(clean(cv.headline))}</p>` : ''}
<p style="color:#555;font-size:9.5pt;margin:2pt 0 8pt">${contactLine(person, cv).map(esc).join(' | ')}</p>
${sectionsFor(cv, template, keys).map(sectionHtml).join('\n')}
</body></html>`;
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ------------------------------------------------------------------ Preview
function Preview({ cv, person, template }) {
  const color = `rgb(${template.accent.join(',')})`;
  const titleColor = template.plain ? '#111' : color;
  const Section = ({ s, narrow }) => <section className="cvd-section">
    <h4 style={{ color: titleColor, borderColor: template.plain ? '#111' : color }}>{s.title}</h4>
    {s.kind === 'text' && <p>{s.text}</p>}
    {s.kind === 'tags' && (narrow ? <ul>{s.tags.map((t) => <li key={t}>{t}</li>)}</ul> : <p>{s.tags.join('  •  ')}</p>)}
    {s.kind === 'items' && s.items.map((it, i) => <div key={i} className="cvd-item"><strong>{it.heading}</strong>{it.meta && <em>{it.meta}</em>}{it.body && it.body.split(/\n+/).filter((l) => l.trim()).map((l, j) => <p key={j}>{l}</p>)}</div>)}
  </section>;
  const contact = contactLine(person, cv);
  const fontFamily = template.font === 'times' ? "'Times New Roman', Times, serif" : 'Helvetica, Arial, sans-serif';
  if (template.layout === 'sidebar') {
    return <div className="cvd-page cvd-sidebar" style={{ fontFamily }}>
      <header style={{ background: color }}><h3>{person.fullName}</h3>{clean(cv.headline) && <p>{clean(cv.headline)}</p>}</header>
      <div className="cvd-columns">
        <aside><section className="cvd-section"><h4 style={{ color, borderColor: color }}>Contact</h4>{contact.map((c) => <p key={c}>{c}</p>)}</section>{sectionsFor(cv, template, template.side).map((s) => <Section key={s.key} s={s} narrow />)}</aside>
        <main>{sectionsFor(cv, template, template.main).map((s) => <Section key={s.key} s={s} />)}</main>
      </div>
    </div>;
  }
  return <div className="cvd-page" style={{ fontFamily }}>
    <header className="cvd-single-head" style={{ borderColor: template.plain ? 'transparent' : color }}><h3 style={{ color: titleColor }}>{person.fullName}</h3>{clean(cv.headline) && <p className="cvd-headline">{clean(cv.headline)}</p>}{contact.length > 0 && <p className="cvd-contact">{contact.join('   |   ')}</p>}</header>
    {sectionsFor(cv, template, template.main).map((s) => <Section key={s.key} s={s} />)}
  </div>;
}

// For recruiters: the PDF of an applicant's CV as it was when they applied (their resume snapshot).
export async function downloadCvPdf(cv, person, templateKey = 'ats') {
  const template = TEMPLATES[templateKey] || TEMPLATES.ats;
  const pdf = await buildPdf(cv || {}, person, template);
  pdf.save(`${(person.fullName || 'Candidate').replace(/[^a-z0-9]+/gi, '-')}-CV.pdf`);
}

export default function CvDesigner({ user, onFlash }) {
  const [main, setMain] = useState(null), [variants, setVariants] = useState([]), [source, setSource] = useState('main');
  const [templateKey, setTemplateKey] = useState('modern'), [busy, setBusy] = useState('');
  useEffect(() => {
    Promise.all([apiRequest('/resumes/me'), apiRequest('/resumes/variants').catch(() => [])])
      .then(([r, v]) => { setMain(r); setVariants(v || []); setTemplateKey(r?.template || 'modern'); })
      .catch((e) => onFlash(e.message));
  }, []);
  const cv = source === 'main' ? main : variants.find((v) => v._id === source);
  useEffect(() => { if (cv?.template) setTemplateKey(cv.template); }, [source]);
  const template = TEMPLATES[templateKey];
  const person = useMemo(() => ({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '', city: user?.city || '', country: user?.country || '' }), [user]);
  const empty = cv && !clean(cv.summary) && !(cv.experience || []).length && !(cv.education || []).length && !list(cv.skills).length;

  async function choose(key) {
    setTemplateKey(key);
    try {
      const saved = source === 'main'
        ? await apiRequest('/resumes/me', { method: 'PATCH', body: { template: key } })
        : await apiRequest(`/resumes/variants/${source}`, { method: 'PATCH', body: { template: key } });
      if (source === 'main') setMain(saved); else setVariants((list0) => list0.map((v) => (v._id === source ? saved : v)));
    } catch (e) { onFlash(e.message); }
  }
  const fileBase = `${(person.fullName || 'CV').replace(/[^a-z0-9]+/gi, '-')}-CV-${template.label.replace(/[^a-z]+/gi, '')}`;
  async function pdf() {
    setBusy('pdf');
    try { (await buildPdf(cv, person, template)).save(`${fileBase}.pdf`); } catch (e) { onFlash(e.message || 'Could not create the PDF.'); } finally { setBusy(''); }
  }
  function word() { download(new Blob(['﻿', buildWordHtml(cv, person, template)], { type: 'application/msword' }), `${fileBase}.doc`); }

  if (!main) return <p role="status">Loading your CV…</p>;
  return <section className="cv-designer">
    <h3>CV Templates &amp; Download</h3>
    <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Fill your CV once in CV/Resume Builder or CV Versions, then pick a design and download it.</p>
    <label className="cvd-source">CV to use<select className="form-select" value={source} onChange={(e) => setSource(e.target.value)}>
      <option value="main">My main CV</option>
      {variants.map((v) => <option key={v._id} value={v._id}>{v.name}{v.isDefault ? ' (default)' : ''}</option>)}
    </select></label>
    <div className="cvd-templates" role="radiogroup" aria-label="CV design">
      {Object.entries(TEMPLATES).map(([key, t]) => <button key={key} type="button" role="radio" aria-checked={templateKey === key} className={`cvd-template${templateKey === key ? ' active' : ''}`} onClick={() => choose(key)}>
        <span className="cvd-swatch" style={{ background: `rgb(${t.accent.join(',')})` }} aria-hidden="true" />
        <strong>{t.label}</strong><span>{t.desc}</span>
      </button>)}
    </div>
    {empty && <p role="status" className="admin-notice">This CV is still empty. Add your details in CV/Resume Builder (or use “Fill from my records”) first.</p>}
    <div className="cvd-actions">
      <button type="button" className="btn btn-primary" disabled={!!busy || empty} onClick={pdf}>{busy === 'pdf' ? 'Creating PDF…' : 'Download PDF'}</button>
      <button type="button" className="btn" disabled={empty} onClick={word}>Download Word</button>
      {main.isPublic && <a className="btn" href={`/portfolio/${user?._id}`} target="_blank" rel="noreferrer">Open share link</a>}
    </div>
    {hasNonLatin(cv, person) && <p className="text-xs" role="note">Your CV has Urdu or other non-English letters. The PDF can only print English letters; use Download Word for those parts.</p>}
    <div className="cvd-preview" aria-label="CV preview"><Preview cv={cv} person={person} template={template} /></div>
  </section>;
}

export { TEMPLATES as CV_TEMPLATES, sectionsFor };
