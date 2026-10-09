# Payment integration review — 8 October 2026

## Verified provider status

- Paddle credentials and deployed public configuration use sandbox. Corrected sandbox transaction creation returned a draft with a checkout URL. No money was charged.
- Paddle notification destination was `https://example.com/webhook`. Updated the existing sandbox destination to `https://career-z-backend.vercel.app/api/webhooks/paddle`, active, retaining its subscribed events. Its signing secret did not match the local environment; synchronized the local `.env` without printing or committing secrets. Vercel `PADDLE_WEBHOOK_SECRET` still needs to match this destination's secret in Paddle > Notifications. Remote environment could not be inspected or updated with available deployment credentials.
- NOWPayments production pay-in API credentials accepted a payment estimate. Balance endpoint returned HTTP403 `ENDPOINT_NOT_ALLOWED`; this does not establish permission to make automatic payouts. No payout was attempted.
- JazzCash local and deployed public configuration use sandbox. Inquiry for screenshot reference `T2026100813574162112` returned inquiry response `000`, but payment response `999` and status `Failed`. Inquiry success is not payment success. The generic gateway message does not identify the underlying failure; inspect the merchant portal transaction logs for that reference.

## Code fixes prepared locally in both repositories

- Correct Paddle featured-job frontend routes and transaction request format.
- Preserve pending JazzCash statuses, add inquiry version, parse documented JSON return envelope, validate amount/merchant/currency, and implement signed IPN confirmation.
- Display actionable JazzCash result codes instead of only a generic unsuccessful-payment message.
- Credit NOWPayments only on `finished`, verify recorded order/amount/currency/payment metadata, and canonicalize nested webhook payload signatures.
- Add owner-scoped recovery of recent pending wallet, fee and course payments, polling while the authenticated dashboard is open. Confirmations refresh wallet and student fee displays. Signed webhooks remain the confirmation path when the browser is closed.
- Add provider timeouts and retain atomic/idempotent settlement to prevent duplicate credit.

These code changes were committed and pushed to both repositories' `main` branches at the user's request: frontend `8c2ff30` (`Hassan-Omar03/Career-Z`) and backend `fb55ea2` (`Hassan-Omar03/Career-Z-backend`). Deployment verification confirmed the public frontend bundle includes `/payments/pending/sync`, the new backend recovery endpoint responds with the expected authentication-required HTTP401, and the new JazzCash IPN endpoint rejects unsigned requests with HTTP400. The provider-side Paddle sandbox destination update is already applied. No production-mode switch, real charge, salary disbursement or database balance adjustment was performed.

## Validation

- Backend focused regressions: 45 passed, 0 failed (JazzCash, NOWPayments, course payments and reliability).
- Frontend tests: 5 passed. Production build passed with existing dependency/chunk warnings.
- Corrected Paddle draft creation validated against the real sandbox API.

## Activation requirements

1. Both code deployments are verified. Set Vercel Paddle signing secret from the corrected notification destination; remote environment access was unavailable. Keep secrets out of chat and Git.
2. Configure JazzCash merchant status-update/IPN service for `/api/payments/jazzcash/ipn`; retain registered `/api/payments/jazzcash/return` browser return URL.
3. Use approved production Paddle/JazzCash credentials and corresponding live callback settings before enabling real card/wallet payments. Sandbox keys cannot activate live collection.
4. External automatic teacher salaries remain a separate payout integration. Existing JazzCash hosted checkout is collection, and the tested NOWPayments key does not demonstrate payout access. Enable the appropriate disbursement account and establish the intended salary destination before implementing it.
5. Verify a completed sandbox payment, webhook receipt, one ledger credit and duplicate delivery handling on the deployed system; then separately verify production after approved credentials are configured.

## Official references reviewed

### Follow-up code audit using the actual merchant log

- Reconstructed checkout `T2026100815305469630` using the local merchant credentials and exact recorded timestamps, amount, description and return URL. The generated request signature exactly matched the portal's recorded signature. Credentials were not logged.
- Verified the actual provider failure response's signature successfully with the configured integrity salt. The signed provider response is genuinely a failure; this is not a frontend success accidentally displayed as failure.
- `pp_UsageMode=PR` means Page Redirection, not production (official API reference). Do not change it to a guessed sandbox mode.
- PKR100 correctly becomes `pp_Amount=10000`. The callback parser and form transport match the hosted checkout flow. CNIC requirements in direct wallet API v2 do not establish a missing field in hosted checkout v1.1.
- Found and fixed two unrelated robustness bugs: JSON return envelopes containing null/non-object values and malformed Unicode signatures could throw instead of being rejected safely. All 17 JazzCash tests passed, including independent documentation-based signing input and malformed callbacks. Backend follow-up commit `493440f` was pushed to main; deployment verification is pending.
- The failure's internal cause remains unproven. Successful signed requests and inquiry access cannot prove the merchant's simulator/payment-method provisioning is correct. Both card and wallet failure logs warrant provider investigation.

- [JazzCash integration guide v4.2](https://sandbox.jazzcash.com.pk/SandboxDocumentation/Content/documentation/Payment%20Gateway%20Integration%20Guide%20for%20Merchants-v4.2.pdf)
- [JazzCash API references](https://sandbox.jazzcash.com.pk/SandboxDocumentation/v4.2/ApiReferences.html)
- [Paddle transaction creation](https://developer.paddle.com/api-reference/transactions/create-transaction/)
- [Paddle notification destinations](https://developer.paddle.com/webhooks/about/notification-destinations/)
- [NOWPayments IPN documentation](https://nowpayments.zendesk.com/hc/en-us/articles/21395546303389-IPN-and-how-to-setup)
- [Official NOWPayments Node SDK](https://github.com/NowPaymentsIO/nowpayments-sdk-nodejs)
