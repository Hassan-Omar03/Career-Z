// Guardian proof acceptance: real backend app (src/app: same body limits, account gate and RBAC),
// disposable replica-set database, actual React component in headless Chrome, real files on disk.
// No live account or live database is used. Run: node audit/guardian-proof-browser.cjs (Vite on :5173).
const fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),{spawn}=require('child_process');
const r=require('module').createRequire('D:/Career-Z-backend/package.json');
process.env.NODE_ENV='test';process.env.DISABLE_SUBSCRIPTION_LIMITS='true';
const mongoose=r('mongoose'),{MongoMemoryReplSet}=r('mongodb-memory-server'),jwt=r('jsonwebtoken'),http=require('http');
const notification=r('./src/services/notification.service');notification.notify=async()=>{};notification.notifyParentsOfStudent=async()=>{};notification.notifyAdmins=async()=>{};
const model=n=>r('./src/models/'+n);
const results=[];const pass=m=>{results.push(m);console.log('PASS '+m);};
(async()=>{let db,server,chrome,ws;
 try{
 db=await MongoMemoryReplSet.create({replSet:{count:1}});await mongoose.connect(db.getUri());
 const users={};
 for(const [name,role] of [['Parent','parent'],['Student','student'],['Owner','institution_owner'],['Teacher','teacher'],['OtherParent','parent'],['OtherOwner','institution_owner'],['Staff','teacher'],['Reviewer','teacher']]){
  const user=await model('User').create({fullName:name+' Proof Test',email:name.toLowerCase()+'@proof.local',passwordHash:'x',roles:[role]});users[name]=user;
  await model('RoleRequest').create({user:user._id,requestedRole:role,status:'approved'});await model('UserProfile').create({user:user._id,role,completed:true,percent:100});
 }
 const school=await model('Institution').create({name:'Proof School',slug:'proof-school',type:'school',country:'PK',owner:users.Owner._id,verificationStatus:'approved',
  staff:[{user:users.Staff._id,role:'staff',permissions:[]},{user:users.Reviewer._id,role:'staff',permissions:['parents:manage']}]});
 const otherSchool=await model('Institution').create({name:'Unrelated School',slug:'unrelated-school',type:'school',country:'PK',owner:users.OtherOwner._id,verificationStatus:'approved'});
 await model('StudentProfile').create({user:users.Student._id,primaryInstitution:school._id,rollNumber:'P-01'});
 await model('StudentInstitutionMembership').create({student:users.Student._id,institution:school._id,status:'active'});
 const course=await model('Course').create({title:'Proof Math',teacher:users.Teacher._id,institution:school._id,isFree:true,published:true});
 await model('Enrollment').create({course:course._id,student:users.Student._id,status:'active'});
 const link=await model('ParentChildLink').create({parent:users.Parent._id,student:users.Student._id,requestedBy:users.Parent._id,status:'approved',relationship:'guardian',approvedAt:new Date(Date.now()-60000)});
 await model('GuardianProof').init();

 server=http.createServer(r('./src/app'));await new Promise(res=>server.listen(0,'127.0.0.1',res));
 const base='http://127.0.0.1:'+server.address().port;const env=r('./src/config/env');
 const token=u=>jwt.sign({sub:String(u._id)},env.jwt.accessSecret,{expiresIn:'15m'});
 const api=(u,method,url,body)=>fetch(base+'/api'+url,{method,headers:{Authorization:'Bearer '+token(u),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}).then(async x=>({status:x.status,body:await x.json().catch(()=>null)}));
 const proofUrl=`/parents/links/${link._id}/schools/${school._id}/proof`;

 // Real files (~1.4 MB each, just under the 1.5 MB limit) with correct signatures.
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cz-proof-'));
 const idFile=path.join(dir,'guardian-cnic.jpg'),relFile=path.join(dir,'child-bform.pdf');
 fs.writeFileSync(idFile,Buffer.concat([Buffer.from([0xff,0xd8,0xff,0xe0]),crypto.randomBytes(1400*1024)]));
 fs.writeFileSync(relFile,Buffer.concat([Buffer.from('%PDF-1.4\n'),crypto.randomBytes(1450*1024)]));

 const port=19393;chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--disable-gpu','--remote-debugging-port='+port,'--user-data-dir='+fs.mkdtempSync(path.join(os.tmpdir(),'cz-proof-chrome-')),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let targets;for(let n=0;n<40;n++){try{targets=await(await fetch('http://127.0.0.1:'+port+'/json')).json();if(targets.some(t=>t.type==='page'))break;}catch{}await new Promise(res=>setTimeout(res,250));}
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 let seq=0;const pending=new Map();const errors=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}};
 const call=(method,params={})=>new Promise((res,rej)=>{pending.set(++seq,m=>m.error?rej(Error(method+': '+m.error.message)):res(m.result));ws.send(JSON.stringify({id:seq,method,params}));setTimeout(()=>rej(Error('timeout '+method)),20000).unref();});
 const evaluate=async expression=>{const x=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description||x.exceptionDetails.text);return x.result.value;};
 const wait=ms=>new Promise(res=>setTimeout(res,ms));
 await call('Runtime.enable');await call('DOM.enable');await call('Page.enable');
 await call('Page.navigate',{url:'http://localhost:5173/about'});await wait(2500);
 await evaluate(`window.__f=window.fetch.bind(window);window.fetch=(url,o)=>window.__f(typeof url==='string'&&url.includes('/api/')?${JSON.stringify(base)}+'/api/'+url.split('/api/')[1]:url,o);document.querySelector('#root').style.display='none';const c=document.createElement('div');c.id='proof-test';document.body.appendChild(c);window.__flashes=[];`);
 async function mount(component,user,props,module){
  await evaluate(`(async()=>{const React=await import('/node_modules/.vite/deps/react.js');const DOM=await import('/node_modules/.vite/deps/react-dom_client.js');const mod=await import('/src/components/dashboard/'+${JSON.stringify(module)});localStorage.setItem('cz_access_token',${JSON.stringify(token(user))});localStorage.setItem('cz_user',${JSON.stringify(JSON.stringify(user.toSafeJSON()))});window.__root?.unmount();window.__root=(DOM.createRoot||DOM.default.createRoot)(document.querySelector('#proof-test'));window.__root.render((React.createElement||React.default.createElement)(mod[${JSON.stringify(component)}],{...${JSON.stringify(props)},onFlash:(m)=>window.__flashes.push(m)}));})()`);
  await wait(1200);
 }
 const text=()=>evaluate(`document.querySelector('#proof-test').innerText`);
 const openDetails=async()=>{await evaluate(`(()=>{const d=document.querySelector('#proof-test details');if(!d)throw Error('Guardian document section missing');d.open=true;})()`);await wait(900);};
 const click=label=>evaluate(`(()=>{const b=[...document.querySelectorAll('#proof-test button')].find(b=>b.textContent.trim().startsWith(${JSON.stringify(label)}));if(!b)throw Error('Button missing: '+${JSON.stringify(label)});if(b.disabled)return 'disabled';b.click();return 'clicked';})()`);
 const disabled=label=>evaluate(`[...document.querySelectorAll('#proof-test button')].find(b=>b.textContent.trim().startsWith(${JSON.stringify(label)}))?.disabled`);
 async function chooseFiles(){const doc=await call('DOM.getDocument',{depth:-1,pierce:true});const q=await call('DOM.querySelectorAll',{nodeId:doc.root.nodeId,selector:'#proof-test input[type=file]'});assert.equal(q.nodeIds.length,2,'two file inputs expected');await call('DOM.setFileInputFiles',{nodeId:q.nodeIds[0],files:[idFile]});await call('DOM.setFileInputFiles',{nodeId:q.nodeIds[1],files:[relFile]});await wait(300);}
 async function setNotes(v){await evaluate(`(()=>{const t=document.querySelector('#proof-test textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(t,${JSON.stringify(v)});t.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(200);}
 const proof=()=>model('GuardianProof').findOne({link:link._id,institution:school._id});
 const verified=async()=>((await model('ParentChildLink').findById(link._id)).institutionVerifications||[]).find(v=>String(v.institution)===String(school._id))?.verified===true;

 // 1. Parent uploads both real documents from My Children.
 await mount('FamilyConnections',users.Parent,{},'FamilyCenter.jsx');
 let t=await text();assert(t.includes('Student Proof Test')&&t.includes('Proof School'),t);
 await openDetails();assert((await text()).includes('Not submitted'));
 await chooseFiles();await evaluate(`document.querySelector('#proof-test details form').requestSubmit()`);
 for(let n=0;n<30&&!(await proof());n++)await wait(300);
 assert.equal((await proof())?.status,'pending','proof not stored');await wait(600);
 assert((await text()).includes('Status: pending'),await text());
 const raw=await model('GuardianProof').findOne().select('+documents.encrypted');assert.ok(!raw.documents[0].encrypted.includes(fs.readFileSync(idFile).toString('base64').slice(0,40)),'stored unencrypted');
 const payload=JSON.stringify({documents:[idFile,relFile].map(p=>({kind:'x',name:path.basename(p),mime:'x',data:fs.readFileSync(p).toString('base64')}))}).length;assert.ok(payload<4.5*1024*1024,'request body '+payload+' exceeds the 4.5 MB serverless limit');
 pass('parent uploads guardian CNIC (1.4 MB JPG) and B-Form (1.45 MB PDF) through the real app; request '+(payload/1048576).toFixed(2)+' MB fits the 4.5 MB serverless limit; stored encrypted');
 const big=Buffer.concat([Buffer.from('%PDF-1.4\n'),crypto.randomBytes(1600*1024)]).toString('base64');const small=Buffer.from('%PDF-1.4 ok').toString('base64');
 assert.equal((await api(users.Parent,'PUT',proofUrl,{documents:[{kind:'guardian_id',name:'a.pdf',mime:'application/pdf',data:big},{kind:'relationship_proof',name:'b.pdf',mime:'application/pdf',data:small}]})).status,422);
 assert.equal((await api(users.Parent,'PUT',proofUrl,{documents:[{kind:'guardian_id',name:'a.pdf',mime:'application/pdf',data:Buffer.from('MZ not a pdf').toString('base64')},{kind:'relationship_proof',name:'b.pdf',mime:'application/pdf',data:small}]})).status,422);
 assert.equal((await proof()).status,'pending');
 pass('a 1.6 MB file and a file whose bytes do not match its type are rejected without replacing the pending proof');

 // 2. Access control on the private files.
 for(const [who,expect] of [['OtherParent',403],['Teacher',403],['OtherOwner',403],['Staff',403],['Student',403]]){const x=await api(users[who],'GET',proofUrl);assert.equal(x.status,expect,who+' got '+x.status);}
 assert.equal((await api(users.Reviewer,'GET',proofUrl)).status,200);assert.equal((await api(users.Owner,'GET',proofUrl)).status,200);
 assert.equal((await api(users.OtherOwner,'POST',proofUrl+'/review',{decision:'approved',reason:'x',admissionMatched:true})).status,403);
 assert.equal((await api(users.Teacher,'POST',proofUrl+'/review',{decision:'approved',reason:'x',admissionMatched:true})).status,403);
 const noToken=await fetch(base+'/api'+proofUrl);assert.equal(noToken.status,401);
 pass('other parent, child, teacher, staff without parents:manage, unrelated school and anonymous are refused; owner and parents:manage reviewer allowed');

 // 3. Institute downloads both files and they are byte-identical.
 const downloads=fs.mkdtempSync(path.join(os.tmpdir(),'cz-proof-dl-'));await call('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
 await mount('default',users.Owner,{linkId:String(link._id),institutionId:String(school._id),review:true},'GuardianProof.jsx');await openDetails();
 assert.equal(await click('Download guardian ID'),'clicked');assert.equal(await click('Download relationship proof'),'clicked');
 const got=n=>path.join(downloads,n);for(let n=0;n<40&&!(fs.existsSync(got('guardian-cnic.jpg'))&&fs.existsSync(got('child-bform.pdf')));n++)await wait(300);
 assert.ok(fs.readFileSync(got('guardian-cnic.jpg')).equals(fs.readFileSync(idFile)),'ID download differs');assert.ok(fs.readFileSync(got('child-bform.pdf')).equals(fs.readFileSync(relFile)),'proof download differs');
 pass('institution downloads both documents in the browser; files are byte-identical to the uploads');

 // 4. Approval requires notes and the admission-record match.
 assert.equal(await disabled('Approve verified guardian'),true);await setNotes('CNIC and B-Form match admission file A-17');assert.equal(await disabled('Approve verified guardian'),true,'approve enabled without admission match');
 assert.equal((await api(users.Owner,'POST',proofUrl+'/review',{decision:'approved',reason:'x',admissionMatched:false})).status,422);
 await evaluate(`document.querySelector('#proof-test input[type=checkbox]').click()`);await wait(200);assert.equal(await disabled('Approve verified guardian'),false);
 await click('Approve verified guardian');for(let n=0;n<20&&(await proof()).status!=='approved';n++)await wait(300);
 assert.equal((await proof()).status,'approved');assert.equal(await verified(),true);
 assert.equal((await api(users.Owner,'POST',proofUrl+'/review',{decision:'approved',reason:'again',admissionMatched:true})).status,409);
 pass('approve stays disabled until notes and admission-record match; approval verifies this school link; replay refused');

 // 5. Parent sees the decision.
 await mount('FamilyConnections',users.Parent,{},'FamilyCenter.jsx');await openDetails();t=await text();assert(t.includes('Status: approved')&&t.includes('A-17'),t);
 pass('parent sees approved status and the school note');

 // 6. Resubmission resets verification; school rejects; parent sees reason.
 await chooseFiles();await evaluate(`document.querySelector('#proof-test details form').requestSubmit()`);for(let n=0;n<30&&(await proof()).status!=='pending';n++)await wait(300);
 assert.equal((await proof()).status,'pending');assert.equal(await verified(),false,'resubmission did not reset verification');
 await mount('default',users.Reviewer,{linkId:String(link._id),institutionId:String(school._id),review:true},'GuardianProof.jsx');await openDetails();
 await setNotes('B-Form name does not match admission record');assert.equal(await disabled('Reject proof'),false);await click('Reject proof');
 for(let n=0;n<20&&(await proof()).status!=='rejected';n++)await wait(300);assert.equal((await proof()).status,'rejected');assert.equal(await verified(),false);
 await mount('FamilyConnections',users.Parent,{},'FamilyCenter.jsx');await openDetails();t=await text();assert(t.includes('Status: rejected')&&t.includes('does not match'),t);
 pass('resubmission resets verification; parents:manage reviewer rejects with reason; parent sees rejection');

 // 7. Revoked link loses access; renewed link cannot be verified with old proof.
 await model('ParentChildLink').updateOne({_id:link._id},{status:'revoked'});
 assert.equal((await api(users.Parent,'GET',proofUrl)).status,403);assert.equal((await api(users.Owner,'GET',proofUrl)).status,403);
 assert.equal((await api(users.Parent,'PUT',proofUrl,{documents:[]})).status,403);
 await model('GuardianProof').updateOne({link:link._id},{status:'pending'});
 await model('ParentChildLink').updateOne({_id:link._id},{status:'approved',approvedAt:new Date(Date.now()+1000)});
 assert.equal((await api(users.Owner,'POST',proofUrl+'/review',{decision:'approved',reason:'old proof',admissionMatched:true})).status,409);assert.equal(await verified(),false);
 pass('revoked link blocks parent and school access; proof from before a renewed link cannot verify it');

 // 8. Withdrawn child: school loses access.
 await model('StudentInstitutionMembership').updateOne({student:users.Student._id},{status:'withdrawn'});await model('StudentProfile').updateOne({user:users.Student._id},{primaryInstitution:otherSchool._id});
 assert.equal((await api(users.Owner,'GET',proofUrl)).status,403);
 pass('after withdrawal the former school can no longer open the documents');

 assert.equal(errors.length,0,'browser exceptions: '+errors.join(' | '));
 console.log(`\n${results.length}/${results.length} guardian proof browser checks passed`);
 }finally{ws?.close();chrome?.kill();if(server)await new Promise(res=>server.close(res));await mongoose.disconnect();if(db)await db.stop();}
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1;});
