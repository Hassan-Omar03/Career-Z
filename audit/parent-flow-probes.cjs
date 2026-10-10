// Read-only application audit against an isolated temporary database. No live users touched.
const { createRequire } = require('node:module');
const requireBackend = createRequire('D:/Career-Z-backend/package.json');
const mongoose = requireBackend('mongoose');
const { MongoMemoryServer } = requireBackend('mongodb-memory-server');
const model = name => requireBackend('./src/models/' + name);
const User=model('User'), Link=model('ParentChildLink'), Profile=model('StudentProfile'), Institution=model('Institution'), Course=model('Course'), Enrollment=model('Enrollment'), Exam=model('Exam'), Attendance=model('Attendance');
const parent=requireBackend('./src/controllers/parent.controller');
const institutionCtrl=requireBackend('./src/controllers/institution.controller');
const access=requireBackend('./src/utils/messageAccess');
function invoke(handler,user,params={},body={}) { return new Promise(resolve=>{ const res={status(){return this;},json(value){resolve({status:200,data:value.data});}}; const next=e=>resolve({status:e.statusCode||500,error:e.message}); Promise.resolve(handler({user,params,body,query:{}},res,next)).catch(next); }); }
(async()=>{
 const mongo=await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri());
 try {
  const user=async(name,roles)=>User.create({fullName:name,email:name.toLowerCase()+'@audit.local',passwordHash:'unused',roles});
  const guardian=await user('Parent',['parent']), child=await user('Child',['student']), teacher=await user('Teacher',['teacher']), owner=await user('Owner',['institution_owner']), outsider=await user('Outsider',['student']), sibling=await user('Sibling',['student']);
  const school=await Institution.create({name:'Audit school',slug:'audit-school',type:'school',country:'PK',owner:owner._id,verificationStatus:'approved'});
  const second=await Institution.create({name:'Audit academy',slug:'audit-academy',type:'academy',country:'PK',owner:owner._id,verificationStatus:'approved'});
  await Profile.create({user:child._id,primaryInstitution:school._id});
  await model('StudentInstitutionMembership').create({student:child._id,institution:second._id,status:'active'});
  const link=await Link.create({parent:guardian._id,student:child._id,status:'approved',requestedBy:guardian._id});
  const course=await Course.create({title:'Math',teacher:teacher._id,institution:school._id,published:true,isFree:true});
  await Enrollment.create({student:child._id,course:course._id,status:'active'});
  const findings=[];
  const contacts=await access.communicationContacts(teacher._id);
  findings.push({id:'P01',teacherListsParent:contacts.some(c=>String(c.user._id)===String(guardian._id)),teacherCanMessageParent:await access.canCommunicate(teacher._id,guardian._id),parentCanMessageTeacher:await access.canCommunicate(guardian._id,teacher._id),parentCanMessageOwner:await access.canCommunicate(guardian._id,owner._id)});
  const listing=await invoke(parent.myLinkRequests,child);
  findings.push({id:'P02',studentConnectedGuardianCount:listing.data?.length,actualApprovedGuardianCount:await Link.countDocuments({student:child._id,status:'approved'})});
  await Exam.collection.insertOne({course:course._id,teacher:teacher._id,title:'Future paper',published:true,scheduledDate:new Date(Date.now()+86400000),questions:[{text:'Secret paper question',type:'mcq',options:['A','B'],correctOption:1,marks:5}]});
  const exams=await invoke(parent.childExams,guardian,{studentId:String(child._id)});
  findings.push({id:'P03',scheduleReturnsPaper:!!exams.data?.[0]?.questions?.length,scheduleReturnsAnswerKey:exams.data?.[0]?.questions?.[0]?.correctOption===1});
  const unauthorized=await invoke(parent.childAttendance,guardian,{studentId:String(sibling._id)});
  await Attendance.create({date:new Date(),markedBy:teacher._id,records:[{student:child._id,status:'present'},{student:sibling._id,status:'absent'}]});
  const own=await invoke(parent.childAttendance,guardian,{studentId:String(child._id)});
  findings.push({id:'P04',unlinkedChildStatus:unauthorized.status,ownAttendanceStatus:own.status,otherStudentRowsReturned:own.data?.flatMap(a=>a.records).filter(r=>String(r.student)!==String(child._id)).length});
  const secondary=await invoke(institutionCtrl.listInstitutionParents,owner,{id:String(second._id)});
  findings.push({id:'P05',secondaryInstitutionParentCount:secondary.data?.length,activeSecondaryMembershipCount:await model('StudentInstitutionMembership').countDocuments({student:child._id,institution:second._id,status:'active'})});
  const arbitrary=await invoke(parent.requestLink,outsider,{}, {studentEmail:sibling.email,relationship:'father'});
  findings.push({id:'P06',studentWithoutParentRoleCanRequestGuardianLink:!!arbitrary.data?._id,error:arbitrary.error||null});
  await Link.deleteOne({_id:link._id});
  const revoked=await invoke(parent.childAttendance,guardian,{studentId:String(child._id)});
  findings.push({id:'P07',revokedAccessStatus:revoked.status});
  console.log(JSON.stringify(findings,null,2));
 }finally {await mongoose.disconnect();await mongo.stop();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
