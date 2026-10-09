import { API_BASE, apiRequest, session, tryRefreshToken, ApiError } from './client';

export const getRequirements = () => apiRequest('/onboarding/requirements', { auth: false });
export const getAccountStatus = () => apiRequest('/onboarding/status');
export const getMyVerificationHistory = () => apiRequest('/onboarding/history');
export const addAccountType = (accountType, subtype) => apiRequest('/onboarding/account-types', { method: 'POST', body: { accountType, subtype } });
export const setAccountSubtype = (role, subtype) => apiRequest(`/onboarding/account-types/${role}`, { method: 'PATCH', body: { subtype } });
export const submitForVerification = (role) => apiRequest('/onboarding/submit', { method: 'POST', body: { role } });
export const saveProfile = (role, fields, complete = false) => apiRequest('/onboarding/profile', { method: 'PUT', body: { role, fields, complete } });

export const listVerifications = (params) => apiRequest(`/admin/verifications?${new URLSearchParams(params)}`);
export const getVerification = (id) => apiRequest(`/admin/verifications/${id}`);
export const decideVerification = (id, body) => apiRequest(`/admin/verifications/${id}/decision`, { method: 'POST', body });

function sendFile(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${session.getAccessToken()}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name || 'document'));
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onerror = () => reject(new ApiError('Upload failed — check your connection and try again.', 0));
    xhr.onload = () => {
      let payload = {};
      try { payload = JSON.parse(xhr.responseText); } catch { /* non-JSON error */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(payload.data);
      else reject(new ApiError(payload.message || 'Upload failed.', xhr.status, payload.errors));
    };
    xhr.send(file);
  });
}

// Raw file upload with progress; the server checks the real file type, size and duplicates.
export async function uploadVerificationDocument({ role, documentType, file, onProgress }) {
  const url = `${API_BASE}/onboarding/documents?role=${encodeURIComponent(role)}&type=${encodeURIComponent(documentType)}`;
  try {
    return await sendFile(url, file, onProgress);
  } catch (err) {
    if (err.status === 401 && await tryRefreshToken()) return sendFile(url, file, onProgress);
    throw err;
  }
}

// Documents are never public — fetch with the session token and show them from a blob URL.
export async function fetchVerificationDocument(id) {
  const load = () => fetch(`${API_BASE}/onboarding/documents/${id}/file`, { headers: { Authorization: `Bearer ${session.getAccessToken()}` } });
  let res = await load();
  if (res.status === 401 && await tryRefreshToken()) res = await load();
  if (!res.ok) throw new ApiError(res.status === 404 ? 'Document not found.' : 'Could not open the document.', res.status);
  return res.blob();
}
