const fs=require('fs');
function write(p,fn){fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,70));return s.replace(a,b);}
write('src/components/dashboard/GuardianProof.jsx',s=>rep(s,'!review&&proof!==null&&<SavedForm','!review&&loaded&&<SavedForm'));
write('src/components/admin/AdminOperationsCenter.jsx',s=>"import SavedForm from '../shared/SavedForm';\n"+rep(s,"import SavedForm from '../shared/SavedForm';",''));
write('src/pages/Dashboard.jsx',s=>{
 const start=s.indexOf('function AdminFinancePanel('),end=s.indexOf('\nfunction ',start+1);let b=s.slice(start,end);
 b=rep(b,'<div key={planKey} className="flex items-end gap-2">', '<SavedForm key={planKey} value={planPriceInputs[planKey]} onRestore={value=>setPlanPriceInputs(prev=>({...prev,[planKey]:value}))} canEdit={isSuperAdmin} onSubmit={()=>savePlanPrice(planKey)} className="flex items-end gap-2">');
 b=rep(b,"onClick={() => savePlanPrice(planKey)}>Save</button>", "type=\"submit\">Save</button>").replace('type="button" className="btn btn-primary" style={{ padding: \'7px 14px\', fontSize: \'0.8rem\' }} type="submit"','type="submit" className="btn btn-primary" style={{ padding: \'7px 14px\', fontSize: \'0.8rem\' }}');
 b=rep(b,'              </div>\n            ))}', '              </SavedForm>\n            ))}');
 const f=b.indexOf('async function savePlanPrice('),fe=b.indexOf('\n  async function ',f+1);let block=b.slice(f,fe);
 block=rep(block,'      load();', '      load();\n      return true;');b=b.slice(0,f)+block+b.slice(fe);
 return s.slice(0,start)+b+s.slice(end);
});
console.log('Saved document replacement and plan-price forms require explicit edit.');
