const fs=require('node:fs');
const p='D:/Career-Z-backend/src/controllers/familyObservation.controller.js';let s=fs.readFileSync(p,'utf8');
s=s.replace(".populate('parent','fullName');return data;", ".populate('parent','fullName');data.hasActiveMeetingByMe=!!userId&&data.meetings.some(m=>family.same(m.parent,userId)&&['pending','confirmed'].includes(m.status));return data;");fs.writeFileSync(p,s);
