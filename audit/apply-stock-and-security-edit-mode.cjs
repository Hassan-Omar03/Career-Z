const fs=require('fs');const p='src/pages/Dashboard.jsx';let s=fs.readFileSync(p,'utf8');function rep(s,a,b){if(!s.includes(a))throw Error(a.slice(0,90));return s.replace(a,b);}function scope(name,fn){const a=s.indexOf('function '+name+'('),e=s.indexOf('\nfunction ',a+1);s=s.slice(0,a)+fn(s.slice(a,e))+s.slice(e);}
for(const name of ['InventoryPanel','SellerDashboardPanel'])scope(name,b=>{
 const a=b.indexOf('<div className="flex gap-2">\n',b.indexOf("'Inventory Update'")),e=b.indexOf('</div>',a)+6;if(a<0)throw Error(name);
 let block=b.slice(a,e);block=rep(block,'<div className="flex gap-2">','<SavedForm key={p._id} showValues={false} value={stockEdits[p._id]??\'\'} onRestore={v=>setStockEdits(prev=>({...prev,[p._id]:v}))} onSubmit={()=>updateStock(p._id)} className="flex gap-2">');
 block=rep(block,'type="button" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\' }} onClick={() => updateStock(p._id)}','type="submit" className="btn" style={{ padding: \'4px 10px\', fontSize: \'0.72rem\' }}');block=rep(block,'</div>','</SavedForm>');b=b.slice(0,a)+block+b.slice(e);
 const f=b.indexOf('async function updateStock('),fe=b.indexOf('\n  }',f)+4;const fn=rep(b.slice(f,fe),'      load();','      load(); return true;');return b.slice(0,f)+fn+b.slice(fe);
});
scope('SettingsPanel',b=>{
 b=rep(b,"      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });", "      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); return true;");
 b=rep(b,'<form onSubmit={changePassword}', '<SavedForm showValues={false} value={pwForm} onRestore={setPwForm} editLabel="Edit password" onSubmit={changePassword}');let a=b.indexOf('<SavedForm showValues={false}'),e=b.indexOf('</form>',a);b=b.slice(0,e)+'</SavedForm>'+b.slice(e+7);
 b=rep(b,"      onChanged?.();\n    } catch (err) { onFlash(err.message); } finally { setSavingTwoFactor(false); }", "      onChanged?.(); return true;\n    } catch (err) { onFlash(err.message); } finally { setSavingTwoFactor(false); }");
 a=b.indexOf('<div className="card" style={{ padding: 22, maxWidth: 480 }}>');e=b.indexOf('\n      </div>',a)+13;let block=b.slice(a,e);block=rep(block,'<div className="card"','<SavedForm value={twoFactor} onRestore={setTwoFactor} onSubmit={()=>toggleTwoFactor(twoFactor)} className="card"');block=rep(block,'onChange={(e) => toggleTwoFactor(e.target.checked)}','onChange={(e) => setTwoFactor(e.target.checked)}');const close=block.lastIndexOf('</div>');block=block.slice(0,close)+'<button type="submit" className="btn btn-primary" disabled={savingTwoFactor}>Save security settings</button></SavedForm>'+block.slice(close+6);return b.slice(0,a)+block+b.slice(e);
});
scope('AdminStaffPanel',b=>{
 const a=b.indexOf('<div className="flex flex-wrap"',b.indexOf('staff.map((s)')),e=b.indexOf('</div>',a)+6;if(a<0)throw Error('Staff departments');
 return b.slice(0,a)+"<StaffDepartmentForm staff={s} onFlash={onFlash} onSaved={load}/>"+b.slice(e);
});
s+=`
function StaffDepartmentForm({staff,onFlash,onSaved}) {
 const [departments,setDepartments]=useState(staff.departments||[]);
 return <SavedForm value={departments} onRestore={setDepartments} editLabel="Edit departments" onSubmit={async()=>{try{await apiRequest(\`/admin/staff/\${staff._id}\`,{method:'PATCH',body:{departments}});onSaved();onFlash('Staff departments saved.','success');return true;}catch(e){onFlash(e.message);}}}>{ADMIN_DEPARTMENTS.map(d=><label key={d.value} className="text-xs" style={{display:'block'}}><input type="checkbox" checked={departments.includes(d.value)} onChange={e=>setDepartments(prev=>e.target.checked?[...prev,d.value]:prev.filter(v=>v!==d.value))}/>{d.label}</label>)}<button type="submit" className="btn btn-primary">Save departments</button></SavedForm>;
}
`;
fs.writeFileSync(p,s);console.log('Stock, staff departments, password and security settings are edit-gated.');
