// Parent dashboard UX acceptance: real login through the real Login page, real backend app
// (src/app) on a disposable replica set, headless Chrome. Checks 390px layout, keyboard focus
// order/visibility, accessible names (Chrome accessibility tree — not an actual screen reader)
// and language switching. Google Translate is NOT configured locally, so the translation
// provider is stubbed in the browser and labelled as such in the output.
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict'),{spawn}=require('child_process'),http=require('http');
const r=require('module').createRequire('D:/Career-Z-backend/package.json');process.env.NODE_ENV='test';process.env.DISABLE_SUBSCRIPTION_LIMITS='true';
const mongoose=r('mongoose'),{MongoMemoryReplSet}=r('mongodb-memory-server');
const n=r('./src/services/notification.service');n.notify=async()=>{};n.notifyParentsOfStudent=async()=>{};n.notifyAdmins=async()=>{};
const model=x=>r('./src/models/'+x);const out=[];const pass=m=>{out.push(m);console.log('PASS '+m);};const note=m=>{out.push('NOTE '+m);console.log('NOTE '+m);};
(async()=>{let db,server,chrome,ws;
 try{
 db=await MongoMemoryReplSet.create({replSet:{count:1}});await mongoose.connect(db.getUri());
 const password='IsolatedFamilyUx!2026';const u={};
 for(const [name,role] of [['Parent','parent'],['ChildOne','student'],['ChildTwo','student'],['Owner','institution_owner'],['Teacher','teacher']]){
  u[name]=await model('User').create({fullName:name+' Ux',email:name.toLowerCase()+'@ux.local',passwordHash:await model('User').hashPassword(password),emailVerified:true,roles:[role]});
  await model('RoleRequest').create({user:u[name]._id,requestedRole:role,status:'approved'});await model('UserProfile').create({user:u[name]._id,role,completed:true,percent:100});
 }
 const school=await model('Institution').create({name:'Ux School',slug:'ux-school',type:'school',country:'PK',owner:u.Owner._id,verificationStatus:'approved'});
 const course=await model('Course').create({title:'Ux Math',teacher:u.Teacher._id,institution:school._id,isFree:true,published:true});
 for(const c of ['ChildOne','ChildTwo']){await model('StudentProfile').create({user:u[c]._id,primaryInstitution:school._id});await model('Enrollment').create({course:course._id,student:u[c]._id,status:'active'});
  await model('ParentChildLink').create({parent:u.Parent._id,student:u[c]._id,requestedBy:u.Parent._id,status:'approved',relationship:'mother',approvedAt:new Date()});
  await model('Result').create({student:u[c]._id,institution:school._id,course:course._id,subject:'Ux Math',marksObtained:75,totalMarks:100,recordedBy:u.Teacher._id});
  await model('Fee').create({student:u[c]._id,institution:school._id,title:'Ux Tuition '+c,amount:400,currency:'PKR',recordedBy:u.Owner._id});}
 server=http.createServer(r('./src/app'));await new Promise(res=>server.listen(0,'127.0.0.1',res));const base='http://127.0.0.1:'+server.address().port;

 const port=19394;chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--disable-gpu','--remote-debugging-port='+port,'--user-data-dir='+fs.mkdtempSync(path.join(os.tmpdir(),'cz-ux-')),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let targets;for(let i=0;i<40;i++){try{targets=await(await fetch('http://127.0.0.1:'+port+'/json')).json();if(targets.some(t=>t.type==='page'))break;}catch{}await new Promise(res=>setTimeout(res,250));}
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 let seq=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}};
 const call=(method,params={})=>new Promise((res,rej)=>{pending.set(++seq,m=>m.error?rej(Error(method+': '+m.error.message)):res(m.result));ws.send(JSON.stringify({id:seq,method,params}));setTimeout(()=>rej(Error('timeout '+method)),20000).unref();});
 const evaluate=async e=>{const x=await call('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(x.exceptionDetails)throw Error(x.exceptionDetails.exception?.description||x.exceptionDetails.text);return x.result.value;};
 const wait=ms=>new Promise(res=>setTimeout(res,ms));
 await call('Runtime.enable');await call('Page.enable');await call('Accessibility.enable');
 await call('Page.navigate',{url:'http://localhost:5173/about'});await wait(2500);
 // Route API calls to the isolated server; stub only the translation provider.
 await evaluate(`window.__f=window.fetch.bind(window);window.fetch=(url,o)=>{if(typeof url==='string'&&url.includes('/api/translate')){if(url.endsWith('/translate/config'))return Promise.resolve(new Response(JSON.stringify({success:true,data:{enabled:true}}),{headers:{'Content-Type':'application/json'}}));const body=JSON.parse(o.body);return Promise.resolve(new Response(JSON.stringify({success:true,data:{translations:body.texts.map(t=>'اردو '+t)}}),{headers:{'Content-Type':'application/json'}}));}return window.__f(typeof url==='string'&&url.includes('/api/')?${JSON.stringify(base)}+'/api/'+url.split('/api/')[1]:url,o);};document.querySelector('#root').style.display='none';const c=document.createElement('div');c.id='ux-test';document.body.appendChild(c);`);
 async function mountApp(lang){await evaluate(`(async()=>{window.__root?.unmount();localStorage.setItem('careerz_lang',${JSON.stringify(lang)});const h=await import('/audit/parent-dashboard-harness.jsx');window.__root=h.mount(document.querySelector('#ux-test'));})()`);await wait(1500);}
 const text=()=>evaluate(`document.querySelector('#ux-test').innerText`);
 const overflow=()=>evaluate(`document.documentElement.scrollWidth-document.documentElement.clientWidth`);

 // Login through the actual Login page.
 await evaluate(`localStorage.removeItem('cz_access_token');window.history.replaceState({},'','/login')`);await mountApp('en');
 await evaluate(`(()=>{const set=(s,v)=>{const f=document.querySelector(s);Object.getOwnPropertyDescriptor(f.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(f,v);f.dispatchEvent(new Event(f.tagName==='SELECT'?'change':'input',{bubbles:true}));};set('#login-email','parent@ux.local');set('#login-password',${JSON.stringify(password)});set('#login-as','parent');})()`);
 await evaluate(`document.querySelector('#login-email').form.requestSubmit()`);await wait(3000);
 assert.equal(await evaluate('location.pathname'),'/dashboard');assert((await text()).includes('Welcome back'),await text());pass('parent logs in through the real Login page and reaches the dashboard');
 const nav=async label=>{await evaluate(`(()=>{const b=[...document.querySelectorAll('#ux-test button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)throw Error('nav missing: '+${JSON.stringify(label)});b.click();})()`);await wait(1200);};

 // 390px mobile layout on the main parent pages.
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await wait(400);
 const pages=await evaluate(`[...document.querySelectorAll('#ux-test nav button, #ux-test aside button')].map(b=>b.textContent.trim()).filter(Boolean)`);
 const wanted=['Dashboard','My Children','Performance','Fees & Payments','Wallet / Payment Records','My Profile'].filter(p=>pages.includes(p));
 assert.ok(wanted.length>=3,'parent navigation not found: '+pages.join(', '));const wide=[];
 for(const p of wanted){await nav(p);const o=await overflow();if(o>1)wide.push(p+' (+'+o+'px)');}
 const shot=await call('Page.captureScreenshot',{});fs.writeFileSync('audit/parent-ux-mobile.png',Buffer.from(shot.data,'base64'));
 assert.deepEqual(wide,[],'horizontal overflow at 390px: '+wide.join(', '));pass('390px mobile: no horizontal overflow on '+wanted.join(', '));
 await call('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});await nav('Dashboard');

 // Keyboard: Tab order reaches the navigation, focus is visible, every stop has a name.
 await evaluate(`document.activeElement?.blur();window.scrollTo(0,0)`);const stops=[];
 for(let i=0;i<40;i++){await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  stops.push(await evaluate(`(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const s=getComputedStyle(e);const visible=(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!=='none';return {tag:e.tagName,name:(e.getAttribute('aria-label')||e.innerText||e.title||e.value||'').trim().slice(0,40),visible};})()`));}
 const real=stops.filter(Boolean);assert.ok(real.length>=15,'too few keyboard stops');
 const unnamed=real.filter(s=>!s.name);const invisible=[...new Set(real.filter(s=>!s.visible).map(s=>s.tag+':'+s.name))];
 assert.ok(real.some(s=>s.name==='My Children'),'navigation not reachable by keyboard');
 pass('keyboard: '+real.length+' Tab stops reach the parent navigation including My Children');
 if(unnamed.length)note('keyboard stops without an accessible name: '+unnamed.length);else pass('every keyboard stop has an accessible name');
 if(invisible.length)note('focus indicator not visible (no outline/box-shadow) on: '+invisible.slice(0,8).join(' | '));else pass('every keyboard stop shows a visible focus indicator');
 // Enter on a focused nav button navigates.
 await evaluate(`[...document.querySelectorAll('#ux-test button')].find(b=>b.textContent.trim()==='My Children').focus()`);
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(1200);
 assert((await text()).includes('ChildOne Ux')&&(await text()).includes('ChildTwo Ux'));pass('Enter on the focused My Children item opens it; both children listed');

 // Accessibility tree: interactive controls without a name (what a screen reader would announce blank).
 const tree=(await call('Accessibility.getFullAXTree',{})).nodes;const roles=['button','link','textbox','combobox','checkbox','radio','menuitem','tab'];
 const blank=tree.filter(x=>!x.ignored&&roles.includes(x.role?.value)&&!String(x.name?.value||'').trim());
 if(blank.length){const desc=[];for(const b of blank.slice(0,5)){try{const d=(await call('DOM.describeNode',{backendNodeId:b.backendDOMNodeId})).node;desc.push(d.localName+'['+(d.attributes||[]).join(' ').slice(0,120)+']');}catch{desc.push(b.role.value);}}note('accessibility tree: '+blank.length+' interactive controls with no accessible name on My Children: '+desc.join(' | '));}else pass('accessibility tree: every interactive control on My Children has an accessible name');
 const headings=tree.filter(x=>!x.ignored&&x.role?.value==='heading').length;assert.ok(headings>0,'no headings for screen-reader navigation');pass('accessibility tree exposes '+headings+' headings for screen-reader navigation');

 // Language switching (stubbed provider): Urdu → RTL + translated text, back to English → LTR.
 await mountApp('ur');await wait(1500);
 assert.equal(await evaluate('document.documentElement.dir'),'rtl');assert.equal(await evaluate('document.documentElement.lang'),'ur');
 assert.ok((await text()).includes('اردو'),'Urdu text not applied');
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await wait(600);const rtlOverflow=await overflow();
 const rtlShot=await call('Page.captureScreenshot',{});fs.writeFileSync('audit/parent-ux-urdu-mobile.png',Buffer.from(rtlShot.data,'base64'));
 if(rtlOverflow>1)note('Urdu RTL at 390px overflows by '+rtlOverflow+'px');else pass('Urdu RTL at 390px has no horizontal overflow');
 await mountApp('en');await wait(800);assert.equal(await evaluate('document.documentElement.dir'),'ltr');assert.ok(!(await text()).includes('اردو'),'English did not restore');
 pass('language switch: Urdu sets lang=ur, dir=rtl and translates text (STUBBED provider); English restores LTR text');
 note('real Google Cloud Translation was not exercised: GOOGLE_TRANSLATE_API_KEY is not configured');

 if(errors.length)note('browser exceptions: '+errors.slice(0,3).join(' | '));
 console.log('\n'+out.filter(x=>!x.startsWith('NOTE')).length+' checks passed, '+out.filter(x=>x.startsWith('NOTE')).length+' findings noted');
 }finally{ws?.close();chrome?.kill();if(server)await new Promise(res=>server.close(res));await mongoose.disconnect();if(db)await db.stop();}
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1;});
