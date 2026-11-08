# BorrowBuy – Product Rental and Management Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![Tests Passing](https://img.shields.io/badge/Tests-89%2F89_Passing-emerald.svg)](https://vitest.dev/)

BorrowBuy is a consumer-grade equipment rental marketplace connecting product owners with local creators, students, and businesses across Gujarat and India. Built with pessimistic row-locking for date reservations, single-use QR handover tokens, automated deposit escrow, and an AWS cloud-ready hexagonal architecture.

---

## 1. System Requirements

Ensure the following tools are installed on your host machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or `v11.x`
- **Docker & Docker Compose**: Docker Desktop with Linux container engine running
- **Git**: `v2.40+`
- **Windows PowerShell** (or Bash / Zsh for Linux/macOS)

---

## 2. Project Architecture & Workspaces

The repository is organized as an npm monorepo:
```
BorrowBuy/
├── frontend/             # React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
├── backend/              # Node.js, Express, TypeScript, REST API, Zod Validation, Vitest
├── database/             # Prisma ORM, PostgreSQL schema, migrations, seed script
├── infrastructure/       # Docker Compose, Dockerfiles, Terraform AWS modules
├── docs/                 # Architecture, demo accounts, image attributions & security protocols
├── .env.example          # Monorepo environment variable template
├── docker-compose.yml    # Local PostgreSQL 16 container definition
└── package.json          # Monorepo workspaces definition
```

---

## 3. Local Development Demonstration Accounts

For local evaluation and testing, the database seed script generates 1 Administrator, 6 Verified Owners, and 18 Active Customers.

> [!IMPORTANT]
> **Production vs Development Notice**:
> In production environments:
> - Demo user auto-seeding is completely disabled.
> - The administrator credentials are read securely from environment variables (`ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`), hashed with `bcrypt` (12 rounds), and **never rendered on public web pages**.
> - For complete account details and reset steps, see [`docs/demo-accounts.md`](docs/demo-accounts.md) and [`docs/admin-setup.md`](docs/admin-setup.md).

### Administrator (1 Account)

| Role | Full Name | Email Address | Development Password | Privileges |
|---|---|---|---|---|
| **ADMIN** | Harshal (System Admin) | `harshal07@gmail.com` | `ADMIN_INITIAL_PASSWORD` *(Local default: `Harshal@Admin2026!`)* | Full governance, dispute arbitration, payment ledger |

### Verified Equipment Owners (6 Accounts across Gujarat)

| Role | Full Name | Email Address | Development Password | Location |
|---|---|---|---|---|
| **OWNER** | Rajesh Patel | `rajesh.owner@borrowbuy.in` | `Password123!` | Vastrapur, Ahmedabad, Gujarat |
| **OWNER** | Priya Shah | `priya.owner@borrowbuy.in` | `Password123!` | Bodakdev, Ahmedabad, Gujarat |
| **OWNER** | Amit Sharma | `amit.owner@borrowbuy.in` | `Password123!` | Kudasan, Gandhinagar, Gujarat |
| **OWNER** | Sneha Mehta | `sneha.owner@borrowbuy.in` | `Password123!` | Vesu, Surat, Gujarat |
| **OWNER** | Vikram Desai | `vikram.owner@borrowbuy.in` | `Password123!` | Alkapuri, Vadodara, Gujarat |
| **OWNER** | Ananya Joshi | `ananya.owner@borrowbuy.in` | `Password123!` | Prahlad Nagar, Ahmedabad, Gujarat |

### Active Customer Renters (18 Accounts)

| Role | Full Name | Email Address | Development Password | Locality |
|---|---|---|---|---|
| **CUSTOMER** | Priya Shah | `priya.customer@borrowbuy.in` | `Password123!` | Satellite, Ahmedabad |
| **CUSTOMER** | Rohan Gupta | `rohan.gupta@borrowbuy.in` | `Password123!` | Navrangpura, Ahmedabad |
| **CUSTOMER** | Neha Trivedi | `neha.trivedi@borrowbuy.in` | `Password123!` | Sargasan, Gandhinagar |
| **CUSTOMER** | Parth Dave | `parth.dave@borrowbuy.in` | `Password123!` | Vesu, Surat |
| **CUSTOMER** | Anjali Verma | `anjali.verma@borrowbuy.in` | `Password123!` | Fatehgunj, Vadodara |
| **CUSTOMER** | Siddharth Rao | `siddharth.rao@borrowbuy.in` | `Password123!` | Kalawad Road, Rajkot |
| **CUSTOMER** | Pooja Iyer | `pooja.iyer@borrowbuy.in` | `Password123!` | Bodakdev, Ahmedabad |
| **CUSTOMER** | Chirag Bhatt | `chirag.bhatt@borrowbuy.in` | `Password123!` | Kudasan, Gandhinagar |
| **CUSTOMER** | Meera Nair | `meera.nair@borrowbuy.in` | `Password123!` | Ghod Dod Road, Surat |
| **CUSTOMER** | Hardik Joshi | `hardik.joshi@borrowbuy.in` | `Password123!` | Akota, Vadodara |
| **CUSTOMER** | Swati Kulkarni | `swati.kulkarni@borrowbuy.in` | `Password123!` | Kothrud, Pune |
| **CUSTOMER** | Devang Raval | `devang.raval@borrowbuy.in` | `Password123!` | Naranpura, Ahmedabad |
| **CUSTOMER** | Ritu Malhotra | `ritu.malhotra@borrowbuy.in` | `Password123!` | Andheri West, Mumbai |
| **CUSTOMER** | Tanmay Solanki | `tanmay.solanki@borrowbuy.in` | `Password123!` | Vidyanagar, Anand |
| **CUSTOMER** | Ishita Saxena | `ishita.saxena@borrowbuy.in` | `Password123!` | Waghawadi Road, Bhavnagar |
| **CUSTOMER** | Bhavin Panchal | `bhavin.panchal@borrowbuy.in` | `Password123!` | Maninagar, Ahmedabad |
| **CUSTOMER** | Kruti Vora | `kruti.vora@borrowbuy.in` | `Password123!` | University Road, Rajkot |
| **CUSTOMER** | Yash Kapadia | `yash.kapadia@borrowbuy.in` | `Password123!` | Piplod, Surat |

---

## 4. Quick Start Setup Guide (Windows PowerShell)

### Step 1: Install All Monorepo Dependencies
```powershell
npm install
```

### Step 2: Start the Local PostgreSQL Database
Ensure Docker Desktop is running, then execute:
```powershell
npm run db:up
```

### Step 3: Run Database Migrations and Seed Clean Demo State
```powershell
npm run db:migrate
npm run db:seed
```

### Step 4: Start the Development Servers
In terminal 1:
```powershell
npm run dev:backend
```
*Backend API runs on: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)*

In terminal 2:
```powershell
npm run dev:frontend
```
*Frontend application runs on: `http://localhost:5173`*

---

## 5. Verification & Test Suite

Run all automated unit, integration, and end-to-end tests across all workspaces:
```powershell
npm test
```
*Verification status: 89/89 tests passing (84 backend + 5 frontend).*

---

## 6. AWS Cloud Readiness
The platform is built with **Hexagonal / Ports-and-Adapters** design:
- **Storage**: `STORAGE_DRIVER=local` saves uploads to `./backend/uploads/`. In Stage B, changing to `s3` connects to Amazon S3 via presigned URLs.
- **Notifications**: `NOTIFICATION_DRIVER=local` saves to PostgreSQL and outputs to console. In Stage B, `sns` connects to Amazon SNS.
- **Payments**: `PAYMENT_DRIVER=simulation` simulates rental fees, security deposit holds, and refunds locally.
- **Database**: Prisma handles PostgreSQL locally and connects directly to Amazon RDS in Stage B via `DATABASE_URL`.
