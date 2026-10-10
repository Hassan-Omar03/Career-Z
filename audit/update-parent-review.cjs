const fs=require('fs'),p='audit/parent-flow-review-2026-10-10.md';let old=fs.readFileSync(p,'utf8');
old=old.replace('## Current relationship flow','## Original relationship flow at audit time').replace('## Requirement-by-requirement coverage','## Original requirement-by-requirement coverage (before implementation)').replace('Functional fixes have not been applied in this audit.','This paragraph and the original findings below describe the pre-fix snapshot; the implementation update above supersedes them.');
const update=`## Implementation update — 2026-10-10

The local frontend and sibling backend have now been modified. This is **not yet a declaration that all 55 master coverage areas are complete**. Original findings below are retained as the repair baseline.

### Applied and verified

- Parent and student can initiate family invitations; only the invited account approves. Both parties see pending/approved/rejected requests. Student permission toggles accept only booleans. Sponsors cannot gain health/consent rights. Unlink immediately removes protected academic access.
- Child-derived teacher and institution messaging is authorized in both directions. Dropped course enrollment removes teacher eligibility. Secondary active institution membership is resolved consistently for child discovery, institution parent directory, feedback and verification. Guardian verification is stored separately for each school.
- Exam schedule uses an explicit safe projection, excluding questions and answer keys. Parent fee responses, manual-payment responses, refund requests and Paddle sync responses remove internal commission/settlement fields.
- Parent academic views include month attendance totals and PDF, half-day status, result/report-card PDF, subject strength/support indicators, school/teacher timetable, achievement portfolio, child library loans and student-ID/certificate verification links. School information has a school selector across linked children. Homework now displays descriptions, actual status and teacher feedback.
- Institution-generated consent requests support parent inbox, typed-name signature, grant/deny/update, response history, expiry, cancellation, school response viewing and revoked-membership checks. Institution selects an actual student from its roster. Teachers can send scoped progress/behavior/discipline/emergency/achievement notes; parents see the notes in performance overview.
- Guardian operations have an owner-granted \`parents:manage\` staff permission in the existing staff permissions editor. Institution directory/verification and new consent operations enforce it.
- Parent wallet displays genuine own balances and ledger. Wallet fee payment now atomically debits the payer, credits institution net funds, records commission in a platform balance, updates verified fee payment history and creates a receipt. Supports partial payment, institution minimum partial-payment policy, idempotent retries, insufficient funds/permission checks and concurrent overpayment protection. Wallet refund reverses payer/institution/commission balances atomically and cannot replay. This was tested only in disposable replica-set databases; no real charge was made.
- PTM teacher resolution includes course teachers/independent tutors. Video confirmation creates a random HTTPS Jitsi room if a link is not supplied; physical confirmation requires location. Future-date checks, near-time conflict query, exact-time database uniqueness, cancellation slot release, relationship revalidation for ongoing actions and strict task completion are implemented. Exact-time concurrency is database-protected; overlapping different start times still need a dedicated concurrent reservation design.
- Durable recipient-keyed alerts send repeated-absence (three days within seven), recent low marks (below 50%) and confirmed PTM reminders (within 24 hours). Repeated scheduler runs deduplicate. Integrated into existing fee automation worker. Serverless deployment still requires a scheduled invocation; no live scheduler delivery was claimed.
- Shared group chat already existed (the original audit called it missing incorrectly). Institution-created groups containing eligible guardians are now school-scoped, and group reads/writes/socket admission/delivery revalidate current guardian membership. Unlink removes access. Existing Twilio SMS/WhatsApp integration also already existed; its actual parent delivery still needs configuration and acceptance verification.
- Published school newsletters/magazine now require a real current school relationship; a parent cannot query another school's material by passing an ID.

### Evidence

- Existing selected integration suite: **74/74 passed** after the initial parent fixes. A final rerun after subsequent wallet/group/privacy changes is still required.
- \`node --test audit/parent-lifecycle.test.cjs\`: **13/13 passed**, including real JWT/account-gate HTTP requests from parent, student, teacher and institution owner through invitation → approval → school request → parent signature → teacher note → parent view → unlink.
- \`node --test audit/parent-wallet.test.cjs\`: **4/4 passed**, including genuine temporary wallet balance conservation, concurrent payment protection, idempotency, revoked permission and refund balance reversal.
- \`node audit/parent-browser.cjs\`: **7 browser checks passed** against real protected temporary APIs: parent approval click, student guardian controls, institution roster/request view, teacher roster, attendance/results/notes rendering, 390px mobile layout without overflow, parent consent inbox. This exercises actual React panels; it is not a complete onboarding/logout/login walkthrough of the entire dashboard.
- \`npm run build\` passed. Existing FaceMesh dependency/chunk-size warnings remain unrelated to this task.
- Screenshot: \`audit/parent-performance-mobile.png\`.

### Still outstanding — continue implementation/acceptance

1. Institution-authorized **read-only live classroom observation**: enforce in HTTP, sockets, media controls and revocation, without adding the parent to student attendance/engagement.
2. Parent cafeteria purchasing: school menu, stock/order/payment/fulfilment/refund lifecycle. No usable cafeteria module was located; inventory is institutional equipment, not food stock.
3. Actual class rank/session/school filters; certificate/achievement PDF downloads and full child details in My Children.
4. Complete PTM overlapping-time concurrent reservations, student-triggered PTM invitation/reminder action, no-response expiry policy and actual video-call acceptance.
5. Attachment-only chat, guardian parent-to-parent contact discovery through authorized groups, complaint-bound evidence/moderation/private-chat notification policy.
6. Homework publish alerts to guardians; persistent dropout warning rules; full institution emergency/email/push/SMS/WhatsApp acceptance using configured providers.
7. Optional institution-funded parent AI permission/configuration and explicit data-sharing consent; external AI request acceptance.
8. Parent-only private notes/bank-detail journey and immutable invitation/unlink audit; consolidated super-admin parent statistics/support view.
9. Complete four-account dashboard/onboarding/logout/login walkthrough, multiple children/two guardians/different schools/sponsor/restricted guardian/transfers, accessibility and language checks, and actual configured provider sandbox deliveries.

`;
old=old.replace('## Master coverage',update+'## Master coverage');fs.writeFileSync(p,old);console.log('Parent audit updated with verified implementation and outstanding requirements.');
