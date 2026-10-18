import { API_BASE, session, tryRefreshToken } from '../../api/client';

// Private files (guest CVs, payment proofs) are served only to signed-in people allowed to see
// them, so they are fetched with the token and opened from a local blob URL.
export async function openPrivateFile(path, { download = false, filename = 'file' } = {}) {
  const get = () => fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${session.getAccessToken()}` } });
  let res = await get();
  if (res.status === 401 && (await tryRefreshToken())) res = await get();
  if (!res.ok) {
    let message = 'Could not open the file.';
    try { message = (await res.json()).message || message; } catch { /* not json */ }
    throw new Error(message);
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  if (download) a.download = filename; else { a.target = '_blank'; a.rel = 'noreferrer'; }
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Reads a picked file as a data: URL for JSON upload (the API caps the size).
export function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Could not read the file.'));
    r.readAsDataURL(file);
  });
}

export const money = (currency, n) => `${currency} ${Number(n || 0).toLocaleString()}`;
export const day = (d) => (d ? new Date(d).toLocaleDateString() : '—');
