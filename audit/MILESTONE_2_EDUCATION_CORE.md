# CareerZ Milestone 2 — Education Core Implementation Report

> **Naming note:** This is Milestone 2 in the Master Project Document's Phase C2 roadmap. In `CareerZ_Final_Scope_of_Work (1).pdf`, Education Core is part of commercial Milestone 1, while commercial Milestone 2 covers Career, Marketplace, Finance, Communication and AI. See `audit/MILESTONE_2_FINAL_SCOPE_COVERAGE.md` for the contract milestone.

**Report date:** 24 September 2026  
**Master specification:** `CareerZ_Master_Project_Document.md.txt`, Phase C2, Milestone 2  
**Milestone scope:** Institutions, Students, Teachers, Courses, Classes, Exams, Certificates  
**Expected deliverable:** Complete LMS

## 1. Executive status

Milestone 2 now contains a working education lifecycle from institution setup and admission through course assignment, timetable, attendance, assessments, learning content, results and certificates. The recent work also connected the academic lifecycle to institution-defined program fees, because a paid institution course cannot be treated as an independently free public course.

The implementation is functionally broad, but it should not yet be labelled 100% production-complete. Core logic and builds have been tested. Live Paddle checkout, real browser/device camera behavior, WebAuthn, SMTP and provider-backed AI still require staging checks with real credentials and devices. Native in-app WebRTC classrooms, live whiteboards, breakout rooms and class recordings are outside the implemented LMS flow.

## 2. Institution foundation

### Implemented

- Institution registration, profile, verification documents and Super Admin verification.
- Institution owner and staff roles with permission-aware access.
- Campuses and campus buildings.
- Class sections with academic year and assigned class teacher.
- Teacher and student directories scoped to the institution.
- Parent directory, parent-child verification and institution feedback.
- Staff attendance, payroll, reports, inventory, library, hostel, transport, events, help desk and other institution operations.
- Institution AI key connection and staff AI permissions.
- Institution subscription and plan enforcement.
- Institution-to-employer partnerships and placement-office flows.
- Institution communication credentials and notifications.

### Academic program and fee-plan setup

An `InstitutionProgram` model and API were added. An institution defines each program before accepting applicants:

- Program name.
- Department.
- Assigned class/section.
- Duration in terms.
- Admission fee.
- Complete tuition fee.
- Number of installments.
- Currency.
- Exam fee: Yes/No and institution-entered amount.
- Hostel fee: Yes/No and institution-entered amount.
- Transport fee: Yes/No and institution-entered amount.
- Library fee: Yes/No and institution-entered amount.
- Activity fee: Yes/No and institution-entered amount.

The platform does not invent any amount. It only validates, displays and processes amounts entered by the institution.

### Important behavior

- Total tuition must be greater than zero for a paid institution program.
- Only active published programs are returned to applicants.
- Existing accepted students can be assigned to a newly configured matching program and section.
- Matching section courses are assigned automatically.
- Standard fee invoices are generated from program rules instead of requiring staff to enter every student ID and fee manually.
- The Fee Management screen is now intended for invoice/payment operations: confirmation, reminders, receipts, escrow and refunds.

## 3. Student lifecycle

### Account and profile

- Registration, email verification, login, refresh-token handling and role approval.
- Student profile, digital student ID and public ID verification.
- Documents/digital locker, goals, achievements, badges, portfolio, CV and learning analytics.
- Multiple simultaneous institution memberships and institution history.
- Student-parent connection, consent, permissions and unlink/revoke flow.

### Program discovery and application

- Student searches and selects an institution.
- The application form loads real active programs from that institution.
- Free-text program entry was replaced with a published-program selector.
- Before submitting, the student sees:
  - Program and department.
  - Duration/terms.
  - Assigned class/section.
  - Admission fee.
  - Complete tuition.
  - Installment count and approximate installment value.
  - Every enabled additional charge.
  - Total program charges.
- The backend rejects applications for programs not published by the institution.
- Duplicate active applications for the same institution/program are blocked.
- Email verification is required before submission.

### Fee agreement snapshot

The selected program's fee plan is copied into the application at submission time. This preserves the fee shown to that applicant. A later institution price change does not silently alter an older application's agreed fee.

The snapshot includes department, duration, admission fee, tuition, installments, currency and enabled additional charges.

### Admission pipeline

- Online and front-desk/offline applications.
- Submitted, under-review, documents-required, waitlisted, accepted and rejected states.
- Missing-document tracking.
- Representative assignment and notes.
- Reusable online admission-test builder.
- Test scheduling, duration, questions, marks and passing percentage.
- Student test-taking UI with server-side answer protection and automatic grading.
- Duplicate MCQ indexes rejected to prevent score inflation.
- Manual/external test scheduling and score entry.
- Interview scheduling with date/time, mode, meeting link/location and recommendation.
- Interview completion gate.
- Acceptance requires the assigned test to be passed and interview to be complete.
- Accepted/rejected applications cannot be reset by the applicant.
- Acceptance generates an admission letter and student ID.

### Acceptance and automatic enrollment

When the institution accepts an applicant:

1. The matching program fee plan is required.
2. The student membership is recorded without destroying other institution memberships.
3. The student is assigned to the program's class/section.
4. Published courses linked to that section are enrolled automatically.
5. Admission, tuition-installment and enabled additional-fee invoices are created from the stored application snapshot.
6. The student receives an admission notification.

## 4. Teacher lifecycle

### Implemented

- Teacher profile, subjects, qualifications, experience, bio and visibility.
- Super Admin role verification before protected teaching actions.
- Institution teacher directory and job-offer workflow.
- Offer acceptance/decline, employment creation, resignation and termination history.
- Independent-teacher mode and consent-based independent enrollment.
- Guardian approval for minors in independent tuition.
- Teacher rating and reputation.
- Teacher timetable and assigned class sections.
- Teacher course ownership checks.
- Lesson, assignment, exam and result management.
- Student directory for owned courses.
- Teacher self-attendance.
- Student attendance through manual, QR, GPS and face workflows.

## 5. Course and learning-content system

### Course management

- Course creation and editing.
- Teacher ownership enforcement.
- Institution and class-section linkage.
- Subject, description, language, level, price, currency and publication state.
- Independent public courses may be free or paid.
- Institution courses are assigned through admission/program enrollment and cannot be self-enrolled as free public courses.
- Paid independent-course checkout exists through Stripe/Paddle settlement logic.
- Course purchase and enrollment completion are idempotent.

### Lessons and resources

- Lessons with title, content, order, video URL and downloadable resources.
- Student lesson completion and course-progress calculation.
- Completed-course state.
- Published lesson content is protected from anonymous or unenrolled access.
- Assignment lists are restricted to enrolled learners and authorized teachers.
- Course resources are denied while a blocking institution fee is due.

### AI-assisted education already connected

- AI lesson planning/content routes.
- AI quiz/exam assistance.
- AI Creative Teacher provider integrations.
- AI Video Lesson Creator with generated scenes, narration, captions, browser MP4 assembly, upload and course-lesson save.
- AI insights and learning analytics.

Provider-backed generation still needs real-key staging verification.

## 6. Classes and timetable

### Corrected academic linkage

The original timetable accepted a free-text subject and could exist without an enrolled student, linked course or valid class structure. The current flow links every new timetable slot to:

- Institution.
- Class/section.
- Published course.
- Assigned teacher.
- Day and start/end time.
- Room and optional external meeting URL.

The backend validates that the selected course belongs to the institution, section and teacher.

### Student timetable

- Student timetable is derived from active course enrollments and assigned class section.
- It displays the course/subject, teacher, section, next date, day, time, room and live/upcoming state.
- A live class can be opened through the configured meeting link.
- Institution and teacher timetable views use the same linked record.

### Existing GCUF data repair

The test data was repaired as follows:

- Student: Mohammad Omar (`baitcvs@gmail.com`).
- Institution: GCUF.
- Teacher: Hassan (`hassanomar3345@gmail.com`).
- Program: BS Computer Science.
- Section: BS Computer Science — Semester 1 — A.
- Academic year: 2026–2030.
- Course: Introduction to Computing Application.
- Timetable: Monday, 8:00–9:00 AM, Room 2.
- The unrelated Math/Class 9-A slot was removed from this student flow.
- The institution course is no longer marked free.

## 7. Attendance system

### Supported methods

- Teacher manual attendance.
- Short-lived teacher QR session.
- Student camera scans the teacher's displayed session QR.
- Optional course-location GPS check-in with radius validation.
- Student face enrollment and browser-computed descriptor.
- Teacher in-person face matching and attendance.
- Remote student face request requiring teacher approval.
- WebAuthn/passkey biometric verification UI.
- Attendance history for student, teacher, institution and authorized parent.

### Security and integrity

- QR sessions use expiring random tokens/codes.
- The student must be enrolled in the session course.
- Duplicate check-in is handled safely.
- GPS checks course configuration and distance.
- Face records require course enrollment and teacher ownership.
- Parent attendance reads expose only the linked child's record.
- Teachers cannot record unrelated users or duplicate students.
- Attendance records retain method and check-in time.

### Fee-access enforcement

If an institution fee is due today/past due and remains pending or processing:

- Live class joining is locked.
- Course lessons/resources are locked.
- Student QR attendance is rejected.
- Student GPS attendance is rejected.
- Remote face check-in is rejected.
- Teacher face attendance cannot mark the student present.
- Teacher bulk/manual attendance cannot mark the student present, although absence can still be recorded.

Future installments do not block access before their due date. Manual payment remains `processing` until institution confirmation; access unlocks only after verified `paid` status.

## 8. Assignments, tests and examinations

### Course assessments

- Teachers create assignments with title, description, deadline, marks and attachments.
- Enrolled students submit work.
- Teachers grade submissions and issue results.
- Course ownership and enrollment are enforced.

### Examinations

- Exam creation and publication.
- MCQ questions and correct-answer handling.
- Student online exam submission.
- Automatic scoring.
- Duplicate-question-index protection.
- Results and academic history.
- Admission tests use a separate reusable test workflow.

### Current limits

- A fully configurable institution grading-policy builder is not yet complete.
- Practical/viva/offline examination workflows exist only to the extent represented by current exam/result/manual-mark interfaces; they are not a complete dedicated module for every assessment type in the master architecture.
- Remote proctoring/AI cheating detection remains deferred.

## 9. Certificates

### Implemented

- Institution certificate issue/list flow.
- Student certificate listing.
- Unique verification code.
- Public certificate verification.
- Course completion certificate support.
- Certificate ownership and institution relationship.

### Remaining depth

- Dedicated diploma/degree-record templates and transcript generation require a later pass.
- Revocation/version history and external signing authority integration need production design.

## 10. Fees and payment integration supporting education

Finance is formally Milestone 3, but these pieces were required to make Milestone 2's paid education flow honest:

- Institution enters every fee amount; the platform never chooses pricing.
- Program-level fee disclosure before application.
- Fee-plan snapshot at application.
- Automatic invoice generation on acceptance.
- Installment rounding keeps the sum equal to total tuition.
- Student/parent fee views.
- Paddle and Stripe fee checkout endpoints.
- Signed webhook verification and idempotent settlement.
- Manual bank/cash/mobile-wallet reports remain processing until institution confirmation.
- Receipt, refund, escrow and reminder states.
- Class access linked to due-fee state.
- One explicitly requested test invoice was created for Mohammad Omar: `TEST BSCS Tuition Fee - Payment Verification`, PKR 100, pending, due 23 September 2026.

### Payment environment status

- Paddle configuration is detected in the environment.
- Stripe is not configured.
- Real Paddle checkout still needs to be completed by the user in the browser to verify the live provider, callback/webhook and final unlock behavior.

## 11. Reliability and security completed during this milestone

- Wallet transfers and withdrawals use MongoDB transactions.
- Balance changes and ledger entries commit or roll back together.
- Concurrent transfer/withdrawal overspending is prevented.
- Payment webhooks verify signatures and handle duplicate/concurrent delivery idempotently.
- Failed settlement rolls back its processing receipt and remains retryable.
- Socket.IO authenticates access JWTs and rejects room impersonation and suspended users.
- Frontend concurrent expired-token requests share one refresh attempt.
- Logout/account switch cannot be undone by a late refresh response.
- Password reset and account suspension invalidate refresh-token use.
- Institution operations enforce granular permissions.
- Marketplace draft visibility, expired job application, scholarship seat limits and admission reset gaps were remediated.
- No duplicate MCQ score inflation.
- Content, assignment and parent-attendance data leaks were remediated.

## 12. Frontend workspaces covered

### Student

- Dashboard, profile, institutions, applications, classes, courses, assignments/tests, attendance, analytics, certificates, locker, digital ID, parent connections, scholarships, wallet/fees and related career modules.

### Teacher

- Profile, timetable, classes, student list, attendance, assignments, examinations, course/lesson management, AI teaching features, employment and reputation.

### Institution

- Institution profile, admissions, program/fee plans, staff, teachers, students, parents, classes/timetable, attendance, fees, payroll, operations, communication and reports.

### Parent

- Child linking, permissions, attendance/results/fees visibility, fee payment, meetings, alerts, reputation and AI assistant.

### Admin/Super Admin

- Role/institution verification, operations controls, audit/security/finance views, AI providers and platform oversight relevant to education.

## 13. Verification evidence

The following checks have passed during the work represented in this report:

- Frontend production builds completed successfully after the latest education/fee changes.
- Frontend authentication/session regression tests: 5/5 passed.
- Changed backend controllers, models, routes and fee-access utility loaded successfully without syntax/module errors.
- Earlier complete backend reliability suite: 15/15 passed.
- Payment/course-checkout suite: 18/18 passed at the relevant implementation point.
- A later broad backend run passed 26/31 tests; the other five did not execute because the local MongoDB test process refused to create indexes with less than its required 500 MB disk space. The reported failures were infrastructure errors, not assertion failures.
- The audit runner previously exercised 3,068 route/role requests with no unexpected HTTP 500 responses and reported 161/161 populated flow checks after remediation.
- Live Atlas read-back verified the repaired GCUF student, teacher, section, course, enrollment and timetable linkage.

## 14. What is still required before calling Milestone 2 complete

### Required product work

1. **Optional-service choice:** Hostel and transport are currently program Yes/No rules. A mature flow should let the institution publish availability/pricing and the student choose required/not-required during application, followed by institution approval where capacity matters.
2. **Fee-plan editing/versioning:** Programs need edit, effective-date, archive and applicant-impact controls.
3. **Academic hierarchy depth:** Faculty, batch and semester entities need first-class management instead of relying mainly on program/section text and relationships.
4. **Grading policies:** Institutions need configurable grade scales, GPA/CGPA rules and transcript generation.
5. **Assessment breadth:** Dedicated practical, viva, midterm/final and offline marks workflows need consistent interfaces and rules.
6. **Certificate depth:** Degree/diploma templates, transcript attachment, revocation and version history.
7. **Native live classroom:** Current classes launch an external Zoom/Meet/Teams/Jitsi link. Native WebRTC, TURN, whiteboard, screen sharing, recording, polls, hand raise and breakout rooms are not implemented.
8. **Dashboard modularization:** The large `Dashboard.jsx` should be split into role/workspace modules to reduce maintenance and regression risk.

### Required staging verification

1. Complete the PKR 100 Paddle test payment and confirm webhook/sync changes the fee to paid.
2. Verify that the paid state removes the class/resource/attendance lock.
3. Verify manual payment stays processing until institution confirmation.
4. Test camera face attendance on real devices over HTTPS.
5. Test QR scanning using separate teacher and student devices.
6. Test GPS permissions and radius behavior on a real mobile device.
7. Test WebAuthn/passkeys on supported hardware and HTTPS.
8. Test email notifications through configured SMTP.
9. Test AI lesson/video providers with real credentials.

## 15. Recommended next implementation order

1. Complete live Paddle payment and class-unlock verification.
2. Add student opt-in/approval rules for hostel and transport.
3. Add program fee-plan edit/version/archive support.
4. Add academic hierarchy and grading-policy management.
5. Add transcript and certificate lifecycle.
6. Run two-device attendance staging tests.
7. Split the dashboard into role-specific modules.
8. Decide whether native video classroom belongs in Milestone 2 or a later communication milestone.

## 16. Completion assessment

The seven headline Milestone 2 domains are implemented at a usable application level. The central student journey now exists:

**Institution publishes program and fees → student sees price and applies → test → interview → acceptance → section/course assignment → invoices → payment gate → timetable/class → attendance → lessons/assignments/exams → results/certificate.**

This is a strong Education Core and a substantially working LMS. It remains **feature-complete for the currently implemented web workflow, but not production-complete against every advanced item in the master Education Architecture** until the product and staging items in section 14 are finished.
