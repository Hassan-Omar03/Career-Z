# Saved records: explicit Edit before changes

## Behavior

Saved account profiles open as readable values with Edit profile. Inputs and Save actions appear only after Edit. Successful saves return to view mode; validation/API failures keep the draft open. Cancel restores saved values. The backend persists `UserProfile.lastSavedAt`, so saved drafts and completed profiles stay in view mode on reload for all eight verified account roles. Existing completed profiles are recognized without migration.

Reusable `SavedForm` uses native disabled fieldsets, blocks locked submissions, hides save/mutation controls while locked, and takes a snapshot for Cancel. Table editors show their saved values in normal table columns and expose edit controls in the Action cell. `SavedStatus` applies this to status records.

## Coverage reviewed

| Area | Coverage |
| --- | --- |
| Account types | Shared required role profiles; general personal profile already had an Edit gate |
| Account settings | Personal/settings fields, password editor, two-factor settings |
| Student/parent | Parent guardian permissions, private notes/bank details, child health, guardian document replacement, saved local assignment drafts, member contribution notes |
| Teacher/staff | Teaching details/photo, salary payout destinations, meeting minutes, lesson metadata, curriculum-unit editors, course metadata/publishing/reviewer settings, completion rules, saved daily and physical class attendance |
| Institution | Details, branding/classroom/week/page settings, grading policies, family AI/observation policies, student status/class/roll, class teacher and course assignments, health records, hostel attendance, vehicle route/dates |
| Marketplace/funding | Saved stock quantities, existing listing/job Edit flows, sponsorship/donation/application status records |
| Administration | Versioned platform setting forms, staff departments/permissions, commission and featured-job fee fields, subscription plan prices, default AI model/provider settings, communication policy |

New-record forms start a new record after their previous submission is saved; existing-record editors open through their Edit/configure action. Search/filter controls select what to view. Payments, message sending, approvals, check-ins, classroom controls and task completion remain explicit workflow actions. Login and registration collect credentials for a new session/account rather than edit a saved record.

Existing lesson/unit/permissions/completion-rule editor Cancel behavior was corrected to discard drafts; curriculum-unit API errors no longer close its editor. Static checking also exposed missing membership-status metadata and missing earnings/finance state; those references were repaired using existing payout endpoints.

## Validation

- Backend completion suite: 22 tests, including saved markers after reload for every non-student verified role and completed student profiles.
- Isolated browser behavior: eight role profiles plus reusable saved form; read mode, Edit, Cancel, failed save/retry, locked submit, successful re-lock; desktop and mobile screenshots.
- Production build and targeted undefined-reference/unreachable-code checks.
- Browser checks use mocked delivery/API responses and do not log into or modify real accounts. These checks validate the components and saved-state backend behavior; they do not certify every live workflow in production.

Reference lock: existing CareerZ ProfilePanel Edit/Cancel pattern, role-profile layout, grading editor, and refero-design craft-details accessibility guidance. Existing colors, spacing and responsive field grid are retained.
