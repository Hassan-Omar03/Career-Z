const fs=require('node:fs');
const p='src/pages/Dashboard.jsx';let s=fs.readFileSync(p,'utf8');const a=s.indexOf('function TeacherRecurringPtmPanel('),b=s.indexOf('\nfunction ParentPaymentRecordsPanel',a);let part=s.slice(a,b);
part=part.replaceAll("meetingLink: '', ",'');
part=part.replace(/<input className="form-input" placeholder="Meeting link" value=\{form.meetingLink\}[^\r\n]+\/>/, '<p className="text-xs">The existing video meeting setup is assigned automatically when a parent books.</p>');
part=part.replace(/<input className="form-input" placeholder="Meeting link" value=\{respondForm.meetingLink\}[^\r\n]+\/>/, '<p className="text-xs">The existing video meeting setup is assigned automatically on confirmation.</p>');
part=part.replace("(m.meetingLink || 'No link set')", "(m.meetingLink ? <a className=\"btn btn-primary\" href={m.meetingLink} target=\"_blank\" rel=\"noreferrer\">Join Meeting</a> : 'Meeting setup pending')");s=s.slice(0,a)+part+s.slice(b);s=s.replace('>Join Link</a>','>Join Meeting</a>');fs.writeFileSync(p,s);
