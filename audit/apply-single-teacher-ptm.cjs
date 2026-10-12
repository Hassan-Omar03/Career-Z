const fs=require('node:fs'),root='D:/Career-Z-backend/src/';
function edit(p,fn){p=root+p;fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
edit('models/ParentTeacherMeeting.js',s=>s.replace('    observation:',"    title:{type:String,trim:true,maxlength:200,default:''},\n    scheduledBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},\n    observation:").replace("this.$locals.historyActor||(this.isNew?this.parent:this.cancelledBy||this.teacher)","this.$locals.historyActor||(this.isNew?this.scheduledBy||this.parent:this.cancelledBy||this.teacher)"));
edit('services/ptmContext.service.js',s=>{
s=s.replace("async function roster(teacher)",`async function guardians(student,institution){const links=await model('ParentChildLink').find({student,status:'approved',relationship:{$in:['father','mother','guardian']}}).populate('parent','fullName');const rows=[];for(const link of links){try{await family.requireSchoolVerification(link.parent._id,student,institution||undefined);rows.push({parentId:link.parent._id,name:link.parent.fullName,relationship:link.relationship});}catch(e){if(e.statusCode!==403)throw e;}}return rows;}
async function roster(teacher)`);
s=s.replace("rows.push({...c,student});","rows.push({...c,student,guardians:await guardians(id,c.institution)});");
s=s.replace("const body=['Child: '","const body=['Meeting: '+(meeting.title||'Parent-Teacher Meeting'),'Child: '");s=s.replace('module.exports={contexts,resolve,fields,roster,enrich,notice};','module.exports={contexts,resolve,fields,roster,enrich,notice,guardians};');return s;
});
edit('controllers/ptm.controller.js',s=>s+`
module.exports.scheduleMeeting=asyncHandler(async(req,res)=>{
 const {studentId,parentId,requestedDate,title,mode='video',location='',notes=''}=req.body;
 if(!studentId||!parentId||!String(title||'').trim()||!requestedDate)throw new AppError('Choose the child, parent, meeting title and full date/time.',422);
 const date=new Date(requestedDate);if(!Number.isFinite(date.getTime())||date<=new Date())throw new AppError('Choose a future meeting date and time.',422);
 if(!['video','physical'].includes(mode)||String(title).trim().length>200||String(notes).length>5000)throw new AppError('Invalid mode or meeting details.',422);
 if(mode==='physical'&&!String(location).trim())throw new AppError('Physical meeting location required.',422);
 const teaching=await context.resolve(req.user._id,studentId,{courseId:req.body.courseId,timetableId:req.body.timetableId,institutionId:req.body.institutionId});
 if(!(await context.guardians(studentId,teaching.institution)).some(g=>String(g.parentId)===String(parentId)))throw new AppError('Choose this child’s approved and school-verified parent.',403);
 const meeting=await ParentTeacherMeeting.create({...context.fields(teaching),parent:parentId,teacher:req.user._id,student:studentId,title:String(title).trim(),scheduledBy:req.user._id,requestedDate:date,confirmedDate:date,mode,location:String(location).trim(),notes:String(notes).trim(),status:'pending',meetingLink:mode==='video'?'https://meet.jit.si/careerz-ptm-'+require('crypto').randomBytes(18).toString('hex'):''});
 let token;try{token=await calendar.reserve(meeting);meeting.status='confirmed';meeting.bookingKey=String(meeting.teacher)+':'+date.toISOString();meeting.$locals.historyActor=req.user._id;await meeting.save();}catch(e){if(token)await calendar.release(meeting,token);await ParentTeacherMeeting.deleteOne({_id:meeting._id,status:'pending'});if(e.code===11000||e.name==='VersionError')throw new AppError('Teacher already has a meeting near this time.',409);throw e;}
 await context.notice(meeting,'Parent-Teacher Meeting scheduled',parentId,req.user._id);
 return created(res,meeting,'Meeting scheduled and parent notified.');
});
`);
edit('routes/ptm.routes.js',s=>s.replace("router.post('/', ctrl.requestMeeting);","router.post('/', ctrl.requestMeeting);\nrouter.post('/schedule',ctrl.scheduleMeeting);"));
