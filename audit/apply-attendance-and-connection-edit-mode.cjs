const fs=require('fs');function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,90));return s.replace(a,b);}function edit(p,fn){fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
edit('src/pages/Dashboard.jsx',s=>{
 function scope(name,fn){const a=s.indexOf('function '+name+'('),e=s.indexOf('\nfunction ',a+1);s=s.slice(0,a)+fn(s.slice(a,e))+s.slice(e);}
 scope('TeacherAttendancePanel',b=>{
  b=rep(b,"  const [history, setHistory] = useState([]);", "  const [history, setHistory] = useState([]);\n  const [historyLoaded, setHistoryLoaded] = useState(false);");
  b=rep(b,"apiRequest('/teachers/me/attendance').then(setHistory)", "apiRequest('/teachers/me/attendance').then(rows=>{setHistory(rows);setHistoryLoaded(true);})");
  b=rep(b,"      loadHistory();\n    } catch", "      loadHistory(); return true;\n    } catch");
  b=rep(b,'  async function submit(e) {', `  const savedSheet=history.find(h=>String(h.course?._id||h.course)===String(courseId)&&new Date(h.date).toISOString().slice(0,10)===date);
  useEffect(()=>{const records=savedSheet?.records||[];setStatuses(Object.fromEntries(enrollments.map(en=>[en.student._id,records.find(r=>String(r.student?._id||r.student)===String(en.student._id))?.status||'present'])));setReasons(Object.fromEntries(records.map(r=>[String(r.student?._id||r.student),r.reason||''])));},[history,courseId,date,enrollments]);
  async function submit(e) {`);
  b=rep(b,"{courseId && mode === 'manual' && enrollments.length > 0 && (", "{courseId && mode === 'manual' && historyLoaded && enrollments.length > 0 && (");
  b=rep(b,'<form onSubmit={submit} className="card"', '<SavedForm key={courseId+date+Boolean(savedSheet)} saved={Boolean(savedSheet)} value={{date,statuses,reasons}} onRestore={v=>{setDate(v.date);setStatuses(v.statuses);setReasons(v.reasons);}} onSubmit={submit} className="card"');
  return rep(b,'        </form>', '        </SavedForm>');
 });
 scope('HostelAttendanceSection',b=>{
  b=rep(b,'    apiRequest(`/institution-ops/hostel-rooms/${roomId}/attendance?date=${date}`).then((saved)', '    setRecords(null);\n    apiRequest(`/institution-ops/hostel-rooms/${roomId}/attendance?date=${date}`).then((saved)');
  b=rep(b,'      apiRequest(`/institution-ops/hostel-rooms/${roomId}/attendance?date=${date}`).then(setRecords);', '      setRecords(await apiRequest(`/institution-ops/hostel-rooms/${roomId}/attendance?date=${date}`)); return true;');
  b=rep(b,'        {room && !readOnly && <button type="button" className="btn btn-primary" onClick={submit}>Save Attendance</button>}', '');
  b=rep(b,'{room && (room.occupants || []).length > 0 && (', '{room && records!==null && (room.occupants || []).length > 0 && (');
  b=rep(b,'        <Table\n          headers=', '<SavedForm key={roomId+date+Boolean(records?.length)} saved={Boolean(records?.length)} canEdit={!readOnly} value={statuses} onRestore={setStatuses} onSubmit={submit}><Table\n          headers=');
  b=rep(b,'          empty="No occupants in this room."\n        />', '          empty="No occupants in this room."\n        /><button type="submit" className="btn btn-primary">Save Attendance</button></SavedForm>');
  b=rep(b,'Changing the status and saving again updates this record; it does not create a duplicate.', 'Use Edit to update this saved record. Saving updates it without creating a duplicate.');return b;
 });
 return s;
});
edit('src/components/dashboard/FamilyCenter.jsx',s=>{
 const a=s.indexOf("{student&&r.status==='approved'&&['payFees'");const e=s.indexOf('</label>)}',a)+10;if(a<0||e<10)throw Error('Family permissions');
 s=s.slice(0,a)+"{student&&r.status==='approved'&&<ConnectionPermissionForm key={r._id} link={r} onFlash={onFlash} onSaved={load}/>}"+s.slice(e);
 return s+`
function ConnectionPermissionForm({link,onFlash,onSaved}) {
 const [permissions,setPermissions]=useState(Object.fromEntries(['payFees','viewHealth','giveConsent','observeClassroom'].map(key=>[key,!(link.relationship==='sponsor'&&key!=='payFees')&&link.permissions?.[key]!==false])));
 return <SavedForm value={permissions} onRestore={setPermissions} editLabel="Edit permissions" onSubmit={async()=>{try{await apiRequest(\`/parents/link-requests/\${link._id}/permissions\`,{method:'PATCH',body:permissions});await onSaved();onFlash('Guardian permissions saved.','success');return true;}catch(e){onFlash(e.message);}}}>{Object.keys(permissions).map(key=><label key={key} style={{display:'block',margin:'8px 0'}}><input type="checkbox" disabled={link.relationship==='sponsor'&&key!=='payFees'} checked={permissions[key]} onChange={e=>setPermissions(prev=>({...prev,[key]:e.target.checked}))}/>{({payFees:'Pay fees',viewHealth:'Health access',giveConsent:'Sign consent',observeClassroom:'Observe classroom'})[key]}</label>)}<button type="submit" className="btn btn-primary">Save permissions</button></SavedForm>;
}
`;
});
console.log('Attendance records and guardian permissions now require explicit edit.');
