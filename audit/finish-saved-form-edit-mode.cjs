const fs=require('fs');
function edit(p,fn){const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,fn(s));}
function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,90));return s.replace(a,b);}
edit('src/components/dashboard/FamilyChatPolicy.jsx',s=>rep(rep(rep(s,'<form onSubmit=','<SavedForm value={terms} onRestore={setTerms} onSubmit='),'</form>','</SavedForm>'),"onFlash('Communication safety policy saved.','success');","onFlash('Communication safety policy saved.','success');return true;"));
edit('src/components/dashboard/FamilyCenter.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+s;
 const from=s.indexOf('<label style={{display:\'block\',marginBottom:16}}><input type="checkbox"');
 const end=s.indexOf('</label>',from)+8;if(from<0)throw Error('Observation policy');
 const policy=`<SavedForm key={institution} value={observationEnabled} onRestore={setObservationEnabled} style={{marginBottom:16}} onSubmit={async e=>{e.preventDefault();setBusy(true);try{const policy=await apiRequest(\`/institutions/\${institution}/family/observation-policy\`,{method:'PUT',body:{enabled:observationEnabled}});setObservationEnabled(policy.enabled);onFlash('Classroom observation policy updated.','success');return true;}catch(e){onFlash(e.message);}finally{setBusy(false);}}}><label style={{display:'block',marginBottom:16}}><input type="checkbox" disabled={busy||!institution} checked={observationEnabled} onChange={e=>setObservationEnabled(e.target.checked)}/> Allow approved guardians to observe online classes with their child's permission</label><button type="submit" className="btn btn-primary" disabled={busy||!institution}>Save observation policy</button></SavedForm>`;
 return s.slice(0,from)+policy+s.slice(end);
});
console.log('Communication and observation policies use explicit edit/save.');
