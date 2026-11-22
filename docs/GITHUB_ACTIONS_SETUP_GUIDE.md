# BorrowBuy — GitHub Actions OIDC & Secrets Setup Guide

**Target Repository:** [https://github.com/harshalgondaliya/Borrow-Buy](https://github.com/harshalgondaliya/Borrow-Buy)  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Target AWS Account:** `767579108846`  
**Target Role Name:** `BorrowBuy-GitHubActions-Deploy-Role`  

---

## 1. Consolidated IAM Administrator Action (One-Time Setup)

The GitHub Actions CD pipeline uses **OpenID Connect (OIDC)** authentication with AWS STS. This eliminates the need to store long-lived AWS Access Keys in GitHub.

Because creating an IAM OIDC Provider and IAM Role requires IAM administrator permissions, run one of the following commands using an AWS Administrator profile (or root):

### Option A: Using AWS CloudFormation (Recommended)
Run in PowerShell:
```powershell
aws cloudformation deploy `
  --template-file "H:\CC Project\infra\github-oidc-cloudformation.yml" `
  --stack-name "BorrowBuy-GitHubActions-OIDC" `
  --capabilities CAPABILITY_NAMED_IAM `
  --region ap-south-1
```

### Option B: Using the PowerShell Setup Script
Run in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File "H:\CC Project\infra\setup-github-oidc.ps1"
```

### Option C: Using AWS Management Console
1. Navigate to **IAM > Identity providers > Add provider**.
2. Select **OpenID Connect**.
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click **Get thumbprint**, then **Add provider**.
6. Navigate to **IAM > Roles > Create role**.
7. Select **Web identity**, choose `token.actions.githubusercontent.com`, and Audience `sts.amazonaws.com`.
8. Attach or create the managed policy `BorrowBuy-GitHubActions-Deploy-Policy` defined in `H:\CC Project\infra\setup-github-oidc.ps1`.
9. Name the role `BorrowBuy-GitHubActions-Deploy-Role`.

---

## 2. GitHub Repository Configuration

Once the IAM role is created, configure the repository secrets in GitHub:

1. Navigate to your GitHub repository:  
   `https://github.com/harshalgondaliya/Borrow-Buy/settings/secrets/actions`
2. Add the following Repository Secrets:

| Secret Name | Value | Purpose |
|---|---|---|
| `AWS_GITHUB_ACTIONS_ROLE_ARN` | `arn:aws:iam::767579108846:role/BorrowBuy-GitHubActions-Deploy-Role` | Allows GitHub Actions to assume the deployment role via OIDC |
| `EC2_INSTANCE_ID` | `i-03347c2b6584c73cb` | Target EC2 instance for SSM deployment |
| `AWS_REGION` | `ap-south-1` | AWS Mumbai deployment region |

---

## 3. GitHub Environment Protection (Optional but Recommended)

1. Navigate to **Settings > Environments > New environment**.
2. Name the environment `production`.
3. (Optional) Configure Required Reviewers to require approval before deploying to EC2.

---

## 4. Triggering the Workflows

### Continuous Integration (CI):
Triggered automatically on any pull request or push to `main`:
- Runs all 108 tests (backend + frontend).
- Validates Prisma schema.
- Verifies production builds.
- Checks Terraform syntax without applying.

### Continuous Deployment (CD):
Triggered automatically on any push to `main` modifying application code (`backend/**`, `frontend/**`, `database/**`, `scripts/**`):
- Checks EC2 instance state (Cost Safety check).
- Dispatches deployment via AWS Systems Manager.
- Automatically compiles and deploys frontend to Nginx.
- Restarts `borrowbuy-backend.service`.
- Verifies post-deployment health.
- Rolls back automatically if health check fails.

### Manual Workflow Dispatch (Rollback / Health Check):
1. Navigate to **Actions > BorrowBuy Continuous Deployment (CD)**.
2. Click **Run workflow**.
3. Choose Action: `deploy`, `rollback`, or `health-check`.
4. Click **Run workflow**.
