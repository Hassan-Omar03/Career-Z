# Inventory and Medical & Health manual testing

These changes are local. Start the frontend/backend using the local development commands already provided in the conversation, and ensure the frontend API points to that local backend. Existing database credentials can point at real data; use designated test accounts/items and fictitious medical notes. Both accounts must have active membership/employment at the same institute. Inventory mutations require MongoDB transactions (replica set, such as Atlas); the regression tests use an isolated replica set.

## Inventory

1. Institute workspace > Inventory Management: choose institute; add Laptop, total quantity 2. Check available 2, issued 0. Add a stationery item too.
2. Student workspace > My Inventory: request one laptop. Institute sees a pending request; available remains 2 until approval.
3. Institute approves and sets due date. Available becomes 1, issued 1. Student sees issued assignment and notification. Teacher can receive the second unit through Institute > Issue with an active recipient selected.
4. Attempt another issue: insufficient stock must block it. Unrelated institute accounts must not see/manage these assets.
5. Student requests return. Stock must remain issued until institute uses Receive return > Good. Then available increases once. Repeated return receipt must be rejected.
6. Teacher reports damage. Institute receives damaged return; returned units are held in damaged stock. Reduce damaged units only after actual repair; stock becomes available again.
7. Check request/assignment and asset histories. Cancel/reject a pending request and verify stock does not change. Edit every asset field. Reducing total below issued + damaged must fail; deleting assets with loan history must fail.

## Medical & Health

1. Institute workspace > Medical & Health: select institute/student; save blood group, allergy, emergency contact, notes and a vaccine. Check change history.
2. Student > My Health Record: verify details and vaccinations are read-only. Parent > Health Record: select a child with approved guardian viewHealth permission; edit details/vaccinations and verify student reads the update after reopening/refresh.
3. Teacher > Student Health Incidents: report an incident for an active student; inspect own reports. Teacher must not get the complete private medical profile or incident resolution controls.
4. Institute receives the report. Eligible guardian gets a notification; sponsor and links with viewHealth=false must not. With no eligible guardian, the UI must report no notification created.
5. Institute records acknowledgment/follow-up then resolves the incident. Student/guardian see status and follow-up notes.
6. Retry guardian notification. A previously notified guardian must not get another notification in sequential retries. A newly eligible guardian can receive one. SMTP failure does not mean the in-app notification failed; UI does not promise email delivery.
7. Test a student belonging to a non-primary institute; that institute can manage its active member. After transfer, student/guardian retain earlier incident history, while unrelated institute users remain blocked.
8. Switch between children/institutes quickly and confirm no previous child's medical data reappears. Invalid blood groups, blank vaccine names and invalid dates must fail validation.
