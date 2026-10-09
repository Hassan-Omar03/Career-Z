# Latest local implementation coverage — 2026-10-09

Read-only review of frontend and backend working trees against the earlier student/teacher/institution gap list. Hardware devices excluded. These additions are uncommitted local changes; this review does not establish live deployment or full real-account acceptance.

## Added and connected

- Course/lesson forums: student questions, replies, likes, accepted answers; teacher/institution moderation, pin/lock/hide and enrollment checks. Embedded in existing teacher/student course screens.
- Shared institution question bank and exam picker: reusable questions, institution scope, copied exam questions.
- Exam question/option shuffling, random subsets, per-attempt answer mapping and total marks; browser integrity events and teacher flags. These are detection signals, not a guarantee against cheating or an encrypted exam store.
- Institution grading policy: configurable bands/pass threshold/GPA scale, default grade calculation and transcript/certificate integration. Existing records are not automatically regraded.
- Lesson provenance: author, department, AI-assisted disclosure and reviewer/date fields; editable teacher metadata and review UI. This is metadata, not a complete immutable provenance ledger.
- Resource Library and playlists: teacher/student navigation, subject/grade/semester/teacher filters, private and shared playlists, server-side owner checks.
- Institution settings/public pages: branding, pages, subdomain lookup and hostname routing, timezone/working days/hours, recording policy. Real subdomain operation still needs DNS/hosting configuration.
- Notifications: explicit staff communication permission, secondary active student memberships, optional email broadcast, browser push subscription/service worker delivery. Web Push needs configured VAPID keys and browser permission.
- Recording policy and participant consent records/UI; backend rejects disabled recording state/publishing.

## Remaining or partial

- Recording starts browser MediaRecorder before backend policy approval in LiveLearningTools.startRecording; refusal does not reliably stop local capture. Consent refusal displays advice to switch camera/mic off rather than enforcing exclusion. Retention setting has no cleanup consumer found.
- Advanced mathematical/graphical AI whiteboard remains basic stroke/shape/text drawing and AI text explanation.
- Automated transcription → captions → translation pipeline not added by these changes.
- Exam encryption/strong integrity and immutable content provenance are not established by these additions.
- Timezone/working days/school hours currently stored/displayed; no scheduling enforcement consumer found. Full master-file institution customization remains partial.
- Legacy class:start/end lifecycle versus durable scheduled live-session attendance remains separate; realtime server files unchanged in this batch.
- Actual linked resource binaries are not included in course recovery backups by this batch; backup service unchanged.
- Native Socket.IO classroom production hosting remains outstanding on the Vercel backend; local browser/media acceptance still needed.
- ResourceLibrary PlaylistView ownership expression compares an owner ID to itself, and getPlaylist does not return a mine flag. Shared viewers may see editing buttons that the backend rejects. Resource search also needs reconciliation with the existing fee/material access checks before calling the complete resource flow verified.

## Validation

- Frontend production build passed (existing bundle warnings).
- Frontend API tests: 5/5 passed.
- Real Chrome fixture passed IndexedDB files, account isolation, progress sync, offline reload/drafts, role-specific learning UI, coding timeout and logout purge. This is fixture coverage, not every new dashboard screen tested with real accounts.
- Full backend suite: 241/241 passed; output in claude-coverage-backend-tests-2026-10-09.txt.

No application code, deployments or user records changed during this review.
