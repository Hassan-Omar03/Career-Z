async function main() {
  for (const [name, url, method] of [
    ['frontend', 'https://career-z-zeta.vercel.app/app/dashboard', 'GET'],
    ['backend recovery', 'https://career-z-backend.vercel.app/api/payments/pending/sync', 'POST'],
    ['backend IPN', 'https://career-z-backend.vercel.app/api/payments/jazzcash/ipn', 'POST']
  ]) {
    const response = await fetch(url, { method, signal: AbortSignal.timeout(20000) });
    const body = await response.text();
    console.log(name, response.status, name === 'frontend' ? body.match(/src="[^"]+\.js"/g) : body.slice(0,350));
    if (name === 'frontend') {
      const assets = [...body.matchAll(/src="([^"]+\.js)"/g)];
      for (const [, asset] of assets) {
        const source = await (await fetch(new URL(asset, url))).text();
        console.log('frontend recovery code deployed', source.includes('/payments/pending/sync'));
      }
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
