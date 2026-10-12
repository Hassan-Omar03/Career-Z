const fs=require('fs');function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,80));return s.replace(a,b);}function edit(p,fn){fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
edit('src/components/dashboard/LearningEditors.jsx',s=>s+`
export function CoursePublishingPolicy({course,busy,onSave}) {
 const [form,setForm]=useState({studyMode:course.studyMode,approvalWorkflow:course.approvalWorkflow});
 useEffect(()=>{setForm({studyMode:course.studyMode,approvalWorkflow:course.approvalWorkflow});},[course]);
 return <SavedForm key={course._id} value={form} onRestore={setForm} onSubmit={()=>onSave(form)} className="dash-card"><label>Class mode<select className="form-select" value={form.studyMode} disabled={busy} onChange={e=>setForm(prev=>({...prev,studyMode:e.target.value}))}>{['online','physical','hybrid','recorded','self_paced','ai'].map(m=><option key={m}>{m}</option>)}</select></label><label>Publishing policy<select className="form-select" value={form.approvalWorkflow} disabled={busy} onChange={e=>setForm(prev=>({...prev,approvalWorkflow:e.target.value}))}><option value="direct">Teacher publishes directly</option><option value="staged">Department → Principal approval</option></select></label><button type="submit" className="btn btn-primary" disabled={busy}>Save publishing policy</button></SavedForm>;
}
`);
edit('src/components/dashboard/LearningCenter.jsx',s=>{
 s=rep(s,'ActivityBuilder, CourseMetadata, CurriculumUnit, ReviewControls','ActivityBuilder, CourseMetadata, CoursePublishingPolicy, CurriculumUnit, ReviewControls');
 const a=s.indexOf('{data.canSetPolicy && <div className="dash-card"><label>Class mode'),e=s.indexOf('</div>}',a)+7;if(a<0)throw Error('Course policy');
 return s.slice(0,a)+`{data.canSetPolicy && <CoursePublishingPolicy course={data.course} busy={busy} onSave={body=>run(()=>apiRequest(\`/learning/\${id}/policy\`,{method:'PATCH',body}))}/>} `+s.slice(e);
});
edit('src/components/LiveLearningTools.jsx',s=>{
 s="import SavedForm from './shared/SavedForm';\n"+s;
 s=rep(s,'  const recordingAudio = useRef(null);','  const recordingAudio = useRef(null);\n  const [attendanceLoaded,setAttendanceLoaded]=useState(false),[attendanceSaved,setAttendanceSaved]=useState(false);');
 s=rep(s,'setRoster(r.students); setAttendance(Object.fromEntries(r.records.map(r => [r.student, r.status])));','setRoster(r.students); setAttendance(Object.fromEntries(r.records.map(r => [r.student, r.status]))); setAttendanceSaved(r.records.length>0);setAttendanceLoaded(true);');
 const a=s.indexOf("{teacher && ['physical', 'hybrid'].includes(session.mode)"),e=s.indexOf('</details>}',a)+11;if(a<0)throw Error('Physical attendance');
 const block=`{teacher && attendanceLoaded && ['physical','hybrid'].includes(session.mode) && <details open><summary>Physical attendance</summary><SavedForm key={session._id} saved={attendanceSaved} value={attendance} onRestore={setAttendance} onSubmit={async()=>{try{await apiRequest(\`/live-classes/\${session._id}/physical-attendance\`,{method:'PATCH',body:{records:roster.map(s=>({student:s._id,status:attendance[s._id]||'absent'}))}});setAttendanceSaved(true);return true;}catch(e){onError?.(e);}}}>{roster.map(s=><label key={s._id} style={{display:'block'}}>{s.fullName}<select className="form-select" value={attendance[s._id]||'absent'} onChange={e=>setAttendance(prev=>({...prev,[s._id]:e.target.value}))}>{['present','late','absent','excused'].map(v=><option key={v}>{v}</option>)}</select></label>)}<button type="submit" className="btn">Save physical attendance</button></SavedForm><p>End Class merges on-campus and remote attendance into one record per student.</p></details>}`;
 return s.slice(0,a)+block+s.slice(e);
});
edit('src/components/dashboard/FamilyCenter.jsx',s=>rep(s,"body:permissions});await onSaved();", "body:link.relationship==='sponsor'?{payFees:permissions.payFees}:permissions});await onSaved();"));
console.log('Course policies and saved live attendance now require Edit.');
