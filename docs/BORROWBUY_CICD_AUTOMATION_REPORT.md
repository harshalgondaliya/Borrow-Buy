# BorrowBuy — Master CI/CD Pipeline Architecture & Implementation Report

**Authoritative Project Report**  
**Repository:** [https://github.com/harshalgondaliya/Borrow-Buy](https://github.com/harshalgondaliya/Borrow-Buy)  
**Target AWS Region:** Mumbai (`ap-south-1`)  
**AWS Account ID:** `767579108846`  
**Target EC2 Instance:** `i-03347c2b6584c73cb`  
**Date:** November 22, 2026  

---

## 1. Executive Summary & Verification Classification

In accordance with strict DevOps and Cloud Security standards, all capabilities are classified into authoritative statuses:

| Subsystem / Capability | Verification Status | Operational Details |
|---|---|---|
| **Monorepo CI Pipeline** | `TESTED & VERIFIED` | Validates Prisma schema, runs 103 backend tests, 5 frontend tests, compiles backend `tsc`, builds frontend Vite bundle, checks Terraform syntax |
| **EC2 Deployment Automation** | `LIVE VERIFIED & TESTED` | `scripts/deploy-ec2.sh` successfully executed on EC2 via SSM: builds backend/frontend, updates Nginx, restarts `borrowbuy-backend.service`, verifies health |
| **Frontend Serving on AWS** | `LIVE VERIFIED` | React SPA built and deployed directly to `borrowbuy-proxy` (Nginx port 80) with `try_files` SPA fallback; served over SSM port forwarding tunnel |
| **PostgreSQL Persistence** | `LIVE VERIFIED` | 20 GiB KMS-encrypted EBS volume (`vol-0e48159e9bb02b52c`) mounts `/var/lib/borrowbuy_pgdata`; 100% data intact across deployments |
| **Health Check & Rollback** | `TESTED & VERIFIED` | `scripts/health-check.sh` and `scripts/rollback-ec2.sh` test backend health, DB connectivity, frontend HTML, systemd status, and Docker containers |
| **Cost Safety Protection** | `IMPLEMENTED` | Deployment workflow inspects EC2 state before execution; if `stopped`, halts gracefully with `PENDING` status to prevent unapproved charges ($5 budget ceiling) |
| **GitHub OIDC IAM Setup** | `CONSOLIDATED & READY` | CloudFormation template and AWS CLI scripts prepared; awaiting one-time IAM admin execution to create OIDC provider and `BorrowBuy-GitHubActions-Deploy-Role` |
| **End-to-End GitHub Push CD** | `BLOCKED (PENDING OIDC SETUP)` | Full GitHub Actions runner execution is blocked until the IAM administrator executes the consolidated OIDC provider and role creation |

---

## 2. Complete CI/CD Architecture Diagram

```
                                  +------------------------------------+
                                  |         Developer Machine          |
                                  |   (Feature Branch or UI Edit)      |
                                  +-----------------+------------------+
                                                    |
                                                    | git push origin main
                                                    v
                                  +------------------------------------+
                                  |          GitHub Repository         |
                                  |    harshalgondaliya/Borrow-Buy     |
                                  +-----------------+------------------+
                                                    |
                         +--------------------------+--------------------------+
                         |                                                     |
                         v                                                     v
        +----------------------------------+                  +----------------------------------+
        |   .github/workflows/ci.yml       |                  |   .github/workflows/deploy.yml   |
        |  Continuous Integration Job      |                  |  Continuous Deployment Job       |
        +----------------+-----------------+                  +----------------+-----------------+
                         |                                                     |
        +----------------+-----------------+                  +----------------+-----------------+
        | 1. Checkout repository           |                  | 1. Checkout repository           |
        | 2. Setup Node.js 22              |                  | 2. Request GitHub OIDC JWT       |
        | 3. Spin up PostgreSQL 16 Service |                  | 3. Assume IAM Role via STS:      |
        | 4. npm ci (monorepo install)     |                  |    BorrowBuy-GitHubActions-Deploy|
        | 5. Validate & push Prisma schema |                  | 4. Cost Safety EC2 State Check:  |
        | 6. Run 5 Frontend tests (Vitest) |                  |    - If stopped: exit PENDING    |
        | 7. Run 103 Backend tests (Vitest)|                  |    - If running: proceed         |
        | 8. Build Frontend (Vite)         |                  | 5. Dispatch AWS SSM SendCommand  |
        | 9. Build Backend (tsc)           |                  +----------------+-----------------+
        | 10. Verify production artifacts  |                                   |
        | 11. terraform validate (no apply)|                                   | Encrypted AWS
        +----------------+-----------------+                                   | Systems Manager
                         |                                                     | Document Call
                         v                                                     v
                  [ CI PASSED ]                               +----------------------------------+
                                                              |      AWS Mumbai (ap-south-1)     |
                                                              |  EC2 Instance: i-03347c2b6584c73cb|
                                                              +----------------+-----------------+
                                                                               |
                                                              +----------------+-----------------+
                                                              | scripts/deploy-ec2.sh            |
                                                              | - Save pre-deploy commit SHA     |
                                                              | - git pull origin main           |
                                                              | - npx prisma generate            |
                                                              | - npm run build (backend)        |
                                                              | - npm run build (frontend)       |
                                                              | - Copy dist to Nginx container   |
                                                              | - systemctl restart backend      |
                                                              | - Health probe (HTTP 200 OK)     |
                                                              | - Auto-rollback if probe fails   |
                                                              +----------------+-----------------+
                                                                               |
                                    +------------------------------------------+------------------------------------------+
                                    |                                                                                     |
                                    v                                                                                     v
                   +----------------------------------+                                                  +----------------------------------+
                   |     Nginx Reverse Proxy (80)     |                                                  |   Express Backend Service (5000) |
                   | - Serves React SPA at /          |                                                  | - Systemd native process         |
                   | - Reverse proxies /api/ -> :5000 |                                                  | - Connected to PostgreSQL on EBS |
                   +----------------------------------+                                                  +----------------------------------+
```

---

## 3. Deployment Topology & Application Structure

The application is deployed on Amazon Linux 2023 (`i-03347c2b6584c73cb`) using a hybrid host-and-container architecture designed for performance and reliability:

1. **Backend Host Process (`borrowbuy-backend.service`):**
   - Managed directly by `systemd`.
   - Node.js v18.20.8 native runtime on Amazon Linux 2023 with glibc and OpenSSL 3.0.
   - Listens on `127.0.0.1:5000`.
   - Connected to PostgreSQL container on `127.0.0.1:5432`.
   - AWS IAM Instance Profile: `BorrowBuy-EC2-SSM-Role` (grants access to S3, SQS, CloudWatch without storing AWS credentials on disk).

2. **Frontend Serving & Reverse Proxy (`borrowbuy-proxy`):**
   - Lightweight Nginx container running on host port 80.
   - Serves the production React SPA bundle from `/usr/share/nginx/html`.
   - Configured with `try_files $uri $uri/ /index.html;` for client-side React Router navigation.
   - Proxies `/api/` requests to `http://172.17.0.1:5000` with proxy headers.

3. **Database Container (`borrowbuy-postgres`):**
   - PostgreSQL 16 Alpine container on port 5432.
   - Persistent volume mounted on the dedicated 20 GiB KMS-encrypted EBS volume: `vol-0e48159e9bb02b52c` (`/dev/xvdf` -> `/var/lib/borrowbuy_pgdata`).
   - Populated with 116 curated products, 25 categories, and 25 test users.

---

## 4. Frontend-to-Cloud Integration Strategy

### Academic Demonstration Mode (Secure Private Cloud)
Security group `sg-033b02984ba31dc71` enforces **Zero Open Inbound Ports** (`"IpPermissions": []`). Direct unauthenticated internet traffic to port 80/5000 is blocked.

To access both the React UI and the REST API from a developer or evaluator browser:
```powershell
aws ssm start-session `
  --profile borrowbuy-admin `
  --region ap-south-1 `
  --target i-03347c2b6584c73cb `
  --document-name AWS-StartPortForwardingSession `
  --parameters '{"portNumber":["80"],"localPortNumber":["5000"]}'
```
Navigating to `http://localhost:5000`:
- Loads the live compiled React frontend served from Nginx on EC2 in Mumbai.
- Dispatches all API calls to `http://localhost:5000/api/*`, which Nginx routes internally to Express.
- No local Node development server is running; the evaluator experiences the exact production cloud build.

### Production Public CDN Mode (Future Evaluation)
For public internet availability, Amazon CloudFront + S3 static hosting can be provisioned in front of the application. However, to maintain the current $5/month AWS budget and zero-attack-surface security posture, the private SSM mode is the authoritative configuration.

---

## 5. Cost Safety & EC2 Lifecycle Protection

- **AWS Monthly Budget:** $5.00 USD (`BorrowBuy-Monthly-Budget`).
- **Current Billed Spend:** $0.00 USD.
- **Cost Protection Rule:**
  The CD pipeline explicitly checks the EC2 instance state before dispatching deployment commands.
  - If EC2 is `running`: Deployment proceeds immediately.
  - If EC2 is `stopped`: The workflow logs `⏸️ Deployment Pending (EC2 Stopped)` to the GitHub Step Summary and exits with code 0.
  - The pipeline **NEVER automatically starts a stopped EC2 instance**, preventing compute charges ($18.83/mo 24/7) from draining the promotional credits or exceeding the $5 budget.
  - When the evaluator starts the EC2 instance for a demonstration (`aws ec2 start-instances`), the application boots automatically with the latest verified code.

---

## 6. Rollback & Disaster Recovery Specification

If a deployment fails at any step (Prisma generation, TypeScript compilation, Vite build, or HTTP health checks):
1. The `rollback()` function in `scripts/deploy-ec2.sh` executes immediately.
2. Retrieves the pre-deployment commit SHA from `/home/ec2-user/app/.prev_commit`.
3. Runs `git checkout <PREV_COMMIT>`.
4. Rebuilds the working backend and frontend bundles.
5. Restores Nginx assets and restarts `borrowbuy-backend.service`.
6. Executes `scripts/health-check.sh` to confirm restoration.
7. Logs the rollback event to `/var/log/borrowbuy-deploy.log` and `/home/ec2-user/app/deployments.log`.
8. Exits with code 1 so GitHub Actions correctly reports a failed deployment.
