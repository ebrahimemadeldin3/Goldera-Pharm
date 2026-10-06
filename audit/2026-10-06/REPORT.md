# Doctor/pharmacy actions, visit limits, and manager performance

Implemented locally on 6 October 2026. No deployment or database migration is required for these changes.

- Manager doctor cards and profiles show Edit and Delete controls. Edit opens the existing profile editor. Optional fields can be cleared; Arabic-only names and incomplete records remain editable. Doctor deletion prevents removal of records referenced by visits, plans, coaching or requests, with an explanation directing the manager to deactivate the doctor.
- Manager pharmacy rows, mobile cards and details show Edit and Delete buttons. Changes use the existing authenticated PATCH/DELETE APIs. Renaming a pharmacy updates its sales customer references in the same transaction. Ambiguous duplicate-name sales assignments return a conflict. Referenced pharmacies remain protected from deletion.
- The configured `targetVisits` is treated as a maximum number of visits per plan. Both rep and supervisor schemas reject excess assignments and fractional targets. Rep weekly/monthly selection prevents assigning new doctors after the limit, while allowing removal or rescheduling existing assignments. Lowering the target below the current assignment count blocks submission. The API validates the limit when creating plans and when approving older plans. Repeated doctor/date assignments are rejected; separate dates for the same doctor are preserved.
- The manager dashboard UI, data loading, metrics, types and added API endpoint were restored to their prior versions at the user’s request. Doctor/pharmacy and visit-limit changes remain in place.
- Fixed a browser crash in plan rendering when older snapshots or Arabic-only doctors lack an English name.

Verification:

- Before the dashboard rollback, 17 real API/Prisma workflow checks passed against a fresh in-memory PostgreSQL-compatible PGlite database. The original operational database was not used. See `workflows-results.json`.
- Before the dashboard rollback, 16 frontend regression checks passed, including date/rep filtering, failure states, plan quota schemas and missing doctor names. See `dashboard-tests.log`.
- TypeScript, ESLint for all changed frontend files, backend syntax and production build passed. See `build.log` and `lint.log`.
- Browser: edited doctor name/patient count and pharmacy city saved and displayed; doctor deletion confirmation opened and cancelled; representative plan accepted 10 visits, disabled the 11th, blocked submission after lowering the target to 9, retained count when rescheduling, freed capacity on removal, and successfully submitted a replacement 10-visit plan. See `browser-checks.json` and PNG evidence.
- Temporary QA servers on ports 3002/5052/55439 were stopped after verification. Original servers on 3000/5050 were preserved. Next.js temporary TypeScript configuration additions were removed.

The quota implementation follows the visit count configured in each plan. It does not introduce a separate daily visit quota.

Rollback verification: dashboard-only regression tests and API test cases were removed; the plan quota and missing-name tests were preserved. Earlier build/API logs are historical evidence from before the rollback.
