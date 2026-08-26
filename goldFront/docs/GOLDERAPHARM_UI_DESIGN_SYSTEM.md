# GolderaPharm UI Design System

Status: v1 established on 2026-08-25.

This is the source of truth for GolderaPharm CRM frontend UI work. It captures the current strongest product language, the existing drift, and the rules future pages and agents should follow. It is intentionally based on the existing app instead of inventing a new brand direction.

## Scope And Guardrails

- Scope: frontend UI, UX, layout, accessibility, responsive behavior, shared component decisions, and design tokens.
- Out of scope: backend APIs, data contracts, permissions, roles, routing behavior, and business logic.
- Existing pages must not be redesigned just because this document exists. Apply this system when touching a page for a real task or when an explicit migration task is requested.
- Page personality is allowed. Products can keep an image-led catalog feel, Visits can keep planner/calendar language, Sales can keep dense analysis controls, and Forecast can keep approval/workflow emphasis.
- Shared structure should come from tokens and shared components. Page-specific storytelling should stay local.

## Source Order

1. This document defines design decisions and migration rules.
2. `styles/globals.css` defines the additive `--gp-*` CSS token layer and Tailwind `gp-*` aliases.
3. Shared primitives in `components/ui` define interaction, accessibility, and component mechanics.
4. Feature components may express page personality, but should consume the same tokens and component contracts when they are changed.

## Audit Scope

### Files Scanned

Repo-wide discovery scanned 153 frontend files under:

- `app`
- `components/ui`
- `core`
- `features/products`
- `features/sales`
- `features/forecast`
- `styles`

Primary files inspected for design-system decisions:

- `package.json`
- `components.json`
- `postcss.config.mjs`
- `next.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `styles/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/(dashboard)/layout.tsx`
- `components/layout/page-container.tsx`
- `core/role-config/role-theme.ts`
- `core/ui/StatCards.tsx`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/dialog.tsx`
- `components/ui/sheet.tsx`
- `components/ui/popover.tsx`
- `components/ui/select.tsx`
- `components/ui/calendar.tsx`
- `components/ui/combobox.tsx`
- `components/ui/SearchInput.tsx`
- `components/ui/PageHeader.tsx`
- `components/ui/Pagination.tsx`
- `components/ui/table-pagination-footer.tsx`
- `components/ui/StatusBadge.tsx`
- `components/ui/MetadataBadge.tsx`
- `components/ui/sonner.tsx`
- `lib/utils/toast.tsx`
- `features/products/components/ProductsHeader.tsx`
- `features/products/components/ProductsList.tsx`
- `features/products/components/AddProductDialog.tsx`
- `features/sales/components/SalesHeader.tsx`
- `features/sales/components/SalesDateFilter.tsx`
- `features/sales/components/SalesTable.tsx`
- `features/sales/components/UploadSalesDialog.tsx`
- `features/forecast/components/ForecastApprovalCenter.tsx`
- `features/forecast/components/ForecastManagement.tsx`
- `features/forecast/components/ForecastRequestsList.tsx`
- `features/forecast/components/ForecastStats.tsx`
- `features/forecast/components/CreateForecastForm.tsx`
- `features/forecast/components/ForecastHistory.tsx`
- `features/forecast/lib/constants/stats-config.ts`

### Pages Scanned

60 Next.js `page.tsx` routes were discovered. The primary visual audit focused on Product, Sales, Forecast, auth, and shared dashboard shell pages.

- `app/page.tsx`
- `app/(dashboard)/manager/page.tsx`
- `app/(dashboard)/manager/products/page.tsx`
- `app/(dashboard)/manager/sales/page.tsx`
- `app/(dashboard)/manager/forecast/page.tsx`
- `app/(dashboard)/manager/visits/page.tsx`
- `app/(dashboard)/supervisor/products/page.tsx`
- `app/(dashboard)/supervisor/sales/page.tsx`
- `app/(dashboard)/supervisor/forecast/page.tsx`
- `app/(dashboard)/supervisor/visits/page.tsx`
- `app/(dashboard)/rep/products/page.tsx`
- `app/(dashboard)/rep/sales/page.tsx`
- `app/(dashboard)/rep/forecast/page.tsx`
- `app/(dashboard)/rep/forecast/new/page.tsx`
- `app/(dashboard)/rep/visits/page.tsx`
- `app/(dashboard)/rep/visits/add/page.tsx`

Additional route files were indexed for route breadth: doctors, pharmacies, plan, profile, reports, requests, settings, team, target, appraisal, HR, loading, catch-all, and not-found pages across manager, supervisor, and rep roles.

### Components Scanned

55 component files were indexed or inspected across shared UI, Product, Sales, Forecast, and core UI. Key component families:

- Shared primitives: button, input, textarea, select, popover, dialog, sheet, dropdown menu, calendar, combobox, switch, checkbox, tooltip, progress, skeleton, card, chart, sonner.
- Shared CRM utilities: PageHeader, SearchInput, Pagination, TablePaginationFooter, ResultsFooter, ScopeInfoBanner, StatusBadge, MetadataBadge, safe image handling.
- Product components: ProductsHeader, ProductsList, AddProductDialog.
- Sales components: SalesHeader, SalesDateFilter, SalesTable, UploadSalesDialog.
- Forecast components: ForecastApprovalCenter, ForecastManagement, ForecastRequestsList, ForecastStats, CreateForecastForm, ForecastHistory.
- Core UI: StatCards, role UI context, stat-card types.

## Existing UI Libraries

- Next.js 16 app router.
- React 19.
- Tailwind CSS 4 with `@theme inline`.
- DaisyUI 5 plugin is installed.
- shadcn-style primitives configured through `components.json` using style `new-york`, CSS variables, and lucide icons.
- Radix UI primitives are used for dialog, sheet, popover, select, dropdown menu, alert dialog, checkbox, tooltip, and related interaction surfaces.
- lucide-react is the icon system.
- date-fns and react-day-picker support date workflows.
- sonner supports toasts.
- recharts is available for charting.
- next-cloudinary is configured for remote image handling.
- next-themes is used for theme plumbing, with light theme currently forced by default.
- tw-animate-css is imported for animation utilities.

## Font Family

Canonical font: Barlow.

Observed implementation:

- `app/layout.tsx` imports `Barlow` from `next/font/google`.
- Weights loaded: 400, 500, 600, 700.
- The body uses `barlow.className`.
- The existing Tailwind `--font-sans` mapping still references `--font-geist-sans`; that is a legacy/stale token and should not be used as the design source.
- New canonical token: `--gp-font-sans: "Barlow", Arial, sans-serif`.

## Visual Language

GolderaPharm should feel like a polished pharmaceutical CRM:

- Calm and operational, not decorative.
- Dense enough for repeated work, but with enough air to scan.
- Navy for authority and data structure.
- Gold for brand accent, focus, and primary commercial actions.
- White and near-white surfaces with restrained borders.
- Soft status color fills with clear labels.
- Icons are supporting navigation and recognition cues, not decoration.

Products, Sales, and Forecast Approval currently provide the clearest foundation for the system. Older Forecast Management, Forecast Requests, generic SearchInput, generic Pagination, and core StatCards show useful structure but more visual drift.

## Canonical Token Layer

Code tokens live in `styles/globals.css` under the additive `--gp-*` namespace. They are safe because existing pages are not mass-rewired to consume them yet.

### Brand Gold

| Token           | Value     | Use                                                  |
| --------------- | --------- | ---------------------------------------------------- |
| `--gp-gold-50`  | `#FBF7EA` | Warm subtle backgrounds, nav active surfaces         |
| `--gp-gold-100` | `#FFF8E5` | Selected chips, warning-gold soft fills              |
| `--gp-gold-300` | `#E9DDB8` | Gold borders and separators                          |
| `--gp-gold-500` | `#C9A44C` | Primary brand accent, focus border, active indicator |
| `--gp-gold-600` | `#B18732` | Hover, stronger icon, active text                    |
| `--gp-gold-700` | `#8A6515` | Pressed states, high-contrast gold text              |

Rules:

- Use gold for primary actions, selected states, focus rings, active nav accents, and brand highlights.
- Do not use gold for neutral table structure.
- Prefer soft gold fills with bordered chips instead of solid gold badges unless the element is a primary CTA.
- Manager role theme `#C9A961` remains a legacy role token until role themes are migrated.
- Auth-specific gold values may remain inside the auth experience, but should not become the CRM default.

### Brand Navy

| Token           | Value     | Use                                          |
| --------------- | --------- | -------------------------------------------- |
| `--gp-navy-900` | `#101D36` | Sidebar, immersive headers, dark hero panels |
| `--gp-navy-850` | `#182033` | Main text, section headings, table data      |
| `--gp-navy-800` | `#344054` | Secondary headings and labels                |

Rules:

- Use `#182033` as default strong text on light surfaces.
- Use `#101D36` for deep surfaces, not everyday body text.
- Use `#344054` for secondary but still important text.
- Avoid introducing unrelated slate/blue text values when an existing navy token fits.

### Surfaces And Borders

| Token                  | Value     | Use                                      |
| ---------------------- | --------- | ---------------------------------------- |
| `--gp-surface-page`    | `#F6F8FB` | CRM page background                      |
| `--gp-surface-card`    | `#FFFFFF` | Cards, panels, tables                    |
| `--gp-surface-subtle`  | `#FBFCFE` | Nested but unframed content blocks       |
| `--gp-surface-control` | `#F9FAFB` | Inputs, select triggers, filter controls |
| `--gp-surface-hover`   | `#FFFDF7` | Gold-aware hover surface                 |
| `--gp-border-default`  | `#E5E8EF` | Card and table borders                   |
| `--gp-border-subtle`   | `#EEF1F6` | Internal dividers                        |
| `--gp-border-control`  | `#DDE3EE` | Input/select borders                     |

Rules:

- Default page background should be `#F6F8FB`, matching the modern Product and CRM workspace direction.
- Default cards should be white with `#E5E8EF`.
- Use `#EEF1F6` for separators inside cards.
- Use `#FFFDF7` only for brand-aware hover/focus surfaces.

### Text

| Token                   | Value     | Use                                     |
| ----------------------- | --------- | --------------------------------------- |
| `--gp-text-primary`     | `#182033` | Main headings, values, table data       |
| `--gp-text-secondary`   | `#344054` | Section labels and secondary copy       |
| `--gp-text-muted`       | `#667085` | Help text, subtitles, empty-state copy  |
| `--gp-text-placeholder` | `#98A2B3` | Placeholder text, low-emphasis metadata |

Rules:

- Do not use generic `text-black` in CRM surfaces unless true black is required for print-like contrast.
- Replace scattered slate defaults with these text roles during future touch-ups.
- Keep metadata readable; avoid muted text below 12px unless it is purely decorative and hidden from assistive text.

### Status

| Token                 | Value     | Use                                          |
| --------------------- | --------- | -------------------------------------------- |
| `--gp-success`        | `#168557` | Approved, active, positive deltas            |
| `--gp-success-soft`   | `#E9F8F1` | Success badge fill                           |
| `--gp-success-border` | `#CBEFDD` | Success badge border                         |
| `--gp-warning`        | `#F59E0B` | Attention, pending when amber is appropriate |
| `--gp-warning-soft`   | `#FFF8E5` | Warning badge fill                           |
| `--gp-warning-border` | `#F5DFAC` | Warning badge border                         |
| `--gp-danger`         | `#B42318` | Rejected, destructive, failure               |
| `--gp-danger-soft`    | `#FFF1F0` | Danger badge fill                            |
| `--gp-danger-border`  | `#F5C9C5` | Danger badge border                          |
| `--gp-info`           | `#3972D5` | Informational state                          |
| `--gp-info-soft`      | `#EDF4FF` | Info badge fill                              |
| `--gp-info-border`    | `#D7E5FF` | Info badge border                            |

Rules:

- Use soft fill plus border for status badges.
- Reserve solid red for destructive actions or hard errors.
- Role colors can coexist, but do not use role color as a replacement for business status.

### Spacing

| Token                    | Value     | Use                                 |
| ------------------------ | --------- | ----------------------------------- |
| `--gp-space-page-x`      | `1rem`    | Base mobile page horizontal padding |
| `--gp-space-section-gap` | `1.25rem` | Standard section gap                |
| `--gp-space-card`        | `1.25rem` | Default card padding                |
| `--gp-control-height-sm` | `2.25rem` | Compact controls                    |
| `--gp-control-height-md` | `2.5rem`  | Dense toolbar controls              |
| `--gp-control-height-lg` | `2.75rem` | Primary filters and form controls   |

Rules:

- Page padding should follow the current `PageContainer`: 16px mobile, 20px small desktop, 24px wide desktop.
- Standard dashboard gaps should be 16px or 20px. Use 24px when separating major workflow regions.
- Product and Sales controls commonly use 44px height. Keep this as the preferred full-size control.
- Dense table toolbar controls may use 40px.

### Radius

| Token                 | Value      | Use                             |
| --------------------- | ---------- | ------------------------------- |
| `--gp-radius-control` | `0.625rem` | Inputs, selects, icon buttons   |
| `--gp-radius-card`    | `0.875rem` | KPI cards, repeated cards       |
| `--gp-radius-panel`   | `1rem`     | Tables, filter bars, sections   |
| `--gp-radius-modal`   | `1.125rem` | Dialogs, sheets, large overlays |
| `--gp-radius-pill`    | `9999px`   | Badges, chips, avatars          |

Rules:

- Use 10px controls, 14px cards, 16px panels, and 18px overlays as the CRM default.
- Avoid introducing decorative 24px+ rounding on operational surfaces.
- Pills are for badges, tabs, chips, and avatars only.

### Elevation

| Token                     | Value                                 | Use                           |
| ------------------------- | ------------------------------------- | ----------------------------- |
| `--gp-shadow-card`        | `0 1px 2px rgba(16, 24, 40, 0.04)`    | Quiet cards                   |
| `--gp-shadow-popover`     | `0 18px 46px rgba(16, 27, 51, 0.14)`  | Popovers and floating filters |
| `--gp-shadow-dialog`      | `0 24px 70px rgba(12, 22, 42, 0.22)`  | Dialogs and sheets            |
| `--gp-shadow-gold-action` | `0 8px 18px rgba(201, 164, 76, 0.18)` | Gold primary actions          |

Rules:

- Default cards should use little or no shadow.
- Use elevation to clarify stacking for popovers, dialogs, sheets, and menus.
- Avoid heavy shadows on repeated table rows.

## Color Audit

### Frequent Brand And UI Colors Found

| Color     | Count | Current role                      |
| --------- | ----: | --------------------------------- |
| `#182033` |   136 | Primary text and CRM navy         |
| `#C9A44C` |   117 | Modern gold accent                |
| `#667085` |   105 | Muted text                        |
| `#E5E8EF` |    92 | Border default                    |
| `#8A94A6` |    51 | Muted metadata and icons          |
| `#B18732` |    44 | Gold hover/strong                 |
| `#E2E8F0` |    39 | Legacy slate border               |
| `#8A6515` |    36 | Gold text/active                  |
| `#98A2B3` |    33 | Placeholder and low-emphasis text |
| `#EEF1F6` |    30 | Subtle border                     |
| `#344054` |    29 | Secondary text                    |
| `#E9DDB8` |    29 | Gold border                       |
| `#B42318` |    25 | Danger text                       |
| `#FFFDF7` |    25 | Gold hover surface                |
| `#FBFCFE` |    23 | Subtle surface                    |
| `#FFF8E5` |    23 | Gold soft fill                    |
| `#2563EB` |    18 | Role blue and older focus         |
| `#3972D5` |    18 | Info blue                         |
| `#168557` |    18 | Success                           |
| `#F8FAFC` |    16 | Legacy page/table surface         |
| `#FBF7EA` |    15 | Warm gold subtle surface          |
| `#10B981` |    15 | Legacy dashboard success          |
| `#D0A000` |    15 | Auth gold                         |
| `#D4AF4F` |    14 | Gold variant                      |
| `#EEF1F5` |    14 | Near-duplicate subtle border      |
| `#0F172A` |    13 | Slate/navy drift                  |
| `#F9FAFB` |    13 | Control surface                   |
| `#C9A961` |    12 | Manager role gold                 |
| `#F6F8FB` |    12 | Modern page background            |
| `#D92D20` |    11 | Danger variant                    |
| `#F4F6FA` |    11 | Surface variant                   |

### Duplicate Or Near-Duplicate Colors

- Gold accent drift: `#C9A44C`, `#C9A961`, `#D0A000`, `#D4AF4F`, `#D8B85A`, `#BE9B44`, `#987B3B`, `#B08A33`.
- Gold soft drift: `#FBF7EA`, `#FEF9E7`, `#FFF8E5`, `#F9E9B8`, `#F5E8C3`.
- Navy/slate text drift: `#101D36`, `#111B33`, `#182033`, `#0F172A`, `#17243B`, `#202A3A`, `#344054`.
- Muted text drift: `#667085`, `#64748B`, `#666666`, `#71777F`, `#8A94A6`, `#98A2B3`.
- Border drift: `#E5E8EF`, `#EEF1F6`, `#EEF1F5`, `#E7EAF0`, `#DDE3EE`, `#D8DEE8`, `#E2E8F0`, `#D9D9D9`.
- Page surface drift: `#F6F8FB`, `#F8FAFC`, `#F4F6FA`, `#FBFCFE`, `#F9FAFB`.
- Success drift: `#168557`, `#10B981`, `#20A66A`, `#107349`.
- Danger drift: `#B42318`, `#D92D20`, `#DC2626`.
- Blue drift: `#3972D5`, `#2563EB`, `#1E3A8A`.

Future UI work should map these to canonical `--gp-*` tokens unless preserving a role theme or auth-specific treatment.

## Typography

### Canonical Scale

| Role                 | Size / line height          |     Weight | Use                                                 |
| -------------------- | --------------------------- | ---------: | --------------------------------------------------- |
| Page title           | 26/30 mobile, 30/36 desktop |        600 | Main page heading                                   |
| Section title        | 18/24                       |        600 | Card/table section heading                          |
| Card title           | 16/22                       |        600 | KPI and repeated cards                              |
| Body                 | 14/20                       | 400 or 500 | Main readable UI text                               |
| Form label           | 13/18                       | 500 or 600 | Field labels                                        |
| Metadata             | 12/16                       |        500 | Dates, IDs, helper text                             |
| Eyebrow/table header | 11/16                       |        600 | Uppercase labels with `0.04em` to `0.08em` tracking |
| KPI value            | 24/28                       |        600 | Summary cards                                       |

### Typography Inconsistencies

- The body uses Barlow, but `--font-sans` still references old Geist variables.
- Newer Product/Sales components use the best current scale: 11px uppercase labels, 14px body text, 16-18px section titles, 24px KPI values, and 26-30px page titles.
- Older Forecast and shared components use more generic Tailwind sizes and frequent `text-black`.
- Some compact elements use 10px labels. That is acceptable for navigation section labels but should not carry critical data.
- Letter spacing is inconsistent between `0.04em` and `0.08em`. Use `0.04em` for table headers and KPI labels; reserve `0.08em` for nav/sidebar section labels.

## Spacing And Layout

### Current Patterns

- `PageContainer` is the best page shell reference: `px-4 py-5 sm:px-5 min-[1440px]:p-6`.
- Products and Sales use 20px card padding and 16-20px section gaps.
- Dialogs and drawers generally use 20-24px header/body padding.
- Tables use 16-20px horizontal cell padding and 12-16px vertical padding.
- Forms typically use 16px vertical rhythm with 44px controls.

### Spacing Inconsistencies

- Shared primitives default to 36px controls, while Product/Sales/Visit workflows often use 40px or 44px.
- Forecast older forms mix 12px, 16px, 20px, and 24px gaps without a clear density rule.
- Some table and pagination components use separate spacing systems, creating different rhythm between pages.
- Mobile layouts are better in Products and Visits than older Forecast workflows.

## Radius Audit

Observed radius counts show drift:

- `rounded-md`: 193
- `rounded-full`: 189
- `rounded-lg`: 118
- `rounded-[10px]`: 81
- `rounded-[14px]`: 60
- `rounded-xl`: 53
- `rounded-[12px]`: 35
- `rounded-[9px]`: 20
- `rounded-[16px]`: 17
- `rounded-[25px]`: 13
- `rounded-2xl`: 13
- `rounded-[8px]`: 12

Canonical direction:

- Controls: 10px.
- Small controls where shadcn defaults remain: 8px is acceptable until migration.
- Cards: 14px.
- Panels and tables: 16px.
- Dialogs and sheets: 16-18px.
- Pills: full radius.

## Motion

### Patterns Discovered

- `cubic-bezier(0.22, 1, 0.36, 1)` appears heavily and is the current premium easing.
- Existing root tokens: `--motion-fast: 170ms`, `--motion-normal: 240ms`, `--motion-slow: 300ms`, `--ease-premium`.
- Repeated durations: 120ms, 140ms, 150ms, 160ms, 170ms, 180ms, 200ms, 210ms, 220ms, 280ms, 300ms, 320ms, 380ms, 420ms, 520ms, 540ms, 720ms, 1000ms.
- Product and Visits pages already include `prefers-reduced-motion` fallbacks.
- Sales table includes deliberate accessibility and keyboard states.

### Recommended Motion Tokens

| Token                  | Value                            | Use                                  |
| ---------------------- | -------------------------------- | ------------------------------------ |
| `--gp-motion-instant`  | `120ms`                          | Small state changes, slider range    |
| `--gp-motion-fast`     | `170ms`                          | Input focus, chip entry, icon hover  |
| `--gp-motion-dropdown` | `180ms`                          | Menu and popover entry               |
| `--gp-motion-normal`   | `240ms`                          | Tabs, filters, count refresh         |
| `--gp-motion-panel`    | `300ms`                          | Sheets, filter panels, drawer motion |
| `--gp-motion-page`     | `420ms`                          | Page or hero entrance                |
| `--ease-premium`       | `cubic-bezier(0.22, 1, 0.36, 1)` | Default UI easing                    |

Rules:

- All non-essential motion must support `prefers-reduced-motion`.
- Hover movement should stay between 1px and 2px on dense CRM surfaces.
- Avoid looping motion except loading/skeleton states.
- Use stagger only for hero-like or empty-state moments, not for every table update.

## Component Contracts

### Page Shell

- Use `PageContainer` for dashboard pages.
- Use full-width sections with constrained content; do not put a page section inside a decorative card unless it is actually a repeated item, modal, or tool.
- Primary page flow should be: page header, KPI/status summary when useful, filters/actions, data/workflow surface.

### Header

- Page header should include a clear title, one short subtitle, and optional role/scope metadata.
- Product-like pages may use a first-viewport visual header if the image directly supports the product/place/object being managed.
- Operational pages should avoid oversized hero layouts.

### Buttons

- Use shadcn Button as the primitive.
- Primary actions should use the gold gradient or gold solid treatment already seen in Products.
- Secondary actions should be white or subtle surfaces with `#E5E8EF` borders.
- Icon buttons should use lucide icons and tooltips where meaning is not obvious.
- Destructive actions should not use brand gold.

### Forms

- Full-size workflow forms should use 44px controls, 10px radius, `#DDE3EE` border, and gold focus.
- Field labels should be 13px, medium or semibold.
- Error text should be red/danger and close to the field.
- Keep submit actions sticky in sheets or long dialogs when the workflow is multi-step or scrolls.

### Search And Filters

- Canonical pattern: icon-leading search field, 40-44px height, control surface, gold focus ring, optional clear button.
- Filters should open as popover on desktop and sheet/drawer on mobile when there are more than two fields.
- Active filters should be chips with soft gold backgrounds and explicit remove buttons.
- Results count should update visibly but not shift the layout.

### Tables And Lists

- Tables should use rounded 16px white panels with `#E5E8EF` borders.
- Table headers should be 11px uppercase with muted text.
- Rows should use hover `#F8FAFC` or `#FFFDF7` when brand-aware.
- Use `TablePaginationFooter` as the preferred pagination component.
- On mobile, use cards when table columns are not genuinely scannable.

### KPI Cards

- Use 14-16px radius, white surface, `#E5E8EF` border, 20px padding, and small icon shell.
- Label: 11px uppercase, muted, semibold.
- Value: 24px, semibold, `#182033`.
- Trend/helper: 12px, muted or status-colored.
- Future shared component should replace local duplicates in Products, Sales, Forecast Approval, and `core/ui/StatCards`.

### Badges

- Status badges should use soft background, colored text, and matching border.
- Metadata badges should be quiet, rounded, and avoid saturated defaults.
- Badge copy should be short and semantically clear.

### Overlays

- Dialogs and sheets should use 16-18px radius, restrained header hierarchy, clear close affordance, and 24px major padding.
- Popovers should use `--gp-shadow-popover`, 16px radius, and escape/blur behavior from Radix.
- Mobile sheets should feel like task surfaces, not cramped dialogs.

### Toasts

- Use `lib/utils/toast.tsx` as the typed toast wrapper.
- Avoid calling raw `sonner` directly in new feature code unless the wrapper cannot cover the case.
- Toasts should report outcome, not narrate implementation details.

## Shared Component Strategy

### Suitable For Sharing

- Page header wrapper.
- KPI/stat card.
- Search field with clear button.
- Filter trigger, active filter chip, and responsive filter panel.
- Date range trigger/popover pattern.
- Table shell and table toolbar.
- `TablePaginationFooter` as canonical pagination.
- Status badge and metadata badge.
- Empty state.
- Drawer/dialog header and sticky footer.
- Toast wrapper.
- Form field layout with label, error, and helper.

### Must Remain Page-Specific

- Products image hero and product catalog thumbnail behavior.
- Product-specific price/category/date filter copy and catalog sorting logic.
- Sales data date presets and expandable sales row analytics, unless later generalized intentionally.
- Forecast approval workflow cards, approval/rejection status copy, and forecast period logic.
- Forecast creation product/distribution matrix.
- Visits calendar/planner day cells, week panels, and visit-specific scheduling language.
- Role permission and scope messaging tied to backend authorization.

### Migration Candidates

- `components/ui/SearchInput.tsx`: useful, but visually older than Product/Sales search fields.
- `components/ui/Pagination.tsx`: older behavior and styling; prefer `TablePaginationFooter`.
- `core/ui/StatCards.tsx`: useful abstraction, but needs modern card contract.
- `components/ui/PageHeader.tsx`: should absorb the Product/Sales page header scale and colors.
- `components/ui/StatusBadge.tsx`: should migrate to soft bordered status tokens.
- `components/ui/MetadataBadge.tsx`: should migrate from generic slate/blue variants to CRM metadata tokens.
- `features/sales/components/UploadSalesDialog.tsx`: should be aligned with current dialog/form rules when next touched.
- Older Forecast Management and Forecast Requests UI should be modernized in small scoped passes.

## Accessibility

### Good Existing Patterns

- Sales table includes tablist/tab roles, `aria-selected`, `aria-controls`, keyboard navigation, `aria-expanded`, `aria-busy`, and `aria-current`.
- Recent Product and Visits controls include improved focus, clear button affordances, and reduced-motion fallbacks.
- Radix-backed primitives provide strong interaction behavior when used consistently.

### Issues Found

- Some older shared components use default blue focus or inconsistent focus styling instead of brand gold focus.
- Some icon-only controls need consistent `aria-label` or tooltip coverage.
- Older pagination contains behavior that manipulates duplicate DOM nodes and should not be treated as canonical.
- `ForecastRequestsList` includes a mojibake bullet string (`â€¢`) that should be repaired when that component is touched.
- Some older table/list states rely mainly on color and should include text labels or semantic attributes.
- Some muted text appears small enough that contrast should be checked when used for business-critical data.

### Accessibility Rules

- Every interactive icon-only control needs an accessible name.
- Every popover/sheet/dialog trigger should map to a clear label and close behavior.
- Focus-visible states should be obvious and consistent.
- Do not remove keyboard support from tablists, expandable rows, or selectable lists.
- Honor `prefers-reduced-motion`.
- Use text plus color for important status.

## Responsive Behavior

### Good Existing Patterns

- `PageContainer` scales page padding across mobile, normal desktop, and wide desktop.
- Products uses mobile cards for catalog data and desktop tables where appropriate.
- Sales date filter behaves like a compact control on desktop and a more mobile-friendly surface on small viewports.
- Visits add drawer uses full width on mobile and constrained width on desktop.
- Tables generally use `overflow-x-auto` when a real table remains necessary.

### Responsive Inconsistencies

- Older Forecast workflows are less mobile-polished than Product/Sales/Visits.
- Shared pagination and older search components do not match the newer density and mobile rhythm.
- Dialog sizing is not yet fully standardized across Add Product, Upload Sales, and Forecast flows.
- Some older form grids need stronger mobile stacking and stable control heights.

## Dashboard Role Colors

Existing role colors in `core/role-config/role-theme.ts` remain supported:

- Manager: gold.
- Supervisor: blue.
- Medical rep: green.

Rules:

- Role colors identify role context. They do not replace brand action tokens or business status tokens.
- New shared components should accept role accent only where a role distinction is part of the interaction.
- Page-level CRM chrome should remain navy/gold unless the component is explicitly role-themed.

## Page Personality Rules

- Products: allowed to be image-rich and catalog-like. Keep real product/category imagery and premium filter panels.
- Sales: should be analytical and dense. Prioritize fast scanning, date range clarity, table ergonomics, and expandable detail.
- Forecast: should be workflow-oriented. Approval state, period, product mix, and scope should be immediately visible.
- Visits: should be planner-first. Calendar/list/week switching and add-visit flow can have calendar-specific motion and layout.
- Auth: may keep its dark branded landing/auth visual system as a separate entry experience.

## Implementation Rules

- New UI should prefer `--gp-*` tokens or Tailwind `gp-*` aliases.
- Do not mass-replace old colors across the app without a scoped migration plan.
- When touching a component, migrate only the local surface being changed.
- Keep backend/API/business logic untouched for UI-system work.
- Preserve routes, permissions, and data fetching behavior.
- Use lucide icons for UI buttons where an icon exists.
- Use existing shadcn/Radix primitives before creating new primitives.
- Add comments only for non-obvious interaction behavior.
- Validate TypeScript, lint, and build when token or component files change.

## Token File Created Or Modified

Modified:

- `styles/globals.css`

Additive tokens:

- CSS variables: `--gp-*`.
- Tailwind aliases: `gp-*` colors, radii, shadows, font, and easing exposed through `@theme inline`.

No existing page classes were mass-replaced and no existing page was redesigned as part of this design-system pass.
