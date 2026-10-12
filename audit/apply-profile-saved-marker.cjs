const fs=require('fs');
const base='D:/Career-Z-backend/src/';
function patch(file,a,b){const p=base+file,s=fs.readFileSync(p,'utf8');if(!s.includes(a))throw Error(file);fs.writeFileSync(p,s.replace(a,b));}
patch('models/UserProfile.js','  completedAt: { type: Date, default: null },','  completedAt: { type: Date, default: null },\n  lastSavedAt: { type: Date, default: null },');
patch('services/accountVerification.service.js','        percent: profileState.percent, complete:', '        saved: Boolean(profile?.lastSavedAt || profile?.completedAt || profile?.completed),\n        percent: profileState.percent, complete:');
patch('services/accountVerification.service.js','  await profile.save();\n  if(role===\'student\'){','  profile.lastSavedAt = new Date();\n  await profile.save();\n  if(role===\'student\'){');
console.log('Persisted profile save marker added for all account types, including drafts.');
