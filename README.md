# 🏥 Goldera Pharm CRM

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

> **Enterprise Pharmaceutical Customer Relationship Management & Field Force Automation System**  
> Designed to streamline field operations, doctor and pharmacy targeting, hierarchical approvals, sales forecasting, joint field coaching, and commercial analytics.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Role-Based Access & Workflows](#-role-based-access--workflows)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup (`goldBack`)](#2-backend-setup-goldback)
  - [3. Frontend Setup (`goldFront`)](#3-frontend-setup-goldfront)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Production & Deployment](#-production--deployment)
- [License](#-license)

---

## 🌟 Overview

**Goldera Pharm CRM** is a modern, full-stack enterprise web application built specifically for the pharmaceutical industry. It bridges the communication and operational gap between **Medical Representatives (reps)** in the field, **Field Supervisors**, and **Executive Sales Managers**.

The system automates the complete lifecycle of pharmaceutical sales operations:
- Healthcare Professional (HCP) and Pharmacy profiling.
- Territory assignment across geographical regions and sub-regions.
- Weekly and monthly field plan scheduling and submission.
- Detailed visit execution reporting with promoted product discussions and sample tracking.
- Multi-tier administrative request approvals (leave, travel expenses, promotional materials).
- Joint field coaching evaluations and structured competency appraisals.
- Distributor sales ingestion from Excel spreadsheets matched against territorial targets.
- Dynamic, real-time KPI dashboards tailored to each organizational role.

---

## 🏗 System Architecture

The project is structured as a decoupled monorepo composed of a high-performance **Next.js** frontend and a robust **Express / Prisma** RESTful backend:

```mermaid
graph TD
    User([User Browser])
    
    subgraph Frontend ["Frontend (goldFront) - Next.js 16 / React 19"]
        Proxy["Next.js Proxy / Route Guard (proxy.ts)"]
        Pages["App Router Dashboard (Manager / Supervisor / Rep)"]
        UI["Radix UI + Tailwind CSS v4 + Recharts"]
        HTTP["HTTP Service (Axios / Bearer JWT)"]
    end

    subgraph Backend ["Backend (goldBack) - Node.js Express 5"]
        MW["Auth Middleware & RBAC Guards"]
        Controllers["Domain Controllers (Visits, Plans, Sales, etc.)"]
        PrismaORM["Prisma ORM v7"]
    end

    subgraph External ["Data & Storage"]
        Postgres[(PostgreSQL Database)]
        Cloudinary[("Cloudinary (Media & Files)")]
        ExcelFiles["Distributor Sales (XLSX)"]
    end

    User --> Proxy
    Proxy --> Pages
    Pages --> UI
    UI --> HTTP
    HTTP -->|REST API Requests + JWT| MW
    MW --> Controllers
    Controllers --> PrismaORM
    Controllers --> Cloudinary
    Controllers --> ExcelFiles
    PrismaORM --> Postgres
```

---

## ✨ Key Features

### 👥 1. Multi-Tier Hierarchy & Role-Based Access Control (RBAC)
- **Three Core Roles**:
  - `MANAGER`: National/regional oversight, team configuration, master data, budget approvals, and executive analytics.
  - `SUPERVISOR`: First-line field management, plan reviews, expense approvals, and joint coaching visits.
  - `MEDICAL_REP`: Field execution, doctor/pharmacy visits, itinerary planning, requests, and pipeline forecasting.
- Protected client-side and server-side route guards ensure strict data privacy and privilege enforcement.

### 🩺 2. Customer Master Data (Doctors & Pharmacies)
- Complete directories for Doctors and Pharmacies categorized by specialty, classification (Class A/B/C), potential, and territory.
- Detailed customer profiles with historical interaction records, previous call notes, and sample delivery history.
- Geographic tagging linking accounts to designated regions and sub-regions.

### 📅 3. Field Itineraries & Visit Management
- **Work Plans**: Reps build weekly and monthly visit schedules and submit them up the chain for supervisor approval.
- **Visit Execution**: Real-time logging of doctor visits (Routine, Follow-Up, Emergency) and pharmacy stock checks.
- **Call Details**: Record discussion feedback, promoted products, promotional material, and delivered samples.

### 📑 4. Requests & Approval Engine
- Unified portal for field requests:
  - **Vacation & Leave** requests.
  - **Travel & Transportation** expenses.
  - **Sample & Marketing Material** allocations.
  - **Special Promotional Events & Sponsorships**.
- Multi-tier escalation: Rep &rarr; Supervisor &rarr; Manager based on role hierarchy and spending limits.

### 🎯 5. Field Coaching & Competency Appraisals
- **Joint Coaching Visits**: Supervisors join reps on field calls and submit structured evaluations covering communication, product knowledge, objection handling, and relationship management.
- **Periodic Appraisals**: Multi-dimensional reviews evaluating reps and supervisors across 20+ performance and competency metrics.

### 📊 6. Sales Ingestion, Forecasting & Analytics
- **Distributor Sales Ingestion**: Upload monthly sales data directly via Excel (`.xlsx`) files with automatic product and region mapping.
- **Territory Forecasting**: Reps forecast upcoming monthly sales pipelines by doctor and product.
- **Target Tracking**: Track actual sales versus quota across territories, lines, and reps.
- **Interactive Dashboards**: Role-specific analytics powered by Recharts (call rates, coverage ratios, sales achievement, top products).

---

## 🔄 Role-Based Access & Workflows

| Capability | Medical Rep (`MEDICAL_REP`) | Supervisor (`SUPERVISOR`) | Manager (`MANAGER`) |
| :--- | :---: | :---: | :---: |
| **Personal Dashboard & Call Rates** | ✅ | ✅ (Team View) | ✅ (National View) |
| **Doctors & Pharmacies Directory** | ✅ (Assigned) | ✅ (Territory) | ✅ (Full Access) |
| **Draft Weekly / Monthly Plans** | ✅ | ❌ | ❌ |
| **Approve / Reject Rep Plans** | ❌ | ✅ | ✅ |
| **Log Visit & Sample Drops** | ✅ | ❌ | ❌ |
| **Submit Expense & Leave Requests** | ✅ | ✅ | ✅ |
| **Approve Requests** | ❌ | ✅ (Tier 1) | ✅ (Final / High-Budget) |
| **Joint Field Coaching Reports** | 👁️ (View Own) | ✅ (Conduct & Rate) | ✅ (All Reports) |
| **Performance Appraisals** | 👁️ (View Own) | ✅ (Appraise Reps) | ✅ (Appraise All) |
| **Submit Sales Forecasts** | ✅ | ✅ (Review & Feedback) | ✅ (Consolidated View) |
| **Upload Distributor Sales (Excel)** | ❌ | ❌ | ✅ |
| **Manage Users & Organizational Tree** | ❌ | ❌ | ✅ |
| **Manage Regions & Product Catalog** | ❌ | ❌ | ✅ |

---

## 🛠 Tech Stack

### Frontend (`goldFront`)
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Core Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Icons & Notifications:** [Lucide Icons](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.com/)
- **Media Uploads:** [next-cloudinary](https://next-cloudinary.space/)

### Backend (`goldBack`)
- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express v5](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma v7](https://www.prisma.io/)
- **Authentication:** [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken) with [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **File & Media Handling:** [Multer](https://github.com/expressjs/multer) & [Cloudinary SDK](https://cloudinary.com/)
- **Data Ingestion:** [xlsx (SheetJS)](https://sheetjs.com/)
- **Security & Optimization:** [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [compression](https://github.com/expressjs/compression)

---

## 📁 Project Directory Structure

```text
Goldera-Pharm/
├── goldBack/                     # Express REST API & Database
│   ├── config/                   # Environment & database configurations
│   ├── controllers/              # Business logic handlers
│   │   ├── auth.controller.js    # Authentication & JWT tokens
│   │   ├── visit.controller.js   # Visit logs & schedules
│   │   ├── plan.controller.js    # Work plans workflow
│   │   ├── request.controller.js # Leave, expense & sample requests
│   │   ├── sales.controller.js   # Excel sales ingestion & metrics
│   │   └── ...                   # Coaching, Appraisals, Doctors, etc.
│   ├── middlewares/              # Auth, role-guards, and global error handler
│   ├── prisma/                   # Prisma schema & PostgreSQL migrations
│   │   ├── schema.prisma         # Data models and relations
│   │   └── migrations/           # Database migration files
│   ├── routes/                   # API route definitions (/api/*)
│   ├── utils/                    # Pagination, Cloudinary, ApiError utilities
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Application entry point
│
├── goldFront/                    # Next.js 16 App Router Client
│   ├── app/                      # App Router routes and page views
│   │   ├── (dashboard)/          # Authenticated layouts (manager, supervisor, rep)
│   │   ├── layout.tsx            # Global layout, fonts & theme providers
│   │   └── page.tsx              # Authentication & entry portal
│   ├── components/               # Reusable UI primitives (dialogs, tables, cards)
│   ├── core/                     # Shared types, constants & navigation configs
│   ├── features/                 # Modular domain slices
│   │   ├── auth/                 # Sign-in forms & state
│   │   ├── visits/               # Visit planner & reporting forms
│   │   ├── doctors/              # HCP directories & profiles
│   │   ├── pharmacies/           # Pharmacy directory & coverage
│   │   ├── coaching/             # Joint field coaching evaluations
│   │   ├── appraisal/            # Competency reviews
│   │   ├── sales/                # Sales data grids & Excel upload
│   │   └── dashboard/            # Role-tailored KPI widgets
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Axios HTTP client with Bearer token injection
│   ├── proxy.ts                  # Middleware for role-based URL protection
│   └── package.json              # Frontend dependencies & scripts
│
└── PROJECT_DOCUMENTATION.md      # Detailed architecture & functional specifications
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v20.x or later recommended)
- **npm** or **pnpm**
- **PostgreSQL** instance (local or hosted e.g. Neon, Supabase, AWS RDS)
- *(Optional)* Free **Cloudinary** account for file and avatar uploads

---

### 1. Clone Repository

```bash
git clone https://github.com/ebrahimemadeldin3/Goldera-Pharm.git
cd Goldera-Pharm
```

---

### 2. Backend Setup (`goldBack`)

1. **Navigate into the backend directory**:
   ```bash
   cd goldBack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL credentials, JWT secret, and Cloudinary keys:
   ```env
   PORT=5050
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   DATABASE_URL="postgresql://postgres:password@localhost:5432/goldera_pharm?schema=public"

   JWT_ACCESS_SECRET_KEY="your-jwt-secret-key-here"
   JWT_ACCESS_EXPIRE_TIME="7d"

   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   MANAGER_EMAIL="manager@golderapharm.com"
   MANAGER_PASSWORD="AdminPassword123!"
   ```

4. **Run Database Migrations & Generate Prisma Client**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the Backend Server**:
   ```bash
   # Development mode with hot-reloading:
   npm run dev
   ```
   The backend API will be running at `http://localhost:5050`.

---

### 3. Frontend Setup (`goldFront`)

1. **Navigate into the frontend directory**:
   ```bash
   cd ../goldFront
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` or `.env` file in `goldFront/`:
   ```bash
   cp .env.example .env.local
   ```
   Set the API URL pointing to your backend:
   ```env
   NEXT_PUBLIC_API_BASE_URL="http://localhost:5050"
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

### Backend (`goldBack/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `5050` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `CLIENT_URL` | Allowed CORS origin for the frontend | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET_KEY`| Secret key for signing JWT tokens | `super_secret_jwt_key` |
| `JWT_ACCESS_EXPIRE_TIME`| Access token expiration duration | `7d` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud account name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | `your_api_secret` |
| `MANAGER_EMAIL` | Default manager email for seed/initialization | `manager@company.com` |
| `MANAGER_PASSWORD` | Default manager password | `securepassword` |

### Frontend (`goldFront/.env.local`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend REST API | `http://localhost:5050` |

---

## 📡 API Overview

All API endpoints are prefixed with `/api` and secured with JWT Bearer authentication where applicable:

| Route Path | Description | Access |
| :--- | :--- | :--- |
| `/api/auth` | User login, token verification, logout | Public / Authenticated |
| `/api/profiles` | User profile updates, password change, avatar upload | Authenticated |
| `/api/reps` | Rep directory, team assignments, KPIs | Manager, Supervisor |
| `/api/supervisors` | Supervisor team hierarchies and territory management | Manager |
| `/api/managers` | Manager administration and national operations | Manager |
| `/api/doctors` | Doctor CRM registry, specialties, classifications | All Roles |
| `/api/pharmacies` | Pharmacy directory and sub-region associations | All Roles |
| `/api/visits` | Schedule, submit, and review doctor visits & sample drops | All Roles |
| `/api/plans` | Create, submit, approve, and track weekly/monthly itineraries | All Roles |
| `/api/requests` | Submit & approve leave, travel expenses, and sample requests | All Roles |
| `/api/coaching-reports` | In-field joint visit evaluation records & skill ratings | Supervisor, Manager |
| `/api/appraisals` | Formal performance and competency reviews | Supervisor, Manager |
| `/api/forecasts` | Territorial and product sales pipeline forecasts | All Roles |
| `/api/products` | Pharmaceutical product catalog & targeting | All Roles |
| `/api/sales` | Distributor sales imports (Excel) & quota metrics | Manager |
| `/api/regions` & `/api/sub-regions` | Territory and geographical tree configuration | Manager |
| `/api/dashboard` | Role-tailored aggregated analytics and KPIs | All Roles |

---

## 📦 Production & Deployment

### Backend
1. Build and run migrations in production:
   ```bash
   npx prisma migrate deploy
   ```
2. Start the server using Node or a process manager such as [PM2](https://pm2.keymetrics.io/):
   ```bash
   pm2 start server.js --name "goldera-backend"
   ```

### Frontend
1. Build the Next.js production bundle:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```
   *Alternatively, deploy directly to [Vercel](https://vercel.com/) with zero-configuration Next.js integration.*

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

<div align="center">
  <sub>Developed for Goldera Pharma Operations. Empowering field forces with modern digital tools.</sub>
</div>
