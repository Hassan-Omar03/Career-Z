# Single student profile and mandatory guardian details

Student My Profile now renders one verified profile form containing personal, guardian and academic fields, including the profile photo. The separate Personal Information and Academic Profile forms are removed from the student profile page. There is one Save profile action; the student form no longer offers Save progress. Account verification/deletion controls, role management and support remain reachable under Settings.

Parent/guardian full name, a valid email different from the student's email, and a valid relationship are required at student registration and before profile saves. The onboarding/profile API, legacy student profile API and generic personal-information API enforce the requirements. Rejected saves leave existing saved values unchanged. The unified onboarding save synchronizes UserProfile, StudentProfile and account name/phone/photo while retaining identity re-verification rules.

Validation:

- 21 parent completion tests passed, including missing-field rejection with unchanged saved records and a single save containing account, guardian and academic values.
- The 13 lifecycle tests passed during this change.
- Production build passed.
- Isolated headless Chrome check passed: one form, one Save button, no student Save progress, missing name/email/relation prevents requests, valid submission contains academic fields and requests completion. Desktop and 390px mobile screenshots were inspected; mobile had no horizontal overflow.

Browser validation used mocked API responses; actual persistence and authorization were tested separately against disposable databases. Existing live student records were not filled with invented guardian details.
