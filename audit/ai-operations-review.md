# AI assistants — 2026-10-09

References: master sections 14.4–14.8, 15B.5–15B.6 and 15D.19.

Implemented locally:
- Institution selector, institution-owned text key used for operations reports, required key check, ops-management access plus existing ai:use credential permission for staff.
- Fee totals separated by currency, correct paid status and partial paid/outstanding balances; waived/cancelled/refunded records excluded. Due dates identify overdue balances. Scheduled balances separated.
- Active membership and teacher employment counts, recorded student attendance including excused exclusion, graded exams/assignments normalized by available maximum marks, course summaries, recorded staff check-ins, late check-ins, payroll by currency and status, open support tickets.
- No missing marks converted to zero and no absent staff inferred from missing check-ins. All-history scope disclosed. Risk alerts/actions generated from supplied metrics only, without mutating records. Raw metrics and downloadable text report.
- Teacher personal/institution AI source selector constrained by existing institution AI access permission. Text notes, quiz, lesson plan, assignment, paper and rubric tools; slides and illustrations use selected source. Existing course publishing retained. Teacher class performance insights limited to own assigned courses, without financial data.
- Dedicated student navigation and study planner, tutor, summaries, homework help, revision, practice, mock tests, career and skill suggestions using personal keys. Institution keys are not exposed to students. Existing teacher publication remains the connection to enrolled students.

Verification: 4 isolated backend AI lifecycle tests passed with mocked provider responses; frontend production build passed. Existing FaceMesh/chunk/import warnings remain. Provider billing, actual output quality and browser acceptance require a real configured API key and were not claimed as tested. No deployment/commit performed.

Test steps:
1. Restart backend, refresh frontend.
2. Institute > AI Operations Assistant > GCUF. Connect a text provider with a valid institution API key. Generate Insights and inspect Raw data used; check currency totals, attendance and graded course data. Download report.
3. Teacher > AI Teacher Assistant. Personal key works with personal source. To use institution source, owner must grant ai:use permission and connect the relevant institution key. Select institution; generate notes/quiz/paper/rubric/slides. Publish approved content to a course assigned to this teacher.
4. Teacher > Analyze my classes: only own assigned course results should appear, with missing scores indicated rather than fabricated.
5. Enrolled student > My Courses: verify published teacher content. Student > AI Student Assistant: connect personal text key and test each study feature with subject/topic/level instructions.

These changes complete the identified assistant wiring/metrics gaps. Broader master AI features such as admissions forecasting, video pipelines and custom cloud providers are separate capabilities; this change does not assert all master AI functionality is implemented.
