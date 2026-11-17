# BorrowBuy – AWS Cloud Cost Estimation & Free Tier Budget Strategy

**Target Region**: `ap-south-1` (Asia Pacific – Mumbai)  
**Author**: Senior Cloud Solutions Architect & FinOps Specialist  
**Project**: BorrowBuy – Product Rental and Management Platform  
**Target Audience**: Academic Review Board & Student Budget Management  
**Status**: Pre-Provisioning Cost Analysis & Approval Gate  

---

## 1. Executive Summary & Student Budget Constraints

BorrowBuy is an academic capstone project designed to demonstrate production-grade cloud architecture, serverless integrations, microservices, containerization, and security best practices. However, because this deployment is funded on an individual student budget, **zero-surprise cost governance is paramount**.

### Mandatory Cost Control Rules
1. **Never provision NAT Gateways without approval**: AWS charges \$0.045/hour plus \$0.045/GB data processing (~\$32.40/month per NAT Gateway). The recommended student architecture avoids NAT Gateways entirely by utilizing secure public subnets with strict security groups and SSM Session Manager.
2. **Never provision an always-on Application Load Balancer (ALB)** unless required: ALBs incur ~\$16.20/month base cost plus LCU usage. A lightweight Nginx reverse proxy running on the EC2 host handles SSL termination and API proxying at \$0 extra cost.
3. **Never enable Multi-AZ RDS**: Multi-AZ doubles instance and storage costs.
4. **Leverage Permanent Always-Free Tiers**: SQS (1M requests/mo free), SNS (1M publishes/mo free), CloudFront (1 TB transfer + 10M requests/mo free), Lambda (1M requests/mo free), and AWS Budgets (2 budgets free) ensure event-driven features cost \$0.00.

---

## 2. AWS Free Tier vs Paid Service Allowances (`ap-south-1`)

| AWS Service | Free Tier Allowance | Pricing After Free Tier (`ap-south-1`) | BorrowBuy Monthly Usage | Expected Cost |
|---|---|---|---|:---:|
| **EC2 (`t3.micro` / `t4g.small`)** | 750 hours/month (12-month free tier or free trial) | ~\$0.0104/hr (~\$7.50/mo) | 720 hrs (1 instance) | **\$0.00** (or ~\$7.50 if expired) |
| **EBS Storage (gp3/gp2)** | 30 GB/month free | \$0.088 per GB-month | 20 GB | **\$0.00** |
| **Public IPv4 Address** | 750 hrs/month for micro instances | \$0.005/hr (~\$3.60/mo) | 720 hrs | **\$0.00 – \$3.60** |
| **Amazon S3 (Uploads & Frontend)** | 5 GB storage, 20K GET, 2K PUT free | \$0.023/GB, \$0.005/1K PUT, \$0.0004/1K GET | 1 GB storage, 5K GET, 500 PUT | **\$0.00** |
| **Amazon CloudFront** | **1 TB Data Transfer Out + 10M requests/mo (Always Free)** | \$0.085/GB, \$0.0075/10K requests | 5 GB transfer, 25K requests | **\$0.00 (Free Forever)** |
| **Amazon SQS** | **1,000,000 requests/mo (Always Free)** | \$0.40 per 1M requests | ~5,000 requests/mo | **\$0.00 (Free Forever)** |
| **Amazon SNS** | **1,000,000 publishes + 100K HTTP pushes (Always Free)** | \$0.50 per 1M publishes | ~2,000 publishes/mo | **\$0.00 (Free Forever)** |
| **AWS Lambda** | **1,000,000 requests + 3.2M sec compute (Always Free)** | \$0.20 per 1M requests | ~5,000 executions/mo | **\$0.00 (Free Forever)** |
| **Amazon EventBridge** | **Default event bus events are free** | \$1.00 per 1M custom events | Cron triggers (free) | **\$0.00 (Free Forever)** |
| **Amazon CloudWatch** | **10 custom metrics, 5 GB log ingestion (Always Free)** | \$0.30/metric, \$0.50/GB log ingestion | 3 metrics, 200 MB logs | **\$0.00 (Free Forever)** |
| **AWS Budgets** | **First 2 budgets are free forever** | \$0.02/day per additional budget | 1 budget with 3 alerts | **\$0.00 (Free Forever)** |
| **Amazon ECR** | 500 MB storage/month free | \$0.10 per GB-month | 350 MB compressed image | **\$0.00** |
| **NAT Gateway** | *No Free Tier* | \$0.045/hr + \$0.045/GB (~**\$32.40/mo**) | **Omitted / Disabled** | **\$0.00 (Saved \$32.40)** |
| **Application Load Balancer** | *No Free Tier* | \$0.0225/hr + \$0.008/LCU-hr (~**\$16.20/mo**) | **Omitted / Disabled** | **\$0.00 (Saved \$16.20)** |

---

## 3. Architecture Comparison & Cost Scenarios

### Scenario A: Student Zero-Surprise Baseline (RECOMMENDED)
* **Frontend**: S3 Static Website Hosting + CloudFront CDN (HTTPS distribution with automatic SSL certificate).
* **Backend**: Amazon EC2 `t3.micro` (or `t4g.small`) in a public subnet running Docker Compose:
  - Container 1: Express REST API (`borrowbuy-backend`).
  - Container 2: PostgreSQL 16 database with persistent EBS volume mount.
  - Container 3: Nginx reverse proxy routing `/api` traffic and serving SSL.
* **Storage**: Amazon S3 private bucket for user uploads with backend pre-signed URLs.
* **Cloud Services**: SQS, SNS, EventBridge, Lambda, CloudWatch, AWS Budgets.
* **Cost Estimate**:
  - Within AWS Free Tier: **\$0.00 / month**
  - If 12-month EC2 Free Tier has expired: **\$7.50 – \$11.10 / month** (EC2 + Public IPv4)

---

### Scenario B: Expanded Academic Demonstration (with Managed RDS Single-AZ)
* Replaces the Docker PostgreSQL container with a managed Amazon RDS PostgreSQL instance (`db.t4g.micro`, Single-AZ, 20 GB gp3 storage).
* **Cost Estimate**:
  - Within AWS 12-Month RDS Free Tier (750 hrs `db.t3.micro`/`db.t4g.micro` free): **\$0.00 / month**
  - If RDS Free Tier has expired: **\$15.50 – \$18.00 / month** additional cost.

---

### Scenario C: Full Enterprise Production (NOT RECOMMENDED for Student Budget)
* Multi-AZ RDS (`db.t4g.small`): \$58.00/mo
* 2x NAT Gateways across 2 Availability Zones: \$64.80/mo
* 1x Application Load Balancer: \$16.20/mo
* ECS Fargate (2 tasks 0.5 vCPU, 1 GB RAM): \$22.00/mo
* Total Estimated Cost: **\$161.00 / month** (Unsuitable for student budget!)

---

## 4. AWS Budgets Configuration & Alert Matrix

To guarantee that costs remain strictly bounded, BorrowBuy enforces an automated AWS Budget with three escalation triggers:

```
[Total Monthly Budget Cap: $5.00 USD]
  ├── Trigger 1: 50% ($2.50 USD Actual Spend)  -> Warning Email Alert to Student
  ├── Trigger 2: 80% ($4.00 USD Actual Spend)  -> High-Priority Alert to Student
  └── Trigger 3: 100% ($5.00 USD Forecasted)  -> Immediate Teardown Recommendation
```

> [!IMPORTANT]
> AWS Budgets provides alerting but does not automatically terminate running EC2 instances or drop databases. If an alert is received, follow the emergency teardown procedure in [aws-cleanup-guide.md](file:///H:/CC%20Project/docs/aws-cleanup-guide.md).

---

## 5. Cost Optimization & Idle Resource Teardown

If the project demonstration is complete or paused between university evaluations:
1. **Stop EC2 Instance**: When stopped, compute charges cease immediately. Only the 20 GB EBS volume (~\$1.76/month) and S3 storage (~\$0.02/month) accrue minimal costs.
2. **CloudFront & S3**: Incur \$0.00 when idle.
3. **Complete Teardown**: Run `terraform destroy` when the academic semester concludes to return monthly spend to exactly \$0.00.
