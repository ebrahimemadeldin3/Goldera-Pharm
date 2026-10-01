# GolderaPharm Full Frontend Logic Audit

Date: 2026-09-29
Scope: `goldFront/**` only.

Application source was not modified for this audit. Existing uncommitted Visits work was preserved.

## 1. Executive Summary

The frontend is a Next.js App Router CRM with role workspaces for Manager, Supervisor, and Medical Rep. The core data path is:

```text
ROUTES
  -> FEATURE COMPONENTS
  -> HOOKS / CLIENT STATE
  -> FEATURE API SERVER ACTIONS
  -> services/http.ts or direct fetch for FormData
  -> BACKEND
```

Overall state:

- The core CRM modules mostly use real APIs: authentication, dashboards, doctors, pharmacies list/create, visits list/create, visit reports, plans, sales, requests, team, HR, coaching, appraisal list/create, profile, and most forecast approval/submission paths.
- The main production risks are specific fake/local persistence paths, not global mock data.
- The highest-risk frontend issue is product edit/remove: it stores browser-only overrides and removed IDs while showing success messaging.
- The highest-risk backend dependency is Visit assignment: Manager/Supervisor scheduling sends assignment fields, but the backend must persist and return assigned rep/supervisor/visit type separately from creator.
- Runtime authenticated testing was not completed because no credentials/session were provided. Static code tracing and build validation were completed.

Bug counts:

| Severity | Count |
| --- | ---: |
| P0 | 0 |
| P1 | 7 |
| P2 | 10 |
| P3 | 4 |

Readiness:

- Frontend is usable for real API-backed flows where backend contracts exist.
- It is not production-complete for product update/delete, target, bulk import persistence, visit completion GPS persistence, visit cross-user assignment persistence, forecast draft/detail, and rep appraisal acknowledgement if the backend endpoint is missing.

Backend dependency summary:

- Requires backend change - excluded from current frontend-only scope: Visit assignment persistence.
- Requires backend change - excluded from current frontend-only scope: Visit report completion GPS persistence.
- Requires backend change - excluded from current frontend-only scope: Bulk import persistence for doctors/pharmacies.
- Requires backend change - excluded from current frontend-only scope: Product update/delete/image persistence.
- Requires backend change - excluded from current frontend-only scope: Target real data.
- Requires backend change - excluded from current frontend-only scope: Forecast detail/draft if drafts are required.
- Requires backend change - excluded from current frontend-only scope: Rep appraisal acknowledgement if `/api/appraisals/:id` PATCH is unavailable.

## 2. Architecture

### Project map

| Area | Role |
| --- | --- |
| `app/**` | Next.js routes, layouts, loading/error boundaries, public login, role dashboards |
| `features/**` | Feature modules with components, API actions, schemas, mappers, utilities |
| `components/**` | Shared layout, sidebar, headers, forms, UI primitives, pagination, skeletons |
| `services/http.ts` | Shared server-side JSON API client |
| `lib/**` | Shared types, utility functions, region/hospital requests, pagination helpers |
| `hooks/**` | Shared browser hooks |
| `docs/**` | Documentation and audit outputs |

### Shared API flow

Most server actions call `apiFetch<T>()` from `services/http.ts`. It reads the `token` cookie, adds `Authorization`, defaults to `cache: "no-store"`, parses JSON, and throws an `ApiError`-like object for failed responses.

Multipart uploads bypass `apiFetch` and use direct `fetch` so `Content-Type` can be omitted:

- Team member create: `POST /api/managers/users`
- Sales upload: `POST /api/sales`
- Request attachments: `POST /api/requests`
- Profile image upload: `POST /api/profiles/profile-image`

### Shared state model

- Server components load initial API data.
- Client components apply filtering/search/sort/pagination and perform mutations through server actions.
- `router.refresh()` is used after many successful mutations.
- `revalidatePath` is used by profile and product creation actions.
- `localStorage` is used for UI preferences and also for product edit/remove/image overrides.

### Shared route protection

- `app/(dashboard)/layout.tsx` calls `getCurrentUser()` and redirects to `/` if no profile can be loaded.
- `proxy.ts` redirects users by decoded JWT role for `/manager`, `/supervisor`, and `/rep` route prefixes.
- The proxy decodes but does not verify JWT payload. This is acceptable only as routing convenience; backend authorization must remain the security boundary.

## 3. Role Route Inventory

Total `page.tsx` routes audited: 62.

### Public

| Route | Purpose | Source | Actions | Status |
| --- | --- | --- | --- | --- |
| `/` | Login/brand page | Login form + auth API | Login | Real API |

### Manager routes

Count: 21.

| Route | Purpose | Source | Actions | Status |
| --- | --- | --- | --- | --- |
| `/manager` | Manager dashboard | Multiple real APIs via dashboard loader | Drill-down navigation | Real API + derived frontend data |
| `/manager/appraisal` | Appraisal list/stats/create | `/api/appraisals` | Create appraisal | Real API |
| `/manager/coaching` | Coaching reports and review form | `/api/coaching-reports/all`, `/api/coaching-reports` | Create coaching report | Real API |
| `/manager/doctors` | Doctor directory | `/api/doctors` | Search/filter/import/edit/delete | Real API; import is frontend preparation |
| `/manager/doctors/add` | Add doctor | `/api/doctors` | Create doctor | Real API |
| `/manager/doctors/[id]` | Doctor profile | `/api/doctors/:id` | Edit, delete/inactivate, schedule visit | Real API |
| `/manager/forecast` | Forecast approval center | `/api/forecasts/all`, `/api/forecasts/:id` | Approve/reject | Real API |
| `/manager/hr` | HR member directory | `/api/managers/users` | View HR dialogs | Real API + derived data |
| `/manager/pharmacies` | Pharmacy directory | `/api/pharmacies` | Add, import prep | Real list/create; edit/delete absent |
| `/manager/plan` | Manager plan review | `/api/plans/all` | Approve/reject/update | Real API |
| `/manager/products` | Product catalog | `/api/products` | Add/edit/remove/image | Add real; edit/remove/image local-only |
| `/manager/profile` | Profile | `/api/profiles` | Edit profile/avatar | Real API |
| `/manager/reports` | Visit report analytics | `/api/visits/all-visit-reports` | Filter/copy/export-like UI | Real API + frontend filters |
| `/manager/requests` | Team request approval | `/api/managers/team/requests`, `/api/requests/:id` | Approve/reject | Real API |
| `/manager/sales` | Sales KPIs/table/upload | `/api/sales`, `/api/sales/reps/:id` | Upload sales | Real API |
| `/manager/settings` | Settings panels | Local components | Console-only actions in data management | Placeholder/local |
| `/manager/team` | Manager team directory | `/api/managers/team`, `/api/regions` | Add member | Real API |
| `/manager/team/[id]` | Team member profile | `/api/managers/users?id=...` | Edit/delete/copy | Real API |
| `/manager/visits` | Manager visits planner | `/api/visits/all`, `/api/managers/team` | Filter/calendar/report links | Real API; assignment backend dependency |
| `/manager/visits/add` | Schedule manager/coaching visit | `/api/doctors`, `/api/managers/team`, `/api/visits` | Create visit | Real request; assignment fields need backend |
| `/manager/[...catch]` | Catch-all not found | Next `notFound` | None | Real routing |

### Medical Rep routes

Count: 21.

| Route | Purpose | Source | Actions | Status |
| --- | --- | --- | --- | --- |
| `/rep` | Rep dashboard | `/api/dashboard/reps?date=...` | Quick links | Real API; failure can show empty metrics |
| `/rep/appraisal` | Rep appraisal and acknowledgement | `/api/appraisals/rep`, mock preview fallback | Acknowledge | Real when endpoint exists; preview/backend-pending path |
| `/rep/coaching` | Rep coaching reports | `/api/coaching-reports/rep` | Add comment | Real API |
| `/rep/doctors` | Rep scoped doctors | `/api/doctors`, `/api/profiles`, `/api/regions` | Search/filter/schedule | Real API + frontend territory scope |
| `/rep/doctors/[id]` | Doctor profile | `/api/doctors/:id` | Edit/schedule | Real API |
| `/rep/forecast` | Forecast history | `/api/forecasts` | Filter/view | Real API + mock stats utility risk |
| `/rep/forecast/new` | Forecast creation | `/api/forecasts`, `/api/products`, `/api/doctors` | Submit forecast | Submit real; draft helper is mock |
| `/rep/pharmacies` | Rep scoped pharmacies | `/api/pharmacies`, `/api/profiles`, `/api/regions` | Search/filter | Real API + frontend territory scope |
| `/rep/plan` | Rep plans | `/api/plans` | Create plan | Real API |
| `/rep/products` | Product catalog | `/api/products` | Add/edit/remove/image | Same product local-only caveat |
| `/rep/profile` | Profile | `/api/profiles` | Edit/avatar | Real API |
| `/rep/reports` | Own visit reports | `/api/visits/visit-reports` | Filter/view | Real API |
| `/rep/requests` | Request history | `/api/requests` | View/copy | Real API |
| `/rep/requests/new` | Create request | `/api/requests`, doctors/products | Submit attachments | Real API |
| `/rep/sales` | Rep sales | `/api/sales/reps` | Filters/table | Real API |
| `/rep/settings` | Settings panels | Local components | Local settings only | Placeholder/local |
| `/rep/target` | Sales target dashboard | `features/target/lib/data` | None | Hardcoded/mock |
| `/rep/visits` | Rep visits planner | `/api/visits` | Complete link/filter/calendar | Real API |
| `/rep/visits/add` | Schedule self visit | `/api/doctors`, `/api/visits` | Create visit | Real API; schedulable doctors can fail open |
| `/rep/visits/report` | Complete visit report | `/api/visits`, `/api/products`, `/api/visits/visit-reports` | Submit report with GPS gate | Real report; GPS not persisted |
| `/rep/[...catch]` | Catch-all not found | Next `notFound` | None | Real routing |

### Supervisor routes

Count: 19.

| Route | Purpose | Source | Actions | Status |
| --- | --- | --- | --- | --- |
| `/supervisor` | Supervisor dashboard | `/api/dashboard/supervisors`, `/api/profiles` | Quick links | Real API; failure can show empty panels |
| `/supervisor/coaching` | Supervisor coaching reports/review | `/api/coaching-reports`, `/api/coaching-reports` POST | Create coaching report | Real API |
| `/supervisor/doctors` | Doctor directory | `/api/doctors` | Search/filter | Real API |
| `/supervisor/doctors/[id]` | Doctor profile | `/api/doctors/:id` | Edit/schedule | Real API |
| `/supervisor/forecast` | Forecast requests | `/api/forecasts/all`, `/api/forecasts/:id` | Approve/reject | Real API |
| `/supervisor/pharmacies` | Pharmacy directory | `/api/pharmacies` | Search/filter | Real list; limited CRUD |
| `/supervisor/plan` | Supervisor/team plans | `/api/plans`, `/api/profiles` | Create/approve/reject | Real API |
| `/supervisor/products` | Product catalog | `/api/products` | Add/edit/remove/image | Same product local-only caveat |
| `/supervisor/profile` | Profile | `/api/profiles` | Edit/avatar | Real API |
| `/supervisor/reports` | Visit reports | `/api/visits/all-visit-reports` or own reports depending page | Filter/view | Real API |
| `/supervisor/requests` | Team requests | `/api/supervisors/team/requests` | Approve/reject | Real API |
| `/supervisor/requests/submit` | Submit request | `/api/requests` | Create request | Real API |
| `/supervisor/sales` | Sales view | Sales APIs | Filters/table | Real API |
| `/supervisor/settings` | Settings | Redirect to `/supervisor` | None | Dead/redirect route |
| `/supervisor/team` | Supervisor reps | `/api/supervisors/team` | View team | Real API |
| `/supervisor/team/[id]` | Rep profile | `/api/supervisors/team/:id` | View/edit profile components | Real API |
| `/supervisor/visits` | Supervisor visits planner | Reuses manager visits action | Filter/calendar | Real API; scope must be backend-enforced |
| `/supervisor/visits/add` | Schedule coaching visit | `/api/doctors`, `/api/supervisors/team`, `/api/visits` | Create visit | Real request; assignment backend dependency |
| `/supervisor/[...catch]` | Catch-all not found | Next `notFound` | None | Real routing |

## 4. Authentication / Role Logic

Login flow:

```text
/ -> LoginForm -> loginAction -> POST /api/auth/login -> token cookie
  -> getRoleRedirectPath(role) -> /manager | /supervisor | /rep
```

Token handling:

- `loginAction` stores `token` as httpOnly cookie, max age 1 hour, `sameSite: "strict"`, `secure` in production.
- `logoutAction` deletes the cookie and redirects to `/`.
- `getCurrentUser()` calls `/api/profiles` and returns `null` on failure.

Route protection:

- `proxy.ts` redirects unauthenticated protected route access to `/`.
- `proxy.ts` decodes JWT payload to redirect users to their role base path.
- Role layouts themselves do not check role.

Role boundary assessment:

- Frontend routing is not a security boundary.
- Manager/Rep/Supervisor route separation is implemented for UX.
- Backend must authorize every API request independently.
- Risk: because `proxy.ts` decodes role without signature verification, a tampered client token could affect frontend redirects until the backend rejects API calls.

## 5. Manager Account Audit

Manager dashboard:

- Data source: REAL API + DERIVED FRONTEND DATA.
- Flow: page -> `loadDashboardData()` -> sales, visits, team, coaching, appraisals, doctors, pharmacies, requests -> `apiFetch`.
- Pagination: `collectPages` requests pages until full dataset is collected.
- Failure: dataset failures become `{ data: [], error: true }`; UI can still render partial/empty panels.

Manager visits:

- Data source: REAL API.
- Flow: page -> `getManagerVisitsAction(false)` -> `GET /api/visits/all?paginate=false`.
- Team list: `getManagerTeamAction("MEDICAL_REP", 1, 1000)`.
- Filters/search/calendar/day/week use the same client dataset in `VisitsPlanner`.
- Major risk: assigned rep must come from backend fields, not creator.

Manager plans:

- Data source: REAL API.
- Flow: page -> `getManagerPlansAction()` -> `GET /api/plans/all`.
- Mutations: approve/reject/update use `PATCH /api/plans/:id/approve`, `PATCH /api/plans/:id/reject`, `PATCH /api/plans/:id`.
- Visit generation from approved plans is backend-owned if implemented.

Doctors:

- Data source: REAL API.
- List/detail/create/update/delete use `/api/doctors`.
- Bulk import is frontend preparation only.
- District/region/territory is normalized by local utilities and import config.

Pharmacies:

- Data source: REAL API for list/create.
- Missing: update/delete frontend API wrappers were not found.
- Bulk import is frontend preparation only.

Sales:

- Data source: REAL API.
- Manager list uses `/api/sales`; rep-specific manager fetch uses `/api/sales/reps/:repId`.
- Upload uses multipart `POST /api/sales`.
- Column visibility is localStorage preference only.

Forecast:

- Data source: REAL API for manager approval center.
- Flow: `getAllForecastsAction` -> `GET /api/forecasts/all`.
- Mutations: `PUT /api/forecasts/:id`.

Products:

- Data source: MIXED.
- List/create real: `/api/products`.
- Edit/remove/image override localStorage only.

Team and HR:

- Team data source: REAL API `/api/managers/team`, `/api/managers/users`.
- HR data source: REAL API `/api/managers/users`, frontend filters out managers.
- Add team member uses multipart manager users endpoint.

Coaching and appraisal:

- Coaching list/create uses real coaching report APIs.
- Appraisal list/create uses real `/api/appraisals`.

Requests and reports:

- Requests are real APIs with approval/rejection via `/api/requests/:id`.
- Reports use real visit report endpoints with frontend filters.

Settings:

- Data management actions are console-only; preferences/security panels are local UI state.

## 6. Medical Rep Account Audit

Rep dashboard:

- Data source: REAL API.
- Flow: `getRepDashboardAction` -> `GET /api/dashboard/reps?date=today`.
- Failure: page sets `dashboardData = null`; some components can present empty metrics rather than a hard error.

Visits:

- Rep visits use `GET /api/visits`.
- Self scheduling uses `POST /api/visits`.
- `getSchedulableDoctorsAction` uses all doctors then tries to scope by profile territory.
- Serious role-scope note: if profile fetch fails, schedulable doctors can remain unscoped.

Visit report:

- Report page loads visit from `GET /api/visits?paginate=false`.
- Products load from `/api/products`.
- Submit uses `POST /api/visits/visit-reports`.
- GPS is required by the form but not sent to backend yet.

Doctors/pharmacies:

- Main rep list pages fetch global APIs but then scope client-side using profile + regions.
- If scope cannot resolve, these pages show empty scoped lists, which is safer than fail-open.
- Backend should still enforce role scope.

Plan:

- Rep plans use `GET /api/plans`.
- Create plan posts to `/api/plans`.
- Form resets only after success.

Requests:

- Real create/list APIs.
- File attachments use multipart when present.
- Fallback JSON/multipart logic exists for backend parser differences.

Forecast:

- List and submit real.
- Draft/detail helper paths still mock.

Target:

- Hardcoded data from `features/target/lib/data`.
- No API integration found.

## 7. Supervisor Account Audit

Supervisor dashboard:

- Data source: REAL API `/api/dashboard/supervisors`.
- Failure can yield empty panels because page assigns `dashboardData = null`.

Supervisor team:

- Uses `/api/supervisors/team` and `/api/supervisors/team/:id`.
- Scope is backend-dependent.

Supervisor visits:

- `getSupervisorVisitsAction` delegates to `getManagerVisitsAction`, therefore uses `/api/visits/all`.
- This must be authorized/scoped by backend, otherwise supervisor could see too much.

Supervisor plan:

- `GET /api/plans` plus profile splitting into rep plans versus own plans.
- Create uses `POST /api/plans` with `repId`.
- Approve/reject use real plan endpoints.

Supervisor coaching:

- List uses `/api/coaching-reports`.
- Save/create uses `/api/coaching-reports`.

Supervisor requests/forecast/reports/products/sales:

- Requests are scoped via `/api/supervisors/team/requests`.
- Forecast approval reuses all-forecast management endpoint.
- Products have same local-only edit/remove risk.
- Settings redirects to `/supervisor`.

## 8. Visits Architecture

Lifecycle map:

```text
Manager Add Visit / Supervisor Add Visit / Rep Add Visit / Plan approval
  -> createVisitAction or backend plan approval
  -> POST /api/visits or backend-created Visit
  -> Visit record with id, doctorId, userId/creator, optional assignment fields
  -> /manager/visits, /supervisor/visits, /rep/visits
  -> VisitCard complete link for rep
  -> /rep/visits/report?visitId=...
  -> POST /api/visits/visit-reports
  -> completed/report data returned by visits/reports endpoints
```

Current frontend visit model:

- Stable ID: `visit.id`.
- Doctor: `doctorId` plus nested doctor fields.
- Creator: `createdBy` and `createdById`.
- Assigned rep: `medicalRepId` / `medicalRep` if backend returns it.
- Visit type: optional `visitType`.
- Status: API status mapped to UI status.
- Completion location: optional `completionLocation` if backend returns it.

Manager visit aggregation:

- Manager visits call `/api/visits/all`.
- Current frontend expects this endpoint to include manager-created, rep-created, plan-created, scheduled, completed, cancelled, and in-progress visits if the Manager is allowed to see them.
- Medical Rep filter should use assigned representative. The frontend now attempts `medicalRepId`, nested `medicalRep`, and known team `userId` fallback, but backend assignment is still the source of truth.

Visit filters:

- Medical Rep filter, status filter, date filter, search, calendar, day view, and week view are derived from the same `VisitsPlanner` dataset.
- Search combines doctor/person/facility/rep/notes-like fields.
- Risk remains if backend data omits `medicalRepId`; filter can only infer from `userId` if that ID matches a known rep.

Visit report:

- Form fields: duration, rating, purpose, topics, doctor feedback, notes, sample list, completion location.
- Validation failure preserves form state.
- GPS failure preserves form state.
- API failure preserves form state and shows error.
- Success toast/navigation occurs only after server action returns success.

Visit location:

- Uses `navigator.geolocation.getCurrentPosition`.
- Does not use `watchPosition`.
- No continuous tracking found.
- No page-load GPS request found.
- No Manager GPS request found.
- No scheduling GPS request found.
- No browser GPS persistence found.
- Stale GPS threshold: 5 minutes.
- Accuracy labels are client-side only.
- Completion GPS is not sent/persisted today.

## 9. Doctors / Pharmacies

Doctors:

- List: `GET /api/doctors` with optional `subRegion`, `page`, `limit`, `paginate`.
- Detail: `GET /api/doctors/:id`.
- Create: `POST /api/doctors`.
- Update: `PATCH /api/doctors/:id`.
- Delete: `DELETE /api/doctors/:id`.
- Role scoping for rep list pages is frontend-derived; backend must enforce.
- Import config covers name, specialty, account/facility, geography, coordinates, duplicates, required fields.

Pharmacies:

- List: `GET /api/pharmacies`.
- Create: `POST /api/pharmacies`.
- Update/delete wrappers were not found.
- Rep pharmacy page fetches enough pages to client-scope by territory.
- Import config covers pharmacy fields and duplicate checks.

Consistency risks:

- Doctor model uses `nameEN`, `nameAR`, `name`, `accountName`, `subRegion`, `area` across modules.
- Visit report data currently sets location to `"-"` rather than doctor/facility location.
- Pharmacy CRUD is less complete than Doctor CRUD.

## 10. Bulk Import

Bulk import exists for Doctors and Pharmacies.

Flow:

```text
Template -> Upload -> Detect Format -> Parse -> Normalize Headers
  -> Validate Headers -> Normalize Values -> Duplicate Detection
  -> Geography Resolution -> Preview -> Resolve -> Select
  -> Prepare Import -> Validated Batch -> Download
```

Supported formats:

- `.xlsx` parsed by frontend reader.
- `.csv`.
- `.tsv`.
- Delimited `.txt`.
- Legacy `.xls` is detected and rejected with guidance.

Validation includes:

- Header normalization and aliases.
- Unknown/missing headers.
- Blank rows.
- Duplicate detection in file and against existing records.
- Geography hierarchy resolution.
- Latitude/longitude pair validation for doctors.
- Ready/warning/invalid row status.
- Error report and validated batch download.
- Reset and second upload handling.

Persistence:

- No API persistence call exists.
- Status: FRONTEND PREPARATION COMPLETE, BACKEND PERSISTENCE REQUIRED.
- Requires backend change - excluded from current frontend-only scope.

## 11. Commercial

Sales:

- Fetch: real sales APIs.
- Upload: real multipart upload.
- KPIs/filtering/table are derived in frontend from API response.
- Column visibility is localStorage preference.
- Watch for filters over current loaded page where server pagination is active.

Forecast:

- Real: forecast list, submit, manager/supervisor approval.
- Mock/local: `fetchForecastById`, draft `createForecastAction`, mock forecast constants, mock products in stats utility.
- Fake success risk: draft create returns a generated local forecast but does not persist.

Products:

- Real: list/create.
- Local only: edit overrides, removed product IDs, user image data URLs.
- Success messaging for edit/remove is misleading for durable CRM data.

## 12. Management

Team:

- Manager team real APIs for list/add/detail/update/delete.
- Supervisor team real APIs for list/detail.
- Add member FormData includes role assignment, subRegionId, supervisorId, and documents.

HR:

- Real data from manager users endpoint.
- Frontend filters only supervisors and reps.
- Archived HR add dialog is commented/obsolete.

Coaching:

- Manager/supervisor create uses real `POST /api/coaching-reports`.
- Manager list: `/api/coaching-reports/all`.
- Supervisor list: `/api/coaching-reports`.
- Rep list/comment: `/api/coaching-reports/rep`, `PATCH /api/coaching-reports/:id`.
- Visit location history is localStorage input enhancement only.

Appraisal:

- Manager list/create: real `/api/appraisals`.
- Rep list: `/api/appraisals/rep`.
- Rep acknowledgement: `PATCH /api/appraisals/:id`; 404 is treated as backend-pending.
- Rep page has mock preview import fallback.

## 13. Workflow

Requests:

- Rep create/list real.
- Manager/supervisor team lists real.
- Approve/reject real.
- Attachments are copied/opened from URLs; clipboard actions are local UI only.

Reports:

- Rep reports: `/api/visits/visit-reports`.
- Manager/all reports: `/api/visits/all-visit-reports`.
- Filters are client-derived from loaded report data.
- Archived report configuration components contain console-only handlers and should not be considered production report generation.

## 14. Shared HTTP/API Layer

`services/http.ts`:

- Adds bearer token from httpOnly cookie.
- Defaults to no-store.
- Sends JSON content type by default.
- Parses text then JSON for success responses.
- Handles 204/empty body.

Risks:

- No central 401/403 redirect or refresh handling.
- Malformed success JSON throws outside normalized API error handling.
- Request options can override headers because `...(options.headers || {})` is applied after Authorization/Content-Type.
- Direct FormData fetch wrappers duplicate error normalization logic.
- Debug logs remain in several server actions.

## 15. Filter / Pagination Logic

Patterns:

- Many API actions accept `page` and `limit`.
- Many UI lists also apply client search/filter/sort over the loaded records.
- Shared `TablePaginationFooter` is used in many feature lists.
- Dashboard Manager deliberately collects all pages for aggregate accuracy.

Risks:

- Client-side filters over server-paginated pages can hide matches on other pages unless the page first loads the full dataset.
- Some pages fetch large fixed limits such as 1000 team members.
- Page reset behavior is implemented in major catalogs, but not uniformly across every component.
- Date/search/status filters are mostly local; backend query filters are limited.

## 16. Loading / Empty / Error

Loading:

- Route loading files exist for most role pages.
- Feature skeletons exist for visits, doctors, pharmacies, products, sales, forecast, team, plans, appraisal, requests, reports, dashboards.

Empty:

- Many lists have explicit empty states.

Error:

- Some pages throw errors and rely on route error boundaries.
- Manager dashboard stores dataset error flags but can still show partial empty cards.
- Rep/Supervisor dashboard failures can become null dashboard data and render empty panels.
- Profile manager route has an explicit error boundary.

Retry:

- Retry is present in some error states, not universal.

## 17. Notification Logic

Notifications use `toast`/Sonner.

Correct:

- Most create/update/approve/reject/upload flows show success only after server action success.
- Visit report preserves data on API failure and does not show success until server action success.

Incorrect/misleading:

- Product edit success is localStorage-only.
- Product remove success is localStorage-only.
- Forecast draft create can succeed locally.
- Bulk import "prepared" is accurate only as file preparation, not database import.
- Settings data management logs actions only.

## 18. Fake vs Real Data Map

| Feature | Data | Classification | Persistence | Backend dependency |
| --- | --- | --- | --- | --- |
| Auth | Login/profile token | REAL API | Cookie + backend | Existing |
| Manager dashboard | Sales/visits/team/etc. | REAL API + DERIVED | Backend | Existing |
| Rep dashboard | Rep dashboard API | REAL API | Backend | Existing |
| Supervisor dashboard | Supervisor dashboard API | REAL API | Backend | Existing |
| Visits list/create | `/api/visits`, `/api/visits/all` | REAL API | Backend | Assignment fields need backend |
| Visit report | `/api/visits/visit-reports` | REAL API | Backend | GPS field pending |
| Visit GPS | Browser geolocation | LOCAL STATE | Not persisted | Backend persistence required |
| Doctors | `/api/doctors` | REAL API | Backend | Existing |
| Doctor import | Bulk parser | BACKEND PENDING | File only | Import endpoint required |
| Pharmacies | `/api/pharmacies` | REAL API | Backend for list/create | Update/delete/import endpoints required |
| Pharmacy import | Bulk parser | BACKEND PENDING | File only | Import endpoint required |
| Products list/create | `/api/products` | REAL API | Backend | Existing |
| Products edit/delete/images | localStorage | LOCALSTORAGE | Browser only | Product update/delete/image endpoint required |
| Sales | `/api/sales` | REAL API | Backend | Existing |
| Sales table columns | localStorage | LOCALSTORAGE | Browser preference | None |
| Forecast list/submit | `/api/forecasts` | REAL API | Backend | Existing |
| Forecast draft/detail | mock constants/generated ID | MOCK/LOCAL STATE | Not durable | Forecast draft/detail endpoint if required |
| Target | `features/target/lib/data` | HARDCODED | None | Target API required |
| Team | Manager/supervisor team APIs | REAL API | Backend | Existing |
| HR | `/api/managers/users` | REAL API + DERIVED | Backend | Existing |
| Coaching | Coaching report APIs | REAL API | Backend | Existing |
| Coaching location history | localStorage | LOCALSTORAGE | Browser suggestion | None |
| Appraisal manager | `/api/appraisals` | REAL API | Backend | Existing |
| Rep appraisal | `/api/appraisals/rep` + mock preview | REAL API + MOCK FALLBACK | Backend when available | Rep endpoints required |
| Requests | `/api/requests` | REAL API | Backend | Existing |
| Reports | Visit report APIs | REAL API | Backend | Existing |
| Settings | Local UI components | LOCAL STATE/HARDCODED | Not durable | Settings APIs if required |

## 19. LocalStorage / SessionStorage Audit

No `sessionStorage` usage was found.

| Use | Purpose | Appropriate? |
| --- | --- | --- |
| Sidebar collapse key | UI preference | Yes |
| Sales table column visibility | UI preference | Yes |
| Coaching location history | Input suggestion history | Yes, enhancement only |
| Product image map | Product image override | Risky; visual-only local state |
| Product override map | Product edits | No for business persistence |
| Removed product IDs | Product removal | No for business persistence |

## 20. Cross-Feature Consistency

Doctor:

- Multiple shape variants exist: API doctor, profile doctor, visit nested doctor, import payload doctor, forecast doctor.
- Common fields are `id`, `nameEN`, `nameAR`, `accountName`, `specialty`, `subRegion`, `area`.
- Recommendation: keep mappers explicit and avoid assuming all fields exist.

Pharmacy:

- Pharmacy list/import shapes are less complete than Doctor.
- Update/delete parity is missing.

Visit:

- Creator and assigned representative are distinct concepts.
- Frontend now models both, but backend must persist both.

Product:

- API product and local override product can diverge across browsers.

User/team:

- Manager user detail and supervisor team detail use different endpoints and likely different scopes. Backend must enforce role.

## 21. Bug Catalog

### P0

No P0 issue was confirmed in frontend-only static audit. No serious cross-role data exposure was proven without backend behavior/runtime credentials.

### P1

**FE-P1-001**

- Severity: P1
- Role: Manager, Supervisor, Medical Rep
- Route: `/manager/products`, `/supervisor/products`, `/rep/products`
- Feature: Products
- Description: Product edit/remove uses localStorage but shows successful business action.
- How to reproduce: Open products, edit or remove a product, refresh in another browser/session or inspect backend data.
- Expected behavior: Product update/remove persists on backend or is clearly labeled local-only.
- Actual behavior: Browser-only override/removal is saved and success toast is shown.
- Root cause: `saveStoredProductOverride` and `saveRemovedProductId` are used instead of update/delete API calls.
- Relevant files: `features/products/components/AddProductDialog.tsx`, `features/products/components/ProductsList.tsx`, `features/products/lib/utils.ts`.
- Frontend fixable: Partially; UI can disable/label these actions.
- Backend required: Yes, for real persistence.
- Risk: Misleading CRUD and inconsistent product catalog across users.
- Recommended solution: Add product update/delete/image backend endpoints, then replace local overrides.

**FE-P1-002**

- Severity: P1
- Role: Manager, Supervisor, Medical Rep
- Route: `/manager/visits/add`, `/supervisor/visits/add`, `/manager/visits`, `/supervisor/visits`, `/rep/visits`
- Feature: Visits
- Description: Cross-user visit assignment depends on backend support for `medicalRepId`, `supervisorId`, and `visitType`.
- How to reproduce: Schedule a coaching/manager visit for a rep, then inspect returned visits and rep visibility.
- Expected behavior: Assigned rep is persisted separately from creator and returned by list endpoints.
- Actual behavior: Frontend sends fields, but frontend cannot guarantee backend stores/returns them.
- Root cause: Assignment is a backend data contract.
- Relevant files: `features/visits/api/index.ts`, `features/visits/components/AddVisitForm.tsx`, `features/visits/components/VisitsPlanner.tsx`.
- Frontend fixable: No, except defensive UI messaging.
- Backend required: Yes.
- Risk: Wrong visit ownership, broken rep filter, missing rep visibility.
- Recommended solution: Persist assigned rep/supervisor/type on visit records and return them on all visit endpoints.

**FE-P1-003**

- Severity: P1
- Role: Medical Rep
- Route: `/rep/visits/report`
- Feature: Visit report completion/GPS
- Description: Completion GPS is required by frontend but not submitted to backend.
- How to reproduce: Complete a visit report; inspect payload in `createVisitReportAction`.
- Expected behavior: Completion location is persisted with report.
- Actual behavior: `completionLocation` is prepared then discarded.
- Root cause: Backend endpoint may reject unknown fields; frontend intentionally does not send it.
- Relevant files: `features/visits/components/VisitReportForm.tsx`, `features/visits/api/reports.ts`.
- Frontend fixable: Only after backend accepts the field.
- Backend required: Yes.
- Risk: GPS compliance appears complete but cannot be audited server-side.
- Recommended solution: Add backend contract for location and then send it from server action.

**FE-P1-004**

- Severity: P1
- Role: Manager, Medical Rep
- Route: Doctor/pharmacy import dialogs
- Feature: Bulk import
- Description: Bulk import validates and prepares files but does not persist rows.
- How to reproduce: Upload valid import file and click Prepare Import.
- Expected behavior: If labeled import, rows are inserted/updated or queued by backend.
- Actual behavior: Validated CSV can be downloaded; no database write occurs.
- Root cause: No persistence API call exists.
- Relevant files: `features/bulk-import/components/BulkImportDialog.tsx`, `features/bulk-import/lib/*`.
- Frontend fixable: Only copy/labeling; not persistence.
- Backend required: Yes.
- Risk: Users may mistake preparation for import completion.
- Recommended solution: Add doctor/pharmacy import endpoints with row-level results.

**FE-P1-005**

- Severity: P1
- Role: Medical Rep
- Route: `/rep/forecast`, `/rep/forecast/new`
- Feature: Forecast
- Description: Forecast draft/detail helpers use mock data and generated local IDs.
- How to reproduce: Call `createForecastAction` or `fetchForecastById`.
- Expected behavior: Draft/detail comes from backend if available in UI.
- Actual behavior: Mock constants and local generated forecast are returned.
- Root cause: Dummy implementations remain in forecast API module.
- Relevant files: `features/forecast/api/index.ts`, `features/forecast/lib/constants/index.ts`.
- Frontend fixable: Yes if removing draft UI; otherwise backend required.
- Backend required: Yes for durable draft/detail.
- Risk: Forecast state can appear saved when not persisted.
- Recommended solution: Replace helpers with real endpoints or remove draft behavior.

**FE-P1-006**

- Severity: P1
- Role: Medical Rep
- Route: `/rep/appraisal`
- Feature: Appraisal
- Description: Rep appraisal can fall back to mock preview/backend-pending behavior.
- How to reproduce: Use rep appraisal when `/api/appraisals/rep` or acknowledgement endpoint returns 404.
- Expected behavior: Real appraisals and acknowledgements persist.
- Actual behavior: Preview mode can update temporary UI state.
- Root cause: Backend endpoint availability is incomplete/handled as pending.
- Relevant files: `app/(dashboard)/rep/appraisal/page.tsx`, `features/appraisal/api/rep.ts`, `features/appraisal/components/rep/RepAppraisalClient.tsx`.
- Frontend fixable: Partially; remove preview for production.
- Backend required: Yes if endpoint missing.
- Risk: Rep acknowledgement may look available before persistence.
- Recommended solution: Complete backend endpoint or disable preview in production.

**FE-P1-007**

- Severity: P1
- Role: Medical Rep
- Route: `/rep/target`
- Feature: Target
- Description: Target page is hardcoded and not API-backed.
- How to reproduce: Inspect `features/target/lib/data`.
- Expected behavior: Targets and progress come from backend/sales data.
- Actual behavior: Static arrays drive all cards/charts.
- Root cause: No target API integration.
- Relevant files: `features/target/lib/data/index.ts`, `app/(dashboard)/rep/target/page.tsx`.
- Frontend fixable: No real data without API.
- Backend required: Yes.
- Risk: Sales target dashboard is not trustworthy.
- Recommended solution: Add target/progress API and replace static data.

### P2

**FE-P2-001**: Rep schedulable doctors can fail open if profile lookup fails. Route `/rep/visits/add`. Expected empty/error scoped list; actual can retain all doctors. Files: `features/doctors/api/index.ts`. Frontend fixable: yes. Backend required: no for fail-closed behavior, yes for authoritative scope.

**FE-P2-002**: Dashboard API failures can render as empty/partial data instead of explicit page-level errors. Routes `/manager`, `/rep`, `/supervisor`. Frontend fixable: yes.

**FE-P2-003**: Pharmacy update/delete frontend API wrappers are absent. Routes pharmacy pages. Backend required if endpoints do not exist.

**FE-P2-004**: Product images selected by users are stored as browser data URLs only. Routes product pages. Backend required for shared media.

**FE-P2-005**: Several filters operate over currently loaded server page, not guaranteed global results. Affects reports/products/some paginated catalogs. Frontend fixable by server-filtering or full-data loading.

**FE-P2-006**: Fixed large fetches such as team limit 1000 are not scalable. Routes manager visits/team. Backend/search pagination recommended.

**FE-P2-007**: No central 401/403 handling in `apiFetch`. Users can see generic failures/empty states instead of re-auth redirects. Frontend fixable.

**FE-P2-008**: Debug `console.log` remains in server/client API paths. Files include doctors, dashboard, forecast, requests, settings/archive. Frontend fixable.

**FE-P2-009**: Settings data management actions are console-only. Routes settings. Frontend/backend required depending desired behavior.

**FE-P2-010**: Supervisor visits reuse manager all-visits action. Backend must scope `/api/visits/all` by supervisor permissions. Frontend cannot verify security.

### P3

**FE-P3-001**: Archived report components contain console-only/dead interactions. Files under `features/reports/_archived`.

**FE-P3-002**: Several skeleton/loading lists use array index keys. Low risk because content is static placeholders.

**FE-P3-003**: Some display fallbacks use generic values like `"-"` or `"General"` where API data is absent. This can reduce clarity.

**FE-P3-004**: Some comments/text contain mojibake or stale wording around backend pending behavior. Documentation/copy cleanup recommended.

## 22. Backend Requirements

| Feature | Frontend behavior | Existing request | Expected data | Missing capability | Affected routes | Why frontend cannot solve safely |
| --- | --- | --- | --- | --- | --- | --- |
| Visit assignment | Sends `medicalRepId`, `supervisorId`, `visitType` | `POST /api/visits` | Assigned rep/supervisor/type separate from creator | Persist and return assignment | Visit add/list pages | Frontend cannot persist server ownership |
| Visit GPS | Captures browser location before submit | `POST /api/visits/visit-reports` without GPS | `completionLocation` with lat/lng/accuracy/capturedAt | Accept/store/return GPS | `/rep/visits/report`, reports | Compliance data must be server-side |
| Bulk import | Validates rows and prepares CSV | None | Row-level import result | Doctor/pharmacy import endpoints | Doctors/pharmacies | Browser cannot write database |
| Product update/delete | Stores local overrides/removals | None found | Updated/deactivated product | Patch/delete/deactivate endpoints | Product pages | LocalStorage is not shared/durable |
| Product images | Stores local data URLs | None found | Shared image URL/media record | Upload/media endpoint | Product pages | Browser storage is not durable |
| Target | Hardcoded target dashboard | None found | User target/progress/history | Target API | `/rep/target` | Static arrays are not real sales targets |
| Forecast detail/draft | Uses mock constants/local IDs | None for draft/detail found | Durable forecast detail/draft | Detail/draft endpoints if required | Forecast pages | Local draft cannot synchronize |
| Rep appraisal ack | Calls `PATCH /api/appraisals/:id`, handles 404 as pending | `PATCH /api/appraisals/:id` | Persist acknowledgement/comment | Endpoint support if missing | `/rep/appraisal` | Rep acknowledgement must persist |
| Supervisor all-visits scope | Uses all visits endpoint | `GET /api/visits/all` | Supervisor-scoped visits | Role-based server filtering | `/supervisor/visits` | Frontend route is not security |
| Server-filtered catalogs | Client filters loaded records | Mixed | Filtered total/count from backend | Query filters/pagination | Reports/catalogs | Client cannot search unloaded pages |

## 23. Frontend Fix Recommendations

1. Disable or relabel product edit/remove until backend persistence exists.
2. Make schedulable doctors fail closed when profile/scope cannot be resolved.
3. Add explicit dashboard error banners when API datasets fail.
4. Remove forecast mock draft/detail helpers from production paths or gate them as preview.
5. Remove target route from production navigation or label as sample until API exists.
6. Replace product local image overrides with backend-backed images once available.
7. Centralize 401/403 handling in `apiFetch`.
8. Remove debug logs from server actions.
9. Convert client-only filters over paginated data to backend query filters where correctness matters.
10. Add consistent retry UI for all page-level fetch failures.

## 24. Recommended Fix Order

A. P0 frontend: none confirmed.

B. P1 frontend:

- Product edit/remove UI truthfulness.
- Forecast mock/draft path removal or gating.
- Rep appraisal preview removal/gating.
- Target page production gating.

C. P0/P1 backend blockers:

- Visit assignment persistence.
- Visit GPS persistence.
- Bulk import persistence.
- Product update/delete/image persistence.
- Target API.

D. P2 frontend:

- Fail-closed schedulable doctors.
- Dashboard error banners.
- Central 401/403 handling.
- Debug log cleanup.
- Pagination/filter correctness.

E. P2 backend:

- Server-side filters for catalogs/reports.
- Scalable team/visit lookup endpoints.
- Pharmacy update/delete if required.

F. P3:

- Archived/dead UI cleanup.
- Fallback copy cleanup.
- Static skeleton key cleanup only where useful.

## 25. Regression Test Matrix

Authentication:

- Login valid Manager, Supervisor, Rep.
- Login invalid credentials.
- Logout clears cookie.
- Try wrong role route and verify redirect.
- Expired/invalid token redirects and backend rejects API.

Manager:

- Dashboard with all APIs healthy.
- Dashboard with one API failing.
- Create/edit/delete/inactivate doctor.
- Add pharmacy.
- Product add persists after refresh.
- Product edit/remove does not claim durable success unless backend supports it.
- Add manager/coaching visit for specific rep.
- Verify assigned rep sees assigned visit.
- Approve/reject plan.
- Upload sales file.
- Approve/reject request.
- Create coaching report.
- Create appraisal.
- View reports with date/search/sample filters.

Medical Rep:

- Dashboard healthy/failing.
- Scoped doctors/pharmacies with valid territory.
- Scoped doctors/pharmacies with missing profile/region.
- Add self visit.
- Complete visit with fresh GPS.
- GPS denied/timeout/unsupported preserves form.
- Report API failure preserves form.
- Create request with and without attachments.
- Create visit plan.
- Submit forecast.
- Verify target page is hidden/labeled until real API.
- Acknowledge appraisal and refresh.

Supervisor:

- Dashboard healthy/failing.
- Team list/detail.
- Add coaching visit.
- Create supervisor plan for rep.
- Approve/reject plan.
- Approve/reject request.
- Review forecast.
- Verify visits scope contains only authorized team visits.

Bulk import:

- Doctor valid `.csv`, `.tsv`, `.xlsx`, `.txt`.
- Pharmacy valid `.csv`, `.tsv`, `.xlsx`, `.txt`.
- Legacy `.xls` rejection.
- BOM and Arabic header/value handling.
- Duplicate rows.
- Missing required fields.
- Invalid geography hierarchy.
- Latitude without longitude and longitude without latitude.
- Reset and second upload.
- Error report and validated batch download.
- Backend import result once endpoint exists.

Commercial:

- Sales date/year/sheet/rep filters.
- Sales upload success/failure.
- Forecast approval/rejection with feedback.
- Forecast create no allocations error.
- Product search/category/price/date filters with pagination.

Accessibility/responsiveness:

- Keyboard open/close modals/drawers.
- Focus returns after dialogs.
- Mobile sidebar access.
- Tables scroll without hiding primary actions.
- Error messages associated with form fields.

## Validation Log

Validation commands required after this document is written:

```bash
npx tsc --noEmit
npm run lint
npm run build
git diff --check
git status
git diff --stat
git diff
```

Runtime testing:

- Authenticated runtime browser testing unavailable: no existing authenticated session/test credentials were provided.
- Static tracing was performed across routes, feature APIs, state flows, mocks, localStorage, and validation/persistence paths.

