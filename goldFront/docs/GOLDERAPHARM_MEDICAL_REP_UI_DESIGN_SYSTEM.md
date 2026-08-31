# GolderaPharm Medical Representative UI Design System

Status: v1 established on 2026-08-30.

This document extends `docs/GOLDERAPHARM_UI_DESIGN_SYSTEM.md` to establish the dedicated visual language, component contracts, and UX standards for the **Medical Representative (Rep)** role.

---

## 1. Scope & System Foundations

- **Product Identity**: Medical Representatives are part of the core GolderaPharm CRM product. The Rep interface shares the same typography (Barlow), container layouts (`PageContainer`), radii (`rounded-[10px]` controls, `rounded-[14px]` cards, `rounded-[16px]` panels), and card surfaces (`#FFFFFF` on `#F6F8FB`).
- **Role Differentiation**: While Manager screens prioritize supervision, approval workflows, team metrics, and dense administrative data, Medical Rep screens prioritize **field operations, today's visits, quick visit logging, doctor relationships, product/samples distribution, and personal target progress**.
- **Frontend Only Guarantee**: Zero backend changes. Database schemas, API contracts, authorization permissions, server actions, and Manager flows remain completely untouched.

---

## 2. Role-Specific Color System

The Medical Representative role uses a controlled, semantic **Healthcare Green** palette as its primary action and identity color.

### Medical Rep Green Palette

| Token | CSS Variable | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Rep Green 50** | `--gp-rep-green-50` / `--gp-rep-primary-subtle` | `#F0FDF4` | Off-white warm green background tint |
| **Rep Green 100** | `--gp-rep-green-100` / `--gp-rep-primary-soft` | `#E9F8F1` | Soft fill for Rep chips, active items, badge fills |
| **Rep Green 200** | `--gp-rep-green-200` / `--gp-rep-primary-border` | `#CBEFDD` | Subtle border for Rep cards, active chips |
| **Rep Green 500** | `--gp-rep-green-500` / `--gp-rep-primary` | `#168557` | Primary Rep action CTA, active indicators |
| **Rep Green 600** | `--gp-rep-green-600` / `--gp-rep-primary-hover` | `#107349` | Hover state for primary Rep action buttons |
| **Rep Green 700** | `--gp-rep-green-700` / `--gp-rep-primary-active` | `#0B5635` | Pressed states, high-contrast green text |

### Visual Balance Ratio
- **75–80%**: White (`#FFFFFF`) & Light neutral surfaces (`#F6F8FB` page background, `#FBFCFE` card backgrounds).
- **15–20%**: Rep Green accents (`#168557` CTAs, `#E9F8F1` soft fills, `#CBEFDD` borders).
- **5–10%**: Deep Navy (`#182033` heading text, `#101D36` structural contrast) & Gold (`#C9A44C` corporate brand mark, quiet metadata).

---

## 3. Button & Action Hierarchy

| Action Level | Visual Treatment | CSS Classes | Example Actions |
| :--- | :--- | :--- | :--- |
| **Primary Rep CTA** | Green solid / gradient + **WHITE text** | `bg-[#168557] hover:bg-[#107349] text-white font-semibold rounded-[10px] shadow-[0_4px_14px_rgba(22,133,87,0.22)]` | **Add Visit**, **Schedule Visit**, **Submit Report**, **Start Visit** |
| **Secondary Action** | White surface + neutral border | `bg-white border-[#E5E8EF] hover:bg-[#F9FAFB] text-[#182033] font-semibold rounded-[10px]` | **View Details**, **Cancel**, **Filter** |
| **Paired Strong Action** | Green Primary + Navy Secondary | Primary: `bg-[#168557] text-white` <br/> Secondary: `bg-[#101D36] text-white hover:bg-[#182033]` | **Submit Request** vs **Save Draft**, **Schedule Visit** vs **Doctor Profile** |
| **Destructive Action** | Red soft border fill + Red text | `border-[#F5C9C5] bg-white text-[#B42318] hover:bg-[#FFF1F0] rounded-[10px]` | **Cancel Visit**, **Withdraw Request** |

---

## 4. Component Rules for Medical Rep

1. **PageHeader**: Personal operational header. Displays welcome greeting with Doctor/Rep name, active sub-region location pill, and primary Green CTA button (`Add Visit` / `New Forecast`).
2. **KPI & Target Cards**: 14px radius (`rounded-[14px]`), white surface (`#FFFFFF`), `#E5E8EF` border, 20px padding. Displays target achievement progress bars (`#168557`), visit coverage percentages, and quick delta indicators.
3. **Doctor Cards (Rep Variant)**:
   - Compact 14px card.
   - Doctor name, specialty pill (`#3972D5`), grade pill (`#8A6515`), sub-region pill (`#344054`).
   - Quick action buttons: **Schedule Visit** (Green CTA) and **View Profile** (Outline/Navy).
4. **Visit Cards (Rep Variant)**:
   - Status soft fills: Completed (`#E9F8F1` green), Scheduled (`#FFF8E5` gold), In Progress (`#EDF4FF` blue), Cancelled (`#FFF1F0` red).
   - Time, Doctor/Hospital name, specialty, and quick **Submit Report** / **Log Activity** trigger.
5. **Combobox & Autocomplete**: Integrated `Combobox` in `AddVisitForm` for Doctor, Hospital, and Product/Sample selections with live search typing.
6. **Mobile Action Bar**: On 390px viewports, high-frequency actions (Add Visit, Submit Report) remain sticky at the bottom for one-tap access in the field.

---

## 5. Medical Rep Workflow & UX Priorities

Medical Representatives operate in fast-paced field environments (hospitals, clinics, pharmacies). The UI must answer:
1. **What do I need to do today?** → Today's Schedule & Agenda widget.
2. **Who am I visiting & where?** → Doctor name, hospital/account, and sub-region clearly highlighted.
3. **How am I progressing toward my monthly target?** → Target progress card with visual bar meter.
4. **How do I log a visit quickly?** → Searchable comboboxes and 1-tap sheet triggers.

---

## 6. Discovered Medical Rep Route Tree (17 Pages)

1. `app/(dashboard)/rep/page.tsx` — Rep Main Personal Dashboard
2. `app/(dashboard)/rep/doctors/page.tsx` — Rep Doctor Directory
3. `app/(dashboard)/rep/doctors/[id]/page.tsx` — Rep Doctor Profile Detail
4. `app/(dashboard)/rep/pharmacies/page.tsx` — Rep Pharmacy Directory
5. `app/(dashboard)/rep/plan/page.tsx` — Rep Monthly Plan & Schedule
6. `app/(dashboard)/rep/visits/page.tsx` — Rep Visits Workspace (Calendar & Agenda)
7. `app/(dashboard)/rep/visits/add/page.tsx` — Rep Schedule New Visit Form
8. `app/(dashboard)/rep/visits/report/page.tsx` — Rep Submit Visit Report Form
9. `app/(dashboard)/rep/sales/page.tsx` — Rep Personal Sales Activity & Products
10. `app/(dashboard)/rep/forecast/page.tsx` — Rep Forecast Submissions
11. `app/(dashboard)/rep/forecast/new/page.tsx` — Rep New Forecast Entry
12. `app/(dashboard)/rep/products/page.tsx` — Rep Product Catalog & Sample Inventory
13. `app/(dashboard)/rep/coaching/page.tsx` — Rep Coaching & Feedback Log
14. `app/(dashboard)/rep/requests/page.tsx` — Rep Expense / Leave Requests
15. `app/(dashboard)/rep/reports/page.tsx` — Rep Operational Reports
16. `app/(dashboard)/rep/target/page.tsx` — Rep Target Progress & KPIs
17. `app/(dashboard)/rep/profile/page.tsx` & `settings/page.tsx` — Rep Account Settings

---

## 7. Proposed Medical Rep Page Redesign Sequence

When implementing the Medical Rep flow redesign, execute in this priority order:

1. **Rep Visits & Schedule (`/rep/visits`, `/rep/visits/add`, `/rep/visits/report`)**: Core field daily driver.
2. **Rep Dashboard (`/rep`)**: Personal operational hub with Today's Agenda, Target Progress, and Quick Actions.
3. **Rep Doctors Directory & Profile (`/rep/doctors`, `/rep/doctors/[id]`)**: Doctor relationship management & scheduling.
4. **Rep Pharmacies Directory (`/rep/pharmacies`)**: Account list & location metadata.
5. **Rep Plan (`/rep/plan`)**: Monthly plan overview & submitted schedule.
6. **Rep Sales & Products (`/rep/sales`, `/rep/products`)**: Personal sales tracking & sample catalog.
7. **Rep Forecast & Requests (`/rep/forecast`, `/rep/requests`)**: Operational submissions.
8. **Rep Secondary Pages (`/rep/target`, `/rep/coaching`, `/rep/reports`, `/rep/profile`)**: Personal performance tracking & settings.
