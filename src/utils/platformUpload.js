import { apiRequest } from '../api/client';

// Real cloud storage for universal uploads (profile photo, campus photos, Digital Locker
// documents) — CareerZ's own platform-wide Cloudinary account (server-side signed upload, so
// the secret never reaches the browser), separate from the per-user BYOK video-storage account.
// Not every deployment has this configured yet, so callers should fall back to the previous
// resize-to-base64 behavior when `isPlatformUploadAvailable()` resolves false.
let configuredPromise = null;
let cachedFalseAt = 0;

// Caches a successful "yes, configured" result for the rest of the page session (it can't become
// unconfigured mid-session). A "not configured"/error result is deliberately NOT cached the same
// way — otherwise a transient backend hiccup (or checking this before an admin finishes setting
// Cloudinary env vars, which only take effect after that backend process restarts) freezes every
// upload feature as "unavailable" for the rest of the tab's life, even after the real problem is
// fixed, until a full page reload happens to clear this module-level cache.
export function isPlatformUploadAvailable() {
  if (configuredPromise && (cachedFalseAt === 0 || Date.now() - cachedFalseAt < 15000)) return configuredPromise;
  configuredPromise = apiRequest('/media/platform/config').then((d) => {
    if (!d.configured) cachedFalseAt = Date.now(); else cachedFalseAt = 0;
    return d.configured;
  }).catch(() => { cachedFalseAt = Date.now(); return false; });
  return configuredPromise;
}

// Uploads a File/Blob directly to Cloudinary and returns its real https URL.
export async function uploadToPlatformStorage(file, folder) {
  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await apiRequest(
    `/media/platform/signature${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`,
    { method: 'POST' }
  );

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('folder', signedFolder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed.');
  return data.secure_url;
}
