# Placement Office — 2026-10-09

Scope: institution/employer partnerships, eligible student and graduate referrals, student consent/application, employer hiring status and authorized teacher/staff management. No dedicated Placement Office specification was found in the master; Jobs/Internships and the future AI Placement Predictor are separate. This implementation does not claim to implement prediction or a separate campus recruitment campaign system.

Implemented locally:
- Institution selector scoped to owner or explicit placement/ops management permission; authorized teacher has a Placement Office navigation entry. Owner grants/revokes dedicated placement permission to existing institution staff from the Placement Office.
- Both partnership request directions supported; receiving side accepts/declines, requester cannot approve its own request; either party can end active partnership. Request side stored independently of later staff changes. Pending/active duplicates blocked by the existing unique index.
- Active/graduated institution memberships determine student candidates, including a secondary institution rather than only a profile's primary institution. Jobs selector contains only open, unexpired jobs from active employer partners.
- Referral creation validates selected institution, membership, active student account, open job and active partnership. Duplicate referral blocked.
- Student Jobs > Institution Referrals supports Apply and Decline. Applying creates/reuses a real JobApplication and includes existing resume snapshot when available. Transaction protects against concurrent Apply/Withdraw and duplicate application. Closed/expired jobs or ended partnership prevent applying; backend requires a replica set, as existing inventory transactions do.
- Student and institute both see real linked application status. Hired placement derives from employer's actual application status. Applied counts exclude withdrawn/declined referrals without an application.
- Notifications for partnership request/response/end, referral, student decision, and employer application. Existing employer Applicants flow continues to manage candidate status.
- Errors shown explicitly, without silently substituting empty successful results.

Manual test:
1. Restart backend and refresh frontend. Institute > Placement Office > GCUF.
2. Request partnership with an existing employer account email. Employer > Institution Partnerships: accept. Confirm institute status active.
3. Employer publishes an active job/internship with a future deadline. Institute refreshes; select an active/graduated GCUF student and this job; Refer student.
4. Student > Jobs > Institution Referrals: review and Apply. Employer > posted job > Applicants: student application appears.
5. Employer changes status to shortlisted/interview/hired. Student and institute refresh; Application status reflects it; hired increases placement count.
6. Refer another student, then student Decline: no application or applied-count increase. Institute Withdraw works before student action.
7. Employer requests partnership with institute ID: institute must see Accept/Decline. Outgoing requests must not offer self-approval.
8. Owner > Placement staff access: grant Hassan Raza dedicated access if he exists in institution staff. Teacher > Placement Office should show GCUF; revoke and verify access denied after refresh. Full ops permissions remain independent.
9. Close job/change deadline/end partnership before student Apply: request must be rejected. Check another institution's students/jobs/referrals stay isolated.

Verification: five isolated placement lifecycle tests cover both partnership directions, real application/hiring sync, declined statistics, eligibility and closed jobs, teacher permission changes, secondary institution catalogue, expired deadline, concurrent apply uniqueness. Broader connected-module checks are recorded in the session. Frontend production build and five client tests passed. Browser acceptance testing remains; no deployment/commit performed.
