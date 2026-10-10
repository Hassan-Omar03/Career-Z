// Multi-account family acceptance over real HTTP (src/app: account gate, RBAC, body limits),
// disposable replica-set database, synthetic accounts. Run: node --test audit/parent-multi-account.test.cjs
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
const r=require('node:module').createRequire('D:/Career-Z-backend/package.json');
process.env.NODE_ENV='test';process.env.DISABLE_SUBSCRIPTION_LIMITS='true';
const mongoose=r('mongoose'),{MongoMemoryReplSet}=r('mongodb-memory-server'),jwt=r('jsonwebtoken');
const n=r('./src/services/notification.service');n.notify=async()=>{};n.notifyParentsOfStudent=async()=>{};n.notifyAdmins=async()=>{};
const model=x=>r('./src/models/'+x);
let db,server,base,u={},A,B,links={};
const token=x=>jwt.sign({sub:String(x._id)},r('./src/config/env').jwt.accessSecret,{expiresIn:'15m'});
const api=(who,method,url,body)=>fetch(base+'/api'+url,{method,headers:{Authorization:'Bearer '+token(u[who]),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}).then(async x=>({status:x.status,body:await x.json().catch(()=>null)}));
const ids=rows=>(rows||[]).map(x=>String(x.student?._id||x.student||x._id));

before(async()=>{
 db=await MongoMemoryReplSet.create({replSet:{count:1}});await mongoose.connect(db.getUri());
 for(const [name,role] of [['Mother','parent'],['Father','parent'],['Sponsor','parent'],['ChildOne','student'],['ChildTwo','student'],['OwnerA','institution_owner'],['OwnerB','institution_owner'],['TeacherA','teacher'],['TeacherB','teacher']]){
  u[name]=await model('User').create({fullName:name,email:name.toLowerCase()+'@multi.local',passwordHash:'x',roles:[role]});
  await model('RoleRequest').create({user:u[name]._id,requestedRole:role,status:'approved'});await model('UserProfile').create({user:u[name]._id,role,completed:true,percent:100});
 }
 A=await model('Institution').create({name:'School A',slug:'multi-a',type:'school',country:'PK',owner:u.OwnerA._id,verificationStatus:'approved'});
 B=await model('Institution').create({name:'School B',slug:'multi-b',type:'school',country:'PK',owner:u.OwnerB._id,verificationStatus:'approved'});
 for(const [child,school] of [['ChildOne',A],['ChildTwo',B]]){
  await model('StudentProfile').create({user:u[child]._id,primaryInstitution:school._id});
  await model('StudentInstitutionMembership').create({student:u[child]._id,institution:school._id,status:'active'});
 }
 const cA=await model('Course').create({title:'A Math',teacher:u.TeacherA._id,institution:A._id,isFree:true,published:true});
 const cB=await model('Course').create({title:'B Science',teacher:u.TeacherB._id,institution:B._id,isFree:true,published:true});
 await model('Enrollment').create({course:cA._id,student:u.ChildOne._id,status:'active'});await model('Enrollment').create({course:cB._id,student:u.ChildTwo._id,status:'active'});
 await model('Result').create({student:u.ChildOne._id,institution:A._id,course:cA._id,subject:'A Math',marksObtained:70,totalMarks:100,recordedBy:u.TeacherA._id});
 await model('Result').create({student:u.ChildTwo._id,institution:B._id,course:cB._id,subject:'B Science',marksObtained:90,totalMarks:100,recordedBy:u.TeacherB._id});
 await model('Fee').create({student:u.ChildTwo._id,institution:B._id,title:'B Tuition',amount:500,currency:'PKR',recordedBy:u.OwnerB._id});
 server=http.createServer(r('./src/app'));await new Promise(res=>server.listen(0,'127.0.0.1',res));base='http://127.0.0.1:'+server.address().port;
});
after(async()=>{await new Promise(res=>server.close(res));await mongoose.disconnect();await db.stop();});

test('two guardians, a sponsor and two children at different schools are linked only after each child approves',async()=>{
 for(const [parent,child,relationship] of [['Mother','ChildOne','mother'],['Mother','ChildTwo','mother'],['Father','ChildOne','father'],['Sponsor','ChildTwo','sponsor']]){
  const req=await api(parent,'POST','/parents/link-requests',{studentEmail:u[child].email,relationship});assert.equal(req.status,201,parent+'→'+child+': '+JSON.stringify(req.body));
  assert.equal((await api(parent,'GET',`/parents/children/${u[child]._id}/results`)).status,403,'access before approval');
  assert.equal((await api(parent,'PATCH',`/parents/link-requests/${req.body.data._id}/respond`,{decision:'approved'})).status,403,'requester approved own request');
  assert.equal((await api(child,'PATCH',`/parents/link-requests/${req.body.data._id}/respond`,{decision:'approved'})).status,200);
  links[parent+child]=req.body.data._id;
 }
 const mother=(await api('Mother','GET','/parents/children')).body.data;assert.deepEqual(ids(mother).sort(),[String(u.ChildOne._id),String(u.ChildTwo._id)].sort());
 assert.deepEqual(ids((await api('Father','GET','/parents/children')).body.data),[String(u.ChildOne._id)]);
 assert.deepEqual(ids((await api('Sponsor','GET','/parents/children')).body.data),[String(u.ChildTwo._id)]);
 const guardians=(await api('ChildOne','GET','/parents/link-requests')).body.data.filter(l=>l.status==='approved');assert.equal(guardians.length,2,'ChildOne should list two guardians');
});

test('each guardian sees only their own child and that child’s school data',async()=>{
 const one=(await api('Mother','GET',`/parents/children/${u.ChildOne._id}/results`)).body.data,two=(await api('Mother','GET',`/parents/children/${u.ChildTwo._id}/results`)).body.data;
 assert.ok(JSON.stringify(one).includes('A Math')&&!JSON.stringify(one).includes('B Science'));assert.ok(JSON.stringify(two).includes('B Science')&&!JSON.stringify(two).includes('A Math'));
 assert.equal((await api('Father','GET',`/parents/children/${u.ChildTwo._id}/results`)).status,403);
 assert.equal((await api('Sponsor','GET',`/parents/children/${u.ChildOne._id}/results`)).status,403);
 const dirA=JSON.stringify((await api('OwnerA','GET',`/institutions/${A._id}/parents`)).body);assert.ok(dirA.includes('Mother')&&dirA.includes('Father')&&!dirA.includes('Sponsor'),dirA);
 const dirB=JSON.stringify((await api('OwnerB','GET',`/institutions/${B._id}/parents`)).body);assert.ok(dirB.includes('Mother')&&dirB.includes('Sponsor')&&!dirB.includes('Father'),dirB);
 assert.equal((await api('OwnerA','GET',`/institutions/${B._id}/parents`)).status,403);
});

test('sponsor is view/pay-only and the child can restrict one guardian without affecting the other',async()=>{
 assert.equal((await api('Sponsor','GET',`/parents/children/${u.ChildTwo._id}/fees`)).status,200);
 assert.equal((await api('Sponsor','GET',`/parents/children/${u.ChildTwo._id}/health`)).status,403);
 assert.equal((await api('ChildTwo','PATCH',`/parents/link-requests/${links.SponsorChildTwo}/permissions`,{viewHealth:true})).status,422,'sponsor received health access');
 assert.equal((await api('Mother','GET',`/parents/children/${u.ChildOne._id}/health`)).status,200);
 assert.equal((await api('Father','PATCH',`/parents/link-requests/${links.FatherChildOne}/permissions`,{viewHealth:false})).status,403,'guardian changed own permissions');
 assert.equal((await api('ChildOne','PATCH',`/parents/link-requests/${links.FatherChildOne}/permissions`,{viewHealth:'false'})).status,422,'string boolean accepted');
 assert.equal((await api('ChildOne','PATCH',`/parents/link-requests/${links.FatherChildOne}/permissions`,{viewHealth:false,payFees:false})).status,200);
 assert.equal((await api('Father','GET',`/parents/children/${u.ChildOne._id}/health`)).status,403);
 assert.equal((await api('Mother','GET',`/parents/children/${u.ChildOne._id}/health`)).status,200,'restriction leaked to the other guardian');
 const fee=await model('Fee').create({student:u.ChildOne._id,institution:A._id,title:'A Tuition',amount:300,currency:'PKR',recordedBy:u.OwnerA._id});
 await model('Wallet').create({user:u.Father._id,currency:'PKR',available:1000});
 assert.equal((await api('Father','POST',`/parents/fees/${fee._id}/wallet-payment`,{amount:300,requestId:'multi-father-pay-01'})).status,403,'restricted guardian paid');
 assert.equal((await model('Wallet').findOne({user:u.Father._id})).available,1000);
});

test('transfer from School A to School B moves school access with the child',async()=>{
 await model('StudentInstitutionMembership').updateOne({student:u.ChildOne._id,institution:A._id},{status:'withdrawn'});
 await model('StudentInstitutionMembership').create({student:u.ChildOne._id,institution:B._id,status:'active'});
 await model('StudentProfile').updateOne({user:u.ChildOne._id},{primaryInstitution:B._id});
 const dirA=JSON.stringify((await api('OwnerA','GET',`/institutions/${A._id}/parents`)).body);assert.ok(!dirA.includes('Father'),'old school still lists the transferred child’s guardian');
 const dirB=JSON.stringify((await api('OwnerB','GET',`/institutions/${B._id}/parents`)).body);assert.ok(dirB.includes('Father'),'new school does not list the guardian');
 const kids=(await api('Father','GET','/parents/children')).body.data;const schools=JSON.stringify(kids[0].student?.institutions||[]);assert.ok(schools.includes('School B')&&!schools.includes('School A'),schools);
 assert.equal((await api('Father','POST',`/parents/institutions/${A._id}/feedback`,{rating:5,comment:'x'})).status,403,'former school still accepts feedback');
});

test('unlink by the child or the guardian removes access immediately and cannot be replayed',async()=>{
 assert.equal((await api('ChildTwo','DELETE',`/parents/link-requests/${links.SponsorChildTwo}`)).status,200);
 assert.equal((await api('Sponsor','GET',`/parents/children/${u.ChildTwo._id}/fees`)).status,403);assert.equal(ids((await api('Sponsor','GET','/parents/children')).body.data).length,0);
 assert.equal((await api('Sponsor','DELETE',`/parents/link-requests/${links.SponsorChildTwo}`)).status,409);
 assert.equal((await api('Father','DELETE',`/parents/link-requests/${links.MotherChildOne}`)).status,403,'another guardian removed a link');
 assert.equal((await api('Mother','DELETE',`/parents/link-requests/${links.MotherChildTwo}`)).status,200);
 assert.equal((await api('Mother','GET',`/parents/children/${u.ChildTwo._id}/results`)).status,403);
 assert.equal((await api('Mother','GET',`/parents/children/${u.ChildOne._id}/results`)).status,200,'unlinking one child removed the other');
 const relink=await api('Mother','POST','/parents/link-requests',{studentEmail:u.ChildTwo.email,relationship:'mother'});assert.equal(relink.status,201);
 assert.equal((await api('Mother','GET',`/parents/children/${u.ChildTwo._id}/results`)).status,403,'re-request restored access without approval');
});
