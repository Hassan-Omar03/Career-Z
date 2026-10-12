const fs=require('node:fs');
const root='D:/Career-Z-backend/src/';
function edit(file,fn){const path=root+file;fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));}
fs.writeFileSync(root+'models/FamilyObservation.js',`const mongoose=require('mongoose');
const event=new mongoose.Schema({actor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},action:{type:String,enum:['acknowledged','parent_reply','follow_up','resolved','reopened'],required:true},text:{type:String,maxlength:5000,default:''},at:{type:Date,default:Date.now}});
const schema=new mongoose.Schema({institution:{type:mongoose.Schema.Types.ObjectId,ref:'Institution',required:true},student:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},actor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},course:{type:mongoose.Schema.Types.ObjectId,ref:'Course',default:null},subject:{type:String,default:''},type:{type:String,enum:['progress','behavior','discipline','emergency','achievement']},text:{type:String,maxlength:5000},status:{type:String,enum:['open','awaiting_teacher','resolved'],default:'open'},history:[event]},{timestamps:true});
module.exports=mongoose.model('FamilyObservation',schema);
`);
fs.writeFileSync(root+'controllers/familyObservation.controller.js',`const asyncHandler=require('../utils/asyncHandler');
const AppError=require('../utils/AppError');
const {ok}=require('../utils/apiResponse');
const family=require('../services/familyAccess.service');
const Observation=require('../models/FamilyObservation');
const model=n=>require('../models/'+n);
const {notify}=require('../services/notification.service');
async function staffAccess(row,user){
 if(!(await family.institutions(row.student)).includes(String(row.institution)))throw new AppError('Student institution relationship ended.',403);
 const school=await model('Institution').findById(row.institution);
 const manager=school&&(family.same(school.owner,user._id)||school.staff.some(s=>family.same(s.user,user._id)&&(s.permissions||[]).includes('parents:manage')));
 const teacher=family.same(row.actor,user._id)&&(await family.teachers(row.student)).some(t=>family.same(t.teacher,user._id)&&t.institutions.some(i=>family.same(i,row.institution)));
 if(!manager&&!teacher)throw new AppError('Only the reporting teacher or authorized school reviewer may follow up.',403);
}
async function decorate(rows){return Promise.all(rows.map(async row=>{const data=row.toObject();data.meetings=await model('ParentTeacherMeeting').find({observation:row._id}).select('parent teacher requestedDate status subject').populate('parent','fullName');return data;}));}
const staffList=asyncHandler(async(req,res)=>{
 let query;
 if(req.query.institutionId){const school=await model('Institution').findById(req.query.institutionId);if(!school||(!family.same(school.owner,req.user._id)&&!school.staff.some(s=>family.same(s.user,req.user._id)&&(s.permissions||[]).includes('parents:manage'))))throw new AppError('School parent management permission required.',403);query={institution:school._id,student:{$in:await family.students(school._id)}};}
 else query={actor:req.user._id};
 const rows=await Observation.find(query).populate('student','fullName').populate('actor','fullName').populate('institution','name').populate('history.actor','fullName').sort({createdAt:-1}).limit(200);
 const allowed=[];for(const row of rows){try{await staffAccess(row,req.user);allowed.push(row);}catch(e){if(e.statusCode!==403)throw e;}}
 return ok(res,await decorate(allowed));
});
const respond=asyncHandler(async(req,res)=>{
 const row=await Observation.findById(req.params.id);if(!row)throw new AppError('Update not found.',404);
 const {action}=req.body;const text=String(req.body.text||'').trim();if(text.length>5000)throw new AppError('Maximum 5000 characters.',422);
 const parentAction=['acknowledged','parent_reply'].includes(action);
 if(parentAction)await family.requireSchoolVerification(req.user._id,row.student,row.institution);else{if(!['follow_up','resolved','reopened'].includes(action))throw new AppError('Invalid action.',422);await staffAccess(row,req.user);}
 if(action!=='acknowledged'&&!text)throw new AppError('Write the action or follow-up details.',422);
 const status=row.status||'open';
 if(status==='resolved'&&action!=='reopened')throw new AppError('This complaint is resolved. The teacher must reopen it before further action.',409);
 if(action==='reopened'&&status!=='resolved')throw new AppError('Only resolved complaints can be reopened.',409);
 const filter={_id:row._id};
 if(action==='acknowledged')filter.history={$not:{$elemMatch:{actor:req.user._id,action:'acknowledged'}}};
 if(action==='reopened')filter.status='resolved';else filter.status={$ne:'resolved'};
 const update={$push:{history:{actor:req.user._id,action,text,at:new Date()}}};
 if(action==='parent_reply')update.$set={status:'awaiting_teacher'};
 if(action==='resolved')update.$set={status:'resolved'};
 if(action==='reopened')update.$set={status:'open'};
 const saved=await Observation.findOneAndUpdate(filter,update,{new:true,runValidators:true});if(!saved)throw new AppError('Already acknowledged or status changed. Refresh the update.',409);
 if(parentAction)await notify(row.actor,{title:'Guardian '+action.replace('_',' '),body:text||'Guardian has seen the child update.',sentBy:req.user._id}).catch(()=>{});
 else{const links=await model('ParentChildLink').find({student:row.student,status:'approved'});for(const link of links)if((await family.verifiedInstitutions(link)).includes(String(row.institution)))await notify(link.parent,{title:'Teacher '+action.replace('_',' '),body:text,sentBy:req.user._id}).catch(()=>{});}
 return ok(res,saved);
});
module.exports={staffAccess,decorate,staffList,respond};
`);
edit('controllers/family.controller.js',s=>{
 s=s.replace(".populate('institution','name').sort({createdAt:-1,_id:-1})",".populate('institution','name').populate('history.actor','fullName').sort({createdAt:-1,_id:-1})");
 s=s.replace('return ok(res,rows);\n});\nconst overview',"return ok(res,await require('./familyObservation.controller').decorate(rows));\n});\nconst overview");
 s=s.replace("const {studentId,type,text}=req.body;","const {studentId,type,text,courseId,timetableId}=req.body;");
 s=s.replace(" const row=await model('FamilyObservation').create({institution:req.params.institutionId,student:studentId,type,text:String(text).trim(),actor:req.user._id});",` let course=null,subject='';
 if(courseId){const c=await model('Course').findOne({_id:courseId,institution:req.params.institutionId,teacher:req.user._id});if(!c||!await model('Enrollment').exists({student:studentId,course:c._id,status:{$ne:'dropped'}}))throw new AppError('Choose an actual course taught to this child.',403);course=c._id;subject=c.subject||c.title;}
 else if(timetableId){const entry=await model('TimetableEntry').findOne({_id:timetableId,institution:req.params.institutionId,teacher:req.user._id});if(!entry||!await model('StudentProfile').exists({user:studentId,classSection:entry.classSection}))throw new AppError('Choose an actual timetable subject taught to this child.',403);course=entry.course;subject=entry.subject;}
 else if(isTeacher)throw new AppError('Choose the child and teaching subject.',422);
 if(String(text).trim().length>5000)throw new AppError('Maximum 5000 characters.',422);
 const row=await model('FamilyObservation').create({institution:req.params.institutionId,student:studentId,type,text:String(text).trim(),actor:req.user._id,course,subject});`);
 s=s.replace(".select('institution title');",".select('institution title subject');");
 s=s.replace("course:courses.find(c=>family.same(c,r.course)).title}","course:courses.find(c=>family.same(c,r.course)).subject||courses.find(c=>family.same(c,r.course)).title,courseId:r.course}");
 s=s.replace(".select('classSection institution subject');",".select('classSection institution subject course');");
 s=s.replace("course:entry.subject||'Class timetable'}","course:entry.subject||'Class timetable',timetableId:entry._id}");
 s=s.replace("[r.student._id,r.institution,r.course].join(':')","[r.student._id,r.institution,r.courseId||r.timetableId].join(':')");return s;
});
edit('routes/parent.routes.js',s=>s.replace("router.get('/me/updates',family.updates);",`router.get('/me/updates',family.updates);
const observations=require('../controllers/familyObservation.controller');
router.get('/observations/staff',observations.staffList);
router.post('/observations/:id/respond',observations.respond);`));
edit('models/ParentTeacherMeeting.js',s=>s.replace("    bookingKey:","    observation:{type:mongoose.Schema.Types.ObjectId,ref:'FamilyObservation',default:null,index:true},\n    bookingKey:"));
edit('controllers/ptm.controller.js',s=>s.replace("  const meeting = await ParentTeacherMeeting.create({",`  let observation=null;
  if(req.body.observationId){observation=await require('../models/FamilyObservation').findById(req.body.observationId);if(!observation||String(observation.student)!==String(studentId)||String(observation.actor)!==String(teacherId))throw new AppError('Meeting must be with the reporting teacher for this child.',403);await require('../services/familyAccess.service').requireSchoolVerification(req.user._id,studentId,observation.institution);if(observation.status==='resolved')throw new AppError('Complaint is already resolved.',409);if(await ParentTeacherMeeting.exists({parent:req.user._id,observation:observation._id,status:{$in:['pending','confirmed']}}))throw new AppError('A meeting for this complaint is already pending or confirmed.',409);}
  const meeting = await ParentTeacherMeeting.create({
    observation:observation?._id||null,`).replace("    institution: match.institution || null,","    institution: observation?.institution || match.institution || null,").replace("    subject: match.subjects[0] || '',","    subject: observation?.subject || match.subjects[0] || '',"));
console.log('Observation follow-up backend applied.');
