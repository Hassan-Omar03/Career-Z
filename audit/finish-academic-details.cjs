const fs=require('fs'),root='D:/Career-Z-backend/src/';const edit=(f,fn)=>fs.writeFileSync(root+f,fn(fs.readFileSync(root+f,'utf8').replace(/\r\n/g,'\n')));
edit('controllers/family.controller.js',s=>s.replace("const consents=await",`const ranks=[];const contexts=new Map();for(const r of results)if(r.course){const key=[r.course,r.academicSession,r.term].join(':');if(!contexts.has(key))contexts.set(key,r);}
 for(const r of contexts.values()){
 const cohort=await model('Result').aggregate([{$match:{course:r.course,academicSession:r.academicSession||'',term:r.term||'',totalMarks:{$gt:0}}},{$group:{_id:'$student',obtained:{$sum:'$marksObtained'},total:{$sum:'$totalMarks'}}}]);
 const own=cohort.find(c=>family.same(c._id,student));if(own){const ratio=own.obtained/own.total;ranks.push({course:r.course,subject:r.subject,session:r.academicSession,term:r.term,rank:1+cohort.filter(c=>c.obtained/c.total>ratio).length,gradedStudents:cohort.length});}}
 const consents=await`)
.replace('results,subjects,strong:', 'results,ranks,subjects,strong:')
.replace(".populate('book').lean()", ".populate('book','title author category').lean()"));
edit('controllers/parent.controller.js',s=>s.replace("const links = await ParentChildLink.find({ $or:[{parent:req.user._id},{student:req.user._id}] }).populate('student', 'fullName email').populate('parent','fullName email');\n  return ok(res, links);",`const links = await ParentChildLink.find({ $or:[{parent:req.user._id},{student:req.user._id}] }).populate('student', 'fullName email profilePhoto').populate('parent','fullName email');
  const rows=await Promise.all(links.map(async l=>{const row=l.toObject();if(l.status==='approved'&&l.student){const profile=await StudentProfile.findOne({user:l.student._id}).select('dateOfBirth rollNumber program classSection').populate('classSection','name');row.childDetails={age:ageFromDob(profile?.dateOfBirth),rollNumber:profile?.rollNumber,program:profile?.program,className:profile?.classSection?.name,institutions:await Institution.find({_id:{$in:await family.institutions(l.student._id)}}).select('name')};}return row;}));
  return ok(res, rows);`));
console.log('Private cohort rank and approved-link child details added.');
