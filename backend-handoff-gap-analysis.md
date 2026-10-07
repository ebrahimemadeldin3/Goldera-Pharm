# GolderaPharm Frontend -> Backend Requirements Audit

## Audit Scope

Source inspected on 2026-10-03 from `C:\Users\EBRAHIM\Desktop\Goldera-Pharm`.

This is a frontend-page-first backend audit for Manager, Medical Rep, and shared/auth routes discovered from `goldFront/app/**/page.tsx`. Supervisor pages, GPS, geolocation, location tracking, proximity/geofencing, GPS persistence, and GPS validation are excluded.

Application source was not changed. This document is the only intended output.

## Executive Summary

Frontend routes discovered:

| Bucket | Count |
| --- | ---: |
| Manager routes | 21 |
| Medical Rep routes | 21 |
| Shared/Auth routes | 1 |
| Supervisor routes excluded | 19 |
| Pages audited | 43 |

Backend status counts:

| Status | Count |
| --- | ---: |
| Pages fully backend-ready | 10 |
| Pages with partial backend support | 24 |
| Pages requiring backend work | 5 |
| Frontend-only pages | 3 |
| Unverified pages | 1 |

Gap counts:

| Gap category | Count |
| --- | ---: |
| Total unique backend tasks | 18 |
| P0 | 2 |
| P1 | 9 |
| P2 | 6 |
| P3 | 1 |
| Missing routes | 8 |
| Request shape mismatches | 5 |
| Response shape mismatches | 5 |
| Role/auth mismatches | 3 |
| Schema/persistence gaps | 5 |
| Query/filter/pagination gaps | 5 |
| Upload/import/export gaps | 4 |
| Frontend disabled waiting for backend | 5 |
| Frontend business-persistence fakes | 3 |

Most important backend gaps:

- **P0: Medical Rep appraisal is not backed.** Frontend calls `GET /api/appraisals/rep` and `PATCH /api/appraisals/:id`; backend only exposes manager `GET /api/appraisals` and `POST /api/appraisals`. Prisma `Appraisal` has no acknowledgement fields.
- **P0: Manager team profile route is mismatched.** Frontend detail action calls `/api/managers/users?id=:id`, but backend detail route is `/api/managers/users/:id`. The visible team-member profile can fail or receive the wrong response shape.
- **P1: Manager-created visits cannot assign ownership.** Frontend sends `medicalRepId`/`supervisorId`; backend `POST /api/visits` ignores both and persists `userId = req.user.id`.
- **P1: Product edit/delete/image are intentionally disabled because backend has only `GET /api/products` and `POST /api/products`.**
- **P1: Doctor and pharmacy bulk import are frontend validation/download only. No persistence endpoint is called.**
- **P1: Settings preferences/notifications/security controls change local component state only and are not persisted.**

## Frontend Route Inventory

Manager routes:

- `/manager`
- `/manager/[...catch]`
- `/manager/appraisal`
- `/manager/coaching`
- `/manager/doctors`
- `/manager/doctors/add`
- `/manager/doctors/[id]`
- `/manager/forecast`
- `/manager/hr`
- `/manager/pharmacies`
- `/manager/plan`
- `/manager/products`
- `/manager/profile`
- `/manager/reports`
- `/manager/requests`
- `/manager/sales`
- `/manager/settings`
- `/manager/team`
- `/manager/team/[id]`
- `/manager/visits`
- `/manager/visits/add`

Medical Rep routes:

- `/rep`
- `/rep/[...catch]`
- `/rep/appraisal`
- `/rep/coaching`
- `/rep/doctors`
- `/rep/doctors/[id]`
- `/rep/forecast`
- `/rep/forecast/new`
- `/rep/pharmacies`
- `/rep/plan`
- `/rep/products`
- `/rep/profile`
- `/rep/reports`
- `/rep/requests`
- `/rep/requests/new`
- `/rep/sales`
- `/rep/settings`
- `/rep/target`
- `/rep/visits`
- `/rep/visits/add`
- `/rep/visits/report`

Shared/Auth routes:

- `/`

Supervisor excluded routes:

- `/supervisor`
- `/supervisor/[...catch]`
- `/supervisor/coaching`
- `/supervisor/doctors`
- `/supervisor/doctors/[id]`
- `/supervisor/forecast`
- `/supervisor/pharmacies`
- `/supervisor/plan`
- `/supervisor/products`
- `/supervisor/profile`
- `/supervisor/reports`
- `/supervisor/requests`
- `/supervisor/requests/submit`
- `/supervisor/sales`
- `/supervisor/settings`
- `/supervisor/team`
- `/supervisor/team/[id]`
- `/supervisor/visits`
- `/supervisor/visits/add`

## Frontend Page -> Backend Requirements Matrix

| Role | Route | Page | Backend Status | Backend gaps | Priority |
| --- | --- | --- | --- | --- | --- |
| Shared/Auth | `/` | Login | BACKEND READY | None | None |
| Manager | `/manager` | Dashboard | PARTIAL BACKEND SUPPORT | Aggregations are assembled from many paged endpoints; dashboard-specific backend exists but frontend does not use it; some widgets depend on complete snapshots. | P2 |
| Manager | `/manager/[...catch]` | Catch-all 404 | FRONTEND-ONLY | None | None |
| Manager | `/manager/appraisal` | Appraisal | PARTIAL BACKEND SUPPORT | Create/list works for managers; no edit/delete/detail/status lifecycle; stats are page-local. | P2 |
| Manager | `/manager/coaching` | Coaching | BACKEND READY | None for current non-GPS coaching flows. | None |
| Manager | `/manager/doctors` | Doctors | PARTIAL BACKEND SUPPORT | Bulk import persistence missing; server search/filter/sort not wired beyond `subRegion` and generic exact filters. | P1 |
| Manager | `/manager/doctors/add` | Add Doctor | BACKEND READY | None for single create. | None |
| Manager | `/manager/doctors/[id]` | Doctor Profile | PARTIAL BACKEND SUPPORT | Doctor edit/delete/inactivate work; schedule visit from profile inherits visit assignment limitation. | P1 |
| Manager | `/manager/forecast` | Forecast Approval | PARTIAL BACKEND SUPPORT | Approve/reject is only `isApproved` boolean; rejected vs pending is not represented; no detail endpoint. | P1 |
| Manager | `/manager/hr` | Human Resources | PARTIAL BACKEND SUPPORT | Add/update user path likely broken by backend `createMany` with nested relation `connect`; HR stats page-local. | P1 |
| Manager | `/manager/pharmacies` | Pharmacies | PARTIAL BACKEND SUPPORT | Bulk import persistence missing; no edit/delete/detail route; server search/filter/sort limited. | P1 |
| Manager | `/manager/plan` | Plan | PARTIAL BACKEND SUPPORT | Status update works; feedback-specific approve/reject contracts are absent; feedback not persisted by current visible action. | P2 |
| Manager | `/manager/products` | Products | PARTIAL BACKEND SUPPORT | Edit/delete/image disabled; only load/create exists. | P1 |
| Manager | `/manager/profile` | Profile | BACKEND READY | None for current profile update/image flows. | None |
| Manager | `/manager/reports` | Reports | BACKEND READY | None for current visit report list; export is browser-side only if added from loaded data. | None |
| Manager | `/manager/requests` | Requests | BACKEND READY | None for current list/detail/approve/reject lifecycle. | None |
| Manager | `/manager/sales` | Sales | PARTIAL BACKEND SUPPORT | Upload/list/date/sheet/rep filters exist; no export/download endpoint; aggregate widgets are client-side over loaded data. | P2 |
| Manager | `/manager/settings` | Settings | BACKEND WORK REQUIRED | Preferences/notifications/security settings are local state only; export/delete are disabled awaiting backend. | P1 |
| Manager | `/manager/team` | Team | PARTIAL BACKEND SUPPORT | Add member backend implementation likely fails for nested relations/files; search/filter client-side over loaded page unless all pages collected. | P1 |
| Manager | `/manager/team/[id]` | Team Member Profile | BACKEND WORK REQUIRED | Frontend calls wrong detail contract `/api/managers/users?id=:id`; backend has `/api/managers/users/:id`. | P0 |
| Manager | `/manager/visits` | Visits | PARTIAL BACKEND SUPPORT | Load works; manager-created visit ownership/assignment is not persisted. | P1 |
| Manager | `/manager/visits/add` | Add/Schedule Visit | BACKEND WORK REQUIRED | Backend ignores `medicalRepId`, `supervisorId`, and `visitType`; visit is stored under manager user. | P1 |
| Medical Rep | `/rep` | Dashboard | PARTIAL BACKEND SUPPORT | Uses real `/api/dashboard/reps`; dashboard date is passed but monthly metrics use server current month, not selected date. | P2 |
| Medical Rep | `/rep/[...catch]` | Catch-all 404 | FRONTEND-ONLY | None | None |
| Medical Rep | `/rep/appraisal` | Appraisal | BACKEND WORK REQUIRED | Missing `GET /api/appraisals/rep`, missing acknowledgement `PATCH /api/appraisals/:id`, missing schema fields. | P0 |
| Medical Rep | `/rep/coaching` | Coaching | BACKEND READY | Rep list/comment uses real routes. | None |
| Medical Rep | `/rep/doctors` | Doctors | PARTIAL BACKEND SUPPORT | Rep scoping is frontend-side after unpaginated doctors/regions load; backend does not provide role-scoped doctors endpoint. | P2 |
| Medical Rep | `/rep/doctors/[id]` | Doctor Profile | PARTIAL BACKEND SUPPORT | Backend does not enforce rep territory on `GET /api/doctors/:id`; schedule visit real. | P2 |
| Medical Rep | `/rep/forecast` | Forecast | PARTIAL BACKEND SUPPORT | List/submit real; draft/detail/edit are explicitly backend-required and not implemented. | P1 |
| Medical Rep | `/rep/forecast/new` | New Forecast | PARTIAL BACKEND SUPPORT | Submit works; save draft/edit/detail unsupported. | P1 |
| Medical Rep | `/rep/pharmacies` | Pharmacies | PARTIAL BACKEND SUPPORT | Rep scoping is frontend-side after broader pharmacy/regions load; no role-scoped endpoint. | P2 |
| Medical Rep | `/rep/plan` | Plan | BACKEND READY | Current create/list flows match backend. | None |
| Medical Rep | `/rep/products` | Products | BACKEND READY | Read-only list/search/filter uses loaded product data. | None |
| Medical Rep | `/rep/profile` | Profile | BACKEND READY | None for current profile update/image flows. | None |
| Medical Rep | `/rep/reports` | Reports | BACKEND READY | Current own visit report list works. | None |
| Medical Rep | `/rep/requests` | Requests | BACKEND READY | Current my-request list works. | None |
| Medical Rep | `/rep/requests/new` | New Request | PARTIAL BACKEND SUPPORT | Request create mostly works; JSON/multipart fallbacks hide contract fragility for SAMPLE/PERSONAL_EXPENSE. | P2 |
| Medical Rep | `/rep/sales` | Sales | BACKEND READY | Current list/date/sheet filters are backed. | None |
| Medical Rep | `/rep/settings` | Settings | BACKEND WORK REQUIRED | Same local-only settings/export/delete gaps as manager settings. | P1 |
| Medical Rep | `/rep/target` | Target | FRONTEND-ONLY | Static/local target UI; no backend calls. | None |
| Medical Rep | `/rep/visits` | Visits | BACKEND READY | Current load/add/report navigation works. | None |
| Medical Rep | `/rep/visits/add` | Add Visit | BACKEND READY | Current rep scheduling persists. | None |
| Medical Rep | `/rep/visits/report` | Visit Report | PARTIAL BACKEND SUPPORT | Report persists; completion location is prepared but intentionally not sent because backend does not support it. GPS/location is excluded. | P3 |

## Manager Pages

### Manager - `/manager`

Purpose: Manager dashboard cards/charts/tables for sales, visits, team, coaching, appraisals, doctors, pharmacies, and requests.

Frontend entry point: `goldFront/app/(dashboard)/manager/page.tsx`

Components / flows: `ManagerDashboard`, `dashboard-data.ts`, dashboard chart/table components.

Backend dependencies:

- `GET /api/profiles`
- `GET /api/sales`
- `GET /api/visits/all`
- `GET /api/managers/team?role=MEDICAL_REP`
- `GET /api/managers/team?role=SUPERVISOR`
- `GET /api/coaching-reports/all`
- `GET /api/appraisals`
- `GET /api/doctors`
- `GET /api/pharmacies`
- `GET /api/managers/team/requests`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Auth gate | `getCurrentUser` | `GET /api/profiles` | READY | N/A | None |
| Load KPIs/charts | `loadDashboardData()` collects pages | Multiple list endpoints | PARTIAL | N/A | Prefer a manager dashboard endpoint matching widgets, or guarantee page collection contract. |
| Sales trend/product/region widgets | Client aggregation | `GET /api/sales` plus pharmacies/products | PARTIAL | N/A | Add backend grouped responses if dashboard must be authoritative and efficient. |
| Request/visit/team tables | Client aggregation | Existing list endpoints | READY | N/A | None for current small data. |

Backend work required: BE-015 if production dashboard aggregation must be backend-authoritative.

Evidence:

- Frontend: `goldFront/features/dashboard/components/manager/dashboard-data.ts`
- Backend: `goldBack/routes/dashboard.route.js`, `goldBack/controllers/dashboard.controller.js`, list controllers named above.
- Prisma: `Sales`, `Visit`, `User`, `Request`, `Doctor`, `Pharmacy`, `CoachingReport`, `Appraisal`.

Priority: P2

### Manager - `/manager/[...catch]`

Purpose: Catch-all not-found route.

Frontend entry point: `goldFront/app/(dashboard)/manager/[...catch]/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Not found | `notFound()` | None | FRONTEND-ONLY | No | None |

**Backend work required: NONE**

Priority: None

### Manager - `/manager/appraisal`

Purpose: Manager appraisal list/stats; create dialog is available through appraisal components.

Frontend entry point: `goldFront/app/(dashboard)/manager/appraisal/page.tsx`

Components / flows: `AppraisalHeader`, `AppraisalStats`, `AppraisalReviewsList`, `NewAppraisalDialog`, `AppraisalDetailDialog`.

Backend dependencies:

- `GET /api/appraisals`
- `POST /api/appraisals`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load reviews | `getAppraisalReviewsAction` | `GET /api/appraisals` | READY | Yes | None |
| Create appraisal | `createAppraisalAction` | `POST /api/appraisals` | READY | Yes | None |
| Stats | Derived from loaded page | `GET /api/appraisals` | PARTIAL | N/A | Add aggregate endpoint if stats must cover all records across pagination. |
| Edit/delete/status lifecycle | Not exposed as current backend action | None | MISSING if product wants it | No | Add only if UI exposes it later. |

Backend work required: BE-016 for backend-level all-record appraisal stats if required.

Evidence:

- Frontend: `goldFront/features/appraisal/api/index.ts`
- Backend: `goldBack/routes/appraisal.route.js`, `goldBack/controllers/appraisal.controller.js`
- Prisma: `Appraisal`.

Priority: P2

### Manager - `/manager/coaching`

Purpose: Manager creates coaching reports and views all reports.

Frontend entry point: `goldFront/app/(dashboard)/manager/coaching/page.tsx`

Backend dependencies:

- `GET /api/coaching-reports/all`
- `POST /api/coaching-reports`
- `GET /api/doctors`
- Manager/team data inside form.

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load reports | `getAllCoachingReportsAction` | `GET /api/coaching-reports/all` | READY | Yes | None |
| Create report | `createCoachingReportAction` | `POST /api/coaching-reports` | READY | Yes | None |
| Search/filter/display stats | Client over loaded page | Existing GET | READY for current UI | N/A | None |

**Backend work required: NONE**

Evidence:

- Frontend: `goldFront/features/coaching/api/index.ts`, `goldFront/features/coaching/api/create.ts`
- Backend: `goldBack/routes/coaching-reports.route.js`, `goldBack/controllers/coaching-reports.controller.js`
- Prisma: `CoachingReport`.

Priority: None

### Manager - `/manager/doctors`

Purpose: Doctor directory, add dialog, filters/search, bulk import dialog.

Frontend entry point: `goldFront/app/(dashboard)/manager/doctors/page.tsx`

Backend dependencies:

- `GET /api/doctors?paginate=false`
- `POST /api/doctors`
- `PATCH /api/doctors/:id`
- `DELETE /api/doctors/:id`
- Existing but unused upload route: `POST /api/doctors/csv`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load full directory | `getDoctorsAction(..., paginate=false)` | `GET /api/doctors?paginate=false` | READY | N/A | None |
| Search/filter/sort | `DoctorsList` client-side | Loaded data | PARTIAL | N/A | Add query params if server-side/global search is required. |
| Add doctor | `AddDoctorDialog`/`AddDoctorForm` | `POST /api/doctors` | READY | Yes | None |
| Edit doctor | `useEditDoctor` | `PATCH /api/doctors/:id` | READY | Yes | None |
| Inactivate doctor | `toggleDoctorActiveAction` | `PATCH /api/doctors/:id` | READY | Yes | None |
| Delete doctor | `deleteDoctorAction` | `DELETE /api/doctors/:id` | READY | Yes | None |
| Bulk import | `BulkImportDialog` prepares validated file | None called | MISSING | No | Add JSON bulk import endpoint or wire existing `/api/doctors/csv` to actual frontend payload. |

Backend work required: BE-001.

Evidence:

- Frontend: `goldFront/features/doctors/api/index.ts`, `goldFront/features/bulk-import/components/BulkImportDialog.tsx`, `goldFront/features/doctors/lib/import-config.ts`
- Backend: `goldBack/routes/doctor.route.js`, `goldBack/controllers/doctor.controller.js`
- Prisma: `Doctor`.

Priority: P1

### Manager - `/manager/doctors/add`

Purpose: Dedicated single-doctor create page.

Frontend entry point: `goldFront/app/(dashboard)/manager/doctors/add/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Create doctor | `AddDoctorForm` -> `createDoctorAction` | `POST /api/doctors` | READY | Yes | None |

**Backend work required: NONE**

Priority: None

### Manager - `/manager/doctors/[id]`

Purpose: Doctor profile/detail with recent visits, edit, delete/inactivate, and schedule visit affordances.

Frontend entry point: `goldFront/app/(dashboard)/manager/doctors/[id]/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load profile | `getDoctorByIdAction` | `GET /api/doctors/:id` | READY | N/A | None |
| Edit profile | `useEditDoctor` | `PATCH /api/doctors/:id` | READY | Yes | None |
| Inactivate/delete | Dialog actions | `PATCH`/`DELETE /api/doctors/:id` | READY | Yes | None |
| Schedule visit | `AddVisitDialog` | `POST /api/visits` | PARTIAL | Yes, wrong owner for manager assignment | Implement BE-003. |

Backend work required: BE-003.

Priority: P1

### Manager - `/manager/forecast`

Purpose: Review and approve/reject forecasts.

Frontend entry point: `goldFront/app/(dashboard)/manager/forecast/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load all forecasts | `getAllForecastsAction` | `GET /api/forecasts/all` | READY | N/A | None |
| Approve/reject | `updateForecastAction(isApproved, feedback)` | `PUT /api/forecasts/:id` | PARTIAL | Yes | Add explicit status or rejected flag to distinguish pending/rejected. |
| Detail | Inline current data | No `GET /api/forecasts/:id` | PARTIAL | N/A | Add detail route if deep-linked details are needed. |

Backend work required: BE-004.

Priority: P1

### Manager - `/manager/hr`

Purpose: HR directory and stats from manager users.

Frontend entry point: `goldFront/app/(dashboard)/manager/hr/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load HR members | `getHRMembersAction` | `GET /api/managers/users` | READY | N/A | None |
| HR stats | Frontend-derived | `GET /api/managers/users` | READY for page-local | N/A | Add aggregate endpoint only if needed. |
| Add/edit member through shared team dialogs | `addTeamMemberAction`, `updateTeamMemberAction` | `POST/PUT /api/managers/users` | PARTIAL | Unverified/likely broken on create | Fix backend user create relation handling. |

Backend work required: BE-005.

Priority: P1

### Manager - `/manager/pharmacies`

Purpose: Pharmacy directory, add dialog, filters/search, bulk import.

Frontend entry point: `goldFront/app/(dashboard)/manager/pharmacies/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load directory | `getPharmaciesAction` across pages | `GET /api/pharmacies` | READY | N/A | None |
| Add pharmacy | `createPharmacyAction` | `POST /api/pharmacies` | PARTIAL | Yes | Backend uses `createMany` and returns count, not created object. Return created record. |
| Search/filter | Client-side | Loaded pages | PARTIAL | N/A | Add server-side filters if needed. |
| Bulk import | `BulkImportDialog` prepares file | None called | MISSING | No | Add pharmacy bulk-import endpoint. |
| Edit/delete/detail | UI not fully exposed | None | Not counted | No | Add only if UI exposes later. |

Backend work required: BE-002 and BE-017.

Priority: P1

### Manager - `/manager/plan`

Purpose: View and approve/reject plans.

Frontend entry point: `goldFront/app/(dashboard)/manager/plan/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load all plans | `getManagerPlansAction` | `GET /api/plans/all` | READY | N/A | None |
| Approve/reject plan | `updatePlanStatusAction` | `PATCH /api/plans/:id` | READY | Yes | None for status. |
| Feedback-specific approve/reject | Helper has `/approve` and `/reject`, visible manager uses generic route | Routes absent | PARTIAL | No | Remove unused frontend helper or add endpoints if feedback UI is required. |
| Plan -> visits | Backend creates visits on approval | `PATCH /api/plans/:id` | READY | Yes | None |

Backend work required: BE-012 only if approval feedback must be persisted.

Priority: P2

### Manager - `/manager/products`

Purpose: Product catalog with add dialog and disabled edit/delete/image update actions.

Frontend entry point: `goldFront/app/(dashboard)/manager/products/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load catalog | `getProductsAction(..., paginate=false)` | `GET /api/products?paginate=false` | READY | N/A | None |
| Add product | `AddProductDialog` | `POST /api/products` | PARTIAL | Yes | Backend uses `createMany` and returns count, not product. |
| Edit product | Disabled controls | Missing | MISSING/DISABLED | No | Add `PATCH /api/products/:id`. |
| Delete product | Disabled controls | Missing | MISSING/DISABLED | No | Add `DELETE /api/products/:id`. |
| Product image | Disabled/unavailable | Missing field/endpoint | MISSING/DISABLED | No | Add image field or upload endpoint. |

Backend work required: BE-006.

Priority: P1

### Manager - `/manager/profile`

Purpose: Manager profile view/edit and profile image management.

Frontend entry point: `goldFront/app/(dashboard)/manager/profile/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load profile | `fetchProfile` | `GET /api/profiles` | READY | N/A | None |
| Update profile | `updateProfileAction` | `PATCH /api/profiles` | READY | Yes | None |
| Upload image | `uploadProfileImageAction` | `POST /api/profiles/profile-image` | READY | Yes | None |
| Remove image | `removeProfileImageAction` | `DELETE /api/profiles/profile-image` | READY | Yes | None |

**Backend work required: NONE**

Priority: None

### Manager - `/manager/reports`

Purpose: Manager visit reports list.

Frontend entry point: `goldFront/app/(dashboard)/manager/reports/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load all visit reports | `getAllVisitReportsAction` | `GET /api/visits/all-visit-reports` | READY | N/A | None |
| Pagination | Query params | Backend pagination | READY | N/A | None |

**Backend work required: NONE**

Priority: None

### Manager - `/manager/requests`

Purpose: Manager sees team requests and approves/rejects.

Frontend entry point: `goldFront/app/(dashboard)/manager/requests/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load team requests | `getManagerTeamRequestsAction` | `GET /api/managers/team/requests` | READY | N/A | None |
| Approve | `approveRequestAction` | `PATCH /api/requests/:id` | READY | Yes | None |
| Reject | `rejectRequestAction` | `PATCH /api/requests/:id` | READY | Yes | None |
| Response note | `response` body field | `Request.response` | READY | Yes | None |

**Backend work required: NONE**

Priority: None

### Manager - `/manager/sales`

Purpose: Sales upload/list/filter by date/sheet/rep.

Frontend entry point: `goldFront/app/(dashboard)/manager/sales/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load all sales | `getSalesAction` | `GET /api/sales` | READY | N/A | None |
| Filter by date/sheet | Query params | `GET /api/sales?date=&sheetName=` | READY | N/A | None |
| Filter by rep | `getManagerRepSalesAction` | `GET /api/sales/reps/:repId` | READY | N/A | None |
| Upload Excel | `UploadSalesDialog` | `POST /api/sales` multipart | READY | Yes | None |
| Export/download | Not backend-backed | None | MISSING if required | No | Add export endpoint only if product requires server-generated files. |

Backend work required: BE-014 only for backend export/aggregates.

Priority: P2

### Manager - `/manager/settings`

Purpose: Notifications, preferences, security/privacy, data management.

Frontend entry point: `goldFront/app/(dashboard)/manager/settings/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Notification preferences | React `useState` | None | FRONTEND FAKE | No | Add settings model/endpoints. |
| Language/timezone | React `useState` | None | FRONTEND FAKE | No | Add settings model/endpoints. |
| 2FA/session/analytics | React `useState` | None | FRONTEND FAKE | No | Add account-security/settings endpoints. |
| Export data | Disabled button | Missing | DISABLED | No | Add export endpoint. |
| Delete account | Disabled button | Missing | DISABLED | No | Add account deletion endpoint and auth confirmation. |

Backend work required: BE-007.

Priority: P1

### Manager - `/manager/team`

Purpose: Team directory, add member dialog, filters/search.

Frontend entry point: `goldFront/app/(dashboard)/manager/team/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load team | `getManagerTeamAction` | `GET /api/managers/team?role=` | READY | N/A | None |
| Add member | `addTeamMemberAction` multipart | `POST /api/managers/users` | PARTIAL/UNVERIFIED | Likely broken | Replace backend `createMany` with `create` and valid relation connect. |
| Search/filter | Client-side | Loaded data | PARTIAL | N/A | Add backend search if needed at scale. |

Backend work required: BE-005.

Priority: P1

### Manager - `/manager/team/[id]`

Purpose: Team member profile/details.

Frontend entry point: `goldFront/app/(dashboard)/manager/team/[id]/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load profile | `getUserByIdAction(id)` | Frontend calls `/api/managers/users?id=:id`; backend route is `/api/managers/users/:id` | MISMATCH | N/A | Align frontend/backend; backend can also support `?id=` if desired. |
| Update member | `updateTeamMemberAction` | `PUT /api/managers/users/:id` | READY | Yes | None |
| Delete member | `deleteTeamMemberAction` | `DELETE /api/managers/users/:id` | READY | Yes | None |

Backend work required: BE-008.

Priority: P0

### Manager - `/manager/visits`

Purpose: Manager visit calendar/list and add navigation.

Frontend entry point: `goldFront/app/(dashboard)/manager/visits/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load visits | `getManagerVisitsAction(..., paginate=false)` | `GET /api/visits/all?paginate=false` | READY | N/A | None |
| Load reps for assignment UI | `getManagerTeamAction("MEDICAL_REP")` | `GET /api/managers/team?role=MEDICAL_REP` | READY | N/A | None |
| Add visit | Navigation/dialog | `POST /api/visits` | PARTIAL | Yes, wrong owner for assignment | Implement manager assignment contract. |

Backend work required: BE-003.

Priority: P1

### Manager - `/manager/visits/add`

Purpose: Manager schedules a new visit and assigns ownership.

Frontend entry point: `goldFront/app/(dashboard)/manager/visits/add/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load doctors | `fetchDoctors(..., paginate=false)` | `GET /api/doctors?paginate=false` | READY | N/A | None |
| Load assignees | `getManagerTeamAction` | `GET /api/managers/team?role=` | READY | N/A | None |
| Schedule assigned visit | `createVisitAction` sends `medicalRepId`, `supervisorId`, `visitType` | `POST /api/visits` | REQUEST/PERSISTENCE MISMATCH | Incorrect | Backend must accept assignee fields and persist `userId` accordingly. |

Backend work required: BE-003.

Priority: P1

## Medical Rep Pages

### Medical Rep - `/rep`

Purpose: Rep dashboard.

Frontend entry point: `goldFront/app/(dashboard)/rep/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Auth/profile | `getCurrentUser` | `GET /api/profiles` | READY | N/A | None |
| Dashboard data | `getRepDashboardAction` | `GET /api/dashboard/reps?date=today` | PARTIAL | N/A | Honor query date for all date-scoped metrics or clarify it only scopes today's agenda. |
| Quick actions | Links | Existing pages | READY | N/A | None |

Backend work required: BE-015.

Priority: P2

### Medical Rep - `/rep/[...catch]`

Purpose: Catch-all not-found route.

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Not found | `notFound()` | None | FRONTEND-ONLY | No | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/appraisal`

Purpose: Rep appraisal list/detail/acknowledgement.

Frontend entry point: `goldFront/app/(dashboard)/rep/appraisal/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load my appraisals | `getRepAppraisalReviewsAction` | `GET /api/appraisals/rep` | ROUTE MISSING | No | Add route and controller scoped to `req.user.id`. |
| Acknowledge appraisal | `acknowledgeAppraisalAction` | `PATCH /api/appraisals/:id` | ROUTE/SCHEMA MISSING | No | Add route plus `acknowledged`, `acknowledgedAt`, `acknowledgementComment`. |
| Filter pending/acknowledged | Client filters | Needs ack fields | SCHEMA GAP | No | Add fields. |

Backend work required: BE-009.

Priority: P0

### Medical Rep - `/rep/coaching`

Purpose: Rep coaching report list and add comment/accept.

Frontend entry point: `goldFront/app/(dashboard)/rep/coaching/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load reports | `getRepCoachingReportsAction` | `GET /api/coaching-reports/rep` | READY | N/A | None |
| Add comment | `addRepCommentAction` | `PATCH /api/coaching-reports/:id` | READY | Yes | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/doctors`

Purpose: Rep doctor directory scoped to rep territory.

Frontend entry point: `goldFront/app/(dashboard)/rep/doctors/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load doctors | `getDoctorsAction(..., paginate=false)` then frontend territory scope | `GET /api/doctors?paginate=false` | PARTIAL | N/A | Add backend-scoped rep doctors endpoint or enforce role scope on existing list. |
| Search/filter | Client-side | Loaded data | READY for current UI | N/A | None if full dataset remains acceptable. |

Backend work required: BE-010.

Priority: P2

### Medical Rep - `/rep/doctors/[id]`

Purpose: Rep doctor profile.

Frontend entry point: `goldFront/app/(dashboard)/rep/doctors/[id]/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load profile | `getDoctorByIdAction` | `GET /api/doctors/:id` | PARTIAL | N/A | Enforce rep territory/role access in backend if required. |
| Schedule visit | `AddVisitDialog` | `POST /api/visits` | READY | Yes | None |

Backend work required: BE-010 if backend must enforce territory.

Priority: P2

### Medical Rep - `/rep/forecast`

Purpose: Rep forecast history and create navigation.

Frontend entry point: `goldFront/app/(dashboard)/rep/forecast/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load forecasts | `getMyForecastsAction` | `GET /api/forecasts` | READY | N/A | None |
| Detail | `fetchForecastById` throws 501 | Missing | DISABLED/ROUTE MISSING | No | Add `GET /api/forecasts/:id`. |
| Edit/draft | `createForecastAction` throws 501 for draft | Missing | DISABLED/SCHEMA GAP | No | Add draft/status support. |

Backend work required: BE-011.

Priority: P1

### Medical Rep - `/rep/forecast/new`

Purpose: Forecast creation/submit.

Frontend entry point: `goldFront/app/(dashboard)/rep/forecast/new/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load products/doctors | `getProductsAction`, `getMyDoctorsAction` | `GET /api/products`, `GET /api/doctors` | PARTIAL | N/A | Doctors are not backend role-scoped. |
| Submit forecast | `submitForecastAction` | `POST /api/forecasts` | READY | Yes | None |
| Save draft | `createForecastAction` throws 501 | Missing | DISABLED | No | Add draft/status fields/routes. |

Backend work required: BE-011.

Priority: P1

### Medical Rep - `/rep/pharmacies`

Purpose: Rep pharmacy directory scoped to territory.

Frontend entry point: `goldFront/app/(dashboard)/rep/pharmacies/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load pharmacies | `getPharmaciesAction` then frontend territory scope | `GET /api/pharmacies` | PARTIAL | N/A | Add backend-scoped rep pharmacy endpoint or enforce role scope. |
| Search/filter | Client-side | Loaded data | READY for current UI | N/A | None if dataset remains small. |

Backend work required: BE-010.

Priority: P2

### Medical Rep - `/rep/plan`

Purpose: Rep plan list/create.

Frontend entry point: `goldFront/app/(dashboard)/rep/plan/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load my plans | `getRepPlansAction` | `GET /api/plans` | READY | N/A | None |
| Create plan | `createVisitPlanAction` | `POST /api/plans` | READY | Yes | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/products`

Purpose: Read-only product catalog.

Frontend entry point: `goldFront/app/(dashboard)/rep/products/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load catalog | `getProductsAction(..., paginate=false)` | `GET /api/products?paginate=false` | READY | N/A | None |
| Search/filter | Client-side | Loaded data | READY | N/A | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/profile`

Purpose: Rep profile view/edit/image.

Frontend entry point: `goldFront/app/(dashboard)/rep/profile/page.tsx`

Capability matrix matches manager profile.

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/reports`

Purpose: Rep visit reports list.

Frontend entry point: `goldFront/app/(dashboard)/rep/reports/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load own reports | `getVisitReportsAction` | `GET /api/visits/visit-reports` | READY | N/A | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/requests`

Purpose: Rep request history and stats.

Frontend entry point: `goldFront/app/(dashboard)/rep/requests/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load my requests | `getMyRequestsAction` | `GET /api/requests` | READY | N/A | None |
| Pagination | Query params | Backend pagination | READY | N/A | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/requests/new`

Purpose: Rep request creation wizard for leave, expense, marketing, sample, and personal expense.

Frontend entry point: `goldFront/app/(dashboard)/rep/requests/new/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load doctors/products | `getDoctorsAction`, `getProductsAction` | `GET /api/doctors`, `GET /api/products` | READY | N/A | None |
| Create request no files | JSON then multipart fallback | `POST /api/requests` | PARTIAL | Yes | Align a single documented JSON/multipart contract. |
| Create request with files | Multipart `pdfs` | `POST /api/requests` | READY | Yes | None |
| Personal expense fallback variants | Multiple retry formats | `POST /api/requests` | PARTIAL | Yes | Backend should accept one stable shape. |

Backend work required: BE-013.

Priority: P2

### Medical Rep - `/rep/sales`

Purpose: Rep sales list filtered to rep sub-region pharmacy customers.

Frontend entry point: `goldFront/app/(dashboard)/rep/sales/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load sales | `getRepSalesAction` | `GET /api/sales/reps` | READY | N/A | None |
| Date/sheet filters | Query params | `GET /api/sales/reps?date=&sheetName=` | READY | N/A | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/settings`

Purpose: Same settings modules as manager, with rep styling.

Frontend entry point: `goldFront/app/(dashboard)/rep/settings/page.tsx`

Capability matrix matches manager settings.

Backend work required: BE-007.

Priority: P1

### Medical Rep - `/rep/target`

Purpose: Static target UI.

Frontend entry point: `goldFront/app/(dashboard)/rep/target/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Display target widgets | Static components | None | FRONTEND-ONLY | No | None until targets are productized. |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/visits`

Purpose: Rep visit planner/list.

Frontend entry point: `goldFront/app/(dashboard)/rep/visits/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load visits | `getVisitsAction(..., paginate=false)` | `GET /api/visits?paginate=false` | READY | N/A | None |
| Calendar filters | Client-side | Loaded visits | READY | N/A | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/visits/add`

Purpose: Rep schedules own visit.

Frontend entry point: `goldFront/app/(dashboard)/rep/visits/add/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load schedulable doctors | `getSchedulableDoctorsAction` | `GET /api/doctors?paginate=false`, `GET /api/profiles`, `GET /api/regions` | READY | N/A | None |
| Create visit | `createVisitAction` | `POST /api/visits` | READY | Yes | None |

**Backend work required: NONE**

Priority: None

### Medical Rep - `/rep/visits/report`

Purpose: Submit report for completed visit.

Frontend entry point: `goldFront/app/(dashboard)/rep/visits/report/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Load visit context | `getVisitReportData` scans own visits | `GET /api/visits?paginate=false` | READY | N/A | None |
| Load products | `getProductsAction` | `GET /api/products` | READY | N/A | None |
| Submit report | `createVisitReportAction` | `POST /api/visits/visit-reports` | READY | Yes | None |
| Completion location | Prepared then intentionally not sent | Missing | EXCLUDED | No | GPS/location excluded from this audit. |

Backend work required: none in scope.

Priority: P3 only if non-GPS completion metadata is later required.

## Shared/Auth Pages

### Shared/Auth - `/`

Purpose: Login page.

Frontend entry point: `goldFront/app/page.tsx`

Capability matrix:

| Capability | Frontend implementation | Backend endpoint | Backend status | Persistence | Backend work needed |
| --- | --- | --- | --- | --- | --- |
| Login | `loginAction` | `POST /api/auth/login` | READY | lastLogin updated | None |
| Session cookie | Server action stores token cookie | JWT from backend | READY | N/A | None |
| Logout | `logoutAction` deletes cookie | None | FRONTEND-ONLY | N/A | None |
| Token refresh | Not surfaced | None | Not counted | No | Add only if product requires refresh tokens. |

**Backend work required: NONE**

Priority: None

## Pages Requiring No Backend Work

- `/`
- `/manager/[...catch]`
- `/manager/coaching`
- `/manager/doctors/add`
- `/manager/profile`
- `/manager/reports`
- `/manager/requests`
- `/rep/[...catch]`
- `/rep/coaching`
- `/rep/plan`
- `/rep/products`
- `/rep/profile`
- `/rep/reports`
- `/rep/requests`
- `/rep/sales`
- `/rep/target`
- `/rep/visits`
- `/rep/visits/add`

## Frontend Features Intentionally Disabled Waiting for Backend

| Page | Feature | Frontend component | Reason disabled | Exact backend work needed |
| --- | --- | --- | --- | --- |
| `/manager/products` | Product edit | `AddProductDialog`, `ProductsList` | Backend lacks update route | BE-006 `PATCH /api/products/:id` |
| `/manager/products` | Product delete | `ProductsList` | Backend lacks delete route | BE-006 `DELETE /api/products/:id` |
| `/manager/products` | Product image upload/update | `AddProductDialog`, product image utils | Prisma/backend lacks image storage contract | BE-006 image field/upload |
| `/manager/doctors`, `/manager/pharmacies` | Final bulk import persistence | `BulkImportDialog` | Frontend validates and prepares only | BE-001/BE-002 |
| `/rep/forecast`, `/rep/forecast/new` | Forecast detail/draft/edit | `features/forecast/api/index.ts` | Functions throw `BACKEND_REQUIRED` 501 | BE-011 |
| `/manager/settings`, `/rep/settings` | Data export/delete account | `DataManagement` | Buttons disabled with backend-required title | BE-007 |

## Critical - Frontend Features Faking Backend Persistence

These are active audited-scope UI controls that appear changeable but do not persist business/account settings:

| Page | Feature | Evidence | Classification |
| --- | --- | --- | --- |
| `/manager/settings`, `/rep/settings` | Notification toggles | `Notifications.tsx` stores switch state in `useState` only | K - FRONTEND FAKE |
| `/manager/settings`, `/rep/settings` | Language/timezone | `Preferences.tsx` stores select values in `useState` only | K - FRONTEND FAKE |
| `/manager/settings`, `/rep/settings` | 2FA/session timeout/analytics | `SecurityPrivacy.tsx` stores values in `useState` only | K - FRONTEND FAKE |

Not counted as business-persistence fakes:

- Sales table column visibility in `localStorage` is a UI preference.
- Sidebar collapse in `localStorage` is a UI preference.
- `features/appraisal/mocks/rep-appraisal-preview.ts` is not imported by the live rep appraisal page.
- Toasts after real server actions are not fake when they await backend results.

## Consolidated Backend Work Queue

| ID | Priority | Backend task | Affected frontend pages | Type | Status |
| --- | --- | --- | --- | --- | --- |
| BE-001 | P1 | Doctor bulk import persistence | `/manager/doctors` | I | Missing |
| BE-002 | P1 | Pharmacy bulk import persistence | `/manager/pharmacies` | I | Missing |
| BE-003 | P1 | Manager visit assignment contract | `/manager/visits`, `/manager/visits/add`, `/manager/doctors/[id]` | C/G | Incomplete |
| BE-004 | P1 | Forecast approval status/detail completion | `/manager/forecast` | F/G | Incomplete |
| BE-005 | P1 | Manager user create/update robustness | `/manager/team`, `/manager/hr` | F/G | Incomplete |
| BE-006 | P1 | Product update/delete/image backend | `/manager/products` | B/J/G | Missing |
| BE-007 | P1 | Account settings/export/delete backend | `/manager/settings`, `/rep/settings` | B/K/G | Missing |
| BE-008 | P0 | Manager team member detail contract alignment | `/manager/team/[id]` | C/D | Mismatch |
| BE-009 | P0 | Rep appraisal list/acknowledgement backend | `/rep/appraisal` | B/G | Missing |
| BE-010 | P2 | Role-scoped doctor/pharmacy endpoints | `/rep/doctors`, `/rep/doctors/[id]`, `/rep/pharmacies`, `/rep/forecast/new` | E/H | Incomplete |
| BE-011 | P1 | Forecast draft/detail/edit support | `/rep/forecast`, `/rep/forecast/new` | B/G/J | Missing |
| BE-012 | P2 | Plan approval feedback routes or schema | `/manager/plan` | B/F | Optional incomplete |
| BE-013 | P2 | Stabilize request create JSON/multipart contracts | `/rep/requests/new` | C | Incomplete |
| BE-014 | P2 | Sales export/aggregate endpoints if product requires | `/manager/sales`, dashboards | H/I | Optional |
| BE-015 | P2 | Dashboard aggregate endpoints aligned to frontend widgets | `/manager`, `/rep` | H/F | Incomplete |
| BE-016 | P2 | Appraisal aggregate stats endpoint | `/manager/appraisal` | H | Optional |
| BE-017 | P1 | Return created record from product/pharmacy create | `/manager/products`, `/manager/pharmacies` | D | Incomplete |
| BE-018 | P3 | Non-GPS visit report completion metadata | `/rep/visits/report` | G | Excluded unless non-GPS metadata needed |

## Missing / Incomplete Backend Endpoint Contracts

### BE-001 - Doctor Bulk Import

Method: `POST`

Path: `/api/doctors/bulk-import`

Roles: `MANAGER`

Request:

```json
{
  "records": [
    {
      "nameEN": "Dr. Abdullah Al-Salem",
      "nameAR": "...",
      "phone": "+966 50 341 2111",
      "email": "abdullah.salem.test@example.com",
      "specialty": "Cardiology",
      "grade": "A",
      "LicenseNumber": "TEST-LIC-21001",
      "avgPatientsPerDay": 50,
      "accountName": "King Fahd Hospital of the University",
      "subRegion": "Eastern 1",
      "latitude": 26.3032,
      "longitude": 50.1832
    }
  ]
}
```

Success response:

```json
{
  "status": "success",
  "total": 10,
  "imported": 9,
  "skipped": 1,
  "failed": 0,
  "errors": []
}
```

Important errors: `400` validation row errors, `409` duplicate conflict, `403` non-manager.

Prisma models: `Doctor`.

Frontend consumer: `BulkImportDialog` with `doctorImportConfig`.

Reason required: Frontend validates and prepares selected rows but never persists them.

### BE-002 - Pharmacy Bulk Import

Method: `POST`

Path: `/api/pharmacies/bulk-import`

Roles: `MANAGER`

Request:

```json
{
  "records": [
    {
      "name": "Al Nahdi Pharmacy - Dammam",
      "city": "Dammam",
      "country": "Saudi Arabia",
      "region": "Eastern Region",
      "subRegion": "Eastern 1"
    }
  ]
}
```

Success response follows BE-001 import summary.

Prisma models: `Pharmacy`.

Frontend consumer: `BulkImportDialog` with `pharmacyImportConfig`.

### BE-003 - Manager Visit Assignment

Method: `POST`

Path: `/api/visits`

Roles: `MANAGER`, `MEDICAL_REP`

Request for manager:

```json
{
  "doctorId": "doctor-id",
  "date": "2026-10-03",
  "time": "10:00",
  "samples": ["product-id"],
  "notes": "optional",
  "visitType": "ROUTINE",
  "medicalRepId": "rep-id",
  "supervisorId": "supervisor-id"
}
```

Backend behavior:

- For `MEDICAL_REP`, persist `userId = req.user.id`.
- For `MANAGER`, persist `userId = medicalRepId` when provided and validate the rep belongs to the manager/team.
- Persist `visitType` when sent.
- Reject invalid supervisor/rep relationships with `400`/`403`.

Current backend ignores `medicalRepId`, `supervisorId`, and `visitType`.

### BE-004 - Forecast Approval Status and Detail

Methods/paths:

- `GET /api/forecasts/:id`
- `PUT /api/forecasts/:id`

Roles: `MANAGER`, optionally `SUPERVISOR` if supervisor scope returns later.

Request:

```json
{
  "status": "APPROVED",
  "supervisorFeedback": "Approved for cycle"
}
```

Required schema: add explicit `status` enum (`PENDING`, `APPROVED`, `REJECTED`) or equivalent rejected timestamp/flag. Boolean `isApproved` alone cannot distinguish pending vs rejected.

### BE-005 - Manager User Create Robustness

Method: `POST`

Path: `/api/managers/users`

Roles: `MANAGER`

Required fix:

- Replace `prisma.user.createMany` with `prisma.user.create`.
- Use valid nested relation syntax for `regions`, `subRegion`, `manager`, `supervisor`.
- Return the created user without password.
- Preserve multipart resume/certificates support.

Reason: current code attempts nested `connect` inside `createMany`, which Prisma does not support.

### BE-006 - Product Update/Delete/Image

Methods/paths:

- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- Either `POST /api/products/:id/image` multipart or include `image`/`imageUrl` in product update.

Roles: `MANAGER`

Patch request:

```json
{
  "name": "Product A",
  "internalRef": "P0101",
  "salesPrice": 100
}
```

Success response:

```json
{
  "status": "success",
  "data": {
    "id": "product-id",
    "name": "Product A",
    "internalRef": "P0101",
    "salesPrice": 100,
    "image": { "url": "https://..." }
  }
}
```

Prisma: `Products`; migration required if storing image data.

### BE-007 - Account Settings, Export, Delete

Endpoints:

- `GET /api/settings`
- `PATCH /api/settings`
- `GET /api/account/export`
- `DELETE /api/account`

Roles: authenticated user.

Settings request:

```json
{
  "notifications": {
    "email": true,
    "push": false,
    "weeklyReports": true,
    "requestAlerts": true,
    "performanceAlerts": false
  },
  "preferences": {
    "language": "en",
    "timezone": "Asia/Riyadh"
  },
  "security": {
    "twoFactorEnabled": false,
    "sessionTimeoutMinutes": 30,
    "analyticsSharing": false
  }
}
```

Prisma: new `UserSettings` or JSON field on `User`; account deletion must define cascade/anonymization policy.

### BE-008 - Manager Team Member Detail Contract

Current backend route exists: `GET /api/managers/users/:id`.

Current frontend calls: `GET /api/managers/users?id=:id`.

Backend option: support `?id=` on `getAllUsers` and return the detail shape expected by `getUserByIdAction`, or coordinate frontend to call `/:id`.

Given this audit is backend-handoff only, backend-compatible fix:

- Treat `id` query on `GET /api/managers/users` as exact user filter.
- Return `{ status, message, data: [user] }` if keeping frontend shape.

### BE-009 - Rep Appraisal List and Acknowledgement

Methods/paths:

- `GET /api/appraisals/rep`
- `PATCH /api/appraisals/:id`

Roles: `MEDICAL_REP`

Patch request:

```json
{
  "accept": true,
  "comment": "Acknowledged"
}
```

Required Prisma fields:

- `acknowledged Boolean @default(false)`
- `acknowledgedAt DateTime?`
- `acknowledgementComment String?`

Response: updated appraisal with manager/rep includes matching existing manager list shape.

### BE-010 - Backend Role-Scoped Directories

Endpoints:

- `GET /api/doctors/mine`
- `GET /api/pharmacies/mine`
- Optional: enforce scope in `GET /api/doctors/:id`

Roles: `MEDICAL_REP`

Reason: rep pages currently load broad data and scope in frontend using profile/regions. Backend should return only the rep's territory data for correctness and least privilege.

### BE-011 - Forecast Draft/Detail/Edit

Endpoints:

- `GET /api/forecasts/:id`
- `POST /api/forecasts/drafts` or `POST /api/forecasts` with `status: "DRAFT"`
- `PATCH /api/forecasts/:id`
- `POST /api/forecasts/:id/submit`

Roles: `MEDICAL_REP`

Prisma: add `status` enum/string if supporting draft/submitted/approved/rejected lifecycle.

Reason: frontend `fetchForecastById` and `createForecastAction` intentionally throw 501 backend-required errors.

### BE-012 - Plan Approval Feedback

Optional endpoints if feedback UI is required:

- `PATCH /api/plans/:id/approve`
- `PATCH /api/plans/:id/reject`

Request:

```json
{
  "feedback": "Please revise target doctors"
}
```

Current visible manager action uses `PATCH /api/plans/:id` with `{ status }`; backend has `supervisorFeedback` field but generic update ignores feedback.

### BE-013 - Request Create Contract Stabilization

Current frontend has JSON/multipart fallbacks for request create, especially SAMPLE and PERSONAL_EXPENSE. Backend should document and accept one stable shape:

- JSON when no files exist.
- Multipart with `pdfs` for files.
- `sampleData` and `totalExpenseData` accepted as JSON strings or parsed arrays consistently.

Affected page: `/rep/requests/new`.

### BE-014 - Sales Export/Aggregates

Optional if product requires server-generated exports:

- `GET /api/sales/export?date=&sheetName=&repId=`
- `GET /api/sales/summary?from=&to=&repId=`

Current UI can list/filter/upload without this.

### BE-015 - Dashboard Aggregates

Endpoints:

- `GET /api/dashboard/managers` response should match actual ManagerDashboard widgets, or frontend should consume existing route.
- `GET /api/dashboard/reps?date=` should consistently scope date-based widgets to query date.

Current manager frontend does not consume backend manager dashboard route and instead aggregates lists.

### BE-016 - Appraisal Aggregates

Optional:

- `GET /api/appraisals/summary`

Use when manager stats must reflect all appraisals, not only current page.

### BE-017 - Created Record Responses

Affected endpoints:

- `POST /api/products`
- `POST /api/pharmacies`

Current backend uses `createMany`, returning `{ count }`; frontend types expect created record. Use `create` for single create and return the product/pharmacy object.

### BE-018 - Visit Report Completion Metadata

Excluded unless non-GPS completion metadata becomes product requirement. Current frontend intentionally does not send completion location.

## Prisma / Database Changes Required

| Backend task | Model | Current limitation | Required field/relation/change | Migration required? | Affected pages |
| --- | --- | --- | --- | --- | --- |
| BE-006 | `Products` | No product image field | `image Json?` or `imageUrl String?` | Yes | `/manager/products` |
| BE-007 | `User` or new `UserSettings` | No settings/preferences/security persistence | JSON/settings model | Yes | `/manager/settings`, `/rep/settings` |
| BE-009 | `Appraisal` | No acknowledgement fields | `acknowledged`, `acknowledgedAt`, `acknowledgementComment` | Yes | `/rep/appraisal` |
| BE-011 | `forecast` | No draft/submitted/rejected lifecycle | `status` enum/string | Yes | `/rep/forecast`, `/rep/forecast/new`, `/manager/forecast` |
| BE-003 | `Visit` | Assignee can be represented by existing `userId`; no schema change needed | Backend validation/ownership logic | No | `/manager/visits/add` |
| BE-001/BE-002 | `Doctor`, `Pharmacy` | Models can store imported data | Bulk create endpoint only | No | `/manager/doctors`, `/manager/pharmacies` |
| BE-005 | `User` | Schema supports fields; controller uses invalid createMany relation writes | Controller fix only | No | `/manager/team`, `/manager/hr` |

## Backend Implementation Packages

### Package 1 - Catalog and Directory Imports

Affected pages: `/manager/products`, `/manager/doctors`, `/manager/pharmacies`, `/rep/products`.

Required work: BE-001, BE-002, BE-006, BE-017.

Expected frontend impact: enables bulk import persistence and product edit/delete/image controls.

### Package 2 - Field Operations

Affected pages: `/manager/visits`, `/manager/visits/add`, `/manager/doctors/[id]`, `/rep/visits/report`.

Required work: BE-003; BE-018 only if non-GPS metadata is in scope.

Expected frontend impact: manager-assigned visits appear under the intended rep instead of manager account.

### Package 3 - People, HR, and Appraisal

Affected pages: `/manager/team`, `/manager/team/[id]`, `/manager/hr`, `/manager/appraisal`, `/rep/appraisal`.

Required work: BE-005, BE-008, BE-009, optional BE-016.

Expected frontend impact: team profile page loads correctly, add-member works reliably, reps can view and acknowledge appraisals.

### Package 4 - Forecast Lifecycle

Affected pages: `/manager/forecast`, `/rep/forecast`, `/rep/forecast/new`.

Required work: BE-004, BE-011.

Expected frontend impact: distinguish pending/approved/rejected, enable detail/draft/edit flows.

### Package 5 - Settings and Reporting Enhancements

Affected pages: `/manager/settings`, `/rep/settings`, dashboards, sales.

Required work: BE-007, BE-014, BE-015.

Expected frontend impact: settings persist; export/delete actions can be enabled; dashboards become backend-authoritative.

## Validation

Commands requested:

```powershell
cd goldFront
npx.cmd tsc --noEmit
npm.cmd run lint
cd ..
git diff --check
git status
git diff --stat
```

Validation results:

- `npx.cmd tsc --noEmit`: passed with exit code 0.
- `npm.cmd run lint`: passed with exit code 0; ESLint reported 5 warnings and 0 errors:
  - `features/coaching/components/CoachingReportCard.tsx:64` unused `isCompleted`.
  - `features/plan/components/supervisor/CreatePlanDialogSupervisor.tsx:194` React Hook Form `watch()` incompatible-library warning.
  - `features/reports/_archived/components/ReportConfiguration.tsx:94` React Hook Form `watch()` incompatible-library warning.
  - `features/requests/components/CreateRequestWizard.tsx:841` React Hook Form `watch()` incompatible-library warning.
  - `features/sales/components/SalesTable.tsx:484` unused `isRep`.
- `git diff --check`: passed with no whitespace errors.
- `git status --short`: only `?? backend-handoff-gap-analysis.md` plus a Git warning that `C:\Users\EBRAHIM/.config/git/ignore` could not be accessed.
- `git diff --stat`: no tracked-file diff output because the audit file is new/untracked.
- Application source under `goldFront/**` and `goldBack/**` was not modified by this audit.

## Final Backend Developer Handoff Checklist

- Implement P0 tasks first: BE-008 and BE-009.
- Implement BE-003 before relying on manager-created visits.
- Implement BE-006 before enabling product edit/delete/image controls.
- Implement BE-001/BE-002 before exposing "final import" persistence for doctor/pharmacy bulk import.
- Implement BE-007 before treating settings page controls as persisted.
- Re-run integration tests for every page in the matrix after backend changes.
