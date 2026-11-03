// The table inside a job description. It is stored as Markdown text, so every page that already
// reads a description keeps working, and old "S#: 1 — Name of Post: …" lines open as a table too.

export const DEFAULT_COLUMNS = ['Post', 'BPS / Grade', 'Vacancies', 'Qualification', 'Age limit'];

export const pairsOf = (line) => {
  const parts = String(line).split(/\s+[—–]\s+/);
  if (parts.length < 3) return null;
  const pairs = parts.map((p) => p.match(/^([^:]{1,40}):\s*(.*)$/));
  return pairs.every(Boolean) ? pairs.map((m) => [m[1].trim(), m[2].trim()]) : null;
};

const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const blankRows = (n, width) => Array.from({ length: n }, () => Array(width).fill(''));
const textOf = (lines) => lines.join('\n').trim();

export function parseJobDescription(value) {
  const lines = String(value || '').replace(/\r/g, '').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim().startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
      let end = i + 2;
      while (end < lines.length && lines[end].trim().startsWith('|')) end += 1;
      const head = cells(lines[i]);
      const rows = lines.slice(i + 2, end).map((l) => head.map((_, c) => cells(l)[c] ?? ''));
      return { before: textOf(lines.slice(0, i)), head, rows: rows.length ? rows : blankRows(1, head.length), after: textOf(lines.slice(end)) };
    }
  }
  const first = lines.findIndex((l) => pairsOf(l));
  if (first >= 0) {
    let end = first;
    const found = [];
    for (let i = first; i < lines.length; i += 1) {
      const pairs = pairsOf(lines[i]);
      if (pairs) { found.push(Object.fromEntries(pairs)); end = i + 1; } else if (lines[i].trim()) break;
    }
    if (found.length >= 2) {
      const head = [...new Set(found.flatMap((r) => Object.keys(r)))];
      return { before: textOf(lines.slice(0, first)), head, rows: found.map((r) => head.map((k) => r[k] ?? '')), after: textOf(lines.slice(end)) };
    }
  }
  return { before: String(value || '').trim(), head: [...DEFAULT_COLUMNS], rows: blankRows(2, DEFAULT_COLUMNS.length), after: '' };
}

const clean = (c) => String(c ?? '').replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ').trim();

export function composeJobDescription({ before, head, rows, after }) {
  const names = head.map((h, i) => clean(h) || `Column ${i + 1}`);
  const body = rows.map((r) => head.map((_, i) => clean(r[i]))).filter((r) => r.some(Boolean));
  const table = body.length ? [`| ${names.join(' | ')} |`, `| ${names.map(() => '---').join(' | ')} |`, ...body.map((r) => `| ${r.join(' | ')} |`)].join('\n') : '';
  return [String(before || '').trim(), table, String(after || '').trim()].filter(Boolean).join('\n\n');
}

// Pasted Excel or Sheets cells fill the grid from the cell they land on; row -1 is the header.
export function pasteIntoGrid({ head, rows }, rowIndex, colIndex, text) {
  const pasted = String(text).replace(/\r/g, '').replace(/\n+$/, '').split('\n').map((l) => l.split('\t'));
  const width = Math.max(head.length, colIndex + Math.max(...pasted.map((r) => r.length)));
  const grid = [head, ...rows].map((r) => [...r, ...Array(width).fill('')].slice(0, width));
  pasted.forEach((line, i) => {
    const at = rowIndex + 1 + i;
    while (grid.length <= at) grid.push(Array(width).fill(''));
    line.forEach((cell, j) => { grid[at][colIndex + j] = cell.trim(); });
  });
  return { head: grid[0], rows: grid.slice(1) };
}
