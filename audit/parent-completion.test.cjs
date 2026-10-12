const {test,before,after,beforeEach,mock}=require('node:test'),assert=require('node:assert/strict');
const r=require('node:module').createRequire('D:/Career-Z-backend/package.json');process.env.NODE_ENV='test';process.env.DISABLE_SUBSCRIPTION_LIMITS='true';const mongoose=r('mongoose'),{MongoMemoryReplSet}=r('mongodb-memory-server');
const notices=[];mock.method(r('./src/services/notification.service'),'notify',async(id,payload)=>notices.push({id:String(id),...payload}));mock.method(r('./src/services/notification.service'),'notifyParentsOfStudent',async()=>{});
const names=['PtmRecurringSchedule','ClassSection','GuardianProof','FamilyObservation','User','Institution','StudentProfile','StudentInstitutionMembership','ParentChildLink','Course','Enrollment','TimetableEntry','Attendance','Result','Exam','Fee','InstitutionSettings','CafeteriaItem','CafeteriaOrder','Wallet','WalletTransaction','ParentTeacherMeeting','TeacherMeetingCalendar','ParentPrivateProfile','ParentPermission','Complaint','Message','GroupMessage','GroupConversation','Setting','FamilyAlert','FamilyAiUsage','AiCredential','InstitutionFeedback','FamilyWalletSettlement'];const m=Object.fromEntries(names.map(n=>[n,r('./src/models/'+n)]));
const caf=r('./src/controllers/cafeteria.controller'),ptm=r('./src/controllers/ptm.controller'),priv=r('./src/controllers/familyPrivate.controller'),policy=r('./src/controllers/familyPolicy.controller'),parent=r('./src/controllers/parent.controller'),complaint=r('./src/controllers/complaint.controller');
test('ordinary school staff cannot read or issue family fees without finance permission',async()=>{await m.Institution.updateOne({_id:i._id},{$push:{staff:{user:t._id,role:'staff',permissions:[]}}});const ctrl=r('./src/controllers/institution.controller');assert.equal((await call(ctrl.listFees,t,{id:String(i._id)})).status,403);assert.equal((await call(ctrl.createFee,t,{id:String(i._id)},{})).status,403);});
test('reputation disputes cannot select another guardian activity or another school',async()=>{const ctrl=r('./src/controllers/parentReputation.controller');const fee=await m.Fee.create({student:s._id,institution:i._id,amount:100,currency:'PKR',title:'Tuition',recordedBy:o._id,dueDate:new Date()});const body={institutionId:String(i._id),category:'fees',referenceId:String(fee._id),reason:'Review resolution'};assert.equal((await call(ctrl.submitDispute,x,{},body)).status,403);assert.equal((await call(ctrl.submitDispute,p,{},body)).status,201);body.referenceId=String(new mongoose.Types.ObjectId());assert.equal((await call(ctrl.submitDispute,p,{},body)).status,403);});
let db,p,s,t,o,x,i,c;
test('guardian proof requires linked parent, both private documents, school reviewer and admission match',async()=>{const ctrl=r('./src/controllers/guardianProof.controller'),Proof=r('./src/models/GuardianProof');await Proof.init();await Proof.deleteMany({});const params={linkId:String((await m.ParentChildLink.findOne({parent:p._id}))._id),institutionId:String(i._id)};const documents=['guardian_id','relationship_proof'].map(kind=>({kind,name:kind+'.pdf',mime:'application/pdf',data:Buffer.from('%PDF-1.4 test proof').toString('base64')}));assert.equal((await call(ctrl.submit,x,params,{documents})).status,403);assert.equal((await call(ctrl.submit,p,params,{documents:[documents[0]]})).status,422);assert.equal((await call(ctrl.submit,p,params,{documents})).status,200);const raw=await Proof.findOne().select('+documents.encrypted');assert.ok(!raw.documents[0].encrypted.includes(documents[0].data));const review={decision:'approved',reason:'Identity and child relationship match admission record',admissionMatched:true};assert.equal((await call(ctrl.review,t,params,review)).status,403);assert.equal((await call(ctrl.review,o,params,{...review,admissionMatched:false})).status,422);assert.equal((await call(ctrl.review,o,params,review)).status,200);const link=await m.ParentChildLink.findById(params.linkId);assert.equal(link.institutionVerifications[0].verified,true);assert.equal((await call(ctrl.review,o,params,review)).status,409);assert.equal((await call(ctrl.submit,p,params,{documents})).status,200);assert.equal((await m.ParentChildLink.findById(params.linkId)).institutionVerifications[0].verified,false);});
function call(fn,user,params={},body={},query={}){return new Promise(resolve=>{let status=200;const res={status(n){status=n;return this},json(b){resolve({status,data:b.data});return this}};const next=e=>resolve({status:e.statusCode||500,error:e.message});Promise.resolve(fn({user,params,body,query,headers:{},ip:'127.0.0.1'},res,next)).catch(next);});}
before(async()=>{db=await MongoMemoryReplSet.create({replSet:{count:1}});await mongoose.connect(db.getUri());await Promise.all(Object.values(m).map(v=>v.init()));});
after(async()=>{await mongoose.disconnect();await db.stop();});
beforeEach(async()=>{notices.length=0;await Promise.all(Object.values(m).map(v=>v.deleteMany({})));const user=(name,roles)=>m.User.create({fullName:name,email:name+'@complete.local',passwordHash:'x',roles});[p,s,t,o,x]=await Promise.all([user('parent',['parent']),user('student',['student']),user('teacher',['teacher']),user('owner',['institution_owner']),user('other',['parent'])]);i=await m.Institution.create({name:'School',slug:'complete-school',type:'school',owner:o._id,country:'PK',verificationStatus:'approved'});await m.StudentProfile.create({user:s._id,parentName:p.fullName,parentEmail:p.email,parentRelationship:'guardian',primaryInstitution:i._id});await m.ParentChildLink.create({parent:p._id,student:s._id,requestedBy:p._id,status:'approved',relationship:'guardian'});c=await m.Course.create({title:'Math',teacher:t._id,institution:i._id,isFree:true,published:true});await m.Enrollment.create({student:s._id,course:c._id,status:'active'});await verifyGuardian(p._id,s._id,i._id);});
async function verifyGuardian(parentId,studentId,institutionId){const link=await m.ParentChildLink.findOne({parent:parentId,student:studentId});await m.GuardianProof.create({link:link._id,institution:institutionId,submittedBy:parentId,status:'approved',reviewer:o._id,reviewedAt:new Date()});await m.ParentChildLink.updateOne({_id:link._id},{$push:{institutionVerifications:{institution:institutionId,verified:true,actor:o._id,at:new Date()}}});}
async function item(stock=5){return m.CafeteriaItem.create({institution:i._id,name:'Lunch',price:100,currency:'PKR',stock,active:true});}
test('teacher updates carry a verified subject and reject another course or fabricated teacher identity',async()=>{
 const ctrl=r('./src/controllers/family.controller');
 const body={studentId:String(s._id),type:'discipline',text:'Homework not submitted.',courseId:String(c._id),actor:String(x._id),subject:'Fake subject'};
 const roster=await call(ctrl.teachingRoster,t);assert.equal(String(roster.data[0].courseId),String(c._id));
 const created=await call(ctrl.observation,t,{institutionId:String(i._id)},body);assert.equal(created.status,201,created.error);assert.equal(created.data.subject,'Math');assert.equal(String(created.data.actor),String(t._id));
 assert.equal((await call(ctrl.observation,t,{institutionId:String(i._id)},{...body,courseId:undefined})).status,422);
 const other=await m.Course.create({title:'Other',teacher:x._id,institution:i._id,isFree:true});
 assert.equal((await call(ctrl.observation,t,{institutionId:String(i._id)},{...body,courseId:String(other._id)})).status,403);
 assert.equal((await call(ctrl.observation,x,{institutionId:String(i._id)},body)).status,403);
 const feed=await call(ctrl.updates,p);assert.equal(feed.data[0].subject,'Math');assert.equal(feed.data[0].actor.fullName,t.fullName);
});
test('complaint acknowledgement, parent action, teacher review, resolution and reopening retain history',async()=>{
 const ctrl=r('./src/controllers/familyObservation.controller'),family=r('./src/controllers/family.controller');
 const row=await m.FamilyObservation.create({student:s._id,institution:i._id,actor:t._id,subject:'Math',course:c._id,type:'discipline',text:'Homework issue'}),params={id:String(row._id)};
 assert.equal((await call(ctrl.respond,x,params,{action:'parent_reply',text:'Unrelated'})).status,403);
 assert.equal((await call(ctrl.respond,p,params,{action:'resolved',text:'Parent cannot resolve'})).status,403);
 assert.equal((await call(ctrl.respond,p,params,{action:'acknowledged'})).status,200);
 assert.equal((await call(ctrl.respond,p,params,{action:'acknowledged'})).status,409);
 assert.equal((await call(ctrl.respond,p,params,{action:'parent_reply',text:''})).status,422);
 const reply=await call(ctrl.respond,p,params,{action:'parent_reply',text:'I will check homework daily.'});assert.equal(reply.data.status,'awaiting_teacher');
 assert.equal((await call(ctrl.respond,t,params,{action:'follow_up',text:'Checking next week.'})).status,200);
 const done=await call(ctrl.respond,t,params,{action:'resolved',text:'Homework is now complete.'});assert.equal(done.data.status,'resolved');assert.equal(done.data.history.length,4);
 assert.equal((await call(ctrl.respond,p,params,{action:'parent_reply',text:'Replay'})).status,409);
 assert.equal((await call(ctrl.respond,t,params,{action:'reopened',text:'Issue repeated.'})).data.status,'open');
 const feed=await call(family.updates,p);assert.equal(feed.data[0].history[1].actor.fullName,p.fullName);assert.equal(feed.data[0].history.length,5);
 const teachers=await call(ctrl.staffList,t);assert.equal(teachers.data.length,1);
 assert.equal((await call(ctrl.staffList,o,{}, {},{institutionId:String(i._id)})).data.length,1);
 assert.equal((await call(ctrl.staffList,x,{}, {},{institutionId:String(i._id)})).status,403);
});
test('complaint actions are blocked after guardian proof revocation or student withdrawal',async()=>{
 const ctrl=r('./src/controllers/familyObservation.controller');const row=await m.FamilyObservation.create({student:s._id,institution:i._id,actor:t._id,type:'behavior',text:'Issue'}),params={id:String(row._id)};
 await m.ParentChildLink.updateOne({parent:p._id},{$set:{'institutionVerifications.0.verified':false}});
 assert.equal((await call(ctrl.respond,p,params,{action:'parent_reply',text:'Should be blocked'})).status,403);
 await m.StudentInstitutionMembership.create({student:s._id,institution:i._id,status:'withdrawn'});
 assert.equal((await call(ctrl.respond,t,params,{action:'resolved',text:'No longer enrolled'})).status,403);
});
test('a complaint meeting uses its reporting teacher and subject and does not resolve the complaint',async()=>{
 const row=await m.FamilyObservation.create({student:s._id,institution:i._id,actor:t._id,subject:'Math',type:'discipline',text:'Issue'});
 const body={studentId:String(s._id),teacherId:String(t._id),observationId:String(row._id),requestedDate:new Date(Date.now()+86400000).toISOString(),mode:'video'};
 const meeting=await call(ptm.requestMeeting,p,{},body);assert.equal(meeting.status,201,meeting.error);assert.equal(String(meeting.data.observation),String(row._id));assert.equal(meeting.data.subject,'Math');
 assert.equal((await call(ptm.requestMeeting,p,{},body)).status,409);
 assert.equal((await m.FamilyObservation.findById(row._id)).status,'open');
 const feed=await call(r('./src/controllers/family.controller').updates,p);assert.equal(feed.data[0].meetings[0].status,'pending');
 assert.equal((await call(ptm.requestMeeting,p,{}, {...body,teacherId:String(x._id)})).status,403);
 const id=String(meeting.data._id);
 assert.equal((await call(ptm.respondToMeeting,t,{id},{decision:'confirmed'})).status,200);
 for(const user of [p,t]){const mine=await call(ptm.myMeetings,user);const record=mine.data.find(m=>String(m._id)===id);assert.equal(record.status,'confirmed');assert.equal(String(record.observation._id),String(row._id));assert.equal(record.subject,'Math');assert.deepEqual(record.history.map(h=>h.status),['pending','confirmed']);assert.equal(record.history[0].actor.fullName,p.fullName);assert.equal(record.history[1].actor.fullName,t.fullName);}
 assert.equal((await call(ptm.cancelMeeting,p,{id})).status,200);
 const saved=await m.ParentTeacherMeeting.findById(id);assert.deepEqual(saved.history.map(h=>h.status),['pending','confirmed','cancelled']);assert.equal(String(saved.history[2].actor),String(p._id));
});
test('cafeteria menu and management are scoped to current child school and granted staff',async()=>{await item();assert.equal((await call(caf.menu,p,{studentId:String(s._id)})).data.items.length,1);assert.equal((await call(caf.menu,x,{studentId:String(s._id)})).status,403);assert.equal((await call(caf.schoolMenu,t,{id:String(i._id)})).status,403);assert.equal((await call(caf.schoolMenu,o,{id:String(i._id)})).status,200);await m.Institution.updateOne({_id:i._id},{$push:{staff:{user:t._id,role:'staff',permissions:['cafeteria:manage']}}});assert.equal((await call(caf.schoolMenu,t,{id:String(i._id)})).status,200);await m.StudentInstitutionMembership.create({student:s._id,institution:i._id,status:'withdrawn'});assert.equal((await call(caf.menu,p,{studentId:String(s._id)})).data.items.length,0);});
test('cafeteria purchase, retry, student pickup, fulfillment and institution refund preserve real wallet balances',async()=>{const food=await item();await m.Wallet.create({user:p._id,currency:'PKR',available:500});const params={studentId:String(s._id)},body={itemId:String(food._id),quantity:2,requestId:'cafeteria-purchase-001'};let a=await call(caf.purchase,p,params,body);assert.equal(a.status,201,a.error);const id=String(a.data._id),code=a.data.pickupCode;assert.equal((await m.Wallet.findOne({user:p._id})).available,300);assert.equal((await m.Wallet.findOne({user:o._id})).available,200);assert.equal((await m.CafeteriaItem.findById(food._id)).stock,3);assert.equal((await call(caf.purchase,p,params,body)).status,201);assert.equal(await m.CafeteriaOrder.countDocuments(),1);assert.equal((await call(caf.menu,s,params)).data.orders[0].pickupCode,code);assert.equal((await call(caf.updateOrder,o,{orderId:id},{decision:'fulfilled',pickupCode:'wrong'})).status,422);assert.equal((await call(caf.updateOrder,o,{orderId:id},{decision:'fulfilled',pickupCode:code})).status,200);assert.equal((await call(caf.updateOrder,p,{orderId:id},{decision:'refunded',reason:'Cancel'})).status,403);assert.equal((await call(caf.updateOrder,o,{orderId:id},{decision:'refunded',reason:'Collection issue'})).status,200);assert.equal((await m.Wallet.findOne({user:p._id})).available,500);assert.equal((await m.Wallet.findOne({user:o._id})).available,0);assert.equal((await m.CafeteriaItem.findById(food._id)).stock,3);assert.equal((await call(caf.updateOrder,o,{orderId:id},{decision:'refunded',reason:'Replay'})).status,409);});
test('concurrent cafeteria purchases cannot oversell and cancellation returns uncollected stock',async()=>{const food=await item(1);await m.Wallet.create({user:p._id,currency:'PKR',available:500});const params={studentId:String(s._id)};const a=await Promise.all(['cafeteria-concurrent-1','cafeteria-concurrent-2'].map(requestId=>call(caf.purchase,p,params,{itemId:String(food._id),quantity:1,requestId})));assert.equal(a.filter(v=>v.status===201).length,1,JSON.stringify(a));assert.equal((await m.Wallet.findOne({user:p._id})).available,400);const order=await m.CafeteriaOrder.findOne();assert.equal((await call(caf.updateOrder,p,{orderId:String(order._id)},{decision:'refunded',reason:'No longer needed'})).status,200);assert.equal((await m.CafeteriaItem.findById(food._id)).stock,1);assert.equal((await m.Wallet.findOne({user:p._id})).available,500);});
test('cafeteria insufficient funds and revoked guardian payment rights cannot consume stock',async()=>{const food=await item();const params={studentId:String(s._id)},body={itemId:String(food._id),quantity:1,requestId:'cafeteria-no-funds-01'};assert.equal((await call(caf.purchase,p,params,body)).status,422);assert.equal((await m.CafeteriaItem.findById(food._id)).stock,5);await m.ParentChildLink.updateOne({parent:p._id},{'permissions.payFees':false});assert.equal((await call(caf.purchase,p,params,body)).status,403);});
test('different overlapping PTM starts are protected under concurrent confirmation and cancellation releases time',async()=>{const when=new Date(Date.now()+86400000);const meetings=await Promise.all([0,15].map(n=>m.ParentTeacherMeeting.create({parent:p._id,teacher:t._id,student:s._id,requestedDate:new Date(when.getTime()+n*60000)})));const rows=await Promise.all(meetings.map(mtg=>call(ptm.respondToMeeting,t,{id:String(mtg._id)},{decision:'confirmed'})));assert.equal(rows.filter(v=>v.status===200).length,1,JSON.stringify(rows));assert.equal(rows.filter(v=>v.status===409).length,1);const winner=await m.ParentTeacherMeeting.findOne({status:'confirmed'});assert.equal((await call(ptm.cancelMeeting,p,{id:String(winner._id)})).status,200);const pending=await m.ParentTeacherMeeting.findOne({status:'pending'});assert.equal((await call(ptm.respondToMeeting,t,{id:String(pending._id)},{decision:'confirmed'})).status,200);});
test('private bank details are encrypted, masked, parent-only and never included in admin statistics',async()=>{const saved=await call(priv.save,p,{}, {bankName:'Bank',accountTitle:'Parent',accountNumber:'PK12 ABCD 12345678',notes:'Private support note'});assert.equal(saved.status,200,saved.error);assert.equal(saved.data.accountLast4,'5678');assert.equal(saved.data.accountNumber,undefined);const row=await m.ParentPrivateProfile.findOne({user:p._id});assert.ok(!row.accountNumberEncrypted.includes('12345678'));assert.equal(r('./src/utils/encryption').decrypt(row.accountNumberEncrypted),'PK12ABCD12345678');assert.equal((await call(priv.get,x)).data.notes,'');assert.equal((await call(priv.get,s)).status,403);assert.equal((await call(priv.adminSummary,p)).status,403);const admin={_id:o._id,roles:['admin']};const summary=await call(priv.adminSummary,admin);assert.equal(summary.status,200,summary.error);assert.ok(!JSON.stringify(summary.data).includes('Private support note'));});
test('complaint evidence includes only selected own messages and preserves evidence after link removal',async()=>{const own=await m.Message.create({from:t._id,to:p._id,text:'Reported message'}),other=await m.Message.create({from:t._id,to:x._id,text:'Other private message'});const body={subject:'Report',description:'Please review',targetType:'user',targetId:String(t._id),messageIds:[String(other._id)]};assert.equal((await call(complaint.createComplaint,p,{},body)).status,403);body.messageIds=[String(own._id)];const a=await call(complaint.createComplaint,p,{},body);assert.equal(a.status,201,a.error);assert.equal(a.data.messageEvidence[0].text,'Reported message');await m.ParentChildLink.updateOne({parent:p._id},{status:'revoked'});assert.equal((await call(complaint.myComplaints,p)).data[0].messageEvidence.length,1);assert.equal((await call(complaint.myComplaints,x)).data.length,0);});
test('message safety rejects wrong types and configured prohibited terms, while attachment-only chat works',async()=>{await m.Setting.create({key:'chat_blocked_terms',value:['blocked phrase']});const message=r('./src/controllers/message.controller');assert.equal((await call(message.sendMessage,p,{}, {to:String(t._id),text:23})).status,422);assert.equal((await call(message.sendMessage,p,{}, {to:String(t._id),text:'BLOCKED PHRASE'})).status,422);const attachment=await call(message.sendMessage,p,{}, {to:String(t._id),attachments:[{name:'Evidence',url:'https://files.example/a.pdf'}]});assert.equal(attachment.status,201,attachment.error);assert.equal(await m.Message.countDocuments(),1);});
test('institution-funded AI requires owner policy, current membership and explicit consent; prompt excludes other schools',async()=>{await m.AiCredential.collection.insertOne({institution:i._id,user:o._id,scope:'institution',purpose:'text',provider:'gemini',apiKeyEncrypted:'not-a-real-key'});const params={id:String(i._id)};assert.equal((await call(policy.save,t,params,{parentAiEnabled:true,dropoutAbsenceDays:10})).status,403);assert.equal((await call(policy.save,o,params,{parentAiEnabled:true,dropoutAbsenceDays:10})).status,200);assert.equal((await call(policy.choices,p,{studentId:String(s._id)})).data.length,1);await m.Result.create({student:s._id,institution:i._id,subject:'School Math',marksObtained:80,totalMarks:100,recordedBy:t._id});await m.Result.create({student:s._id,institution:new mongoose.Types.ObjectId(),subject:'Other Private School',marksObtained:30,totalMarks:100,recordedBy:t._id});let prompt='';mock.method(r('./src/services/ai.service'),'generate',async(user,system,data,school)=>{assert.equal(String(user),String(o._id));assert.equal(school,String(i._id));prompt=data;return 'Use the recorded support plan.';});const body={question:'How is math?',institutionId:String(i._id)};assert.equal((await call(parent.getAiAssistantInsights,p,{studentId:String(s._id)},body)).status,422);body.dataConsent=true;const a=await call(parent.getAiAssistantInsights,p,{studentId:String(s._id)},body);assert.equal(a.status,200,a.error);assert.ok(prompt.includes('School Math'));assert.ok(!prompt.includes('Other Private School'));assert.equal(await m.FamilyAiUsage.countDocuments(),1);await m.StudentInstitutionMembership.create({student:s._id,institution:i._id,status:'withdrawn'});assert.equal((await call(parent.getAiAssistantInsights,p,{studentId:String(s._id)},body)).status,403);});
test('student can invite approved guardians to a real teacher and rejects arbitrary teachers',async()=>{const ctrl=r('./src/controllers/familyStudent.controller');assert.equal((await call(ctrl.invite,s,{}, {teacherId:String(x._id)})).status,403);const a=await call(ctrl.invite,s,{}, {teacherId:String(t._id),note:'Discuss progress'});assert.equal(a.status,200,a.error);assert.equal(a.data.notified,1);assert.equal(notices[0].id,String(p._id));});
test('school-configured persistent absence alerts and expired meeting requests run once',async()=>{const now=new Date();await m.InstitutionSettings.create({institution:i._id,family:{dropoutAbsenceDays:5}});for(let n=1;n<=5;n++)await m.Attendance.create({institution:i._id,date:new Date(now.getTime()-n*86400000),markedBy:t._id,records:[{student:s._id,status:'absent'}]});await m.ParentTeacherMeeting.create({parent:p._id,teacher:t._id,student:s._id,requestedDate:new Date(now.getTime()-3600000)});const job=r('./src/services/familyAutomation.service').runFamilyAutomation;const a=await job(now);assert.equal(a.sent,5);assert.equal(await m.FamilyAlert.countDocuments({kind:'dropout_warning',delivered:true}),2);assert.equal((await m.ParentTeacherMeeting.findOne()).status,'expired');assert.equal((await job(now)).sent,0);});


test('automatic parent updates include both children and exclude unrelated or ended connections',async()=>{
 const ctrl=r('./src/controllers/family.controller');
 const second=await m.User.create({fullName:'Second child',email:'second@complete.local',passwordHash:'x',roles:['student']});
 await m.StudentProfile.create({user:second._id,primaryInstitution:i._id});
 await m.ParentChildLink.create({parent:p._id,student:second._id,requestedBy:p._id,status:'approved',relationship:'father'});
 await verifyGuardian(p._id,second._id,i._id);const foreign=new mongoose.Types.ObjectId();
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
test('student registration requires a distinct valid guardian email and persists it for school admission',async()=>{
 const auth=r('./src/controllers/auth.controller');const base={fullName:'New Student',email:'new-student@complete.local',password:'Example@Test2026!',country:'Pakistan',city:'Lahore',acceptedTerms:true,accountType:'student'};
 assert.equal((await call(auth.register,null,{},base)).status,422);assert.equal(await m.User.countDocuments({email:base.email}),0);
 assert.equal((await call(auth.register,null,{},{...base,parentEmail:base.email})).status,422);
 const result=await call(auth.register,null,{},{...base,parentEmail:' PARENT@COMPLETE.LOCAL ',parentName:'Parent',parentRelationship:'father'});assert.equal(result.status,201,result.error);
 const student=await m.User.findOne({email:base.email}),profile=await m.StudentProfile.findOne({user:student._id});assert.equal(profile.parentEmail,p.email);assert.equal(profile.parentRelationship,'father');
 assert.equal((await r('./src/models/UserProfile').findOne({user:student._id,role:'student'})).fields.parentEmail,p.email);
 assert.equal(await m.ParentChildLink.countDocuments({student:student._id}),0,'supplying an email must not grant academic access');
});
test('student guardian contact reaches their school roster and school invitations use that saved contact',async()=>{
 const student=r('./src/controllers/student.controller'),institution=r('./src/controllers/institution.controller'),invite=r('./src/controllers/schoolFamilyInvitation.controller');
 assert.equal((await call(student.updateMyProfile,s,{},{parentEmail:s.email})).status,422);
 const result=await call(student.updateMyProfile,s,{},{parentEmail:' PARENT@COMPLETE.LOCAL ',parentName:'Guardian Name',parentRelationship:'mother'});assert.equal(result.status,200,result.error);
 const roster=await call(institution.listInstitutionStudents,o,{id:String(i._id)});assert.equal(roster.status,200,roster.error);assert.equal(roster.data[0].parentEmail,p.email);assert.equal(roster.data[0].parentName,'Guardian Name');
 assert.equal((await call(institution.listInstitutionStudents,x,{id:String(i._id)})).status,403);
 await m.ParentChildLink.deleteMany({});const params={institutionId:String(i._id)},body={studentId:String(s._id)};
 assert.equal((await call(invite,o,params,{...body,parentEmail:x.email})).status,422);
 const invitation=await call(invite,o,params,body);assert.equal(invitation.status,201,invitation.error);assert.equal(String(invitation.data.parent),String(p._id));assert.equal(invitation.data.relationship,'mother');
});
test('missing guardian details block every student profile save without changing saved values',async()=>{
 const student=r('./src/controllers/student.controller'),user=r('./src/controllers/user.controller'),service=r('./src/services/accountVerification.service');
 await r('./src/models/RoleRequest').create({user:s._id,requestedRole:'student',status:'approved'});
 for(const field of ['parentEmail','parentName','parentRelationship']){
   assert.equal((await call(student.updateMyProfile,s,{},{[field]:'',program:'Must not save'})).status,422);
   assert.equal((await m.StudentProfile.findOne({user:s._id})).program,'');
   await assert.rejects(()=>service.saveProfile(s,'student',{[field]:'',program:'Must not save'},{complete:false}),e=>e.statusCode===422);
 }
 await m.StudentProfile.updateOne({user:s._id},{parentName:''});assert.equal((await call(user.updateMe,s,{},{fullName:'Must not save'})).status,422);assert.equal((await m.User.findById(s._id)).fullName,'student');
});
test('one student profile save persists verified, account, guardian and academic fields together',async()=>{
 const service=r('./src/services/accountVerification.service'),cfg=r('./src/config/accountVerification');await r('./src/models/RoleRequest').create({user:s._id,requestedRole:'student',status:'approved'});
 const fields=Object.fromEntries(cfg.profileFields('student','').map(f=>[f.key,f.pattern==='email'?p.email:f.pattern==='phone'?'+923001234567':f.pattern==='cnic'?'3520200000001':f.type==='select'?f.options[0]:f.type==='date'?'2008-01-01':f.type==='image'?'':'Test value']));Object.assign(fields,{fullName:'Student Updated',parentName:'Guardian Updated',parentRelationship:'mother',program:'BSCS',currentTerm:'Semester 1',skills:'JavaScript, Maths',languages:'English, Urdu',profilePhoto:''});
 const saved=await service.saveProfile(s,'student',fields,{complete:true});assert.equal(saved.profile.completed,true);assert.ok(saved.profile.lastSavedAt);
 const refreshed=await service.statusFor(s,{roles:[{role:'student',status:'approved',profileCompleted:true}],accessibleRoles:['student'],state:'ok'});assert.equal(refreshed.roles[0].profile.saved,true);
 const academic=await m.StudentProfile.findOne({user:s._id}),account=await m.User.findById(s._id);assert.equal(academic.parentEmail,p.email);assert.equal(academic.parentName,'Guardian Updated');assert.equal(academic.program,'BSCS');assert.deepEqual(academic.skills,['JavaScript','Maths']);assert.equal(account.fullName,'Student Updated');assert.equal(account.phone,'+923001234567');
});
test('saved draft profiles remain marked saved after reload for every non-student account type',async()=>{
 const service=r('./src/services/accountVerification.service'),cfg=r('./src/config/accountVerification'),Request=r('./src/models/RoleRequest');
 for(const role of cfg.VERIFIED_ROLES.filter(role=>role!=='student')){
  const account=await m.User.create({fullName:'Profile Tester',email:`profile-${role}@test.local`,passwordHash:'test-only-hash',roles:[role],activeRole:role});
  await Request.create({user:account._id,requestedRole:role,status:'approved'});
  const saved=await service.saveProfile(account,role,{}, {complete:false});assert.ok(saved.profile.lastSavedAt,role);
  const status=await service.statusFor(account,{roles:[{role,status:'approved'}],accessibleRoles:[],state:'needs_profile'});assert.equal(status.roles[0].profile.saved,true,role);
 }
});

test('recurring PTM is scoped to the chosen child/class/subject and parent receives the exact join link',async()=>{
 const section=await m.ClassSection.create({institution:i._id,name:'BSCS Semester 1 - A'});
 await m.StudentProfile.updateOne({user:s._id},{$set:{classSection:section._id,rollNumber:'BSCS-001',program:'BSCS'}});
 await m.Course.updateOne({_id:c._id},{$set:{classSection:section._id,subject:'Computing'}});
 const roster=await call(ptm.teachingRoster,t);assert.equal(roster.data[0].className,'BSCS Semester 1 - A');assert.equal(roster.data[0].rollNumber,'BSCS-001');
 const body={studentId:String(s._id),courseId:String(c._id),institutionId:String(i._id),title:'Omar computing review',frequency:'weekly',dayOfWeek:2,time:'16:00',mode:'video'};
 assert.equal((await call(ptm.createRecurringSchedule,x,{},body)).status,403);
 const made=await call(ptm.createRecurringSchedule,t,{},body);assert.equal(made.status,201,made.error);assert.equal(made.data.subject,'Computing');assert.equal(made.data.className,'BSCS Semester 1 - A');
 assert.ok(notices.some(n=>n.id===String(p._id)&&n.body.includes('Class: BSCS Semester 1 - A')&&n.body.includes('Computing')));
 const child2=await m.User.create({fullName:'Other child',email:'other-child@context.local',passwordHash:'x',roles:['student']});await m.StudentProfile.create({user:child2._id,primaryInstitution:i._id,parentName:p.fullName,parentEmail:p.email,parentRelationship:'guardian'});await m.Enrollment.create({student:child2._id,course:c._id,status:'active'});await m.ParentChildLink.create({parent:p._id,student:child2._id,requestedBy:p._id,status:'approved',relationship:'guardian'});await verifyGuardian(p._id,child2._id,i._id);
 assert.equal((await call(ptm.childRecurringSchedules,p,{studentId:String(child2._id)})).data.length,0);
 const slots=await call(ptm.childRecurringSchedules,p,{studentId:String(s._id)});assert.equal(slots.data.length,1);const date=slots.data[0].upcoming[0];
 assert.equal((await call(ptm.bookRecurringOccurrence,p,{id:String(made.data._id)},{studentId:String(child2._id),occurrenceDate:date})).status,403);
 const booked=await call(ptm.bookRecurringOccurrence,p,{id:String(made.data._id)},{studentId:String(s._id),occurrenceDate:date});assert.equal(booked.status,201,booked.error);assert.equal(booked.data.status,'confirmed');assert.equal(booked.data.subject,'Computing');
 const notice=notices.find(n=>n.id===String(p._id)&&n.title==='Parent-Teacher Meeting confirmed');assert.ok(notice.body.includes(booked.data.meetingLink));assert.ok(notice.body.includes('BSCS-001'));assert.ok(notice.body.includes('Teacher: teacher'));assert.ok(notice.body.includes('School: School'));
 for(const user of [p,t]){const mine=await call(ptm.myMeetings,user);assert.equal(mine.data[0].className,'BSCS Semester 1 - A');assert.equal(mine.data[0].rollNumber,'BSCS-001');assert.equal(mine.data[0].parent.fullName,p.fullName);assert.equal(mine.data[0].teacher.fullName,t.fullName);assert.equal(mine.data[0].institution.name,'School');assert.equal(mine.data[0].meetingLink,booked.data.meetingLink);}
});
test('ad-hoc PTM requires exact subject when the child has multiple subjects with the same teacher',async()=>{
 const second=await m.Course.create({title:'Physics',teacher:t._id,institution:i._id,isFree:true});await m.Enrollment.create({student:s._id,course:second._id,status:'active'});
 const body={studentId:String(s._id),teacherId:String(t._id),requestedDate:new Date(Date.now()+86400000).toISOString(),mode:'video'};
 assert.equal((await call(ptm.requestMeeting,p,{},body)).status,422);
 const created=await call(ptm.requestMeeting,p,{}, {...body,courseId:String(second._id)});assert.equal(created.status,201,created.error);assert.equal(created.data.subject,'Physics');assert.equal(String(created.data.institution),String(i._id));
 assert.equal((await call(ptm.respondToMeeting,t,{id:String(created.data._id)},{decision:'confirmed'})).status,200);
 const notice=notices.find(n=>n.id===String(p._id)&&n.title==='Parent-Teacher Meeting confirmed');assert.ok(notice.body.includes('Subject: Physics'));assert.ok(notice.body.includes('/dashboard?ptm='));
});

test('teacher schedules one confirmed full-date PTM and chosen parent receives the identical room and history',async()=>{
 const body={studentId:String(s._id),parentId:String(p._id),courseId:String(c._id),title:'Computing review',requestedDate:new Date(Date.now()+86400000).toISOString(),mode:'video'};
 assert.equal((await call(ptm.scheduleMeeting,x,{},body)).status,403);
 assert.equal((await call(ptm.scheduleMeeting,t,{}, {...body,parentId:String(x._id)})).status,403);
 assert.equal((await call(ptm.scheduleMeeting,t,{}, {...body,requestedDate:new Date(Date.now()-60000).toISOString()})).status,422);
 const made=await call(ptm.scheduleMeeting,t,{},body);assert.equal(made.status,201,made.error);assert.equal(made.data.status,'confirmed');assert.equal(made.data.title,body.title);assert.equal(made.data.confirmedDate.toISOString(),body.requestedDate);assert.ok(made.data.meetingLink.endsWith('/dashboard?ptm='+made.data._id));assert.ok(made.data.history.every(h=>String(h.actor)===String(t._id)));
 const mine=await call(ptm.myMeetings,p);assert.equal(String(mine.data[0]._id),String(made.data._id));assert.equal(mine.data[0].meetingLink,made.data.meetingLink);assert.equal(mine.data[0].subject,'Math');assert.equal(mine.data[0].teacher.fullName,t.fullName);
 const notice=notices.find(n=>n.id===String(p._id)&&n.title==='Parent-Teacher Meeting scheduled');assert.ok(notice.body.includes(made.data.meetingLink));assert.ok(notice.body.includes(body.title));
 const overlap=await call(ptm.scheduleMeeting,t,{}, {...body,requestedDate:new Date(new Date(body.requestedDate).getTime()+15*60000).toISOString()});assert.equal(overlap.status,409,overlap.error);assert.equal(await m.ParentTeacherMeeting.countDocuments(),1);
});

test('explicit course selection does not become ambiguous with a timetable for the same course',async()=>{
 const section=await m.ClassSection.create({institution:i._id,name:'Semester 1 - A'});await m.StudentProfile.updateOne({user:s._id},{classSection:section._id});
 const entry=await m.TimetableEntry.create({institution:i._id,classSection:section._id,teacher:t._id,course:c._id,subject:'Different timetable label',dayOfWeek:'mon',startTime:'09:00',endTime:'10:00',createdBy:o._id});
 const body={studentId:String(s._id),parentId:String(p._id),courseId:String(c._id),title:'Selected course review',requestedDate:new Date(Date.now()+86400000).toISOString()};
 const course=await call(ptm.scheduleMeeting,t,{},body);assert.equal(course.status,201,course.error);assert.equal(course.data.subject,'Math');
 const timetable=await call(ptm.scheduleMeeting,t,{}, {...body,timetableId:String(entry._id),requestedDate:new Date(Date.now()+172800000).toISOString()});assert.equal(timetable.status,201,timetable.error);assert.equal(timetable.data.subject,'Different timetable label');assert.equal(String(timetable.data.timetable),String(entry._id));
});

test('native PTM video permits only its verified parent and teacher and rejects cancelled meetings',async()=>{
 const made=await call(ptm.scheduleMeeting,t,{}, {studentId:String(s._id),parentId:String(p._id),courseId:String(c._id),title:'Private PTM',requestedDate:new Date(Date.now()+86400000).toISOString()});assert.equal(made.status,201,made.error);const params={id:String(made.data._id)};
 for(const user of [p,t]){const video=await call(ptm.video,user,params);assert.equal(video.status,200,video.error);assert.ok(video.data.iceServers.length);assert.equal(String(video.data.meeting.parent),String(p._id));}
 assert.equal((await call(ptm.video,x,params)).status,403);assert.equal((await call(ptm.video,s,params)).status,403);
 await m.ParentTeacherMeeting.updateOne({_id:made.data._id},{status:'cancelled'});assert.equal((await call(ptm.video,p,params)).status,409);
});

test('existing video signaling connects the PTM parent and teacher and blocks outsider and cancelled signals',async()=>{
 const made=await call(ptm.scheduleMeeting,t,{}, {studentId:String(s._id),parentId:String(p._id),courseId:String(c._id),title:'Socket PTM',requestedDate:new Date(Date.now()+86400000).toISOString()});assert.equal(made.status,201,made.error);
 const server=require('node:http').createServer();r('./src/realtime/socket').initSocket(server);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const clients=[];
 try{const io=require('../node_modules/socket.io-client').io;const jwt=r('jsonwebtoken'),env=r('./src/config/env');async function connect(user){const client=io('http://127.0.0.1:'+server.address().port,{transports:['websocket'],auth:{accessToken:jwt.sign({sub:String(user._id)},env.jwt.accessSecret,{expiresIn:'1h'})}});clients.push(client);await new Promise((resolve,reject)=>{client.once('connect',resolve);client.once('connect_error',reject);});return client;}const teacher=await connect(t),guardian=await connect(p),outsider=await connect(x),id='ptm:'+made.data._id;const emit=(client,event,payload)=>new Promise((resolve,reject)=>client.timeout(3000).emit(event,payload,(err,response)=>err?reject(err):resolve(response)));
 assert.equal((await emit(teacher,'live-video:join',{sessionId:id})).ok,true);const joined=await emit(guardian,'live-video:join',{sessionId:id});assert.equal(joined.ok,true);assert.equal(joined.participants[0].role,'teacher');assert.equal((await emit(outsider,'live-video:join',{sessionId:id})).ok,false);
 const received=new Promise(resolve=>guardian.once('live-video:signal',resolve));assert.equal((await emit(teacher,'live-video:signal',{sessionId:id,targetUserId:String(p._id),signal:{description:{type:'offer',sdp:'test-offer'}}})).ok,true);assert.equal((await received).sessionId,id);
 assert.equal((await emit(guardian,'live-video:message',{sessionId:id,text:'Parent joined'})).ok,true);await m.ParentTeacherMeeting.updateOne({_id:made.data._id},{status:'cancelled'});assert.equal((await emit(teacher,'live-video:signal',{sessionId:id,targetUserId:String(p._id),signal:{candidate:{}}})).ok,false);
 }finally{clients.forEach(client=>client.disconnect());await new Promise(resolve=>server.close(resolve));}
});
