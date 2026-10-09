const { createRequire } = require('node:module');
const req = createRequire('D:/Career-Z-backend/package.json');
const service = req('./src/services/jazzcash.service');
const fields = service.buildCheckoutFields({ txnRefNo: 'T2026100815305469630', amountPaisa: 10000, billReference: 'wallet_topup', description: 'Wallet top-up PKR 100', returnUrl: 'https://career-z-backend.vercel.app/api/payments/jazzcash/return' });
fields.pp_TxnDateTime = '20261008153054';
fields.pp_TxnExpiryDateTime = '20261011153054';
console.log('Original checkout signature matches portal request:', service.secureHash(fields) === '95960A217D1757DFD9DC7BC4B7D788A10F75E5DFDB50A01953C9D153BAF8F62C');
const response = { pp_Amount:'10000', pp_AuthCode:'', pp_BankID:'', pp_BillReference:'wallettopup', pp_Language:'EN', pp_MerchantID:fields.pp_MerchantID, pp_ResponseCode:'199', pp_ResponseMessage:'Sorry! Your transaction was not successful. Please try again later.', pp_RetreivalReferenceNo:'261008756078', pp_SecureHash:'4EF238C957DDF8EDBF46DA86F3B9BE6F9EEF099C8022E68BE88E658F5857E556', pp_SettlementExpiry:'', pp_SubMerchantId:'', pp_TxnCurrency:'PKR', pp_TxnDateTime:'20261008153054', pp_TxnRefNo:fields.pp_TxnRefNo, pp_TxnType:'MWALLET', pp_Version:'1.1', ppmpf_1:'', ppmpf_2:'', ppmpf_3:'', ppmpf_4:'', ppmpf_5:'' };
console.log('Actual gateway failure response signature verified:', service.verifySecureHash(response));
