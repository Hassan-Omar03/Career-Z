const fs=require('node:fs'),p='src/pages/Dashboard.jsx';let s=fs.readFileSync(p,'utf8');s="import TeacherRecurringPtm from '../components/dashboard/TeacherRecurringPtm';\n"+s;
const start=s.indexOf('function TeacherRecurringPtmPanel('),end=s.indexOf('function TeacherPtmPanel(',start);s=s.slice(0,start)+'function TeacherRecurringPtmPanel({onFlash}) { return <TeacherRecurringPtm onFlash={onFlash}/>; }\n\n'+s.slice(end);
const a=s.indexOf('function ParentPtmPanel('),b=s.indexOf('function TeacherRecurringPtmPanel(',a);let part=s.slice(a,b);
part=part.replaceAll("teacherId: '', requestedDate:","teacherId: '', courseId: '', timetableId: '', contextKey: '', requestedDate:");
part=part.replace("value={form.teacherId} onChange={(v) => setForm({ ...form, teacherId: v })}","value={form.contextKey} onChange={(v) => { const t=teachers.find(t=>[t.teacher._id,t.courseId,t.timetableId].join(':')===v); if(t)setForm({...form,contextKey:v,teacherId:t.teacher._id,courseId:t.courseId,timetableId:t.timetableId}); }}");
part=part.replace(/options=\{teachers.map\(\(t\) => \(\{ value: t.teacher._id, label:[^\r\n]+/,"options={teachers.map(t=>({value:[t.teacher._id,t.courseId,t.timetableId].join(':'),label:[t.teacher.fullName,t.subject,t.className||'Class not assigned',t.schoolName||'Independent teaching'].join(' · ')}))}");
part=part.replace("{s.title} ({s.teacher?.fullName})", "{s.title} · {children.find(c=>c.id===childId)?.name} · {s.className||'Class not assigned'} · {s.subject||'Subject not recorded'} · {s.teacher?.fullName} · {s.institution?.name||'Independent teaching'}");
part=part.replace(/\{m.status === 'confirmed' && <p className="text-xs mt-1">[^\r\n]+/, "{m.status === 'confirmed' && m.mode === 'physical' && <p className=\"text-xs mt-1\">{m.location || 'Location pending'}</p>}");
s=s.slice(0,a)+part+s.slice(b);
// The shared PTM details show the canonical join button for both parties.
s=s.replace("(m.meetingLink ? <a className=\"btn btn-primary\" href={m.meetingLink} target=\"_blank\" rel=\"noreferrer\">Join Meeting</a> : 'Meeting setup pending')","'Video meeting ready'");fs.writeFileSync(p,s);
