import { apiRequest, session } from '../api/client';
const DB = 'careerz-learning-v1';
function owner() { const u = session.getUser(); if (!u?._id) throw new Error('Sign in to use offline learning.'); return u._id; }
function database() { return new Promise((resolve, reject) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => { r.result.createObjectStore('packages', { keyPath: 'key' }); r.result.createObjectStore('progress', { keyPath: 'key' }); r.result.createObjectStore('drafts', { keyPath: 'key' }); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
async function transact(store, mode, work) { const db = await database(); return new Promise((resolve, reject) => { const tx = db.transaction(store, mode); let value; const request = work(tx.objectStore(store)); if (request) { const handler = request.onsuccess; request.onsuccess = event => { handler?.call(request, event); value = request.result; }; } tx.oncomplete = () => { db.close(); resolve(value); }; tx.onerror = () => { db.close(); reject(tx.error); }; tx.onabort = () => { db.close(); reject(tx.error || new Error('Offline storage failed.')); }; }); }
export async function offlinePackages() { const id = owner(); return (await transact('packages', 'readonly', s => s.getAll())).filter(p => p.owner === id); }
export async function downloadCourse(courseId, onProgress = () => {}) {
  const user = owner(); const pack = await apiRequest(`/learning/${courseId}/offline-package`);
  const warnings = []; const files = {}; const urls = [...new Set([...pack.lessons.flatMap(l => [...(l.resources || []).map(r => r.url), ...(l.videoDownloadAllowed !== false ? [...(l.videoUrl ? [l.videoUrl] : []), ...(l.videoSources || []).map(s => s.url)] : []), ...(l.captions || []).map(s => s.url), ...(l.deck?.slides || []).map(s => s.imageUrl).filter(Boolean)]), ...(pack.assignments || []).flatMap(a => (a.attachments || []).map(r => r.url))])];
  let total = 0;
  for (const url of urls) { onProgress(`Downloading file ${Object.keys(files).length + warnings.length + 1}/${urls.length}`); try {
    const parsed = new URL(url, location.origin); if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Unsupported URL');
    const response = await fetch(parsed.href, { credentials: 'omit' }); if (!response.ok || response.type === 'opaque') throw new Error('Download blocked by provider');
    const contentType = response.headers.get('content-type') || ''; if (/text\/html/.test(contentType)) throw new Error('Web pages and streaming embeds cannot be downloaded as lesson files');
    const declared = Number(response.headers.get('content-length') || 0); if (declared > 100 * 1024 * 1024) throw new Error('File exceeds 100 MB offline limit');
    const blob = await response.blob(); total += blob.size; if (blob.size > 100 * 1024 * 1024 || total > 250 * 1024 * 1024) throw new Error('Offline package exceeds storage limit'); files[url] = blob;
  } catch (e) { warnings.push(`${url}: ${e.message}`); } }
  if (owner() !== user) throw new Error('Account changed during download.');
  const entry = { ...pack, key: `${user}:${courseId}`, owner: user, files, warnings };
  await transact('packages', 'readwrite', s => s.put(entry)); navigator.storage?.persist?.().catch(() => {}); return entry;
}
export async function removePackage(courseId) { return transact('packages', 'readwrite', s => s.delete(`${owner()}:${courseId}`)); }
export async function queueCompletion(lesson) { const id = owner(); await transact('progress', 'readwrite', s => s.put({ key: `${id}:${lesson._id}`, owner: id, lessonId: lesson._id, revision: lesson.revision || 1, savedAt: new Date().toISOString() })); }
export async function queueVideoProgress(lesson, progress) { const id = owner(); await transact('progress', 'readwrite', s => s.put({ key: `${id}:video:${lesson._id}`, owner: id, kind: 'video', lessonId: lesson._id, revision: lesson.revision || 1, ...progress, savedAt: new Date().toISOString() })); }
export async function pendingProgress() { const id = owner(); return (await transact('progress', 'readonly', s => s.getAll())).filter(e => e.owner === id); }
let syncing;
export async function syncProgress() {
  if (syncing) return syncing; const id = owner();
  syncing = (async () => { const entries = await pendingProgress(), results = []; for (let n = 0; n < entries.length; n += 100) { if (owner() !== id) break; const batch = await apiRequest('/learning/offline-sync', { method: 'POST', body: { entries: entries.slice(n, n + 100) } }); if (owner() !== id) break; for (const result of batch) { results.push(result); if (result.status === 'synced') { const key = `${id}:${result.kind === 'video' ? 'video:' : ''}${result.lessonId}`; const sent = entries.find(row => row.key === key); await transact('progress', 'readwrite', store => { const request = store.get(key); request.onsuccess = () => { if (request.result?.savedAt === sent?.savedAt) store.delete(key); }; }); } } } return results; })().finally(() => { syncing = null; }); return syncing;
}
export async function saveDraft(key, text) { const id = owner(); return transact('drafts', 'readwrite', s => s.put({ key: `${id}:${key}`, owner: id, text })); }
export async function loadDraft(key) { return (await transact('drafts', 'readonly', s => s.get(`${owner()}:${key}`)))?.text || ''; }
export async function clearUserOffline(id) { if (!id) return; for (const name of ['packages', 'progress', 'drafts']) { const rows = await transact(name, 'readonly', s => s.getAll()); for (const row of rows.filter(r => r.owner === id)) await transact(name, 'readwrite', s => s.delete(row.key)); } }
export function initOfflineLearning() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/learning-sw.js').then(() => navigator.serviceWorker.ready).then(registration => {
    const urls = performance.getEntriesByType('resource').map(entry => entry.name);
    registration.active?.postMessage({ type: 'cache-learning-shell', urls });
  }).catch(() => {});
  window.addEventListener('online', () => { if (session.isLoggedIn()) syncProgress().catch(() => {}); });
  window.addEventListener('careerz:logout', e => clearUserOffline(e.detail?.userId).catch(() => {}));
  if (navigator.onLine && session.isLoggedIn()) syncProgress().catch(() => {});
}
