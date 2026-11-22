# BORROWBUY — FACULTY DEMO & ACADEMIC EVALUATION RUNBOOK

**Document Version:** 2.1.0  
**Target Audience:** University Faculty, Academic Evaluators & Project Reviewers  
**Platform:** BorrowBuy — Enterprise Equipment Rental & Management Platform  
**Target AWS Account:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Live Verification Script:** `powershell -ExecutionPolicy Bypass -File "scripts/verify-aws-all-nine.ps1"`  

---

## 1. Demonstration Overview & Evaluation Objectives

This runbook guides evaluators and students through a structured, 15-minute live demonstration of BorrowBuy. It covers both the **cloud infrastructure architecture on AWS** and the **full-stack enterprise application lifecycle**.

### Key Points of Evaluation
1. **Multi-Service AWS Cloud Architecture (9 Services):** Demonstrating IAM, VPC, Budgets, EC2, EBS, S3, CloudWatch, SQS, and Lambda all running live in AWS Mumbai (`ap-south-1`).
2. **Bastion-Less Cloud Security:** Explaining zero open ingress ports, encrypted EBS storage, and AWS Systems Manager Session Manager access.
3. **Graceful Multi-Cloud Adapter Pattern:** Proving seamless operation with live AWS services and fallback adapters.
4. **End-to-End Rental Lifecycle:** From 116 curated Gujarat equipment listings to reservation holds, simulated payments, cryptographic QR tokens, and mutual trust reviews.

---

## 2. Part 1: AWS Cloud Infrastructure Live Verification (5 Minutes)

Run the automated verification script from PowerShell to present a live verification report to the faculty:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/verify-aws-all-nine.ps1"
```

### What to Point Out in the Terminal Output:
1. **AWS Identity (IAM):** Confirms authenticated IAM user `borrowbuy-admin` in account `767579108846` with 7 attached managed policies and least-privilege roles.
2. **VPC Architecture:** Confirms VPC `vpc-0cbfb3929d621f2db` with 4 subnets across `ap-south-1a` & `ap-south-1b` and attached IGW `igw-05e9ddf2c3f79846f`.
3. **AWS Budget:** Shows active $5.00 monthly spending limit with $0.00 spend and `HEALTHY` status.
4. **EC2 Compute Host:** Shows instance `i-03347c2b6584c73cb` (`t3.small`) running in Mumbai, with 2/2 reachability checks passed, SSM agent Online, and Docker containers running Express, Postgres, and Nginx.
5. **EBS Storage & Persistence:** Shows volume `vol-0e48159e9bb02b52c` (20 GiB gp3) KMS encrypted and attached to `/dev/xvda`. Demonstrates 2 verified SQL records persisted across container restarts.
6. **Amazon S3:** Shows bucket `borrowbuy-dev-assets` in `ap-south-1` with SSE-AES256, versioning, and public access blocks.
7. **Amazon CloudWatch:** Shows active log group `/borrowbuy/application-logs`, published metric `ApiRequestCount`, and 2 healthy alarms (`borrowbuy-dev-ec2-cpu-high`, `borrowbuy-dev-ec2-status-check-failed`).
8. **Amazon SQS:** Shows main queue `borrowbuy-dev-events` and dead-letter queue `borrowbuy-dev-events-dlq` with SSE-SQS encryption.
9. **AWS Lambda:** Shows serverless function `borrowbuy-quote-calculator-dev` (Node.js 20.x) returning 200 OK calculations for rental quotes.

---

## 3. Part 2: Local Application Demonstration (7 Minutes)

### Step 1: Start PostgreSQL and Backend
In a terminal:
```bash
cd backend
npm run dev
```
*(Backend initializes on `http://localhost:5000` with local storage and simulation payment drivers).*

### Step 2: Start Frontend UI
In a second terminal:
```bash
cd frontend
npm run dev
```
*(Frontend launches on `http://localhost:5173`).*

### Step 3: Demonstrate the 10-Step Rental Flow
1. **Explore Catalogue:** Navigate to `http://localhost:5173`. Filter by category (e.g. *Cameras*, *Construction*, *Audio*) and city (*Ahmedabad*, *Surat*, *Vadodara*). Note the 116 natural product listings with clear specs and pricing.
2. **User Authentication:** Log in as customer (`customer@borrowbuy.com` / `BorrowBuy@2026!`). Note initial trust score (5.0).
3. **Create Booking & 15-Minute Hold:** Select an item (e.g., *Sony FX3 Cinema Camera Kit*), pick rental dates. Show the 15-minute temporary reservation hold preventing overlapping bookings.
4. **Simulate Payment & Deposit Isolation:** Click checkout. Note the security deposit isolation and mock transaction confirmation (`TXN-SIM-...`).
5. **Cryptographic QR Code:** Navigate to bookings. Display the single-use pickup QR code generated for the renter.
6. **Owner Pickup Verification:** Switch to owner view (`owner@borrowbuy.com` / `BorrowBuy@2026!`). Scan or enter the QR code token. Booking transitions to `ACTIVE`.
7. **Equipment Return & Inspection:** Click "Complete Return". Enter inspection details (0 damage), release security deposit.
8. **Mutual Reviews:** Submit 5-star reviews from both renter and owner. Show the dynamic recalculation of the user trust score.

---

## 4. Part 3: Automated Test Verification (3 Minutes)

Run the full automated test suite to prove 100% test pass rate:

```bash
cd backend
npm test
```

### Key Metrics to Show:
- **103 passed out of 103 Vitest tests** across 9 test suites.
- Coverage spans booking lifecycle, hold timeouts, pricing calculations, role-based authorization, and AWS service adapters.

To demonstrate frontend production build readiness:
```bash
cd frontend
npm run build
```
*(Confirms 0 TypeScript errors, clean bundle compilation via Vite).*
