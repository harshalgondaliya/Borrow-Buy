# BorrowBuy – Local Development & Operations Guide

This guide walks you through setting up, developing, testing, and managing the **BorrowBuy** platform locally.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (Recommended: `v22.12+`)
- **npm**: `v10.x+` (npm workspaces support)
- **Docker & Docker Compose**: For local PostgreSQL 16
- **Git**: For version control

---

## 2. Monorepo Structure

```
borrowbuy/
├── backend/          # Node.js + Express + Prisma API service (Port 5000)
├── frontend/         # React 18 + Vite + Tailwind CSS SPA (Port 5173)
├── database/         # Prisma schema, migrations, and seeding scripts
├── infrastructure/   # Terraform modules for AWS deployment
├── docs/             # Technical architecture, security, and audit reports
└── package.json      # Monorepo root with workspace orchestration scripts
```

---

## 3. Quick Start Setup

### Step 1: Install Dependencies
From the repository root:
```bash
npm install
```

### Step 2: Start Local PostgreSQL Database
Using Docker Compose:
```bash
docker compose up -d postgres
```
Verify the database is healthy on port `5432`:
```bash
docker ps
```

### Step 3: Run Database Migrations
Apply Prisma migrations to the local database:
```bash
npx prisma migrate dev --schema database/prisma/schema.prisma
```

### Step 4: Seed the Database
BorrowBuy supports two seeding modes:

#### Option A: Idempotent Seeding (Default & Safe)
Upserts the platform administrator, 6 verified owners, 18 customer accounts, 21 categories, and **100 curated Indian equipment listings** without deleting existing database records:
```bash
npm run seed --workspace=database
```

#### Option B: Clean Authorized Reset (Development Only)
To wipe and re-seed from scratch in development, set the authorization flag:
```bash
# In PowerShell:
$env:ALLOW_DESTRUCTIVE_RESET="true"; npm run seed --workspace=database; Remove-Item Env:\ALLOW_DESTRUCTIVE_RESET

# In Bash / macOS / Linux:
ALLOW_DESTRUCTIVE_RESET=true npm run seed --workspace=database
```

> [!WARNING]
> Destructive resets are strictly forbidden when `NODE_ENV === 'production'`. The seed script will halt with a fatal error if attempted in production.

---

## 4. Running the Application

### Running Both Services Concurrently
From the repository root:
```bash
npm run dev
```

### Or Running Services Individually
- **Backend API Server** (Port `5000`):
  ```bash
  npm run dev:backend
  ```
  Healthcheck: `http://localhost:5000/api/health`

- **Frontend Client** (Port `5173`):
  ```bash
  npm run dev:frontend
  ```
  Access the web application at `http://localhost:5173`.

---

## 5. Running the Automated Test Suite

BorrowBuy includes 89 automated tests covering authentication, concurrency locking, payment simulation, QR pickup/return, mutual reviews, and background jobs:

```bash
# Run all workspace tests:
npm test

# Run backend tests only:
npm run test --workspace=backend

# Run frontend tests only:
npm run test --workspace=frontend
```

---

## 6. Building for Production

Compile frontend and backend bundles:
```bash
# Build frontend static bundle:
npm run build --workspace=frontend

# Build backend TypeScript:
npm run build --workspace=backend
```

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express API server |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/borrowbuy_db` | PostgreSQL connection string |
| `JWT_SECRET` | `borrowbuy-super-secret-jwt-key-2026` | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `STORAGE_DRIVER` | `local` | Upload storage adapter (`local` or `s3`) |
| `NOTIFICATION_DRIVER` | `local` | In-app notification adapter (`local` or `sns`) |
| `PAYMENT_DRIVER` | `simulation` | Payment gateway driver (`simulation` or `gateway`) |
| `ADMIN_INITIAL_PASSWORD` | *(Optional in dev)* | Initial admin password (required in production) |

---

## 8. Demo Accounts for Local Testing

For complete demo credentials (administrator, owners, and customers across Ahmedabad, Surat, and Gandhinagar), see [`docs/demo-accounts.md`](demo-accounts.md).
