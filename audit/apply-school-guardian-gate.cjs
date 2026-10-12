const fs=require('node:fs'),root='D:/Career-Z-backend/src/';
function edit(path,fn){const f=root+path;fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')));}
edit('services/familyAccess.service.js',s=>{
 const code=`
// School identity approval is separate from consent to connect accounts.
async function verifiedInstitutions(row){
 const ids=await institutions(row.student);
 if(row.status!=='approved'||row.relationship==='sponsor')return [];
 const flags=ids.filter(id=>row.institutionVerifications.some(v=>same(v.institution,id)&&v.verified===true));
 if(!flags.length)return [];
 const proofs=await require('../models/GuardianProof').find({link:row._id,institution:{$in:flags},status:'approved',updatedAt:{$gte:row.approvedAt||row.createdAt}}).distinct('institution');
 return proofs.map(String);
}
async function requireSchoolVerification(parent,student,institution){
 const row=await link(parent,student),ids=await institutions(student),verified=await verifiedInstitutions(row);
 const required=institution?[String(institution)]:ids;
 if(required.some(id=>!ids.includes(id)||!verified.includes(id)))throw new AppError('School guardian verification is pending. Open My Children, submit guardian documents and ask the school to approve them before viewing private records.',403);
 return row;
}
async function canReadSchoolRecords(row){try{await requireSchoolVerification(row.parent,row.student);return true;}catch(e){if(e.statusCode===403)return false;throw e;}}
`;
 if(s.includes('async function verifiedInstitutions'))throw Error('Gate already installed');
 return s.replace('module.exports={',code+'\nmodule.exports={verifiedInstitutions,requireSchoolVerification,canReadSchoolRecords,');
});
edit('controllers/parent.controller.js',s=>{
 const names=['childAttendance','childResults','childTimetable','childHomework','childExams','getChildHealth','updateChildHealth','listChildPermissions','grantChildPermission','childCertificates','getAiAssistantInsights'];
 for(const name of names){const pattern=new RegExp('(const '+name+' = asyncHandler\\(async \\(req, res\\) => \\{)');if(!pattern.test(s))throw Error('Missing '+name);s=s.replace(pattern,'$1\n  await family.requireSchoolVerification(req.user._id,req.params.studentId);');}
 s=s.replace("const links = await ParentChildLink.find({ parent: req.user._id, status: 'approved' }).populate('student', 'fullName profilePhoto');", "const allLinks = await ParentChildLink.find({ parent: req.user._id, status: 'approved' }).populate('student', 'fullName profilePhoto');\n  const permitted=await Promise.all(allLinks.map(l=>family.canReadSchoolRecords(l)));\n  const links=allLinks.filter((l,index)=>permitted[index]);\n  const pendingVerification=allLinks.filter((l,index)=>!permitted[index]).map(l=>({id:l.student._id,name:l.student.fullName}));");
 s=s.replace('return ok(res, { children, notifications });','return ok(res, { children, notifications, pendingVerification });');return s;
});
edit('controllers/family.controller.js',s=>{
 s=s.replace(".find({parent:req.user._id,status:'approved'}).select('student');",".find({parent:req.user._id,status:'approved'});");
 s=s.replace('institution:{$in:await family.institutions(l.student)}','institution:{$in:await family.verifiedInstitutions(l)}');
 s=s.replace('await family.link(req.user._id,req.params.studentId);','await family.requireSchoolVerification(req.user._id,req.params.studentId);');
 s=s.replace("const link=await family.link(req.user._id,request.student,'giveConsent');","await family.requireSchoolVerification(req.user._id,request.student,request.institution);const link=await family.link(req.user._id,request.student,'giveConsent');");
 s=s.replace("const classrooms=asyncHandler(async(req,res)=>{","const classrooms=asyncHandler(async(req,res)=>{await family.requireSchoolVerification(req.user._id,req.params.studentId);");
 // Do not deliver activity details to a connected but unverified guardian.
 s=s.replace("await Promise.all(links.map(l=>notify(l.parent,{title:'Permission requested: '+row.title,sentBy:req.user._id},{email:true}).catch(()=>{})));","await Promise.all(links.map(async l=>{if((await family.verifiedInstitutions(l)).includes(String(row.institution)))await notify(l.parent,{title:'Permission requested: '+row.title,sentBy:req.user._id},{email:true}).catch(()=>{});}));");return s;
});
edit('controllers/ptm.controller.js',s=>s.replace("async function assertApprovedParentOfStudent(parentId, studentId) {","async function assertApprovedParentOfStudent(parentId, studentId) {\n  await require('../services/familyAccess.service').requireSchoolVerification(parentId,studentId);"));
edit('services/guardianObservation.service.js',s=>s.replace("const link=await family.link(parent,student,'observeClassroom');","await family.requireSchoolVerification(parent,student);const link=await family.link(parent,student,'observeClassroom');"));
edit('controllers/familyPolicy.controller.js',s=>s.replace('await family.link(req.user._id,req.params.studentId);','await family.requireSchoolVerification(req.user._id,req.params.studentId);'));
edit('services/notification.service.js',s=>s.replace('return notifyMany(links.map((l) => l.parent), payload, options);',"const allowed=await Promise.all(links.map(l=>require('./familyAccess.service').canReadSchoolRecords(l)));\n  return notifyMany(links.filter((l,i)=>allowed[i]).map(l=>l.parent),payload,options);"));
edit('controllers/health.controller.js',s=>s.replace('for(const link of links){if(incident.notifiedGuardians',"for(const link of links){if(!(await require('../services/familyAccess.service').verifiedInstitutions(link)).includes(String(incident.institution)))continue;if(incident.notifiedGuardians"));
