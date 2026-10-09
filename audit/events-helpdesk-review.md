# Events and institution help desk — 2026-10-08

Master reference: CareerZ_Master_Project_Document.md.txt, sections 15D.16 and 15D.17. Institution help desk is separate from the platform-wide complaint center.

Implemented locally:
- Shared institution/student/teacher/parent screens, with a selector for active related institutions. Managers are identified by ownership or existing ops permissions.
- All master event types; create/edit, dates and venue, audience, upcoming/ongoing/completed/cancelled status. Invalid date ranges rejected. Audience restrictions apply to listing and RSVP. Atomic RSVP prevents duplicate attendance; completed/cancelled events reject new attendance. Events with RSVP history must be cancelled instead of deleted.
- Public event list includes only upcoming/ongoing events with unrestricted audience and a safe projection excluding participant IDs. Authenticated member lists expose only their own attendance state and the count.
- All master ticket categories, unique numbers, complete description, priority, submitted and assigned queues, active institution staff/teacher assignment, manager assignment controls, assigned staff resolution controls, resolution notes, validated status transitions and actor history.
- Ticket creation notifies owner and authorized ops managers. Assignment notifies the assignee; updates notify the complainant through the existing notification service.
- Legacy active primary student connection supported only when there is no explicit membership record overriding it. Approved parent links and active teacher employment are included.

Verification: frontend production build passed (existing FaceMesh/chunk/import warnings remain). 13 backend tests passed: new events-helpdesk lifecycle suite (3 scenarios covering multiple assertions) and existing institution-ops coverage (10). Tests use isolated in-memory databases; real records unchanged. No deployment or commit performed for this change. Browser user acceptance testing still required.

Manual checks:
1. Institute: Events & Activities, select GCUF, create a workshop with future start/end and audience students+teachers.
2. Student and teacher: select GCUF, confirm the event and RSVP. Institute should see attendance count increase. Cancel RSVP and check count decreases.
3. Institute: edit title/venue; set Completed. Student/teacher should no longer get a new RSVP button. Parent should not see a students+teachers-only event.
4. Student: Institution Help Desk, select GCUF, submit Academic ticket with full description. Check generated ticket number.
5. Institute: Complaint & Help Desk, inspect description/history and assign an active GCUF teacher.
6. Assigned teacher: Institution Help Desk, select GCUF, find assigned ticket, set In Progress, then Resolved with notes. Another unassigned teacher should not see this ticket.
7. Student: refresh and confirm status/notes. Institute: Close resolved ticket. Confirm history lists actors and actions.
8. Repeat creation/RSVP/tickets from a second active institution where available; items must stay scoped to the selected institution.

Restart backend if it does not auto-reload; refresh frontend. Live deployment does not include these changes until deployed.
