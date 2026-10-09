# Student / teacher / institution audit — 2026-10-09

## Conclusion and scope

The connected core workflows are implemented and have regression coverage. **The entire master specification is not 100% complete.** This is a source/history audit plus automated verification, not a claim that every line of both repositories or every real-device/provider journey has been exhaustively tested.

Compared the master document's student requirements (Part 10), education structure (15A), classroom (15B), examinations (15C), institution operations (15D), content (15E), and the explicit Offline Mode requirement around line 28972. Read current module wiring, relevant controllers/models/services, earlier commits and pending local changes. Payments were previously paused by the user; no provider changes or charges were performed during this audit.

Current references: frontend HEAD `6d5d439`, backend HEAD `b5f5820`, plus uncommitted local authoring-permission and merged-interface fixes. The public deployment does not include those latest local fixes.

## Existing work versus recent additions

Do not attribute the original AI/class/course system to the latest work. Git history demonstrates that it already existed:

| Earlier commits | Existing implementation |
| --- | --- |
| Frontend `6effb67`, backend `060d3de` | Institution operations, AI Creative Teacher, verification/notifications and provider integration |
| Frontend `4e6a9cb`, backend `c4a1075` | QR/GPS/WebAuthn attendance and AI video pipeline |
| Frontend `c58def6`, `f8ca41b` | AI Save to Class, slide formatting and synchronized presentation/class controls |
| Frontend `841e366`, backend academic coursework implementation | Admission test authoring and student test-taking; coursework/exam workflow |
| Frontend `deba323`, backend `4e789b2` | Study Groups, discussion rooms, goals and achievements |
| Frontend `292c55c`, backend `b01d2df` | Hostel/library/help-desk/event/placement improvements and academic/health updates |

Recent additions extend the same Course/Lesson records: module/chapter hierarchy, structured practice activities, staged review, revision/archive recovery, physical/hybrid session attendance, offline packages/progress, and institution/student/teacher operations lifecycle refinements. There is no second course database. The extra Learning Center menu and duplicate lesson editor were removed locally; enhancements are embedded in existing course screens.

The user's teacher-only lesson/quiz authoring preference takes precedence over the master allowing institution course/content creation. Institution settings, review and recovery remain available. An account that is both owner and assigned teacher authors in its teacher workspace, not its institution workspace.

## Connected workflow evidence

“Present + tested” means relevant automated tests pass; it does not assert every subrequirement of a master section is complete.

| Workflow | Evidence | Assessment |
| --- | --- | --- |
| Admission application/test/interview/approval to student membership | institution application/admission controllers; admission-automation, admission-online-test, relationship-workflows tests | Present + tested; actual account browser acceptance still required |
| Institution course/class/teacher assignment | institution controller/routes, Course/ClassSection/Program records; academic-coursework tests | Present + tested |
| Teacher AI notes, quizzes, slides, narration/video, Save to Class | existing AI controller/services and Dashboard AI panels; slide-deck-resource tests | Existing; external generation requires configured providers |
| Teacher curriculum/resources to enrolled student reader | learning controller; TeacherLessonsPanel and CourseResourcesPanel in Dashboard; learning-flow tests and embedded browser checks | Present + tested; one shared course editor/reader locally |
| Institution policy and department/principal review | learning policy/review/reviewer handlers; learning-flow tests | Present + tested |
| Assignment/exam submission, teacher feedback/grades, student results | course controller; Submission/ExamSubmission/Result; academic-coursework tests | Present + tested; examination gaps below |
| Course progress, completion and certificate/transcript eligibility | courseProgress utility, certificate service; academic-transcript/learning tests | Present + tested; configurable grading gap below |
| Scheduled online classroom and physical/hybrid attendance | liveClass/liveTools controllers, Socket.IO; live-class-workflow/socket/learning tests | Local server implemented + tested; real camera/audio/screen capture acceptance remains |
| Parent views where authorized | parent controller/link permissions; guardian-consent-and-timeline and relationship tests | Existing + tested; classroom interception not granted |
| Offline course download, files/practice/drafts, completion/video queue and reconnect sync | offlineLearning, OfflineStudy, learning-sw; learning-flow and real Chrome tests | Present + tested with synthetic data; CORS/download/lease limits apply |
| Library borrowing/return/fines/QR and digital URLs | institutionOps controller, LibraryBook/BookLoan; institution-ops coverage tests | Existing + tested; library catalogue is separate from offline course packaging |
| Inventory request/approval/issue/return/damage | inventory controller, InventoryLoan/InventoryItem; inventory-lifecycle tests | Present + tested for institution and connected recipients |
| Health profile/vaccination/incidents and authorized teacher follow-up | health controller; health-lifecycle tests | Present + tested; real email delivery not established by in-app notification success |
| Events audience/RSVP and complaint assignment/history/resolution | eventsHelpdesk controller; events-helpdesk-lifecycle tests | Present + tested |
| Hostel/warden and transport/driver lifecycle | institutionOps/transportTracking; hostel-transport-lifecycle tests | Existing + tested; physical GPS/device acceptance remains |
| Institution operations AI / teacher insights / student assistance | aiOperations/AI controllers; ai-operations-lifecycle tests | Present + tested scope; provider calls require configuration |
| Placement partnership/referral/student consent/application/hiring | placement/institutionEmployer controllers; placement-lifecycle tests | Present + tested; does not implement a future AI placement predictor |
| Fees/payroll/receipts/internal wallet records | institutionFee/institution controllers; fee/payroll/payment tests | Existing code + tested; automatic external money movement/provider activation is not certified here |

## Confirmed remaining or partial requirements

1. **Class/lesson-specific moderated discussion — 15B.12, 15C.4.** Study Groups discussion, messaging and live classroom chat already exist. They do not implement a durable forum keyed to every course/lesson with a classroom moderation workflow. Evidence: studyGroup controller/UI versus Course/Lesson and learning routes.
2. **Reusable institution question bank — 15C.6.** Exam questions and AI-generated quiz text exist. No reusable institution-owned bank with the required question types and teacher selection/reuse workflow was found. Exam question schema supports MCQ/short/long, not all listed types as distinct authoring/marking workflows.
3. **Quiz/exam variation and security — 15C.8, 15C.10, 15C.22.** Timer, server deadline, enrollment/fee gates, attempt records and hidden answer keys exist. Exam start returns questions in their stored order; per-attempt randomization, dedicated question encryption and exam suspicious-activity/access telemetry were not found. Practice quizzes are untimed immediate-feedback exercises; graded exams require teacher review. Do not call the practice quiz a complete timed exam system.
4. **Institution-configurable grading — 15C.12.** Results and GPA/CGPA/transcripts exist. `certificate.service.js` uses fixed `gradeFor` / `pointsFor` functions; a per-institution grade-scale configuration and its propagation through results/transcripts were not found.
5. **Content provenance — 15E.21.** Course/lesson relationships, language, revision, timestamps and approval status/history exist. Complete per-content author/department/AI-assisted provenance and explicit last-reviewed metadata are not stored across all content types. Course teacher identity alone is not immutable lesson authorship history.
6. **Recording permission — 15B.17.** Teacher recording exists. Classroom policy supports chat, microphone, camera requirement, screen share and file sharing, but has no recording-permission field/toggle. Browser screen recording is not server-controlled recording; this does not prevent external device recording.
7. **Advanced whiteboard/AI output — 15B.4–6.** Drawing, shapes, plain text/formula labels and AI explanation text exist. Structured mathematical notation, specialized chemical/flow/mind-map/engineering tools, and automatic graphical AI board rendering are not complete. Existing separate image/animation generators must not be confused with this board integration.
8. **AI accessibility — 15E.14.** Browser voice reading, provider narration and supplied/generated video captions exist. A general uploaded audio/video transcription → subtitle → subtitle-translation workflow was not found. Course translation is a teacher-reviewed text draft, not complete batch multilingual course/media conversion.
9. **Video/resource management depth — 15E.5–7.** File URLs/uploads, lesson hierarchy, chapters, supplied quality sources/captions and watch positions exist. A dedicated playlist editor and full digital-library taxonomy/filtering across subject/grade/semester/teacher, including templates, remain incomplete. Quality URLs are not automatic transcoding.
10. **Institution customization — 15D.21.** Profile/logo/cover, general localization and platform branding exist. Per-institution theme, website-page builder, routed school subdomain, language/time-zone/working-day/uniform configuration are not a complete customization center.
11. **Communication membership coverage — 15D.15 / 15A.8.** `notification.controller.js::broadcast` derives students from `StudentProfile.primaryInstitution`; secondary active institution members and their parents can be missed. Other modules already use active memberships; this legacy broadcast does not consistently do so.
12. **Communication delivery/access details.** Broadcast permits any institution staff member, without checking a dedicated communication permission. It calls `notifyMany` without the email option, so its comment saying “in-app + email always” is inaccurate. SMTP-backed notices elsewhere and real BYOK Twilio SMS/WhatsApp already exist. Socket events are in-app live delivery, not registered background mobile/browser push subscriptions.
13. **Advanced presentation class versus scheduled classroom.** Legacy `class:start`/`class:end` is an ephemeral presentation session. On end it persists engagement, not the scheduled LiveClassSession attendance workflow. Native `live-video` scheduled classes use the durable attendance route. These are not yet one session lifecycle, so starting an advanced presentation must not be represented as automatically completing scheduled classroom attendance.
14. **Full recovery/storage protection — 15E.12, 15E.16.** Version rollback and content snapshots/export/restore exist. Stored external URLs do not back up or recover deleted provider files. Restore merges content and retains newer items rather than recreating an exact deleted-state snapshot. Watermarking is optional and not enabled; DRM enforcement is not established.

Additional hardware-dependent gaps: RFID attendance in 15D.9 is not implemented (manual, QR, GPS, browser face verification and WebAuthn already exist). Native classroom video/chat on current Vercel production still needs persistent Socket.IO hosting; local server responds correctly. Cross-network TURN, actual camera/audio, AI/media storage/SMTP/Twilio/provider accounts require separate operational acceptance. Do not equate “environment variable supported” with an activated service.

The master explicitly marks AR/VR, SCORM/xAPI/H5P, digital twin/metaverse and the optional digital-content store as future/optional. They are not included as secretly completed features or as mandatory current regressions.

## Verification performed

- Complete current backend suite: **214 tests, 214 pass, 0 fail**, after the local permission changes. Output: `audit/end-to-end-backend-tests-2026-10-09.txt`.
- Current frontend build and 5 API/session tests passed.
- Isolated real Chrome acceptance checks passed: downloaded IndexedDB files, account isolation, offline reload, progress sync, retained drafts, coding worker timeout, logout purge, student/teacher/institution UI, embedded selected-course screens, one teacher Save lesson action and no duplicate course selector. Synthetic API responses were used; this is not real-account full-system browser E2E.
- Local authenticated read confirmed institution workspace `canAuthor=false` and teacher workspace `canAuthor=true`, including the owner/teacher shared account. The requested test quiz is absent; no other content was deleted.
- Historical audit files contain “local / not deployed” notes from their original dates. `6d5d439`/`b5f5820` subsequently deployed those earlier changes. Only the latest consolidation and teacher-authoring fixes remain local.

No new integration was implemented and no additional real institution data, payment, email or SMS was changed during this audit. The report is an evidence-backed backlog, not a blanket certification that the entire master is complete.
