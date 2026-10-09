const { createRequire } = require('node:module');
const backendRequire = createRequire('D:/Career-Z-backend/package.json');
const env = backendRequire('./src/config/env');
const mongoose = backendRequire('mongoose');
async function main() {
  for (const key of ['paddle', 'nowPayments', 'jazzCash']) {
    console.log(key, JSON.stringify(Object.fromEntries(Object.entries(env[key]).map(([name, value]) => [name, /environment|returnUrl/.test(name) ? value : Boolean(value)]))));
  }
  for (const provider of ['paddle', 'nowpayments', 'jazzcash']) {
    try {
      const response = await fetch(`https://career-z-backend.vercel.app/api/payments/${provider}/config`, { signal: AbortSignal.timeout(20000) });
      console.log('deployed', provider, response.status, JSON.stringify(await response.json()));
    } catch { console.log('deployed', provider, 'unavailable'); }
  }
  const probes = [
    ['Paddle account', `${env.paddle.environment === 'production' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com'}/products?per_page=1`, { Authorization: `Bearer ${env.paddle.apiKey}` }],
    ['Paddle notification destinations', `${env.paddle.environment === 'production' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com'}/notification-settings`, { Authorization: `Bearer ${env.paddle.apiKey}` }],
    ['NOWPayments account balance/payout access', 'https://api.nowpayments.io/v1/balance', { 'x-api-key': env.nowPayments.apiKey }],
    ['NOWPayments payment estimate', 'https://api.nowpayments.io/v1/estimate?amount=100&currency_from=usd&currency_to=usdttrc20', { 'x-api-key': env.nowPayments.apiKey }]
  ];
  for (const [name, url, headers] of probes) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
      const payload = await response.json();
      console.log(name, response.status, response.ok ? 'credentials accepted' : (payload.error?.type || payload.code || 'credentials/request rejected'));
      if (name === 'Paddle notification destinations' && response.ok) console.log('Paddle webhooks', JSON.stringify(payload.data.map(item => ({ destination: item.destination, active: item.active, subscribedEvents: item.subscribed_events?.map(event => event.name || event) }))));
    } catch { console.log(name, 'unavailable'); }
  }
  try {
    const service = backendRequire('./src/services/jazzcash.service');
    const response = await service.inquire('T2026100813574162112');
    console.log('Screenshot transaction inquiry', JSON.stringify(Object.fromEntries(Object.entries(response).filter(([key]) => /ResponseCode|ResponseMessage|Status/i.test(key)))));
  } catch { console.log('Screenshot transaction inquiry unavailable'); }
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
      const Payment = backendRequire('./src/models/JazzCashPayment');
      const payments = await Payment.find().sort({ createdAt: -1 }).limit(5).select('txnRefNo status responseCode responseMessage createdAt').lean();
      console.log('recent JazzCash outcomes', JSON.stringify(payments));
    } catch { console.log('database read unavailable'); }
    finally { await mongoose.disconnect(); }
  }
}
main().catch(() => { console.error('Readiness probe failed'); process.exitCode = 1; });
