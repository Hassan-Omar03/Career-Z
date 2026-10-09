# Institutional inventory review

Scope: source-code comparison against CareerZ_Master_Project_Document.md.txt sections 8.22 (line 4147) and 15D.13 (line 9608). No live data modified; no end-to-end browser test performed.

The master requires institutional tracking of furniture, computers, projectors, laboratory equipment, sports items and (8.22) stationery. It does not specify an inventory issue/return/request workflow between teacher and student accounts. Those are additional workflow requirements, not explicit missing master clauses.

## Implemented

- Institution dashboard inventory panel with real API-backed create, list, update and delete.
- Quantity, location, condition, purchase date, unit cost and calculated total value display.
- Named categories for computers, projectors, furniture, lab equipment and sports equipment; stationery can currently only be categorized as other.
- Backend institution ownership or institution operations staff permission required for all inventory endpoints.

## Incomplete integration and gaps

- No teacher/student inventory navigation, personal assigned-assets endpoint or dashboard.
- Model has assignedTo and PATCH accepts it, but UI cannot assign, unassign or show the assignee. Create ignores assignedTo.
- PATCH does not validate that the assignee exists and belongs to the institution. A syntactically valid unrelated User ID can be stored by an authorized manager.
- No issue/return transactions, quantities allocated per recipient, requests/approvals, due dates, damage reports or asset movement history. These are useful additions to fulfill the user's desired cross-role integration.
- Frontend edit only changes quantity, location and cost; cannot edit name/category/condition/purchase date/notes although backend supports them.
- No named stationery category, despite section 8.22; other provides a partial workaround.
- Quantity accepts fractional numbers; purchaseCost has no minimum validation. No inventory-specific regression tests found.

Original audit conclusion: an institutional asset register was implemented, with no complete institute/teacher/student lifecycle. The master itself specifies basic asset tracking, not a detailed cross-role lifecycle.

## Implemented following the user's completion request

- Shared inventory UI connected to Institution Inventory Management and teacher/student My Inventory navigation. Institute selector supports the user's multiple institutions.
- Named stationery category and full asset editing (name, category, quantity, location, condition, purchase date, cost, notes).
- Student/teacher requests, cancellation, manager approval/rejection, and direct issue to an active institution member.
- Persisted per-recipient quantities, due dates and overdue display, own assignment list, return request, manager receipt, damage reports and movement history.
- Damaged returned quantities remain unavailable until the manager records repair by reducing damaged units.
- Issue and return updates are atomic MongoDB transactions. Approval checks stock again; pending requests do not reserve stock. Concurrent issues cannot overallocate.
- Backend manager permission, active recipient membership and ownership checks. Assignees cannot be set to arbitrary User IDs through asset PATCH.
- Recipient and institute-owner notifications for requests, decisions, returns and damage. Ops staff review the shared institute request list.
- Legacy assignedTo entries remain visible; stock is blocked until the manager confirms the old asset's return and clears that assignment, then issues through the new tracked workflow.
- Deletion blocked for assets with loan history; active issued plus damaged quantities cannot exceed recorded total stock.

Validation: 28 backend tests passed across inventory lifecycle and institution operations/hostel/transport regressions; five frontend tests passed; frontend production build passed with existing chunk/dynamic-import warnings. Seven dedicated inventory tests use an isolated MongoDB replica set, including concurrent issue and duplicate return rejection. No real institution data was altered and no live browser end-to-end test was performed.

Deployment: these inventory changes are local, not committed or deployed. Other payment/payroll edits already existed in both workspaces; they were preserved. The new inventory implementation lives in backend inventory.controller.js, InventoryLoan.js and the extended InventoryItem.js, and frontend InstitutionInventory.jsx.

Source locations: frontend src/pages/Dashboard.jsx:16223; backend src/models/InventoryItem.js:5; src/controllers/institutionOps.controller.js:108 and :703; src/routes/institutionOps.routes.js:56.
