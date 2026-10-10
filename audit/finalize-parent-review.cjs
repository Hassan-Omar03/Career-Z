const fs=require('fs'),path='audit/parent-flow-review-2026-10-10.md';const old=fs.readFileSync(path,'utf8');const baseline=old.slice(old.indexOf('## Master coverage'),old.indexOf('## Test evidence'));
const update=`# Parent flow: implementation and acceptance status

Updated: 2026-10-10. Scope: frontend D:/Career-Z and backend D:/Career-Z-backend, against the English and Urdu master requirements. Changes are local; deployment has not been performed.

## Current implementation

The original repair list has been implemented locally. The historical findings and 55-area table below describe the BEFORE state, not outstanding work. Live service acceptance is separate and remains unverified as listed below.

- Connections: parent/student invitations, recipient approval/rejection, retry, immutable lifecycle history, student guardian permissions, sponsor restrictions, unlink and current primary/secondary-school discovery. Each school verifies its own guardian relationship.
- Academics: child details, monthly attendance and PDF, safe exam schedule without papers/answers, homework status and teacher feedback, session/school-filtered marks, actual class rank, strong/weak subjects, timetable, achievements, certificates/student ID and own library loans. Actual branded report-card PDF was downloaded in the browser.
- Communication: child-derived teacher and school contacts in both directions, authorized guardian groups, attachment-only messages, blocking, configurable prohibited terms and complaint-bound selected evidence. Unrelated or revoked relationships cannot expose private conversations. Parent private messages do not generate ordinary email/push alerts.
- Consent and school operations: current-school request inbox, typed-name signature, grant/deny/history/expiry/cancellation, parent directory, school information/publications and school feedback. Teacher progress/behavior notes include course and class-timetable rosters. Parent-management and finance staff permissions are enforced separately.
- PTM: actual course/class teachers, student invitation to guardians, teacher availability, future booking, atomic overlapping-slot reservations, cancellation release, physical location or unique HTTPS video room, minutes/tasks, no-show/escalation, expiry and durable reminders.
- Finance: payer-safe fees, actual wallet balance and ledger, transactional partial payments, minimum partial policy, verified receipts, institution/platform balance conservation, idempotent retry, concurrency and original-payer refunds. No internal commission fields are returned to parents. Transactions require a MongoDB replica set.
- Cafeteria: school menus/allergens, owner-authorized staff, stock, parent wallet purchase, child pickup code, collection, cancellation/restocking and institution refund. Real temporary wallet balances were exercised through browser and integration tests.
- Classroom: institution opt-in plus guardian permission and current child enrollment; parent receives only observer media. Parent cannot become student attendance/engagement or send media/chat/poll votes. Link, permission and school withdrawal revoke observation.
- Automation: deduplicated absence, low marks, homework/results/fee notices, PTM reminders/expiry and school-configured persistent absence warning. Existing worker integration plus protected family-automation endpoint support scheduling. Warnings do not automatically suspend or withdraw a child.
- AI/privacy/admin: BYOK or explicitly authorized institution-funded AI, per-request sharing consent and institution-only prompt records; encrypted/masked parent-only bank details/private notes; parent admin statistics, AI usage and complaint evidence. Reputation disputes must reference the requesting parent's own activity at that school.

## Final verification

- Final combined integration run: **105/105 passed** (74 existing shared integration tests + 31 parent-specific tests), zero failures.
- Final completion regression file after the last permission fixes: **13/13 passed**, including two additional finance/dispute authorization tests. Total distinct tests in these runs: **107**.
- Browser: **24 checks passed**, covering real protected temporary APIs, parent/student/teacher/institution password login and logout, dashboard navigation, consent, roster, academics, 390px layout, private details, cafeteria, wallet checkout and PDF download.
- Production build passed: 1684 modules; SEO generator produced 28 public pages and sitemap. Existing FaceMesh/chunk warnings remain.
- Separate group and notification integration suites previously passed: 6 group tests and 4 notification tests. They are not counted in the 107 above.

Tests use disposable MongoMemoryServer/replica-set databases and synthetic accounts; email/AI delivery is mocked. Browser realtime provider is omitted to avoid connecting test accounts to the real local server; guardian sockets are exercised separately against an actual isolated Socket.IO server.

Evidence: parent-lifecycle.test.cjs, parent-wallet.test.cjs, parent-classroom.test.cjs, parent-completion.test.cjs and parent-browser.cjs. Browser artifact: parent-performance-mobile.png. PDF: parent-downloads/report-card.pdf.

## Production acceptance still required

These checks require configured providers/devices and have NOT been claimed complete:

1. Actual SMTP email, Twilio SMS/WhatsApp and background push on subscribed devices.
2. Actual configured AI-provider response and billing; tests verify policy and prompt privacy using a stub.
3. Real teacher/student/guardian video and audio across devices/networks, including TURN and external PTM rooms; transport GPS hardware where used.
4. External payment-gateway sandbox settlement/refund and provider webhooks; wallet flows were tested with real temporary database balances.
5. Deployment configuration, durable scheduler invocation, production replica-set transactions and translated-language/screen-reader acceptance on target devices.

Do not rerun apply/install/finish staging scripts blindly: many are one-time implementation patches. Run the regression tests for validation.

## Historical baseline (before the fixes)

The following master mapping, defects and coverage table are retained for traceability. Labels such as Missing/Partial refer to the initial audit snapshot and are superseded by the implementation and verification above.

`;
fs.writeFileSync(path,update+baseline);console.log('Parent review updated with current implementation and honest external acceptance limits.');
