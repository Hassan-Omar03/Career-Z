# CareerZ flow audit — 22 September 2026

## Final attendance and AI video scope

The current online attendance implementation includes teacher-entered manual statuses, short-lived
session QR check-in, browser camera face matching, optional browser geolocation with a configured
course radius, and WebAuthn/passkey verification. Attendance records retain the capture method,
check-in time and, for QR check-ins, the source session. Student and linked-parent reads are scoped
to that student. RFID/NFC readers, physical fingerprint machines and retina/iris hardware are
outside the current product scope.

The AI Video Lesson Creator uses the configured text and voice providers, creates scene slides,
narration and burned-in captions, assembles an MP4 in the browser with ffmpeg.wasm, uploads it to
the configured lesson storage, and saves the resulting URL as a course lesson for student playback.
The scene/video assembly is open source and provider-independent; AI keys remain configurable.
Self-hosted Whisper transcription and self-hosted TTS remain provider options for a later deployment
integration because this text-to-video path does not currently ingest speech and no self-hosted TTS
service URL is configured in this environment.

AI Cheating Detector and Class Energy Meter are explicitly deferred roadmap items.

## Remediation status

The confirmed failures below describe the baseline audit. The flow fixes have
now been applied to the frontend and sibling backend. A fresh run of
`node audit/flows.cjs` against the actual backend completed 3,068 route/role
requests with no unexpected 500s and **161/161 populated checks passing**.
The backend's 15 reliability regressions, the frontend's five session tests,
and a production frontend build also passed. Manual fee reports now remain
`processing` until institution confirmation; card payments use gateway checkout.
The audit runner can also validate a staged backend by setting
`CAREERZ_AUDIT_BACKEND_ROOT` to its directory.
Institution staff now need `ops:manage` (or `institution:ops:manage`) to use
institution operations and `fee:manage` to confirm manual fees; owners retain
access. Existing staff permission assignments should be reviewed before rollout.

Live payment providers, SMTP, AI, camera/face recognition, WebAuthn and browser
interactions still need environment-specific end-to-end checks. Paid-course
checkout has now been implemented in the sibling backend and frontend. The
backend adds Stripe and Paddle checkout routes, a `CoursePurchase` record,
verified payment completion, and idempotent enrollment. The actual backend
passed 18/18 tests, including signed webhook, unpaid/mismatched amount, and
duplicate-delivery scenarios. Frontend tests passed 5/5 and the production
build passed. Live provider checkout still requires sandbox keys and public
webhook/callback URLs; those were not configured in this environment. A local
Chrome headless smoke attempt failed to start its GPU process, so browser UI
interaction remains unverified.

The audit exercised the **actual sibling `backend/` before the reliability patch
was applied**. An isolated in-memory MongoDB replica set held
all test data. SMTP and notifications were disabled; no production data, payment
provider, AI provider, browser, or external service was used.

`node audit/flows.cjs` enumerated 447 route declarations across 41 mounted API
modules and ran 3,068 route/role smoke requests. None returned an unexpected
HTTP 500. It then ran 161 populated workflow checks across all nine frontend
workspaces: 146 passed and 15 failed. The complete HTTP evidence is in
`audit/flow-results.json`; `node audit/flows.cjs --journeys-only` reruns the
populated checks using the saved smoke results. Set `MONGOMS_SYSTEM_BINARY` to
a local `mongod` if this environment cannot download it.

## Confirmed failures

| Priority | Flow | Observed behavior | Relevant code |
| --- | --- | --- | --- |
| Critical | Payment | `PATCH /students/me/fees/:feeId/pay` accepts `paymentMethod: card` and marks a fee paid without contacting a gateway. The parent equivalent follows the same self-confirmation pattern. | `backend/src/controllers/student.controller.js`, `parent.controller.js` |
| Critical | Session revocation | A refresh token still works after a password reset and after the account becomes suspended. Protected API calls reject suspended accounts, but refresh keeps issuing credentials. | `backend/src/controllers/auth.controller.js`, `services/token.service.js` |
| High | Parent attendance | A linked parent requesting one child's attendance receives an attendance document containing another student's record. | `backend/src/controllers/parent.controller.js` |
| High | Exams | Submitting the same correct question index twice yields a successful submission and counts the answer twice. | `backend/src/controllers/course.controller.js` |
| High | Realtime | At audit time, Socket.IO joined a room named by `handshake.auth.userId` without token validation. The subsequent reliability patch now verifies access JWTs and tests impersonation rejection. This finding came from direct code inspection, not the route smoke check. | `backend/src/realtime/socket.js` |
| High | Institution roles | A representative with no institution permissions changed a library record and read a student's health record. Membership alone grants broad institution operations access. | `backend/src/controllers/institutionOps.controller.js` |
| Medium | Learning content | Anonymous visitors can retrieve published course lessons. An unenrolled account can list assignments. A teacher's request for their own draft returned no lessons after the course's teacher was populated; the ownership comparison needs inspection. | `backend/src/controllers/course.controller.js` |
| Medium | Marketplace | `GET /marketplace/products/:id` returned a pending listing to an anonymous visitor, despite the public list filtering to active listings. | `backend/src/controllers/marketplace.controller.js` |
| Medium | Recruitment | A job with an application deadline in the past accepted a new application. | `backend/src/controllers/job.controller.js` |
| Medium | Scholarships | A donor approved a second applicant for a one-seat scholarship. | `backend/src/controllers/scholarship.controller.js` |
| Medium | Admissions | An applicant changed an accepted institution application back to submitted. | `backend/src/controllers/institutionApplication.controller.js` |
| Medium | Attendance | A teacher recorded absence for an unrelated user without specifying a course. | `backend/src/controllers/teacher.controller.js` |

The frontend has two confirmed navigation gaps from source inspection: the
shared `settings` tab intercepts Admin Settings before `AdminWorkspace` renders,
and `platform_staff` has no workspace despite backend department access. The
header search and several AI/classroom screens explicitly remain placeholders.
Paid courses return HTTP 402 at enrollment, while payment routes cover fees and
wallet top-ups; a paid-course checkout path is absent.

## Workflows that passed in this run

Registration, email verification, login, role request and approval; free course
creation, enrollment, assignment submission and grading; parent consent for
child linking; student document/goal read and write; job posting, applications,
saved jobs and applicant ownership; scholarship posting, application and one
sponsorship; institution admission, representative meetings and inquiry access;
marketplace product approval, ordering and histories; study group membership;
private messages; complaints and admin review; CMS publication; certificate
verification; newsletters, polls, magazine submissions, anonymous questions,
virtual fairs; hostel, transport, inventory, events and help desk operations;
and admin department boundaries. The pass/fail outcome for each step is in the
JSON evidence. A pass confirms only the inputs and state checked here.

## Coverage limits

The route smoke check uses nonexistent IDs and mainly verifies routing, auth
and error handling. Populated checks cover representative happy paths and
adversarial cases, not every field, browser screen or combination of 447 routes.
The 503 responses from AI generation status routes were expected because no
user AI provider was configured. Backup, live payment/AI/SMS/email, WebAuthn,
camera/face recognition, translation provider, and browser interaction flows
were not exercised end to end. Thirteen frontend URL strings were too dynamic
for static matching; these are review candidates, not confirmed missing routes.

The reliability patch was subsequently installed into the sibling backend and
passed 15 backend regression tests there. The frontend passed five session
tests and a production build. The later flow remediation addresses the other
confirmed audit failures above. The existing frontend changes in
`Dashboard.jsx`, `DashboardWidgets.jsx`, and `paddleLoader.js` predated this audit
and were preserved.
