import { useEffect, useRef, useState } from 'react';
import { FaTriangleExclamation, FaXmark } from 'react-icons/fa6';
import { DIALOG_EVENT } from '../utils/appDialog';

export default function AppDialogHost() {
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const open = (event) => { setDialog(event.detail); setValue(event.detail.initialValue || ''); };
    window.addEventListener(DIALOG_EVENT, open);
    return () => window.removeEventListener(DIALOG_EVENT, open);
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') close(null); };
    window.addEventListener('keydown', onKey);
    if (dialog.type === 'prompt') setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]); // eslint-disable-line react-hooks/exhaustive-deps

  function close(result) {
    const resolve = dialog?.resolve;
    setDialog(null); setValue(''); resolve?.(result);
  }

  if (!dialog) return null;
  const valid = dialog.type !== 'prompt' || !dialog.required || value.trim();
  return <div className="u-modal-overlay open" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(null); }}>
    <section className="u-modal u-modal-sm" role="dialog" aria-modal="true" aria-labelledby="app-dialog-title">
      <div className="u-modal-head"><div className="flex items-center gap-2"><span style={{ color: dialog.danger ? 'var(--rose)' : 'var(--forest)' }}><FaTriangleExclamation aria-hidden="true" /></span><h3 id="app-dialog-title">{dialog.title}</h3></div><button type="button" className="u-modal-close" aria-label="Close" onClick={() => close(null)}><FaXmark aria-hidden="true" /></button></div>
      <div className="u-modal-body"><p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{dialog.message}</p>{dialog.type === 'prompt' && <textarea ref={inputRef} className="form-input mt-3" rows={4} placeholder={dialog.placeholder} value={value} onChange={(event) => setValue(event.target.value)} />}</div>
      <div className="u-modal-foot"><button type="button" className="btn" onClick={() => close(null)}>Cancel</button><button type="button" className="btn btn-primary" disabled={!valid} style={dialog.danger ? { background: 'var(--rose)' } : undefined} onClick={() => close(dialog.type === 'prompt' ? value.trim() : true)}>{dialog.confirmLabel}</button></div>
    </section>
  </div>;
}
