const { createRequire } = require('node:module');
const backendRequire = createRequire('D:/Career-Z-backend/package.json');
const service = backendRequire('./src/services/jazzcash.service');
service.inquire('T2026100815250489370').then(response => {
  console.log(JSON.stringify(Object.fromEntries(Object.entries(response).filter(([key]) => /ResponseCode|ResponseMessage|Status/i.test(key)))));
}).catch(error => { console.error(error.message); process.exitCode = 1; });
