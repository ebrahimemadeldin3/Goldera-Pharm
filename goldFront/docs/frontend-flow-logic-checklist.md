# Frontend Flow Logic Checklist

Re-audit date: 2026-09-30

This checklist reflects the current post-fix frontend state of the GolderaPharm pharmaceutical CRM. It supersedes the earlier pre-fix checklist for Manager, Medical Rep, and shared/auth flows.

## Scope Rules

- In scope: Manager routes, Medical Rep routes, shared/auth frontend behavior, and frontend-only cross-role components used by those roles.
- Out of scope for this pass: Supervisor-specific issues, GPS/geolocation/location tracking issues, and backend implementation work.
- Backend-required but honestly disabled or clearly messaged frontend behavior is not counted as a frontend failure.
- Browser/runtime interaction testing was not performed in this pass; source-level and build-level verification were performed.

## Route Inventory

| Area | Route count | Status |
| --- | ---: | --- |
| Manager pages | 21 | Audited |
| Medical Rep pages | 21 | Audited |
| Shared/Auth pages | 1 | Audited |
| Supervisor pages | 19 | Inventoried only; excluded |
| Total app pages inventoried | 62 | Counted from `goldFront/app/**/page.tsx` |

## Current Result Summary

| Metric | Count |
| --- | ---: |
| Original FE-FLOW IDs re-checked | 18 |
| Original IDs or role portions excluded by current scope | 4 |
| Current counted frontend failures | 0 |
| New frontend flow problems discovered | 0 |
| Backend-required / frontend-honest items | 6 |
| P0 current problems | 0 |
| P1 current problems | 0 |
| P2 current problems | 0 |
| P3 current problems | 0 |

## Current Problems

No current Manager, Medical Rep, or shared/auth frontend flow failures are counted in this pass.

## Previous Issue Disposition

| ID | Previous concern | Current status | Current disposition |
| --- | --- | --- | --- |
| FE-FLOW-001 | Add Visit could submit stale hidden assignee values | PASS | Manager form now unregisters/clears hidden assignee fields and sanitizes submit payload. Supervisor portion excluded. |
| FE-FLOW-002 | GPS/geolocation behavior | EXCLUDED | Location/GPS issues are excluded from this pass. |
| FE-FLOW-003 | Product add/edit/remove/image used local browser persistence | PASS | Add Product now uses `createProductAction`; edit/remove/image update are disabled or messaged as backend-required. No product localStorage persistence remains. |
| FE-FLOW-004 | Forecast draft/detail flows used mock success | PASS | Draft create/detail fetch now return backend-required errors. Submit-for-approval still uses the real `/api/forecasts` path. |
| FE-FLOW-005 | Rep appraisal preview mode and local acknowledgement | PASS | Preview data is no longer wired into the page. Acknowledgement calls the real action and only updates UI after success. |
| FE-FLOW-006 | Products filtering/pagination contradicted backend pagination | PASS | Manager and Rep product pages request unpaginated data, then filter and paginate locally from that loaded set. |
| FE-FLOW-007 | Supervisor directory flow issues | EXCLUDED | Supervisor-specific issue excluded. |
| FE-FLOW-008 | Manager Plans filters appeared global while operating on one loaded page | PASS / BACKEND REQUIRED | The UI now describes loaded-page scope and keeps filtered pagination local. True global search/filter requires backend support and is not counted as a frontend failure. |
| FE-FLOW-009 | Supervisor Add Visit stale hidden fields | EXCLUDED | Supervisor-specific issue excluded. |
| FE-FLOW-010 | Rep dashboard API failure looked like empty data | PASS | Rep dashboard now renders an explicit error banner with retry affordance when dashboard loading fails. |
| FE-FLOW-011 | Plan creation/detail selected-doctor/date scope confusion | PASS / PARTIAL SCOPE | No current Manager/Rep frontend failure counted. Supervisor-specific portion excluded. |
| FE-FLOW-012 | Bulk import implied persistence beyond frontend scope | PASS / BACKEND REQUIRED | Bulk import remains honest about backend requirement and is not counted as a frontend failure. |
| FE-FLOW-013 | Remember Me UI implied unsupported session behavior | PASS / BACKEND REQUIRED | Remember Me was removed from the login form and schema. Session-duration control remains backend-required. |
| FE-FLOW-014 | Add Visit default/preselected doctor/date sync could overwrite dirty input | PASS | Default sync now preserves dirty user edits and only fills safe empty/prior-default fields. |
| FE-FLOW-015 | Forgot Password link was a dead `#` route | PASS / BACKEND REQUIRED | Forgot Password link was removed. Recovery flow remains backend-required. |
| FE-FLOW-016 | Skeleton/static loading state mismatch | PASS | No counted Manager/Rep flow failure remains. |
| FE-FLOW-017 | Potential mojibake/encoding artifacts | PASS | UTF-8 source check found proper bullet/en dash/em dash characters and no actual `â`, `Ã`, `Â`, or replacement-character mojibake in app/feature/component TS/TSX files. |
| FE-FLOW-018 | Settings Data Management console-only actions | PASS / BACKEND REQUIRED | Export and delete actions are disabled and titled with backend-required wording. No console-only action remains there. |

## Backend-Required But Frontend-Honest

These items require backend changes and are excluded from current frontend failure totals because the frontend no longer fakes success or persists business data locally.

| Area | Current frontend behavior |
| --- | --- |
| Product edit/remove/image upload | Disabled or explicitly messaged as `Requires backend change — excluded from current frontend-only scope.` |
| Forecast draft create/detail fetch | Returns backend-required errors instead of mock success/detail data. |
| Manager Plan global search/filter | Current UI is honest about loaded-page scope; global behavior requires backend query support. |
| Auth Remember Me/session duration | Remember Me UI removed; configurable session duration requires backend/auth support. |
| Auth Forgot Password | Dead link removed; recovery requires backend route/API. |
| Settings export/delete | Buttons disabled and titled as backend-required. |

## localStorage / Browser Persistence Classification

| Usage | Classification | Notes |
| --- | --- | --- |
| Sidebar collapse state | UI preference | Acceptable, non-business persistence. |
| Sales table column preferences | UI preference | Acceptable, non-business persistence. |
| Coaching location history | Enhancement/local convenience | GPS/location-tracking scope is excluded from this pass. |
| Product catalog changes | Business persistence | No localStorage business persistence found. |
| Forecast draft/detail data | Business persistence | No mock/local business persistence remains for audited flows. |
| Rep appraisal acknowledgement | Business persistence | No local-only acknowledgement remains. |

## Flow Notes

### Add Visit

- Manager `MANAGER` visit type only submits `supervisorId`.
- Manager or Supervisor `COACHING` visit type only submits `medicalRepId`; Supervisor-specific behavior is not counted in this pass.
- Hidden assignee fields are cleared, errors cleared, and fields unregistered before submit.
- Submit payload is sanitized as a final guard.
- Preselected doctor/date sync avoids overwriting dirty user changes.

### Products

- Manager and Rep product pages call `getProductsAction(undefined, undefined, false)`.
- Search/filter/pagination use the loaded product array consistently.
- Product images come from API/official image helpers only.
- Product edit/remove/image actions no longer fake persistence.

### Forecast

- Mock detail/draft success is removed from the server action path.
- Submit forecast remains a real backend POST path.
- Forecast constants may still exist for utility/static display support, but audited submit/draft/detail flows do not use mock success as business persistence.

### Rep Appraisal

- Rep appraisal page uses `getRepAppraisalReviewsAction`.
- Preview mode is not wired into the page.
- Accept acknowledgement calls `acknowledgeAppraisalAction` and only mutates displayed review state on successful backend response.

### Manager Plans

- Loaded-page filtering/sorting is explicitly represented in UI copy and pagination.
- Global filtering across all plans remains backend-required.

### Auth

- Login schema and form no longer include `remember`.
- Forgot Password dead link is removed.
- Login remains tied to the existing backend/auth cookie behavior.

### Settings Data Management

- Export and account/data deletion actions are disabled with backend-required messaging.
- No console-only success path remains in this component.

## Validation

- `npx.cmd tsc --noEmit`: PASS.
- `npm.cmd run lint`: PASS with 5 existing warnings.
- `npm.cmd run build`: PASS after rerun with network access for Google Fonts. The first sandboxed build failed only because `next/font` could not fetch Barlow from `fonts.googleapis.com`.
- `git diff --check`: PASS. Git reported line-ending normalization warnings for existing modified source files, but no whitespace errors.

