# Student, parent, teacher and institution: connected flow review

Reviewed 12 October 2026. Sources: CareerZ_Master_Project_Document.md.txt Parts 8–11, education sections 15A–15E, current frontend/backend implementations, previous audits and fresh isolated regression runs. This is a focused software workflow review, not certification of every master requirement or a production acceptance test. No application code, live records, provider accounts or deployment changed in this review.

## Outcome

All six role pairs have implemented connections. That is **6/6 connection pairs present**, not six fully accepted modules and not 100% master completion. The core academic/family chain works in covered automated scenarios. Missing master depth, outstanding acceptance and a failing legacy health suite prevent full acceptance. No percentage is assigned: no complete weighted master checklist has been executed, so a precise percentage would be invented.

## Six connections

| Connection | Implemented path and fresh evidence | Current assessment |
|---|---|---|
| Student ↔ institution | Application, admission test, approval, membership, class/course enrollment and fee-plan generation; simultaneous school membership, transfer and withdrawal access boundaries | Core implemented and covered; full multi-campus graduation/retention browser acceptance remains |
| Teacher ↔ institution | Employment offer/acceptance/resignation, staff linkage, assigned course/class, publishing review, institution grading, earnings/payroll calculation | Core implemented and covered; full staff capability matrix and actual payroll settlement remain unaccepted |
| Teacher ↔ student | Published lessons/resources, assignments/submissions/feedback, exams/question bank/shuffle/integrity events, marks, GPA/transcripts, messaging and live classroom | Core implemented and covered; advanced board/AI/media depth and comprehensive browser acceptance remain |
| Student ↔ parent | Mandatory guardian contact in student profile, invitation/approval, multiple children and guardians, individual permissions, school proof and unlink | Implemented and covered, including unrelated-account refusal and immediate access loss |
| Institution ↔ parent | Guardian contact from student record, authorized invitation, both-party approval, document review/admission match, school-specific verification, consents, fees, notices, groups and helpdesk | Implemented and covered; health regression reconciliation and production delivery/automation acceptance remain |
| Teacher ↔ parent | Actual student teaching context/guardian recipient, automatic all-child updates, teacher/subject identification, acknowledgment/reply/action/follow-up/resolution history, private PTM | Implemented and covered. PTM uses CareerZ video/signaling; child-update cards stay acknowledgment/chat only. Actual media acceptance is outstanding |

## Working connected journey

1. Student saves guardian name/email/relationship with profile. This contact identifies an invite recipient; it does not grant parent access.
2. Institution accepts admission, establishes membership, assigns class and enrollment and generates the configured fee plan.
3. Institution can invite the parent using the saved contact. Account approvals establish the link; guardian documents and admission-record review establish school-specific verification for private school records.
4. Assigned teacher teaches/publishes work; enrolled student submits; teacher grades/replies. Student gets own records and the eligible parent gets the child's permitted records and updates.
5. Parent sees incoming updates across linked children automatically. Each update carries child, reporting teacher, subject and school. Parent acknowledges/replies/actions; teacher follows up and resolves/reopens with history.
6. Teacher schedules one PTM with exact child/course/class, verified parent and full date/time. Calendar overlap is blocked. Parent and teacher join the same private CareerZ room. Outsiders/cancelled meetings are rejected. This is separate from complaint replies.
7. School sends a consent request; parent signs grants/denials/withdrawal; school sees the recorded response. Fee wallet payments/refunds preserve payer balances and receipts.
8. Withdrawal, dropped enrollment or unlink revokes applicable ongoing access. Multi-school/multi-child tests cover important isolation boundaries.

## Confirmed gaps or partial implementation

1. **Student Wallet navigation is still fees-only.** Dashboard.jsx routes student `wallet` to StudentFeesPanel, which loads `/students/me/fees`. Global wallet and parent wallet exist, but this tab does not itself fulfill master 10.16's combined balance/ledger/scholarships/rewards/credits journey.
2. **Learning analytics do not fulfill AI recommendations.** student.controller.js getMyLearningAnalytics computes real marks/attendance and explicitly makes no AI call. Master 10.12 and 15B.15/15C.21 ask for topic support/readiness/recommendations. A generic Career Coach or study assistant does not prove this structured workflow.
3. **Advanced board/content depth remains partial.** Existing stroke/shape/text tools and AI explanation are not evidence of the full mathematical/chemical/engineering/mind-map and automatic graphical teaching workflow. Automated transcription/captions/translation completion is not established.
4. **Recording retention and scheduling settings are not complete enforcement.** recordingRetentionDays and school timezone settings exist. This check did not locate a retention cleanup consumer or establish timezone/working-hours enforcement across all scheduling paths. The historical recording-before-approval defect is already fixed: current startRecording requests server approval before screen capture, so it must not be repeated as an open defect.

## Failing regression needing reconciliation

Fresh health-lifecycle.test.js: **1 passed, 5 failed**. The test fixtures create approved parent links without the current approved school document verification. Current health access calls requireSchoolVerification and incident notifications filter verifiedInstitutions. Consequently expected notifications do not occur and expected validation/history reads return 403.

This demonstrates outdated test prerequisites against the new guardian security policy, not proof that unverified parents should receive private health records. Do not weaken the gate to make these tests pass. Add verified-school fixtures, retain explicit unverified-denial cases, and rerun the whole health incident/access/notification lifecycle before accepting this area. Product health behavior with those updated fixtures was not executed in this review.

## Remaining acceptance work, not automatically missing code

- Full master CV variants/autofill, career roadmap/premium gates, internship certificate and scholarship eligibility/disbursement journeys. Resume persistence/public portfolio and generic career advice exist; these do not certify every listed subrequirement.
- Independent privacy choices for profile/portfolio/CV/certificates; complete locker lifecycle and lifetime records through transfer/withdrawal/graduation in browsers.
- Every staff permission across legacy modules, teacher qualification/reputation/performance semantics, and all independent tutoring/employment journeys.
- Real AI generation/translation, email/SMS/WhatsApp/push delivery, payment checkout/webhook/refund and payroll settlement.
- Production frontend/backend parity, realtime hosting, storage, school public-site DNS/TLS and scheduled job operation. The old audit's blanket 'no scheduler exists' is stale: server.js starts feeAutomation.service, whose 15-minute worker calls family automation. Correct persistent deployment/configuration still needs acceptance; serverless hosting does not establish a running worker.
- Full signed-in browser acceptance of the combined four-role journey, including errors, retry, refresh persistence and narrow permissions. Automated tests and earlier targeted browser checks are evidence, not total browser acceptance.

## Fresh verification

Two isolated runs: **155 tests total, 150 passed, 5 failed**, no skipped tests. Test totals are not a completion percentage.

- Parent/family suites: **57/57 passed** — parent-lifecycle, parent-completion, parent-multi-account, parent-wallet, parent-classroom. Includes real authenticated Socket.IO PTM signaling/chat, outsider/cancelled access refusal, document/private-record gates, approval/consent, two schools/two children, transfer/unlink, payment concurrency/refund and observation restrictions.
- Shared education/operations: **93/98 passed** — academic-coursework, academic-transcript, relationship-workflows, admission-automation, admission-online-test, institution-fee-management, messaging-and-payroll-extras, health-lifecycle, events-helpdesk-lifecycle, learning-flow, question-bank-exam-controls, grading-policy, institution-settings-recording. All five failures are in health-lifecycle, described above.
- Runs use synthetic accounts and disposable databases with external email/push disabled. They do not certify real provider delivery or production behavior.

## Recommended order

1. Reconcile health verification fixtures and complete that regression.
2. Finish the student wallet page integration.
3. Define and implement the missing structured AI analytics/recommendations, then accept real-provider behavior.
4. Close recording retention and global scheduling settings enforcement.
5. Complete the master-level CV/career/privacy/advanced learning acceptance checklist.
6. Deploy the matching code with workers/storage/realtime configured and accept the four-role journey and external integrations.

Existing historical audits remain historical; use this review and the 12 October parent follow-up notes for the current scope rather than treating old 'missing' rows as current defects.
