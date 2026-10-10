const fs=require('fs'),root='D:/Career-Z-backend/src/';
const edit=(file,fn)=>fs.writeFileSync(root+file,fn(fs.readFileSync(root+file,'utf8').replace(/\r\n/g,'\n')));
edit('services/familyAccess.service.js',s=>s.replace('module.exports=',`async function assertInstitutionAccess(user,institution){
 const school=await Institution.findById(institution);if(!school)throw new AppError('Institution not found.',404);
 if(same(school.owner,user)||school.staff.some(s=>same(s.user,user)))return;
 if((await institutions(user)).includes(String(institution)))return;
 const children=await Link.find({parent:user,status:'approved'}).distinct('student');
 for(const child of children)if((await institutions(child)).includes(String(institution)))return;
 throw new AppError('You are not connected to this institution.',403);
}
module.exports=`).replace('institutions,students,link,','assertInstitutionAccess,institutions,students,link,'));
for(const file of ['controllers/newsletter.controller.js','controllers/magazine.controller.js'])edit(file,s=>s.replace('if (!institutionId) return ok(res, []);',"if (!institutionId) return ok(res, []);\n  await require('../services/familyAccess.service').assertInstitutionAccess(req.user._id,institutionId);"));
edit('controllers/ptm.controller.js',s=>{
 s=s.replace("await assertApprovedParentOfStudent(req.user._id, studentId);","if(!Number.isFinite(new Date(requestedDate).getTime())||new Date(requestedDate)<=new Date())throw new AppError('Choose a future meeting time.',422);\n  await assertApprovedParentOfStudent(req.user._id, studentId);");
 s=s.replace("meeting.confirmedDate = confirmedDate ? new Date(confirmedDate) : meeting.requestedDate;","meeting.confirmedDate = confirmedDate ? new Date(confirmedDate) : meeting.requestedDate;\n    if(!Number.isFinite(meeting.confirmedDate.getTime())||meeting.confirmedDate<=new Date())throw new AppError('Choose a future confirmation time.',422);\n    const conflict=await ParentTeacherMeeting.exists({_id:{$ne:meeting._id},teacher:meeting.teacher,status:'confirmed',confirmedDate:{$gte:new Date(meeting.confirmedDate.getTime()-30*60000),$lt:new Date(meeting.confirmedDate.getTime()+30*60000)}});if(conflict)throw new AppError('Teacher already has a meeting near this time.',409);");
 for(const name of ['completeMeeting','updateMinutes','addActionItem','toggleActionItem']){const start=s.indexOf('const '+name+' ='),end=s.indexOf('\n});',start),part=s.slice(start,end);s=s.slice(0,start)+part.replace("if (!isParty) throw new AppError('You are not part of this meeting.', 403);","if (!isParty) throw new AppError('You are not part of this meeting.', 403);\n  await assertApprovedParentOfStudent(meeting.parent,meeting.student);\n  if(!(await getChildTeachers(meeting.student)).some(t=>String(t.teacher._id)===String(meeting.teacher)))throw new AppError('Teacher relationship ended.',403);")+s.slice(end);}
 return s;
});
edit('controllers/family.controller.js',s=>s.replace('module.exports={',`const teachingRoster=asyncHandler(async(req,res)=>{
 const courses=await model('Course').find({teacher:req.user._id,institution:{$ne:null}}).select('institution title');
 const rows=await model('Enrollment').find({course:{$in:courses.map(c=>c._id)},status:{$ne:'dropped'}}).populate('student','fullName').select('course student');
 return ok(res,rows.filter(r=>r.student).map(r=>({student:r.student,institution:courses.find(c=>family.same(c,r.course)).institution,course:courses.find(c=>family.same(c,r.course)).title})));
});
module.exports={teachingRoster,`));
edit('routes/parent.routes.js',s=>s.replace("router.get('/wallet',family.wallet);","router.get('/wallet',family.wallet);\nrouter.get('/teaching-roster',family.teachingRoster);"));
console.log('Publication privacy, PTM actions and teacher roster secured.');
