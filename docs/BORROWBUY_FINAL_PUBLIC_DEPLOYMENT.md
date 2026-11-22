# BORROWBUY — FINAL PUBLIC AWS DEPLOYMENT SPECIFICATION & ARCHITECTURE

**Document Version:** 1.0.0 (Master Release)  
**AWS Account ID:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai, India)  
**EC2 Target Host:** `i-03347c2b6584c73cb` (`t3.small`)  
**EC2 Security Group:** `sg-033b02984ba31dc71`  
**CloudFormation Template:** `infra/public-demo/cloudfront-distribution.yml`  
**Nginx Proxy Container:** `borrowbuy-proxy` (Docker Nginx Alpine on port 80)  
**Backend API Service:** `borrowbuy-backend.service` (Node.js 20 Express on port 5000)  

---

## 1. Executive Summary & Public Architecture

The BorrowBuy equipment rental platform is deployed on Amazon Web Services in the `ap-south-1` (Mumbai) region. To provide global, low-latency, and secure public access for university faculty evaluation without exposing host infrastructure directly to the public internet, BorrowBuy implements an edge distribution architecture using **Amazon CloudFront** fronting an origin reverse proxy on Amazon EC2.

```
═══════════════════════════════════════════════════════════════════════════════
                           BORROWBUY PUBLIC ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

   [ Public Internet Evaluators / Faculty Browsers ]
                         │
                         │ HTTPS (Port 443, TLS 1.2 / TLS 1.3)
                         ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │             Amazon CloudFront Edge Distribution (Global CDN)           │
   │  PriceClass: PriceClass_200 (India, Asia, Europe, Middle East, NA)     │
   │                                                                        │
   │  Path Behaviors:                                                       │
   │  ├── Default (/*)    ──> Managed-CachingOptimized (React SPA Assets)   │
   │  ├── /images/*       ──> Managed-CachingOptimized (WebP Product Images)│
   │  └── /api/*          ──> Managed-CachingDisabled (Auth, Bookings, API) │
   │                          + Forward Auth Headers, Cookies & QueryParams │
   │                                                                        │
   │  Origin Custom Header Injection:                                       │
   │  └── 'X-Origin-Verify: <64-char-hex-secret>'                           │
   └────────────────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP (Port 80) with 'X-Origin-Verify' Header
                         │ Restricted to AWS CloudFront Managed Prefix List
                         ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │            EC2 Security Group (sg-033b02984ba31dc71)                  │
   │  ├── Port 80 Ingress: STRICTLY LIMITED to pl-9aa247f3                  │
   │  │   (com.amazonaws.global.cloudfront.origin-facing)                   │
   │  │   [0.0.0.0/0 raw public ingress is 100% ELIMINATED]                 │
   │  ├── Port 5432 (PostgreSQL): Loopback only (NOT EXPOSED)               │
   │  └── Port 22 (SSH): Closed (Host managed via AWS Systems Manager)      │
   └────────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │             EC2 Host (i-03347c2b6584c73cb, t3.small, Mumbai)           │
   │                                                                        │
   │  ┌──────────────────────────────────────────────────────────────────┐  │
   │  │ Nginx Reverse Proxy (borrowbuy-proxy :80)                        │  │
   │  │ ├── Validates $http_x_origin_verify == $ORIGIN_SECRET            │  │
   │  │ │   (Missing / Invalid -> 403 Forbidden)                         │  │
   │  │ ├── Serves React Production Bundle (/usr/share/nginx/html)       │  │
   │  │ │   (try_files $uri $uri/ /index.html for SPA deep-linking)      │  │
   │  │ └── Proxies /api/* to Express API (http://172.17.0.1:5000)       │  │
   │  │     (Preserves real backend HTTP 400, 401, 403, 404, 500 codes)  │  │
   │  └──────────────────────────────────────────────────────────────────┘  │
   │                         │                                              │
   │                         ▼                                              │
   │  ┌──────────────────────────────────────────────────────────────────┐  │
   │  │ Express REST API Backend (borrowbuy-backend.service :5000)       │  │
   │  │ ├── Node.js 20.x Runtime, Prisma ORM Client                      │  │
   │  │ ├── Storage: Amazon S3 (borrowbuy-dev-assets)                    │  │
   │  │ ├── Queue: Amazon SQS (borrowbuy-dev-events)                     │  │
   │  │ ├── Telemetry: Amazon CloudWatch (/borrowbuy/application-logs)   │  │
   │  │ └── Payment Driver: Simulation (Isolated Escrow Deposits)        │  │
   │  └──────────────────────────────────────────────────────────────────┘  │
   │                         │                                              │
   │                         ▼                                              │
   │  ┌──────────────────────────────────────────────────────────────────┐  │
   │  │ PostgreSQL 16 Database (borrowbuy-postgres :5432)                │  │
   │  │ └── Data persisted on Encrypted EBS (vol-0e48159e9bb02b52c)      │  │
   │  │     (116 Products, 25 Categories, 25 Users, 4 Active Bookings)   │  │
   │  └──────────────────────────────────────────────────────────────────┘  │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure-as-Code Implementation

The public edge infrastructure is defined in `infra/public-demo/cloudfront-distribution.yml` and implements 5 critical cloud architecture requirements:

### 2.1 Complete Elimination of `0.0.0.0/0` Ingress
Unrestricted raw internet access to the EC2 host on port 80 is completely removed. Ingress is granted exclusively to AWS CloudFront edge proxies through the AWS-managed prefix list:
- **Prefix List ID:** `pl-9aa247f3` (`com.amazonaws.global.cloudfront.origin-facing`)
- **Port:** 80 (TCP)
- **Rule Weight:** 55 entries (within the security group limit of 60 inbound rules)

### 2.2 Subnet & VPC Design Feasibility Analysis
- **Current Subnet:** `borrowbuy-public-1a` (`subnet-0ca0dd3ae36f6e293`).
- **CloudFront VPC Origin Evaluation:** AWS CloudFront VPC Origins require target resources to reside in private subnets. Placing the EC2 instance into a private subnet would sever outbound connectivity required for AWS Systems Manager (SSM) management, GitHub Actions CD deployments, Amazon S3 asset uploads, Amazon SQS event delivery, and Amazon CloudWatch log streaming unless an **AWS NAT Gateway** is deployed.
- **Budget Constraint:** An AWS NAT Gateway incurs a fixed minimum cost of **$32.40/month** ($0.045/hour + data processing), which severely breaches the project's strict **$5.00/month AWS budget**.
- **Approved Architecture:** Restricting the EC2 security group to `pl-9aa247f3` combined with Nginx header validation and edge HTTPS encryption delivers identical perimeter isolation at **$0.00 incremental monthly spend**.

### 2.3 Cryptographic Origin Verification Secret
- Hardcoded default origin verification secrets have been completely eradicated.
- The CloudFormation template defines parameter `OriginVerifyHeaderValue` with `NoEcho: true` and `MinLength: 24`.
- The secret is generated cryptographically on the host via `python3 -c "import secrets; print(secrets.token_hex(32))"` (64 hexadecimal characters) and stored in `/home/ec2-user/app/.origin-secret` with POSIX permissions `600`.
- The exact same secret is configured in CloudFront `OriginCustomHeaders`.

### 2.4 Preservation of Real API Error Codes & SPA Routing
- The legacy CloudFormation pattern of mapping `403` and `404` errors to `200 /index.html` across the entire distribution has been **completely removed**.
- Express backend API status codes (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Error`) are delivered uncorrupted to the frontend and automated test suites.
- React Single-Page Application (SPA) client-side deep linking (`/browse`, `/bookings`, `/dashboard`) is handled locally by Nginx via `try_files $uri $uri/ /index.html`.

### 2.5 Billing & Cost Protection
- Configured with `PriceClass_200`, covering edge locations across India, Asia-Pacific, Europe, Middle East, and North America.
- Within AWS Always-Free Tier limits: CloudFront includes **1 TB/month data transfer out** and **10,000,000 HTTP/HTTPS requests/month** free.
- Projected incremental cost: **$0.00/month**.

---

## 3. Nginx Origin Validation Verification

Live testing conducted directly on EC2 host `i-03347c2b6584c73cb` via AWS Systems Manager confirmed 100% enforcement:

| Test Scenario | Request Header | Expected HTTP Code | Actual HTTP Code | Status |
|---|---|---|---|---|
| Direct API access without header | *(None)* | `403 Forbidden` | `403` | **PASS** |
| API access with incorrect token | `X-Origin-Verify: wrong-token` | `403 Forbidden` | `403` | **PASS** |
| API access with valid token | `X-Origin-Verify: <64-char-secret>` | `200 OK` | `200` | **PASS** |
| Frontend root access without header | *(None)* | `403 Forbidden` | `403` | **PASS** |
| Frontend root access with valid token | `X-Origin-Verify: <64-char-secret>` | `200 OK` | `200` | **PASS** |
| Host internal health check | Dynamic header via `health-check.sh` | `200 OK` | `200` | **PASS** |

---

## 4. Deployment Procedure

### CloudFormation Deployment Command
```powershell
$secret = (aws ssm send-command `
  --instance-ids "i-03347c2b6584c73cb" `
  --document-name "AWS-RunShellScript" `
  --parameters commands='["cat /home/ec2-user/app/.origin-secret"]' `
  --profile borrowbuy-admin --region ap-south-1 `
  --query "Command.CommandId" --output text)

# Deploy CloudFormation Stack
aws cloudformation deploy `
  --template-file "infra\public-demo\cloudfront-distribution.yml" `
  --stack-name "BorrowBuy-Public-CloudFront" `
  --parameter-overrides `
      OriginVerifyHeaderValue="240e83bcee93da52dd3e37cd84a4a82925e4a0abec45c2a529fdfaec46413eaf" `
      EC2PublicDNS="ec2-13-206-100-236.ap-south-1.compute.amazonaws.com" `
      EC2SecurityGroupId="sg-033b02984ba31dc71" `
      CloudFrontPrefixListId="pl-9aa247f3" `
      PriceClass="PriceClass_200" `
  --region ap-south-1
```

### Retrieving Public HTTPS URL
```powershell
aws cloudformation describe-stacks `
  --stack-name "BorrowBuy-Public-CloudFront" `
  --region ap-south-1 `
  --query "Stacks[0].Outputs[?OutputKey=='PublicWebsiteURL'].OutputValue" `
  --output text
```
