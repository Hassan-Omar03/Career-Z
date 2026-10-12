const fs=require('node:fs'),p='D:/Career-Z-backend/src/controllers/ptm.controller.js';let s=fs.readFileSync(p,'utf8');
s=s.replace(/  await notify\(teacherId, \{[\s\S]*?\}\)\.catch\(\(\) => \{\}\);/,"  await context.notice(meeting,'New Parent-Teacher Meeting request',teacherId,req.user._id);");
s=s.replace(/  await notify\(schedule.teacher, \{ title: `Recurring PTM booked:[^\r\n]+/,"  await context.notice(meeting,'Recurring PTM booked: '+schedule.title,schedule.teacher,req.user._id);");
s=s.replace("+' | Subject: '+teaching.subject+' | Open Parent-Teacher Meeting", "+' | Roll: '+(teaching.rollNumber||'Not assigned')+' | Subject: '+teaching.subject+' | School: '+(teaching.schoolName||'Independent teaching')+' | '+frequency+' at '+time+' | Next dates: '+computeUpcomingOccurrences(schedule).slice(0,2).map(d=>d.toISOString()).join(', ')+' | Open Parent-Teacher Meeting");
fs.writeFileSync(p,s);
