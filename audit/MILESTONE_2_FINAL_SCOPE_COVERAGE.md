# CareerZ Contract Milestone 2 — Final Scope and Master File Coverage

**Prepared:** 24 September 2026  
**Compared sources:**

1. `CareerZ_Final_Scope_of_Work (1).pdf`, especially Sections 3, 3A, 5–8 and commercial Milestone 2.
2. `CareerZ_Master_Project_Document.md.txt`, including the role flows, financial architecture, AI architecture, communication architecture and implementation roadmap.
3. Current frontend/backend source, route declarations, models, test evidence and `audit/FLOW_AUDIT.md`.

## 1. Which “Milestone 2” this report covers

The two project documents use different milestone numbering:

- The **Master Project Document, Phase C2** calls Milestone 2 **Education Core**: Institutions, Students, Teachers, Courses, Classes, Exams and Certificates.
- The **Final Scope of Work contract** calls commercial Milestone 2 **Career, Marketplace, Finance, Communication & AI**, scheduled for Weeks 10–19, with a $250 milestone amount.

This report covers the **Final Scope of Work commercial Milestone 2**. Education Core work already completed is documented separately in `audit/MILESTONE_2_EDUCATION_CORE.md`. Cross-module dependencies are included here where they affect jobs, payments, communication or AI.

## 2. Contract acceptance gate

The PDF defines the Milestone 2 acceptance gate as acceptance of:

- Jobs.
- Internships.
- Recruitment.
- Education agents.
- Scholarships.
- Freelancing.
- Marketplace.
- Wallet.
- Payments.
- Escrow.
- Messaging.
- AI workflows.

The PDF also defines “fully functional” as frontend UI, backend APIs, persistent records, server authorization, validation, workflow/status changes, notifications and transaction/audit records where applicable. A route or screen alone does not count as complete.

## 3. Overall assessment

| Contract area | Current assessment | Key reason |
| --- | --- | --- |
| Jobs | Implemented | End-to-end posting, discovery, application, interview, offer/hiring and history exist. |
| Internships | Partial | Jobs can represent opportunities, but there is no distinct internship model/workflow found. |
| Recruitment | Implemented | Employer pipeline, candidate matching, interview and real employment lifecycle exist. |
| Education agents | Partial | Agent role can post jobs and commission APIs exist, but full agent case/lead/application-support workspace is not evidenced. |
| Scholarships | Implemented with payment caveat | Scholarship lifecycle, seat enforcement, donor records and applications exist; real contribution settlement needs live gateway verification. |
| Freelancing | Missing/insufficient | No dedicated service/proposal/milestone/delivery/dispute model and route set was found. |
| Marketplace | Broadly implemented | Seller, moderation, inventory, orders, fulfillment statuses, reviews, returns/refunds, earnings and withdrawals exist. Live buyer gateway checkout still needs confirmation. |
| Wallet | Implemented | Ledger, top-up, transfer, withdrawal and administrative review exist with transaction safety tests. |
| Payments | Implemented at application level; staging pending | Stripe/Paddle checkout, signed webhooks, idempotency and fee/course settlement exist. Paddle configured; Stripe not configured locally. |
| Escrow | Partial | Fee, donation and marketplace-related hold/release states exist; universal licensed-custody/reconciliation behavior is not production-certified. |
| Messaging | Implemented core | Direct threads, read state, notifications, announcements and Socket.IO delivery exist. Group chat/attachments/moderation/preferences are incomplete. |
| AI workflows | Broadly implemented; provider verification pending | Central provider gateway, BYOK, institution keys, admin model control and role assistants exist. Real-provider runs require credentials. |

The milestone contains substantial working functionality, but **cannot honestly be accepted as 100% complete against the signed PDF** while Freelancing is absent, Agent case management is incomplete, Internship is not first-class, communication lacks some contracted depth, and live external integrations remain unverified.

## 4. Career, jobs and recruitment

### 4.1 Job discovery and management

Implemented functionality includes:

- Public job browsing and job detail.
- Search/filter-ready listing endpoint.
- Employer and education-agent job creation.
- Employer/agent owned-job list, summary and recent activity.
- Job editing.
- Featured-job fee configuration controlled by Super Admin.
- Paddle checkout for featured-job purchase.
- Job saving/unsaving.
- Job alerts.
- Deadline enforcement so expired jobs reject applications.
- Institution-employer partnership records.
- Institution candidate referrals that require an active partnership.

### 4.2 Candidate application flow

- Authenticated candidate applies to a job.
- Candidate can view their applications, saved jobs, interviews and dashboard summary.
- Employer views applicants for owned jobs.
- Employer can shortlist candidates.
- Recommended-candidate endpoint exists.
- Employer can schedule and update interviews.
- Candidate ownership/privacy checks are enforced.
- Status transitions are stored in the database.

### 4.3 Hiring and employment completion

The earlier “mark hired” shortcut was replaced with a real employment lifecycle:

1. Employer advances the candidate.
2. A real employment offer is created.
3. Candidate accepts or declines.
4. Acceptance creates employment history.
5. Candidate may resign.
6. Employer may terminate.
7. Employer and worker can view relevant employment records.

The institution-teacher employment flow similarly supports offer, acceptance/decline, resignation and termination rather than silently adding teachers to institution staff.

### 4.4 Institution placement office

- Institution/employer partnership request and response.
- Partnership list for both sides.
- Institution referral creation.
- Student application through a referral.
- Institution referral reporting.
- Referral cannot be created without an active partnership.
- Referral does not automatically apply on behalf of the student.

### 4.5 Remaining gaps

- Internship needs a first-class opportunity type or separate model with internship-specific fields, duration, stipend, academic credit and completion certificate/evaluation.
- Calendar-provider integration for interviews is not confirmed end to end.
- Native video interview hosting is not implemented; configured meeting links are used.
- Employer reviews and post-employment review depth should be verified against every PDF field.

## 5. Education agents and international support

### Implemented pieces

- Education-agent role exists.
- Agent can post/manage jobs where authorized.
- Commission configuration, earned-commission listing and withdrawal flow exist.
- Student applications, institutions, documents, messages and notification foundations can support agent interaction.

### Missing contracted workflow

The PDF requires agent onboarding/verification, leads, cases, student/institution application support, document tracking, country-specific services, commissions and reviews. The current backend does not show a dedicated Agent/Case/Lead route-model set. Therefore:

- Agent onboarding/verification is not evidenced as a specialized workflow beyond generic role verification.
- Lead assignment and conversion are missing.
- Agent case workspace is missing.
- Student consent to let an agent manage a case is not evidenced.
- Case document checklist/status history is missing.
- Institution-to-agent service configuration is missing.
- Agent-specific reviews/reputation need a dedicated implementation.

This area is **partial**, not complete.

## 6. Scholarships, donors and funding

### Scholarship workflow

- Public scholarship list and detail.
- Donor scholarship creation and editing.
- Donor-owned scholarship list and summary.
- Student scholarship application and application history.
- Donor applicant review and status decisions.
- Seat-limit enforcement prevents approval beyond available seats.
- Admin oversight across donor scholarships.
- Sponsorship status and payment-record workflow.
- Donor deposits with Admin approval/rejection.
- Scholarship/funding records shown in student and donor dashboards.

### Funding requests and donations

- Student/institution funding-request creation.
- Public discovery and donor recommendations.
- Admin verification of requests.
- Donor save/unsave.
- Donation creation and status history.
- Received-donation views.
- Donation escrow release.
- Global donation enable/disable control.

### Remaining verification

- Real donor payment through the configured gateway must be tested in staging.
- Beneficiary payout/reconciliation and refund behavior should be exercised end to end.
- Scholarship acceptance and institution fee offsets are not yet described as one automatic accounting flow.

## 7. Freelancing and educational services hub

The signed PDF requires:

- Service profiles/listings.
- Discovery.
- Proposals/orders.
- Milestones.
- Delivery.
- Escrow-linked payment.
- Disputes.
- Reviews and reputation.

No dedicated freelancer/service/proposal/milestone/delivery route-model family was found in the current backend. Marketplace products and teacher independent tutoring cover adjacent use cases, but they do not satisfy the contracted freelancer workflow.

This is the clearest major missing area in Final Scope Milestone 2.

Recommended implementation sequence:

1. Service profile and listing.
2. Buyer brief and provider proposal.
3. Accepted contract with milestones.
4. Gateway-funded escrow ledger.
5. Deliverable submission and revision.
6. Buyer approval/auto-release policy.
7. Dispute/evidence/reviewer decision.
8. Commission, payout and receipt.
9. Buyer/provider review and reputation.

## 8. Marketplace

### Seller onboarding and workspace

- Marketplace Seller role and dashboard.
- Seller profile.
- Seller summary and sales overview.
- Product creation, editing and deletion.
- Category, description, price, currency, stock and media.
- Inventory list and low/pending action views.
- Best-selling products.
- Earnings and wallet views.
- Withdrawal request and withdrawal history.
- Super Admin withdrawal review.

### Moderation and public visibility

- New products enter moderation status.
- Admin/Super Admin/platform staff pending queue.
- Approve/reject moderation.
- Public listing restricts visibility to active products.
- Direct product lookup no longer leaks pending/draft products.
- Commission rate read and Super Admin update.

### Buyer and order workflow

- Product discovery and detail.
- Order placement.
- Buyer order history.
- Seller order queue.
- Fulfillment/status changes.
- Payment-status management.
- Cancellation request and seller response.
- Refund request and seller response.
- Product review submission.
- Seller reply and report-review actions.
- Seller ratings/reviews and return/refund views.

### Contract gaps and risks

- A conventional multi-item cart is not evidenced; current flow is product-to-order oriented.
- Shipping-provider integration and tracking adapter are not confirmed.
- Digital delivery enforcement needs specific verification.
- Promotions/coupon rules are not evidenced.
- Buyer marketplace checkout through a live gateway needs end-to-end verification.
- Marketplace escrow and commission should be verified from charge through final seller payout with permanent receipt/audit records.

## 9. Wallet, payments, commission and receipts

### Wallet

- Per-user wallet and balance view.
- Immutable-style wallet transaction records.
- Paddle wallet top-up.
- Internal wallet transfer.
- Withdrawal request.
- Admin withdrawal review.
- Invalid amounts rejected.
- Concurrent overspending prevented.
- Balance and ledger mutations run transactionally.
- Failure during ledger creation rolls the balance back.
- Concurrent withdrawals cannot reserve the same funds twice.
- Review cannot release reserved funds twice.

### Payment gateways

- Stripe configuration detection.
- Paddle configuration detection.
- Stripe fee checkout.
- Paddle fee checkout and status sync.
- Stripe/Paddle paid-course checkout.
- Paddle wallet top-up.
- Paddle featured-job checkout.
- Signed webhook verification.
- Provider transaction IDs and statuses.
- Duplicate/concurrent delivery idempotency.
- Failed webhook rolls back its receipt and returns failure so the provider can retry.
- Unpaid, wrong-purpose and currency-mismatched events do not settle.

### Course and institution fees

- Independent paid courses use verified checkout before enrollment.
- Institution courses are assigned by admission rather than “Enroll free.”
- Institution publishes program fee rules.
- Student sees price before application.
- Application stores the accepted fee-plan snapshot.
- Admission acceptance creates invoices automatically.
- Due unpaid fees can lock class/resources/attendance.
- Manual payment report stays processing until institution confirmation.
- Card payments cannot be self-reported as paid.

### Commission

- Configurable commission rate endpoints.
- Super Admin management.
- User commission history.
- Commission withdrawal requests.
- Admin/platform staff status decisions.
- Receipt calculation stores gross, platform commission, gateway charge, tax and net fields where connected.

### Escrow, payout, refunds and receipts

- Fee escrow held/released states.
- Donation escrow release.
- Marketplace seller withdrawals.
- Wallet withdrawals.
- Refund request/approval/rejection/refunded states.
- Unique fee receipt numbers.
- Transaction IDs and provider references.
- Finance/audit views in Super Admin operations.

### Reliability evidence

Regression tests confirmed:

- Concurrent transfers cannot overspend.
- Transfer ledger failure rolls back both sides.
- Withdrawal failure restores balances.
- Duplicate webhook/top-up settles once.
- Failed webhooks remain retryable.
- Stripe fee settlement rolls back on failure.
- Paddle webhook and sync do not duplicate effects.

### Remaining contract work

- The PDF promises a universal rule engine by service, product, institution, country, currency and transaction type with effective dates and audit history. Existing commission controls need to be checked/extended to this full matrix.
- Downloadable receipt documents for every applicable transaction type are not fully evidenced.
- Reconciliation jobs and provider settlement reports need production verification.
- Tax configuration exists in Admin operations, but complete country-aware tax calculation needs staging and legal configuration.
- Paddle is configured in the current environment; live checkout still needs browser completion. Stripe is not configured.
- CareerZ records escrow states but is not a licensed custodian; actual custody depends on the selected gateway/account structure.

## 10. Messaging, realtime communication and notifications

### Implemented

- Direct message send.
- Conversation list.
- Thread history.
- Mark-thread-read.
- Database-backed notifications.
- Individual read/read-all.
- Platform announcement.
- Institution broadcast.
- Role/workflow notifications from admissions, jobs, attendance, fees, employment and other modules.
- Socket.IO frontend connection.
- Socket access-token authentication.
- Authenticated personal room only.
- Claimed-user room impersonation rejected.
- Suspended accounts rejected.
- Token refresh updates the live connection.
- Email/SMS/Twilio configuration foundations.
- Notification preferences/settings interfaces exist in the broader frontend.

### Remaining signed-scope depth

- Dedicated group-chat model and membership administration are not evidenced.
- Message attachments and secure file moderation need verification.
- Message reporting/moderation/archive workflows are incomplete.
- Per-channel granular notification preferences need end-to-end verification.
- SMS/email delivery requires real provider credentials.

## 11. Meetings and live links connected to Milestone 2

- Meeting creation, scheduling, rescheduling/status and histories.
- PTM scheduling, recurring schedules, meeting minutes and action items.
- Job interview schedule and meeting link.
- Admission interview schedule/mode/link/location.
- Institution/teacher timetable meeting link.
- Virtual fairs with registration and join link.
- Notifications around relevant meeting flows.

The platform currently manages CareerZ-side records and launches configured external URLs. Native WebRTC rooms, TURN infrastructure, recording, whiteboard, screen sharing, hand raise and breakout rooms are not implemented.

## 12. AI core and role assistants

### Central AI gateway

- Personal BYOK AI settings.
- Institution-owned AI credentials.
- Staff permission checks for institution AI use.
- Admin AI-provider/model management UI and backend.
- Provider abstraction and purpose-based configuration.
- Text generation.
- Image generation.
- 3D model generation/status.
- Voice generation.
- Avatar video generation/status.
- Animation generation/status.
- Provider error handling.
- Usage/permission structure.

### Role-level AI functionality covered

- Student study/career assistance and learning insights.
- Teacher lesson/content/quiz/exam assistance.
- AI Creative Teacher multimedia pipeline.
- AI Video Lesson Creator.
- Parent AI Assistant using authorized child data.
- Institution AI connection and permissions.
- Employer/candidate matching assistance.
- CV/cover-letter/resume-related features.
- Admin AI insights and anomaly/fraud-oriented operations screens.
- Translation provider fallback.

### AI limitations

- Provider-backed actions work only with valid client keys/credits.
- Live ChatGPT/Claude/Gemini/DeepSeek/local-provider scenarios were not all executed in this environment.
- Landing-page anonymous AI console remains a business-cost/rate-limit decision and is not confirmed as live AI.
- Advanced eye/gesture hardware control is outside practical browser-only verification.
- AI outputs still require human confirmation for sensitive actions.

## 13. Subscription and monetization work completed alongside Milestone 2

- Free, Basic, Professional and Enterprise plan structure.
- Public plan listing.
- Institution subscription status.
- Paddle subscription checkout and sync.
- Plan-based limits through subscription gates.
- Frontend subscription management UI.
- Paid course checkout and institution program-fee model.
- Featured-job purchase.
- Marketplace commission and seller earnings.
- Education-agent/general commission withdrawal foundations.

Subscription billing still needs live recurring-renewal/cancellation/webhook verification with the real merchant account.

## 14. Security and business-boundary fixes relevant to this milestone

- Refresh token invalidation after password reset.
- Suspended account refresh blocked.
- Socket impersonation blocked.
- Institution staff granular permissions.
- Public draft marketplace-product leakage fixed.
- Expired job application blocked.
- Scholarship seat over-allocation blocked.
- Paid-course enrollment requires settlement.
- Card fee payment cannot be self-confirmed.
- Wallet and webhook concurrency protected.
- Sensitive payment and administrative status changes are server-enforced.
- Platform operations include audit logs, emergency controls, finance audit, centralized refunds, incident records, backup restore and monitoring foundations.

## 15. Frontend work delivered for the commercial Milestone 2

- Job seeker dashboard and job/application/interview views.
- Employer job posting, applicant pipeline, interviews and employment views.
- Institution placement partnership/referral views.
- Marketplace buyer storefront/order views.
- Full marketplace seller workspace.
- Donor dashboard and scholarship/funding views.
- Wallet, top-up, transfer, withdrawal and history interfaces.
- Fee checkout and manual-report interfaces.
- Commission/withdrawal views where role-enabled.
- Direct chat, notifications and realtime updates.
- AI settings, institution AI panel, Admin provider management and role AI tools.
- Subscription-plan and checkout UI.
- Payment status/error handling and session-safe authenticated requests.

## 16. Testing and evidence

### Automated evidence already obtained

- Frontend session regression tests: 5/5 passed.
- Repeated frontend production builds passed.
- Backend reliability regressions previously passed 15/15.
- Payment/course checkout suite previously passed 18/18, including signed webhooks and duplicate delivery.
- Employment completion tests passed 6/6 at implementation time.
- A broader backend run passed 26 tests; five additional tests could not initialize because local free disk space was below MongoDB's 500 MB safety threshold, not because their assertions failed.
- Flow audit enumerated 447 API route declarations and ran 3,068 route/role requests without unexpected 500 responses.
- Remediated populated workflow audit recorded 161/161 checks passing.

### Still required for acceptance

- Live Paddle browser checkout and public webhook/callback.
- Stripe sandbox after credentials are supplied.
- Marketplace charge-to-payout test.
- Donation/scholarship charge-to-beneficiary test.
- Featured-job purchase test.
- Subscription renewal/cancellation test.
- SMTP/SMS delivery tests.
- Real AI-provider tests.
- Responsive browser UAT across the commercial milestone workspaces.

## 17. Exact outstanding work before commercial Milestone 2 acceptance

### Blocking scope gaps

1. Build the complete Freelancer/Educational Services Hub.
2. Build the dedicated Education Agent lead/case/application-support workflow.
3. Add first-class internship fields/workflow or formally define internships as a validated job type throughout UI/API/reporting.
4. Complete group chat, attachments and communication moderation/preferences.
5. Verify or complete cart, promotions, shipping/digital delivery and gateway-backed marketplace checkout.
6. Extend commission rules to the full signed-scope matrix with effective dates and audit history if the current generic/admin resource implementation does not cover every dimension.
7. Provide downloadable receipts consistently across every applicable payment/transaction.

### External/staging acceptance work

1. Complete real Paddle sandbox transactions.
2. Supply/configure Stripe sandbox if Stripe is an accepted provider.
3. Provide SMTP/SMS credentials.
4. Provide AI provider credentials/credits.
5. Configure a public HTTPS backend/webhook URL.
6. Run consolidated client UAT and record outcomes.

## 18. Recommended delivery order

1. Freelancer hub, because it is a clear missing contracted module.
2. Agent case management, because generic role support does not satisfy the PDF workflow.
3. Internship specialization within recruitment.
4. Marketplace cart/checkout/delivery reconciliation.
5. Communication depth: groups, attachments, moderation and preferences.
6. Commission matrix and universal receipt coverage.
7. Live provider and responsive UAT.

## 19. Final conclusion

The current product covers most of the technical foundation and many complete workflows in Final Scope Milestone 2, especially jobs/recruitment, scholarships, marketplace operations, wallet reliability, gateway settlement, direct messaging and AI configuration. The strongest completed end-to-end chains are:

- **Employer posts job → candidate applies → shortlist/interview → offer → accept/decline → employment → resign/terminate/history.**
- **Seller creates product → moderation → buyer order → fulfillment/cancellation/refund → review → earnings/withdrawal.**
- **Donor creates scholarship/funding opportunity → student applies → review/seat enforcement → sponsorship/donation records.**
- **Checkout/top-up → verified provider event → idempotent settlement → ledger/receipt/status.**
- **User/institution configures AI provider → authorized role invokes AI workflow → generated result/status.**

The milestone should be reported as **substantially implemented but not contract-complete** until the blocking items in Section 17 are delivered and the configured external services pass staging/UAT.
