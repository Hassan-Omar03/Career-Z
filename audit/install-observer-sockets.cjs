const fs=require('fs'),p='D:/Career-Z-backend/src/realtime/socket.js';let s=fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
s=s.replace("async ({ sessionId, group }  = {}", "async ({ sessionId, group, observeStudentId }  = {}");
s=s.replace("const isTeacher = String(session.teacher._id) === socket.data.userId;\n        if (!isTeacher)","const isTeacher = String(session.teacher._id) === socket.data.userId;\n        const isObserver=!!observeStudentId&&!isTeacher;\n        if(isObserver)await require('../services/guardianObservation.service').authorize(socket.data.userId,session,observeStudentId);\n        if (!isTeacher&&!isObserver)");
s=s.replace("if(!isTeacher)await LiveClassSession.updateOne", "if(!isTeacher&&!isObserver)await LiveClassSession.updateOne");
s=s.replace("role: isTeacher ? 'teacher' : 'student', group:groupName", "role: isTeacher ? 'teacher' : isObserver?'observer':'student',observedStudentId:isObserver?String(observeStudentId):null,institution:String(session.institution),group:groupName");
const signalStart=s.indexOf("socket.on('live-video:signal',"),signalEnd=s.indexOf("\n    socket.on('live-video:message'",signalStart);
s=s.slice(0,signalStart)+`socket.on('live-video:signal',async({sessionId,targetUserId,signal}={},reply=()=>{})=>{
      try{const members=videoRoomMembers.get(sessionId),sender=members?.get(socket.data.userId),target=members?.get(String(targetUserId));if(!sender||!target||sender.group!==target.group)throw new Error('Classroom signaling rejected.');
      for(const member of [sender,target])if(member.role==='observer')await require('../services/guardianObservation.service').authorize(member.userId,sessionId,member.observedStudentId);
      if(sender.role==='observer'&&!require('../services/guardianObservation.service').receiveOnly(signal?.description))throw new Error('Observers may only receive classroom media.');
      io.to(\`user:\${targetUserId}\`).emit('live-video:signal',{sessionId,fromUserId:socket.data.userId,signal});reply({ok:true});}catch(e){reply({ok:false,message:e.message});}
    });
`+s.slice(signalEnd);
s=s.replace("if (!members?.has(socket.data.userId)) throw new Error('Join the classroom first.');","if (!members?.has(socket.data.userId)) throw new Error('Join the classroom first.');\n        if(members.get(socket.data.userId).role==='observer')throw new Error('Observation is read-only.');");
s=s.replace("if (!members?.has(socket.data.userId)) return reply({ ok: false, message: 'Join the classroom first.' });","if (!members?.has(socket.data.userId)||members.get(socket.data.userId).role==='observer') return reply({ ok: false, message: 'Observation is read-only.' });");
s=s.replace("if (!member || member.role === 'teacher')", "if (!member || member.role !== 'student')");
s=s.replace("if (!members?.has(socket.data.userId) || !poll", "if (!members?.has(socket.data.userId) || members.get(socket.data.userId).role!=='student' || !poll");
s=s.replace('module.exports = { initSocket,',`async function revokeObservers(predicate){for(const [sessionId,members] of videoRoomMembers){for(const [id,member] of members){if(member.role!=='observer'||!predicate(member))continue;members.delete(id);emitToUser(id,'live-video:ended',{sessionId});if(io){io.to(\`live-video:\${sessionId}\`).emit('live-video:participant-left',member);for(const socket of await io.in(\`user:\${id}\`).fetchSockets()){socket.leave(\`live-video:\${sessionId}\`);socket.leave(\`live-video:\${sessionId}:group:main\`);}}}}}
async function revokeGuardianObservers(parent,student){await revokeObservers(m=>String(m.userId)===String(parent)&&String(m.observedStudentId)===String(student));}
async function revokeInstitutionObservers(institution){await revokeObservers(m=>String(m.institution)===String(institution));}
module.exports = {revokeGuardianObservers,revokeInstitutionObservers, initSocket,`);
fs.writeFileSync(p,s);console.log('Read-only guardian media signaling and immediate observer revocation installed.');
