# Manager dashboard verification — 6 October 2026

## Delivered behavior

The manager route now renders a navy/gold performance overview matching existing manager flow tokens. Every business value comes from the authenticated overview API and actual PostgreSQL/Prisma queries. Date, representative, district, region and territory filters apply real scope. Directory and HR widgets explicitly describe current records; workflow queue counts stay current independently of historical date filters.

## Root cause and repair

Imported records often share createdAt. Offset pagination ordered by that field alone repeated ten doctor IDs on the second page and ten visit IDs on the fifth page. The shared API query builder now adds a unique id tie-breaker. Read-only verification collected all 425 doctors and 1,843 visits without duplicates. The new dashboard uses direct aggregates rather than full-record pagination.

Seven independent source transactions preserve each section's total/chart consistency and isolate failures. Unavailable data is shown as unavailable, never fabricated zeros. Retry and Refresh make new authenticated requests.

## Automated evidence

- 28 isolated API checks passed: existing doctor/pharmacy/plan behavior plus 13 overview checks covering SQL-backed counts, charts, representative ownership, geography, Saudi midnight, invalid dates, authorization, cross-territory activity and partial source failure/recovery.
- 19 frontend/calendar/plan checks passed, including 5 tests for the new overview, unavailable sources, full failures, session recovery and calendar presets.
- 2 shared stable-ordering tests passed.
- TypeScript and ESLint passed for the dashboard route and new components.
- Production Next.js build passed with a separate output directory.
- Read-only aggregate checks against the configured database returned ready for all seven sections. No configured-database records were created, edited or deleted for this task.

## Browser evidence

The browser exercised an isolated, in-memory SQL database through the actual frontend, API and Prisma query path. Screenshots contain synthetic QA records, not production values.

- Region Western: sales 50, one visit, one doctor; reset restored company totals.
- Representative WestRep: two recorded visits and company sales 150 with the sales-owner limitation disclosed.
- WestRep + Central: one recorded cross-territory visit remains in performance despite a different current assignment.
- January 2025: no recorded sales/visits, unavailable completion percentage, current team/directory/approval queue retained.
- A coaching outage kept sales/visits/appraisal available; Retry restored the 3.5/5 coaching value.
- A complete API outage hid business values; Retry restored all sections.
- Performance sorting changed row order; View team navigated to the working team page.
- Desktop 1280px and mobile 390px had matching document/viewport widths; mobile controls and cards remained legible.
- No browser console errors. Existing logo aspect-ratio warnings and development Fast Refresh notices were present outside the new dashboard logic.

Evidence: 01-before.png (old dashboard on QA), 02-after-desktop.png, 03-after-analytics.png and 04-after-mobile.png; api-tests.log and live-read-check.log. Main preview remains http://localhost:3000/manager.

## Data limits

Sales currently have no representative owner. Company totals remain company totals; geography uses unique, exact pharmacy/customer matches. Ambiguous or unmatched customer records are disclosed and excluded from geographic attribution. Employee and directory assignments are current because historical assignment data is not stored. These limitations are explained in the UI and the DATA-MAP.md contract.

## Filter UI follow-up

The five reporting filters now reuse the existing Radix/shadcn Select with a white menu, navy text, gold selection, consistent spacing and a visible checkmark. Long labels wrap within options and truncate in the closed control with the full title available. Menus remain within the viewport and scroll when needed. Only filter presentation changed; API scope and values are unchanged.

TypeScript, targeted ESLint and five existing overview tests passed. Browser checks verified representative selection and Apply, Reset, keyboard district selection, full representative names, and a 390px mobile menu within screen bounds. No browser errors. Screenshots 05-filter-dropdown.png and 06-filter-dropdown-mobile.png use synthetic QA data. Temporary QA servers were stopped after verification.
