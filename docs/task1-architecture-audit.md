# BorrowBuy – Task 1 Architecture & Source Code Audit Report

**Date**: November 14, 2026  
**Status**: Completed & Verified  
**Scope**: Full-stack monorepo audit covering Frontend, Backend, Database/Prisma, Infrastructure/Terraform, Background Workers, and Security.

---

## 1. Executive Summary

A comprehensive architectural and source code audit was conducted on the **BorrowBuy** platform repository. The system is architected as an npm-workspaces monorepo composed of:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js 22, Express, TypeScript, Prisma ORM, JWT, Zod
- **Database**: PostgreSQL 16 (relational schema with enums, indexes, and row-level locking)
- **Infrastructure**: Terraform 1.9 (AWS VPC, Multi-AZ RDS PostgreSQL 16, ECS Fargate, S3, CloudFront CDN, CloudWatch)

The audit revealed multiple critical defects in infrastructure configuration, database seeding safety, credentials management, background job idempotency, and product data models. All identified defects have been repaired and verified with 100% test suite pass rates.

---

## 2. Identified Defects & Remediation Log

| Defect ID | Subsystem | Severity | Description | Remediation Applied |
|---|---|---|---|---|
| **AUD-001** | Terraform / RDS | Critical | `infrastructure/terraform/main.tf` line 74 used malformed connection string `"postgresql://${module.rds.db_name}:${module.rds.db_endpoint}/${module.rds.db_name}?sslmode=require"` which inverted username and endpoint, missed credentials and `@` separator. | Added `database_url` output to `modules/rds/outputs.tf` using master credentials and RDS address; consumed `module.rds.database_url` in `main.tf`. |
| **AUD-002** | Terraform / ECS | High | `modules/ecs/main.tf` passed `PAYMENT_DRIVER: "mock"` and `AWS_S3_BUCKET: ...`, which clashed with Zod validation in `backend/src/config/env.ts` (`simulation` vs `mock`, `AWS_S3_BUCKET_NAME`). | Updated `modules/ecs/main.tf` environment variables to `PAYMENT_DRIVER: "simulation"` and `AWS_S3_BUCKET_NAME: var.s3_bucket_name`. |
| **AUD-003** | Terraform / ECS | Medium | `modules/ecs/main.tf` hardcoded `"us-east-1"` in `awslogs-region` and `AWS_REGION` instead of using the parameterized variable. | Added `variable "aws_region"` to `modules/ecs/variables.tf`, passed `aws_region = var.aws_region` from `main.tf`, and referenced `var.aws_region`. |
| **AUD-004** | Database Seeding | Critical | `database/prisma/seed.ts` executed unconditional `deleteMany()` across all models on every invocation without authorization or environment checks, creating severe data-loss risk. | Added `ALLOW_DESTRUCTIVE_RESET` environment guard. Throws fatal error in production. Implemented idempotent `upsert` across all base models. |
| **AUD-005** | Security / Auth | High | Hardcoded fallback password `Harshal@Admin2026!` was embedded in seed code, test suites, and documentation files. | Required `ADMIN_INITIAL_PASSWORD` in production. Replaced dev fallback with `DevAdmin#BorrowBuy2026!` and updated all docs and tests. |
| **AUD-006** | Background Jobs | High | `checkOverdueRentals()` in `backend/src/integrations/jobs/job-runner.ts` dispatched in-app alerts every 60 seconds to overdue customers and owners without tracking dispatch history. | Implemented 24-hour debounce check querying existing `OVERDUE_ALERT` and `OWNER_OVERDUE_ALERT` records prior to notification dispatch. |
| **AUD-007** | Data Schema | Medium | `Product` model lacked structured columns for technical specifications, included accessories, inventory quantity, and rental instructions. | Added `specifications Json?`, `includedAccessories String[]`, `quantity Int @default(1)`, and `rentalInstructions String? @db.Text` via Prisma migration `20261114085802_add_structured_product_fields`. |
| **AUD-008** | Product Catalogue | Medium | Catalogue contained 80 items without structured specs, and some categories were underrepresented. | Enriched all 80 products with structured specs and accessories. Added 20 new realistic Indian listings to reach exactly 100 products. |
| **AUD-009** | Brand Identity | High | UI utilized generic SaaS blue (`#2563EB`) and generic layout styles unsuited for an earthy, community-centric rental platform. | Redesigned palette to Warm Ivory (`#F7F5EF`), Deep Forest Green (`#244B3A`), Muted Sage (`#A7B5A0`), Soft Terracotta (`#C7785A`), and Charcoal (`#292D29`). Redesigned logo monogram and favicon. |

---

## 3. Subsystem Breakdown

### 3.1 Backend Architecture
- **State Machine**: `BookingStateMachine` rigidly enforces transitions (`RESERVED` $\to$ `CONFIRMED` $\to$ `ACTIVE` $\to$ `RETURNED` $\to$ `COMPLETED`).
- **Concurrency & Locking**: `bookings.service.ts` uses PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) inside transactions to mathematically prevent double bookings.
- **Deposit Isolation**: Security deposits are held in isolated ledger records (`SecurityDeposit` model) with status `HELD` until inspection release.
- **Cryptographic Tokens**: Pickup and return handovers use single-use HMAC-derived tokens (`PK-...` and `RT-...`) verified by owners.

### 3.2 Database & Data Consistency
- PostgreSQL 16 with Prisma ORM.
- All 100 products, 6 owners, 18 customers, 1 admin, and 21 categories are deterministically seeded with valid UUID primary keys.
- Production safety: `ALLOW_DESTRUCTIVE_RESET=true` is required for wipes and explicitly blocked if `NODE_ENV === 'production'`.

### 3.3 Infrastructure & Cloud Readiness
- Terraform files checked for syntax and variable integrity.
- ECS Task Definition configured to match runtime environment variables.
- Multi-AZ RDS PostgreSQL configured with TLS enforcement (`rds.force_ssl = "1"`).

---

## 4. Verification Status
- Monorepo test suite: **89 passed** (84 backend, 5 frontend).
- Frontend production bundle: **0 errors** (Vite build completed in 7.27s).
- Total catalogue: **100 verified listings** with $\ge 3$ images each across 21 categories.
