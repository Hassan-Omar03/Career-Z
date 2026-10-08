import { useEffect } from 'react';
import { apiRequest } from '../api/client';

// Server verifies each pending payment against its provider. No payment is initiated here.
export function usePaymentRecovery(userId, onConfirmed) {
  useEffect(() => {
    if (!userId) return undefined;
    let disposed = false;
    let timer;
    async function recover() {
      if (disposed) return;
      try {
        const result = await apiRequest('/payments/pending/sync', { method: 'POST' });
        if (!disposed && result.completed > 0) {
          window.dispatchEvent(new Event('careerz:payment-confirmed'));
          onConfirmed?.('Payment confirmed automatically.', 'success');
        }
      } catch { /* Provider webhook is still authoritative; retry after temporary errors. */ }
      if (!disposed) timer = setTimeout(recover, 30000);
    }
    recover();
    return () => { disposed = true; clearTimeout(timer); };
  }, [userId]); // onConfirmed is presentation-only, not a reason to restart the loop.
}
