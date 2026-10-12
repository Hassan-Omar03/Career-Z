const fs=require('fs'),p='src/pages/Dashboard.jsx';let s=fs.readFileSync(p,'utf8');s="import StudentGuardians from '../components/dashboard/StudentGuardians';\n"+s;
s=s.replace("e.student?.fullName, e.student?.email,", "<div>{e.student?.fullName}<StudentGuardians studentId={e.student?._id}/></div>, e.student?.email,");
s=s.replace("s.user?.fullName, s.user?.email,", "<div>{s.user?.fullName}<StudentGuardians studentId={s.user?._id}/></div>, s.user?.email,");
s=s.replace('<div className="grid grid-cols-2 gap-3 mt-3"><p>Email:', '<StudentGuardians studentId={profileView.student?._id}/><div className="grid grid-cols-2 gap-3 mt-3"><p>Email:');
// Teacher coursework and results: keep guardian identity beside the student, not in a separate page.
s=s.replaceAll('<strong>{s.student?.fullName}</strong>','<strong>{s.student?.fullName}</strong><StudentGuardians studentId={s.student?._id}/>');
s=s.replaceAll("<strong>{result.student?.fullName || 'Student'}</strong>","<strong>{result.student?.fullName || 'Student'}</strong><StudentGuardians studentId={result.student?._id}/>");
s=s.replace("l.student?.fullName || l.student?.email, l.course?.title,","<div>{l.student?.fullName || l.student?.email}<StudentGuardians studentId={l.student?._id}/></div>, l.course?.title,");
fs.writeFileSync(p,s);console.log('Guardian identity shown beside student roster, profile, coursework/results and tutoring rows.');
