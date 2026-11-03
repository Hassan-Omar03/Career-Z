// The table inside a job description. It is stored as Markdown text, so every page that already
// reads a description keeps working, and old "S#: 1 — Name of Post: …" lines open as a table too.

export const DEFAULT_COLUMNS = ['Post', 'BPS / Grade', 'Vacancies', 'Qualification', 'Age limit'];

export const pairsOf = (line) => {
  const parts = String(line).split(/\s+[—–]\s+/);
  if (parts.length < 3) return null;
  const pairs = parts.map((p) => p.match(/^([^:]{1,40}):\s*(.*)$/));
  return pairs.every(Boolean) ? pairs.map((m) => [m[1].trim(), m[2].trim()]) : null;
};

// "S.No | Post Name | BPS" written as plain lines, with no Markdown divider under the first one.
export const pipeCells = (line) => {
  if (!String(line).includes('|')) return null;
  const parts = String(line).trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  if (parts.length < 2 || (parts.length === 2 && parts[0].length > 60)) return null;
  return parts;
};
const isDivider = (parts) => parts.every((c) => /^:?-{2,}:?$/.test(c));

// Every row takes the header's width; anything extra stays together in the last column.
export const fitRow = (parts, width) => (parts.length > width ? [...parts.slice(0, width - 1), parts.slice(width - 1).join(' / ')] : [...parts, ...Array(width - parts.length).fill('')]);

// From blocks[start], the run of lines with the same shape: 3+ columns, or a two-column label and value.
export function pipeRun(texts, start) {
  const first = pipeCells(texts[start]);
  if (!first) return null;
  const wide = first.length >= 3;
  const rows = [];
  let end = start;
  while (end < texts.length && texts[end] !== null) {
    const parts = pipeCells(texts[end]);
    if (!parts || (parts.length >= 3) !== wide) break;
    if (!isDivider(parts)) rows.push(parts);
    end += 1;
  }
  return rows.length >= 2 ? { wide, rows, end } : null;
}

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
  // Plain "a | b | c" lines; two-column label and value lines stay as text and still read as a table.
  const seen = lines.map((l, i) => i).filter((i) => lines[i].trim());
  const texts = seen.map((i) => lines[i]);
  for (let i = 0; i < texts.length; i += 1) {
    const run = pipeRun(texts, i);
    if (run?.wide) {
      const head = run.rows[0];
      return { before: textOf(lines.slice(0, seen[i])), head, rows: run.rows.slice(1).map((r) => fitRow(r, head.length)), after: textOf(lines.slice(seen[run.end - 1] + 1)) };
    }
    if (run) i = run.end - 1;
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
