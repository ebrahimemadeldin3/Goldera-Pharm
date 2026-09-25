# Bulk Excel Import Backend Handoff

Bulk commit requires backend support — excluded from current frontend-only scope.

## Frontend Scope Completed

- Manager Doctors and Manager Pharmacies now expose an Import Excel workflow.
- The browser parses `.xlsx`, `.csv`, and `.tsv` files without adding a package dependency.
- Rows are validated client-side before any commit step:
  - required fields
  - field-level format checks
  - KSA district / region / territory hierarchy consistency
  - duplicate values inside the uploaded file
  - duplicate warnings against records already loaded in CRM
- Invalid rows cannot be selected for import.
- Error reports and Excel-openable CSV templates are generated client-side.
- No backend write is performed by the current implementation.

## Required Backend Endpoints

Add true bulk endpoints instead of requiring the frontend to call the existing
single-create endpoints repeatedly.

### Doctors

`POST /api/doctors/bulk-import`

Request body:

```json
{
  "mode": "create",
  "records": [
    {
      "nameEN": "Dr. Mohammed Al-Rashid",
      "nameAR": "Dr. Mohammed Al-Rashid",
      "email": "doctor@hospital.sa",
      "phone": "+966 50 123 4567",
      "grade": "A",
      "avgPatientsPerDay": 45,
      "specialty": "Dermatology",
      "LicenseNumber": "LIC-10001",
      "accountName": "King Faisal Hospital",
      "subRegion": "Riyadh 1"
    }
  ]
}
```

### Pharmacies

`POST /api/pharmacies/bulk-import`

Request body:

```json
{
  "mode": "create",
  "records": [
    {
      "name": "Al Nahdi Pharmacy - Riyadh",
      "city": "Riyadh",
      "subRegion": "Riyadh 1",
      "region": "Central Region",
      "country": "Saudi Arabia"
    }
  ]
}
```

## Expected Response Contract

Use one response shape for both endpoints:

```json
{
  "success": true,
  "summary": {
    "submitted": 1,
    "created": 1,
    "updated": 0,
    "failed": 0,
    "skipped": 0
  },
  "results": [
    {
      "clientRowNumber": 2,
      "status": "created",
      "id": "record-id",
      "message": "Created successfully"
    }
  ]
}
```

## Backend Validation Requirements

- Re-run all frontend validation server-side.
- Reject unknown territories and inconsistent region / territory combinations.
- Enforce server-side duplicate policy in a transaction.
- Return row-level failures without partially masking errors.
- Support idempotency keys so a manager can retry a failed import safely.
- Return created record ids so the frontend can show a real Results step and refresh the directory.
