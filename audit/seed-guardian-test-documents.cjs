const fs=require('fs'),path=require('path'),r=require('node:module').createRequire('D:/Career-Z-backend/package.json');
r('dotenv').config({path:'D:/Career-Z-backend/.env',quiet:true});
const mongoose=r('mongoose'),User=r('./src/models/User'),Link=r('./src/models/ParentChildLink'),School=r('./src/models/Institution'),Proof=r('./src/models/GuardianProof'),family=r('./src/services/familyAccess.service');
async function main(){
 await mongoose.connect(r('./src/config/env').mongoUri);
 const parent=await User.findOne({email:'parent.test@careerz.local'});if(!parent)throw Error('Seed parent not found.');
 const links=await Link.find({parent:parent._id,status:'approved'}).populate('student','fullName');
 const candidates=[];for(const l of links){if(!/mohammad\s+omar/i.test(l.student?.fullName||''))continue;const schools=await School.find({_id:{$in:await family.institutions(l.student._id)}});for(const school of schools)if(/gcuf|government college university faisalabad/i.test(school.name))candidates.push({link:l,school});}
 if(candidates.length!==1)throw Error('Expected exactly one approved Mohammad Omar / GCUF connection; found '+candidates.length);
 const {link,school}=candidates[0];const previous=await Proof.findOne({link:link._id,institution:school._id});if(previous){console.log('Existing guardian proof preserved. Status: '+previous.status);return;}
 const {jsPDF}=require('jspdf');const folder=path.resolve('audit/parent-test-documents');fs.mkdirSync(folder,{recursive:true});const documents=[];
 for(const kind of ['guardian_id','relationship_proof']){const pdf=new jsPDF();pdf.setFontSize(22);pdf.text('TEST SAMPLE - NOT VALID ID',18,25);pdf.setFontSize(12);pdf.text(kind==='guardian_id'?'Guardian identity upload test':'Parent-child relationship upload test',18,45);pdf.text(['Guardian: Test Parent','Student: '+link.student.fullName,'Institution: '+school.name,'Relationship: '+link.relationship,'Synthetic seed fixture. No official identity numbers.','For application workflow testing only.','Does not prove identity or biological/legal relationship.'],18,65);const bytes=Buffer.from(pdf.output('arraybuffer'));const name='TEST-'+kind+'.pdf';fs.writeFileSync(path.join(folder,name),bytes);documents.push({kind,name,mime:'application/pdf',data:bytes.toString('base64')});}
 const result=await new Promise((resolve,reject)=>{const res={status(){return this},json(body){resolve(body)}};Promise.resolve(r('./src/controllers/guardianProof.controller').submit({user:parent,params:{linkId:String(link._id),institutionId:String(school._id)},body:{documents}},res,reject)).catch(reject);});
 const saved=await Proof.findById(result.data._id).select('+documents.encrypted');if(saved.status!=='pending'||saved.documents.length!==2)throw Error('Seed verification failed.');for(const d of saved.documents){const data=r('./src/utils/encryption').decrypt(d.encrypted);if(!Buffer.from(data,'base64').subarray(0,5).equals(Buffer.from('%PDF-')))throw Error('Stored PDF verification failed.');}
 console.log('Uploaded 2 encrypted test PDFs for Test Parent -> '+link.student.fullName+' / '+school.name+'. Status: pending.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>mongoose.disconnect());
