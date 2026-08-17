# Goldera Pharm CRM - Detailed Project Documentation

This document provides an in-depth technical and functional overview of the Goldera Pharm CRM system. It is designed to guide developers and stakeholders through the architecture, specific features, folder structures, and role-based workflows of the platform.

---

## 1. Comprehensive File Structure

The project is built as a decoupled full-stack application, divided into the **backend** (`goldBack`) and **frontend** (`goldFront`).

### Backend (`goldBack`)
The backend is an Express REST API utilizing Prisma for ORM, connected to a PostgreSQL database.

```text
goldBack/
│
├── config/                  # Configuration & external service integrations
│   ├── db.js                # Database connection utilities
│   └── regions.js           # Pre-configured region settings
│
├── controllers/             # Business logic handlers for all API endpoints
│   ├── HandlerFactory.js    # Shared CRUD controller factory
│   ├── auth.controller.js   # Authentication logic
│   ├── profile.controller.js# User profile management
│   ├── manager.controller.js# Manager operations
│   ├── supervisor.controller.js # Supervisor operations
│   ├── rep.controller.js    # Medical rep operations
│   ├── doctor.controller.js # Doctor data management
│   ├── pharmacies.controller.js # Pharmacy management
│   ├── account.controller.js# Account management
│   ├── visit.controller.js  # Visit scheduling and reporting
│   ├── plan.controller.js   # Work plan management
│   ├── request.controller.js# Leave, expense, and sample requests
│   ├── coaching-reports.controller.js # Field coaching reports
│   ├── appraisal.controller.js # Performance appraisals
│   ├── product.controller.js# Products catalog
│   ├── sales.controller.js  # Sales data imports and tracking
│   ├── forecast.controller.js # Product sales forecasting
│   ├── region.controller.js # High-level geographical territories
│   ├── subRegion.controller.js # Sub-level geographical territories
│   └── dashboard.controller.js # Analytics and KPIs
│
├── middlewares/             # Custom Express middlewares
│   ├── auth.middleware.js   # JWT verification and Role guards
│   ├── error.middleware.js  # Global error handler
│   └── rep.middleware.js    # Rep-specific validation guards
│
├── routes/                  # Express route aggregators mapping to controllers
│   ├── index.js             # Main router registry
│   └── *.route.js           # Specific route definitions (e.g. visit.route.js)
│
├── utils/                   # Shared utilities
│   ├── apiFeatures.js       # Pagination, filtering, sorting logic
│   ├── apiError.js          # Custom error classes
│   ├── jwtToken.js          # JWT token generation
│   ├── cloudinary.js        # File upload logic to Cloudinary
│   ├── multer.js            # Multer config for file parsing
│   └── fileValidator.js     # File type validation
│
├── prisma/                  # Database configuration
│   ├── schema.prisma        # Prisma models and relationships
│   └── migrations/          # PostgreSQL migrations
│
├── .env                     # Environment variables
└── server.js                # Main Express server entry point
```

### Frontend (`goldFront`)
The frontend is built using **Next.js (App Router)**, providing an SSR and Client-side rendered hybrid architecture tailored for fast performance and secure role routing.

```text
goldFront/
│
├── app/                     # Next.js App Router
│   ├── (dashboard)/         # Protected dashboard layouts and pages
│   ├── layout.tsx           # Global root layout (Providers, Fonts)
│   ├── loading.tsx          # Global loading state
│   ├── not-found.tsx        # Global 404 page
│   └── page.tsx             # Public landing and authentication gateway
│
├── core/                    # Domain types, schemas, and shared constants
│
├── features/                # Domain-Driven feature modules (UI & logic)
│   ├── appraisal/           # Appraisal forms and lists
│   ├── auth/                # Login forms and auth contexts
│   ├── coaching/            # Coaching report interfaces
│   ├── dashboard/           # Role-specific analytics widgets
│   ├── doctors/             # Doctor directory and profiles
│   ├── forecast/            # Sales forecasting tools
│   ├── hr/                  # Human resources data views
│   ├── pharmacies/          # Pharmacy directory
│   ├── plan/                # Calendar and plan builders
│   ├── products/            # Product catalog
│   ├── profile/             # User profile settings
│   ├── reports/             # Generated operational reports
│   ├── requests/            # Leave, expense, and marketing request forms
│   ├── sales/               # Sales tracking data grids
│   ├── settings/            # System settings
│   ├── target/              # Sales target configurations
│   ├── team/                # Team hierarchy and user management
│   └── visits/              # Visit schedulers and report forms
│
├── services/                # API and External Service Clients
│   ├── http.ts              # Core Axios/Fetch wrapper injecting Bearer tokens
│   └── api-error.ts         # Standardized API error handling
│
├── components/              # Shared generic UI components (Buttons, Inputs, Modals)
├── hooks/                   # Shared React hooks (e.g., useAuth)
├── lib/                     # 3rd party initializations (e.g., UI libraries)
├── public/                  # Static assets (Favicons, logos)
├── styles/                  # Global CSS, Tailwind config (if used)
├── proxy.ts                 # Next.js middleware for role-based route protection
└── package.json             # Frontend dependencies
```

---

## 2. Exhaustive Project Features

The platform provides an extensive suite of tools tailored for pharmaceutical sales, categorized by their domain:

### 🧑‍💼 Identity & Organization Management
- **Role-Based Access Control (RBAC):** Deeply integrated roles (`MANAGER`, `SUPERVISOR`, `MEDICAL_REP`). The `proxy.ts` middleware on the frontend and `auth.middleware.js` on the backend ensure users only access authorized routes.
- **Hierarchical Trees:** Managers supervise multiple Supervisors, who in turn manage multiple Medical Reps. Data visibility flows upward.
- **Territory Management (`region`, `subRegion`):** Reps and customers are mapped to strict geographic nodes, allowing aggregated geographic reporting.

### 🏥 Customer Coverage (Doctors & Pharmacies)
- **Master Data:** Directories for Doctors, Pharmacies, and generic Accounts.
- **Assignment:** Reps are assigned specific customer pools based on their territory.
- **Profiling:** Detailed customer profiles including specialty, class, and visit history.

### 📅 Operational Field Work (Visits & Plans)
- **Work Plans (`plan`):** Reps draft weekly and monthly itineraries.
- **Visit Scheduling (`visit`):** Linking scheduled appointments to specific Doctors or Pharmacies.
- **Visit Execution:** In-field tracking allowing reps to input notes, select discussed products, and mark visits as completed or missed.

### 📝 Approvals & Requests Workflow
- **Request Engine (`request`):** A unified system for operational requests:
  - Leave & Vacation requests.
  - Expense and reimbursement claims.
  - Promotional material and product sample requests.
- **Approval Chains:** Requests pass from Rep -> Supervisor -> Manager depending on the request type and rules.

### 📊 Performance & Evaluation
- **Field Coaching (`coaching-reports`):** Supervisors evaluate Reps during joint field visits, providing actionable feedback and scoring on presentation skills.
- **Formal Appraisals (`appraisal`):** Managers conduct periodic (quarterly/annual) performance reviews based on hard data (sales) and soft skills (competencies).

### 📈 Commercial & Analytics
- **Product Catalog (`product`):** Centralized list of promoted pharmaceutical products.
- **Forecasting (`forecast`):** Reps input expected sales pipelines by product and doctor.
- **Sales Tracking (`sales`):** Bulk import of actual sales data from distributors via CSV/Excel, matched against targets.
- **Dashboards (`dashboard`):** Real-time analytics showing KPI fulfillment, call rates, coverage frequency, and sales vs. target.

---

## 3. Detailed User & Admin Workflows

The system diverges entirely based on the user's role. Below are the detailed daily workflows for the primary roles.

### A. The Medical Rep Flow (End-User)
*The Medical Rep interacts with the system primarily as a daily operational tool while in the field.*

1. **Morning Routine:**
   - Logs into the system via the `auth` module.
   - The frontend `proxy.ts` detects the `MEDICAL_REP` role and routes them to the **Rep Dashboard**.
   - Reviews the approved **Weekly Plan** to see the list of Doctors/Pharmacies to visit today.
2. **In-Field Execution (The Visit Loop):**
   - Travels to a clinic. Opens the **Doctor Profile** via the `doctors` feature.
   - Reviews past **Visit Reports** to recall previous discussions.
   - Conducts the visit.
   - Submits a new **Visit Report**:
     - Marks status as 'Completed'.
     - Inputs discussion notes.
     - Selects the `products` promoted and the `samples` dropped off.
3. **Administrative Tasks:**
   - End of day: Navigates to `requests` to log out-of-pocket expenses (e.g., travel).
   - End of week: Drafts the next week's **Plan** and clicks "Submit for Approval".
   - End of month: Inputs product **Forecasts** for their assigned territory.
4. **Feedback Loop:**
   - Reviews recent **Coaching Reports** submitted by their Supervisor to improve their pitch.

### B. The Supervisor Flow (Middle Management)
*The Supervisor acts as the bridge, monitoring field activity and coaching reps.*

1. **Daily Monitoring:**
   - Logs in and is routed to the **Supervisor Dashboard**.
   - Views aggregate call rates and coverage metrics for their specific team of Reps.
2. **Approvals:**
   - Reviews pending **Plans** submitted by Reps. Approves them or sends them back with comments.
   - Reviews standard **Requests** (e.g., standard leave or small expenses).
3. **Joint Visits (Coaching):**
   - Travels to the field with a Medical Rep.
   - Opens the **Coaching** module and fills out a structured evaluation on the Rep's performance during the doctor visit.

### C. The Manager Flow (Admin / Top Level)
*The Manager oversees the entire operation, manages master data, and analyzes commercial success.*

1. **High-Level Analytics:**
   - Logs in and is routed to the **Manager Dashboard**.
   - Views macro-level data: National sales vs. target, region-by-region performance, and overall organization activity.
2. **Team & Territory Management:**
   - Navigates to the **Team** module. Creates new user accounts, assigns roles, and places them into the hierarchy.
   - Adjusts **Regions** and **Sub-Regions** if territories change.
3. **Commercial Data Management:**
   - Accesses the **Sales** module. Uploads monthly sales data spreadsheets received from distributors. The backend parses this data and updates the analytics.
   - Manages the **Product** catalog, updating targets or adding new launches.
4. **Final Approvals & HR:**
   - Serves as the final approver for escalated **Requests** (e.g., high-budget marketing events, extended leave).
   - Conducts formal **Appraisals** for Supervisors and Reps, finalizing performance bonuses.
