const fs=require('node:fs');
let p='D:/Career-Z-backend/src/controllers/ptm.controller.js',s=fs.readFileSync(p,'utf8');s=s.replace(/  if\(institutionId\)\{const school=await Institution.findById\(institutionId\);[^\r\n]+\r?\n/,'');fs.writeFileSync(p,s);
p='D:/Career-Z-backend/src/services/ptmContext.service.js';s=fs.readFileSync(p,'utf8').replace('async function contexts(studentId){','async function contexts(studentId){\n studentId=studentId?._id||studentId;');fs.writeFileSync(p,s);
