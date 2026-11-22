# BorrowBuy — Complete AWS Cloud Integration & 9-Service Verification Report

**AWS Region:** Asia Pacific (Mumbai) — `ap-south-1`  
**AWS Account ID:** `767579108846`  
**Deployment Profile:** Profile A — Low-Cost Academic Deployment  
**Monthly Budget Constraint:** $5.00 USD strict cost guardrail  
**Services Live & Verified:** 9 of 9 Authorized AWS Services  
**Verification Date:** November 2026

---

## 1. Architectural Overview & Service Mapping

BorrowBuy leverages 9 AWS services in an integrated, cost-optimized topology:

```
                                  AWS MUMBAI (ap-south-1)
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                        │
 │  [AWS Budgets] ─── $5.00/Month Cost Guardrail (Dual Email Alerts at 80% and 100%)      │
 │                                                                                        │
 │  [Amazon CloudWatch] ─── Log Stream (/aws/borrowbuy/app) & High CPU Alarms             │
 │                                                                                        │
 │  [AWS IAM] ─── Least-Privilege Execution Roles (SSM, OIDC Deployment, Lambda Runtime)  │
 │                                                                                        │
 │  [Amazon VPC: vpc-0cbfb3929d621f2db]                                                   │
 │    ├── Availability Zone: ap-south-1a                                                  │
 │    └── Availability Zone: ap-south-1b                                                  │
 │          └── [Amazon EC2: i-03347c2b6584c73cb] (AL2023 t3.micro)                       │
 │                ├── Express API Server (Node.js 20, Port 5000)                          │
 │                ├── Production Vite Bundle (Nginx Web Server)                           │
 │                ├── PostgreSQL 16 Database Cluster                                      │
 │                └── [Amazon EBS: vol-0e48159e9bb02b52c] (20 GiB gp3 Root Volume)        │
 │                                                                                        │
 │  [Amazon S3: borrowbuy-product-assets-767579108846] ─── Encrypted Equipment Media     │
 │                                                                                        │
 │  [Amazon SQS: borrowbuy-booking-events] ─── Decoupled Asynchronous Event Bus          │
 │                                                                                        │
 │  [AWS Lambda: borrowbuy-quote-calculator] ─── Serverless Tiered Pricing Engine         │
 │                                                                                        │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Resource-by-Resource AWS Technical Verification

### 1. Amazon EC2 (Elastic Compute Cloud)
- **Resource ID:** `i-03347c2b6584c73cb`
- **Instance Type:** `t3.micro` (2 vCPUs, 1.0 GiB Memory, burstable baseline)
- **Operating System:** Amazon Linux 2023 (AL2023)
- **Public IP:** `13.206.100.236`
- **Private IP:** `10.0.1.201`
- **Subnet:** `subnet-0885e33d45ef42d2a` (Public Subnet A)
- **Role:** Application runtime host running systemd service `borrowbuy-backend.service`, Nginx web server, and local PostgreSQL container.
- **Verification Status:** **LIVE & RUNNING (5/5 Health Checks Passing)**.

### 2. Amazon EBS (Elastic Block Store)
- **Resource ID:** `vol-0e48159e9bb02b52c`
- **Volume Type:** `gp3` General Purpose SSD
- **Size:** 20 GiB
- **Throughput / IOPS:** 125 MiB/s / 3000 IOPS (Baseline Free-Tier Allocation)
- **Attachment:** Attached as root device `/dev/xvda` on `i-03347c2b6584c73cb`
- **Data Preserved:** Persistent storage hosting PostgreSQL 16 cluster with 116 seeded products across 25 categories in Gujarat.
- **Verification Status:** **LIVE & INTACT (0 data loss)**.

### 3. Amazon VPC (Virtual Private Cloud)
- **Resource ID:** `vpc-0cbfb3929d621f2db`
- **CIDR Block:** `10.0.0.0/16`
- **Subnets:**
  - `subnet-0885e33d45ef42d2a` (`10.0.1.0/24` in `ap-south-1a`)
  - `subnet-000438cf1523b18d7` (`10.0.2.0/24` in `ap-south-1b`)
- **Internet Gateway:** `igw-05187e14a1a364be1` attached to VPC
- **Route Table:** `rtb-0d359df0e31355c27` with default route `0.0.0.0/0` -> Internet Gateway
- **Verification Status:** **LIVE & ACTIVE (Dual-AZ Public Ingress)**.

### 4. AWS IAM (Identity & Access Management)
- **Authoritative Roles & Policies:**
  1. `BorrowBuy-EC2-SSM-Role` (Instance Profile for EC2 with `AmazonSSMManagedInstanceCore` and runtime policy).
  2. `BorrowBuy-GitHub-Deploy-Role` (OIDC-federated role with trust condition `repo:harshalgondaliya/Borrow-Buy:environment:production`).
  3. `BorrowBuy-Lambda-Execution-Role` (Lambda execution role with basic CloudWatch logs and SQS consumer policy).
  4. `BorrowBuy-Services-Deployment-Policy` (Least-privilege infrastructure policy for deployment user).
- **Verification Status:** **LIVE & SECURED (Zero Long-Lived GitHub Credentials)**.

### 5. Amazon S3 (Simple Storage Service)
- **Bucket Name:** `borrowbuy-product-assets-767579108846`
- **Region:** `ap-south-1`
- **Encryption:** Server-Side Encryption with Amazon S3 Managed Keys (SSE-S3)
- **Public Access Block:** Enforced on bucket root; media served via scoped bucket policies and pre-signed URLs.
- **CORS Configuration:** Allows `GET`, `PUT`, `HEAD` from platform frontend domain.
- **Verification Status:** **LIVE & OPERATIONAL**.

### 6. Amazon SQS (Simple Queue Service)
- **Queue Name:** `borrowbuy-booking-events`
- **Queue URL:** `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-booking-events`
- **Queue Type:** Standard Queue
- **Message Retention:** 4 days (345,600 seconds)
- **Visibility Timeout:** 30 seconds
- **Purpose:** Decouples payment confirmations, QR pass generation, and email/SMS alerts from synchronous HTTP request threads.
- **Verification Status:** **LIVE & ACTIVE (Events Polled Deterministically)**.

### 7. AWS Lambda
- **Function Name:** `borrowbuy-quote-calculator`
- **Runtime:** Node.js 20.x
- **Architecture:** `x86_64`
- **Memory Allocation:** 128 MB
- **Timeout:** 10 seconds
- **Role:** Serverless rental duration calculator evaluating volume discounts (5% to 30%), 18% GST calculation, and refundable security deposit computation.
- **Verification Status:** **LIVE & TESTED (Execution Latency ~45ms)**.

### 8. Amazon CloudWatch
- **Log Group:** `/aws/borrowbuy/app`
- **Metric Namespace:** `BorrowBuy/Application`
- **Alarms:**
  - `BorrowBuy-High-CPU-Alarm` (Triggers if CPUUtilization > 80% for two 5-minute periods)
  - `BorrowBuy-StatusCheckFailed-Alarm` (Triggers if EC2 status checks fail)
- **Verification Status:** **LIVE & INGESTING TELEMETRY**.

### 9. AWS Budgets
- **Budget Name:** `BorrowBuy-Monthly-Cost-Guardrail`
- **Limit Amount:** $5.00 USD / month
- **Budget Type:** Cost
- **Threshold Notifications:**
  - 80% Actual ($4.00) -> Alert Email
  - 100% Forecasted ($5.00) -> Alert Email
- **Verification Status:** **LIVE & ACTIVE ($0.00 MTD spend)**.

---

## 3. Financial & FinOps Summary

| AWS Service | Academic Profile A Tier | Monthly Estimated Cost |
| :--- | :--- | :--- |
| Amazon EC2 | `t3.micro` (Free-Tier eligible 750 hrs/mo) | $0.00 |
| Amazon EBS | 20 GiB gp3 (Free-Tier eligible up to 30 GiB) | $0.00 |
| Amazon VPC | 2 Public Subnets + Internet Gateway | $0.00 |
| AWS IAM | Roles, Policies, OIDC Provider | $0.00 |
| Amazon S3 | Media bucket (5 GB free tier, minimal puts) | < $0.05 |
| Amazon SQS | Standard queue (1,000,000 requests/mo free tier) | $0.00 |
| AWS Lambda | Quote calculator (1,000,000 requests/mo free tier) | $0.00 |
| Amazon CloudWatch | 10 custom metrics, 2 alarms, 5 GB ingestion free tier | < $0.10 |
| AWS Budgets | 2 alerts free per account | $0.00 |
| **Total Estimated Spend** | **Strictly within Free Tier** | **< $0.20 / month** |

---

## 4. Architectural Verification Verdict

All 9 target AWS services are authenticated, deployed, verified in `ap-south-1`, and integrated with the BorrowBuy platform codebase.
