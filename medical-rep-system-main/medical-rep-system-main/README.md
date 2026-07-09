# 🏥 Medical Rep System (GolderaPharma CRM)

A backend REST API for managing pharmaceutical sales representatives, built with **Node.js**, **Express**, and **PostgreSQL** via **Prisma ORM**. The system supports a three-tier organizational hierarchy — Managers, Supervisors, and Medical Reps — with full lifecycle management of doctor visits, sales plans, requests, appraisals, and more.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Migrations](#-database-migrations)

---

## ✨ Features

- **Role-Based Access Control** — Three roles: `MANAGER`, `SUPERVISOR`, `MEDICAL_REP`, each with scoped permissions
- **Visit Management** — Schedule, track, and report on doctor visits (Routine, Follow-Up, Emergency)
- **Sales Plans** — Weekly and monthly plans with approval workflows (Pending → Approved/Rejected)
- **Requests System** — Handle Leave, Expense, Sample, Marketing, and Personal Expense requests
- **Coaching Reports** — Supervisors evaluate reps during joint visits with performance ratings
- **Appraisals** — Comprehensive rep performance reviews across 20+ competency metrics
- **Forecasting** — Reps submit product sales forecasts; supervisors approve and provide feedback
- **Dashboard Analytics** — Role-specific dashboards aggregating KPIs: coverage %, target achievement, sales by region, product performance
- **Doctor & Pharmacy Management** — Geo-tagged doctors with account/region linkage; pharmacy data by sub-region
- **File Uploads** — Profile images, PDFs, and certificates via Cloudinary
- **Sales Ingestion** — Import sales data from Excel sheets with product mapping

---

## 🛠 Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Runtime          | Node.js (ESM modules)               |
| Framework        | Express v5                          |
| Database         | PostgreSQL                          |
| ORM              | Prisma v7                           |
| Authentication   | JWT (jsonwebtoken)                  |
| Password Hashing | bcrypt                              |
| File Storage     | Cloudinary                          |
| File Uploads     | Multer                              |
| Security         | Helmet, CORS                        |
| Utilities        | date-fns, xlsx, compression, morgan |

---

## 📁 Project Structure

```
medical-rep-system/
├── server.js                   # Entry point — Express app setup
├── prisma/
│   ├── schema.prisma           # Database schema & models
│   └── migrations/             # Auto-generated SQL migration history
├── config/
│   ├── index.js                # Environment variable exports
│   ├── db.js                   # Prisma client initialization
│   └── regions.js              # Static region/sub-region data
├── routes/
│   ├── index.js                # Mounts all route modules
│   ├── auth.route.js
│   ├── rep.route.js
│   ├── supervisor.route.js
│   ├── manager.route.js
│   ├── visit.route.js
│   ├── plan.route.js
│   ├── request.route.js
│   ├── coaching-reports.route.js
│   ├── appraisal.route.js
│   ├── forecast.route.js
│   ├── doctor.route.js
│   ├── pharmacy.route.js
│   ├── product.route.js
│   ├── sale.route.js
│   ├── region.route.js
│   ├── subRegion.route.js
│   ├── profile.route.js
│   └── dashboard.route.js
├── controllers/
│   ├── HandlerFactory.js       # Generic CRUD factory functions
│   ├── auth.controller.js
│   ├── rep.controller.js
│   ├── supervisor.controller.js
│   ├── manager.controller.js
│   ├── visit.controller.js
│   ├── plan.controller.js
│   ├── request.controller.js
│   ├── coaching-reports.controller.js
│   ├── appraisal.controller.js
│   ├── forecast.controller.js
│   ├── doctor.controller.js
│   ├── pharmacies.controller.js
│   ├── product.controller.js
│   ├── sales.controller.js
│   ├── region.controller.js
│   ├── subRegion.controller.js
│   ├── profile.controller.js
│   └── dashboard.controller.js
├── middlewares/
│   ├── auth.middleware.js      # JWT guard + role-based allowedTo()
│   ├── rep.middleware.js       # Rep-specific middleware
│   └── error.middleware.js     # Global error handler
└── utils/
    ├── apiError.js             # Custom error class
    ├── apiFeatures.js          # Filtering, sorting, pagination helpers
    ├── jwtToken.js             # Token generation
    ├── cloudinary.js           # Cloudinary config & upload helpers
    ├── multer.js               # Multer disk/memory storage setup
    └── fileValidator.js        # File type validation (magic bytes)
```

---

## 🗄 Data Models

### User

The central entity. All staff are `User` records with one of three roles.

| Field                | Type           | Notes                                  |
| -------------------- | -------------- | -------------------------------------- |
| `id`                 | UUID           | Primary key                            |
| `role`               | Enum           | `MANAGER`, `SUPERVISOR`, `MEDICAL_REP` |
| `supervisorId`       | FK → User      | Reps report to a supervisor            |
| `managerId`          | FK → User      | Supervisors report to a manager        |
| `subRegionId`        | FK → SubRegion | Reps are assigned a sub-region         |
| `isActive`           | Boolean        | Soft activation flag                   |
| `leaveStartDate/End` | DateTime       | Tracks approved leave periods          |

### Plan

Weekly or monthly work plans created by reps and approved by supervisors.

- **Status flow:** `PENDING` → `APPROVED` / `REJECTED`
- Includes target doctor/visit counts, objectives, and supervisor feedback

### Visit

Doctor visits executed by reps under an optional plan.

- **Types:** `ROUTINE`, `FOLLOW_UP`, `EMERGENCY`
- **Status:** `SCHEDULED`, `COMPLETED`, `CANCELLED`
- Each completed visit can have a detailed `VisitReport`

### Request

Reps submit requests to supervisors/managers for approval.

- **Types:** `LEAVE`, `EXPENSE`, `PERSONAL_EXPENSE`, `SAMPLE`, `MARKETING`
- Supports document attachments (PDFs stored as JSON), expense itemisation, and sample quantities

### CoachingReport

Joint visits where a supervisor accompanies and evaluates a rep's performance.

- Performance rating (numeric), pros/cons, action items, recommendations
- Rep can accept/comment on the coaching report

### Appraisal

Formal annual/periodic performance reviews by managers covering 20+ competencies including sales performance, product knowledge, communication skills, creativity, and attitude.

### Forecast

Reps submit product-level sales forecasts (weekly/monthly). Supervisors review and approve with feedback.

### Region / SubRegion

Hierarchical geographic structure. Regions are managed by supervisors. Sub-regions contain accounts and reps.

### Doctor / Accounts / Pharmacy

- **Doctor** — Has geo-coordinates, specialty, grade, avg patients/day, and links to an account
- **Accounts** — Groups of doctors within a sub-region
- **Pharmacy** — Standalone entity tracked by city/region for sales aggregation

### Products & Sales

- **Products** — Internal product catalogue with pricing
- **Sales** — Imported from Excel; tracks customer (pharmacy), product, quantity, and revenue

---

## 🌐 API Endpoints

All routes are prefixed with `/api`.

| Prefix                  | Resource                                 |
| ----------------------- | ---------------------------------------- |
| `/api/auth`             | Login & Signup                           |
| `/api/profiles`         | View & update authenticated user profile |
| `/api/reps`             | Rep management (Supervisor/Manager)      |
| `/api/supervisors`      | Supervisor management (Manager)          |
| `/api/managers`         | Manager management                       |
| `/api/doctors`          | Doctor CRUD & search                     |
| `/api/visits`           | Visit scheduling & reports               |
| `/api/plans`            | Plan creation & approval                 |
| `/api/requests`         | Request submission & approval            |
| `/api/coaching-reports` | Coaching report CRUD                     |
| `/api/appraisals`       | Appraisal management                     |
| `/api/forecasts`        | Sales forecast submission & approval     |
| `/api/products`         | Product catalogue                        |
| `/api/pharmacies`       | Pharmacy management                      |
| `/api/sales`            | Sales data ingestion & queries           |
| `/api/regions`          | Region management                        |
| `/api/sub-regions`      | Sub-region management                    |
| `/api/dashboard`        | Role-specific dashboard metrics          |

### Dashboard Endpoints

`GET /api/dashboard/rep` — Returns for the authenticated rep:

- Coverage % (planned doctors / total accounts in sub-region)
- Target achievement % (completed visits / planned visits)
- Today's visits with doctor details
- Pending requests
- Total sales for sub-region pharmacies

`GET /api/dashboard/manager` — Returns aggregate data for managers:

- Total sales revenue
- Sales broken down by region and by product
- Recent and pending requests
- Monthly plan counts

---

## 🔐 Authentication & Authorization

### Authentication

JWT-based. Tokens can be sent via:

- `Authorization: Bearer <token>` header
- `accessToken` cookie
- `token` field in the request body

The `guard` middleware validates the token and attaches `req.user` to every protected request.

### Authorization

Role guards use the `allowedTo(...roles)` middleware factory:

```js
// Example: only managers and supervisors can approve plans
router.patch(
  "/:id/approve",
  guard,
  allowedTo("MANAGER", "SUPERVISOR"),
  approvePlan,
);
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- Cloudinary account (for file uploads)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mhmdbrkv/medical-rep-system.git
cd medical-rep-system

# 2. Install dependencies (Prisma client is auto-generated via postinstall)
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 4. Run database migrations
npx prisma migrate deploy

# 5. Start the server
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5050` by default.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=5050
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# JWT
JWT_ACCESS_SECRET_KEY=your_super_secret_key
JWT_ACCESS_EXPIRE_TIME=7d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Initial Manager Credentials (seed)
MANAGER_EMAIL=manager@company.com
MANAGER_PASSWORD=securepassword
```

---

## 🗃 Database Migrations

Migrations are managed with Prisma Migrate.

```bash
# Apply all pending migrations (production / CI)
npx prisma migrate deploy

# Create a new migration during development
npx prisma migrate dev --name describe_your_change

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Re-generate the Prisma client after schema changes
npx prisma generate
```

---

## 🔒 Security Highlights

- **Helmet** — Sets secure HTTP response headers
- **CORS** — Restricted to `CLIENT_URL` origin with credentials support
- **bcrypt** — Passwords hashed with salt rounds of 10
- **Magic bytes validation** — File uploads validated by actual file content, not just extension
- **JSON body limit** — Capped at 20 KB to prevent payload attacks
- **Global error handling** — Unhandled promise rejections and uncaught exceptions trigger graceful server shutdown

---

## 📄 License

ISC
