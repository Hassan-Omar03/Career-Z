import { apiRequest } from '../api/client';

// JazzCash "Page Redirect": the backend returns signed form fields, and the browser POSTs them to
// JazzCash's hosted page (wallet / card / voucher). JazzCash then posts the browser back to the
// backend, which verifies the signature and redirects to /dashboard?jazzcash=<status>&ref=<ref>.
export async function startJazzCashCheckout(path, body) {
  const { actionUrl, fields } = await apiRequest(path, { method: 'POST', body });
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl;
  form.style.display = 'none';
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export function getJazzCashConfig() {
  return apiRequest('/payments/jazzcash/config').catch(() => ({ enabled: false }));
}

export const JAZZCASH_RESULT_MESSAGE = {
  paid: ['JazzCash payment successful.', 'success'],
  awaiting_payment: ['JazzCash voucher created — pay it at any JazzCash shop or via the app. It will be confirmed automatically.', 'success'],
  failed: ['JazzCash payment was not completed. You can try again.', 'error'],
  error: ['Could not confirm the JazzCash payment. If money was deducted, contact support with the reference number.', 'error']
};
