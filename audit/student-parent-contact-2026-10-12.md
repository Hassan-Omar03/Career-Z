# Student-supplied guardian contact

Student registration now requires a valid parent/guardian email different from the student's own email. Guardian name and relationship are collected alongside it. Contacts are persisted in StudentProfile and the student's onboarding UserProfile; onboarding and Academic Profile updates keep those records synchronized.

Once the student is enrolled, the institute's existing authorized student roster contains the contact. Student Management displays the student-provided guardian name/email; Parent Management selects the enrolled student and automatically fills the saved contact. School invitation creation derives the email and relationship from StudentProfile, rejecting a different supplied email. Supplying a contact does not create a parent-child connection or authorize records access.

Existing students add missing contact through My Profile. Registration does not require the parent account to exist yet. Sending a school family invitation currently requires an active registered Parent account at that email; registration emails for people without an account are not queued by this change. The school sees only its enrolled students through its existing access checks. Guardian documents and school verification remain necessary before private academic access.

Validation: 19 parent completion tests passed, including registration validation/persistence, profile contact synchronization, school roster access and stored-contact invitation enforcement. The 13-test lifecycle suite also passed with stored guardian contacts in its fixtures. External email delivery and live browser form submission were not validated.
