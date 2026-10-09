# Study flow implementation and verification — 2026-10-09

Scope: the current study flows in the master document, especially 15B.2–17, 15E.2–16 and offline learning. This report distinguishes implemented application behavior from optional external services and items explicitly described as future expansion.

## Connected flows

| Flow | Institution | Teacher | Student |
| --- | --- | --- | --- |
| Course/class setup | Existing admission, membership, sections, subject/teacher assignment and enrollment; selects study mode and publishing policy | Works on assigned courses; edits metadata and curriculum | Sees enrolled courses, not another institution's private content |
| Curriculum | Reviews course and lesson content when staged publishing is enabled | Module → chapter → lesson → practice activity; links actual course assignments/exams | Reads published content, plays videos, uses activities and marks lessons complete |
| Physical | Uses the existing timetable, attendance and examination system | Starts an on-campus session; marks campus roster; ends once | Sees an on-campus class rather than a remote Join button |
| Online | Sees scheduled sessions and resulting attendance | Native classroom or configured external meeting | Authorized enrolled students join; blocking fee rules still apply |
| Hybrid | Selects hybrid mode for the course | Marks campus attendance while remote students join | One merged attendance record per student; a remote attendee is not made absent by a default campus entry |
| Recorded/self-paced/AI | Same course/enrollment/assessment model and publishing policy | Uploads/links recordings and resources; existing AI tools remain available | Studies published lessons at their own pace; AI uses the existing configured-service flow |
| Offline | Controls course download permission and content license | Prepares downloadable resources; can preview saved packages | Saves notes/permitted files, activities and assignment drafts; queues progress and syncs after reconnecting |

## Implemented details

- Learning Center and Offline Study are linked to institution, teacher and student workspaces. The existing My Classes, attendance, homework/exam, transcript and certificate pages remain connected to the same records.
- Course metadata includes code, duration, category, tags, cover image, copyright notice and license. Assigned teachers edit descriptive metadata; institution content managers control study mode, approval, license and download policy.
- Curriculum includes module/chapter creation, renaming/order and deletion of empty units. Cross-course references are rejected. Lessons can attach actual assignments and published assessments without exposing their answer keys.
- Practice builder uses ordinary forms for quizzes, flashcards, ordering, JavaScript practice and teacher-selected simulations/labs/games. Practice feedback does not replace graded assessment results. Coding runs in an isolated worker with a two-second limit.
- Staged publishing follows teacher → department → principal → publication. The owner grants reviewer permissions to existing institution staff. Existing course/lesson/AI-sharing endpoints cannot bypass staged publishing. Editing approved content returns it to review.
- Course/lesson revisions preserve prior snapshots and allow rollback as a new revision. Course recovery also retains the latest 30 automatic content snapshots, plus manual export/restore. These include modules, chapters, lessons, activities and linked assignment/exam content. Restore validates course ownership and references and runs transactionally. It merges saved content and retains newer items; it is not a destructive database replacement. Student submissions, historical marks and external storage files are separate from this content archive.
- Classroom adds collaborative drawing/shapes/text, shared links/files, in-class quiz, breakout groups, teacher permissions, physical attendance and recording. Existing video/audio, chat, hand raising, polls and screen sharing remain available. Breakout signaling/chat are room-scoped; ending the class invalidates further peer signaling.
- Browser recording captures the selected screen/tab, available tab audio and teacher microphone. Stopping automatically saves a local file. Publishing the recording uses configured platform storage and creates a lesson under the same approval policy.
- Videos support supplied quality sources, chapters and WebVTT subtitle tracks. Watch position persists on the device and syncs separately from completion; watching/seek position never awards an exam grade.
- Analytics use actual enrollments, completions, viewing positions and graded assignment/exam records. Lesson difficulty indicators require linked graded assessments; missing grades are not invented. Content popularity counts distinct engaged students.
- Reading controls support text size, contrast and browser voice reading. Existing application light/dark mode and AI lesson/video tools remain available. Translation generates a teacher-reviewed draft through a configured personal or institutional AI service.
- Offline storage uses IndexedDB, scoped by account. Static shell caching excludes API responses, credentials and private uploaded files. Reconnection verifies enrollment, fee access, publication and lesson revision before accepting queued progress. Repeated completion sync does not duplicate progress; newer pending updates are not deleted by an older in-flight sync.
- Offline assignment drafts are saved locally and copied into the normal online submission flow. Deadlines, required attachments and grading still run on the server. Official certificates can be refreshed into an offline copy with their original verification code/QR; current validity requires online verification.

## External dependencies and intentional limits

- Platform storage must be configured for uploading resources and publishing recorded video. Existing URLs may be attached. A recording can still be saved locally when storage is unavailable.
- Cross-network WebRTC may need TURN. Authenticated classroom configuration supports `RTC_TURN_URLS` and either time-limited credentials from `RTC_TURN_SHARED_SECRET`, or configured username/credential. No TURN service was provisioned by this change. STUN remains the default.
- AI generation, translation, narration and optional avatar/video providers need actual configured credentials and the appropriate institutional permission. Generated content is not fabricated when a service is missing.
- Quality variants and subtitle files must exist; adding a quality selector does not transcode video or generate captions. Existing AI video tools can supply narrated/captioned media.
- Streaming embeds and providers that block CORS/download cannot be made offline by caching their web page. The package reports each unavailable file. Current limits are 100 MB per file and 250 MB per package.
- Saved course access expires after seven days. Without internet, immediate server-side membership/permission revocation cannot be checked; reconnecting revalidates progress and refreshing revalidates access. Signing out removes that account's saved learning data.
- Native peer-to-peer audio/video quality depends on devices and network conditions. Teacher microphone/camera/screen controls are client classroom controls; this is not a server-side SFU media moderation service.
- SCORM/xAPI/H5P packaging, AR/VR/metaverse and digital-twin classroom products are listed as future expansion in 15B.18/15E.17. They are not presented as newly completed products. Optional DRM, watermarking and a separate digital-content store were not enabled.

## Verification

Backend automated checks cover hierarchy/foreign references, teacher metadata vs institution policy permissions, separate reviewers, legacy publishing bypasses, stale/dropped offline progress, idempotent completion, transactional restore/rollback, activity validation, physical/hybrid attendance, automatic snapshots, video progress, permission enforcement and private relay configuration. Socket tests cover actual peer joins, breakout isolation, room chat and signaling after class end.

The complete backend suite passed **211/211**. The recovery/coursework/transcript run also passed 25/25, including deleted assessment content restoration and concurrent independent video positions. The broader academic/admission/relationship run passed 45/45; frontend API checks passed 5/5 and the production build passed. The complete-suite output is retained in `audit/study-backend-test-results.txt`. After the final withdrawn-enrollment guard, all **14/14 learning tests** passed, with output in `audit/study-learning-test-results.txt`; recalculating old work does not reactivate a dropped enrollment. Existing build warnings concern the MediaPipe FaceMesh export, bundle sizes and mixed Three.js imports.

`node test/offline-browser.cjs` runs an isolated headless Chrome fixture with synthetic API responses: no real credentials, database writes or external payment calls. It checks student/teacher/institution UI, real IndexedDB blobs, account isolation, progress sync, offline reload, retained drafts, worker execution/timeouts and sign-out purge. Camera/microphone capture, interactive screen selection and external provider availability still need device testing.

## Manual acceptance steps

1. Restart the local backend after installing these changes; refresh the frontend. Use existing connected institution, assigned teacher and enrolled student accounts.
2. Institution → Learning Center → select the course. Select physical/online/hybrid mode. Under course details, set download permission/license. Leave direct publishing for the first test.
3. Teacher → Learning Center → same course. Add a module, a chapter and a lesson under them. Attach a note/PDF or upload using configured storage. Add a practice activity and link an existing assignment/exam.
4. Student → Learning Center. Confirm that the published curriculum appears, practice works, the linked assessment titles appear and Mark lesson complete updates progress. Submit graded work from Assignments & Tests.
5. Institution → select staged publishing and reviewers. Teacher submits the course and lesson; department reviewer approves; principal reviewer approves. Student must not see pending content. Edit approved content and confirm review is required again. Verify version rollback and a recovery snapshot.
6. Teacher → Live Classes → schedule/start the course. For physical mode, mark campus students in Classroom tools. For hybrid mode, also join from the student account in another browser. End the class and inspect attendance/progress; repeat End to verify no duplicate attendance.
7. In an online/hybrid native class, test chat, screen sharing, drawing, a quiz, a shared file and breakout groups. Teacher can visit a group; students cannot signal/chat into another group. Toggle student chat/file permissions and verify rejection.
8. Stop a recording and verify its downloaded file. With storage configured, publish it and check the resulting lesson. Test microphones/camera and remote audio on real devices; use TURN for restrictive networks.
9. Student → Offline Study → download course while online. Review any file warnings. Disable network and reload `/dashboard`; reopen Offline Study, read a saved lesson/file, run quiz/coding practice, save an assignment draft and mark completion.
10. Re-enable network and sync. Confirm progress once. Change a lesson while the student is offline and confirm stale progress is blocked until the new content is downloaded/reviewed. Sign out, sign into another account and confirm saved material is not exposed.

Changes are local. This study implementation has not been committed or deployed by this task.
