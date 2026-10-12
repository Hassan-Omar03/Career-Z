const fs = require('fs');
function edit(file, transform) { const before=fs.readFileSync(file,'utf8'); const after=transform(before); if(before===after)throw Error('No change: '+file); fs.writeFileSync(file,after); }
function replace(s,a,b) { if(!s.includes(a))throw Error('Missing '+a.slice(0,100));return s.replace(a,b); }
function scope(s,name,transform) { const start=s.indexOf('function '+name+'(');if(start<0)throw Error(name);let end=s.indexOf('\nfunction ',start+1);if(end<0)end=s.length;return s.slice(0,start)+transform(s.slice(start,end))+s.slice(end); }
function wrap(s,needle,props) { const start=s.indexOf(needle);if(start<0)throw Error(needle);const end=s.indexOf('</form>',start);if(end<0)throw Error('Closing form');return s.slice(0,start)+s.slice(start,end).replace('<form','<SavedForm '+props)+'</SavedForm>'+s.slice(end+7); }
edit('src/pages/Dashboard.jsx',s=>{
 s="import SavedForm from '../components/shared/SavedForm';\n"+s;
 const records=[
 ['ResumeEditorPanel','<form onSubmit={save}', 'value={resume} onRestore={setResume}', "onFlash('Resume saved.', 'success');"],
 ['SalaryPayoutProfilePanel','<form onSubmit={save}', 'value={form} onRestore={setForm}', "onFlash('Salary payout details saved.', 'success');"],
 ['ParentHealthPanel','<form onSubmit={save}', 'key={studentId} value={form} onRestore={setForm}', "onFlash('Health record updated.', 'success');"],
 ['InstitutionHealthPanel','<form onSubmit={saveHealthRecord}', 'key={selectedStudent} value={health} onRestore={setHealth}', "onFlash('Student health record updated.', 'success');"],
 ['InstitutionPanel','<form onSubmit={saveDetails}', 'key={mine._id} value={editForm} onRestore={setEditForm}', "onFlash('Institution details updated.', 'success');"],
 ['SettingsPanel','<form onSubmit={saveProfile}', 'key={user._id} value={form} onRestore={setForm}', "onFlash('Settings saved.', 'success');"],
 ['AdminFinancePanel','<form onSubmit={saveFeeRate}', 'value={feeRateInput} onRestore={setFeeRateInput}', "onFlash('Institution fee commission rate updated.', 'success');"],
 ['AdminFinancePanel','<form onSubmit={saveFeaturedFee}', 'value={featuredFeeInput} onRestore={setFeaturedFeeInput}', "onFlash('Featured job fee updated.', 'success');"]
 ];
 for(const[name,needle,props,success]of records)s=scope(s,name,b=>{b=wrap(b,needle,props);return replace(b,success,success+' return true;');});
 s=scope(s,'TeacherProfileDetailsPanel',b=>{
  b=replace(b,"onFlash('Teaching profile updated.', 'success');","onFlash('Teaching profile updated.', 'success');");
  b=replace(b,'      load();\n    } catch','      load();\n      return true;\n    } catch');
  // Include the photo picker in the same edit gate as teaching details.
  b=replace(b,'      {/* Identity header', '      <SavedForm value={form} onRestore={setForm} onSubmit={submit} style={{ display: \'grid\', gap: 16 }}>\n      {/* Identity header');
  b=replace(b,'      <form onSubmit={submit} style={{ display: \'grid\', gap: 16 }}>','');
  return replace(b,'      </form>','      </SavedForm>');
 });
 s=scope(s,'CompletionRulesEditor',b=>replace(b,"      onFlash('Completion rules saved.', 'success');","      onFlash('Completion rules saved.', 'success');\n      setOpen(false);"));
 return s;
});
edit('src/components/dashboard/InstitutionSettingsPanel.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+s;
 s=wrap(s,'<form onSubmit={save}', 'key={institution._id} value={s} onRestore={setS}');
 return replace(s,"onFlash?.('Institution settings saved.', 'success');","onFlash?.('Institution settings saved.', 'success'); return true;");
});
edit('src/components/dashboard/FamilyPrivate.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+s;
 s=wrap(s,'<form onSubmit=', 'value={form} onRestore={v=>{setForm(v);setAccount(\'\');setReplace(false);}}');
 return replace(s,"onFlash('Private details saved.','success');","onFlash('Private details saved.','success');return true;");
});
edit('src/components/dashboard/FamilyPolicy.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+s;
 s=wrap(s,'<form onSubmit=', 'key={id} value={policy} onRestore={setPolicy}');
 return replace(s,"onFlash('Guardian policy saved.','success');","onFlash('Guardian policy saved.','success');return true;");
});
edit('src/components/dashboard/MedicalHealth.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+s;
 s=wrap(s,'<form className="dash-card"', 'key={mode+institution+student} value={record} onRestore={setRecord} canEdit={edit}');
 s=replace(s,'onSubmit={e => { e.preventDefault(); run(async () => {','onSubmit={e => { e.preventDefault(); return run(async () => {');
 return replace(s,"onFlash('Health record saved.', 'success');","onFlash('Health record saved.', 'success'); return true;");
});
edit('src/components/dashboard/LearningEditors.jsx',s=>{
 s="import SavedForm from '../shared/SavedForm';\n"+s;
 s=scope(s,'CourseMetadata',b=>{
  b=wrap(b,'<form style=', 'key={course._id} value={form} onRestore={setForm}');
  b=replace(b,'onSubmit={e =>','onSubmit={async e =>');
  b=replace(b,'; onSave({','; return await onSave({');
  return b;
 });
 return s;
});
edit('src/components/dashboard/LearningCenter.jsx',s=>replace(s,"onUpdated?.(); } catch", "onUpdated?.(); return true; } catch"));
console.log('Saved record forms now require explicit Edit and return to view after success.');
