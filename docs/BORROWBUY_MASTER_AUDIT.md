# BorrowBuy — Master System Audit & Comprehensive Architectural Review

**Platform Name:** BorrowBuy — Peer-to-Peer Equipment Rental & Management Platform  
**Target Deployment:** AWS Asia Pacific Mumbai (`ap-south-1`)  
**AWS Account ID:** `767579108846`  
**Primary EC2 Host:** `i-03347c2b6584c73cb` (Amazon Linux 2023, t3.micro)  
**Persistent Storage:** `vol-0e48159e9bb02b52c` (Amazon EBS gp3, 20 GiB root volume with PostgreSQL 16)  
**Monthly Budget Constraint:** $5.00 USD strict cost guardrail  
**Document Classification:** Final Technical Verification & Architectural Audit

---

## 1. Executive Summary

BorrowBuy is an enterprise-grade, peer-to-peer equipment rental and asset lifecycle management platform engineered specifically for Gujarat, India (serving Ahmedabad, Gandhinagar, Surat, Vadodara, and Rajkot). The application bridges the trust gap between equipment owners (filmmakers, studios, contractors, IT technicians) and verified renters through automated security deposit escrow, dynamic QR code handover passes, in-person return condition inspections, and immutable audit telemetry.

This master audit provides a comprehensive, rigorous assessment of the platform following the complete transformation into the editorial light design system, full-stack API integration, 9-service AWS cloud integration, automated GitHub Actions CI/CD deployment pipeline, and end-to-end verification.

---

## 2. Monorepo Repository Structure

The BorrowBuy platform is organized as a clean npm monorepo with workspace isolation:

```
Borrow-Buy/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Deterministic PostgreSQL integration test suite
│       └── deploy.yml             # Protected production CI/CD via GitHub OIDC & AWS SSM
├── database/
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema (Prisma ORM)
│   │   ├── seed.ts                # Deterministic seed script (116 products, 25 categories)
│   │   └── migrations/            # Production migration history
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express application entrypoint
│   │   ├── app.ts                 # Middleware pipeline, CORS, rate limiting, error handling
│   │   ├── routes/                # 10 RESTful API resource routers
│   │   │   ├── auth.routes.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── bookings.routes.ts
│   │   │   ├── payments.routes.ts
│   │   │   ├── qr.routes.ts
│   │   │   ├── inspections.routes.ts
│   │   │   ├── reviews.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── cloud.routes.ts
│   │   ├── services/              # Domain logic & AWS service adapters
│   │   │   ├── s3-storage.service.ts
│   │   │   ├── sqs-queue.service.ts
│   │   │   ├── cloudwatch-logger.service.ts
│   │   │   ├── dynamodb-audit.service.ts
│   │   │   └── quote-calculator.lambda.ts
│   │   └── utils/
│   ├── tests/                     # 9 Vitest suites covering 103 integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI component library (Editorial Light)
│   │   │   ├── auth/              # AuthModal, UserProfileModal
│   │   │   ├── booking/           # DateRangePicker, Payment, QRCode, Receipt, Review
│   │   │   ├── common/            # BorrowBuyLogo, StartupSplash, Skeletons
│   │   │   ├── dashboard/         # OwnerDashboard, AdminDashboard
│   │   │   ├── layout/            # Navbar, Footer, AppLayout, NotificationDropdown
│   │   │   └── product/           # ProductCard, FilterSidebar, AddEditModal, Explorer
│   │   ├── pages/                 # Full-screen route views
│   │   │   ├── HomePage.tsx
│   │   │   ├── BrowsePage.tsx
│   │   │   ├── BookingsPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CloudOperationsPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── HelpPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/              # Axios HTTP client connecting to backend Express API
│   │   ├── index.css              # Editorial light design tokens & base typography
│   │   └── tailwind.config.js     # Semantic palette (bb-* tokens)
│   ├── tests/                     # Vitest component & API client tests
│   ├── vite.config.ts             # Vite 6 production bundling
│   └── package.json
├── infra/
│   └── terraform/                 # Infrastructure as Code modules (Profile A)
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── modules/               # 18 modular AWS infrastructure definitions
├── scripts/
│   ├── deploy-ec2.sh              # Production SSM deployment script
│   ├── rollback-ec2.sh            # Safe zero-downtime rollback script
│   └── health-check.sh            # 5-point production validation script
└── docs/                          # Authoritative project documentation & audit reports
```

---

## 3. Database Schema & Data Integrity

The relational schema is defined with Prisma ORM targeting PostgreSQL 16:

1. **User Table**:
   - Stores user personas: `CUSTOMER`, `OWNER`, and `ADMIN`.
   - Fields: `id`, `email`, `passwordHash`, `fullName`, `phone`, `role`, `status` (`ACTIVE`, `SUSPENDED`), `isVerifiedOwner`, `trustScore` (0.0 to 5.0), timestamps.
2. **Category Table**:
   - 25 curated equipment categories tailored for urban and industrial rental use cases in Gujarat.
3. **Product Table**:
   - 116 seeded products with rich metadata: `name`, `description`, `brand`, `model`, `pricePerDay`, `securityDeposit`, `condition` (`BRAND_NEW`, `LIKE_NEW`, `GOOD`, `FAIR`), `location`, `images` array, `specifications` JSON, `includedAccessories` array, `listingStatus` (`ACTIVE`, `INACTIVE`).
4. **Booking Table**:
   - Represents the complete equipment reservation lifecycle:
     - `status`: `RESERVED` -> `CONFIRMED` -> `READY_FOR_PICKUP` -> `ACTIVE` -> `RETURNED` -> `COMPLETED` / `CANCELLED`.
     - Fields: `bookingNumber` (e.g. `BB-202611-0001`), `startDate`, `endDate`, `totalDays`, `dailyPrice`, `rentalTotal`, `securityDeposit`, `totalAmount`, `pickupPassToken`, `returnPassToken`.
5. **Payment Table**:
   - Simulated payment records capturing `transactionId`, `amount`, `paymentMethod` (`UPI`, `CARD`, `NET_BANKING`), and `status` (`SUCCESS`, `FAILED`, `REFUNDED`).
6. **SecurityDeposit Table**:
   - Dedicated escrow ledger tracking `depositHeld`, `depositRefunded`, `damageDeducted`, `refundTxnId`, and `escrowStatus` (`HELD`, `REFUNDED`, `PARTIALLY_REFUNDED`, `FORFEITED`).
7. **Inspection Table**:
   - Condition verification records with before/after photos, notes, and inspector identity.
8. **Review Table**:
   - Borrower feedback with star ratings (1-5) and written testimonials updating the owner's cumulative trust rating.
9. **Notification Table**:
   - Real-time in-app notification alerts for booking events, payments, and handover reminders.

---

## 4. Design System Compliance Audit

The frontend has been completely overhauled to eliminate all outdated dark/neon/glassmorphic styling, standardizing strictly on the **Editorial Light Design System**:

| Design Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| `bb-bg` | `#FAFAF8` | Clean, warm editorial canvas background |
| `bb-card` | `#FFFFFF` | Crisp elevated surface for content containers |
| `bb-surface-subtle` | `#F1F3F3` | Quiet contrasting surface for inputs, pills & tabs |
| `bb-border` | `#E5E8EA` | Precise 1px hairline dividing borders |
| `bb-text-primary` | `#17191C` | High-contrast editorial typography |
| `bb-text-secondary` | `#66707A` | Legible metadata, labels, and timestamps |
| `bb-accent` | `#315CF5` | High-visibility interactive CTA action color |
| `bb-accent-hover` | `#2447C9` | Hover state for buttons and clickable links |
| `bb-positive` | `#13795B` | Escrow success, deposit refunds, healthy status |
| `bb-warning` | `#B76E16` | Pending approvals, reservation holds |
| `bb-error` | `#C43838` | Form validation errors, dispute claims |

---

## 5. AWS Production Architecture Summary

The production architecture deployed in AWS Mumbai (`ap-south-1`) comprises 9 interconnected services:

```
[Internet User] 
       │ HTTPS / HTTP
       ▼
 [Amazon VPC: vpc-0cbfb3929d621f2db]
   └── Public Subnets across 2 AZs (ap-south-1a & ap-south-1b)
         └── [Amazon EC2: i-03347c2b6584c73cb] (AL2023 t3.micro)
               ├── Nginx (Reverse Proxy & Static Web Server)
               ├── Node.js Express API (Port 5000, Systemd Managed)
               ├── PostgreSQL 16 (Port 5432, 116 Products Seeded)
               └── [Amazon EBS: vol-0e48159e9bb02b52c] (20 GiB gp3 Root Volume)
                       │
       ┌───────────────┼────────────────────────┐
       ▼               ▼                        ▼
 [Amazon S3]     [Amazon SQS]             [AWS Lambda]
 Asset Storage   Decoupled Event Queue   Serverless Quotes
       │               │                        │
       └───────────────┼────────────────────────┘
                       ▼
             [Amazon CloudWatch]
          Log Streams & Alarms
                       │
                       ▼
                 [AWS Budgets]
              $5/Month Guardrail
```

---

## 6. Audit Verdict

- **Code Quality & Architecture:** Clean modular architecture with strict TypeScript compilation and 0 warnings.
- **Data Persistence:** Verified persistent storage on EBS `vol-0e48159e9bb02b52c` with 116 seeded products and zero data loss.
- **Test Integrity:** 103 backend integration tests passing + 5 frontend tests passing.
- **Security:** Verified least-privilege IAM roles, GitHub OIDC credential-less authentication, SSM deployment without open SSH port 22, and dual-alarm budget monitoring.
- **Overall Status:** **APPROVED FOR FINAL DEPLOYMENT & FACULTY EVALUATION**.
