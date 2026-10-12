const fs=require('node:fs'),root='D:/Career-Z-backend/src/';
let p=root+'controllers/familyObservation.controller.js',s=fs.readFileSync(p,'utf8');
s=s.replace("async function staffAccess(row,user){", "async function staffAccess(row,user){\n const student=row.student?._id||row.student,institution=row.institution?._id||row.institution;");
s=s.replace('family.institutions(row.student)','family.institutions(student)').replace('String(row.institution)))throw','String(institution)))throw').replace("model('Institution').findById(row.institution)","model('Institution').findById(institution)").replace('family.teachers(row.student)','family.teachers(student)').replace('family.same(i,row.institution)','family.same(i,institution)');
s=s.replace('async function decorate(rows)', 'async function decorate(rows,userId)');
s=s.replace('const data=row.toObject();','const data=row.toObject();data.acknowledgedByMe=!!userId&&(row.history||[]).some(h=>h.action===\'acknowledged\'&&family.same(h.actor,userId));');
fs.writeFileSync(p,s);
p=root+'controllers/family.controller.js';s=fs.readFileSync(p,'utf8');s=s.replace(".decorate(rows));",".decorate(rows,req.user._id));");
// Only guardians verified by this school receive this school's notification.
s=s.replace(" await require('../services/notification.service').notifyParentsOfStudent(studentId,{title:'Child '+type+' update',body:row.text,sentBy:req.user._id},{email:true}).catch(()=>{});return created(res,row);",` const links=await model('ParentChildLink').find({student:studentId,status:'approved'});for(const link of links)if((await family.verifiedInstitutions(link)).includes(String(row.institution)))await notify(link.parent,{title:'Child '+type+' update',body:row.text,sentBy:req.user._id},{email:true}).catch(()=>{});return created(res,row);`);
fs.writeFileSync(p,s);
