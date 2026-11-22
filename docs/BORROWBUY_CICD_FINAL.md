# BorrowBuy — CI/CD Automation Pipeline, OIDC Security & SSM Deployment Architecture

**Repository:** `harshalgondaliya/Borrow-Buy`  
**CI/CD Orchestrator:** GitHub Actions  
**Cloud Ingress:** AWS Systems Manager (SSM) Run Command (Zero Open Inbound SSH Port 22)  
**Authentication Standard:** OpenID Connect (OIDC) Federated IAM Trust Relationship  
**Target Host:** Amazon EC2 `i-03347c2b6584c73cb` (AWS Mumbai `ap-south-1`)  
**Deployment Branch:** `main` (Protected Production Environment)

---

## 1. CI/CD Architecture & Pipeline Flow

The BorrowBuy delivery pipeline implements continuous integration and deployment with automated testing gates:

```
[Developer Push to 'main']
         │
         ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Stage 1: GitHub Actions Reusable CI Workflow (ci.yml)   │
 │   ├── Checkout Exact Commit SHA                         │
 │   ├── Setup Node.js 20 & Cache npm Dependencies         │
 │   ├── Spin up Isolated PostgreSQL 16 Service Container  │
 │   ├── Run Database Migrations (prisma migrate deploy)    │
 │   ├── Execute Deterministic Seed (116 products)         │
 │   ├── Frontend Test Suite (Vitest) ── 5/5 Passing       │
 │   ├── Frontend Production Build (Vite) ── 0 Errors      │
 │   └── Backend Test Suite (Vitest) ── 103/103 Passing    │
 └─────────────────────────────────────────────────────────┘
         │
         │  (CI Job Passes Successfully: exit 0)
         ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Stage 2: GitHub Actions CD Deployment Job (deploy.yml)  │
 │   ├── Environment Gate: 'production' (Required Approvals)│
 │   ├── GitHub OIDC Exchange with AWS STS                 │
 │   │     └── AssumeRoleWithWebIdentity                   │
 │   │         (BorrowBuy-GitHub-Deploy-Role)              │
 │   └── Dispatch AWS SSM Run Command to EC2               │
 └─────────────────────────────────────────────────────────┘
         │
         ▼
 ┌─────────────────────────────────────────────────────────┐
 │ Stage 3: AWS Systems Manager on EC2 (deploy-ec2.sh)     │
 │   ├── Execute as Trusted Linux User: ec2-user           │
 │   ├── Git Safe Directory Check (/home/ec2-user/app)     │
 │   ├── Git Fetch & Fast-Forward Checkout to Commit SHA   │
 │   ├── Workspace Dependency Install (npm ci)             │
 │   ├── Database Schema Sync (prisma db push)             │
 │   ├── Build Frontend Static Assets (npm run build)      │
 │   ├── Copy Dist Assets to Nginx Web Root (/var/www/html)│
 │   ├── Restart Backend Systemd Service (borrowbuy-backend│
 │   └── 5-Point Health Check (health-check.sh)            │
 └─────────────────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────┐
    ▼                             ▼
[SUCCESS]                      [FAILURE]
Deployment Verified Live       Automatic Rollback
Notification Logged            (rollback-ec2.sh)
```

---

## 2. GitHub OIDC Security Implementation

To adhere to enterprise cloud security standards, long-lived AWS Access Keys (`AKIA...`) are completely eliminated from GitHub repository secrets.

### OIDC Trust Configuration
- **AWS IAM Role:** `BorrowBuy-GitHub-Deploy-Role`
- **Federated Identity Provider:** `arn:aws:iam::767579108846:oidc-provider/token.actions.githubusercontent.com`
- **Strict StringEquals Condition:**
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::767579108846:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:harshalgondaliya/Borrow-Buy:environment:production"
          }
        }
      }
    ]
  }
  ```

---

## 3. Deployment Script Architecture (`scripts/deploy-ec2.sh`)

The deployment script incorporates defensive execution practices:
1. **User Identity Isolation:** Executes Git operations explicitly as `ec2-user` rather than root SSM agent (`ssm-user`), eliminating Git's "dubious ownership" warning.
2. **Safe Directory Declarations:** Ensures `git config --global --add safe.directory /home/ec2-user/app`.
3. **Clean Checkout:** Untracked temporary artifacts are cleaned via `git reset --hard origin/main` to avoid checkout blockages.
4. **Zero-Downtime Service Restart:** Restarts `systemctl restart borrowbuy-backend` with systemd unit isolation.
5. **Atomic Verification:** Executes `scripts/health-check.sh` verifying:
   - Systemd unit state (`active (running)`)
   - Backend API local probe (`http://localhost:5000/api/health` -> HTTP 200)
   - PostgreSQL database connectivity (latency < 5ms)
   - Product catalog retrieval (116 products)
   - Nginx HTTP static asset serving (HTTP 200)

---

## 4. Rollback Mechanism (`scripts/rollback-ec2.sh`)

If the 5-point health check fails at any stage during automated deployment:
1. The deployment script catches the non-zero exit code.
2. `scripts/rollback-ec2.sh` is invoked immediately.
3. The repository is reset to `HEAD@{1}` (the previously active stable commit).
4. Dependencies and frontend builds are re-linked to the stable state.
5. Systemd service is restarted and verified.
6. A CloudWatch deployment failure event is triggered for developer notification.
