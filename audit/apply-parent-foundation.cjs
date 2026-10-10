const fs=require('fs');const root='D:/Career-Z-backend/';
function edit(path,fn){const p=root+path;fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing target: '+a.slice(0,70));return s.replace(a,b);}
fs.writeFileSync(root+'src/services/familyAccess.service.js',`const Link=require('../models/ParentChildLink');
const Profile=require('../models/StudentProfile');
const Membership=require('../models/StudentInstitutionMembership');
const Institution=require('../models/Institution');
const Course=require('../models/Course');
const Enrollment=require('../models/Enrollment');
const Timetable=require('../models/TimetableEntry');
const AppError=require('../utils/AppError');
const same=(a,b)=>String(a?._id||a||'')===String(b?._id||b||'');
async function institutions(student){const [p,all]=await Promise.all([Profile.findOne({user:student}).select('primaryInstitution'),Membership.find({student}).select('institution status')]);const ids=all.filter(m=>['active','withdrawal_requested','transfer_requested'].includes(m.status)).map(m=>String(m.institution));if(p?.primaryInstitution&&!all.some(m=>same(m.institution,p.primaryInstitution)))ids.push(String(p.primaryInstitution));return [...new Set(ids)];}
async function students(institution){const [members,profiles]=await Promise.all([Membership.find({institution,status:{$in:['active','withdrawal_requested','transfer_requested']}}).distinct('student'),Profile.find({primaryInstitution:institution}).distinct('user')]);const ids=new Set(members.map(String));for(const id of profiles){if(!(await Membership.exists({student:id,institution})))ids.add(String(id));}return [...ids];}
async function link(parent,student,permission){const row=await Link.findOne({parent,student,status:'approved'});if(!row)throw new AppError('You are not linked to this student.',403);if(permission&&row.permissions?.[permission]===false)throw new AppError('Guardian permission is restricted.',403);return row;}
async function teachers(student){const [profile,courses]=await Promise.all([Profile.findOne({user:student}),Enrollment.find({student,status:{$ne:'dropped'}}).populate({path:'course',populate:{path:'teacher',select:'fullName email profilePhoto'}})]);const entries=profile?.classSection?await Timetable.find({classSection:profile.classSection}).populate('teacher','fullName email profilePhoto'):[];const map=new Map();function add(teacher,subject,institution){if(!teacher?._id)return;const id=String(teacher._id);if(!map.has(id))map.set(id,{teacher,subjects:[],institution});const r=map.get(id);if(subject&&!r.subjects.includes(subject))r.subjects.push(subject);}entries.forEach(e=>add(e.teacher,e.subject,e.institution));courses.forEach(e=>add(e.course?.teacher,e.course?.subject||e.course?.title,e.course?.institution));return [...map.values()];}
async function contacts(parent){const children=await Link.find({parent,status:'approved'}).distinct('student');const map=new Map();for(const student of children){for(const row of await teachers(student))map.set(String(row.teacher._id),{user:row.teacher,relationship:'teacher',context:row.subjects.join(', ')});for(const id of await institutions(student)){const i=await Institution.findById(id).populate('owner','fullName email roles profilePhoto').populate('staff.user','fullName email roles profilePhoto');if(!i)continue;for(const u of [i.owner,...i.staff.filter(s=>s.role!=='teacher'&&!['driver','warden'].includes(s.role)).map(s=>s.user)])if(u?._id)map.set(String(u._id),{user:u,relationship:'institution',context:i.name});}}return [...map.values()];}
async function related(parent,other){return (await contacts(parent)).some(c=>same(c.user,other));}
function safeFee(fee){const f=fee.toObject?fee.toObject():{...fee};for(const k of ['platformCommission','netAmount','commissionPercent','commissionPercentage','grossAmount','escrowStatus','escrowReleasedAt'])delete f[k];if(Array.isArray(f.paymentHistory))f.paymentHistory=f.paymentHistory.map(p=>{const r={...p};for(const k of ['platformCommission','netAmount','commissionPercent'])delete r[k];return r;});return f;}
module.exports={institutions,students,link,teachers,contacts,related,safeFee,same};
`);
edit('src/models/ParentChildLink.js',s=>replace(s,"permissions: {",`institutionVerifications: [{ institution: {type:mongoose.Schema.Types.ObjectId,ref:'Institution'}, verified:Boolean, actor:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, at:Date }],
    permissionHistory: [{ actor:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, at:Date, changes:mongoose.Schema.Types.Mixed }],
    permissions: {`));
edit('src/controllers/parent.controller.js',s=>{
 s="const family=require('../services/familyAccess.service');\n"+s;
 const start=s.indexOf('const requestLink =');const end=s.indexOf('// GET /api/parents/children',start);
 s=s.slice(0,start)+`const requestLink = asyncHandler(async (req,res)=>{
 const studentSide=Boolean(req.body.parentEmail||req.body.parentMobile);const actorRole=studentSide?'student':'parent';
 if(!(req.accessibleRoles||req.user.roles).includes(actorRole))throw new AppError('A verified '+actorRole+' role is required.',403);
 const relationship=req.body.relationship||'guardian';if(!['father','mother','guardian','sponsor'].includes(relationship))throw new AppError('Invalid relationship.',422);
 let target;if(studentSide){const phone=String(req.body.parentMobile||'').trim();const email=String(req.body.parentEmail||'').trim().toLowerCase();if(!phone&&!email)throw new AppError('Parent email or mobile required.',422);target=await User.findOne(email?{email}:{phone});if(!target&&phone){const Profile=require('../models/UserProfile');const p=await Profile.findOne({'data.contactNumber':phone});if(p)target=await User.findById(p.user);}}else target=await User.findOne({email:String(req.body.studentEmail||'').trim().toLowerCase()});
 if(!target||target.status!=='active'||!target.roles.includes(studentSide?'parent':'student'))throw new AppError('Matching active '+(studentSide?'parent':'student')+' account not found.',404);
 if(family.same(target,req.user))throw new AppError('You cannot link yourself.',422);
 const parent=studentSide?target._id:req.user._id,student=studentSide?req.user._id:target._id;
 let row=await ParentChildLink.findOne({parent,student});if(row&&row.status!=='rejected')throw new AppError('A link already exists. Check your connections.',409);
 if(row){row.status='pending';row.requestedBy=req.user._id;row.relationship=relationship;row.approvedAt=null;row.institutionVerifications=[];row.institutionVerified=false;await row.save();}else row=await ParentChildLink.create({parent,student,requestedBy:req.user._id,relationship,permissions:{payFees:true,viewHealth:relationship!=='sponsor',giveConsent:relationship!=='sponsor'}});
 await notify(target._id,{title:'Family connection request',body:req.user.fullName+' requested a '+relationship+' connection.',sentBy:req.user._id},{email:true}).catch(()=>{});
 return created(res,row,'Connection request sent. The other account must approve.');
});

`+s.slice(end);
 s=s.replace("ParentChildLink.find({ parent: req.user._id }).populate('student', 'fullName email')","ParentChildLink.find({ $or:[{parent:req.user._id},{student:req.user._id}] }).populate('student', 'fullName email').populate('parent','fullName email')");
 s=s.replace("ParentChildLink.find({ student: req.user._id, status: 'pending' })","ParentChildLink.find({ $or:[{student:req.user._id},{parent:req.user._id}], requestedBy:{$ne:req.user._id}, status:'pending' })");
 s=s.replace("if (link.student.toString() !== req.user._id.toString()) {", "const recipient=family.same(link.requestedBy,link.parent)?link.student:link.parent;\n  if (!family.same(recipient,req.user._id)) {");
 s=s.replace("Only the student can respond to this request.","Only the invited account can respond to this request.");
 s=s.replace("return ok(res, link, `Link request ${decision}.`);","await notify(link.requestedBy,{title:'Family connection '+decision,sentBy:req.user._id},{email:true}).catch(()=>{});\n  return ok(res, link, `Link request ${decision}.`);");
 s=s.replace("const { payFees, viewHealth, giveConsent } = req.body;","const { payFees, viewHealth, giveConsent } = req.body;\n  for(const key of ['payFees','viewHealth','giveConsent'])if(req.body[key]!==undefined&&typeof req.body[key]!=='boolean')throw new AppError('Permissions must be boolean.',422);\n  if(link.relationship==='sponsor'&&(viewHealth===true||giveConsent===true))throw new AppError('Sponsors cannot receive health or consent access.',422);\n  link.permissionHistory.push({actor:req.user._id,at:new Date(),changes:{payFees,viewHealth,giveConsent}});");
 s=s.replace("return ok(res, fees);","return ok(res, fees.map(family.safeFee));");
 s=s.replace("Assignment.find({ course: { $in: courseIds }, published: { $ne: false } }).select('title dueDate maxMarks course type')","Assignment.find({ course: { $in: courseIds }, published: { $ne: false } }).select('title description dueDate maxMarks course type')");
 s=s.replaceAll("Enrollment.find({ student: req.params.studentId }).distinct('course')","Enrollment.find({ student: req.params.studentId,status:{$ne:'dropped'} }).distinct('course')");
 s=s.replace("const exams = await Exam.find({ course: { $in: courseIds }, published: true })","const exams = await Exam.find({ course: { $in: courseIds }, published: true }).select('title type course institution classSection subject scheduledDate closesAt durationMinutes venue instructions academicSession term')");
 s=s.replace("if (f.status === 'paid') g.paid += f.amount;","g.paid += f.paidAmount ?? (f.status==='paid'?f.amount:0);");
 s=s.replace("Enrollment.find({ student: student._id }).distinct('course')","Enrollment.find({ student: student._id,status:{$ne:'dropped'} }).distinct('course')");
 s=s.replace("institutionId: profile?.primaryInstitution?._id || null,","institutionId: profile?.primaryInstitution?._id || null,\n      institutions: await Institution.find({_id:{$in:await family.institutions(student._id)}}).select('name logo address phone email website'),");
 s=s.replace("const enrolledHere = await StudentProfile.exists({ user: { $in: childIds }, primaryInstitution: req.params.institutionId });","const enrolledHere = (await Promise.all(childIds.map(id=>family.institutions(id)))).flat().includes(req.params.institutionId);");
 return s;
});
edit('src/controllers/payment.controller.js',s=>replace(s,"if (!link) throw new AppError('You are not authorized to pay this fee.', 403);","if (!link || link.permissions?.payFees === false) throw new AppError('You are not authorized to pay this fee.', 403);"));
edit('src/controllers/institution.controller.js',s=>{
 s="const family=require('../services/familyAccess.service');\n"+s;
 s=s.replace("const studentIds = await StudentProfile.find({ primaryInstitution: institution._id }).distinct('user');","const studentIds = await family.students(institution._id);");
 s=s.replace("institutionVerified: link.institutionVerified","institutionVerified: link.institutionVerifications?.find(v=>family.same(v.institution,institution._id))?.verified ?? (family.same(link.institutionVerifiedBy,req.user._id)&&link.institutionVerified)");
 s=s.replace("const studentBelongsHere = await StudentProfile.exists({ user: link.student, primaryInstitution: institution._id });","const studentBelongsHere = (await family.institutions(link.student)).includes(String(institution._id));");
 s=s.replace("link.institutionVerified = req.body.verified !== false;","if(typeof req.body.verified!=='boolean')throw new AppError('verified must be boolean.',422);\n  const previous=link.institutionVerifications.find(v=>family.same(v.institution,institution._id));\n  if(previous){previous.verified=req.body.verified;previous.actor=req.user._id;previous.at=new Date();}else link.institutionVerifications.push({institution:institution._id,verified:req.body.verified,actor:req.user._id,at:new Date()});\n  link.institutionVerified = req.body.verified;");return s;
});
edit('src/utils/messageAccess.js',s=>{
 s="const family=require('../services/familyAccess.service');\n"+s;
 s=s.replace("if ([...fromInstitutions].some((id) => toInstitutions.has(id))) return true;","if(await family.related(fromId,toId)||await family.related(toId,fromId))return true;\n  if ([...fromInstitutions].some((id) => toInstitutions.has(id))) return true;");
 s=s.replace("return [...contactMap.values()].sort",`for(const c of await family.contacts(userId))add(c.user,c.relationship,c.context);
  for(const id of institutionIds){const ids=await family.students(id);const i=await Institution.findById(id);if(i&&(idsEqual(i.owner,userId)||i.staff.some(s=>idsEqual(s.user,userId)&&s.role!=='teacher'))){const parents=await ParentChildLink.find({student:{$in:ids},status:'approved'}).populate('parent','fullName email roles profilePhoto');parents.forEach(l=>add(l.parent,'parent',i.name));}}
  return [...contactMap.values()].sort`);return s;
});
console.log('Parent foundation applied');
