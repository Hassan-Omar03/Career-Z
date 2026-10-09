// Only app-shell/static assets. Never cache APIs, tokens or personalized responses.
const CACHE = 'careerz-shell-learning-v1';
function isStaticPath(pathname) { return /^\/(assets\/|src\/|node_modules\/|@vite\/|favicon\.|icons\.|logo\d*\.)/.test(pathname); }
self.addEventListener('message', event => {
  if (event.data?.type !== 'cache-learning-shell' || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter(value => {
    try { const url = new URL(value); return url.origin === self.location.origin && isStaticPath(url.pathname) && /\.(js|jsx|css|woff2?|png|svg)(\?|$)/.test(url.pathname) && !/api|auth|socket\.io/i.test(url.pathname); }
    catch { return false; }
  });
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(urls.map(url => cache.add(url)))));
});
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/', '/index.html']))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || /socket\.io|auth|webhook/i.test(url.pathname)) return;
  if (event.request.mode === 'navigate') { event.respondWith(fetch(event.request).then(response => { if (response.ok) caches.open(CACHE).then(cache => cache.put('/index.html', response.clone())); return response; }).catch(() => caches.match('/index.html'))); return; }
  if (isStaticPath(url.pathname) && ['script', 'style', 'font', 'image'].includes(event.request.destination)) event.respondWith(fetch(event.request).then(response => { if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone())); return response; }).catch(() => caches.match(event.request)));
});
// Background notifications (Web Push): shown even when no CareerZ tab is open.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'CareerZ', body: event.data?.text() || '' }; }
  event.waitUntil(self.registration.showNotification(data.title || 'CareerZ', { body: data.body || '', icon: '/logo.png', badge: '/favicon.svg', data: { url: data.url || '/dashboard' } }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/dashboard', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(client => client.url.startsWith(self.location.origin));
    if (open) { open.navigate(target); return open.focus(); }
    return self.clients.openWindow(target);
  }));
});
