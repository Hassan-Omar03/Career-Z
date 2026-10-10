const fs=require('fs'),root='D:/Career-Z-backend/src/';const edit=(f,fn)=>fs.writeFileSync(root+f,fn(fs.readFileSync(root+f,'utf8').replace(/\r\n/g,'\n')));
edit('controllers/familyWallet.controller.js',s=>s.replace("const outstanding=fee.outstandingAmount", "if(fee.schedule){const schedule=await require('../models/FeeSchedule').findById(fee.schedule).session(session);const min=Number(schedule?.minimumPartialPayment||0);const balance=fee.outstandingAmount??Math.max(0,fee.amount-(fee.paidAmount||0));if(value<min&&value<balance)throw new AppError('Payment is below the institution minimum partial payment.',422);}\n  const outstanding=fee.outstandingAmount")
.replace('module.exports={pay};',`async function refund(feeId,actor){let result;await mongoose.connection.transaction(async session=>{
 const fee=await Fee.findById(feeId).session(session);if(!fee||fee.status!=='paid'||!['approved','requested'].includes(fee.refund.status))throw new AppError('Refund is no longer available.',409);
 const settlements=await Settlement.find({fee:feeId}).session(session);
 for(const row of settlements){if(row.refundedAt)continue;
  if(row.net>0&&!await Wallet.findOneAndUpdate({user:row.recipient,currency:row.currency,available:{$gte:row.net}},{$inc:{available:-row.net}},{session}))throw new AppError('Institution wallet has insufficient funds to return this payment.',422);
  if(row.commission>0&&!await require('../models/FamilyPlatformBalance').findOneAndUpdate({currency:row.currency,available:{$gte:row.commission}},{$inc:{available:-row.commission}},{session}))throw new AppError('Commission balance unavailable for refund.',422);
  await Wallet.findOneAndUpdate({user:row.payer,currency:row.currency},{$inc:{available:row.amount}},{upsert:true,session});
  await Transaction.create([{user:row.payer,type:'transfer_in',amount:row.amount,currency:row.currency,reference:row.reference+'-REFUND',status:'completed',counterparty:row.recipient,note:'Fee refund'},...(row.net>0?[{user:row.recipient,type:'transfer_out',amount:row.net,currency:row.currency,reference:row.reference+'-REFUND-OUT',status:'completed',counterparty:row.payer,note:'Fee refund settlement'}]:[])],{session,ordered:true});
  row.refundedAt=new Date();await row.save({session});
 }
 fee.status='refunded';fee.refund.status='refunded';fee.refund.processedBy=actor;fee.refund.processedAt=new Date();await fee.save({session});result=fee;
 });return result;}
module.exports={pay,refund};`));
edit('models/FamilyWalletSettlement.js',s=>s.replace('amount:Number,','refundedAt:Date,amount:Number,'));
edit('controllers/institution.controller.js',s=>s.replace("fee.refund.status = decision;","if(decision==='refunded'&&await require('../models/FamilyWalletSettlement').exists({fee:fee._id})){const refunded=await require('./familyWallet.controller').refund(fee._id,req.user._id);await require('../services/notification.service').notifyParentsOfStudent(fee.student,{title:'Wallet fee refund completed',body:fee.currency+' '+fee.refund.amount,sentBy:req.user._id}).catch(()=>{});return ok(res,refunded,'Wallet refund completed.');}\n  fee.refund.status = decision;"));
console.log('Wallet partial-payment policy and transactional refunds installed.');
