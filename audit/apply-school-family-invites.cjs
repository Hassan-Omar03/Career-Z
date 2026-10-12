const fs=require('node:fs'),root='D:/Career-Z-backend/src/';
function edit(path,fn){const f=root+path;fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')));}
edit('models/ParentChildLink.js',s=>s.replace('approvedAt: { type: Date, default: null },',`approvedAt: { type: Date, default: null },
    invitationInstitution: {type:mongoose.Schema.Types.ObjectId,ref:'Institution',default:null},
    schoolParentAccepted: {type:Boolean,default:false},
    schoolStudentAccepted: {type:Boolean,default:false},`));
fs.writeFileSync(root+'controllers/schoolFamilyInvitation.controller.js',`const family=require('../services/familyAccess.service'),Link=require('../models/ParentChildLink'),User=require('../models/User'),Institution=require('../models/Institution'),Profile=require('../models/StudentProfile'),wrap=require('../utils/asyncHandler'),AppError=require('../utils/AppError'),{created}=require('../utils/apiResponse'),{notify}=require('../services/notification.service');
module.exports=wrap(async(req,res)=>{
 const school=await Institution.findById(req.params.institutionId);if(!school)throw new AppError('Institution not found.',404);
 require('./staffPermission.controller').assertOwnerOrPermission(school,req.user._id,'parents:manage');
 let student=req.body.studentId;
 if(!student){const roll=String(req.body.admissionNumber||'').trim();if(!roll)throw new AppError('Choose student or enter admission/roll number.',422);const ids=await family.students(school._id);const matches=await Profile.find({user:{$in:ids},rollNumber:roll}).select('user');if(matches.length!==1)throw new AppError('Admission number must identify one current student at this school.',422);student=matches[0].user;}
 if(!(await family.institutions(student)).includes(String(school._id)))throw new AppError('Student is not enrolled at this school.',403);
 const child=await User.findById(student),parent=await User.findOne({email:String(req.body.parentEmail||'').trim().toLowerCase(),status:'active',roles:'parent'});
 if(!parent||!child||child.status!=='active'||!child.roles.includes('student'))throw new AppError('Active parent and student accounts are required.',422);
 const relationship=req.body.relationship||'guardian';if(!['father','mother','guardian'].includes(relationship))throw new AppError('Select father, mother or guardian.',422);
 const previous=await Link.findOne({parent:parent._id,student});if(previous&&!['revoked','rejected'].includes(previous.status))throw new AppError('A family connection already exists. Review its approval and documents.',409);
 const values={parent:parent._id,student,relationship,status:'pending',requestedBy:req.user._id,invitationInstitution:school._id,schoolParentAccepted:false,schoolStudentAccepted:false,approvedAt:null,institutionVerifications:[],institutionVerified:false,permissions:{payFees:true,viewHealth:true,giveConsent:true,observeClassroom:true}};
 const row=previous?await Link.findOneAndUpdate({_id:previous._id,status:{$in:['revoked','rejected']}},{$set:values,$push:{lifecycleHistory:{action:'school_invited',actor:req.user._id,at:new Date()}}},{new:true,runValidators:true}):await Link.create({...values,lifecycleHistory:[{action:'school_invited',actor:req.user._id,at:new Date()}]});
 if(!row)throw new AppError('Connection changed. Refresh and try again.',409);
 await Promise.all([parent._id,child._id].map(id=>notify(id,{title:'School family invitation',body:school.name+' invited you to approve a family connection. Both accounts must accept; school document verification follows.',sentBy:req.user._id}).catch(()=>{})));
 return created(res,row,'Invitation sent to parent and student. Both must accept.');
});
`);
edit('routes/institution.routes.js',s=>s.replace("router.get('/:institutionId/family/observation-policy'", "router.post('/:institutionId/family/invitations',require('../controllers/schoolFamilyInvitation.controller'));\nrouter.get('/:institutionId/family/observation-policy'"));
edit('controllers/parent.controller.js',s=>{
 s=s.replace("row.status='pending';row.requestedBy=req.user._id;","row.status='pending';row.invitationInstitution=null;row.schoolParentAccepted=false;row.schoolStudentAccepted=false;row.requestedBy=req.user._id;");
 const marker='  const recipient=family.same(link.requestedBy,link.parent)?link.student:link.parent;';
 const code=`  if(link.invitationInstitution){
    if(!family.same(link.parent,req.user._id)&&!family.same(link.student,req.user._id))throw new AppError('Only the invited parent or student can respond.',403);
    const key=family.same(link.parent,req.user._id)?'schoolParentAccepted':'schoolStudentAccepted';
    if(link.status!=='pending'||link[key])throw new AppError('Your invitation has already been answered.',409);
    const change=decision==='rejected'?{status:'rejected'}:{[key]:true};
    let updated=await ParentChildLink.findOneAndUpdate({_id:link._id,status:'pending',[key]:false},{$set:change,$push:{lifecycleHistory:{action:decision==='rejected'?'rejected':key,actor:req.user._id,at:new Date()}}},{new:true,runValidators:true});
    if(!updated)throw new AppError('Invitation changed. Refresh and try again.',409);
    if(updated.schoolParentAccepted&&updated.schoolStudentAccepted)updated=await ParentChildLink.findOneAndUpdate({_id:link._id,status:'pending',schoolParentAccepted:true,schoolStudentAccepted:true},{$set:{status:'approved',approvedAt:new Date()},$push:{lifecycleHistory:{action:'approved',actor:req.user._id,at:new Date()}}},{new:true})||await ParentChildLink.findById(link._id);
    return ok(res,updated,updated.status==='approved'?'Both accounts accepted. Submit guardian documents for school verification.':'Your response was recorded.');
  }
`;
 if(!s.includes(marker))throw Error('Missing recipient');return s.replace(marker,code+marker);
});
