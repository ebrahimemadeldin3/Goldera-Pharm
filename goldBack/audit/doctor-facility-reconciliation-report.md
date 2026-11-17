# Doctor–Facility Reconciliation Report

- Mode: **DRY-RUN (read-only)**
- Generated at: `2026-11-17T22:05:35.726Z`

## Summary Counts

| Metric | Count |
| --- | ---: |
| Active Doctors | 425 |
| Accounts (Facilities) in DB | 0 |
| Already Linked (`accountsId != null`) | 0 |
| Legacy-Only (`accountsId = null`, `accountName != null`) | 425 |
| Missing Facility Data (`accountsId = null`, empty `accountName`) | 0 |
| Exact Matches (safe to link) | 0 |
| Unique Normalized Matches (safe to link) | 0 |
| Duplicate Account Name Groups in `Accounts` | 0 |
| Ambiguous Doctor Matches (manual review) | 0 |
| Unmatched Legacy Facility Names (manual review) | 425 |
| Applied Links | 0 |
| Skipped | 425 |
| Failed | 0 |

## Top Unmatched Legacy Facility Names (Sample)

- `مستشفي العدواني` (15 doctors)
- `مستشفي هاله عيسي بن لادن` (13 doctors)
- `مستشفي مركز مكه الطبي` (13 doctors)
- `مستشفي الدوسري` (12 doctors)
- `مجمع أولاس` (11 doctors)
- `صفاء الدمام` (10 doctors)
- `مجمع الصاعدي` (10 doctors)
- `بدر الجزيره` (10 doctors)
- `مجمع عيادات نسيم جده` (10 doctors)
- `مجمع الرحيلي الطبي` (9 doctors)
- `مجمع الوطن` (9 doctors)
- `مجمع خالد الطبي (السامر)` (9 doctors)
- `مستشفي الزهراء` (8 doctors)
- `مجمع ابتسامة العائلة` (8 doctors)
- `معقل الدواء` (8 doctors)
- `مجمع المختار` (8 doctors)
- `مجمع بلغصون` (8 doctors)
- `مجمع محمد الجدعاني (القرينية)` (8 doctors)
- `مجمع تداوي الجراحي` (7 doctors)
- `مجمع الدمام الاهلي` (7 doctors)
