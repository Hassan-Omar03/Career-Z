const mongoose=require('mongoose'),crypto=require('crypto');
const Fee=require('../models/Fee'),Wallet=require('../models/Wallet'),Transaction=require('../models/WalletTransaction'),Institution=require('../models/Institution');
const family=require('../services/familyAccess.service'),AppError=require('../utils/AppError'),asyncHandler=require('../utils/asyncHandler'),{ok}=require('../utils/apiResponse');
const {notifyParentsOfStudent,notify}=require('../services/notification.service');
const Settlement=require('../models/FamilyWalletSettlement');
const pay=asyncHandler(async(req,res)=>{
 const value=Number(req.body.amount),key=String(req.body.requestId||'');
 if(!Number.isFinite(value)||value<=0||!Number.isSafeInteger(Math.round(value*100))||Math.abs(value*100-Math.round(value*100))>1e-6||!/^[a-zA-Z0-9_-]{16,80}$/.test(key))throw new AppError('A positive two-decimal amount and payment request ID are required.',422);
 const reference='FW-'+req.user._id+'-'+key;let result;
 await mongoose.connection.transaction(async session=>{
  const fee=await Fee.findById(req.params.feeId).session(session);if(!fee)throw new AppError('Invoice not found.',404);
  await family.link(req.user._id,fee.student,'payFees');
  const existing=await Settlement.findOne({reference}).session(session);if(existing){if(!family.same(existing.fee,fee._id)||existing.amount!==value)throw new AppError('Payment request already used for another payment.',409);result=fee;return;}
  if(!['pending','overdue','partially_paid'].includes(fee.status))throw new AppError('This invoice cannot be paid now.',409);
  const outstanding=fee.outstandingAmount??Math.max(0,fee.amount-(fee.paidAmount||0));if(value>outstanding)throw new AppError('Payment exceeds the outstanding balance.',422);
  const school=await Institution.findById(fee.institution).session(session);if(!school||school.status!=='active'||school.verificationStatus!=='approved')throw new AppError('Institution is not available for payments.',403);
  const setting=await require('../models/Setting').findOne({key:'fee_commission_percent'}).session(session);const rate=Number(setting?.value||0);if(!Number.isFinite(rate)||rate<0||rate>100)throw new AppError('Invalid institution commission configuration.',503);
  const commission=Math.round(value*rate)/100,net=Math.round((value-commission)*100)/100;
  const balance=await Wallet.findOneAndUpdate({user:req.user._id,currency:fee.currency,available:{$gte:value}},{$inc:{available:-value}},{new:true,session});if(!balance)throw new AppError('Insufficient wallet balance in '+fee.currency+'.',422);
  await Wallet.findOneAndUpdate({user:school.owner,currency:fee.currency},{$inc:{available:net}},{upsert:true,session,setDefaultsOnInsert:true});
  await require('../models/FamilyPlatformBalance').findOneAndUpdate({currency:fee.currency},{$inc:{available:commission}},{upsert:true,session,setDefaultsOnInsert:true});
  await Settlement.create([{reference,fee:fee._id,payer:req.user._id,recipient:school.owner,amount:value,currency:fee.currency,commission,net}],{session});
  await Transaction.create([{user:req.user._id,type:'transfer_out',amount:value,currency:fee.currency,reference,status:'completed',counterparty:school.owner,note:'Fee payment: '+fee.title},...(net>0?[{user:school.owner,type:'transfer_in',amount:net,currency:fee.currency,reference:reference+'-IN',status:'completed',counterparty:req.user._id,note:'Fee settlement: '+fee.title}]:[])],{session});
  const receipt='RCPT-'+crypto.randomBytes(10).toString('hex').toUpperCase();const verification=crypto.randomBytes(12).toString('hex');
  fee.paymentHistory.push({amount:value,method:'CareerZ Wallet',transactionId:reference,recordedBy:req.user._id,verifiedAt:new Date(),verificationStatus:'verified',receiptNumber:receipt,verifyCode:verification});
  fee.paidAmount=Math.round(((fee.paidAmount||0)+value)*100)/100;fee.outstandingAmount=Math.max(0,Math.round((fee.amount-fee.paidAmount)*100)/100);fee.status=fee.outstandingAmount===0?'paid':'partially_paid';fee.paidBy=req.user._id;fee.paidVia='CareerZ Wallet';
  if(fee.status==='paid'){fee.paidAt=new Date();fee.restrictionActive=false;fee.receiptNumber=fee.receiptNumber||receipt;fee.verifyCode=fee.verifyCode||verification;}
  await fee.save({session});result=fee;
 });
 await notifyParentsOfStudent(result.student,{title:'Wallet fee payment verified',body:result.currency+' '+value+' paid for '+result.title,sentBy:req.user._id}).catch(()=>{});
 return ok(res,family.safeFee(result),'Wallet payment completed.');
});
module.exports={pay};
