const fs=require('fs');const p='src/pages/Dashboard.jsx';let s=fs.readFileSync(p,'utf8');
function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,100));return s.replace(a,b);}
function scope(name,fn){let a=s.indexOf('function '+name+'('),b=s.indexOf('\nfunction ',a+1);if(a<0||b<0)throw Error(name);s=s.slice(0,a)+fn(s.slice(a,b))+s.slice(b);}
scope('InstitutionStudentsPanel',b=>{
 b=rep(b,"{ classSection: s.classSection?._id || '', rollNumber: s.rollNumber || '' }", "{ status: s.status, classSection: s.classSection?._id || '', rollNumber: s.rollNumber || '' }");
 b=rep(b,'body: { classSection: e.classSection ?? undefined, rollNumber: e.rollNumber ?? undefined }','body: { status: e.status ?? undefined, classSection: e.classSection ?? undefined, rollNumber: e.rollNumber ?? undefined }');
 b=rep(b,"onFlash('Class / roll number updated.', 'success');\n      load();", "onFlash('Class / roll number updated.', 'success');\n      load(); return true;");
 b=rep(b,'<div className="flex gap-2 items-center flex-wrap">','<SavedForm key={s._id} showValues={false} value={edit} onRestore={value=>setEdits(prev=>({...prev,[s._id]:value}))} onSubmit={()=>assignClass(s._id)} className="flex gap-2 items-center flex-wrap">');
 b=rep(b,'value={s.status} onChange={(e) => changeStatus(s._id, e.target.value)}','value={edit.status} onChange={(e) => setEdits(prev=>({...prev,[s._id]:{...edit,status:e.target.value}}))}');
 b=rep(b,'onClick={() => assignClass(s._id)}>Save</button>', '>Save</button>');
 b=rep(b,'<button type="button" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\' }} >Save</button>', '<button type="submit" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\' }}>Save</button>');
 return rep(b,'            </div>\n          ];','            </SavedForm>\n          ];');
});
scope('InstitutionClassesPanel',b=>{
 // Class-teacher edit controls live inside a table cell; the rest of the row stays readable.
 b=rep(b,'<div className="flex gap-2 items-center">\n            <select', '<SavedForm key={s._id} showValues={false} value={sectionTeacherEdits[s._id] ?? (s.classTeacher?._id || \'\')} onRestore={value=>setSectionTeacherEdits(prev=>({...prev,[s._id]:value}))} onSubmit={()=>assignClassTeacher(s._id)} className="flex gap-2 items-center">\n            <select');
 b=rep(b,'onClick={() => assignClassTeacher(s._id)}>Save</button>', '>Save</button>');
 b=rep(b,'<button type="button" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\' }} >Save</button>', '<button type="submit" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\' }}>Save</button>');
 b=rep(b,'          </div>\n        ])}', '          </SavedForm>\n        ])}');
 const line=b.split('\n').find(l=>l.includes('return [course.title, <input'));if(!line)throw Error('Course row');
 const form=`<SavedForm key={course._id} showValues={false} value={edit} onRestore={value=>setCourseEdits(prev=>({...prev,[course._id]:value}))} onSubmit={()=>saveCourseAssignment(course)} style={{display:'grid',gap:10,minWidth:220}}><label>Subject<input className="form-input" value={edit.subject} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,subject:e.target.value}}))}/></label><label>Class / Section<select className="form-select" value={edit.classSection} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,classSection:e.target.value}}))}><option value="">Select class</option>{sections.map(row=><option key={row._id} value={row._id}>{row.name}</option>)}</select></label><label>Teacher<select className="form-select" value={edit.teacher} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,teacher:e.target.value}}))}><option value="">Select teacher</option>{teachers.map(row=><option key={row.user._id} value={row.user._id}>{row.user.fullName}</option>)}</select></label><label>Credits<input className="form-input" type="number" min="0.5" max="12" step="0.5" value={edit.creditHours} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,creditHours:e.target.value}}))}/></label><label>Semester / Term<input className="form-input" value={edit.academicTerm} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,academicTerm:e.target.value}}))}/></label><button type="submit" className="btn btn-primary">Save assignment</button></SavedForm>`;
 b=rep(b,line,`          return [course.title, course.subject || '—', course.classSection?.name || '—', course.teacher?.fullName || '—', course.creditHours || 3, course.academicTerm || '—', ${form}];`);
 // Both assignment callbacks reload their saved records, and only successful calls close the editor.
 for(const name of ['assignClassTeacher','saveCourseAssignment']){const a=b.indexOf('async function '+name+'(');let e=b.indexOf('\n  async function ',a+1);if(e<0)e=b.indexOf('\n  return ',a);let block=b.slice(a,e);block=rep(block,'      load();','      load(); return true;');b=b.slice(0,a)+block+b.slice(e);}
 return b;
});
scope('PtmMeetingDetails',b=>{
 b=rep(b,"onFlash('Minutes saved.', 'success'); onChanged();", "onFlash('Minutes saved.', 'success'); onChanged(); return true;");
 b=rep(b,'      <textarea className="form-input" rows={2}', '      <SavedForm key={meeting._id} saved={Boolean(meeting.minutes)} value={minutes} onRestore={setMinutes} onSubmit={saveMinutes}><textarea className="form-input" rows={2}');
 b=rep(b,'disabled={savingMinutes} onClick={saveMinutes}>Save Minutes</button>', 'disabled={savingMinutes}>Save Minutes</button></SavedForm>');
 b=rep(b,'<button type="button" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\', marginTop: 4 }} disabled={savingMinutes}', '<button type="submit" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\', marginTop: 4 }} disabled={savingMinutes}');
 return b;
});
scope('StudyGroupDetail',b=>{
 b=rep(b,"setContributionNote(''); onFlash('Contribution note saved.', 'success'); load();", "onFlash('Contribution note saved.', 'success'); load(); return true;");
 b=rep(b,'            <strong className="text-sm">My contribution</strong>', '<SavedForm key={groupId} saved={Boolean((group.contributions||[]).find(c=>String(c.user?._id||c.user)===String(user?._id))?.note)} value={contributionNote} onRestore={setContributionNote} onSubmit={saveContribution}><strong className="text-sm">My contribution</strong>');
 b=rep(b,'onClick={saveContribution}>Save My Contribution</button>', '>Save My Contribution</button></SavedForm>');
 b=rep(b,'<button type="button" className="btn" disabled={!contributionNote.trim()}', '<button type="submit" className="btn" disabled={!contributionNote.trim()}');return b;
});
scope('VehicleManageSection',b=>{
 b=rep(b,"onFlash('Route/vehicle details saved.', 'success');", "onFlash('Route/vehicle details saved.', 'success'); return true;");
 const a=b.indexOf('      <h5'),end=b.indexOf('      <h5 className="font-semibold mt-6 mb-2"',a+1);if(a<0||end<0)throw Error('Vehicle editor');
 let block=b.slice(a,end);block=rep(block,'type="button" className="btn btn-primary mt-3" onClick={saveStopsAndDates}', 'type="submit" className="btn btn-primary mt-3"');
 b=b.slice(0,a)+`<SavedForm key={vehicle._id} value={{stops,insuranceExpiry,fitnessExpiry}} onRestore={v=>{setStops(v.stops);setInsuranceExpiry(v.insuranceExpiry);setFitnessExpiry(v.fitnessExpiry);}} onSubmit={saveStopsAndDates}>`+block+'</SavedForm>'+b.slice(end);return b;
});
fs.writeFileSync(p,s);
console.log('Student/class/course assignments, meeting minutes, member contributions and vehicle details now use explicit edit.');
