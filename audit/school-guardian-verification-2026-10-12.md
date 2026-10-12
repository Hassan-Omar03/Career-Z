# School guardian verification and invitations

Implemented against the client explanation supplied on 12 October 2026.

## Resulting flow

1. A parent/student may request a connection; the invited account must accept. Alternatively, an authorized school owner or staff member with `parents:manage` can invite an existing parent for an enrolled student. School invitations require both parent and student acceptance.
2. Account acceptance creates a family connection, without unlocking private school records.
3. The parent uploads guardian identity and relationship documents from My Children. School reviewers are notified.
4. A school reviewer reviews the private documents, records a reason, and confirms an admission-record match. Approved, current proof and that school's verified link flag are both required for private school records.
5. Results, attendance, homework, exams, health, consent, academic overview, AI sources and live observation enforce the gate. The parent dashboard shows a verification notice rather than private child summaries. Teacher updates automatically aggregate across children, restricted to verified current schools.
6. Transfers require the new school's approval. Proof resubmission clears verification and removes active live observers. Removing verification also removes active observers.

Each school reviews independently. Aggregate child detail endpoints require verification at every current school; the updates feed can display the already verified schools while another school's approval is pending. Financial fee/payment authorization remains separate: an approved student-authorized sponsor can still view/pay fees without acquiring guardian health/consent or school academic access.

The school invitation API also supports exact admission/roll number lookup restricted to that school's current students. The UI uses the enrolled student roster and shows roll numbers. Existing registered parent accounts are required; this is not an email registration-token system for people without accounts.

## Verification

- 25 tests passed across parent completion, multi-account HTTP, and live observer socket suites.
- 17 tests passed across lifecycle (including school invitation, both acceptances, proof submission/review, consent, progress and unlink over authenticated HTTP) and wallet settlement/refund suites.
- Production frontend build and generation of 28 public SEO pages passed.

Tests use disposable databases and synthetic documents. No production guardian evidence was auto-approved, and no existing real account or payment data was migrated. Live payment-provider settlement, external email delivery, independent tuition purchase and teacher salary payout were not newly validated by this change.
