const { createRequire } = require('node:module');
const backendRequire = createRequire('D:/Career-Z-backend/package.json');
const env = backendRequire('./src/config/env');
async function main() {
  if (env.paddle.environment !== 'sandbox') throw new Error('This repair is restricted to the verified sandbox account.');
  const base = 'https://sandbox-api.paddle.com';
  const headers = { Authorization: `Bearer ${env.paddle.apiKey}`, 'Content-Type': 'application/json' };
  const response = await fetch(`${base}/notification-settings`, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`List failed: ${response.status}`);
  const { data } = await response.json();
  const destination = 'https://career-z-backend.vercel.app/api/webhooks/paddle';
  const setting = data.find(item => item.destination === 'https://example.com/webhook' || item.destination === destination);
  if (!setting) throw new Error('Expected notification destination was not found.');
  const updated = await fetch(`${base}/notification-settings/${setting.id}`, {
    method: 'PATCH', headers, signal: AbortSignal.timeout(20000),
    body: JSON.stringify({ destination, active: true, traffic_source: 'all' })
  });
  if (!updated.ok) throw new Error(`Update failed: ${updated.status}`);
  const result = (await updated.json()).data;
  const fs = require('node:fs');
  const envPath = 'D:/Career-Z-backend/.env';
  const contents = fs.readFileSync(envPath, 'utf8');
  const entry = `PADDLE_WEBHOOK_SECRET=${result.endpoint_secret_key}`;
  fs.writeFileSync(envPath, /^PADDLE_WEBHOOK_SECRET=.*$/m.test(contents)
    ? contents.replace(/^PADDLE_WEBHOOK_SECRET=.*$/m, entry)
    : `${contents}\n${entry}\n`);
  console.log(JSON.stringify({ destination: result.destination, active: result.active, environment: 'sandbox', webhookSecretMatchesLocal: result.endpoint_secret_key === env.paddle.webhookSecret }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
