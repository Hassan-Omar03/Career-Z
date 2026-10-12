const fs=require('node:fs'),p='D:/Career-Z-backend/src/controllers/ptm.controller.js';let s=fs.readFileSync(p,'utf8');
s=s.replace(/if \(meeting.mode === 'video'\) \{[^\r\n]+\}/,"if (meeting.mode === 'video') { meeting.meetingLink='https://meet.jit.si/careerz-ptm-'+require('crypto').randomBytes(18).toString('hex'); }");
s=s.replace("meetingLink: meetingLink || ''", "meetingLink: ''");
s=s.replace("meetingLink: schedule.meetingLink || (schedule.mode==='video'?", "meetingLink: (schedule.mode==='video'?");fs.writeFileSync(p,s);
