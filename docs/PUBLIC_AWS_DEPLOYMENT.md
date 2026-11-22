# BorrowBuy — Public AWS Deployment Architecture & CloudFront Guide

**Project:** BorrowBuy — Equipment Rental & Inventory Management Platform  
**Target AWS Account:** `767579108846`  
**Primary Region:** `ap-south-1` (Mumbai)  
**Host EC2 Instance:** `i-03347c2b6584c73cb` (`t3.small`)  
**Public IP:** `13.206.100.236`  
**Public DNS:** `ec2-13-206-100-236.ap-south-1.compute.amazonaws.com`  
**Security Group:** `sg-033b02984ba31dc71` (`borrowbuy-ec2-sg`)  
**Persistent Storage:** AWS EBS Volume `vol-0e48159e9bb02b52c` (PostgreSQL 16)  

---

## 1. High-Level Production Architecture

```
[Public Web Browser / Mobile Device]
                │
                │ HTTPS (Port 443) with Amazon SSL/TLS
                ▼
[Amazon CloudFront Global Edge Network] (*.cloudfront.net)
   ├── Default (/*)    ──> Edge-Cached Static Assets (Gzip/Brotli, 24h TTL)
   ├── /images/*       ──> Edge-Cached WebP Equipment Images (7d TTL)
   └── /api/*          ──> Uncached Dynamic API (Managed-CachingDisabled)
                            + Forward Authorization, Cookies & Query Strings
                │
                │ HTTP (Port 80) with 'X-Origin-Verify: <secret>' header
                │ Source restricted to CloudFront Managed Prefix List (pl-9aa247f3)
                ▼
[EC2 Security Group: sg-033b02984ba31dc71] (Port 80 Allowed for CloudFront IPs Only - NO 0.0.0.0/0)
                │
                ▼
[EC2 Host: i-03347c2b6584c73cb] (Amazon Linux 2023)
   ├── Docker: borrowbuy-proxy (Nginx 1.24) ──> Static SPA (/usr/share/nginx/html)
   │                                         ──> API Proxy to http://172.17.0.1:5000
   ├── Systemd: borrowbuy-backend.service    ──> Node.js 20 Express (Port 5000)
   └── Docker: borrowbuy-postgres            ──> PostgreSQL 16 (Port 5432, loopback only)
                │
                ▼
   [9 Core Integrated AWS Services]
   ├── IAM: Least-Privilege SSM & Lambda Roles
   ├── VPC & Subnets: Dual-AZ Isolated Networking
   ├── EBS: Persistent Encrypted Database Volume
   ├── S3: Asset Storage (borrowbuy-dev-assets)
   ├── SQS: Event Queue (borrowbuy-dev-events)
   ├── Lambda: Serverless Quote Calculator (borrowbuy-quote-calculator-dev)
   ├── CloudWatch: Application Metrics & Alarm Monitoring
   └── AWS Budgets: $5.00/month Spend Alarm Control
```

---

## 2. CloudFront Edge Distribution Specification

| Setting | Configuration Value | Rationale |
|---|---|---|
| **Origin Domain** | `ec2-13-206-100-236.ap-south-1.compute.amazonaws.com` | Direct connection to our existing EC2 public DNS |
| **Origin Protocol** | HTTP Only (Port 80) | Eliminates expensive ALB / commercial SSL costs; CloudFront terminates public HTTPS |
| **Origin Custom Header** | `X-Origin-Verify: <dynamic-secret>` | Secret header verified by origin Nginx (no committed secrets) |
| **Viewer Protocol Policy** | `redirect-to-https` | Enforces 100% encrypted TLS 1.2/1.3 for all web visitors |
| **Default Cache Policy** | `Managed-CachingOptimized` (`658327ea-...`) | Gzip/Brotli edge caching for fast SPA asset delivery |
| **API Path Pattern** | `/api/*` | Matches all backend REST endpoints |
| **API Cache Policy** | `Managed-CachingDisabled` (`4135ea2d-...`) | Prevents caching of authenticated user data and dynamic responses |
| **API Request Policy** | `Managed-AllViewerExceptHostHeader` (`b689b0a8-...`) | Forwards `Authorization: Bearer <JWT>`, cookies, and query strings |
| **SPA Error Handling** | Nginx `try_files` route-aware fallback | Route fallback handled by Nginx; real `/api/*` error codes (400, 401, 403, 404, 500) preserved |
| **Price Class** | `PriceClass_200` | Covers India, Asia, Europe, Middle East, and North America at $0.00 |

---

## 3. Cost Analysis & Monthly Budget Compliance

| Resource | Billing Model | Monthly Spend | Budget Assessment |
|---|---|---|---|
| **Amazon CloudFront** | 1 TB data transfer + 10M requests free tier | **$0.00 / month** | Free Tier covered |
| **Amazon EC2 (`t3.small`)** | ~$0.0208/hour when running | ~$15/mo (24/7) or ~$0.20 for 10h demo | EC2 stopped when not in use |
| **Amazon EBS (30 GB GP3)** | $0.08 / GB-month | ~$2.40 / month | Within $5.00 budget |
| **Amazon S3 (`borrowbuy-dev-assets`)** | Standard storage (< 1 GB) | < $0.03 / month | Negligible |
| **AWS Lambda (`quote-calculator`)** | 1M free requests/month | **$0.00 / month** | Free Tier covered |
| **Amazon SQS (`booking-events`)** | 1M free requests/month | **$0.00 / month** | Free Tier covered |
| **CloudWatch Metrics & Logs** | 10 metrics + 5 GB logs free | **$0.00 / month** | Free Tier covered |
| **Application Load Balancer (ALB)** | **NOT USED** (avoided $16.20/mo) | **$0.00** | Excluded to protect budget |
| **NAT Gateway** | **NOT USED** (avoided $32.40/mo) | **$0.00** | Excluded to protect budget |
| **TOTAL ESTIMATED DEMO COST** | — | **~$2.50 – $3.50 / month** | **SAFELY BELOW $5.00 BUDGET** |

---

## 4. Automated CI/CD Pipeline Integration

Our production deployment pipeline in `.github/workflows/deploy.yml` guarantees zero manual server intervention:

```
Developer pushes to 'main'
         │
         ▼
[GitHub Actions CI] (Full monorepo linting, TypeScript compilation & 103 backend vitest tests)
         │  (Must pass 100% on identical commit SHA)
         ▼
[AWS OIDC Authentication] (Assumes 'BorrowBuy-GitHubActions-Deploy-Role' without long-lived keys)
         │
         ▼
[EC2 Running State Check] (Cost Safety: skips automatically if EC2 is stopped)
         │
         ▼
[AWS Systems Manager (SSM)] (Executes 'scripts/deploy-ec2.sh')
   ├── Git fetch & safe checkout of target SHA
   ├── Compile TypeScript backend (`backend/dist/server.js`)
   ├── Compile React frontend (`frontend/dist/`)
   ├── Copy bundle to Docker Nginx container (`borrowbuy-proxy`)
   ├── Restart `borrowbuy-backend.service` systemd daemon
   └── Execute `scripts/health-check.sh`
         │
         ▼
[Deployment Complete] (CloudFront automatically serves updated website)
```
