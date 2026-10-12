const fs=require('node:fs'),root='D:/Career-Z-backend/src/';
let p=root+'models/ParentTeacherMeeting.js',s=fs.readFileSync(p,'utf8');
s=s.replace('    bookingKey:',`    history:[{status:{type:String,enum:['pending','confirmed','declined','completed','cancelled','expired'],required:true},actor:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},at:{type:Date,default:Date.now},scheduledFor:Date,noShow:{type:Boolean,default:false}}],
    bookingKey:`);
s=s.replace("module.exports = mongoose.model('ParentTeacherMeeting', parentTeacherMeetingSchema);",`parentTeacherMeetingSchema.pre('save',function(){
 if(this.isNew||this.isModified('status'))this.history.push({status:this.status,actor:this.$locals.historyActor||(this.isNew?this.parent:this.cancelledBy||this.teacher),at:new Date(),scheduledFor:this.confirmedDate||this.requestedDate,noShow:this.noShow===true});
});
module.exports = mongoose.model('ParentTeacherMeeting', parentTeacherMeetingSchema);`);fs.writeFileSync(p,s);
p=root+'controllers/ptm.controller.js';s=fs.readFileSync(p,'utf8');s=s.replace("    .populate('student', 'fullName')","    .populate('student', 'fullName')\n    .populate('institution','name')\n    .populate('observation','type text subject')\n    .populate('history.actor','fullName')");s=s.replaceAll('await meeting.save();','meeting.$locals.historyActor=req.user._id;await meeting.save();');fs.writeFileSync(p,s);
p=root+'services/familyAutomation.service.js';s=fs.readFileSync(p,'utf8');s=s.replace("{$set:{status:'expired'}}","{$set:{status:'expired'},$push:{history:{status:'expired',actor:null,at:now,scheduledFor:m.requestedDate}}}");fs.writeFileSync(p,s);
