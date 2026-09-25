# Medical Rep Appraisal - Backend Handoff

Frontend-only preparation is in place for `/rep/appraisal`.

## Temporary Frontend Preview

`REP_APPRAISAL_PREVIEW_MODE` in
`features/appraisal/mocks/rep-appraisal-preview.ts` is currently enabled so the
Medical Rep appraisal UI can be reviewed before backend support lands.

This is UI preview data only. It does not call `GET /api/appraisals/rep`, it is
not server data, and the acknowledgement state is held only in React state for
the current rendered session.

## Existing Backend Audit

Current appraisal routes:

- `POST /api/appraisals` - Manager only, creates an appraisal.
- `GET /api/appraisals` - Manager only, lists appraisals.

Current appraisal records include:

- `id`
- `repId`
- `managerId`
- `period`
- `presentationSkills`
- `sellingSkills`
- `reporting`
- `productInformation`
- `competitorsInformation`
- `organizationalValueAwareness`
- `properUtilizationOfResources`
- `reliabilityAndCredibility`
- `independenceAndJudgment`
- `teamSpirit`
- `personalDrive`
- `creativityAndInitiative`
- `broadProspective`
- `communicationSkills`
- `planningAndOrganizing`
- `appearance`
- `attitude`
- `timing`
- `feedbackComments`
- `createdAt`
- `updatedAt`
- related `rep`
- related `manager`

No Medical Rep retrieval, acknowledgement, rep comment, or acknowledgement timestamp support exists yet.

## Required Rep Retrieval

Recommended route, matching the coaching route convention:

`GET /api/appraisals/rep`

It should return only appraisals where `repId` belongs to the authenticated Medical Rep.

Response should use the existing appraisal model plus acknowledgement fields:

```json
{
  "success": true,
  "results": 1,
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "skip": 0,
    "totalPages": 1,
    "next": null,
    "prev": null
  },
  "data": [
    {
      "id": "appraisal-id",
      "repId": "rep-id",
      "managerId": "manager-id",
      "period": "2026-09-30T00:00:00.000Z",
      "presentationSkills": 86,
      "sellingSkills": 84,
      "reporting": 80,
      "productInformation": 88,
      "competitorsInformation": 78,
      "organizationalValueAwareness": 82,
      "properUtilizationOfResources": 85,
      "reliabilityAndCredibility": 90,
      "independenceAndJudgment": 83,
      "teamSpirit": 87,
      "personalDrive": 89,
      "creativityAndInitiative": 79,
      "broadProspective": 81,
      "communicationSkills": 86,
      "planningAndOrganizing": 84,
      "appearance": 92,
      "attitude": 90,
      "timing": 88,
      "feedbackComments": "Manager feedback text",
      "acknowledged": false,
      "acknowledgedAt": null,
      "repComment": null,
      "createdAt": "2026-09-20T16:29:00.000Z",
      "updatedAt": "2026-09-20T16:29:00.000Z",
      "rep": {
        "id": "rep-id",
        "name": "Rep Name",
        "email": "rep@example.com",
        "role": "MEDICAL_REP",
        "department": null,
        "location": null
      },
      "manager": {
        "id": "manager-id",
        "name": "Manager Name",
        "email": "manager@example.com"
      }
    }
  ]
}
```

## Required Acknowledgement

Recommended route, matching the coaching patch convention:

`PATCH /api/appraisals/:id`

Request:

```json
{
  "accept": true,
  "comment": "Thank you for the feedback."
}
```

Expected behavior:

- Identify the Medical Rep from the authenticated token.
- Verify the appraisal belongs to that Medical Rep.
- Prevent the Rep from changing manager-entered scores, period, reviewer, or feedback.
- Persist the Rep comment separately from `feedbackComments`.
- Persist acknowledgement state.
- Store server-side `acknowledgedAt`.
- Return the updated appraisal record.
- Prevent repeated acknowledgement unless business rules explicitly allow it.
- Notify the manager when notification infrastructure supports it.

## Doctors And Pharmacies Authorization Note

The Medical Rep frontend now filters `/rep/doctors` and `/rep/pharmacies` by
the authenticated profile `subRegionId` resolved through `GET /api/regions`.
That prevents broad records from being rendered in those frontend pages, but it
is not backend authorization.

Backend enforcement is still required so authenticated Medical Reps only receive
Doctors and Pharmacies in their assigned operational territory from the API.
