import { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { apiRequest } from '../api/client';
import { isPlatformUploadAvailable, uploadToPlatformStorage } from '../utils/platformUpload';

// Richer whiteboard: LaTeX equations, lines/arrows, mind maps and images (incl. AI-generated).
export const BOARD_TOOLS = [
  ['stroke', 'Pen'], ['line', 'Line'], ['arrow', 'Arrow'], ['rect', 'Rectangle'], ['circle', 'Circle'],
  ['text', 'Text'], ['math', 'Equation (LaTeX)'], ['mindmap', 'Mind map'], ['image', 'Image']
];

// "Photosynthesis\n  Light\n    Sunlight\n  Water" → [{ id, label, parent }]
export function parseOutline(outline) {
  const nodes = [];
  const stack = [];
  String(outline || '').split('\n').forEach((raw) => {
    if (!raw.trim()) return;
    const depth = Math.floor((raw.match(/^\s*/)[0].replace(/\t/g, '  ').length) / 2);
    const label = raw.trim().replace(/^[-*•\d.)]+\s*/, '').slice(0, 80);
    if (!label || nodes.length >= 40) return;
    const id = `n${nodes.length}`;
    while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
    const parent = nodes.length === 0 ? null : (stack[stack.length - 1]?.id || nodes[0].id);
    nodes.push({ id, label, parent });
    stack.push({ id, depth: nodes.length === 1 ? -1 : depth });
  });
  return nodes;
}

function renderMath(latex) {
  try { return katex.renderToString(latex, { throwOnError: false, displayMode: true, output: 'html', trust: false }); }
  catch { return ''; }
}

// Radial layout: root in the centre, children on a ring, grandchildren fanned around their parent.
function MindMap({ o }) {
  const x1 = Math.min(o.x, o.x2 ?? o.x + 500), y1 = Math.min(o.y, o.y2 ?? o.y + 350);
  const w = Math.max(200, Math.abs((o.x2 ?? o.x + 500) - o.x)), h = Math.max(150, Math.abs((o.y2 ?? o.y + 350) - o.y));
  const cx = x1 + w / 2, cy = y1 + h / 2;
  const nodes = o.nodes || [];
  const root = nodes.find((n) => n.parent === null);
  if (!root) return null;
  const pos = { [root.id]: [cx, cy] };
  const children = (id) => nodes.filter((n) => n.parent === id);
  const first = children(root.id);
  first.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, first.length) - Math.PI / 2;
    pos[n.id] = [cx + Math.cos(angle) * w * 0.3, cy + Math.sin(angle) * h * 0.3];
    const grand = children(n.id);
    grand.forEach((g, j) => {
      const spread = Math.PI / 3, a = angle + (grand.length > 1 ? (j / (grand.length - 1) - 0.5) * spread : 0);
      pos[g.id] = [pos[n.id][0] + Math.cos(a) * w * 0.17, pos[n.id][1] + Math.sin(a) * h * 0.17];
      children(g.id).forEach((gg, k) => { pos[gg.id] = [pos[g.id][0] + Math.cos(a + k * 0.5) * 40, pos[g.id][1] + Math.sin(a + k * 0.5) * 30]; });
    });
  });
  const color = o.color || '#123c2f';
  return (
    <g>
      {nodes.filter((n) => n.parent && pos[n.id] && pos[n.parent]).map((n) => <line key={`l${n.id}`} x1={pos[n.parent][0]} y1={pos[n.parent][1]} x2={pos[n.id][0]} y2={pos[n.id][1]} stroke={color} strokeOpacity="0.5" strokeWidth="2" />)}
      {nodes.filter((n) => pos[n.id]).map((n) => {
        const isRoot = n.id === root.id;
        const width = Math.min(220, 14 + n.label.length * (isRoot ? 10 : 8));
        return (
          <g key={n.id}>
            <rect x={pos[n.id][0] - width / 2} y={pos[n.id][1] - (isRoot ? 18 : 14)} width={width} height={isRoot ? 36 : 28} rx="14" fill={isRoot ? color : '#fff'} stroke={color} strokeWidth="2" />
            <text x={pos[n.id][0]} y={pos[n.id][1] + 5} textAnchor="middle" fontSize={isRoot ? 16 : 13} fill={isRoot ? '#fff' : color} fontWeight={isRoot ? 700 : 500}>{n.label}</text>
          </g>
        );
      })}
    </g>
  );
}

// One board item. Returns null for unknown types so older clients degrade gracefully.
export function renderBoardItem(o, key) {
  if (o.type === 'line' || o.type === 'arrow') {
    return <line key={key} x1={o.x} y1={o.y} x2={o.x2} y2={o.y2} stroke={o.color} strokeWidth="3" markerEnd={o.type === 'arrow' ? 'url(#wb-arrow)' : undefined} style={{ color: o.color }} />;
  }
  if (o.type === 'math') {
    return (
      <foreignObject key={key} x={o.x} y={o.y} width="600" height="120">
        <div xmlns="http://www.w3.org/1999/xhtml" style={{ color: o.color, fontSize: 22 }} dangerouslySetInnerHTML={{ __html: renderMath(o.text) }} />
      </foreignObject>
    );
  }
  if (o.type === 'mindmap') return <MindMap key={key} o={o} />;
  if (o.type === 'image' && /^https:\/\//.test(o.url || '')) {
    const x = Math.min(o.x, o.x2), y = Math.min(o.y, o.y2);
    return <image key={key} href={o.url} x={x} y={y} width={Math.max(60, Math.abs(o.x2 - o.x))} height={Math.max(60, Math.abs(o.y2 - o.y))} preserveAspectRatio="xMidYMid meet" />;
  }
  return null;
}

// <defs> needed by arrows — place once inside the board <svg>.
export function BoardDefs() {
  return <defs><marker id="wb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker></defs>;
}

// Extra inputs for the selected tool + AI helpers (mind map, equation, image) for the teacher.
export function BoardToolInputs({ tool, extra, setExtra, teacher, color, onAdd, onError }) {
  const [busy, setBusy] = useState('');
  async function ai(kind) {
    setBusy(kind);
    try {
      if (kind === 'mindmap') {
        if (!extra.topic?.trim()) throw new Error('Type a topic for the mind map first.');
        const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'whiteboard_mindmap', prompt: extra.topic } });
        const nodes = parseOutline(result);
        if (nodes.length < 2) throw new Error('The AI did not return a usable mind map. Try a clearer topic.');
        await onAdd({ type: 'mindmap', x: 120, y: 60, x2: 880, y2: 560, nodes, color });
      } else if (kind === 'math') {
        if (!extra.topic?.trim()) throw new Error('Describe the equation first (e.g. "quadratic formula").');
        const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'whiteboard_equation', prompt: extra.topic } });
        const latex = String(result).replace(/^\$+|\$+$/g, '').trim().slice(0, 500);
        setExtra({ ...extra, latex });
        await onAdd({ type: 'math', x: 40, y: 40, text: latex, color });
      } else if (kind === 'image') {
        if (!extra.topic?.trim()) throw new Error('Describe the picture first.');
        if (!(await isPlatformUploadAvailable())) throw new Error('Configure platform storage (Cloudinary) to put images on the board.');
        const { imageDataUrl } = await apiRequest('/ai/image', { method: 'POST', body: { prompt: `Clear educational diagram on a white background: ${extra.topic}` } });
        const blob = await (await fetch(imageDataUrl)).blob();
        const url = await uploadToPlatformStorage(new File([blob], 'board-image.png', { type: blob.type || 'image/png' }), 'whiteboard');
        await onAdd({ type: 'image', x: 250, y: 100, x2: 750, y2: 500, url });
      }
    } catch (e) { onError?.(e); } finally { setBusy(''); }
  }
  return (
    <div style={{ display: 'grid', gap: 6, margin: '6px 0' }}>
      {tool === 'math' && <>
        <input className="form-input" placeholder="LaTeX, e.g. E = mc^2 or \frac{a}{b} — then click the board" value={extra.latex || ''} onChange={(e) => setExtra({ ...extra, latex: e.target.value })} />
        {extra.latex && <div style={{ padding: 6, background: '#fff', border: '1px dashed #ccc' }} dangerouslySetInnerHTML={{ __html: renderMath(extra.latex) }} />}
      </>}
      {tool === 'mindmap' && <textarea className="form-input" rows={4} placeholder={'Central idea\n  Branch one\n    Detail\n  Branch two'} value={extra.outline || ''} onChange={(e) => setExtra({ ...extra, outline: e.target.value })} />}
      {tool === 'image' && <input className="form-input" placeholder="https:// image link — then drag a box on the board" value={extra.url || ''} onChange={(e) => setExtra({ ...extra, url: e.target.value })} />}
      {teacher && (
        <div className="flex gap-2 flex-wrap items-center">
          <input className="form-input" placeholder="Topic / description for AI" value={extra.topic || ''} onChange={(e) => setExtra({ ...extra, topic: e.target.value })} style={{ flex: '2 1 200px' }} />
          <button type="button" className="btn" disabled={Boolean(busy)} onClick={() => ai('mindmap')}>{busy === 'mindmap' ? 'Thinking…' : 'AI mind map'}</button>
          <button type="button" className="btn" disabled={Boolean(busy)} onClick={() => ai('math')}>{busy === 'math' ? 'Thinking…' : 'AI equation'}</button>
          <button type="button" className="btn" disabled={Boolean(busy)} onClick={() => ai('image')}>{busy === 'image' ? 'Drawing…' : 'AI image'}</button>
        </div>
      )}
    </div>
  );
}

// Extra fields a pointer-placed operation carries for the richer tools.
export function extraFieldsFor(tool, extra) {
  if (tool === 'math') return { text: extra.latex || '' };
  if (tool === 'mindmap') return { nodes: parseOutline(extra.outline) };
  if (tool === 'image') return { url: extra.url || '' };
  return {};
}
