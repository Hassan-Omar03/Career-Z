const { createRequire } = require('node:module');
const requireBackend = createRequire('D:/Career-Z-backend/package.json');
const env = requireBackend('./src/config/env');
if (env.paddle.environment !== 'sandbox') throw new Error('This verification only permits sandbox transactions.');
const paddle = requireBackend('./src/services/paddle.service');
paddle.createTransaction({ title: 'CareerZ sandbox integration verification', amount: 1, currencyCode: 'USD', metadata: { kind: 'integration_verification', testOnly: true } })
  .then(transaction => console.log(JSON.stringify({ id: transaction.id, status: transaction.status, checkoutAvailable: Boolean(transaction.checkout?.url), sandboxOnly: true, charged: false })))
  .catch(error => { console.error(error.message); process.exitCode = 1; });
