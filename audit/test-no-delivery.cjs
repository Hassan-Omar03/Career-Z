// Integration tests retain in-app notifications while blocking external delivery.
const r=require('node:module').createRequire('D:/Career-Z-backend/package.json');
const email=r('./src/services/email.service');if(email.sendEmail)email.sendEmail=async()=>({skipped:true,reason:'isolated acceptance test'});
const push=r('./src/services/push.service');if(push.pushToUser)push.pushToUser=async()=>({skipped:true});
