# GolderaPharm Frontend Logic Audit

Date: 2026-09-29
Scope: `goldFront` only. No backend source files were modified.

## Executive summary

This audit covered the Manager and Medical Rep dashboards, route trees, server actions, API callers, local-only state, mocked data, visit/report/GPS flows, bulk import preparation, and the current Visits page work already present in the worktree.

The frontend is mostly wired to real backend APIs for the core CRM flows: users/team, doctors, pharmacies, visits, visit reports, plans, coaching reports, appraisal creation/listing, sales uploads, requests, forecast submission/approval, profile, and dashboards. The main risks are not broad fake data usage. They are specific business-critical persistence gaps where the UI can look complete before the backend contract exists or before a currently ignored field is stored.

Highest priority blockers:

1. Product edit/remove is local browser state, but the UI confirms it as successful product CRUD.
2. Manager/coaching visit assignment fields are sent by the frontend but the backend must persist `medicalRepId`, `supervisorId`, and `visitType` for cross-user scheduling to be reliable.
3. Visit completion GPS is required and validated in the report form, but is intentionally not submitted to the report endpoint yet.
4. Bulk import currently validates and prepares files only; database persistence requires a backend endpoint.
5. Rep appraisal preview/acknowledgement and forecast draft/detail paths still contain mock/local flows.

No trivial safe app-code fix was applied during this audit. The necessary fixes either require backend support or could change business behavior enough that they should be implemented deliberately.

## Audit coverage

### Manager routes audited

Count: 21 `page.tsx` routes.

| Route | Primary flow | API/data status |
| --- | --- | --- |
| `/manager` | Manager dashboard summary, tables, charts | Real APIs via aggregated dashboard loader; partial failures fall back per dataset |
| `/manager/appraisal` | Appraisal review list and creation | Real `/api/appraisals` for list/create |
| `/manager/coaching` | Coaching center and report creation | Real coaching report API for create; localStorage only for location history hints |
| `/manager/doctors` | Doctor list/actions | Real `/api/doctors` list/update/delete |
| `/manager/doctors/add` | Doctor create | Real `/api/doctors` |
| `/manager/doctors/[id]` | Doctor profile/detail | Real `/api/doctors/:id` |
| `/manager/forecast` | Forecast approval/overview | Real manager forecast endpoints for all/approve/reject |
| `/manager/hr` | Legacy/HR area | Route exists; should be checked before production exposure |
| `/manager/pharmacies` | Pharmacy list/create | Real list/create; update/delete not found in frontend |
| `/manager/plan` | Plan approval/management | Real `/api/plans`, approve/reject endpoints |
| `/manager/products` | Product catalog | Real list/create; edit/remove are local-only browser state |
| `/manager/profile` | Profile | Real profile/user APIs where used |
| `/manager/reports` | Visit reports/analytics | Real visit report list endpoints |
| `/manager/requests` | Team requests approval | Real manager team requests and patch actions |
| `/manager/sales` | Sales list/upload | Real sales list/upload endpoints |
| `/manager/settings` | Settings shell | Contains non-persistent placeholder actions in some settings widgets |
| `/manager/team` | Team list/add/edit/delete | Real manager user endpoints |
| `/manager/team/[id]` | Team member detail | Real user detail and derived team relation |
| `/manager/visits` | Manager visits planner | Real visits/team/products/doctors APIs; depends on backend assignment fields |
| `/manager/visits/add` | Manager/coaching visit create | Real create call; backend persistence for assignee fields must be verified/fixed |
| `/manager/[...catch]` | Catch-all | Routing fallback |

### Medical Rep routes audited

Count: 21 `page.tsx` routes.

| Route | Primary flow | API/data status |
| --- | --- | --- |
| `/rep` | Rep dashboard | Real dashboard API; page can render empty-state metrics when fetch fails |
| `/rep/appraisal` | Rep appraisal preview/acknowledgement | Preview/mock data and backend-pending acknowledgement path present |
| `/rep/coaching` | Rep coaching view | Reads coaching-related real data where wired |
| `/rep/doctors` | Assigned doctors | Real doctors API with frontend scope filtering in schedulable flows |
| `/rep/doctors/[id]` | Doctor profile/detail | Real doctor detail endpoint |
| `/rep/forecast` | Forecast list | Real `/api/forecasts` list |
| `/rep/forecast/new` | Forecast creation/submission | Submit is real; draft/create/detail helper paths are mock/local |
| `/rep/pharmacies` | Pharmacy list | Real pharmacy API |
| `/rep/plan` | Plan list/create | Real plan endpoints |
| `/rep/products` | Product catalog | Same product caveat: list/create real, edit/remove local-only |
| `/rep/profile` | Rep profile | Real profile/user APIs where used |
| `/rep/reports` | Rep reports | Real report endpoints where routed |
| `/rep/requests` | Request list | Real request APIs |
| `/rep/requests/new` | Request creation | Real `/api/requests` multipart/JSON flow |
| `/rep/sales` | Sales list | Real sales endpoints |
| `/rep/settings` | Settings shell | Some placeholder actions |
| `/rep/target` | Target page | Needs backend contract confirmation if production-critical |
| `/rep/visits` | Rep visits planner | Real `/api/visits`; report status depends on reports endpoint |
| `/rep/visits/add` | Rep visit scheduling | Real `/api/visits` create for self visits |
| `/rep/visits/report` | Visit report submission with GPS gate | Real report create, but GPS completion location is not persisted yet |
| `/rep/[...catch]` | Catch-all | Routing fallback |

## API and state model

### Central API transport

`services/http.ts` provides the common server-side `apiFetch` wrapper:

- Reads the `token` cookie and sends `Authorization: Bearer ...` when available.
- Defaults fetch cache to `no-store`.
- Sends `credentials: "include"`.
- Normalizes non-OK JSON errors when possible.
- Returns `undefined` for 204 and empty bodies.

Risks:

- There is no central 401/403 redirect or token refresh behavior; individual pages/actions decide how failed data appears.
- Malformed success JSON throws directly from `JSON.parse`, outside the normalized error branch.
- `Content-Type: application/json` is set by default even when actions override body types; multipart callers must explicitly override headers.

### Real API-backed feature areas

The following are materially connected to backend APIs:

- Auth/current user/profile.
- Manager dashboard aggregation.
- Rep dashboard API.
- Team/member list, detail, add, edit, delete.
- Doctors list, detail, create, update, delete/inactivate.
- Pharmacies list/create.
- Visits list/all/create.
- Visit reports list/all/create.
- Plan list/create/approve/reject/update.
- Coaching report create.
- Appraisal list/create.
- Sales list/upload.
- Requests list/create/approve/reject/update.
- Forecast list/submit/manager approval.
- Product list/create.

### Local-only and enhancement state

Local browser state is acceptable for UI preferences and hints, but not for durable CRM records.

| Area | Storage | Assessment |
| --- | --- | --- |
| Sidebar collapsed state | localStorage | Acceptable UI preference |
| Sales table columns | localStorage | Acceptable UI preference |
| Coaching visit location history | localStorage | Acceptable input enhancement |
| Product images | localStorage data URLs | Acceptable as temporary visual override only |
| Product edit overrides | localStorage | Not acceptable as durable product update |
| Removed product IDs | localStorage | Not acceptable as durable product delete/remove |

## Fake data, mock data, and backend-pending register

| ID | Area | Files | Behavior | Severity |
| --- | --- | --- | --- | --- |
| AUD-P1-001 | Products edit/remove | `features/products/components/AddProductDialog.tsx`, `features/products/components/ProductsList.tsx`, `features/products/lib/utils.ts` | Product add uses real API, but edit/remove write only to localStorage and show success toasts. Other users/devices/backend will not see those changes. | P1 |
| AUD-P1-002 | Manager/coaching visit assignment | `features/visits/api/index.ts`, `features/visits/components/AddVisitForm.tsx`, `features/visits/components/VisitsPlanner.tsx` | Frontend sends optional `visitType`, `supervisorId`, and `medicalRepId`; backend must store and return them. Without that, manager-created visits can appear under the wrong owner or be unreliably inferred. | P1 |
| AUD-P1-003 | Visit completion GPS persistence | `features/visits/components/VisitReportForm.tsx`, `features/visits/api/reports.ts` | Form requires a fresh verified geolocation before submit, but `createVisitReportAction` intentionally does not send `completionLocation` to the backend yet. | P1 |
| AUD-P1-004 | Bulk import persistence | `features/bulk-import/components/BulkImportDialog.tsx` | The frontend validates, previews, and prepares import files. It does not persist rows to the database and explicitly waits for a backend endpoint. | P1 |
| AUD-P1-005 | Forecast draft/detail mocks | `features/forecast/api/index.ts`, `features/forecast/lib/constants/index.ts`, `features/forecast/lib/utils/index.ts` | Forecast list/submission are real, but single forecast fetch and draft create still use `MOCK_FORECASTS`, `MOCK_DOCTORS`, and generated IDs. | P1 |
| AUD-P1-006 | Rep appraisal preview/acknowledgement | `app/(dashboard)/rep/appraisal/page.tsx`, `features/appraisal/components/rep/RepAppraisalClient.tsx` | Rep appraisal page can run in preview/mock mode and acknowledgement may surface "Backend integration pending". | P1 |
| AUD-P2-001 | Rep schedulable doctor scoping fail-open | `features/doctors/api/index.ts` | If profile/scope lookup fails, schedulable doctors can degrade to the broader `/api/doctors` result instead of closed/empty. | P2 |
| AUD-P2-002 | Dashboard partial error masking | `features/dashboard/components/manager/dashboard-data.ts`, `app/(dashboard)/rep/page.tsx` | Manager tracks dataset errors, but many UI stats can still look like empty data. Rep dashboard sets `dashboardData = null` on failure, which can produce zero/empty displays. | P2 |
| AUD-P2-003 | Pharmacy update/delete absent | `features/pharmacies/api/index.ts` | List/create are real; update/delete APIs were not found in the frontend. If the UI implies full CRUD, backend/frontend work remains. | P2 |
| AUD-P2-004 | Product image persistence | `features/products/lib/utils.ts` | User-selected images are local data URLs only. They are not shared across browsers/users. | P2 |
| AUD-P2-005 | Team/visit filter cap | `app/(dashboard)/manager/team/page.tsx`, `app/(dashboard)/manager/visits/page.tsx` | Some manager pages request up to 1000 team records. Large organizations need pagination/search-backed selection. | P2 |
| AUD-P2-006 | Debug logging in server/client actions | `features/doctors/api/index.ts`, `features/dashboard/api/index.ts`, `features/forecast/api/index.ts`, `features/requests/api/index.ts`, settings/report archived files | Console output can expose payloads/noise in production logs. | P2 |
| AUD-P3-001 | Settings placeholders | `features/settings/components/DataManagement.tsx` | Export/delete actions log to console only. | P3 |
| AUD-P3-002 | Archived report components | `features/reports/_archived/*` | Archived components contain console-only handlers and lint warnings. | P3 |

## Critical flow notes

### Visits scheduling

Rep self-scheduled visits use the real visits create action and should persist as long as `/api/visits` accepts the standard `doctorId`, `samples`, `date`, `time`, and `notes` payload.

Manager/coaching scheduling is only fully correct if the backend accepts and returns:

- `visitType`
- `medicalRepId`
- `supervisorId`
- assignee/user relation separate from `createdBy`

The current frontend already maps optional assignment fields and the manager planner attempts to infer a rep from `medicalRepId`, `medicalRep`, or `userId`. That inference is a compatibility shim, not a substitute for a real backend contract.

### Visit reports and GPS

Frontend behavior:

- The report form uses browser geolocation.
- Submission is blocked until a verified, fresh location exists.
- Form state is preserved on failures.
- Success toast/navigation only occurs after `createVisitReportAction` succeeds.

Backend gap:

- `completionLocation` is prepared but not sent to `/api/visits/visit-reports`.
- The frontend has no server-side proximity validation.
- The backend should persist latitude, longitude, accuracy, captured time, and optionally distance-to-expected-location.

Recommended backend contract:

```json
{
  "visitId": "visit_id",
  "duration": "30",
  "rating": 5,
  "discussedTopics": ["topic"],
  "doctorFeedback": "text",
  "visitPurpose": "text",
  "notes": "text",
  "samplesProvided": [{"productId": "product_id", "quantity": 2}],
  "completionLocation": {
    "latitude": 24.7136,
    "longitude": 46.6753,
    "accuracy": 25,
    "capturedAt": "2026-09-29T10:00:00.000Z"
  }
}
```

### Plans and visit generation

Plan create, list, approve, reject, and status update flows are real API calls. If approving a plan should create visits, that must remain backend-owned so visits are created atomically and consistently. The frontend should only refresh and display returned/derived state after the backend confirms success.

### Bulk import

The bulk import dialog supports spreadsheet/text parsing, row validation, preview, filtering, template download, and export of prepared valid rows. It is honest about backend scope through copy that says database persistence will become available when the backend endpoint is connected.

Required backend work:

- Add bulk import endpoints for doctors and pharmacies, or a generic typed import endpoint.
- Return row-level success/failure results.
- Support duplicate detection by stable unique fields.
- Accept the frontend's normalized payload shape or publish a strict schema.

### Product catalog

The catalog currently mixes real and local-only behavior:

- List: real `/api/products`.
- Create: real `POST /api/products`.
- Edit: localStorage override only.
- Remove: localStorage hidden ID only.
- Images: API image fields are honored, but user-uploaded image overrides are localStorage data URLs.

Recommended product endpoints:

- `PATCH /api/products/:id` for name/internalRef/salesPrice and metadata.
- `DELETE /api/products/:id` or `PATCH /api/products/:id { isActive: false }`.
- Product image upload endpoint or shared media field.

Until those exist, product edit/remove UI should be labeled as local-only or disabled for production roles.

### Forecast

Connected:

- `GET /api/forecasts`
- `POST /api/forecasts`
- manager all/approval endpoints in forecast management API
- products and doctors used by forecast submission are fetched from real feature APIs

Not fully connected:

- `fetchForecastById` uses `MOCK_FORECASTS`.
- `createForecastAction` creates a local/generated draft.
- Some stats utilities still use `MOCK_PRODUCTS`.

### Appraisal

Manager appraisal list/create uses real `/api/appraisals`. Rep appraisal still has preview behavior and an acknowledgement path that can report backend integration pending. Production readiness needs a real rep appraisal endpoint and acknowledgement/comment persistence.

## Backend requirements

### Must-have backend changes

1. Persist cross-user visit assignment fields:
   - Accept `visitType`, `medicalRepId`, and `supervisorId` on visit create.
   - Store the assigned rep separately from the creator.
   - Return assignee fields on `/api/visits` and `/api/visits/all`.
   - Enforce role permissions server-side.

2. Persist visit completion location:
   - Accept `completionLocation` on visit report create.
   - Validate shape, freshness, and permission.
   - Store and return location on visit/report reads.
   - Optionally compute distance from doctor/pharmacy coordinates.

3. Add bulk import persistence:
   - Doctor import endpoint.
   - Pharmacy import endpoint.
   - Row-level validation response.
   - Duplicate handling and transactional safety.

4. Add product update/remove/image persistence:
   - Product patch endpoint.
   - Product deactivate/delete endpoint.
   - Product image persistence endpoint or API field.

5. Complete rep appraisal backend:
   - Current rep appraisal list/detail.
   - Acknowledge appraisal with optional rep comment.
   - Return acknowledged state.

6. Complete forecast draft/detail backend:
   - Forecast detail endpoint.
   - Draft create/update if drafts are a product requirement.
   - Remove mock constants from production paths.

### Frontend follow-up after backend support

- Remove compatibility inference for visit assignee where possible.
- Send `completionLocation` from `createVisitReportAction`.
- Replace product localStorage overrides with server actions.
- Replace forecast mock detail/draft actions with real API calls.
- Replace rep appraisal preview mode with real data.
- Add explicit error banners on dashboards when datasets fail.
- Remove production `console.log` statements.

## Validation and test plan

### Static validation to run

From `goldFront`:

```bash
npx tsc --noEmit
npm run lint
npm run build
git diff --check -- goldFront
```

### Manual QA checklist

Manager:

- Log in as manager.
- Open dashboard and verify any API failure appears as an error, not only zero data.
- Create a doctor, edit it, inactivate/delete it, and refresh.
- Create a pharmacy and refresh.
- Add a product, refresh, and verify it persists.
- Attempt product edit/remove and confirm current behavior is either backend-persistent or clearly marked local-only.
- Create a manager/coaching visit for a specific rep and supervisor.
- Log in as that rep and verify the assigned visit appears.
- Approve/reject a plan and verify generated visits if that is expected behavior.
- Approve/reject a request.
- Upload sales data and refresh.
- Create a coaching report.
- Create an appraisal.
- Review forecast approvals.

Medical Rep:

- Open rep dashboard with valid data and with simulated API failure.
- Create a self visit and refresh.
- Submit a visit report with location allowed.
- Submit a visit report with location denied and confirm the form blocks submission without data loss.
- Verify completed visit cards show location only after backend supports returned completion location.
- Create and submit a forecast.
- Verify forecast draft/detail paths do not use mock data before production.
- Submit a request with attachments.
- Create a plan and verify manager/supervisor visibility.
- Check appraisal acknowledgement persistence after refresh.

Bulk import:

- Upload valid doctor CSV/XLSX.
- Upload invalid rows and verify row-level errors.
- Export valid rows.
- Confirm no UI claims database import until backend persistence exists.
- After backend endpoint exists, verify partial failure and duplicate handling.

## Audit findings count

| Category | Count |
| --- | ---: |
| Manager routes audited | 21 |
| Medical Rep routes audited | 21 |
| P0 blockers | 0 |
| P1 blockers | 6 |
| P2 issues | 6 |
| P3 cleanup items | 2 |
| Business-significant local/mock/backend-pending areas | 6 |
| Frontend source files changed by this audit | 0 |
| Documentation files added by this audit | 1 |

## Handoff checklist

- [x] Preserved existing uncommitted frontend work.
- [x] Did not modify backend code.
- [x] Identified real API-backed flows.
- [x] Identified mock/local-only/backend-pending flows.
- [x] Audited Manager route tree.
- [x] Audited Medical Rep route tree.
- [x] Documented top production blockers.
- [x] Documented backend requirements.
- [x] Documented manual QA checklist.
- [ ] Backend contracts implemented for P1 blockers.
- [ ] Frontend follow-up patches completed after backend contracts exist.
- [ ] End-to-end browser QA completed with Manager and Rep credentials.
