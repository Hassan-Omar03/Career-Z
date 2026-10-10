const fs=require('fs'),root='D:/Career-Z-backend/src/';const edit=(f,fn)=>fs.writeFileSync(root+f,fn(fs.readFileSync(root+f,'utf8').replace(/\r\n/g,'\n')));
edit('models/ParentTeacherMeeting.js',s=>s.replace("parent: { type:","bookingKey:{type:String,unique:true,sparse:true},\n    parent: { type:"));
edit('controllers/ptm.controller.js',s=>s.replace("meeting.status = decision;\n  await meeting.save();", "meeting.status = decision;\n  if(decision==='confirmed')meeting.bookingKey=String(meeting.teacher)+':'+meeting.confirmedDate.toISOString();\n  try{await meeting.save();}catch(e){if(e.code===11000)throw new AppError('This teacher meeting time is already booked.',409);throw e;}")
.replace("meeting.status = 'cancelled';", "meeting.status = 'cancelled';\n  meeting.bookingKey=undefined;")
.replace("status: 'confirmed', recurringSchedule: schedule._id", "bookingKey:String(schedule.teacher)+':'+target.toISOString(),status: 'confirmed', recurringSchedule: schedule._id")
.replace("const meeting = await ParentTeacherMeeting.create({\n    parent: req.user._id, teacher: schedule.teacher", "let meeting;try{meeting = await ParentTeacherMeeting.create({\n    parent: req.user._id, teacher: schedule.teacher")
.replace("status: 'confirmed', recurringSchedule: schedule._id\n  });", "status: 'confirmed', recurringSchedule: schedule._id\n  });}catch(e){if(e.code===11000)throw new AppError('That slot was just booked by someone else.',409);throw e;}")
.replace("item.done = req.body.done !== false;", "if(typeof req.body.done!=='boolean')throw new AppError('Task completion must be boolean.',422);\n  item.done = req.body.done;"));
let p='src/pages/Dashboard.jsx',s=fs.readFileSync(p,'utf8').replaceAll("['present', 'absent', 'late', 'excused'].map", "['present', 'absent', 'late', 'excused', 'half_day'].map");fs.writeFileSync(p,s);
console.log('PTM exact-time concurrent booking guard and half-day marking installed.');
