const fs=require('node:fs'),p='audit/parent-completion.test.cjs';let s=fs.readFileSync(p,'utf8').replace("const names=['GuardianProof'","const names=['PtmRecurringSchedule','ClassSection','GuardianProof'");
s+=`
test('recurring PTM is scoped to the chosen child/class/subject and parent receives the exact join link',async()=>{
 const section=await m.ClassSection.create({institution:i._id,name:'BSCS Semester 1 - A'});
 await m.StudentProfile.updateOne({user:s._id},{$set:{classSection:section._id,rollNumber:'BSCS-001',program:'BSCS'}});
 await m.Course.updateOne({_id:c._id},{$set:{classSection:section._id,subject:'Computing'}});
 const roster=await call(ptm.teachingRoster,t);assert.equal(roster.data[0].className,'BSCS Semester 1 - A');assert.equal(roster.data[0].rollNumber,'BSCS-001');
 const body={studentId:String(s._id),courseId:String(c._id),institutionId:String(i._id),title:'Omar computing review',frequency:'weekly',dayOfWeek:2,time:'16:00',mode:'video'};
 assert.equal((await call(ptm.createRecurringSchedule,x,{},body)).status,403);
 const made=await call(ptm.createRecurringSchedule,t,{},body);assert.equal(made.status,201,made.error);assert.equal(made.data.subject,'Computing');assert.equal(made.data.className,'BSCS Semester 1 - A');
 assert.ok(notices.some(n=>n.id===String(p._id)&&n.body.includes('Class: BSCS Semester 1 - A')&&n.body.includes('Computing')));
 const child2=await m.User.create({fullName:'Other child',email:'other-child@context.local',passwordHash:'x',roles:['student']});await m.StudentProfile.create({user:child2._id,primaryInstitution:i._id,parentName:p.fullName,parentEmail:p.email,parentRelationship:'guardian'});await m.Enrollment.create({student:child2._id,course:c._id,status:'active'});await m.ParentChildLink.create({parent:p._id,student:child2._id,requestedBy:p._id,status:'approved',relationship:'guardian'});await verifyGuardian(p._id,child2._id,i._id);
 assert.equal((await call(ptm.childRecurringSchedules,p,{studentId:String(child2._id)})).data.length,0);
 const slots=await call(ptm.childRecurringSchedules,p,{studentId:String(s._id)});assert.equal(slots.data.length,1);const date=slots.data[0].upcoming[0];
 assert.equal((await call(ptm.bookRecurringOccurrence,p,{id:String(made.data._id)},{studentId:String(child2._id),occurrenceDate:date})).status,403);
 const booked=await call(ptm.bookRecurringOccurrence,p,{id:String(made.data._id)},{studentId:String(s._id),occurrenceDate:date});assert.equal(booked.status,201,booked.error);assert.equal(booked.data.status,'confirmed');assert.equal(booked.data.subject,'Computing');
 const notice=notices.find(n=>n.id===String(p._id)&&n.title==='Parent-Teacher Meeting confirmed');assert.ok(notice.body.includes(booked.data.meetingLink));assert.ok(notice.body.includes('BSCS-001'));assert.ok(notice.body.includes('Teacher: teacher'));assert.ok(notice.body.includes('School: School'));
 for(const user of [p,t]){const mine=await call(ptm.myMeetings,user);assert.equal(mine.data[0].className,'BSCS Semester 1 - A');assert.equal(mine.data[0].rollNumber,'BSCS-001');assert.equal(mine.data[0].parent.fullName,p.fullName);assert.equal(mine.data[0].teacher.fullName,t.fullName);assert.equal(mine.data[0].institution.name,'School');assert.equal(mine.data[0].meetingLink,booked.data.meetingLink);}
});
test('ad-hoc PTM requires exact subject when the child has multiple subjects with the same teacher',async()=>{
 const second=await m.Course.create({title:'Physics',teacher:t._id,institution:i._id,isFree:true});await m.Enrollment.create({student:s._id,course:second._id,status:'active'});
 const body={studentId:String(s._id),teacherId:String(t._id),requestedDate:new Date(Date.now()+86400000).toISOString(),mode:'video'};
 assert.equal((await call(ptm.requestMeeting,p,{},body)).status,422);
 const created=await call(ptm.requestMeeting,p,{}, {...body,courseId:String(second._id)});assert.equal(created.status,201,created.error);assert.equal(created.data.subject,'Physics');assert.equal(String(created.data.institution),String(i._id));
 assert.equal((await call(ptm.respondToMeeting,t,{id:String(created.data._id)},{decision:'confirmed'})).status,200);
 const notice=notices.find(n=>n.id===String(p._id)&&n.title==='Parent-Teacher Meeting confirmed');assert.ok(notice.body.includes('Subject: Physics'));assert.ok(notice.body.includes('Join Meeting: https://'));
});
`;
fs.writeFileSync(p,s);
