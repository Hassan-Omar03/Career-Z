const fs=require('node:fs');
const root='D:/Career-Z-backend/src/';
const file=root+'controllers/family.controller.js';
let s=fs.readFileSync(file,'utf8');
if(!s.includes('const updates=asyncHandler')) {
 s=s.replace('const overview=asyncHandler',`const updates=asyncHandler(async(req,res)=>{
 const links=await model('ParentChildLink').find({parent:req.user._id,status:'approved'}).select('student');
 const scopes=await Promise.all(links.map(async l=>({student:l.student,institution:{$in:await family.institutions(l.student)}})));
 if(!scopes.length)return ok(res,[]);
 const rows=await model('FamilyObservation').find({$or:scopes}).populate('student','fullName profilePhoto').populate('actor','fullName').populate('institution','name').sort({createdAt:-1,_id:-1}).limit(200);
 return ok(res,rows);
});
const overview=asyncHandler`);
 s=s.replace('module.exports={classrooms,','module.exports={updates,classrooms,');fs.writeFileSync(file,s);
}
const routes=root+'routes/parent.routes.js';s=fs.readFileSync(routes,'utf8');if(!s.includes("'/me/updates'")){s=s.replace("const family=require('../controllers/family.controller');","const family=require('../controllers/family.controller');\nrouter.get('/me/updates',family.updates);");fs.writeFileSync(routes,s);}
