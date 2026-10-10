const fs=require('fs'),root='D:/Career-Z-backend/src/';const edit=(f,fn)=>fs.writeFileSync(root+f,fn(fs.readFileSync(root+f,'utf8').replace(/\r\n/g,'\n')));
fs.copyFileSync('audit/guardian-group-access.stage.cjs',root+'services/guardianGroupAccess.service.js');
edit('models/GroupConversation.js',s=>s.replace("name: { type: String, required: true, trim: true },","institution:{type:mongoose.Schema.Types.ObjectId,ref:'Institution',default:null},\n    name: { type: String, required: true, trim: true },"));
edit('controllers/groupConversation.controller.js',s=>s.replace("const group = await GroupConversation.create({ name,",`let institution=req.body.institution||null;
  const family=require('../services/familyAccess.service');
  const schools=await require('../models/Institution').find({$or:[{owner:req.user._id},{staff:{$elemMatch:{user:req.user._id,permissions:'parents:manage'}}}]});
  if(institution&&!schools.some(i=>family.same(i,institution)))throw new AppError('Guardian group management permission required.',403);
  const parents=await require('../models/ParentChildLink').find({parent:{$in:allowed},status:'approved'});
  for(const school of schools){const students=new Set(await family.students(school._id));if(allowed.every(id=>parents.some(p=>String(p.parent)===id&&students.has(String(p.student))))){institution=institution||school._id;break;}}
  if(institution){const students=new Set(await family.students(institution));if(!allowed.every(id=>parents.some(p=>String(p.parent)===id&&students.has(String(p.student)))))throw new AppError('All guardian group members must be linked to active students here.',403);}
  const group = await GroupConversation.create({ institution,name,`)
.replace('return ok(res, groups);',"const visible=[];for(const g of groups)if(await require('../services/guardianGroupAccess.service').eligible(g,req.user._id))visible.push(g);return ok(res,visible);")
.replaceAll("if (!isMember(group, req.user._id))", "if (!await require('../services/guardianGroupAccess.service').eligible(group,req.user._id))")
.replace("broadcastGroupMessage(group.id, populated);","await broadcastGroupMessage(group.id, populated);"));
edit('realtime/socket.js',s=>s.replace(".findById(groupId).select('participants');", ".findById(groupId);")
.replace("if (!group || !group.participants.some((p) => p.toString() === socket.data.userId))", "if (!group || !await require('../services/guardianGroupAccess.service').eligible(group,socket.data.userId))")
.replace("function broadcastGroupMessage(groupId, message) {\n  if (io && groupId) io.to(`group:${groupId}`).emit('group:message', message);\n}",`async function broadcastGroupMessage(groupId,message){
 if(!io||!groupId)return;const group=await require('../models/GroupConversation').findById(groupId);if(!group)return;
 for(const user of group.participants){if(!await require('../services/guardianGroupAccess.service').eligible(group,user))continue;
 if(await require('../models/BlockedUser').exists({$or:[{blocker:user,blocked:message.from._id||message.from},{blocker:message.from._id||message.from,blocked:user}]}))continue;
 emitToUser(user,'group:message',message);}
}`));
console.log('Institution guardian groups now revalidate membership on reads, writes and socket delivery.');
