import { useMemo } from 'react';

// Renders the Markdown that AI tools produce (headings, lists, tables, bold, inline and fenced
// code) as React elements. Never injects HTML, so lesson or report text cannot run markup.

function inline(text, keyBase) {
  return String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) return <strong key={`${keyBase}-${i}`}>{part.slice(2, -2)}</strong>;
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) return <code key={`${keyBase}-${i}`} className="md-code">{part.slice(1, -1)}</code>;
    return part;
  });
}

const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function parseMarkdown(text) {
  const out = [];
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      const code = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      out.push({ kind: 'code', text: code.join('\n') });
      continue;
    }
    if (!line.trim()) continue;
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) { out.push({ kind: 'h', level: heading[1].length, text: heading[2] }); continue; }
    if (line.trim().startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
      const head = cells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
      i--;
      out.push({ kind: 'table', head, rows });
      continue;
    }
    const item = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (item) {
      const last = out[out.length - 1];
      const entry = { depth: Math.min(3, Math.floor(item[1].length / 2)), text: item[3] };
      if (last?.kind === 'list') last.items.push(entry); else out.push({ kind: 'list', ordered: /\d/.test(item[2]), items: [entry] });
      continue;
    }
    out.push({ kind: 'p', text: line.trim() });
  }
  return out;
}

// Plain text for search and read-aloud: the words without Markdown symbols.
export function markdownToPlain(text) {
  return String(text || '').replace(/```/g, '').replace(/^#{1,6}\s+/gm, '').replace(/\*\*|`/g, '').replace(/^\s*[-*]\s+/gm, '').replace(/\|/g, ' ');
}

export default function MarkdownText({ text, className = '' }) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  return (
    <div className={`md-text ${className}`.trim()}>
      {blocks.map((b, i) => {
        if (b.kind === 'h') return b.level <= 2 ? <h3 key={i}>{inline(b.text, i)}</h3> : <h4 key={i}>{inline(b.text, i)}</h4>;
        if (b.kind === 'code') return <pre key={i} className="md-pre"><code>{b.text}</code></pre>;
        if (b.kind === 'table') {
          return (
            <div key={i} className="account-table-wrap md-table-wrap">
              <table>
                <thead><tr>{b.head.map((h, j) => <th key={j}>{inline(h, `${i}h${j}`)}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, j) => <tr key={j}>{b.head.map((_, k) => <td key={k}>{inline(r[k] ?? '', `${i}-${j}-${k}`)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }
        if (b.kind === 'list') {
          const List = b.ordered ? 'ol' : 'ul';
          return <List key={i}>{b.items.map((it, j) => <li key={j} style={{ marginLeft: it.depth * 18 }}>{inline(it.text, `${i}-${j}`)}</li>)}</List>;
        }
        return <p key={i}>{inline(b.text, i)}</p>;
      })}
    </div>
  );
}
