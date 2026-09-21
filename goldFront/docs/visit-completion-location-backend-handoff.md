# Visit Completion Location - Backend Handoff

Frontend-only preparation is in place. Backend persistence and API support are still required.

## Medical Rep Completion Request

The existing Medical Rep completion flow submits a visit report through:

`POST /api/visits/visit-reports`

When backend support is added, the frontend contract should send:

```json
{
  "completionLocation": {
    "latitude": 30.5965,
    "longitude": 32.2715,
    "accuracy": 18,
    "capturedAt": "2026-09-20T16:29:00.000Z"
  }
}
```

Field rules:

- `latitude`: finite number, `-90 <= latitude <= 90`
- `longitude`: finite number, `-180 <= longitude <= 180`
- `accuracy`: `null` or finite number greater than or equal to `0`
- `capturedAt`: parseable ISO date-time string

The frontend currently captures this value during explicit report submission, but intentionally does not send it to `POST /api/visits/visit-reports` because the current backend contract may reject unknown fields.

## Manager Visit Response

Manager Visits expects the same normalized shape on visit responses:

```json
{
  "completionLocation": {
    "latitude": 30.5965,
    "longitude": 32.2715,
    "accuracy": 18,
    "capturedAt": "2026-09-20T16:29:00.000Z"
  }
}
```

The field should be returned on visit records from:

`GET /api/visits/all`

Historical completed visits may return `null` or omit `completionLocation`.

## Backend Responsibilities

- Persist completion location against the completed visit.
- Validate location data server-side.
- Enforce authenticated Medical Rep ownership.
- Enforce authorization for Manager/Supervisor response visibility.
- Decide whether `capturedAt` comes from the client capture time, server completion time, or both.
- Add database fields/model support and API serialization.

The frontend must not solve persistence, authorization, database schema, or endpoint creation.
