const fs=require('node:fs'),root='D:/Career-Z-backend/src/';
function edit(path,fn){const f=root+path;fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')));}
fs.writeFileSync(root+'services/studentGuardianContact.service.js',`const AppError=require('../utils/AppError');
function normalize(input,user,{required=false}={}){
 const out={};
 if(required||input.parentEmail!==undefined){const email=String(input.parentEmail||'').trim().toLowerCase();if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||email.length>200)throw new AppError('Enter a valid parent / guardian email address.',422);if(email===String(user.email||'').trim().toLowerCase())throw new AppError('Parent email must be different from your student email.',422);out.parentEmail=email;}
 if(input.parentName!==undefined)out.parentName=String(input.parentName||'').trim().slice(0,150);
 if(input.parentRelationship!==undefined){if(!['father','mother','guardian'].includes(input.parentRelationship))throw new AppError('Choose father, mother or guardian.',422);out.parentRelationship=input.parentRelationship;}
 return out;
}
async function sync(user,fields){const update=normalize(fields,user);if(!Object.keys(update).length)return;await require('../models/StudentProfile').findOneAndUpdate({user:user._id},{$set:update},{upsert:true,new:true,runValidators:true});await require('../models/UserProfile').findOneAndUpdate({user:user._id,role:'student'},{$set:Object.fromEntries(Object.entries(update).map(([k,v])=>['fields.'+k,v]))},{upsert:true,runValidators:true});}
module.exports={normalize,sync};
`);
edit('models/StudentProfile.js',s=>s.replace("guardianContact: { type: String, default: '' },",`guardianContact: { type: String, default: '' },
    parentEmail: {type:String,trim:true,lowercase:true,default:'',validate:{validator:v=>!v||/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v),message:'Invalid guardian email'}},
    parentName: {type:String,trim:true,default:'',maxlength:150},
    parentRelationship: {type:String,enum:['father','mother','guardian'],default:'guardian'},`));
edit('controllers/auth.controller.js',s=>{
 s=s.replace('  const passwordHash = await User.hashPassword(password);',"  const guardian=role==='student'?require('../services/studentGuardianContact.service').normalize(req.body,{email},{required:true}):null;\n  const passwordHash = await User.hashPassword(password);");
 s=s.replace('  const request = await RoleRequest.create({ user: user._id, requestedRole: role, subtype,',"  if(guardian)await require('../services/studentGuardianContact.service').sync(user,guardian);\n  const request = await RoleRequest.create({ user: user._id, requestedRole: role, subtype,");return s;
});
edit('config/accountVerification.js',s=>s.replace("F('parentContactNumber', 'Parent / guardian contact number', { pattern: 'phone' })", "F('parentEmail','Parent / guardian email address',{pattern:'email'}), F('parentName','Parent / guardian full name',{required:false}), F('parentRelationship','Relationship',{type:'select',options:['father','mother','guardian']}), F('parentContactNumber', 'Parent / guardian contact number', { pattern: 'phone' })"));
edit('services/accountVerification.service.js',s=>{
 s=s.replace("  const fields = cfg.profileFields(role, request.subtype);", "  if(role==='student')input={...input,...require('./studentGuardianContact.service').normalize(input,user)};\n  const fields = cfg.profileFields(role, request.subtype);");
 const anchor='  if (profile.completed && !wasComplete) await notifyUser';
 s=s.replace(anchor,"  if(role==='student'&&profile.fields?.parentEmail)await require('./studentGuardianContact.service').sync(user,{parentEmail:profile.fields.parentEmail,parentName:profile.fields.parentName||'',parentRelationship:profile.fields.parentRelationship||'guardian'});\n"+anchor);return s;
});
edit('controllers/student.controller.js',s=>{
 s=s.replace("  const allowed = ['dateOfBirth', 'guardianContact'", "  const allowed = ['parentEmail','parentName','parentRelationship','dateOfBirth', 'guardianContact'");
 s=s.replace("  const update = {};\n  allowed.forEach", "  const update = {...require('../services/studentGuardianContact.service').normalize(req.body,req.user)};\n  allowed.forEach");
 // Normalize after the generic field loop so it cannot restore an untrimmed address.
 s=s.replace("  const profile = await StudentProfile.findOneAndUpdate(\n    { user: req.user._id },\n    { $set: update },", "  Object.assign(update,require('../services/studentGuardianContact.service').normalize(req.body,req.user));\n  const profile = await StudentProfile.findOneAndUpdate(\n    { user: req.user._id },\n    { $set: update },");
 s=s.replace('  await notifySponsorsOfProgress(req.user._id, req.user.fullName);',"  await require('../services/studentGuardianContact.service').sync(req.user,update);\n  await notifySponsorsOfProgress(req.user._id, req.user.fullName);");return s;
});
edit('controllers/schoolFamilyInvitation.controller.js',s=>{
 s=s.replace(" const child=await User.findById(student),parent=await User.findOne({email:String(req.body.parentEmail||'').trim().toLowerCase(),status:'active',roles:'parent'});",` const profile=await Profile.findOne({user:student});const contact=profile?.parentEmail;
 if(!contact)throw new AppError('Student must add their parent email in their profile before the school can invite.',422);
 if(req.body.parentEmail&&String(req.body.parentEmail).trim().toLowerCase()!==contact)throw new AppError('Use the parent email supplied by this student, not another address.',422);
 const child=await User.findById(student),parent=await User.findOne({email:contact,status:'active',roles:'parent'});`);
 s=s.replace("const relationship=req.body.relationship||'guardian'", "const relationship=profile.parentRelationship||'guardian'");return s;
});
