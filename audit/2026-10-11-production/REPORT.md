# GolderaPharm Production Functional & Cross‑Role Audit

Date: 2026-10-11 (Africa/Cairo)  
Target: https://goldera-pharm-frontend.vercel.app/

## Executive verdict

The production deployment is **usable with important fixes required**.

Authentication, authorization, the main Manager and Medical Rep modules, responsive navigation, and the core Request, Plan, Forecast, Appraisal, and Coaching data flows were exercised against the live deployment. Request and Plan completed end to end with correct two-way status updates and notifications. Forecast data and approval propagated correctly, but the Manager did not receive the submission notification. Coaching completed end to end and preserved the Rep response, but the Manager did not receive a feedback notification. Appraisal acknowledgement changed the status, but the Rep's written response was lost and was not visible to the Manager.

No production-blocking crash was found. The most important release risks are a lost Appraisal response, misleading calculations/counts, incomplete Manager notifications, and insufficiently scoped selection data.

## Audit scope

- Public login and validation.
- Manager role: all visible modules, list/detail/search/filter surfaces, representative workflow forms, notifications, profile, and logout.
- Medical Rep role: all visible modules, list/detail/search surfaces, forms, mobile navigation, notifications, profile, and logout.
- Cross-role production workflows: Request, Plan, Forecast, Appraisal, and Coaching.
- Accessibility and UX observations visible through the rendered UI and browser accessibility tree.
- Production deployment behavior only; this is not a penetration test, code review, full WCAG audit, or database audit.

## Numbered workflow results

| Step | Flow | Health | Result |
| --- | --- | --- | --- |
| 1 | Authentication and role routing | Healthy | Both supplied accounts logged in successfully. Unauthenticated and cross-role protected routes redirected correctly. Logout worked for both roles. |
| 2 | Rep creates Request → Manager receives it | Healthy | Request was created, Manager unread count increased, notification opened the correct record, and the pending request was visible. |
| 3 | Manager approves Request → Rep receives result | Healthy | Approval persisted, Rep received an approval notification, notification routing worked, and status became Approved. |
| 4 | Rep submits Plan → Manager receives it | Healthy | Plan submission created the Manager notification and pending plan record. |
| 5 | Manager approves Plan → Rep receives result | Healthy | Approval persisted, Rep received the approval notification, and status became Approved. |
| 6 | Rep submits Forecast → Manager reviews it | Needs attention | Forecast appeared correctly for Manager and could be approved, but no new Manager notification was generated. Doctor counts also changed across Forecast screens. |
| 7 | Manager approves Forecast → Rep receives result | Healthy | Manager pending/approved totals changed and Rep received the approval notification with Approved status. |
| 8 | Manager creates Appraisal → Rep acknowledges it | Broken response path | Rep received the Appraisal notification and acknowledgement status persisted, but the typed Rep response disappeared immediately after submission. Manager received no notification and could not see the acknowledgement response. |
| 9 | Manager creates Coaching review → Rep responds | Healthy with notification gap | Rep received the Coaching notification, details matched, response persisted, and the session changed to Completed. Manager saw the exact Rep response and completed count updated. Manager unread count did not change. |
| 10 | General Manager/Rep modules and responsive UI | Mostly healthy | Main lists, details, search, filters, tabs, drawers, week views, forms, and 390×844 Rep layout worked. Specific issues are listed below. |

## Cross-role audit details

### Request — PASS

- Rep submitted a QA sample request.
- Manager notification/count updated and routed to the request.
- Manager approved it.
- Rep received an approval notification and saw Approved status.
- Evidence: `cross-role-workflows/01-rep-request-ready-to-submit.png` through `07-rep-request-approved-status.png`.

### Plan — PASS

- Rep submitted a QA weekly plan.
- Manager received the submission notification and saw the plan.
- Manager approved it.
- Rep received the approval notification and saw Approved status.
- Evidence: `cross-role-workflows/08-rep-plan-ready-to-submit.png` through `14-rep-plan-approved-status.png`.

### Forecast — PASS with defects

- Rep submitted a November 2026 Forecast with one product, one doctor, and five units.
- Manager could see and approve it; pending changed from 7 to 6 and approved changed from 0 to 1.
- Rep received `Forecast approved` and the record became Approved.
- **Defect:** Manager received no notification for the new Forecast; unread stayed at 11.
- **Defect:** Rep Forecast doctor totals were inconsistent: overview values changed from 6 to 7, while the allocation step exposed 10 doctors.
- **UX risk:** the new Forecast form initially preselected three products, which can cause accidental allocations.
- Evidence: `cross-role-workflows/15-rep-forecast-ready-to-submit.png`; later states were verified live in the same audit session.

### Appraisal — FAIL on Rep response persistence

- Manager created an October 2026 / Q4 Appraisal for the tested Rep at 75/100.
- Rep unread count increased and the Appraisal notification routed correctly.
- Rep submitted an acknowledgement with a written response.
- Status changed to Acknowledged and a success toast appeared.
- **High-severity defect:** the detail view immediately said `No response comment was submitted`; the entered response was lost.
- **Defect:** Manager had no acknowledgement notification and the Manager Appraisal view exposed neither acknowledgement state nor the Rep response.

### Coaching — PASS with Manager notification gap

- Manager created a joint-visit review dated Oct 11, 2026 for the tested Rep.
- Rep received an immediate Coaching notification and the record details matched.
- Rep submitted a written response.
- Rep status changed to Completed; pending count changed 2→1 and completed 0→1.
- Manager saw the full response; Manager pending count changed 3→2 and completed became 2.
- **Defect:** Manager unread count stayed at 11; no feedback-completed notification was generated.
- **Data-scope defect:** after selecting the Rep, the Doctor selector showed hundreds of doctors across multiple regions instead of only the selected Rep's permitted territory/assignment.
- Evidence: `cross-role-workflows/33-manager-coaching-response-visible.png`.

## Confirmed issues and required changes

| Priority | Finding | Required change |
| --- | --- | --- |
| P0 | Appraisal acknowledgement response is lost | Persist the response atomically with acknowledgement, return the saved value, render it for both roles, and add an integration test covering text + status together. |
| P1 | Manager cannot see Appraisal acknowledgement/response | Add acknowledgement status, timestamp, Rep response, and audit trail to Manager Appraisal details. |
| P1 | Missing Manager notifications for Forecast submission, Appraisal acknowledgement, and Coaching response | Define an event/notification matrix for every cross-role transition; emit idempotent notifications and link them to the correct record. |
| P1 | Plan coverage can show `100%` with `0` selected doctors | Fix the coverage formula and recalculate existing summaries. Define the zero-denominator state explicitly instead of treating it as 100%. |
| P1 | Coaching doctor selector is not scoped to the selected Rep | Filter doctors server-side by the selected Rep's assignment/territory and validate the relationship again on submission. |
| P1 | Forecast doctor totals disagree across screens | Use one scoped source/query for overview and allocation counts; label each count precisely and add consistency tests. |
| P2 | Rep Profile → Settings redirects to Dashboard | Implement `/rep/settings` or remove/disable the quick action with clear copy. |
| P2 | Dialogs have missing accessible titles/descriptions | Ensure every dialog/drawer has a programmatic title and description; remove the recurring Radix accessibility errors and test keyboard/screen-reader behavior. |
| P2 | Submit actions can be enabled before required input | Disable submission until required fields are valid and show field-level errors after attempted submission. Confirmed on Manager Appraisal, Manager Coaching, and Rep Coaching comment surfaces. |
| P2 | `Contact IT Support` is inert | Render it as a real link/button with a support destination and keyboard focus. |
| P2 | Slow first render on data-heavy pages | Profile production queries and client waterfalls. Manager Pharmacies took about 8s and Rep New Forecast about 5s in observed first loads; add error/retry states and measurable performance targets. |
| P3 | Forecast products are preselected by default | Start with no products selected or make the default explicit and require confirmation before carrying automatic selections forward. |

## Manager functionality coverage

| Module | Health | Tested result |
| --- | --- | --- |
| Dashboard | PASS | Live KPIs and approval/team summaries loaded. |
| Team | PASS | Five members loaded; search worked; add-member flow opened. |
| Doctors | PASS | Directory, search, filters, add form, import entry point, and pagination rendered. |
| Human Resource | PASS | Five employee records loaded. |
| Visits | PASS (read-only) | Day/Week views and Add Visit form opened; week view populated. |
| Requests | PASS end to end | List/detail plus live submission notification and approval workflow verified. |
| Reports | PASS (read-only) | Report list, search, and detail expansion worked. |
| Appraisal | FAIL on response path | Creation and Rep notification worked; Rep response persistence/Manager visibility failed. |
| Coaching | PASS with issues | Creation and response propagation worked; Manager notification and doctor scoping need fixes. |
| Plan | PASS end to end | Live submission notification and approval round trip verified. |
| Forecast | PASS with issues | Approval round trip worked; submission notification and count consistency failed. |
| Pharmacies | PASS with performance issue | Search/add surface worked; slow initial render observed. |
| Sales | PASS | KPIs, rows, and order details loaded. |
| Products | PASS | Active/archived tabs, search, and add form opened. |
| Profile | PASS (read-only) | Profile data and edit form rendered. |
| Settings/reference data | PASS (limited) | Reference-data areas and Add Region dialog rendered; some preferences are unavailable. |
| Notifications/user menu | PARTIAL | Existing notifications and routing worked; several Manager-side workflow events are missing. |

## Medical Rep functionality coverage

| Module | Health | Tested result |
| --- | --- | --- |
| Dashboard | PASS | KPIs, quick actions, agenda, and notifications loaded. |
| Doctors | PASS | Territory directory and Arabic search worked. |
| Visits | PASS (read-only) | Day/Week views and Add Visit form rendered. |
| Visit Report | PASS (route only) | Empty/selection guidance rendered; no live visit/report was created. |
| Reports | PASS | Empty state rendered without error. |
| Requests | PASS end to end | Creation, Manager notification, approval, Rep notification, and final status verified. |
| Coaching | PASS end to end | Manager review, Rep notification, Rep comment, Completed state, and Manager response visibility verified. |
| Appraisal | FAIL on response | Appraisal receipt and acknowledgement status worked, but written response was lost. |
| Plan | PASS with calculation issue | Live approval round trip worked; older cards contain the 100%-with-zero-doctors inconsistency. |
| Forecast | PASS with issues | Live approval round trip worked; counts and Manager submission notification are inconsistent. |
| Pharmacies | PASS | Territory list and exact search worked. |
| Sales | PASS | KPIs and order rows loaded. |
| Products | PASS | Product list and search worked. |
| Profile | PASS with broken shortcut | Profile loads; Settings shortcut redirects to Dashboard. |
| Mobile 390×844 | PASS | No horizontal overflow; responsive navigation exposed all Rep modules. |
| Logout | PASS | Confirmation returned to Sign In. |

## Strengths

- Role routing and protected-route behavior were reliable in the tested scenarios.
- Request and Plan have complete, understandable cross-role feedback loops.
- Status chips, counts, details, and notification deep links generally make state changes easy to follow.
- Coaching preserved the Rep's written response and exposed it clearly to the Manager.
- Mixed Arabic/English records rendered without the layout breaking.
- The Rep mobile dashboard and navigation worked without horizontal overflow at 390×844.

## UX and accessibility risks

- Missing notifications create silent state changes for the Manager, forcing manual checking.
- Success toasts are not sufficient when the saved record contradicts them, as in Appraisal acknowledgement.
- Enabled submit buttons before required fields are complete weaken confidence and error prevention.
- Browser console errors showed missing dialog titles/descriptions; screen-reader naming should be verified after remediation.
- Loading skeletons are visually consistent, but long waits can look stalled without error/retry or progress context.
- Screenshot and accessibility-tree checks cannot establish full WCAG compliance, keyboard completeness, color contrast compliance, or screen-reader behavior.

## What remains to be tested

1. Supervisor role and Supervisor↔Manager/Rep workflows; no Supervisor credential was supplied.
2. Full Visit workflow: schedule a live visit, complete it, submit a Visit Report, and verify Manager Reports/KPIs/notifications.
3. Rejection and resubmission branches for Request, Plan, and Forecast.
4. CRUD persistence for doctors, pharmacies, products, users, regions, profile edits, imports/uploads, archive/delete, and duplicate/error handling.
5. External email/push/SMS delivery, if the product is intended to send any; only in-app notifications were tested.
6. Token expiry, concurrent sessions, refresh/retry behavior, offline/network failure, and duplicate-submit/idempotency behavior.
7. Formal accessibility verification: keyboard-only journey, focus traps/restoration, screen reader, contrast, zoom/reflow, and automated scans.
8. Security testing: authorization at API level, IDOR, rate limits, upload security, secrets, audit logs, and penetration testing.
9. Vercel build/runtime logs, environment variables, deployment ownership, and production observability; the connected Vercel account does not expose this deployment.

## Recommended implementation order

1. Fix Appraisal response persistence and Manager visibility; add end-to-end regression coverage.
2. Implement the missing cross-role notification events and an explicit event matrix.
3. Fix plan coverage, Forecast count consistency, and Coaching doctor scoping.
4. Repair Settings/support navigation and client-side validation states.
5. Resolve dialog accessibility errors, then run keyboard/screen-reader testing.
6. Profile slow pages and add reliable loading/error/retry behavior.
7. Run the remaining Visit, rejection, CRUD, resilience, accessibility, and security suites in a staging environment seeded for QA.

## Evidence handling

Screenshots are stored beside this report in the audit folder and `cross-role-workflows/`. Credentials are intentionally excluded. The final Coaching screenshot was visually inspected and confirms Completed status plus the exact Rep response in the Manager view. Screenshots establish visible UI state only and do not prove backend integrity or full accessibility compliance.
