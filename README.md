# BorrowBuy — Peer-to-Peer Equipment Rental & Management Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-20.x%20%7C%2022.x-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748.svg?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![AWS Architecture](https://img.shields.io/badge/AWS-9_Services_Verified-FF9900.svg?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![Vitest](https://img.shields.io/badge/Vitest-108%2F108_Passing-729B1B.svg?logo=vitest&logoColor=white)](https://vitest.dev/)

BorrowBuy is an enterprise-grade equipment rental and digital escrow platform localized for **Gujarat, India** (serving Ahmedabad, Gandhinagar, Surat, Vadodara, and Rajkot). Engineered as a comprehensive **Cloud Computing Capstone Architecture**, it bridges the trust gap between equipment owners and borrowers through automated security deposit escrow, dynamic QR code handover passes, and an immutable audit telemetry trail.

---

## Table of Contents

- [1. High-Level Architecture](#1-high-level-architecture)
- [2. Monorepo Repository Structure](#2-monorepo-repository-structure)
- [3. Editorial Light Design System](#3-editorial-light-design-system)
- [4. Verified 9 AWS Cloud Services](#4-verified-9-aws-cloud-services)
- [5. Prerequisites](#5-prerequisites)
- [6. Step-by-Step: Running the Complete Project Locally](#6-step-by-step-running-the-complete-project-locally)
- [7. Running Automated Tests & Builds](#7-running-automated-tests--builds)
- [8. Demo Credentials & One-Click Fast-Fill](#8-demo-credentials--one-click-fast-fill)
- [9. End-to-End Rental Lifecycle Walkthrough](#9-end-to-end-rental-lifecycle-walkthrough)
- [10. Production AWS Deployment & CI/CD Pipeline](#10-production-aws-deployment--cicd-pipeline)
- [11. Comprehensive Documentation Deliverables](#11-comprehensive-documentation-deliverables)
- [12. Troubleshooting & Common Issues](#12-troubleshooting--common-issues)

---

## 1. High-Level Architecture

```mermaid
flowchart TD
  subgraph Client_Tier ["Client Tier (Editorial Light UI)"]
    WebClient["Desktop / Mobile Browser (React 18 + Vite 6 + Tailwind 3)"]
  end

  subgraph Ingress_Tier ["Ingress & Web Server (AWS Mumbai ap-south-1)"]
    Nginx["Nginx 1.24 Reverse Proxy (Port 80 / 443)"]
    Vite_Static["Vite Production SPA (/var/www/borrowbuy/dist)"]
  end

  subgraph Compute_Tier ["Compute & Application Tier (Amazon EC2 i-03347c2b6584c73cb)"]
    Express_API["Node.js 20 Express REST API (Systemd Daemon :5000)"]
    Postgres_DB["PostgreSQL 16 Database Cluster (:5432)"]
    EBS_Volume["Amazon EBS gp3 Volume (vol-0e48159e9bb02b52c - 116 Products)"]
  end

  subgraph Cloud_Services ["AWS Serverless & Managed Cloud Services"]
    S3_Bucket["Amazon S3: borrowbuy-product-assets-767579108846"]
    SQS_Queue["Amazon SQS: borrowbuy-booking-events"]
    Lambda_Quote["AWS Lambda: borrowbuy-quote-calculator"]
    CW_Logs["Amazon CloudWatch: /aws/borrowbuy/app & Alarms"]
    Budgets["AWS Budgets: $5.00/mo Strict Guardrail"]
  end

  WebClient -->|HTTP / HTTPS| Nginx
  Nginx -->|Static Assets| Vite_Static
  Nginx -->|/api/* Proxy| Express_API
  Express_API -->|Prisma ORM| Postgres_DB
  Postgres_DB -->|Persistent Storage| EBS_Volume
  Express_API -->|Presigned Uploads & Media| S3_Bucket
  Express_API -->|Asynchronous Event Dispatch| SQS_Queue
  Express_API -->|Serverless Pricing Invocation| Lambda_Quote
  Express_API -->|Application Telemetry & Alarms| CW_Logs
```

---

## 2. Monorepo Repository Structure

BorrowBuy is organized as a clean npm monorepo with workspace isolation:

```
Borrow-Buy/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Reusable CI workflow (PostgreSQL container, seeding, 108 tests)
│       └── deploy.yml             # Protected CD workflow (GitHub OIDC -> AWS SSM to EC2)
├── database/
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema
│   │   └── seed.ts                # Deterministic seed script (116 products, 25 categories)
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express API server entrypoint
│   │   ├── app.ts                 # Middleware pipeline, CORS, rate limiting, error handler
│   │   ├── routes/                # 10 modular REST API routes
│   │   ├── services/              # Domain logic & AWS service adapters
│   │   └── lambda/                # Serverless quote calculator handler
│   ├── tests/                     # 9 Vitest test suites (103 tests)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI component library (Editorial Light theme)
│   │   ├── pages/                 # Multi-page views (Home, Browse, Bookings, Dashboard, Cloud)
│   │   ├── services/              # Axios API client connecting to backend Express
│   │   ├── index.css              # Editorial light design tokens & typography
│   │   └── tailwind.config.js     # Semantic bb-* color tokens
│   ├── tests/                     # Vitest unit & component tests (5 tests)
│   └── package.json
├── infra/
│   └── terraform/                 # Infrastructure as Code modules (Profile A)
├── scripts/
│   ├── deploy-ec2.sh              # Production SSM deployment script
│   ├── rollback-ec2.sh            # Safe zero-downtime rollback script
│   └── health-check.sh            # 5-point verification script
└── docs/                          # Master documentation & audit deliverables
```

---

## 3. Editorial Light Design System

The frontend is styled strictly under the **Editorial Light Design System**, eliminating dark, neon, or glassmorphic styling in favor of Linear/Vercel/Airbnb visual discipline:

| Design Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| `bb-bg` | `#FAFAF8` | Page canvas background (off-white, zero screen glare) |
| `bb-card` | `#FFFFFF` | Content card surface (pure white with crisp elevation) |
| `bb-surface-subtle` | `#F1F3F3` | Input fields, secondary buttons, category pills, tab bars |
| `bb-border` | `#E5E8EA` | Card borders, dividers, table hairline lines |
| `bb-text-primary` | `#17191C` | High-contrast display typography, rates, headings |
| `bb-text-secondary` | `#66707A` | Metadata, subtitles, timestamps, input placeholders |
| `bb-accent` | `#315CF5` | High-visibility primary action button, links, active state |
| `bb-accent-hover` | `#2447C9` | Interactive hover state for primary action buttons |
| `bb-positive` | `#13795B` | Refunded escrow deposits, verified lender badges, active rentals |
| `bb-warning` | `#B76E16` | Awaiting owner approval, reservation holds, pending alerts |
| `bb-error` | `#C43838` | Damage dispute claims, rejected bookings, form validation errors |

---

## 4. Verified 9 AWS Cloud Services

All 9 services are live, authenticated, and verified in **AWS Mumbai (`ap-south-1`)**:

1. **Amazon EC2 (`i-03347c2b6584c73cb`):** AL2023 `t3.micro` instance running Node.js 20 backend daemon and Nginx.
2. **Amazon EBS (`vol-0e48159e9bb02b52c`):** 20 GiB `gp3` root volume holding PostgreSQL cluster with 116 seeded products.
3. **Amazon VPC (`vpc-0cbfb3929d621f2db`):** Multi-AZ public subnets (`ap-south-1a` & `ap-south-1b`), IGW, and route tables.
4. **AWS IAM:** 4 production roles (EC2 SSM runtime, GitHub OIDC deploy role, Lambda execution, deployment policy).
5. **Amazon S3 (`borrowbuy-product-assets-767579108846`):** Encrypted media storage with CORS policy.
6. **Amazon SQS (`borrowbuy-booking-events`):** Decoupled standard queue for asynchronous event processing.
7. **AWS Lambda (`borrowbuy-quote-calculator`):** Serverless function calculating duration discounts and 18% GST.
8. **Amazon CloudWatch:** Centralized log stream `/aws/borrowbuy/app` and 2 high-CPU / health alarms.
9. **AWS Budgets:** Strict $5.00/month cost guardrail with dual notification alerts at 80% and 100%.

---

## 5. Prerequisites

Before running the platform locally, ensure you have installed:

- **Node.js:** `v20.x` or `v22.x` (LTS recommended)
- **npm:** `v10.x` or higher
- **Docker & Docker Compose:** Required to run PostgreSQL 16 locally
- **Git:** For source control management
- **(Optional) AWS CLI v2:** Required only if invoking AWS resources directly (`ap-south-1`)

Verify installed versions:
```bash
node -v
npm -v
docker -v
docker compose version
```

---

## 6. Step-by-Step: Running the Complete Project Locally

Follow these sequential steps to run the complete BorrowBuy stack on your machine:

### Step 1: Clone the Repository
```bash
git clone https://github.com/harshalgondaliya/Borrow-Buy.git
cd Borrow-Buy
```

### Step 2: Install Monorepo Dependencies
Install all workspace dependencies (`database`, `backend`, `frontend`) from the root directory:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the provided `.env.example` templates across workspaces:

```bash
# Root environment file
cp .env.example .env

# Backend environment file
cp backend/.env.example backend/.env

# Database environment file
cp database/.env.example database/.env

# Frontend environment file
cp frontend/.env.example frontend/.env
```

> [!NOTE]
> Default configurations in `.env.example` are pre-tuned for local Docker execution with zero manual edits required. The backend automatically activates local fallback drivers (`STORAGE_DRIVER=local`, `PAYMENT_DRIVER=simulation`, `NOTIFICATION_DRIVER=local`) when AWS credentials are not supplied.

### Step 4: Start the PostgreSQL Database Container
Launch the isolated PostgreSQL 16 container using Docker Compose:
```bash
npm run db:up
```

Verify that the database container is running and healthy:
```bash
docker ps --filter "name=borrowbuy-postgres"
```

### Step 5: Run Database Migrations & Generate Prisma Client
Apply database schema migrations and generate the Prisma Client:
```bash
npm run db:migrate
```

### Step 6: Seed Canonical Equipment & Test Personas
Execute the deterministic seed script to populate **116 equipment listings across 25 categories in Gujarat** and default test accounts:
```bash
npm run db:seed
```

*(Optional) To visually inspect tables in your browser, launch Prisma Studio:*
```bash
npm run db:studio
```

### Step 7: Launch Development Servers

You can run the backend and frontend concurrently in two separate terminal windows:

#### Terminal 1 — Backend Express REST API (Port 5000):
```bash
npm run dev:backend
```
*Health probe: Open `http://localhost:5000/api/health` in your browser to confirm API connectivity.*

#### Terminal 2 — Frontend React + Vite SPA (Port 5173):
```bash
npm run dev:frontend
```
*Web application: Open `http://localhost:5173` to access the full BorrowBuy platform.*

---

## 7. Running Automated Tests & Builds

BorrowBuy includes automated unit, integration, and end-to-end test suites.

### Execute All Tests Across the Monorepo
```bash
npm test
```

### Execute Backend Tests Only (9 Suites, 103 Tests)
Tests authentication, bookings, catalog quality, payments, QR token verification, inspections, and mutual reviews:
```bash
npm run test --workspace=backend
```
*Expected output: `Test Files: 9 passed (9) | Tests: 103 passed (103)`.*

### Execute Frontend Tests Only (2 Suites, 5 Tests)
Tests React components, navigation, and API service client contracts:
```bash
npm run test --workspace=frontend
```
*Expected output: `Test Files: 2 passed (2) | Tests: 5 passed (5)`.*

### Execute Production Builds
Verify that TypeScript compiles cleanly and Vite generates minified production bundles:
```bash
npm run build
```
*Output: Generates production assets in `backend/dist/server.js` and `frontend/dist/index.html` with zero TypeScript errors.*

---

## 8. Demo Credentials & One-Click Fast-Fill

To facilitate rapid demonstration without typing credentials, the Sign In dialog (`AuthModal.tsx`) includes **One-Click Demo Fast-Fill Buttons**:

| Persona | Email Address | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Borrower (Customer)** | `customer@borrowbuy.in` | `Customer@123` | `CUSTOMER` | Explores gear, places availability holds, pays simulated deposit escrow, presents QR handover pass, leaves reviews. |
| **Lender (Owner)** | `owner@borrowbuy.in` | `Owner@123` | `OWNER` | Manages equipment catalog, approves bookings, verifies in-person pickup and return QR passes. |
| **Administrator** | `admin@borrowbuy.in` | `Admin@123` | `ADMIN` | Platform governance, financial escrow ledger, user suspension, damage dispute arbitration. |

---

## 9. End-to-End Rental Lifecycle Walkthrough

To verify the platform's complete business logic in 5 minutes:

1. **Browse Equipment (`/browse`):**
   - Filter by City (e.g. *Ahmedabad* or *Surat*).
   - Click on *Sony Alpha a7 IV Mirrorless Camera Body*.
2. **Hold Reservation & Serverless Quote:**
   - Click **"Book Equipment"**.
   - Select a 7-day date range. Notice the **15% weekly discount** applied by the pricing engine.
   - Click **"Lock In Dates"** (creates a 15-minute hold preventing collision).
3. **Simulated Payment & Escrow:**
   - Sign in via the **Customer** fast-fill button.
   - Select payment method (**UPI** or Card) -> Click **"Authorize Payment"**.
   - Security deposit is isolated in escrow; status transitions to `CONFIRMED`.
4. **Lender Approval (`/dashboard`):**
   - Switch persona to **Owner** via the fast-fill button.
   - Open **Lender Portal** -> **Rental Requests** -> Click **"Approve Booking"**.
5. **Pickup Handover Pass Verification:**
   - In customer view (`/bookings`), click **"Show Pickup Pass"** to reveal token `PK-...`.
   - In owner view, navigate to **QR Scanner & Handover** -> paste `PK-...` -> click **"Verify Pickup"**.
   - Status updates to `ACTIVE`. Equipment is physically handed over!
6. **Return Handover & Automated Deposit Release:**
   - When rental concludes, customer opens **"Show Return Pass"** to reveal token `RT-...`.
   - Owner pastes `RT-...` into **QR Scanner & Handover** -> clicks **"Verify Return"**.
   - Booking transitions to `COMPLETED`. **100% of the security deposit is automatically refunded**!
7. **Verified Mutual Reviews:**
   - Customer submits a 5-star rating with written feedback.
   - Owner's trust score updates dynamically.

---

## 10. Production AWS Deployment & CI/CD Pipeline

The production application is deployed in AWS Mumbai (`ap-south-1`):

- **Host:** Amazon EC2 instance `i-03347c2b6584c73cb`
- **Public IP:** `13.206.100.236`
- **Reverse Proxy:** Nginx proxying `/api` to Express daemon (`:5000`) and serving static assets from `/var/www/borrowbuy/dist`.
- **Automated CI/CD:** Any push to `main` executes `.github/workflows/deploy.yml`.
  1. Executes monorepo tests and builds on GitHub runners.
  2. Authenticates with AWS using **OpenID Connect (OIDC)** without long-lived keys.
  3. Dispatches AWS Systems Manager (SSM) Run Command to EC2.
  4. Runs `scripts/deploy-ec2.sh` as `ec2-user` with automatic rollback (`scripts/rollback-ec2.sh`) upon health-check failure.

---

## 11. Comprehensive Documentation Deliverables

Detailed engineering reports and audit deliverables are located in the `docs/` folder:

1. [docs/BORROWBUY_MASTER_AUDIT.md](docs/BORROWBUY_MASTER_AUDIT.md) — Master architectural audit, monorepo layout, and Prisma database schema.
2. [docs/BORROWBUY_PREMIUM_DESIGN_SYSTEM.md](docs/BORROWBUY_PREMIUM_DESIGN_SYSTEM.md) — Editorial light theme specifications, typography scale, and component rules.
3. [docs/BORROWBUY_FEATURE_VERIFICATION_MATRIX.md](docs/BORROWBUY_FEATURE_VERIFICATION_MATRIX.md) — Detailed matrix covering all 12 platform modules and negative test cases.
4. [docs/BORROWBUY_AWS_INTEGRATION_FINAL.md](docs/BORROWBUY_AWS_INTEGRATION_FINAL.md) — Technical verification of all 9 AWS services in Mumbai (`ap-south-1`).
5. [docs/BORROWBUY_CICD_FINAL.md](docs/BORROWBUY_CICD_FINAL.md) — GitHub Actions CI/CD pipeline, AWS OIDC federation, and defensive SSM deployment script.
6. [docs/BORROWBUY_PUBLIC_DEPLOYMENT.md](docs/BORROWBUY_PUBLIC_DEPLOYMENT.md) — Nginx reverse proxy configuration, systemd daemon, port hardening, and asset resolution.
7. [docs/BORROWBUY_FINAL_DEMO_RUNBOOK.md](docs/BORROWBUY_FINAL_DEMO_RUNBOOK.md) — 5-minute academic walkthrough script with one-click demo fast-fill credentials.
8. [docs/BORROWBUY_FINAL_RELEASE_REPORT.md](docs/BORROWBUY_FINAL_RELEASE_REPORT.md) — Executive release sign-off, test execution evidence, and final verification statement.

---

## 12. Troubleshooting & Common Issues

### Issue 1: Port 5432 Already in Use
If port 5432 is occupied by an existing local PostgreSQL service:
```bash
# Check process holding port 5432 on Windows:
Get-NetTCPConnection -LocalPort 5432 | Select-Object OwningProcess

# Or change POSTGRES_PORT in .env to 5433 and update DATABASE_URL:
POSTGRES_PORT=5433
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/borrowbuy_db?schema=public"
```

### Issue 2: Re-running Database Migrations from Scratch
To perform a complete clean reset of the local test database:
```bash
docker compose down -v
npm run db:up
npm run db:migrate
npm run db:seed
```

### Issue 3: Vite Port 5173 Conflict
If another application is using port 5173, Vite automatically selects port 5174. If needed, specify an explicit port:
```bash
npm run dev:frontend -- --port 5173
```

---

## License & Academic Declaration

BorrowBuy is engineered as a Master’s / Undergraduate Cloud Computing Capstone Project. All rights reserved &copy; 2026 BorrowBuy Team.
