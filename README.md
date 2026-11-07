# BorrowBuy – Product Rental and Management Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![AWS Ready](https://img.shields.io/badge/AWS-Ready_Architecture-FF9900.svg)](https://aws.amazon.com/)

BorrowBuy is a peer-to-peer product rental marketplace connecting product owners with local borrowers. Designed with clean modular architecture, atomic rental concurrency guarantees, single-use QR verification, pre/post inspection damage disputes, and an AWS cloud-ready hexagonal adapter design.

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
├── frontend/             # React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
├── backend/              # Node.js, Express, TypeScript, REST API, Zod Validation
├── database/             # Prisma ORM, PostgreSQL schema, migrations, seed script
├── infrastructure/       # Docker Compose, Dockerfiles, Terraform AWS modules
├── docs/                 # Academic and cloud architecture documentation
├── .env.example          # Monorepo environment variable template
├── docker-compose.yml    # Local PostgreSQL 16 container definition
└── package.json          # Monorepo workspaces definition
```

---

## 3. Quick Start Setup Guide (Windows PowerShell)

Follow these steps sequentially to set up and start the application locally.

### Step 1: Clone and Enter the Project Directory
```powershell
cd "h:\CC Project"
```

### Step 2: Install All Monorepo Dependencies
From the root directory, run:
```powershell
npm install
```
*This installs dependencies for the root monorepo, backend, frontend, and database workspaces in one pass.*

### Step 3: Start the Local PostgreSQL Database
Ensure Docker Desktop is running, then execute:
```powershell
npm run db:up
```
*This launches a persistent PostgreSQL 16 container named `borrowbuy-postgres` on port `5432`.*

To verify the container is healthy:
```powershell
docker ps
```

### Step 4: Configure Environment Files
Environment configuration files (`.env`) have been initialized from `.env.example` templates in root, `backend/`, `frontend/`, and `database/`. 
Default settings point to `localhost:5432` for PostgreSQL and `localhost:5000` for the backend API.

### Step 5: Run Database Migrations and Seed Sample Data
```powershell
npm run db:migrate
npm run db:seed
```

### Step 6: Start the Development Servers
In one terminal, start the backend:
```powershell
npm run dev:backend
```
*Backend runs on: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)*

In a second terminal, start the frontend:
```powershell
npm run dev:frontend
```
*Frontend runs on: `http://localhost:5173`*

---

## 4. Useful NPM Scripts

| Command | Workspace | Description |
| :--- | :--- | :--- |
| `npm run dev:backend` | `backend` | Starts Express backend in hot-reload mode using `tsx watch` |
| `npm run dev:frontend` | `frontend` | Starts Vite frontend dev server at `http://localhost:5173` |
| `npm run db:up` | Root | Starts local PostgreSQL container via Docker Compose |
| `npm run db:down` | Root | Stops local PostgreSQL container |
| `npm run db:migrate` | `database` | Applies pending Prisma migrations to the database |
| `npm run db:seed` | `database` | Seeds sample users, categories, products, and bookings |
| `npm run db:studio` | `database` | Opens Prisma Studio visual database GUI on port 5555 |
| `npm run test` | Monorepo | Runs Vitest test suites across all workspaces |
| `npm run build` | Monorepo | Compiles TypeScript and builds production bundles |

---

## 5. Linux / macOS Setup Commands
For developers on Unix environments:
```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL container
npm run db:up

# 3. Run migrations and seed data
npm run db:migrate
npm run db:seed

# 4. Start backend and frontend
npm run dev:backend
npm run dev:frontend
```

---

## 6. AWS Cloud Readiness
The platform is built with **Hexagonal / Ports-and-Adapters** design:
- **Storage**: `STORAGE_DRIVER=local` saves uploads to `./backend/uploads/`. In Stage B, changing to `s3` connects to Amazon S3 via presigned URLs.
- **Notifications**: `NOTIFICATION_DRIVER=local` saves to PostgreSQL and outputs to console. In Stage B, `sns` connects to Amazon SNS.
- **Payments**: `PAYMENT_DRIVER=simulation` simulates rental fees, security deposit holds, and refunds locally.
- **Database**: Prisma handles PostgreSQL locally and connects directly to Amazon RDS in Stage B via `DATABASE_URL`.

All cloud infrastructure resources and mappings are documented in [`docs/aws-resource-registry.md`](docs/aws-resource-registry.md).

