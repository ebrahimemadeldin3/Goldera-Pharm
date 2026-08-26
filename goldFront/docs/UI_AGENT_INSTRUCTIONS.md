# GolderaPharm UI Agent Instructions

Read this before changing GolderaPharm CRM UI.

## Prime Directive

Use `docs/GOLDERAPHARM_UI_DESIGN_SYSTEM.md` and the `--gp-*` tokens in `styles/globals.css` as the UI source of truth. Preserve backend behavior, API calls, permissions, routes, and business rules unless the user explicitly asks for those changes.

## Before Editing

1. Identify the page type: Products, Sales, Forecast, Visits, Auth, or shared dashboard.
2. Inspect the existing component and one nearby modern reference before editing.
3. Decide what can be shared and what must remain page-specific.
4. Keep the change scoped to the user request.
5. If touching tokens or shared UI, run TypeScript, lint, and build.

## Token Usage

- Prefer `--gp-*` CSS variables and Tailwind `gp-*` aliases for new UI.
- Brand gold: `gp-gold-500`, hover `gp-gold-600`, active/text `gp-gold-700`, soft fills `gp-gold-50` or `gp-gold-100`.
- Brand navy: `gp-navy-900` for deep surfaces, `gp-navy-850` for primary text, `gp-navy-800` for secondary text.
- Page background: `gp-surface-page`.
- Cards: `gp-surface-card` with `gp-border-default`.
- Controls: `gp-surface-control` with `gp-border-control`, gold focus.
- Text: `gp-text-primary`, `gp-text-secondary`, `gp-text-muted`, `gp-text-placeholder`.
- Status: use soft fill, border, and text color from success, warning, danger, or info tokens.

## Component Rules

- Use shadcn/Radix primitives from `components/ui` before creating new primitives.
- Use lucide-react icons for icon buttons and status cues.
- Use `TablePaginationFooter` for table pagination.
- Treat `Pagination`, `SearchInput`, `PageHeader`, `StatusBadge`, `MetadataBadge`, and `core/ui/StatCards` as migration candidates unless already aligned.
- Keep page-specific components local when they encode business workflow, page storytelling, or domain-specific data layout.

## Layout Rules

- Use `PageContainer` for dashboard pages.
- Keep operational pages dense, calm, and scannable.
- Do not create marketing-style hero pages inside the CRM.
- Use 16px mobile page padding, 20px normal desktop padding, and 24px wide desktop padding.
- Use 20px card padding as the default.
- Use 44px controls for primary filters/forms and 40px controls for dense toolbars.
- Use 10px control radius, 14px card radius, 16px panel radius, 16-18px overlay radius.

## Motion Rules

- Use `--ease-premium` and `--gp-motion-*`.
- Keep hover movement to 1-2px.
- Do not add looping motion except loading states.
- Always support `prefers-reduced-motion` for non-essential animation.

## Accessibility Rules

- Icon-only buttons need `aria-label` and, when helpful, a tooltip.
- Dialogs, sheets, popovers, and selects should use Radix-backed primitives.
- Tablists and expandable rows must support keyboard interaction.
- Status must be readable as text, not color alone.
- Focus-visible states must be clear and consistent.

## Safe Migration Pattern

When modernizing an old component:

1. Keep props, API calls, route behavior, permissions, and data transformations unchanged.
2. Replace only visual tokens and local layout classes needed for the requested surface.
3. Move repeatable UI into shared components only if at least two current surfaces need the same behavior.
4. Do not mass-replace hex values across unrelated pages.
5. Validate with TypeScript, lint, and build.

## Page Personality

- Products can keep image-led catalog moments and product thumbnails.
- Sales should favor fast filtering, table ergonomics, and analytical density.
- Forecast should favor workflow state, period clarity, approval actions, and product mix.
- Visits should favor planner/calendar ergonomics and scheduling clarity.
- Auth can keep its separate dark branded entry experience.

## Required Final Report For UI-System Work

Include:

- Files and pages scanned.
- Libraries and font discovered.
- Brand colors and drift found.
- Tokens created or modified.
- Components suitable for sharing.
- Components that must remain page-specific.
- Accessibility and responsive risks.
- Validation commands and results.
- Confirmation that backend/API/business logic was untouched.
- Confirmation that existing pages were not redesigned unless explicitly requested.
