import { useEffect, useRef, useState } from 'react';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import JobDescription from '../discover/JobDescription';
import { parseJobDescription, composeJobDescription, pasteIntoGrid } from './jobTable';

// The job description while posting: text, a rows-and-columns table of posts, and more text after it.
export default function JobDescriptionEditor({ value, onChange }) {
  const [doc, setDoc] = useState(() => parseJobDescription(value));
  const lastSent = useRef(value);

  // The AI improver or opening another job changes the text from outside.
  useEffect(() => {
    if (value !== lastSent.current) { lastSent.current = value; setDoc(parseJobDescription(value)); }
  }, [value]);

  function update(changes) {
    const next = { ...doc, ...changes };
    setDoc(next);
    const text = composeJobDescription(next);
    lastSent.current = text;
    onChange(text);
  }
  const setHead = (c, v) => update({ head: doc.head.map((h, i) => (i === c ? v : h)) });
  const setCell = (r, c, v) => update({ rows: doc.rows.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? v : cell)) : row)) });
  const addRow = () => update({ rows: [...doc.rows, Array(doc.head.length).fill('')] });
  const removeRow = (r) => update({ rows: doc.rows.length > 1 ? doc.rows.filter((_, i) => i !== r) : [Array(doc.head.length).fill('')] });
  const addColumn = () => update({ head: [...doc.head, ''], rows: doc.rows.map((r) => [...r, '']) });
  const removeColumn = (c) => update({ head: doc.head.filter((_, i) => i !== c), rows: doc.rows.map((r) => r.filter((_, i) => i !== c)) });
  function paste(e, r, c) {
    const text = e.clipboardData.getData('text');
    if (!/[\t\n]/.test(text)) return;
    e.preventDefault();
    update(pasteIntoGrid(doc, r, c, text));
  }

  return (
    <div className="jde">
      <label className="hiring-field"><span>Job description</span><textarea className="form-input" placeholder="Job description" rows={4} value={doc.before} onChange={(e) => update({ before: e.target.value })} /></label>

      <div className="hiring-field">
        <span>Posts table (rows and columns)</span>
        <small className="jde-hint">Change the column names to suit your job. You can also copy cells from Excel and paste them here.</small>
        <div className="jde-scroll">
          <table className="jde-grid">
            <thead>
              <tr>
                {doc.head.map((h, c) => (
                  <th key={c}>
                    <div className="jde-head">
                      <input className="form-input" aria-label={`Column ${c + 1} name`} placeholder={`Column ${c + 1}`} value={h} onChange={(e) => setHead(c, e.target.value)} onPaste={(e) => paste(e, -1, c)} />
                      {doc.head.length > 1 && <button type="button" className="jde-x" aria-label={`Remove column ${h || c + 1}`} title="Remove column" onClick={() => removeColumn(c)}><FaXmark aria-hidden="true" /></button>}
                    </div>
                  </th>
                ))}
                <th aria-label="Remove row" />
              </tr>
            </thead>
            <tbody>
              {doc.rows.map((row, r) => (
                <tr key={r}>
                  {doc.head.map((h, c) => <td key={c}><input className="form-input" aria-label={`${h || `Column ${c + 1}`}, row ${r + 1}`} value={row[c] ?? ''} onChange={(e) => setCell(r, c, e.target.value)} onPaste={(e) => paste(e, r, c)} /></td>)}
                  <td className="jde-row-x"><button type="button" className="jde-x" aria-label={`Remove row ${r + 1}`} title="Remove row" onClick={() => removeRow(r)}><FaXmark aria-hidden="true" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="jde-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={addRow}><FaPlus aria-hidden="true" /> Add row</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addColumn}><FaPlus aria-hidden="true" /> Add column</button>
        </div>
      </div>

      <label className="hiring-field"><span>More details after the table (optional)</span><textarea className="form-input" placeholder="For example how to apply, or terms and conditions" rows={3} value={doc.after} onChange={(e) => update({ after: e.target.value })} /></label>

      {String(value || '').trim() && (
        <details className="jde-preview">
          <summary>See how it will look on the job page</summary>
          <JobDescription text={value} />
        </details>
      )}
    </div>
  );
}
