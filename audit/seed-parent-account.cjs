// Creates only this dedicated parent test account; does not alter other accounts or child links.
const r=require('node:module').createRequire('D:/Career-Z-backend/package.json');
r('dotenv').config({path:'D:/Career-Z-backend/.env',quiet:true});
const mongoose=r('mongoose'),User=r('./src/models/User'),RoleRequest=r('./src/models/RoleRequest'),UserProfile=r('./src/models/UserProfile'),cfg=r('./src/config/accountVerification');
async function main(){
 await mongoose.connect(r('./src/config/env').mongoUri);
 const email='parent.test@careerz.local',password='Parent@Test2026!';
 let user=await User.findOne({email});
 if(user){console.log('Dedicated parent test account already exists; no credentials overwritten.');return;}
 user=await User.create({fullName:'Test Parent',email,passwordHash:await User.hashPassword(password),roles:['parent'],emailVerified:true,status:'active',termsAcceptedAt:new Date(),country:'PK',city:'Faisalabad'});
 await RoleRequest.create({user:user._id,requestedRole:'parent',status:'approved',approvedAt:new Date(),reviewedAt:new Date(),reviewNotes:'Dedicated test parent approved by seed.',legacy:true});
 const fields={},sensitive={};
 for(const f of cfg.profileFields('parent','')){if(f.sensitive){sensitive[f.key]={encrypted:r('./src/utils/encryption').encrypt('3520200000001'),last4:'0001'};continue;}fields[f.key]=f.type==='select'?f.options[0]:f.type==='date'?'1985-01-01':f.pattern==='phone'?'+923000000000':f.pattern==='email'?email:f.pattern==='url'?'https://careerz.pk':({firstName:'Test',lastName:'Parent',fullName:'Test Parent',email,contactNumber:'+923000000000',city:'Faisalabad',province:'Punjab',country:'Pakistan'}[f.key]||'Test '+f.label);}
 await UserProfile.create({user:user._id,role:'parent',fields,sensitive,completed:true,completedAt:new Date(),percent:100});
 console.log('Parent test account created, verified and profile completed.');
 console.log('Email: '+email);console.log('Password: '+password);
 console.log('Password verification: '+await user.comparePassword(password));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>mongoose.disconnect());
