import { apiRequest } from '../api/client';

// Real cloud storage for universal uploads (profile photo, campus photos, Digital Locker
// documents) — CareerZ's own platform-wide Cloudinary account (server-side signed upload, so
// the secret never reaches the browser), separate from the per-user BYOK video-storage account.
// Not every deployment has this configured yet, so callers should fall back to the previous
// resize-to-base64 behavior when `isPlatformUploadAvailable()` resolves false.
let configuredPromise = null;

export function isPlatformUploadAvailable() {
  if (!configuredPromise) {
    configuredPromise = apiRequest('/media/platform/config').then((d) => d.configured).catch(() => false);
  }
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
