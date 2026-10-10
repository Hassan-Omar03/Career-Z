# Social sign-in: implementation and setup

The four Login buttons now call the backend authorization flow. No provider app or credential is currently configured, so each button reports that configuration is required. This is not yet a live provider login.

## Backend configuration

Use `D:/Career-Z-backend/.env.social.example` as the template. Add the values to the backend environment, then restart/redeploy the backend. Keep secrets out of frontend environment variables and source control.

Set `OAUTH_SERVER_URL` to the backend origin (without `/api`). Include the frontend origin in `CLIENT_URL`. Callback URLs must match the provider app configuration exactly:

| Provider | Callback path on the backend | Required configuration |
| --- | --- | --- |
| Google | `/api/auth/social/google/callback` | Web OAuth client ID and secret |
| Facebook | `/api/auth/social/facebook/callback` | App ID, secret and supported Graph API version |
| Microsoft | `/api/auth/social/microsoft/callback` | Client ID, secret value and specific Entra tenant GUID |
| Apple | `/api/auth/social/apple/callback` | Services ID and client-secret JWT, or Team ID/Key ID/private key |

For local Google testing, the callback is `http://localhost:5000/api/auth/social/google/callback`. Register the exact backend URL in the provider dashboard. Configure consent, permitted test users and the applicable publication settings before testing with other users. Microsoft here supports the configured Entra directory; the multi-tenant `common` endpoint is not enabled. Apple requires a reachable HTTPS backend callback and configured website domain.

Official setup references:

- [Google web server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Facebook manual login flow](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/)
- [Microsoft OpenID Connect](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc)
- [Apple web configuration](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web)

## Behavior and security

- Authorization code flow; OpenID token validation uses `openid-client`. State, nonce and PKCE protect the relevant provider flows.
- The frontend generates a browser secret. Only its hash is stored with the server flow. A one-use, expiring handoff ticket requires that original secret before a session is issued. Access/refresh tokens are never put in redirect URLs.
- Returning social identities use the linked platform user. Matching email alone never logs into an existing account: the user must sign in with the existing password/2FA before linking.
- New social users start as students and retain the platform email/document/profile verification process. Account suspension, IP blocking and existing 2FA remain enforced.
- Missing provider email, cancelled authorization, expiry and already-used handoffs return clear errors. Provider credentials stay on the backend.

## Verification

`test/social-auth.test.js`: 12 isolated tests passed for configuration errors, return URL rejection, browser binding, expiry/replay, new-user verification, safe linking, 2FA, suspended accounts, blocked IP and cancellation.

Combined with `test/account-verification.test.js`: 28/28 passed. Frontend API tests: 5/5 passed. Chrome checked all four buttons against the unconfigured backend. Production frontend build passed.

Provider-issued credentials and real consent/callback flows have not been tested because no provider apps exist yet. Secrets must be configured before those live checks can be completed.
