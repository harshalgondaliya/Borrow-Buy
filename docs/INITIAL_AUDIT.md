# BorrowBuy – Comprehensive Project Audit & Baseline Assessment

**Project**: BorrowBuy – Product Rental and Management Platform  
**Audit Date**: November 17, 2026  
**Auditor**: Senior Full-Stack Cloud Solutions Architect & Lead Security Engineer  
**Document Version**: 3.0 (Master Execution Baseline)  

---

## 1. Executive Summary & Original Purpose

**BorrowBuy** is a peer-to-peer and business-to-consumer product rental and equipment management platform localized for the Indian market (focused on Gujarat hubs: Ahmedabad, Gandhinagar, Surat, Vadodara, and Rajkot). The platform allows equipment owners to monetize underutilized high-value gear (cameras, drones, power tools, audiovisual gear, gaming rigs, camping gear, instruments) while enabling verified customers to rent verified equipment with secure deposit escrow, transparent daily pricing, cryptographic QR handovers, mutual review scoring, and condition inspections.

---

## 2. Technology Stack & Framework Inventory

| Tier | Component / Library | Active Version | Architectural Role |
|---|---|---|---|
| **Frontend Runtime** | React | `18.3.1` | Declarative UI rendering & state management |
| **Frontend Build Tool**| Vite | `6.0.3` | Fast bundling, HMR, and production minification |
| **Styling & Design** | Tailwind CSS + PostCSS | `3.4.16` | Utility-first design system with design tokens |
| **Animations** | Framer Motion | `14.10.1` | Micro-interactions, slide-overs, and transitions |
| **Client Routing** | React Router DOM | `7.0.2` | Multi-page client-side SPA routing |
| **Icons** | Lucide React | `0.468.0` | Modern, consistent SVG iconography |
| **Backend Runtime** | Node.js | `v22.12.0` | Asynchronous JavaScript runtime environment |
| **Backend Framework** | Express | `4.21.2` | RESTful API routing, middleware, and request pipeline |
| **Language** | TypeScript | `5.7.2` | Static type safety across frontend and backend |
| **ORM / Data Layer** | Prisma ORM | `5.22.0` | Type-safe query builder and database migrations |
| **Primary Database** | PostgreSQL | `16.0-alpine` | Relational storage for users, listings, bookings, payments |
| **NoSQL Database** | Amazon DynamoDB | SDK v3 | High-throughput immutable rental audit logs & state locks |
| **Cloud SDK** | AWS SDK for JavaScript v3 | `3.1169.0` | Modular cloud adapters (S3, SQS, SNS, EventBridge, CloudWatch) |
| **Testing Framework** | Vitest + Supertest | `2.1.8` / `7.0.0`| Monorepo unit and integration test runners |
| **Infrastructure as Code**| HashiCorp Terraform | `v1.17.0` | Multi-tier cloud infrastructure provisioning |

---

## 3. Architecture & Data Flow Analysis

### Current Architecture
The platform operates as a decoupled client-server architecture:
1. **Client Tier**: Single Page Application (SPA) compiled to static HTML/CSS/JS artifacts ready for Amazon S3 and Amazon CloudFront edge caching.
2. **API Tier**: Node.js/Express REST API serving JSON endpoints with JWT authentication and RBAC (`CUSTOMER`, `OWNER`, `ADMIN`).
3. **Database Tier**: PostgreSQL relational database with Prisma schema enforcing foreign key integrity across 8 core models: `User`, `Category`, `Product`, `Booking`, `Payment`, `Inspection`, `Review`, `Notification`.
4. **Storage Tier**: Pluggable storage architecture supporting local disk `./uploads` for development and Amazon S3 with CloudFront CDN for cloud deployments.
5. **Event & Messaging Tier**: Pluggable notification service supporting in-app database notifications and Amazon SNS topic publishing; SQS queue worker for non-blocking asynchronous processing.

---

## 4. User-Facing Features & Page Hierarchy

### Core User Journeys
1. **Marketplace Discovery**: Category browsing (25 curated Indian categories), full-text search, price/condition filtering, availability checks, and image gallery modals.
2. **Booking & Rental State Machine**: 11 distinct operational states (`PENDING`, `RESERVED`, `CONFIRMED`, `READY_FOR_PICKUP`, `ACTIVE`, `RETURN_REQUESTED`, `RETURNED`, `COMPLETED`, `CANCELLED`, `EXPIRED`, `DISPUTED`).
3. **Cryptographic QR Handover Tokens**: Dual-token single-use QR system for secure physical handovers (`BB-PICKUP-...` for pickup verification and `BB-RETURN-...` for return verification).
4. **Deposit Escrow & Simulated Payments**: Dedicated isolation of rental charges from security deposits; automated refund triggering upon post-rental inspection approval.
5. **Owner Equipment Management**: Listing creation, multi-image upload, rate configuration, booking approval/rejection, and earnings tracking.
6. **Administrator Control**: Category taxonomy management, user verification status, dispute resolution, and system audit logs.

---

## 5. Confirmed Defects & Deployment Blockers Audit

The deep inspection identified the following architectural and code-level defects requiring correction:

| ID | Category | Defect Description | Exact File Location | Severity | Root Cause | Proposed Solution |
|---|---|---|---|:---:|---|---|
| **AUD-01** | Routing / UX | Entire application runs as a single-page modal stack without real URL routing; reloading loses user state | `frontend/src/App.tsx`<br>`frontend/src/main.tsx` | **HIGH** | `react-router-dom` installed but `App.tsx` conditionally rendered modals via local boolean state | Implement full `BrowserRouter` with dedicated routes (`/`, `/browse`, `/bookings`, `/dashboard`, `/admin`, `/cloud`, `/settings`, `/help`, 404 page) |
| **AUD-02** | Cloud Tier | Cloud operations, telemetry, and architecture inspection are invisible to faculty evaluators | Missing `/cloud` route and telemetry API | **HIGH** | No unified observability endpoint connecting backend status to frontend UI | Create `/api/cloud` telemetry route and a premium authenticated Cloud Operations page |
| **AUD-03** | AWS Infrastructure | Terraform defined either a single-instance EC2 baseline or ECS without an Application Load Balancer + Auto Scaling Group module pair | `infra/terraform/main.tf` | **HIGH** | ASG and ALB modules were not coupled as a cohesive launch-template Auto Scaling architecture | Implement production-grade Auto Scaling Group, Launch Template, ALB Target Group, and scale-out/in policies in Terraform |
| **AUD-04** | Serverless / API Gateway | No standalone Lambda handlers existed for serverless operations (quote calculations, audit logging, EventBridge hold sweeper) | `backend/src/` | **MEDIUM** | Operations were tightly coupled inside the Express monolithic container | Extract discrete serverless handlers into `backend/src/lambda/` with OpenAPI specs |
| **AUD-05** | NoSQL Data Tier | DynamoDB table was declared in concept but lacked a concrete SDK v3 client adapter and table schema | `backend/src/integrations/` | **MEDIUM** | Project relied solely on PostgreSQL without demonstrating NoSQL multi-model persistence | Implement `DynamoDbService` with audit log tracking (`borrowbuy-rental-audit-logs`) and offline fallback |
| **AUD-06** | Authentication | Amazon Cognito User Pool was declared in docs but Express auth middleware solely evaluated local JWTs | `backend/src/middleware/auth.ts` | **MEDIUM** | No dual-verification adapter for Cognito identity tokens | Implement Cognito token verification fallback alongside local secret verification |
| **AUD-07** | Network Design | VPC lacked explicit private subnet assignment for Auto Scaling instances and conditional Client VPN module | `infra/terraform/modules/vpc/` | **MEDIUM** | Initial student baseline placed EC2 in a public subnet to avoid NAT Gateway costs | Expand Terraform with multi-AZ private subnets, ALB in public subnets, and an optional Client VPN module |

---

## 6. Audit Conclusion & Remediation Roadmap

The underlying business logic, Prisma data schema, 116 curated Gujarat products, and 90 backend tests are solid and functional. To achieve full enterprise standard and satisfy all academic faculty requirements, the project will be upgraded through the 24 phases with zero destruction of existing working features.
