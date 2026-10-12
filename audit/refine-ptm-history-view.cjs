const fs=require('node:fs');
const p='D:/Career-Z-backend/src/controllers/familyObservation.controller.js';let s=fs.readFileSync(p,'utf8');s=s.replace("select('parent teacher requestedDate status subject')","select('parent teacher requestedDate confirmedDate status subject')");fs.writeFileSync(p,s);
