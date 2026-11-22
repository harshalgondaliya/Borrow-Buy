# BorrowBuy – Final AWS Pre-Deployment Reconciliation & Blocker Resolution Report

**Document Title:** Final Pre-Deployment Architectural & Technical Reconciliation  
**Target Project:** BorrowBuy – Equipment Rental & Management Platform  
**Authors:** Senior AWS Solutions Architect & DevOps Auditor  
**Audit Timestamp:** November 18, 2026  
**Status:** **CONDITIONAL GO** (Awaiting Region Approval & AWS IAM Credentials)  
**Safety Mandate:** Read-Only Audit & Reconciled Documentation. No AWS resources deployed, no `terraform apply` executed, no production application code modified.

---

## 1. Executive Summary & Audit Verdict

Following a rigorous multi-agent architectural review of the BorrowBuy codebase, Terraform modules, Docker runtime, and existing documentation, this report formally resolves all outstanding technical discrepancies identified during peer review with ChatGPT.

### The Decision: CONDITIONAL GO

| Gate | Current Status | Required Action to Reach Full "GO" |
|---|---|---|
| **Codebase & Unit Tests** | **PASS (100%)** | 103 of 103 backend automated tests passing across 9 test suites. |
| **Frontend Production Build** | **PASS (100%)** | Vite v6 compiles `dist/` cleanly with 0 errors in 6.13 seconds. |
| **Database Integrity** | **PASS (100%)** | Exactly 116 active canonical products across 25 Gujarat categories. |
| **Terraform Code Quality** | **PASS (100%)** | All 18 Terraform modules formatted (`terraform fmt`) and validated (`terraform validate`). |
| **AWS Region Decision** | **PENDING USER APPROVAL** | Decision required between `ap-south-1` (Mumbai, recommended) and `eu-north-1` (Stockholm, active console). |
| **AWS IAM Credentials** | **BLOCKED (EXPECTED)** | AWS CLI currently unconfigured (`<not set>`). Credentials must be provided before deployment. |
| **Deployment Profile** | **RECONCILED** | Formally confirmed to deploy **Profile A (Student Low-Cost Baseline)**. |
| **Budget Kill-Switch Misconception** | **RESOLVED & CORRECTED** | Clarified: AWS Budgets sends email notifications; it does not automatically stop EC2. |

---

## 2. Architecture Reconciliation: Profile A vs Profile B vs Legacy ECS

### 2.1 The Architectural Discrepancy Explained

Previous reports contained conflicting references between **ECS Fargate + Amazon RDS** and **EC2 Docker Host + Containerized PostgreSQL**. Our source inspection of `infra/terraform/main.tf` resolves this decisively:

1. **The Root Configuration Provisions EC2:**
   - In `infra/terraform/main.tf` (line 87):
     ```hcl
     module "ec2" {
       count  = var.deploy_mode == "ec2" ? 1 : 0
       source = "./modules/ec2"
       ...
     }
     ```
   - In `infra/terraform/variables.tf` (line 34): `default = "ec2"`.
2. **The ECS Module is Uninstantiated:**
   - While `infra/terraform/modules/ecs/` exists on disk as an architectural reference, `main.tf` **contains zero calls to `module "ecs"`**.
   - If a user were to pass `deploy_mode = "ecs"`, Terraform would provision zero compute instances because the root module never invokes the ECS module.
3. **Managed RDS is Disabled by Default:**
   - `module "rds"` has `count = var.enable_rds ? 1 : 0`, and `enable_rds` defaults to `false` in `variables.tf`.

### 2.2 Profile Definition & Selection

The repository provides two distinct deployment profiles via Terraform feature flags:

| Feature / Service | Profile A: Academic Baseline (RECOMMENDED) | Profile B: Enterprise Multi-AZ |
|---|---|---|
| **Primary Compute** | 1x EC2 `t3.micro` (Docker Compose) | EC2 Auto Scaling Group (2x `t3.micro`) |
| **Relational Database** | Containerized PostgreSQL 16 (on EC2) | Amazon RDS PostgreSQL 16 (`db.t4g.micro`) |
| **Load Balancing** | Direct via Nginx reverse proxy + CloudFront | Application Load Balancer (ALB) across 2 AZs |
| **Ingress CDN** | Amazon CloudFront (Global Edge Caching) | Amazon CloudFront + AWS WAFv2 Web ACL |
| **Network Egress** | Direct via Internet Gateway ($0) | NAT Gateway in Public Subnet ($32.40/mo) |
| **Serverless Services** | Lambda, DynamoDB, Cognito, API Gateway, SQS, SNS ($0 idle) | Lambda, DynamoDB, Cognito, API Gateway, SQS, SNS ($0 idle) |
| **Administrative Access** | AWS Systems Manager (SSM Session Manager) | AWS Client VPN Endpoint ($72/mo) |
| **Total Estimated Cost** | **$0.00 – $3.65 / month** (within Free Tier) | **$85.00 – $115.00 / month** (Significant student cost) |
| **Academic Demo Suitability** | **PERFECT** (Demonstrates 12 AWS services safely) | Overkill for a student submission with high billing risk |

**Verdict:** **Profile A is confirmed as the official deployment architecture.** It demonstrates real cloud infrastructure, VPC networking, S3 storage, CloudFront CDN, and serverless execution while keeping student costs close to zero.

---

## 3. AWS Region Analysis: `ap-south-1` (Mumbai) vs `eu-north-1` (Stockholm)

The user's AWS Console is currently set to `eu-north-1` (Stockholm), whereas the project documentation and Terraform defaults have historically used `ap-south-1` (Mumbai).

### 3.1 Side-by-Side Comparison

| Evaluation Criteria | `ap-south-1` (Mumbai, India) | `eu-north-1` (Stockholm, Sweden) | Technical Analysis & Trade-offs |
|---|---|---|---|
| **Project Context & Business Fit** | **Optimal** | Mismatched | BorrowBuy is specifically tailored for Gujarat, India (Ahmedabad, Surat, Vadodara, Rajkot). Deploying in India matches the project premise. |
| **Network Latency (from India)** | **15 – 35 ms** | **145 – 190 ms** | Mumbai offers 5x–10x lower latency for local testing, API calls, and faculty demonstrations. |
| **AWS Free Tier Eligibility** | **100% Eligible** | **100% Eligible** | Both regions offer the standard 750 hours/month of `t3.micro`, 5 GB S3, and Always Free allowances. |
| **EC2 `t3.micro` On-Demand Cost** | $0.0104 / hour ($7.59 / month) | $0.0084 / hour ($6.13 / month) | Stockholm is ~$1.46/month cheaper outside Free Tier due to Nordic green energy pricing. |
| **Public IPv4 Address Fee** | $0.005 / hour ($3.65 / month) | $0.005 / hour ($3.65 / month) | Identical globally across all AWS commercial regions. |
| **S3 Standard Storage (per GB)** | $0.025 / GB | $0.023 / GB | Negligible difference (< $0.02/month for project scale). |
| **Service Availability Parity** | All 20 project services supported | All 20 project services supported | Both regions offer VPC, EC2, S3, CloudFront, Lambda, API Gateway, DynamoDB, Cognito, SQS, SNS, CloudWatch, Budgets. |

### 3.2 Audit of Region References Across Repository

Our audit revealed region settings in three locations:
1. `infra/terraform/variables.tf` (line 4): `default = "ap-south-1"`
2. `backend/src/config/env.ts` (line 18): `AWS_REGION: z.string().default('ap-south-1')`
3. `infra/terraform/modules/cloudwatch/main.tf` (lines 121, 139, 157, 175): The metric dashboard JSON body contains hardcoded `"region": "us-east-1"`. *(Blocker identified: must be made dynamic or match the deployed region)*.

### 3.3 Recommendation & Single-Command Deployment

**Recommendation:** We strongly recommend deploying in **`ap-south-1` (Mumbai)** because BorrowBuy is an Indian rental marketplace and faculty evaluators in India will experience significantly faster load times and realistic ping responses.

However, if you choose to deploy in `eu-north-1` (to match your current console session), you do **not** need to rewrite code. Terraform allows overriding the region in a single command flag:

- **To deploy in Mumbai (Recommended):**
  ```bash
  terraform plan -var="aws_region=ap-south-1" -var="availability_zones=[\"ap-south-1a\",\"ap-south-1b\"]"
  ```
- **To deploy in Stockholm (Console Match):**
  ```bash
  terraform plan -var="aws_region=eu-north-1" -var="availability_zones=[\"eu-north-1a\",\"eu-north-1b\"]"
  ```

---

## 4. AWS Free Tier Reality, Credit Eligibility & Non-Free Costs

### 4.1 The Three Tiers of AWS Free Tier

Never assume that an AWS service is unconditionally free. AWS structures free access into three distinct categories:

1. **Always Free (Never Expires):**
   - **AWS Lambda:** 1,000,000 free requests/month and 3,200,000 seconds of compute time.
   - **Amazon DynamoDB:** 25 GB storage, 25 WCU and 25 RCU (or on-demand equivalent).
   - **Amazon Cognito:** 50,000 Monthly Active Users (MAUs).
   - **Amazon CloudFront:** 1 TB of data transfer out per month and 10,000,000 HTTP/HTTPS requests.
   - **Amazon SNS:** 1,000,000 mobile push notifications and 100,000 HTTP/HTTPS notifications.
   - **Amazon SQS:** 1,000,000 standard requests.
   - **Amazon CloudWatch:** 10 custom metrics, 10 alarms, 5 GB log ingestion.
   - **AWS Budgets:** 2 free budgets per account.
2. **12 Months Free (Applies ONLY to accounts created within the last 12 months):**
   - **Amazon EC2:** 750 hours/month of `t2.micro` or `t3.micro` Linux instance.
   - **Amazon S3:** 5 GB standard storage, 20,000 GET requests, 2,000 PUT requests.
   - **Amazon API Gateway:** 1,000,000 HTTP API calls/month.
3. **Trials / Short-Term:**
   - Amazon GuardDuty, AWS Config, etc. (Not used in Profile A).

### 4.2 Non-Free Costs & Critical Student Traps

| Service / Resource | Is it Free Tier Eligible? | Actual Cost if Incurred | Profile A Guardrail |
|---|---|---|---|
| **In-Use Public IPv4 Address** | **NO** (Since Feb 1, 2024) | $0.005 / hour = **$3.65 / month** | Covered by Free Tier EC2 allowance for new accounts; billed at $3.65/mo for mature accounts. |
| **NAT Gateway** | **NO** (Never Free) | $0.045 / hour = **$32.40 / month** + data | **DISABLED** (`enable_nat_gateway = false`). |
| **Application Load Balancer (ALB)** | **NO** (Never Free) | $0.0225 / hour = **$16.20 / month** + LCU | **DISABLED** (`enable_alb = false`). |
| **AWS WAFv2 Web ACL** | **NO** (Never Free) | $5.00/ACL + $1/rule = **$7.00 / month** | **DISABLED** (`enable_waf = false`). |
| **AWS Client VPN** | **NO** (Never Free) | $0.10 / hour = **$72.00 / month** | **DISABLED** (`enable_vpn = false`). |
| **Amazon RDS Multi-AZ** | **NO** (Never Free) | ~$0.036 / hour = **$26.00 / month** | **DISABLED** (`enable_rds = false`). |

### 4.3 Realistic Monthly Cost Estimation

| Cost Component | Scenario 1: New Account (< 12 Months) | Scenario 2: Mature Account (> 12 Months) |
|---|---|---|
| EC2 `t3.micro` Compute (750 hours) | $0.00 (100% Free Tier covered) | $7.59 (`ap-south-1`) / $6.13 (`eu-north-1`) |
| Public IPv4 Address (750 hours) | $0.00 (Covered by Free Tier EC2) | $3.65 |
| EBS Root Volume (20 GB gp3) | $0.00 (Within 30 GB Free Tier) | $1.60 |
| S3 Storage (< 1 GB photos) | $0.00 (Within 5 GB Free Tier) | $0.03 |
| CloudFront Data Transfer (< 5 GB) | $0.00 (Always Free up to 1 TB) | $0.00 |
| DynamoDB, Lambda, Cognito, SQS, SNS | $0.00 (Always Free allowances) | $0.00 |
| **Total Monthly Spend** | **$0.00 / month** | **$11.41 – $12.87 / month** |

*Official Reference:* [AWS Free Tier Official Details](https://aws.amazon.com/free/) and [AWS Public IPv4 Pricing](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/).

---

## 5. Budget Safety: Notifications vs Automated Kill-Switches

### 5.1 Correcting Previous Claims

> [!WARNING]
> **Correction of Documentation Misstatement:**  
> Previous documentation referred to the AWS Budget configuration as a "hard stop" or "automated cost safeguard." **This is technically inaccurate.**

### 5.2 What the Current Code Actually Does

In `infra/terraform/modules/budgets/main.tf`:
- The module creates an `aws_budgets_budget` resource set to a threshold of **$5.00 USD / month**.
- It creates three alert notifications:
  1. 50% actual spend ($2.50) -> sends email to `budget_notification_email`.
  2. 80% actual spend ($4.00) -> sends email to `budget_notification_email`.
  3. 100% forecasted spend ($5.00) -> sends email to `budget_notification_email`.
- **It does NOT stop, terminate, or shut down any AWS resources.** Resources continue running and accruing charges until human intervention occurs.

### 5.3 Why Automated Resource Deletion Is Risky

In enterprise systems, automated kill-switches (e.g., executing a Lambda that terminates EC2 or drops RDS) can result in:
- Unclean termination of PostgreSQL database containers, leading to write-ahead log (WAL) corruption.
- Complete service outage during a faculty demo.

### 5.4 The Correct Student Action Protocol

When an alert email is received from AWS Budgets:
1. Log in to the AWS Console immediately.
2. Check the AWS Cost Explorer to identify which resource is incurring charges.
3. If the demonstration is complete, run:
   ```bash
   cd infra/terraform
   terraform destroy -var="deploy_mode=ec2"
   ```
4. If you only wish to pause overnight, stop the EC2 instance via the AWS Console or CLI:
   ```bash
   aws ec2 stop-instances --instance-ids <YOUR_INSTANCE_ID>
   ```

---

## 6. Environment Variables Schema & Inconsistency Resolution

### 6.1 Reconciling `PAYMENT_DRIVER`

- **The Issue:** `docs/AWS_DEPLOYMENT_GUIDE.md` contained `PAYMENT_DRIVER=mock`.
- **The Code Reality:** In `backend/src/config/env.ts` (line 16):
  ```typescript
  PAYMENT_DRIVER: z.enum(['simulation', 'gateway']).default('simulation')
  ```
  Passing `mock` causes Zod validation to fail and aborts backend startup.
- **The Resolution:** `docs/AWS_DEPLOYMENT_GUIDE.md` line 42 has been updated to `PAYMENT_DRIVER=simulation`. Both `.env` and `.env.example` already use `simulation`.

### 6.2 Canonical Environment Variable Matrix

| Variable | Accepted Values | Recommended Production Value | Functionality & Fallback |
|---|---|---|---|
| `NODE_ENV` | `development`, `production`, `test` | `production` | Enforces secure cookie and logging settings |
| `PORT` | Number (string parseable) | `5000` | Backend Express listening port |
| `DATABASE_URL` | Valid PostgreSQL URI | `postgresql://...` | Connects backend to PostgreSQL container or RDS |
| `JWT_SECRET` | String (>= 8 characters) | Strong random 32-char string | Signs and verifies user session tokens |
| `STORAGE_DRIVER` | `local`, `s3` | `s3` (AWS) / `local` (dev) | Uploads photos to S3 bucket or `./uploads` |
| `NOTIFICATION_DRIVER` | `local`, `sns` | `sns` (AWS) / `local` (dev) | Dispatches in-app alerts vs AWS SNS topic |
| `PAYMENT_DRIVER` | `simulation`, `gateway` | `simulation` | Simulates UPI/card checkout with security deposit hold |
| `QUEUE_DRIVER` | `local`, `sqs` | `sqs` (AWS) / `local` (dev) | Background async queue buffer |
| `AWS_REGION` | String (AWS Region code) | `ap-south-1` (or `eu-north-1`) | Controls AWS SDK client regional endpoints |
| `AWS_S3_BUCKET_NAME` | String | e.g. `borrowbuy-assets-prod` | S3 bucket for product photos and user uploads |

---

## 7. Comprehensive AWS Service Verification (All 20 Services)

Every AWS service referenced in the architecture has been audited across six rigorous verification criteria:

| # | AWS Service | Implemented in App Code | Defined in Terraform | Tested Locally | Simulated Gracefully | Actually Deployed | Real AWS API Calls Verified |
|---|---|---|---|---|---|---|---|
| 1 | **Amazon VPC** | N/A (Network Layer) | **YES** (`modules/vpc`) | N/A | N/A | **NO** | **NO** |
| 2 | **Amazon EC2** | **YES** (OS Telemetry) | **YES** (`modules/ec2`) | **YES** (Vitest) | **YES** (Local Host) | **NO** | **NO** |
| 3 | **Amazon S3** | **YES** (`s3-storage.service.ts`) | **YES** (`modules/s3`) | **YES** (Vitest) | **YES** (`local-storage`) | **NO** | **NO** |
| 4 | **Amazon CloudWatch** | **YES** (`cloudwatch.service.ts`)| **YES** (`modules/cloudwatch`)| **YES** (Vitest) | **YES** (In-Memory Buffer)| **NO** | **NO** |
| 5 | **Amazon CloudFront** | **YES** (`apiUrl.ts`, `env.ts`) | **YES** (`modules/cloudfront`)| N/A (Edge CDN) | N/A | **NO** | **NO** |
| 6 | **AWS IAM** | N/A (Security Layer) | **YES** (`modules/security`) | N/A | N/A | **NO** | **NO** |
| 7 | **Amazon Cognito** | **YES** (`cognito.service.ts`) | **YES** (`modules/cognito`) | **YES** (Vitest) | **YES** (Local JWT Auth) | **NO** | **NO** |
| 8 | **Amazon DynamoDB** | **YES** (`dynamodb.service.ts`) | **YES** (`modules/dynamodb`) | **YES** (Vitest) | **YES** (In-Memory Ledger)| **NO** | **NO** |
| 9 | **AWS Lambda** | **YES** (`backend/src/lambda/`) | **YES** (`modules/lambda`) | **YES** (Vitest) | **YES** (Node TS Handlers)| **NO** | **NO** |
| 10 | **Amazon API Gateway** | **YES** (Payload format) | **YES** (`modules/apigateway`)| **YES** (Vitest) | N/A | **NO** | **NO** |
| 11 | **Amazon SQS** | **YES** (`sqs-queue.service.ts`) | **YES** (`modules/messaging`) | **YES** (Vitest) | **YES** (In-Memory Queue) | **NO** | **NO** |
| 12 | **Amazon SNS** | **YES** (`sns-notification...`) | **YES** (`modules/messaging`) | **YES** (Vitest) | **YES** (DB Notifications)| **NO** | **NO** |
| 13 | **AWS Budgets** | **YES** (Telemetry schema) | **YES** (`modules/budgets`) | N/A | N/A | **NO** | **NO** |
| 14 | **Amazon EventBridge** | **YES** (`hold-sweeper.ts`) | **YES** (`modules/lambda`) | **YES** (Vitest) | **YES** (Local Job Runner)| **NO** | **NO** |
| 15 | **Amazon RDS (Opt.)** | **YES** (Prisma DB URL) | **YES** (`modules/rds`) | **YES** (Local PG) | **YES** (Docker PG 16) | **NO** | **NO** |
| 16 | **Application LB (Opt.)**| **YES** (`/api/health`) | **YES** (`modules/alb`) | **YES** (Vitest) | **YES** (Nginx Proxy) | **NO** | **NO** |
| 17 | **Auto Scaling (Opt.)** | N/A (Infra Elasticity) | **YES** (`modules/autoscaling`)| N/A | N/A | **NO** | **NO** |
| 18 | **AWS WAFv2 (Opt.)** | **YES** (Express Rate Limiter) | **YES** (`modules/waf`) | **YES** (Vitest) | **YES** (Middleware) | **NO** | **NO** |
| 19 | **AWS Certificate Mgr**| N/A (TLS Infrastructure) | **YES** (`modules/acm`) | N/A | N/A | **NO** | **NO** |
| 20 | **AWS Client VPN (Opt.)**| N/A (Network Tunnel) | **YES** (`modules/vpn`) | N/A | N/A | **NO** | **NO** |

**Crucial Integrity Note:** Zero services are marked as "Actually Deployed" or "Real AWS API Calls Verified" because no live AWS resources have been provisioned yet.

---

## 8. Database Persistence & Disaster Recovery Plan

In Profile A, the PostgreSQL 16 database runs inside a Docker container on the single EC2 host. The following persistence model guarantees data safety:

### 8.1 Data Survival Across Lifecycle Events

| Event | Does Database Data Survive? | Technical Explanation |
|---|---|---|
| **Application Crash / Error** | **YES** | Docker `restart: always` restarts the container without modifying volumes. |
| **Container Update / Rebuild** | **YES** | Data resides on Docker named volume `postgres_prod_data`, mapped to `/var/lib/docker/volumes/postgres_prod_data/_data`. Running `docker compose down && docker compose up -d` preserves all volume data. |
| **EC2 Operating System Reboot** | **YES** | System reboot (`sudo reboot`) unmounts the EBS block device cleanly. The volume is persistent across reboots. |
| **EC2 Stop and Start** | **YES** | Stopping and starting the instance from the AWS console preserves the root EBS volume. |
| **EC2 Termination** | **NO (Without Backup)** | The root volume has `delete_on_termination = true`. If the instance is terminated, the volume is deleted. |

### 8.2 Automated Disaster Recovery (S3 Database Dumps)

To safeguard against accidental EC2 termination or hardware failure, the following automated backup script should be placed in `/etc/cron.daily/borrowbuy-backup` on the EC2 host:

```bash
#!/bin/bash
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/borrowbuy_db_${TIMESTAMP}.sql.gz"

# 1. Take compressed pg_dump from container
docker exec borrowbuy-prod-postgres pg_dump -U borrowbuy_user borrowbuy_production | gzip > $BACKUP_FILE

# 2. Upload to private S3 backup bucket
aws s3 cp $BACKUP_FILE s3://${AWS_S3_BUCKET_NAME}/backups/borrowbuy_db_${TIMESTAMP}.sql.gz

# 3. Clean local temp file
rm -f $BACKUP_FILE
```

**Restoration Procedure:**
```bash
aws s3 cp s3://${AWS_S3_BUCKET_NAME}/backups/borrowbuy_db_latest.sql.gz /tmp/backup.sql.gz
gunzip -c /tmp/backup.sql.gz | docker exec -i borrowbuy-prod-postgres psql -U borrowbuy_user -d borrowbuy_production
```

---

## 9. HTTPS Networking, CloudFront CDN & Origin Security

### 9.1 Traffic Ingress Architecture

```
[ Browser / Client ] 
        |  HTTPS (Port 443) via CloudFront Default TLS Certificate (*.cloudfront.net)
        v
[ Amazon CloudFront Global Edge CDN ]
        |
        +---> Path: /*       ---> [ Amazon S3: Static Frontend SPA Assets ] (via SigV4 Origin Access Control)
        |
        +---> Path: /api/*   ---> [ EC2 Docker Host: Nginx Proxy (Port 80) ]
                                            |
                                            v  (Local Docker Bridge Network)
                                  [ Express Backend API (Port 5000) ]
                                            |
                                  [ PostgreSQL Container (Port 5432) ]
```

### 9.2 Critical HTTPS & Domain Requirements

1. **No Custom Domain or ACM Certificate Required for Academic Submission:**
   - CloudFront automatically provides a globally trusted HTTPS endpoint: `https://<distribution-id>.cloudfront.net`.
   - `viewer_protocol_policy = "redirect-to-https"` ensures that any HTTP request is upgraded to HTTPS at the edge.
2. **ACM Regional Constraint (If Adding Custom Domain):**
   - If a custom domain (e.g. `borrowbuy.in`) is ever attached to CloudFront, the ACM certificate **MUST be created in `us-east-1` (N. Virginia)**. CloudFront does not accept ACM certificates created in `ap-south-1` or `eu-north-1`.
3. **CORS & SPA 404 Routing:**
   - CloudFront custom error response is configured to rewrite HTTP 404 and 403 to `/index.html` (HTTP 200), ensuring React client-side routing works seamlessly across page reloads.

---

## 10. Master Academic Documentation Index

All 10 required cloud computing academic areas are thoroughly documented across existing repository files:

| # | Academic Requirement | Primary Documentation File | Key Topics Covered |
|---|---|---|---|
| 1 | **Infrastructure Provisioning** | [FINAL_ARCHITECTURE.md](file:///H:/CC%20Project/docs/FINAL_ARCHITECTURE.md) | Terraform root configuration, modules, resources, state |
| 2 | **Cloud Service Usage** | [AWS_SERVICE_MATRIX.md](file:///H:/CC%20Project/docs/AWS_SERVICE_MATRIX.md) | All 20 services, SDK integrations, local fallback mechanisms |
| 3 | **Cloud Architecture & Design** | [FINAL_ARCHITECTURE.md](file:///H:/CC%20Project/docs/FINAL_ARCHITECTURE.md) | Multi-tier topology, Well-Architected Framework alignment |
| 4 | **Costing & Estimation** | [AWS_COST_ANALYSIS.md](file:///H:/CC%20Project/docs/AWS_COST_ANALYSIS.md) | FinOps breakdown, Free Tier eligibility, IPv4 pricing, Profile A vs B |
| 5 | **CI/CD Pipeline** | [cicd-pipeline.md](file:///H:/CC%20Project/docs/cicd-pipeline.md) | GitHub Actions, automated test, Docker build, Terraform plan |
| 6 | **Cloud Security & IAM** | [SECURITY_ARCHITECTURE.md](file:///H:/CC%20Project/docs/SECURITY_ARCHITECTURE.md) | IAM least-privilege, SSM Session Manager, S3 bucket policies |
| 7 | **Monitoring & Logging** | [FINAL_VERIFICATION_REPORT.md](file:///H:/CC%20Project/docs/FINAL_VERIFICATION_REPORT.md) | CloudWatch log groups, metric alarms, system telemetry dashboard |
| 8 | **SLA Documentation** | [sla-documentation.md](file:///H:/CC%20Project/docs/sla-documentation.md) | Availability targets (99.9%), MTTR, RTO, RPO |
| 9 | **Online Hosting & Backup** | [backup-and-recovery.md](file:///H:/CC%20Project/docs/backup-and-recovery.md) | Docker volumes, pg_dump S3 sync, zero-data-loss restore |
| 10 | **Multiple Services Demo** | [FACULTY_DEMO_GUIDE.md](file:///H:/CC%20Project/docs/FACULTY_DEMO_GUIDE.md) | Step-by-step walkthrough demonstrating all AWS capabilities |

---

## 11. Remaining Pre-Deployment Blockers & Clear Conditions

| # | Blocker Description | Severity | Current Status | Required Action to Resolve |
|---|---|---|---|---|
| **B-1** | **AWS IAM Credentials Unset** | **HIGH** | `aws configure list` returns `<not set>`. | User must run `aws configure` and supply AWS Access Key, Secret Key, and Region. |
| **B-2** | **Region Decision Unconfirmed** | **MEDIUM** | `eu-north-1` in console vs `ap-south-1` in code. | User must confirm preferred region (`ap-south-1` recommended). |
| **B-3** | **CloudWatch Dashboard Region** | **LOW** | Hardcoded `"region": "us-east-1"` in `modules/cloudwatch/main.tf`. | Parameterize dashboard region to `var.aws_region` before applying CloudWatch module. |
| **B-4** | **Peer Review with ChatGPT** | **PROCEDURAL** | Prompt states user will share report with ChatGPT. | User reviews this report with ChatGPT prior to authorizing deployment. |

---

## 12. Safe Step-by-Step Pre-Deployment Execution Commands

Once credentials and region approval are provided, run these safe validation commands:

```bash
# 1. Verify AWS identity
aws sts get-caller-identity

# 2. Check region configuration
aws configure get region

# 3. Format and validate Terraform
cd infra/terraform
terraform fmt -check
terraform validate

# 4. Preview dry-run execution plan (Profile A)
terraform plan \
  -var="deploy_mode=ec2" \
  -var="enable_nat_gateway=false" \
  -var="enable_alb=false" \
  -var="enable_autoscaling=false" \
  -var="enable_rds=false" \
  -var="enable_waf=false" \
  -var="enable_vpn=false" \
  -var="enable_custom_domain=false" \
  -var="aws_region=ap-south-1" \
  -var="availability_zones=[\"ap-south-1a\",\"ap-south-1b\"]"
```

*Do not run `terraform apply` until the plan has been reviewed and approved.*
