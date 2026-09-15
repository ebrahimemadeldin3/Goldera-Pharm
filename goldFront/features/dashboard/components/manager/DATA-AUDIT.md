# Manager dashboard data audit

## Existing dashboard

The previous /manager composition requested eleven datasets, showed six KPIs,
a welcome banner and thirteen analytical/action panels. Search and status filters
did not apply uniformly. Dates mixed local and Saudi calendars. A failed sales
request could leave partial rows available for totals; errors were a page-wide
notice. Rep sales were inferred from customer names and pharmacy subregions,
which does not establish sales ownership. The loading view was a shared skeleton.
Recharts 2.15.4 is already installed. ManagerDashboard has only one route consumer;
Rep and Supervisor use their own compositions and shared legacy components.

## Availability map (before implementation)

| Source    | Existing frontend access                         | Available and derivable                                                                                    | Limitations / decision                                                                                                                          |
| --------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Sales     | fetchSales, /api/sales                           | ID, customer, product, quantity, untaxed amount, order date; totals and dated series                       | No documented rep/territory ID or target. Do not infer ownership. Audit timestamps are not sale dates.                                          |
| Visits    | fetchAllVisits, /api/visits/all                  | Date, time, status, doctor, userId, optional medicalRepId; completion rate and rep completed-visit ranking | Preserve raw assignments; createdBy is not necessarily the rep. UI mapper supplies placeholder location, so omit location.                      |
| Team      | getManagerTeam, /api/managers/team by role       | ID, name, role, isActive, region/subregion; active/total counts                                            | Current account status, not historical activity. No documented sales/targets in raw response.                                                   |
| Coaching  | getAllCoachingReports, /api/coaching-reports/all | visitDate, performanceRating, rep, feedback; valid-rating mean and distribution                            | Use raw dated reports, not formatted display dates or page-level average. Valid ratings are 1-5 integers.                                       |
| Appraisal | getAppraisals, /api/appraisals                   | period, 18 criteria, rep; mean score and score bands                                                       | Fallback only; require every criterion to be a finite 0-100 score. Filter by appraisal period.                                                  |
| Products  | getProductsAction, /api/products                 | Name, internal reference, sales price, timestamps                                                          | Current contract has no category/image. Product names already accompany sales; no extra dashboard request.                                      |
| Plan      | getManagerPlansAction                            | Planned dates, status, targets, creator, doctor subregion/area                                             | Plan UI uses an existing static territory lookup. It cannot reliably join all dashboard datasets; no global geography filter. No extra request. |

## Widget map

| Widget                               | Classification                      | Scope                                                                                                 |
| ------------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Total sales                          | FRONTEND DERIVED from REAL API DATA | Selected period; untaxed SAR, missing amounts excluded and counted                                    |
| Completed visits                     | FRONTEND DERIVED from REAL API DATA | Selected visit dates; all statuses in completion denominator                                          |
| Active team                          | FRONTEND DERIVED from REAL API DATA | Explicitly Current, only isActive === true                                                            |
| Quality KPI                          | FRONTEND DERIVED from REAL API DATA | Coaching by visit date; appraisal fallback by period; scheduled visits when neither has valid scores  |
| Sales trend                          | FRONTEND DERIVED from REAL API DATA | Only actual dated, valued sales; no audit-date fallback                                               |
| Visit status                         | FRONTEND DERIVED from REAL API DATA | Counts and percentages from selected visits                                                           |
| Rep ranking                          | FRONTEND DERIVED from REAL API DATA | Explicit medicalRepId, else userId matched to known medical reps; exclude unresolved assignments      |
| Quality distribution                 | FRONTEND DERIVED from REAL API DATA | Valid coaching ratings, else complete appraisals; omit if both empty                                  |
| Recent sales / visits                | REAL API DATA                       | Six rows, real dates; upcoming visits explicitly Current and independent of historical filter         |
| Quick actions                        | Existing routes                     | Six Manager navigation shortcuts                                                                      |
| Global territory, target achievement | EXCLUDED                            | Requires backend change — excluded from current scope. Reliable cross-dataset IDs/targets are absent. |
| Growth comparisons, sparklines       | EXCLUDED                            | Not needed for the chosen dashboard; no fabricated comparisons or time series                         |
| Mock business values                 | EXCLUDED                            | No fixtures in production flow                                                                        |

## Implementation boundaries

Only /manager composition, its exact-path loading variant, and Manager-local
components are edited. Existing fetch functions, API contracts, shared styling,
authentication, backend, and other pages are unchanged. Complete paginated
datasets are required; a failure or incomplete page sequence becomes a local
dataset error. Retry uses the existing Next router refresh to refetch the page.
Saudi calendar utilities define all date boundaries (Sunday-start weeks as on
Sales). Missing dates stay out of dated views and remain visible in All Time.

## Verification

- TypeScript: passed (`npx tsc --noEmit`).
- ESLint: full frontend passed with 12 existing warnings; changed files passed
  with zero warnings/errors after correcting the test loader's local variable.
- Production build: passed, including /manager and all existing role routes.
- Automated checks: 12 passed with
  `node --test features/dashboard/components/manager/_tests/dashboard.test.cjs`.
  Covers Saudi boundaries, empty datasets, missing amounts/dates, negative sales,
  real timestamp sorting, rep assignments, coaching/appraisal fallback,
  six-row limits, server rendering, capped pagination, and partial fetch failure.
- Fixtures exist only inside the test file. No production mocks were added.
- Source regression check: no diff in Rep/Supervisor pages, their dashboard
  components, backend, shared styles, or existing API modules.
- Live route check: /manager returns the expected 307 sign-in redirect without
  a session. Authenticated real-data loading remains unverified.
- Browser runtime returned no connected browsers. Desktop/tablet/mobile
  screenshots, pointer/keyboard interaction and rendered chart pixels could not
  be verified. Responsive breakpoints and semantic markup were checked in code;
  server-render tests cover empty, populated, partial-error and loading states.

## Changed files

- `app/(dashboard)/manager/page.tsx`
- `app/(dashboard)/manager/loading.tsx` (exact dashboard path only)
- `features/dashboard/components/manager/ManagerDashboard.tsx`
- `features/dashboard/components/manager/DashboardPrimitives.tsx`
- `features/dashboard/components/manager/DashboardCharts.tsx`
- `features/dashboard/components/manager/DashboardTables.tsx`
- `features/dashboard/components/manager/dashboard-data.ts`
- `features/dashboard/components/manager/dashboard-types.ts`
- `features/dashboard/components/manager/dashboard-utils.ts`
- `features/dashboard/components/manager/manager-dashboard.module.css`
- `features/dashboard/components/manager/_tests/dashboard.test.cjs`
- `features/dashboard/components/manager/DATA-AUDIT.md`
