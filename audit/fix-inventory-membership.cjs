const fs=require('node:fs');const root='D:/Career-Z-backend/';
fs.writeFileSync(root+'src/utils/activeStudentMembership.js',`const Membership=require('../models/StudentInstitutionMembership');
const Profile=require('../models/StudentProfile');
// Explicit membership states take precedence over legacy primaryInstitution links.
async function activeStudentInstitutions(student){
 const rows=await Membership.find({student}).select('institution status');
 const ids=rows.filter(row=>row.status==='active').map(row=>row.institution);
 const profile=await Profile.findOne({user:student,status:'active'}).select('primaryInstitution');
 if(profile?.primaryInstitution&&!rows.some(row=>String(row.institution)===String(profile.primaryInstitution)))ids.push(profile.primaryInstitution);
 return ids;
}
async function isActiveStudent(student,institution){return (await activeStudentInstitutions(student)).some(id=>String(id)===String(institution));}
module.exports={activeStudentInstitutions,isActiveStudent};
`);
const path=root+'src/controllers/inventory.controller.js';let s=fs.readFileSync(path,'utf8');
s=s.replace("const Membership = require('../models/StudentInstitutionMembership');", "const Membership = require('../models/StudentInstitutionMembership');\nconst {activeStudentInstitutions,isActiveStudent}=require('../utils/activeStudentMembership');");
s=s.replace("await Membership.exists({institution:id,student:user,status:'active'})", "await isActiveStudent(user,id)");
s=s.replace("...await Membership.find({student:req.user._id,status:'active'}).distinct('institution')", "...await activeStudentInstitutions(req.user._id)");
fs.writeFileSync(path,s);
fs.appendFileSync(root+'test/inventory-lifecycle.test.js',`
test('legacy active primary-institution students can view and request inventory without overriding a withdrawn membership',async()=>{
 const Profile=require('../src/models/StudentProfile');
 await Membership.deleteOne({student:student._id});
 await Profile.create({user:student._id,primaryInstitution:inst._id,status:'active'});
 const data=(await invoke(ctrl.mine,student)).data;
 assert.equal(data.institutions.length,1);assert.equal(data.items.length,1);
 await invoke(ctrl.request,student,{itemId:item.id},{quantity:1});
 await Membership.create({student:student._id,institution:inst._id,status:'withdrawn'});
 assert.equal((await invoke(ctrl.mine,student)).data.items.length,0);
 await assert.rejects(invoke(ctrl.request,student,{itemId:item.id},{quantity:1}),{statusCode:403});
 await Profile.deleteMany({});
});
`);
