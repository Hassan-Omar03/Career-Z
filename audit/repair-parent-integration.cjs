const fs=require('fs');
const root='D:/Career-Z-backend/src/';
function edit(file,fn){const path=root+file;fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));}
edit('controllers/ptm.controller.js',s=>s.replace("!/^https:///i.test(meetingLink)","!meetingLink.startsWith('https://')"));
edit('controllers/family.controller.js',s=>s.replace("const model=n=>require('../models/'+n);","require('../models/LibraryBook');\nconst model=n=>require('../models/'+n);")
.replace("model('LibraryLoan').find({student})","model('LibraryLoan').find({borrower:student})")
.replace("const consents=await", "timetables.sort((a,b)=>['mon','tue','wed','thu','fri','sat','sun'].indexOf(a.dayOfWeek)-['mon','tue','wed','thu','fri','sat','sun'].indexOf(b.dayOfWeek)||a.startTime.localeCompare(b.startTime));\n const consents=await"));
edit('controllers/parent.controller.js',s=>s.replace("g.paid += f.paidAmount ?? (f.status==='paid'?f.amount:0);","g.paid += f.status==='paid'?f.amount:(f.paidAmount||0);")
.replace("g.total += f.amount;","g.total += ['waived','cancelled','refunded'].includes(f.status)?0:f.amount;")
.replace("const withInstitution = links.map((l) => {","const withInstitution = await Promise.all(links.map(async (l) => {")
.replace("obj.student.primaryInstitution = institutionByStudent.get(l.student._id.toString()) || null;","obj.student.institutions = await Institution.find({_id:{$in:await family.institutions(l.student._id)}}).select('name logo phone email address website');\n    obj.student.primaryInstitution = obj.student.institutions[0]?._id || null;")
.replace("return obj;\n  });","return obj;\n  }));"));
edit('controllers/institution.controller.js',s=>s.replace("const memberIds = await StudentInstitutionMembership.find({ institution: institution._id, status: 'active' }).distinct('student');","const memberIds = await family.students(institution._id);"));
console.log('Parent integration repairs applied.');
