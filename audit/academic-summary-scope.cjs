const fs=require('fs'),p='D:/Career-Z-backend/src/controllers/family.controller.js';let s=fs.readFileSync(p,'utf8');
s=s.replace("const key=(r.subject||'General')+' / '+(r.academicSession||r.term||'');","const key=[r.institution?._id||r.institution||'',r.course||'',r.subject||'General',r.academicSession||'',r.term||''].join(' / ');");
s=s.replace("{subject:r.subject||'General',session:r.academicSession","{institution:r.institution?._id||r.institution,subject:r.subject||'General',session:r.academicSession");
fs.writeFileSync(p,s);
