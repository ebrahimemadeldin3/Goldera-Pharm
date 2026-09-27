# Bulk Excel Import Backend Handoff

Bulk commit requires backend support - excluded from current frontend-only scope.

## Frontend Scope Completed

- Manager Doctors and Manager Pharmacies expose an Import Excel workflow.
- The browser workflow detects actual file content before parser selection.
- Supported parsed formats are `.xlsx`, `.csv`, `.tsv`, and supported delimited `.txt`.
- Legacy `.xls` is detected by signature, but the current frontend has no installed safe `.xls` parser. Users are told to save as `.xlsx`, `.csv`, `.tsv`, or delimited `.txt`.
- Official Doctor and Pharmacy templates are blank, header-only UTF-8 BOM CSV files.
- Rows are validated client-side before any persistence boundary:
  - required fields
  - field-level format checks
  - KSA district / region / territory hierarchy consistency
  - duplicate values inside the uploaded file
  - duplicate warnings against records already loaded in CRM
- Invalid rows cannot be selected for import.
- Error reports, blank CSV templates, and validated-batch exports are generated client-side.
- Preparing a batch uses `prepareBulkImportBatch(rows)`.
- No backend write is performed by the current implementation.

## Current Frontend Batch Shape

The future API call should be connected after validation and selection:

```ts
const batch = prepareBulkImportBatch(rows);
```

Each prepared item has this shape:

```ts
{
  sourceRow: number;
  status: "ready" | "warning";
  payload: DoctorImportPayload | PharmacyImportPayload;
  territory: {
    district: string;
    region: string;
    territory: string;
  } | null;
  warnings: Array<{
    field: string;
    value: string;
    message: string;
  }>;
}
```

Invalid rows are never included.

### Doctor Payload Fields

```ts
{
  nameEN: string;
  nameAR: string;
  phone: string;
  email?: string;
  specialty: string;
  grade: "A" | "B" | "C" | "D" | string;
  LicenseNumber?: string;
  avgPatientsPerDay?: number;
  accountName: string;
  subRegion: string;
  latitude?: number;
  longitude?: number;
  district: string;
  region: string;
}
```

Frontend validation requires English Name, Arabic Name, Phone, Specialty, Grade,
Account / Facility, District, Region, and Territory. Duplicate checks are Phone,
Email, and License Number. Empty optional Email/License values are ignored by
duplicate checks.

### Pharmacy Payload Fields

```ts
{
  name: string;
  city: string;
  country: string;
  subRegion: string;
  region: string;
  district: string;
}
```

Frontend validation requires Pharmacy Name, City, Country, District, Region, and
Territory. Duplicate checks use Pharmacy Name because that is the current
frontend identity signal.

## Proposed Future Backend Endpoints

The endpoints below are proposed for future backend work. They do not exist in
the current frontend integration and must not be treated as available until the
backend implements and documents them.

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
      "sourceRow": 2,
      "nameEN": "Dr. Mohammed Al-Rashid",
      "nameAR": "د. محمد الراشد",
      "email": "doctor@example.com",
      "phone": "+966 50 123 4567",
      "grade": "A",
      "avgPatientsPerDay": 45,
      "specialty": "Dermatology",
      "LicenseNumber": "LIC-10001",
      "accountName": "King Faisal Hospital",
      "subRegion": "Riyadh 1",
      "district": "Central & Eastern District",
      "region": "Central Region"
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
      "sourceRow": 2,
      "name": "Al Nahdi Pharmacy - Riyadh",
      "city": "Riyadh",
      "subRegion": "Riyadh 1",
      "region": "Central Region",
      "country": "Saudi Arabia",
      "district": "Central & Eastern District"
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
- Reject unknown territories and inconsistent district / region / territory combinations.
- Enforce server-side duplicate policy in a transaction.
- Return row-level failures without partially masking errors.
- Support idempotency keys so a manager can retry a failed import safely.
- Return created record ids so the frontend can show real persisted results and refresh the directory.
