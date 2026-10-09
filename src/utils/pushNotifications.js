import { apiRequest } from '../api/client';

// Browser (Web Push) notifications. Uses the same service worker as offline study
// (/learning-sw.js), which handles the 'push' and 'notificationclick' events.
export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function urlBase64ToUint8Array(base64) {
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  await navigator.serviceWorker.register('/learning-sw.js');
  return navigator.serviceWorker.ready;
}

export async function currentPushSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration('/');
  return reg ? reg.pushManager.getSubscription() : null;
}

export async function enablePush() {
  if (!pushSupported()) throw new Error('This browser does not support notifications.');
  const { enabled, publicKey } = await apiRequest('/notifications/push/public-key');
  if (!enabled || !publicKey) throw new Error('Browser notifications are not configured on the server yet.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications were blocked. Allow them in the browser site settings.');
  const reg = await registration();
  const subscription = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
  await apiRequest('/notifications/push/subscriptions', { method: 'POST', body: subscription.toJSON() });
  return true;
}

export async function disablePush() {
  const subscription = await currentPushSubscription();
  if (!subscription) return false;
  await apiRequest('/notifications/push/subscriptions', { method: 'DELETE', body: { endpoint: subscription.endpoint } }).catch(() => {});
  await subscription.unsubscribe();
  return false;
}
