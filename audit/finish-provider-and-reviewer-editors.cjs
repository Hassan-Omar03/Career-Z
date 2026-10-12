const fs=require('fs');function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,90));return s.replace(a,b);}function edit(p,fn){fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
edit('src/pages/Dashboard.jsx',s=>{
 const a=s.indexOf('function AdminAiProvidersPanel('),e=s.indexOf('\nfunction ',a+1);let b=s.slice(a,e);
 b=rep(b,"  async function saveModel(purpose, provider) {", "  function setProviderEnabled(purpose,provider,on) { setConfig(prev=>({...prev,enabled:{...prev.enabled,[purpose]:on?[...new Set([...(prev.enabled[purpose]||[]),provider])]:(prev.enabled[purpose]||[]).filter(item=>item!==provider)}})); }\n  async function saveModel(purpose, provider) {");
 b=rep(b,"body: { models }", "body: { models, enabled: config.enabled }");
 b=rep(b,"      load(); return true;", "      setConfig(prev=>({...prev,models:{...prev.models,[purpose]:{...prev.models?.[purpose],[provider]:model}}})); return true;");
 b=rep(b,"value={modelInputs[`${purpose}:${provider}`]||''} onRestore={v=>setModelInputs(prev=>({...prev,[`${purpose}:${provider}`]:v}))}", "value={{model:modelInputs[`${purpose}:${provider}`]||'',enabled:(config.enabled[purpose]||[]).includes(provider)}} onRestore={v=>{setModelInputs(prev=>({...prev,[`${purpose}:${provider}`]:v.model}));setProviderEnabled(purpose,provider,v.enabled);}}");
 b=rep(b,"onChange={() => toggle(purpose, provider)}", "onChange={e => setProviderEnabled(purpose, provider, e.target.checked)}");
 return s.slice(0,a)+b+s.slice(e);
});
edit('src/components/dashboard/LearningInsights.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+s;
 const a=s.indexOf('export function ReviewerSettings('),e=s.indexOf('\nexport function ',a+1);
 return s.slice(0,a)+`export function ReviewerSettings({ id, busy, onChange, onError }) {
  const [data, setData] = useState(null);
  useEffect(() => { let alive = true; setData(null); apiRequest(\`/learning/\${id}/reviewers\`).then(value => { if (alive) setData({...value,staff:value.staff.map(row=>({...row,originalPermissions:[...row.permissions]}))}); }).catch(onError); return () => { alive = false; }; }, [id]);
  function change(user,permission,on) { setData(prev=>({...prev,staff:prev.staff.map(row=>row.user?._id===user?{...row,permissions:on?[...new Set([...row.permissions,permission])]:row.permissions.filter(p=>p!==permission)}:row)})); }
  return data && <details><summary>Department and principal reviewers</summary><p>Reviewers must already belong to the institution. The institution owner grants and revokes these roles.</p><SavedForm key={id} canEdit={data.canGrant} value={data} onRestore={setData} onSubmit={async()=>{
    const rows=data.staff.filter(row=>row.user&&JSON.stringify(row.permissions)!==JSON.stringify(row.originalPermissions));
    for(const row of rows){const result=await onChange(row.user._id,{department:row.permissions.includes('content:review:department'),principal:row.permissions.includes('content:review:principal')});if(result!==true)return false;}
    setData(prev=>({...prev,staff:prev.staff.map(row=>({...row,originalPermissions:[...row.permissions]}))}));return true;
  }}>{data.staff.filter(row=>row.user).map(row=><div key={row.user._id}><strong>{row.user.fullName}</strong>{[['department','content:review:department','Department reviewer'],['principal','content:review:principal','Principal reviewer']].map(([field,permission,label])=><label key={field} style={{display:'block'}}><input type="checkbox" disabled={!data.canGrant||busy} checked={row.permissions.includes(permission)} onChange={e=>change(row.user._id,permission,e.target.checked)}/>{label}</label>)}</div>)}<button type="submit" className="btn btn-primary" disabled={busy}>Save reviewers</button></SavedForm></details>;
}
`+s.slice(e);
});
console.log('Provider and reviewer changes stay drafts until Save.');
