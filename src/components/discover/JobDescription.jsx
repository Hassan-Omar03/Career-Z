import { useMemo, useState } from 'react';
import { parseMarkdown, inlineMarkdown } from '../shared/MarkdownText';
import { pairsOf, pipeRun, fitRow } from '../jobs/jobTable';
import '../../styles/job-description.css';

// A job's description, made easy to read. Long government-style adverts arrive as plain lines, so:
// "S#: 1 — Name of Post: … — BPS: …" lines become a searchable table of posts, "- Organization: …"
// bullets become a grid of facts, questions become open/close answers, and each part gets its own
// heading with quick links at the top. Ordinary descriptions simply read as clean paragraphs.

const LABEL = { 'S#': 'No.', 'Name of Post': 'Post', 'Qualification / Experience': 'Qualification and experience' };
const factOf = (text) => { const m = String(text).replace(/\*\*/g, '').match(/^([^:.]{2,32}):\s+(.+)$/); return m ? [m[1], m[2]] : null; };

// Repeated column names stay separate columns.
function tableBlock(head, rows) {
  const keys = head.map((h, i) => (head.indexOf(h) === i ? h : `${h} ${i + 1}`));
  return { kind: 'posts', keys, rows: rows.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? '']))) };
}

// Blocks from the Markdown parser, with post lines joined into one table and fact lists marked.
function arrange(text) {
  const out = [];
  const blocks = parseMarkdown(text);
  const texts = blocks.map((b) => (b.kind === 'p' ? b.text : null));
  for (let at = 0; at < blocks.length; at += 1) {
    const b = blocks[at];
    const run = b.kind === 'p' ? pipeRun(texts, at) : null;
    if (run) {
      if (run.wide) out.push(tableBlock(run.rows[0], run.rows.slice(1).map((r) => fitRow(r, run.rows[0].length))));
      else out.push({ kind: 'details', rows: run.rows.map((r) => [r[0], r.slice(1).join(' ')]) });
      at = run.end - 1;
      continue;
    }
    const pairs = b.kind === 'p' ? pairsOf(b.text) : null;
    const last = out[out.length - 1];
    if (pairs) {
      const row = Object.fromEntries(pairs);
      if (last?.kind === 'posts') { last.rows.push(row); pairs.forEach(([k]) => { if (!last.keys.includes(k)) last.keys.push(k); }); }
      else out.push({ kind: 'posts', keys: pairs.map(([k]) => k), rows: [row] });
      continue;
    }
    if (b.kind === 'table') {
      out.push(tableBlock(b.head, b.rows));
      continue;
    }
    if (b.kind === 'list' && !b.ordered) {
      const facts = b.items.map((it) => factOf(it.text));
      if (b.items.length >= 3 && facts.filter(Boolean).length >= b.items.length * 0.7 && facts.every((f, i) => f || b.items[i].text.length < 60)) {
        out.push({ kind: 'facts', items: facts.map((f, i) => f || ['', b.items[i].text]) });
        continue;
      }
    }
    out.push(b);
  }
  return out;
}

// Parts under each heading; consecutive question headings form the FAQ.
function sections(blocks) {
  const list = [];
  let cur = { title: '', blocks: [] };
  for (const b of blocks) {
    if (b.kind === 'h' && b.level <= 2) { if (cur.title || cur.blocks.length) list.push(cur); cur = { title: b.text, blocks: [] }; } else cur.blocks.push(b);
  }
  if (cur.title || cur.blocks.length) list.push(cur);
  return list;
}

// "i. BCS … ii. Speed of …" reads as separate lines.
const lines = (text) => String(text || '').split(/\s+(?=(?:i{1,3}|iv|v|vi)\.\s)/).filter(Boolean);

function PostsTable({ block }) {
  const [q, setQ] = useState(''), [all, setAll] = useState(false);
  const long = block.rows.length > 10;
  const found = q.trim() ? block.rows.filter((r) => Object.values(r).join(' ').toLowerCase().includes(q.trim().toLowerCase())) : block.rows;
  const rows = all || q.trim() || !long ? found : found.slice(0, 10);
  return (
    <div className="jd-posts">
      {long && <input className="form-input jd-search" type="search" placeholder={`Search ${block.rows.length} posts, for example Driver or Matric`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search posts" />}
      <table>
        <thead><tr>{block.keys.map((k) => <th key={k}>{LABEL[k] || k}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>{block.keys.map((k) => (
            <td key={k} data-label={LABEL[k] || k} className={/^(name of post|post name|post|job title|position|designation)$/i.test(k) ? 'jd-post-name' : ''}>{lines(r[k]).map((l, n) => <span key={n} className="jd-line">{inlineMarkdown(l, `${i}-${k}-${n}`)}</span>)}</td>
          ))}</tr>
        ))}</tbody>
      </table>
      {!rows.length && <p className="jd-empty">No post matches your search.</p>}
      {long && !q.trim() && <button type="button" className="btn btn-outline jd-more" onClick={() => setAll(!all)}>{all ? 'Show fewer posts' : `Show all ${block.rows.length} posts`}</button>}
    </div>
  );
}

function Block({ b, k }) {
  if (b.kind === 'posts') return <PostsTable block={b} />;
  if (b.kind === 'details') return <table className="jd-details"><tbody>{b.rows.map(([key, val], i) => <tr key={i}><th scope="row">{inlineMarkdown(key, `${k}-k${i}`)}</th><td>{inlineMarkdown(val, `${k}-v${i}`)}</td></tr>)}</tbody></table>;
  if (b.kind === 'facts') return <dl className="jd-facts">{b.items.map(([key, val], i) => <div key={i}>{key && <dt>{key}</dt>}<dd>{inlineMarkdown(val, `${k}-${i}`)}</dd></div>)}</dl>;
  if (b.kind === 'h') return <h4 className="jd-sub">{inlineMarkdown(b.text, k)}</h4>;
  if (b.kind === 'list') { const L = b.ordered ? 'ol' : 'ul'; return <L className="jd-list">{b.items.map((it, i) => <li key={i} style={{ marginLeft: it.depth * 18 }}>{inlineMarkdown(it.text, `${k}-${i}`)}</li>)}</L>; }
  if (b.kind === 'code') return <pre className="md-pre"><code>{b.text}</code></pre>;
  if (/^(disclaimer|note)\s*:/i.test(b.text)) return <p className="jd-note">{inlineMarkdown(b.text, k)}</p>;
  return <p className="jd-p">{inlineMarkdown(b.text, k)}</p>;
}

export default function JobDescription({ text }) {
  const parts = useMemo(() => sections(arrange(text)), [text]);
  const titled = parts.filter((s) => s.title && !s.title.trim().endsWith('?'));
  const go = (i) => document.getElementById(`jd-s${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="jd">
      {titled.length >= 3 && (
        <nav className="jd-jump" aria-label="Parts of this job">
          {parts.map((s, i) => (s.title && !s.title.trim().endsWith('?') ? <button key={i} type="button" onClick={() => go(i)}>{s.title.replace(/\s*[–-]\s*[^–-]*\b20\d\d\b.*$/, '')}</button> : null))}
        </nav>
      )}
      {parts.map((s, i) => {
        const inner = s.blocks.map((b, j) => <Block key={j} b={b} k={`${i}-${j}`} />);
        if (s.title.trim().endsWith('?')) return <details key={i} id={`jd-s${i}`} className="jd-faq"><summary>{s.title}</summary>{inner}</details>;
        return <div key={i} id={`jd-s${i}`} className="jd-part">{s.title && <h3>{inlineMarkdown(s.title, `t${i}`)}</h3>}{inner}</div>;
      })}
    </div>
  );
}
