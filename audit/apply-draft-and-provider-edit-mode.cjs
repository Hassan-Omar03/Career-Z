const fs=require('fs');function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,70));return s.replace(a,b);}function edit(p,fn){fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
edit('src/components/dashboard/LearningReader.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+rep(s,"import SavedForm from '../shared/SavedForm';",'');
 const a=s.indexOf('export function AssignmentDraft(');return s.slice(0,a)+`export function AssignmentDraft({ assignment }) {
  const [text, setText] = useState(''), [loaded, setLoaded] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState('');
  useEffect(() => { let alive = true; setLoaded(false); loadDraft(\`assignment:\${assignment._id}\`).then(value => { if (alive) { setText(value || ''); setSaved(Boolean(value)); setLoaded(true); } }).catch(e => setError(e.message)); return () => { alive = false; }; }, [assignment._id]);
  return <details><summary>{assignment.title} — assignment draft</summary><p>{assignment.description}</p>{assignment.dueDate && <p>Due: {new Date(assignment.dueDate).toLocaleString()}</p>}{loaded&&<SavedForm key={assignment._id} saved={saved} value={text} onRestore={setText} editLabel="Edit draft" onSubmit={async()=>{try{await saveDraft(\`assignment:\${assignment._id}\`,text);setSaved(true);setError('');return true;}catch(e){setError(e.message);}}}><textarea className="form-input" aria-label={\`Draft for \${assignment.title}\`} rows={6} value={text} onChange={e=>setText(e.target.value)}/><button type="submit" className="btn btn-primary">Save draft</button></SavedForm>}{error&&<p role="alert">{error}</p>}<p>Draft saved on this device. Open Assignments & Tests online to submit; the server checks deadlines and required files.</p><button type="button" className="btn" onClick={()=>navigator.clipboard.writeText(text).catch(e=>setError(e.message))}>Copy draft for submission</button></details>;
}
`;
});
edit('src/pages/Dashboard.jsx',s=>{
 const a=s.indexOf('function AdminAiProvidersPanel('),e=s.indexOf('\nfunction ',a+1);let b=s.slice(a,e);
 b=rep(b,"onFlash('Default model saved.', 'success');\n      load();", "onFlash('Default model saved.', 'success');\n      load(); return true;");
 b=rep(b,'<div key={provider} className="flex items-center gap-3 flex-wrap">','<SavedForm key={provider} showValues={true} value={modelInputs[`${purpose}:${provider}`]||\'\'} onRestore={v=>setModelInputs(prev=>({...prev,[`${purpose}:${provider}`]:v}))} onSubmit={()=>saveModel(purpose,provider)} className="flex items-center gap-3 flex-wrap">');
 // Availability changes are explicit operational toggles, but now require opening Edit too.
 b=rep(b,'onClick={() => saveModel(purpose, provider)}>Save model</button>', '>Save model</button>');
 b=rep(b,'<button type="button" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.75rem\' }} >Save model</button>', '<button type="submit" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.75rem\' }}>Save model</button>');
 b=rep(b,'          </div>\n        ))}', '          </SavedForm>\n        ))}');return s.slice(0,a)+b+s.slice(e);
});
console.log('Saved local drafts and provider model settings require Edit.');
