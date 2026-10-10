import { apiRequest, session } from './client';
const KEY = 'careerz_social_verifier';
export const PENDING_LINK = 'careerz_social_link';
export async function startSocialLogin(provider) {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const bindingHash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
  const { url } = await apiRequest('/auth/social/start/'+provider, {method:'POST',auth:false,body:{bindingHash,returnOrigin:location.origin}});
  sessionStorage.setItem(KEY,verifier);
  location.assign(url);
}
export async function finishSocialLogin(ticket) {
  const verifier = sessionStorage.getItem(KEY);
  if (!ticket || !verifier) throw new Error('Your sign-in session is missing. Please start again.');
  const result = await apiRequest('/auth/social/exchange',{method:'POST',auth:false,body:{ticket,verifier}});
  if (result.linkRequired) sessionStorage.setItem(PENDING_LINK,JSON.stringify({ticket,verifier}));
  else sessionStorage.removeItem(PENDING_LINK);
  sessionStorage.removeItem(KEY);
  if (result.user) session.set(result);
  return result;
}
export async function linkPendingSocialAccount() {
  const value=sessionStorage.getItem(PENDING_LINK);
  if (!value) return;
  try { await apiRequest('/auth/social/link',{method:'POST',body:JSON.parse(value)}); }
  finally { sessionStorage.removeItem(PENDING_LINK); }
}
