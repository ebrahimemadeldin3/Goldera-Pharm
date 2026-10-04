# 🚀 Frontend Developer Integration Guide & API Reference
**GolderaPharma CRM / Medical Rep System**

---

## 📌 1. System Overview & Quick Start

The **GolderaPharma CRM Backend** is a RESTful API powering a three-tier pharmaceutical medical representative management system:
- **`MANAGER`**: Full system administration, user management, global analytics, appraisals, doctor/product master data, sales imports.
- **`SUPERVISOR`**: Manages regional teams of Medical Reps, reviews and approves work plans, conducts joint coaching visits, tracks requests and team performance.
- **`MEDICAL_REP`**: Schedules & logs doctor visits, submits weekly/monthly plans, requests (leave, expense, samples, marketing), submits product forecasts, and views assigned sub-region metrics.

### 🌐 Base URLs & Environment
- **Development Base URL:** `http://localhost:5050/api`
- **CORS Config:** Configured with `credentials: true`. Frontend origin defaults to `http://localhost:3000` (configurable via `CLIENT_URL` in `.env`).
- **All routes are prefixed with `/api`**.

---

## 🔐 2. Authentication & Authorization

### 2.1 Token Handling
All protected endpoints require a valid JWT token. The server checks for tokens in three places (in order of priority):
1. **HTTP Header (Recommended):** `Authorization: Bearer <accessToken>`
2. **Cookie:** `accessToken=<token>`
3. **Request Body:** `{ "token": "<token>" }`

### 2.2 Role-Based Access Control (RBAC) Matrix

| Resource / Endpoint | `MANAGER` | `SUPERVISOR` | `MEDICAL_REP` | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Auth** (`/auth/login`, `/auth/signup`) | Public | Public | Public | Standard authentication |
| **Profile** (`/profiles/**`) | ✅ | ✅ | ✅ | Own profile & avatar |
| **Dashboard** (`/dashboard/reps`) | ❌ | ❌ | ✅ | Rep KPI dashboard |
| **Dashboard** (`/dashboard/managers`) | ✅ | ❌ | ❌ | Manager overview dashboard |
| **User Management** (`/managers/users/**`) | ✅ | ❌ | ❌ | CRUD all users & accounts |
| **Team Management** (`/supervisors/team/**`) | ✅ | ✅ | ❌ | Supervisor/Manager team views |
| **Doctors** (Read) | ✅ | ✅ | ✅ | Doctors list & details |
| **Doctors** (Create / Update / Delete / CSV) | ✅ | ❌ | ❌ | Master data management |
| **Visits** (Schedule / My Visits / Reports) | ✅ | ✅ | ✅ | Rep visit execution |
| **Visits** (View All Rep Visits & Reports) | ✅ | ✅ | ❌ | Supervisor & Manager access |
| **Plans** (Create / My Plans) | ✅ | ✅ | ✅ | Rep work plans |
| **Plans** (Management Approval `/plans/mgmt`) | ✅ | ✅ | ❌ | Supervisor review workflow |
| **Plans** (View All `/plans/all`) | ✅ | ❌ | ❌ | Manager global view |
| **Requests** (Submit `/requests`) | ✅ | ✅ | ✅ | Leave, Expense, Samples, etc. |
| **Requests** (Approve / Reject `PATCH /requests/:id`) | ✅ | ✅ | ❌ | Manager & Supervisor decision |
| **Coaching Reports** (Create) | ✅ | ✅ | ❌ | Supervisor joint visit evaluations |
| **Coaching Reports** (Rep Feedback & Accept) | ❌ | ❌ | ✅ | Rep acknowledgment |
| **Appraisals** (`/appraisals/**`) | ✅ | ❌ | ❌ | Formal performance reviews |
| **Forecasts** (Submit Rep Forecast) | ❌ | ❌ | ✅ | Rep product sales forecast |
| **Forecasts** (Approve / Review Forecasts) | ✅ | ✅ | ❌ | Supervisor/Manager review |
| **Sales Data** (View Rep Sales `/sales/reps`) | ❌ | ❌ | ✅ | Scoped to Rep's sub-region |
| **Sales Data** (Upload & View All) | ✅ | ❌ | ❌ | Excel import & global reports |
| **Master Data** (Regions, SubRegions, Products, Pharmacies) | ✅ Full | 👁️ Read | 👁️ Read | Catalog & Geo hierarchy |

---

## 📦 3. Standard Request & Response Envelopes

### 3.1 Successful Response Envelope
```json
{
  "status": "success",
  "message": "Data fetched successfully",
  "results": 25,
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "skip": 0,
    "totalPages": 3,
    "next": 2,
    "prev": 0
  },
  "data": [ /* ... payload object or array ... */ ]
}
```

### 3.2 Error Response Envelope
```json
{
  "status": "fail", // or "error"
  "message": "Invalid email or password",
  "stack": "..." // Only present in development mode (NODE_ENV=development)
}
```

### 3.3 Universal Query Features (Filtering, Sorting, Pagination & Search)
All list endpoints utilizing `ApiFeatures` support these query parameters:

| Query Param | Type | Default | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number | `?page=2` |
| `limit` | `number` | `10` | Records per page | `?limit=20` |
| `paginate` | `string` | `"true"` | Set to `"false"` to disable pagination and fetch all items | `?paginate=false` |
| `sort` | `string` | `-createdAt` | Sort field (Prisma order). Default is descending by creation date | `?sort=name` |
| `keyword` | `string` | `undefined` | Searches text fields (`title`, `description`) case-insensitively | `?keyword=cardio` |
| `<field>` | `any` | `undefined` | Direct field equality filters | `?status=PENDING&type=LEAVE` |

---

## 📁 4. File Upload Specifications

File uploads use `multipart/form-data`. Handled formats:

| Category | Endpoint | Field Name | Max Files | Max Size | Allowed MIME Types |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Profile Image** | `POST /api/profiles/profile-image` | `profileImage` | 1 | 5 MB | `image/jpeg`, `image/png` |
| **User Documents** | `POST /api/managers/users` | `resume`<br>`certificates` | 1<br>10 | 5 MB | `application/pdf` |
| **Request Attachments** | `POST /api/requests` | `pdfs` | 10 | 5 MB | `application/pdf` |
| **Excel Sheet (Doctors)** | `POST /api/doctors/csv` | `sheet` | 1 | 10 MB | `.xlsx`, `.xls` |
| **Excel Sheet (Sales)** | `POST /api/sales` | `sheet` | 1 | 10 MB | `.xlsx`, `.xls` |

> ⚠️ **Important:** Non-file form fields sent alongside multipart forms should be strings or stringified JSON if nested.

---

## 📡 5. Complete API Reference

---

### 🔑 5.1 Authentication (`/api/auth`)

#### 1. Login
- **Endpoint:** `POST /api/auth/login`
- **Auth:** Public
- **Request Body:**
```json
{
  "email": "user@golderapharm.com",
  "password": "SecretPassword123"
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "message": "User logged in successfully",
  "data": {
    "id": "c3b93475-4d08-4e0d-b108-967a57a87e5b",
    "name": "Dr. Ahmed Hassan",
    "email": "user@golderapharm.com",
    "role": "MEDICAL_REP",
    "phone": "+966500000000",
    "subRegionId": "subregion-uuid",
    "supervisorId": "supervisor-uuid",
    "managerId": "manager-uuid",
    "dateOfBirth": "1994-05-12T00:00:00.000Z",
    "dateOfRecruitment": "2023-01-15T00:00:00.000Z",
    "lastLogin": "2026-10-02T11:30:00.000Z",
    "profileImage": {
      "public_id": "profile_123",
      "url": "https://res.cloudinary.com/..."
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

#### 2. Signup
- **Endpoint:** `POST /api/auth/signup`
- **Auth:** Public
- **Request Body:**
```json
{
  "name": "Tariq Mansoor",
  "email": "tariq@golderapharm.com",
  "password": "SecurePassword123",
  "phone": "+966512345678",
  "role": "MEDICAL_REP", // "MANAGER" | "SUPERVISOR" | "MEDICAL_REP"
  "dateOfBirth": "1995-08-20"
}
```
- **Response (201 Created):** Same structure as login with new user data and JWT token.

---

### 👤 5.2 User Profile (`/api/profiles`)
*All endpoints require `guard` (Logged-in user).*

#### 1. Get Current Profile
- **Endpoint:** `GET /api/profiles`
- **Response (200 OK):** User object (password omitted).

#### 2. Update Current Profile
- **Endpoint:** `PATCH /api/profiles`
- **Request Body (Partial update allowed):**
```json
{
  "phone": "+966599999999",
  "bio": "Specialized in Cardiovascular and Metabolic portfolios.",
  "location": "Riyadh, Saudi Arabia",
  "educationBackground": "B.Sc. Pharmacy, King Saud University",
  "iqamaNumber": "2498765432",
  "passportNumber": "N12345678"
}
```

#### 3. Upload Profile Image
- **Endpoint:** `POST /api/profiles/profile-image`
- **Content-Type:** `multipart/form-data`
- **Body Field:** `profileImage` (File: JPG/PNG, max 5MB)
- **Response (200 OK):** Updated user object with `profileImage: { public_id, url }`.

#### 4. Remove Profile Image
- **Endpoint:** `DELETE /api/profiles/profile-image`
- **Response (200 OK):** Updated user object with `profileImage: null`.

---

### 📊 5.3 Dashboard Analytics (`/api/dashboard`)

#### 1. Medical Rep Dashboard
- **Endpoint:** `GET /api/dashboard/reps`
- **Roles:** `MEDICAL_REP`
- **Query Params:**
  - `date` *(optional)*: `YYYY-MM-DD` (Defaults to current date for today's visits)
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "rep": {
      "id": "rep-uuid",
      "name": "Ahmed Rep",
      "subRegion": { "id": "sub-uuid", "name": "Riyadh North" }
    },
    "metrics": {
      "coverage": "78.50%",
      "targetAchievement": "92.00%",
      "pendingRequestsCount": 2,
      "pendingRequests": [ /* Array of pending requests */ ],
      "todayVisitsCount": 4,
      "todayVisits": [
        {
          "id": "visit-uuid",
          "date": "2026-10-02T09:00:00.000Z",
          "time": "09:30 AM",
          "visitType": "ROUTINE",
          "status": "SCHEDULED",
          "doctor": {
            "id": "doc-uuid",
            "nameAR": "د. خالد العتيبي",
            "nameEN": "Dr. Khaled Al-Otaibi",
            "accountName": "Kingdom Hospital"
          },
          "createdBy": { "id": "rep-uuid", "name": "Ahmed Rep" }
        }
      ],
      "totalSales": 145800.50
    }
  }
}
```
*Note on Calculations:*
- `coverage = (plannedDoctors / totalAccountsInSubRegion) * 100`
- `targetAchievement = (completedVisitsThisMonth / plannedVisitsThisMonth) * 100`
- `totalSales = Sum of untaxed sales for all pharmacies located in Rep's sub-region.`

#### 2. Manager Dashboard
- **Endpoint:** `GET /api/dashboard/managers`
- **Roles:** `MANAGER`
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "totalSales": 1850400.75,
    "salesByRegion": {
      "Central Region": 820000.50,
      "Western Region": 630400.25,
      "Eastern Region": 400000.00
    },
    "productPerformance": {
      "Lipidex 20mg": 450000.00,
      "CardioCor 5mg": 380000.00,
      "GliclaSafe 60mg": 290000.00
    },
    "requestsCount": 48,
    "requests": [ /* Recent 50 requests */ ],
    "pendingRequestsCount": 7,
    "plansCount": 14,
    "plans": [ /* Current month plans */ ]
  }
}
```

---

### 📅 5.4 Plans Management (`/api/plans`)

#### 1. Create a Plan (Weekly / Monthly)
- **Endpoint:** `POST /api/plans`
- **Roles:** `MEDICAL_REP`, `SUPERVISOR`, `MANAGER`
- **Request Body:**
```json
{
  "title": "Week 41 - Riyadh Central Doctors Plan",
  "type": "WEEKLY", // "WEEKLY" | "MONTHLY"
  "status": "PENDING", // Initial status
  "description": "Covering top tier cardiologists and endocrinologists.",
  "startDate": "2026-10-05T00:00:00.000Z",
  "endDate": "2026-10-09T23:59:59.000Z",
  "targetVisits": 25,
  "objectives": [
    "Introduce new product packaging for CardioCor",
    "Secure commitments for Lipidex trial from 10 tier-A doctors"
  ],
  "doctorsWithDates": [
    { "doctorId": "doctor-uuid-1", "visitDate": "2026-10-05T10:00:00.000Z" },
    { "doctorId": "doctor-uuid-2", "visitDate": "2026-10-06T11:30:00.000Z" }
  ]
}
```

#### 2. Get Authenticated User's Plans
- **Endpoint:** `GET /api/plans`
- **Query Params:** Standard pagination (`page`, `limit`, `sort`, `status`)

#### 3. Management Pending Plans Review
- **Endpoint:** `GET /api/plans/mgmt`
- **Roles:** `SUPERVISOR`, `MANAGER`
- **Query Params:** `createdById` *(optional filter by specific rep)*
- **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "teamMembers": 5,
    "pendingPlans": 3,
    "repPlans": [ /* Array of plans submitted by supervised reps */ ],
    "myPlans": [ /* Array of plans created by the caller */ ]
  }
}
```

#### 4. Approve / Reject / Update Plan
- **Endpoint:** `PATCH /api/plans/:id`
- **Roles:** `SUPERVISOR`, `MANAGER`
- **Request Body:**
```json
{
  "status": "APPROVED", // "APPROVED" | "REJECTED" | "PENDING"
  "supervisorFeedback": "Plan looks solid. Ensure you prioritize Dr. Khaled."
}
```
> ⚡ **System Automation:** When a plan status is changed to `APPROVED`, the backend automatically generates scheduled `Visit` records for each doctor listed in the plan.

#### 5. Get Single Plan Details
- **Endpoint:** `GET /api/plans/:id`

#### 6. Get All System Plans
- **Endpoint:** `GET /api/plans/all`
- **Roles:** `MANAGER`

---

### 🩺 5.5 Doctor Visits & Visit Reports (`/api/visits`)

#### 1. Schedule a Visit
- **Endpoint:** `POST /api/visits`
- **Roles:** `MEDICAL_REP`, `SUPERVISOR`, `MANAGER`
- **Request Body:**
```json
{
  "doctorId": "doc-uuid",
  "date": "2026-10-05T10:00:00.000Z",
  "time": "10:30 AM",
  "visitType": "ROUTINE", // "ROUTINE" | "FOLLOW_UP" | "EMERGENCY"
  "samples": ["CardioCor 5mg Samples x 2", "Brochure"],
  "notes": "Follow up on previous discussion regarding dosage."
}
```

#### 2. Get My Visits
- **Endpoint:** `GET /api/visits`
- **Query Params:**
  - `date`: `YYYY-MM` or `YYYY-MM-DD` (Filters visits within that month)
  - `paginate`: `"false"` to retrieve complete calendar events without pagination
  - Standard pagination: `page`, `limit`, `sort`

#### 3. Get All Visits (Manager / Supervisor)
- **Endpoint:** `GET /api/visits/all`
- **Roles:** `MANAGER`, `SUPERVISOR`
- **Query Params:** `date` (day filter), `createdById` (rep filter), `paginate`

#### 4. Submit Visit Report (Completes Visit)
- **Endpoint:** `POST /api/visits/visit-reports`
- **Roles:** `MEDICAL_REP`, `SUPERVISOR`, `MANAGER`
- **Request Body:**
```json
{
  "visitId": "visit-uuid",
  "duration": "20 mins",
  "rating": "4.5",
  "visitPurpose": "Product Presentation",
  "discussedTopics": ["Efficacy data", "Safety profile", "Drug interactions"],
  "samplesProvided": ["Lipidex 20mg (10 boxes)", "CardioCor 5mg (5 boxes)"],
  "doctorFeedback": "Doctor showed keen interest and requested samples for 5 clinical trials.",
  "notes": "Scheduled next follow-up in two weeks."
}
```
> ⚡ **System Automation:** Automatically sets the associated Visit's `status` to `"COMPLETED"`.

#### 5. Get My Visit Reports
- **Endpoint:** `GET /api/visits/visit-reports`
- **Query Params:** `paginate`, `page`, `limit`, `sort`

#### 6. Get All Visit Reports (Management)
- **Endpoint:** `GET /api/visits/all-visit-reports`
- **Roles:** `MANAGER`, `SUPERVISOR`
- **Query Params:** `createdById` (filter by rep), `paginate`, `page`, `limit`

#### 7. Update Visit
- **Endpoint:** `PATCH /api/visits/:id`
- **Request Body:** Can update `status` (`"SCHEDULED" | "COMPLETED" | "CANCELLED"`), `time`, `date`, `notes`.

---

### 📝 5.6 Requests System (`/api/requests`)
Reps submit leave, expenses, samples, and marketing requests with document attachments.

#### 1. Create a Request
- **Endpoint:** `POST /api/requests`
- **Content-Type:** `multipart/form-data`
- **Common Fields:**
  - `title` *(string, required)*
  - `subject` *(string, required)*
  - `description` *(string)*
  - `type` *(required)*: `"LEAVE"` | `"EXPENSE"` | `"MARKETING"` | `"SAMPLE"` | `"PERSONAL_EXPENSE"`
  - `urgency` *(string)*: `"HIGH"` | `"MEDIUM"` | `"LOW"`

**Type-Specific Body Payloads:**

| Type | Required Fields | Required Files (`pdfs` field) |
| :--- | :--- | :--- |
| **`LEAVE`** | `leaveStartDate` (ISO Date), `leaveEndDate` (ISO Date), `leaveType` (e.g. `"ANNUAL"`, `"SICK"`, `"EMERGENCY"`) | Yes (e.g., Medical cert or leave approval slip) |
| **`EXPENSE`** / **`MARKETING`** | `budget` (number), `doctorIds` (Array of Doctor UUIDs) | Yes (Invoices / Quotations) |
| **`SAMPLE`** | `sampleData` (Array of objects: `[{"productId": "...", "qty": 10}]`) | No |
| **`PERSONAL_EXPENSE`** | `visitedCity` (string), `visitDaysCount` (number), `totalExpenseAmount` (number), `totalExpenseData` (Array of expense items: `[{"category": "Hotel", "amount": 400}]`) | Yes (Receipts) |

#### 2. Get My Requests
- **Endpoint:** `GET /api/requests`
- **Query Params:** Standard pagination (`page`, `limit`, `type`, `status`)

#### 3. Update Request Status & Response (Supervisor / Manager)
- **Endpoint:** `PATCH /api/requests/:id`
- **Roles:** `MANAGER`, `SUPERVISOR`
- **Request Body:**
```json
{
  "status": "APPROVED", // "APPROVED" | "REJECTED" | "PENDING"
  "response": "Approved. Please submit receipts to finance by end of month."
}
```
> ⚡ **System Automation:** If a `LEAVE` request is `APPROVED`, the user's `leaveDaysCountTotal` is automatically incremented by the calculated duration.

---

### 🤝 5.7 Coaching Reports (`/api/coaching-reports`)
Supervisors accompany reps on doctor visits and assess their selling & communication skills.

#### 1. Create Coaching Report
- **Endpoint:** `POST /api/coaching-reports`
- **Roles:** `SUPERVISOR`, `MANAGER`
- **Request Body:**
```json
{
  "repId": "rep-uuid",
  "doctorId": "doctor-uuid",
  "visitDate": "2026-10-02T10:00:00.000Z",
  "visitDuration": "25 mins",
  "visitLocation": "King Fahd Medical City",
  "performanceRating": 4, // 1 to 5
  "visitPros": [
    "Good opening and rapport building",
    "Strong product knowledge demonstrated"
  ],
  "visitCons": [
    "Need to handle price objections more assertively",
    "Closing could be more structured"
  ],
  "recommendations": "Review objection handling module in sales training.",
  "actionItems": [
    "Roleplay closing techniques with supervisor next week",
    "Follow up with Dr. Ahmed regarding clinical trial references"
  ],
  "notes": "Overall positive engagement."
}
```

#### 2. Supervisor Coaching Reports
- **Endpoint:** `GET /api/coaching-reports`
- **Roles:** `SUPERVISOR` (Returns reports created by this supervisor)

#### 3. Manager Coaching Reports
- **Endpoint:** `GET /api/coaching-reports/all`
- **Roles:** `MANAGER` (Returns all system coaching reports)

#### 4. Rep View Coaching Reports
- **Endpoint:** `GET /api/coaching-reports/rep`
- **Roles:** `MEDICAL_REP` (Returns coaching reports evaluated for this rep)

#### 5. Rep Response / Acceptance
- **Endpoint:** `PATCH /api/coaching-reports/:id`
- **Roles:** `MEDICAL_REP`
- **Request Body:**
```json
{
  "accept": true,
  "comment": "Thank you for the constructive feedback. I will schedule the roleplay session."
}
```

---

### ⭐ 5.8 Appraisals (`/api/appraisals`)
Managers perform periodic multi-competency assessments for reps.

#### 1. Create Appraisal
- **Endpoint:** `POST /api/appraisals`
- **Roles:** `MANAGER`
- **Request Body:**
```json
{
  "repId": "rep-uuid",
  "period": "2026-09-30T00:00:00.000Z",
  "salesPerformance": 4.5,
  "customerRelationships": 4.0,
  "productKnowledge": 5.0,
  "complianceAndRegulations": 5.0,
  "teamworkAndCollaboration": 4.0,
  "presentationSkills": 4,
  "sellingSkills": 4,
  "reporting": 5,
  "productInformation": 5,
  "competitorsInformation": 4,
  "organizationalValueAwareness": 5,
  "properUtilizationOfResources": 4,
  "reliabilityAndCredibility": 5,
  "independenceAndJudgment": 4,
  "teamSpirit": 4,
  "personalDrive": 5,
  "creativityAndInitiative": 4,
  "broadProspective": 4,
  "communicationSkills": 4,
  "planningAndOrganizing": 5,
  "appearance": 5,
  "attitude": 5,
  "timing": 5,
  "feedbackComments": "Exceptional performance this quarter. Top sales generator in Riyadh North."
}
```

#### 2. Get All Appraisals
- **Endpoint:** `GET /api/appraisals`
- **Roles:** `MANAGER`
- **Query Params:** Standard pagination (`page`, `limit`, `sort`, `repId`)

---

### 📈 5.9 Sales Forecasts (`/api/forecasts`)

#### 1. Submit Forecast
- **Endpoint:** `POST /api/forecasts`
- **Roles:** `MEDICAL_REP`
- **Request Body:**
```json
{
  "periodType": "MONTHLY", // "WEEKLY" | "MONTHLY" | "QUARTERLY"
  "periodDate": "2026-11-01T00:00:00.000Z",
  "productForecasts": [
    { "productId": "prod-uuid-1", "productName": "Lipidex 20mg", "targetQty": 500, "estimatedRevenue": 75000 },
    { "productId": "prod-uuid-2", "productName": "CardioCor 5mg", "targetQty": 300, "estimatedRevenue": 36000 }
  ],
  "notes": "Expecting higher demand following hospital tender approval."
}
```

#### 2. Get My Forecasts
- **Endpoint:** `GET /api/forecasts`
- **Roles:** `MEDICAL_REP`

#### 3. Management View All Forecasts
- **Endpoint:** `GET /api/forecasts/all`
- **Roles:** `SUPERVISOR`, `MANAGER`

#### 4. Approve / Review Forecast
- **Endpoint:** `PUT /api/forecasts/:id`
- **Roles:** `SUPERVISOR`, `MANAGER`
- **Request Body:**
```json
{
  "isApproved": true,
  "supervisorFeedback": "Targets are realistic and aligned with regional objectives."
}
```

---

### 🏥 5.10 Doctors Management (`/api/doctors`)

#### 1. Get All Doctors
- **Endpoint:** `GET /api/doctors`
- **Query Params:**
  - `subRegion`: Filter doctors by sub-region name (e.g. `?subRegion=Riyadh%20North`)
  - `paginate`: `"false"` for full dropdown lists
  - Standard pagination (`page`, `limit`, `keyword`, `sort`)

#### 2. Get Single Doctor
- **Endpoint:** `GET /api/doctors/:id`
- **Response includes:** Doctor details + last 4 visits.

#### 3. Create Doctor (Manager)
- **Endpoint:** `POST /api/doctors`
- **Roles:** `MANAGER`
- **Request Body:**
```json
{
  "nameAR": "د. عمر الفاروق",
  "nameEN": "Dr. Omar Al-Farooq",
  "email": "omar.farooq@hospital.sa",
  "phone": "+966501112233",
  "grade": "Consultant",
  "specialty": "Cardiology",
  "avgPatientsPerDay": 35,
  "accountName": "Specialized Medical Center",
  "subRegion": "Riyadh North",
  "area": "Olaya",
  "LicenseNumber": "SCHS-998877",
  "latitude": 24.7136,
  "longitude": 46.6753
}
```

#### 4. Import Doctors via Excel (Manager)
- **Endpoint:** `POST /api/doctors/csv`
- **Roles:** `MANAGER`
- **Content-Type:** `multipart/form-data`
- **Body Field:** `sheet` (Excel file `.xlsx` or `.xls`)
- **Excel Columns Expected:** `Name (Arabic)`, `Name (English)`, `Email`, `Phone`, `Grade`, `Avg Patients per Day`, `Specialty`, `License Number`, `Sub Region`, `Account Name`, `Area`.

#### 5. Update Doctor
- **Endpoint:** `PATCH /api/doctors/:id`
- **Roles:** `MANAGER`

#### 6. Delete Doctor
- **Endpoint:** `DELETE /api/doctors/:id`
- **Roles:** `MANAGER`

---

### 💊 5.11 Products Catalogue (`/api/products`)

#### 1. Get Products
- **Endpoint:** `GET /api/products`
- **Query Params:** `paginate`, `page`, `limit`, `keyword`

#### 2. Add Product(s) (Manager)
- **Endpoint:** `POST /api/products`
- **Roles:** `MANAGER`
- **Request Body:** Single object or Array of products:
```json
[
  {
    "name": "Lipidex 20mg",
    "internalRef": "LPD-20",
    "salesPrice": 150.00
  },
  {
    "name": "CardioCor 5mg",
    "internalRef": "CRD-05",
    "salesPrice": 120.00
  }
]
```

---

### 🏬 5.12 Pharmacies (`/api/pharmacies`)

#### 1. Get Pharmacies
- **Endpoint:** `GET /api/pharmacies`
- **Query Params:** Standard pagination (`page`, `limit`, `subRegion`, `city`, `region`)

#### 2. Add Pharmacy (Manager)
- **Endpoint:** `POST /api/pharmacies`
- **Roles:** `MANAGER`
- **Request Body:**
```json
[
  {
    "name": "Nahdi Pharmacy - Olaya 1",
    "city": "Riyadh",
    "region": "Central Region",
    "subRegion": "Riyadh North",
    "country": "Saudi Arabia"
  }
]
```

---

### 💰 5.13 Sales Ingestion & Analytics (`/api/sales`)

#### 1. Upload Sales Excel Sheet (Manager)
- **Endpoint:** `POST /api/sales`
- **Roles:** `MANAGER`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `sheetName` *(string, unique identifier for the batch, e.g. "Sept 2026 Sales")*
  - `sheet` *(File: `.xlsx` / `.xls`)*
- **Expected Excel Columns:** `Customer`, `Order`, `Order Date`, `Product Variant` (formatted as `[REF] Name`), `Qty Ordered`, `Untaxed Total`.

#### 2. Get All Sales (Manager)
- **Endpoint:** `GET /api/sales`
- **Roles:** `MANAGER`
- **Query Params:** `date`, `sheetName`, `page`, `limit`

#### 3. Get Rep's Sub-Region Sales
- **Endpoint:** `GET /api/sales/reps`
- **Roles:** `MEDICAL_REP`
- **Description:** Returns sales filtered automatically by all pharmacies in the logged-in rep's assigned sub-region.

#### 4. Get Specific Rep's Sales (Manager)
- **Endpoint:** `GET /api/sales/reps/:repId`
- **Roles:** `MANAGER`

---

### 🌍 5.14 Geographic Structure (`/api/regions` & `/api/sub-regions`)

#### 1. Regions
- `GET /api/regions`: List all regions with their supervisors and sub-regions.
- `POST /api/regions` *(Manager only)*: `{ "name": "Central Region", "country": "Saudi Arabia" }`

#### 2. Sub-Regions
- `GET /api/sub-regions`: List all sub-regions with parent region and assigned reps.
- `POST /api/sub-regions` *(Manager only)*: `{ "name": "Riyadh North", "regionId": "region-uuid" }`

---

### 👥 5.15 Team & User Administration (`/api/managers` & `/api/supervisors`)

#### 1. Create User (Manager Only)
- **Endpoint:** `POST /api/managers/users`
- **Roles:** `MANAGER`
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `name`, `email`, `password`, `phone`, `role` (`"MANAGER"` | `"SUPERVISOR"` | `"MEDICAL_REP"`)
  - `dateOfBirth`, `dateOfRecruitment`
  - `educationBackground`, `iqamaNumber`, `passportNumber`
  - `supervisorId` *(Required if role is `MEDICAL_REP`)*
  - `regionIds` *(Array or string if role is `SUPERVISOR`)*
  - `subRegionId` *(UUID if role is `MEDICAL_REP`)*
  - `resume` *(PDF file)*
  - `certificates` *(PDF files)*

#### 2. List All Users (Manager Only)
- **Endpoint:** `GET /api/managers/users`
- **Roles:** `MANAGER`
- **Query Params:** `role`, `isActive`, `page`, `limit`, `keyword`

#### 3. User Details with Calculated Performance Metrics
- **Endpoint:** `GET /api/managers/users/:id`
- **Roles:** `MANAGER`
- **Returns:** User details + `yearsOfExperience`, `totalVisits`, `totalSales`, `appraisalsForRep`, `reportsTo`.

#### 4. Update / Delete User
- `PUT /api/managers/users/:id`: Updates user fields (can also update password via `newPassword`).
- `DELETE /api/managers/users/:id`: Soft/Hard deletion of user.

#### 5. Supervisor Team Views
- `GET /api/supervisors/team`: Reps under this supervisor.
- `GET /api/supervisors/team/requests`: Pending requests from this supervisor's reps.
- `GET /api/supervisors/team/:repId`: Performance & profile details of a supervised rep.

#### 6. Manager Team Views
- `GET /api/managers/team`: All reps & supervisors under this manager.
- `GET /api/managers/team/requests`: Filter requests by role (`?role=MEDICAL_REP` or `?role=SUPERVISOR`).

---

## 💻 6. Frontend TypeScript Interfaces & Enums

You can directly copy and paste these TypeScript types into your frontend project (e.g. `src/types/api.ts`).

```typescript
// ==========================================
// Enums
// ==========================================
export type Role = "MANAGER" | "SUPERVISOR" | "MEDICAL_REP";

export type PlanType = "WEEKLY" | "MONTHLY";
export type PlanStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VisitType = "ROUTINE" | "FOLLOW_UP" | "EMERGENCY";
export type VisitStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type RequestType = "LEAVE" | "EXPENSE" | "MARKETING" | "SAMPLE" | "PERSONAL_EXPENSE";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Urgency = "LOW" | "MEDIUM" | "HIGH";

// ==========================================
// Base Models
// ==========================================
export interface CloudinaryFile {
  public_id: string;
  url: string;
  name?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  dateOfBirth?: string;
  dateOfRecruitment?: string;
  department?: string | null;
  location?: string | null;
  bio?: string | null;
  educationBackground?: string | null;
  iqamaNumber?: string | null;
  passportNumber?: string | null;
  resume?: CloudinaryFile | null;
  certificates?: CloudinaryFile[];
  profileImage?: CloudinaryFile | null;
  isActive?: boolean;
  lastLogin?: string | null;
  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
  leaveDaysCountTotal?: number;
  subRegionId?: string | null;
  subRegion?: SubRegion | null;
  supervisorId?: string | null;
  supervisor?: Pick<User, "id" | "name" | "email" | "phone"> | null;
  managerId?: string | null;
  manager?: Pick<User, "id" | "name" | "email" | "phone"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  nameAR?: string | null;
  nameEN?: string | null;
  email?: string | null;
  phone?: string | null;
  grade?: string | null;
  avgPatientsPerDay?: number | null;
  specialty?: string | null;
  LicenseNumber?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  accountName?: string | null;
  subRegion?: string | null;
  area?: string | null;
  createdAt: string;
  updatedAt: string;
  visits?: Visit[];
}

export interface PlanDoctorItem {
  id: string;
  nameAR?: string;
  nameEN?: string;
  accountName?: string;
  subRegion?: string;
  visitDate: string;
}

export interface Plan {
  id: string;
  title: string;
  type: PlanType;
  status: PlanStatus;
  description: string;
  startDate: string;
  endDate: string;
  doctors: PlanDoctorItem[];
  targetDoctors: number;
  targetVisits: number;
  objectives: string[];
  supervisorFeedback?: string | null;
  createdById: string;
  createdBy?: Pick<User, "id" | "name">;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  visitType: VisitType;
  samples: string[];
  date: string;
  time?: string | null;
  doctorId: string;
  doctor?: Pick<Doctor, "id" | "nameAR" | "nameEN" | "accountName">;
  userId: string;
  createdBy?: Pick<User, "id" | "name">;
  planId?: string | null;
  notes?: string | null;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VisitReport {
  id: string;
  visitId: string;
  userId: string;
  duration: string;
  rating: string;
  discussedTopics: string[];
  doctorFeedback?: string | null;
  visitPurpose: string;
  notes?: string | null;
  samplesProvided: string[];
  visit?: Visit;
  createdBy?: Pick<User, "id" | "name">;
  createdAt: string;
  updatedAt: string;
}

export interface RequestItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  urgency: Urgency | string;
  response?: string | null;
  responseDate?: string | null;
  handledAt?: string | null;
  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
  leaveType?: string | null;
  leaveDaysCount?: number | null;
  visitedCity?: string | null;
  visitDaysCount?: number | null;
  totalExpenseAmount?: number | null;
  totalExpenseData?: Array<{ category: string; amount: number; description?: string }>;
  sampleData?: Array<{ productId: string; productName?: string; qty: number }>;
  budget?: number | null;
  pdfs?: CloudinaryFile[];
  doctors?: Array<Pick<Doctor, "id" | "nameAR" | "nameEN">>;
  user?: Pick<User, "id" | "name">;
  createdAt: string;
  updatedAt: string;
}

export interface CoachingReport {
  id: string;
  repId: string;
  doctorId: string;
  createdById: string;
  visitDate: string;
  visitDuration: string;
  visitLocation: string;
  performanceRating: number;
  visitPros: string[];
  visitCons: string[];
  recommendations: string;
  actionItems: string[];
  notes?: string | null;
  repComment?: string | null;
  repAccepted?: boolean;
  rep?: Pick<User, "id" | "name" | "email" | "phone">;
  doctor?: Pick<Doctor, "id" | "nameAR" | "nameEN" | "email" | "phone">;
  createdBy?: Pick<User, "id" | "name" | "email" | "phone">;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  internalRef: string;
  salesPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  city: string;
  region: string;
  subRegion: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: string;
  name: string;
  country: string;
  supervisor?: Pick<User, "id" | "name" | "email" | "phone"> | null;
  subRegions?: SubRegion[];
  createdAt: string;
}

export interface SubRegion {
  id: string;
  name: string;
  regionId: string;
  region?: Region;
  reps?: Pick<User, "id" | "name" | "email" | "phone">[];
  createdAt: string;
}

// ==========================================
// API Response Wrappers
// ==========================================
export interface PaginationMeta {
  currentPage: number;
  limit: number;
  skip: number;
  totalPages: number;
  next: number;
  prev: number;
}

export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  message?: string;
  results?: number;
  pagination?: PaginationMeta | null;
  data: T;
  token?: string;
}
```

---

## 🛠 7. Frontend Client Setup Example (Axios)

Here is a production-ready Axios configuration with token interceptors and error handling:

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api',
  withCredentials: true, // Enables cookies
  timeout: 30000,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);
```

---

## 💡 8. Key Implementation Tips for Frontend Developers

1. **Date & Time Formatting:**
   - Always send dates as **ISO 8601 strings** (e.g. `2026-10-05T00:00:00.000Z` or `new Date().toISOString()`).
   - For visit calendar queries, pass `?paginate=false&date=2026-10` to get all scheduled visits in that month.
2. **Uploading Requests with Attachments:**
   - When calling `POST /api/requests`, construct a `FormData` object.
   - For `doctorIds` and `sampleData`, append JSON strings or multiple keys depending on field specification.
   - For `pdfs`, append each selected File object under key `pdfs` (e.g., `formData.append('pdfs', file)`).
3. **Plan Approval Flow:**
   - When a manager or supervisor approves a plan (`PATCH /api/plans/:id` with `{ "status": "APPROVED" }`), tell the user that doctor visits have been automatically added to their calendar.
4. **Coaching Workflow:**
   - In the Medical Rep portal, display a prominent badge when `repAccepted === false` on a coaching report so they can read feedback and submit their comments.
