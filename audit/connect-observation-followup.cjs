const fs=require('node:fs');
let p='src/components/dashboard/ParentUpdates.jsx',s=fs.readFileSync(p,'utf8');
s=s.replace("import { apiRequest } from '../../api/client';","import { apiRequest } from '../../api/client';\nimport ObservationCard from './ObservationCard';");
s=s.replace("  const [error, setError] = useState('');","  const [error, setError] = useState('');\n  async function refresh() { setRows(await apiRequest('/parents/me/updates')); }");
s=s.replace(/\{rows\?\.map\(row => <article[\s\S]*?<\/article>\)\}/,'{rows?.map(row => <ObservationCard key={row._id} row={row} onSaved={refresh} />)}');fs.writeFileSync(p,s);
p='src/components/dashboard/FamilyCenter.jsx';s=fs.readFileSync(p,'utf8');s="import ObservationCard from './ObservationCard';\n"+s;
const start=s.indexOf('export function FamilyTeacherNotes('),end=s.indexOf('\nfunction ConsentRequest',start);
s=s.slice(0,start)+`export function FamilyTeacherNotes({onFlash}){
 const [roster,setRoster]=useState([]),[chosen,setChosen]=useState(''),[type,setType]=useState('progress'),[text,setText]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{apiRequest('/parents/teaching-roster').then(setRoster).catch(e=>onFlash(e.message));},[]);
 const key=r=>[r.student._id,r.institution,r.courseId||r.timetableId].join(':');
 const selected=roster.find(r=>key(r)===chosen);
 const [version,setVersion]=useState(0);
 return <section style={{...card,marginTop:20}}><h2>Child progress & guardian updates</h2><p>Choose the child and teaching subject. The reporting teacher is recorded automatically.</p><form style={grid} onSubmit={async e=>{e.preventDefault();if(!selected)return;setBusy(true);try{await apiRequest(\`/institutions/\${selected.institution}/family/observations\`,{method:'POST',body:{studentId:selected.student._id,courseId:selected.courseId,timetableId:selected.timetableId,type,text}});setText('');setVersion(v=>v+1);onFlash('Guardian update saved and sent.','success');}catch(e){onFlash(e.message);}finally{setBusy(false);}}}>
 <label>Child / subject<select className="form-select" required value={chosen} onChange={e=>setChosen(e.target.value)}><option value="">Choose child and subject</option>{roster.map(r=><option key={key(r)} value={key(r)}>{r.student.fullName} · {r.course}</option>)}</select>{selected&&<StudentGuardians studentId={selected.student._id}/>}</label>
 <label>Update type<select className="form-select" value={type} onChange={e=>setType(e.target.value)}>{['progress','behavior','discipline','emergency','achievement'].map(t=><option key={t}>{t}</option>)}</select></label><label>Notes<textarea className="form-input" required maxLength={5000} value={text} onChange={e=>setText(e.target.value)}/></label><button className="btn btn-primary" disabled={busy||!selected}>Send guardian update</button></form>
 <StaffObservationFeed refreshVersion={version}/></section>;
}
function StaffObservationFeed({institutionId='',refreshVersion=0}){
 const [rows,setRows]=useState([]),[error,setError]=useState('');
 async function load(){try{setRows(await apiRequest('/parents/observations/staff'+(institutionId?'?institutionId='+institutionId:'')));setError('');}catch(e){setError(e.message);}}
 useEffect(()=>{load();const timer=setInterval(load,10000);return()=>clearInterval(timer);},[institutionId,refreshVersion]);
 return <section style={{marginTop:24}}><h3>Guardian responses & follow-up</h3>{error&&<p role="alert">{error}</p>}<div style={{display:'grid',gap:16}}>{rows.map(row=><ObservationCard key={row._id} row={row} staff onSaved={load}/>)}</div>{!rows.length&&!error&&<p>No updates yet.</p>}</section>;
}
`+s.slice(end);
// Keep authorized institution reviewers on the same complaint history.
const institutionStart=s.indexOf('export function InstitutionFamilyActions('),institutionEnd=s.indexOf('export function FamilyTeacherNotes',institutionStart);
const piece=s.slice(institutionStart,institutionEnd).replace('</article>)}</section>;','</article>)}{institution&&<StaffObservationFeed key={institution} institutionId={institution}/>}</section>;');
s=s.slice(0,institutionStart)+piece+s.slice(institutionEnd);fs.writeFileSync(p,s);
