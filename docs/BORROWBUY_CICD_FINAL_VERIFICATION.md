# BORROWBUY — CI/CD AUTOMATION & GITHUB ACTIONS FINAL VERIFICATION

**Document Version:** 1.0.0 (Master Release)  
**GitHub Repository:** `harshalgondaliya/Borrow-Buy`  
**Production Branch:** `main`  
**AWS Account ID:** `767579108846`  
**Deployment Target:** Amazon EC2 (`i-03347c2b6584c73cb`) via AWS Systems Manager  
**Authentication Mechanism:** GitHub Actions OIDC (`sts:AssumeRoleWithWebIdentity`)  
**Deployment Script:** `scripts/deploy-ec2.sh`  
**Rollback Script:** `scripts/rollback-ec2.sh`  
**Health Check Script:** `scripts/health-check.sh`  

---

## 1. Automated Pipeline Architecture

BorrowBuy implements a production-grade, two-stage Continuous Integration and Continuous Deployment (CI/CD) architecture using GitHub Actions. The pipeline eliminates long-lived AWS access keys in favor of short-lived OIDC session tokens, enforces rigorous pre-deployment testing, and automates atomic deployments with health verification and rollback capabilities.

```
═══════════════════════════════════════════════════════════════════════════════
                      BORROWBUY CI/CD PIPELINE ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

   [ Developer / Contributor Push / PR to 'main' ]
                         │
                         ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                   STAGE 1: Continuous Integration (CI)                 │
   │                   Workflow: .github/workflows/ci.yml                   │
   │                                                                        │
   │  ├── Node.js 20.x Environment & Dependency Cache (npm ci)              │
   │  ├── Prisma Schema Validation & Client Generation                      │
   │  ├── In-Memory PostgreSQL Migration & Seeding (116 Products, 25 Users) │
   │  ├── Frontend Unit & Component Tests (Vitest)                          │
   │  ├── Backend REST API Integration Tests (103 Passing Tests)            │
   │  ├── React SPA Production Bundle Build (Vite)                          │
   │  └── Backend TypeScript Build (tsc)                                    │
   └────────────────────────────────────────────────────────────────────────┘
                         │
                         │ All Tests PASS (Exit Code 0)
                         ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                   STAGE 2: Continuous Deployment (CD)                  │
   │                   Workflow: .github/workflows/deploy.yml               │
   │                   Target Environment: 'production'                     │
   │                                                                        │
   │  ├── AWS OIDC Authentication:                                          │
   │  │   Role: arn:aws:iam::767579108846:role/BorrowBuy-GitHubActions-Role │
   │  │   Audience: sts.amazonaws.com                                       │
   │  ├── EC2 Host Pre-Flight Check (aws ec2 describe-instance-status)      │
   │  ├── Dispatch Deployment Command (aws ssm send-command)                │
   │  └── Poll Command Status to Completion (aws ssm get-command-invocation)│
   └────────────────────────────────────────────────────────────────────────┘
                         │
                         │ Invokes AWS Systems Manager Agent on EC2
                         ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                EC2 Deployment Engine (scripts/deploy-ec2.sh)           │
   │                                                                        │
   │  ├── Step 1: Enforce Git safe.directory for /home/ec2-user/app         │
   │  ├── Step 2: Validate Target Commit SHA (prevent command injection)    │
   │  ├── Step 3: Back up pre-deployment commit SHA for rollback            │
   │  ├── Step 4: Fetch origin/main & resolve untracked file collisions      │
   │  ├── Step 5: Regenerate Prisma client & compile TypeScript backend     │
   │  ├── Step 6: Compile React SPA & copy bundle to borrowbuy-proxy        │
   │  ├── Step 7: Apply strict Nginx origin verification if secret exists   │
   │  ├── Step 8: Restart borrowbuy-backend.service under systemd           │
   │  ├── Step 9: Execute scripts/health-check.sh (15 retries with backoff) │
   │  │   ├── Check 1: Nginx proxy health (http://127.0.0.1:80/api/health)  │
   │  │   ├── Check 2: Direct backend health (http://127.0.0.1:5000/health) │
   │  │   ├── Check 3: Products catalog DB query (/api/products?limit=1)    │
   │  │   ├── Check 4: Frontend index.html serving (React bundle present)   │
   │  │   └── Check 5: Systemd & Docker container running statuses          │
   │  └── Step 10: Automatic rollback via rollback-ec2.sh if checks fail    │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. GitHub Actions Workflow Specifications

### 2.1 Continuous Integration (`.github/workflows/ci.yml`)
- **Triggers:** Push to `main`, Pull Requests targeting `main`.
- **Jobs Executed:**
  1. `validate-and-test`: Validates the Prisma database schema, builds Prisma Client, runs in-memory migrations, seeds 116 realistic Gujarat products, executes frontend unit tests with Vitest, and runs all 103 backend REST API integration tests.
  2. `build-artifacts`: Validates the production build of the Vite React SPA bundle and compiles the Node.js TypeScript backend to `dist/server.js`.
  3. `validate-terraform`: Ensures Terraform infrastructure configurations conform to strict HCL standards.

### 2.2 Continuous Deployment (`.github/workflows/deploy.yml`)
- **Triggers:** Push to `main` (only after CI successfully completes).
- **Environment:** Protected `production` environment with branch protection rules.
- **OIDC Configuration:**
  ```yaml
  permissions:
    id-token: write
    contents: read
  steps:
    - name: Configure AWS Credentials via OIDC
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::767579108846:role/BorrowBuy-GitHubActions-Deploy-Role
        aws-region: ap-south-1
  ```
- **Deployment Execution:**
  Uses AWS Systems Manager document `AWS-RunShellScript` to non-interactively execute `/home/ec2-user/app/scripts/deploy-ec2.sh` with the target commit SHA.
- **Failure Handling:** Monitors execution status. If SSM reports `Failed`, the GitHub Actions workflow terminates with exit code 1, triggering notifications and leaving the prior working release active via automatic host rollback.

---

## 3. Host Deployment Hardening & Safety Features

### 3.1 Git Ownership & Safe Directory Configuration
Under non-interactive SSM execution (which runs as `root`), Git commands targeting `/home/ec2-user/app` can fail due to repository ownership boundaries (`fatal: detected dubious ownership in repository`). The script configures:
```bash
git config --system --add safe.directory /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app
```

### 3.2 Untracked File Collision Recovery
If local untracked files conflict with incoming Git checkout commits, `deploy-ec2.sh` automatically isolates conflicting files into a timestamped `/home/ec2-user/backups/deploy-conflicts-<timestamp>` directory rather than aborting the deployment.

### 3.3 Origin Verification Secret Persistence
The origin secret file `/home/ec2-user/app/.origin-secret` is registered in `.gitignore` and `chown`ed to `ec2-user:ec2-user` with `chmod 600`. It is never overwritten by Git checkouts or committed to source control, ensuring edge-to-origin security persists across deployments.

### 3.4 Automatic Rollback Mechanism (`scripts/rollback-ec2.sh`)
If post-deployment health verification fails after 15 retries (30 seconds):
1. The script immediately halts further operations.
2. Checks out the previous recorded commit SHA from `/home/ec2-user/app/.prev_commit`.
3. Recompiles backend and frontend assets from the known good commit.
4. Restores static assets to the Nginx container and reloads Nginx.
5. Restarts the systemd backend service.
6. Preserves the PostgreSQL database volume (`vol-0e48159e9bb02b52c`) completely intact without data loss.

---

## 4. Verification History & Pipeline Health

- **Latest Successful Production CI Run:** Run #14 (Commit `ad5f46f`) — 100% Passing.
- **Latest Successful Production CD Run:** Run #14 — Deployed to EC2 host `i-03347c2b6584c73cb` via AWS Systems Manager.
- **Host Deployment State:** Commit `ad5f46f1e491956e6538b89be311eda738901982` verified active on EC2.
- **Automated Health Check Status:** 5/5 Checks Passed (`PASS [200 OK]`).
