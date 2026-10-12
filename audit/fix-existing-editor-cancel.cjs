const fs=require('fs');function edit(p,fn){fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,90));return s.replace(a,b);}
edit('src/components/dashboard/LearningEditors.jsx',s=>{
 const a=s.indexOf('export function CurriculumUnit('),e=s.indexOf('\nconst question',a);let b=s.slice(a,e);
 b=rep(b,"onSubmit={e => { e.preventDefault(); onSave({ title, order }); setEditing(false); }}", "onSubmit={async e => { e.preventDefault(); if(await onSave({ title, order })===true)setEditing(false); }}");
 b=rep(b,"onClick={() => setEditing(false)}>Cancel", "onClick={() => {setTitle(unit.title);setOrder(unit.order||0);setEditing(false);}}>Cancel");return s.slice(0,a)+b+s.slice(e);
});
edit('src/pages/Dashboard.jsx',s=>{
 const a=s.indexOf('function CompletionRulesEditor('),e=s.indexOf('\nfunction ',a+1);let b=s.slice(a,e);
 b=rep(b,"onClick={() => setOpen(true)}>Course Completion Rules", "onClick={() => {setWeights(course.completionRules?.weights||{lessons:40,assignments:20,tests:25,attendance:15});setMinAttendancePercent(course.completionRules?.minAttendancePercent||0);setRequireTeacherApproval(course.completionRules?.requireTeacherApproval||false);setOpen(true);}}>Edit completion rules");return s.slice(0,a)+b+s.slice(e);
});
