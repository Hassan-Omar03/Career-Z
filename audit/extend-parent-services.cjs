const fs=require('fs'),root='D:/Career-Z-backend/src/';
function edit(file,fn){let s=fs.readFileSync(root+file,'utf8').replace(/\r\n/g,'\n');fs.writeFileSync(root+file,fn(s));}
fs.copyFileSync('audit/family-automation.stage.cjs',root+'services/familyAutomation.service.js');
edit('models/FamilyAlert.js',s=>s.replace('kind:String,','kind:String,lockedUntil:Date,'));
edit('services/feeAutomation.service.js',s=>s.replace('const institutionIds =',"await require('./familyAutomation.service').runFamilyAutomation();\n    const institutionIds ="));
edit('controllers/staffPermission.controller.js',s=>s.replace("const GRANTABLE = {","const GRANTABLE = {\n  'parents:manage': 'Manage guardian links and permission requests',"));
edit('controllers/parent.controller.js',s=>s.replace("const key = f.institution?._id?.toString() || 'unknown';","const key = (f.institution?._id?.toString() || 'unknown')+':'+f.currency;")
.replace("g.paid += f.status==='paid'?f.amount:(f.paidAmount||0);","g.paid += ['waived','cancelled','refunded'].includes(f.status)?0:(f.status==='paid'?f.amount:(f.paidAmount||0));")
.replace("remaining: g.total - g.paid","remaining: Math.max(0,g.total - g.paid)")
.replace("'title dueDate maxMarks course type'","'title description dueDate maxMarks course type'"));
edit('controllers/institution.controller.js',s=>{for(const name of ['listInstitutionParents','verifyParentLink']){const start=s.indexOf('const '+name+' ='),end=s.indexOf('\n});',start);const old=s.slice(start,end);s=s.slice(0,start)+old.replace('assertOwnerOrStaff(institution, req.user._id);',"require('./staffPermission.controller').assertOwnerOrPermission(institution, req.user._id,'parents:manage');")+s.slice(end);}return s;});
edit('controllers/family.controller.js',s=>s.replace("const isTeacher=(await family.teachers(studentId)).some(r=>family.same(r.teacher,req.user._id));","const isTeacher=(await family.teachers(studentId)).some(r=>family.same(r.teacher,req.user._id)&&family.same(r.institution,req.params.institutionId));"));
console.log('Family reminders and staff permission controls applied.');
