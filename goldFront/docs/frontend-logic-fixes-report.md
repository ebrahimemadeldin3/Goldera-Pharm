# GolderaPharm Frontend Logic Fixes

## Scope

- Manager + Medical Rep frontend flows.
- Frontend only.
- Supervisor excluded.
- GPS/location tracking excluded.
- Backend changes excluded.

## Fixed Issues

### Issue
Add Visit could retain hidden assignee fields after changing visit type.

### Root Cause
React Hook Form retained `supervisorId` and `medicalRepId` values after their controls were hidden.

### Files Changed
`features/visits/components/AddVisitForm.tsx`

### Solution
Added a visit-type assignee validity model, clears/unregisters invalid assignee fields, clears hidden-field errors, sanitizes submit values, and synchronizes external doctor/date defaults without overwriting unrelated user edits.

### Verification
Checked the form state lifecycle in code and ran TypeScript, lint, and build.

### Status
FIXED

## Products

### Add
Product creation still uses the existing real `createProductAction` and refreshes after success.

### Edit
No real existing update mutation was found. Edit actions are unavailable.

Status: BACKEND REQUIRED

"Requires backend change — excluded from current frontend-only scope."

### Remove
No real existing delete mutation was found. Remove actions are unavailable.

Status: BACKEND REQUIRED

"Requires backend change — excluded from current frontend-only scope."

### Image
No real existing image mutation was found. Browser-local image persistence was removed from business state and image upload is marked unavailable.

Status: BACKEND REQUIRED

"Requires backend change — excluded from current frontend-only scope."

### Search
Manager and Rep product pages now use the existing `paginate=false` product fetch path, so search runs against the same loaded catalog dataset used by counts and rendering.

### Filters
Category, price, and date filters run against the full fetched product catalog.

### Pagination
Pipeline: SOURCE DATA -> SEARCH -> FILTERS -> SORT -> PAGINATION -> RENDER.

The catalog now paginates the filtered array locally, so result count, current page, rows, and footer are compatible.

## Add Visit

- Visit type determines the only valid assignee field.
- `MANAGER` visit type keeps `supervisorId`.
- `COACHING` keeps `medicalRepId`.
- `CHECK` keeps neither assignee field.
- Hidden assignee fields are cleared, unregistered, and excluded from submit state.
- Doctor/date external defaults are synchronized only when the external source changes and the current user-entered field is empty or still matches the previous external default.

## Forecast

Real forecast list and submit flows remain backed by existing API actions. Mock detail and draft helpers no longer fabricate forecast records or fake IDs.

Status: PARTIAL

"Requires backend change — excluded from current frontend-only scope."

## Rep Appraisal

Rep appraisal loading and acknowledgement use the existing real frontend API path. Preview/mock data and local acknowledgement state were removed, so acknowledgement state changes only after the real action succeeds.

Status: FIXED

## Manager Plan

No existing global search/filter query contract was found. Manager Plan filters remain loaded-page scoped, but the UI now states the loaded-page scope and the footer/count switches to the filtered loaded-page count when filters/search/sort are active.

Pipeline: SOURCE DATA -> SEARCH -> FILTERS -> SORT -> PAGINATION -> RENDER.

Status: PARTIAL

## Dashboard

Manager dashboard already distinguished dataset errors with partial data. Rep dashboard now shows an explicit load failure banner when the dashboard request fails, so failed data does not silently appear as legitimate zero/empty metrics.

Status: FIXED

## Authentication Cleanup

Remember Me was removed because the frontend has no backend-supported session-duration control. Forgot Password was removed because no recovery route exists.

Status: BACKEND REQUIRED

"Requires backend change — excluded from current frontend-only scope."

## Validation Results

TypeScript: PASS

Lint: PASS WITH WARNINGS

Build: PASS

git diff --check: PASS

## Remaining Frontend Issues

- Product edit/remove/image operations remain backend-required.
- Forecast draft/detail persistence remains backend-required.
- Manager Plan global filtering remains backend-required unless the API gains compatible query support.
