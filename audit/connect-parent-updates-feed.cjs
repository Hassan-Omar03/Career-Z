const fs=require('node:fs');
const file='src/components/dashboard/FamilyCenter.jsx';let s=fs.readFileSync(file,'utf8');
s="import ParentUpdates from './ParentUpdates';\n"+s;
s=s.replace('return <section><div style={{...grid,marginBottom:20}}><label>Child<select', 'return <section>{[\'performance\',\'results\'].includes(kind)&&<><ParentUpdates/><h2>Detailed child records</h2></>}<div style={{...grid,marginBottom:20}}><label>Child<select');
const start=s.indexOf('<h3>Teacher feedback & improvement</h3>');const end=s.indexOf('</>}',start);if(start<0||end<0)throw Error('Feedback section missing');s=s.slice(0,start)+s.slice(end);
fs.writeFileSync(file,s);
const dashboard='src/pages/Dashboard.jsx';s=fs.readFileSync(dashboard,'utf8');s="import ParentUpdates from '../components/dashboard/ParentUpdates';\n"+s;s=s.replace('{/* 1. Children Overview */}','<ParentUpdates />\n      {/* 1. Children Overview */}');fs.writeFileSync(dashboard,s);
const testfile='audit/parent-completion.test.cjs';s=fs.readFileSync(testfile,'utf8');s=s.replace("const names=['User'","const names=['FamilyObservation','User'");s+=`
test('automatic parent updates include both children and exclude unrelated or ended connections',async()=>{
 const ctrl=r('./src/controllers/family.controller');
 const second=await m.User.create({fullName:'Second child',email:'second@complete.local',passwordHash:'x',roles:['student']});
 await m.StudentProfile.create({user:second._id,primaryInstitution:i._id});
 await m.ParentChildLink.create({parent:p._id,student:second._id,requestedBy:p._id,status:'approved',relationship:'father'});
 const foreign=new mongoose.Types.ObjectId();
 await m.FamilyObservation.create([
 {student:s._id,institution:i._id,actor:t._id,type:'progress',text:'First child progress'},
 {student:second._id,institution:i._id,actor:t._id,type:'achievement',text:'Second child achievement'},
 {student:x._id,institution:i._id,actor:t._id,type:'progress',text:'Unrelated child'},
 {student:s._id,institution:foreign,actor:t._id,type:'progress',text:'Former school'}]);
 let result=await call(ctrl.updates,p);assert.equal(result.status,200,result.error);assert.equal(result.data.length,2);assert.deepEqual(new Set(result.data.map(v=>v.student.fullName)),new Set(['student','Second child']));assert.ok(result.data.every(v=>v.actor.fullName==='teacher'&&v.institution.name==='School'));
 assert.equal((await call(ctrl.updates,x)).data.length,0);
 await m.ParentChildLink.updateOne({parent:p._id,student:second._id},{status:'revoked'});assert.equal((await call(ctrl.updates,p)).data.length,1);
 await m.StudentInstitutionMembership.create({student:s._id,institution:i._id,status:'withdrawn'});assert.equal((await call(ctrl.updates,p)).data.length,0);
});
`;fs.writeFileSync(testfile,s);
