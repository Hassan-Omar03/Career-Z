const fs=require('node:fs');
const file='src/components/dashboard/FamilyCenter.jsx';let s=fs.readFileSync(file,'utf8');
s=s.replace("[institutions,setInstitutions]=useState([]),[institution,setInstitution]", "[invite,setInvite]=useState({studentId:'',parentEmail:'',relationship:'guardian'}),[institutions,setInstitutions]=useState([]),[institution,setInstitution]");
const marker='<form style={{...grid,marginTop:16}} onSubmit={async e=>{e.preventDefault();setBusy(true);try{await apiRequest(`/institutions/${institution}/family/consent-requests`';
const form=`<form style={{...card,...grid,marginTop:16,marginBottom:20}} onSubmit={async e=>{e.preventDefault();setBusy(true);try{await apiRequest(\`/institutions/\${institution}/family/invitations\`,{method:'POST',body:invite});setInvite({studentId:'',parentEmail:'',relationship:'guardian'});onFlash('Invitation sent. Parent and student must both approve before guardian documents are reviewed.','success');}catch(err){onFlash(err.message);}finally{setBusy(false);}}}><h3 style={{gridColumn:'1 / -1'}}>Invite a parent / guardian</h3><label>Student<select className="form-select" required value={invite.studentId} onChange={e=>setInvite({...invite,studentId:e.target.value})}><option value="">Choose enrolled student</option>{students.filter(s=>s.user).map(s=><option key={s._id} value={s.user._id}>{s.user.fullName} {s.rollNumber?\`(\${s.rollNumber})\`:''}</option>)}</select></label><label>Registered parent email<input className="form-input" type="email" required value={invite.parentEmail} onChange={e=>setInvite({...invite,parentEmail:e.target.value})}/></label><label>Relationship<select className="form-select" value={invite.relationship} onChange={e=>setInvite({...invite,relationship:e.target.value})}>{['father','mother','guardian'].map(v=><option key={v}>{v}</option>)}</select></label><button className="btn btn-primary" disabled={busy||!institution}>Send family invitation</button></form>`;
if(!s.includes(marker))throw Error('Missing institution form');s=s.replace(marker,form+marker);
s=s.replace('Guardian request sent.','Guardian request sent.');
fs.writeFileSync(file,s);
const proof='src/components/dashboard/GuardianProof.jsx';s=fs.readFileSync(proof,'utf8').replace('Student approval connects accounts. School verification requires guardian ID and relationship proof matched against admission records.','Account approval connects the family. School private records stay locked until this school approves guardian ID and relationship proof matched against admission records.');fs.writeFileSync(proof,s);
const dashboard='src/pages/Dashboard.jsx';s=fs.readFileSync(dashboard,'utf8');const anchor="  if (dash.children.length === 0) {";
const notice=`  const verificationNotice=dash.pendingVerification?.length>0&&<div role="status" className="card" style={{padding:20,marginBottom:20}}><h2>School verification needed</h2><p>{dash.pendingVerification.map(c=>c.name).join(', ')}: private school records are locked until guardian documents are approved by the school.</p><button className="btn btn-primary" onClick={()=>onNavigate?.('children')}>Open My Children to submit documents</button></div>;
  if (dash.children.length === 0 && dash.pendingVerification?.length) return verificationNotice;
`;
if(!s.includes(anchor))throw Error('Missing parent summary');s=s.replace(anchor,notice+anchor).replace('      <ParentUpdates />\n      {/* 1. Children Overview */}','      {verificationNotice}\n      <ParentUpdates />\n      {/* 1. Children Overview */}');fs.writeFileSync(dashboard,s);
const testfile='audit/parent-completion.test.cjs';s=fs.readFileSync(testfile,'utf8').replace("const names=['FamilyObservation'","const names=['GuardianProof','FamilyObservation'");
// Existing tests represent an authorized guardian; explicit new tests cover pending approval.
s=s.replace("async function item(stock=5)","async function verifyGuardian(parentId,studentId,institutionId){const link=await m.ParentChildLink.findOne({parent:parentId,student:studentId});await m.GuardianProof.create({link:link._id,institution:institutionId,submittedBy:parentId,status:'approved',reviewer:o._id,reviewedAt:new Date()});await m.ParentChildLink.updateOne({_id:link._id},{$push:{institutionVerifications:{institution:institutionId,verified:true,actor:o._id,at:new Date()}}});}\nasync function item(stock=5)");
s=s.replace("await m.Enrollment.create({student:s._id,course:c._id,status:'active'});});","await m.Enrollment.create({student:s._id,course:c._id,status:'active'});await verifyGuardian(p._id,s._id,i._id);});");
s=s.replace("const foreign=new mongoose.Types.ObjectId();","await verifyGuardian(p._id,second._id,i._id);const foreign=new mongoose.Types.ObjectId();");
s+=`
test('school private records require current approved proof; dashboard and updates hide unverified children',async()=>{
 const family=r('./src/controllers/family.controller');await m.GuardianProof.updateMany({},{$set:{status:'pending'}});
 assert.equal((await call(parent.childResults,p,{studentId:String(s._id)})).status,403);
 assert.equal((await call(parent.childAttendance,p,{studentId:String(s._id)})).status,403);
 assert.equal((await call(family.overview,p,{studentId:String(s._id)})).status,403);
 const dash=await call(parent.getMyDashboard,p);assert.equal(dash.status,200,dash.error);assert.equal(dash.data.children.length,0);assert.equal(dash.data.pendingVerification[0].name,'student');
 await m.FamilyObservation.create({student:s._id,institution:i._id,actor:t._id,type:'progress',text:'Private progress'});assert.equal((await call(family.updates,p)).data.length,0);
 await m.GuardianProof.updateMany({},{$set:{status:'approved'}});assert.equal((await call(parent.childResults,p,{studentId:String(s._id)})).status,200);assert.equal((await call(family.updates,p)).data.length,1);
 await m.ParentChildLink.updateMany({},{$set:{'institutionVerifications.0.verified':false}});assert.equal((await call(parent.childResults,p,{studentId:String(s._id)})).status,403);
});
test('school invitation requires school permission, school membership, and both account approvals',async()=>{
 const invite=r('./src/controllers/schoolFamilyInvitation.controller');await m.ParentChildLink.deleteMany({});
 const params={institutionId:String(i._id)},body={studentId:String(s._id),parentEmail:p.email,relationship:'father'};
 assert.equal((await call(invite,t,params,body)).status,403);assert.equal((await call(invite,o,params,{...body,studentId:String(x._id)})).status,403);
 const sent=await call(invite,o,params,body);assert.equal(sent.status,201,sent.error);const linkParams={id:String(sent.data._id)};
 assert.equal((await call(parent.respondToLink,x,linkParams,{decision:'approved'})).status,403);
 let response=await call(parent.respondToLink,p,linkParams,{decision:'approved'});assert.equal(response.status,200,response.error);assert.equal(response.data.status,'pending');
 assert.equal((await call(parent.respondToLink,p,linkParams,{decision:'approved'})).status,409);
 response=await call(parent.respondToLink,s,linkParams,{decision:'approved'});assert.equal(response.data.status,'approved');
 assert.equal((await call(parent.childResults,p,{studentId:String(s._id)})).status,403);
});
`;fs.writeFileSync(testfile,s);
