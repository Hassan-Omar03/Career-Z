const fs=require('node:fs');
let file='audit/parent-multi-account.test.cjs',s=fs.readFileSync(file,'utf8');
s=s.replace('  links[parent+child]=req.body.data._id;',`  links[parent+child]=req.body.data._id;
  assert.equal((await api(parent,'GET',\`/parents/children/\${u[child]._id}/results\`)).status,403,'student consent must not unlock school records');
  if(relationship!=='sponsor'){
    const school=child==='ChildOne'?A:B,owner=child==='ChildOne'?'OwnerA':'OwnerB';
    const url=\`/parents/links/\${req.body.data._id}/schools/\${school._id}/proof\`;
    const documents=['guardian_id','relationship_proof'].map(kind=>({kind,name:kind+'.pdf',mime:'application/pdf',data:Buffer.from('%PDF-1.4 TEST SAMPLE').toString('base64')}));
    assert.equal((await api(parent,'PUT',url,{documents})).status,200);
    assert.equal((await api(parent,'GET',\`/parents/children/\${u[child]._id}/results\`)).status,403,'pending proof must keep records locked');
    assert.equal((await api(owner,'POST',url+'/review',{decision:'approved',reason:'Synthetic test admission match',admissionMatched:true})).status,200);
    assert.equal((await api(parent,'GET',\`/parents/children/\${u[child]._id}/results\`)).status,200);
  }`);
// A school transfer requires new school verification before academic access is restored.
s=s.replace(" const relink=await api('Mother'",` for(const parent of ['Mother','Father']){const l=await model('ParentChildLink').findOne({parent:u[parent]._id,student:u.ChildOne._id});await model('GuardianProof').create({link:l._id,institution:B._id,submittedBy:u[parent]._id,status:'approved',reviewer:u.OwnerB._id});await model('ParentChildLink').updateOne({_id:l._id},{$push:{institutionVerifications:{institution:B._id,verified:true,actor:u.OwnerB._id,at:new Date()}}});}
 const relink=await api('Mother'`);
// The transfer test ends before unlink assertions; new verification is needed before those assertions.
const unlinkMarker="test('unlink immediately";
// Add transfer verification immediately after the transfer test's membership/profile change.
s=s.replace(" await model('StudentProfile').updateOne({user:u.ChildOne._id},{primaryInstitution:B._id});",` await model('StudentProfile').updateOne({user:u.ChildOne._id},{primaryInstitution:B._id});
 assert.equal((await api('Mother','GET',\`/parents/children/\${u.ChildOne._id}/results\`)).status,403,'new school requires its own guardian approval');
 for(const parent of ['Mother','Father']){const l=await model('ParentChildLink').findOne({parent:u[parent]._id,student:u.ChildOne._id});await model('GuardianProof').create({link:l._id,institution:B._id,submittedBy:u[parent]._id,status:'approved',reviewer:u.OwnerB._id});await model('ParentChildLink').updateOne({_id:l._id},{$push:{institutionVerifications:{institution:B._id,verified:true,actor:u.OwnerB._id,at:new Date()}}});}`);
// Remove unnecessary duplicate proof setup inserted before the later relink.
const duplicate=" for(const parent of ['Mother','Father']){const l=await model('ParentChildLink').findOne({parent:u[parent]._id,student:u.ChildOne._id});await model('GuardianProof').create({link:l._id,institution:B._id,submittedBy:u[parent]._id,status:'approved',reviewer:u.OwnerB._id});await model('ParentChildLink').updateOne({_id:l._id},{$push:{institutionVerifications:{institution:B._id,verified:true,actor:u.OwnerB._id,at:new Date()}}});}\n const relink";
s=s.replace(duplicate,' const relink');fs.writeFileSync(file,s);
file='audit/parent-classroom.test.cjs';s=fs.readFileSync(file,'utf8');s=s.replace("const section=await m('ClassSection').create",`const link=await m('ParentChildLink').findOne({parent:p._id});await m('GuardianProof').create({link:link._id,institution:i._id,submittedBy:p._id,status:'approved',reviewer:o._id});await m('ParentChildLink').updateOne({_id:link._id},{$push:{institutionVerifications:{institution:i._id,verified:true,actor:o._id,at:new Date()}}});const section=await m('ClassSection').create`);fs.writeFileSync(file,s);
