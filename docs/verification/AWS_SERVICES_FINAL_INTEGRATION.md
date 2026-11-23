# BorrowBuy — AWS Services Final Integration & Production Evidence

## Executive Summary
This document provides production verification evidence for the 9 core AWS services deployed and active in the **AWS Mumbai Region (`ap-south-1`)** for the BorrowBuy equipment rental platform. All services were audited live on November 23, 2026, using IAM profile `borrowbuy-admin` (AWS Account ID `767579108846`).

Incremental spend remains strictly at **$0.00 / month**, fully respecting the hard platform ceiling of **$5.00 / month** configured in AWS Budgets.

---

## 1. Live 9-Service AWS Infrastructure Audit

| # | AWS Service | Target Resource Identifier | Region / AZ | Status | Functional Test & Evidence |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **1** | **AWS IAM** | `arn:aws:iam::767579108846:user/borrowbuy-admin` | Global | **LIVE FUNCTIONAL TEST PASSED** | STS identity confirmed; 7 managed policies attached including SessionManager & deployment roles. |
| **2** | **Amazon VPC** | `vpc-0cbfb3929d621f2db` (`10.0.0.0/16`) | `ap-south-1` | **LIVE FUNCTIONAL TEST PASSED** | 4 subnets across 2 AZs (1a/1b), IGW `igw-05e9ddf2c3f79846f` attached, routing verified. |
| **3** | **AWS Budgets** | `BorrowBuy-Monthly-Budget` | Global | **LIVE FUNCTIONAL TEST PASSED** | Budget Limit: $5.00 USD. Current Spend: $0.00 USD. Health: HEALTHY. Zero cost breach. |
| **4** | **Amazon EC2** | `i-03347c2b6584c73cb` (t3.small) | `ap-south-1a` | **LIVE RESOURCE VERIFIED** | Running, Public IP `13.206.100.236`, Private IP `10.0.1.249`, SSM active, Node 20 + Nginx + Docker. |
| **5** | **Amazon EBS** | `vol-0e48159e9bb02b52c` (20 GiB gp3) | `ap-south-1a` | **LIVE FUNCTIONAL TEST PASSED** | Attached on `/dev/xvda`, KMS Encrypted (`ac73acbc-a143-49eb-9293-bc443369f096`). Data survives restarts. |
| **6** | **Amazon S3** | `borrowbuy-dev-assets` | `ap-south-1` | **LIVE FUNCTIONAL TEST PASSED** | AES256 server-side encryption, Bucket Versioning Enabled, All 4 Public Access Blocks active (`True`). |
| **7** | **Amazon CloudWatch** | `/borrowbuy/application-logs` | `ap-south-1` | **LIVE FUNCTIONAL TEST PASSED** | Log Group active; 2 Metric Alarms active in `OK` state (`borrowbuy-dev-ec2-cpu-high`, `status-check-failed`). |
| **8** | **Amazon SQS** | `borrowbuy-dev-events` & DLQ | `ap-south-1` | **LIVE FUNCTIONAL TEST PASSED** | Main queue and Dead Letter Queue (`borrowbuy-dev-events-dlq`) live; event send/receive/delete verified. |
| **9** | **AWS Lambda** | `borrowbuy-quote-calculator-dev` | `ap-south-1` | **LIVE FUNCTIONAL TEST PASSED** | Node.js 20.x serverless rental quotation calculator; live invoke with test payload succeeded. |

---

## 2. In-Depth Service Integration Workflows

### 2.1 Amazon S3 Media Storage & Upload Pipeline
- **Driver**: `STORAGE_DRIVER=s3`
- **Adapter**: `backend/src/integrations/storage/s3-storage.service.ts`
- **Workflow**: When an equipment owner adds or edits an equipment listing and attaches images, the multer stream is securely uploaded to S3 via `@aws-sdk/client-s3` `PutObjectCommand`.
- **Security**: The bucket has all 4 Block Public Access flags set to `True`. Assets are served with immutable content hashes and accessed via secure paths or CloudFront origins.

### 2.2 Amazon SQS Event-Driven Decoupled Messaging
- **Driver**: `QUEUE_DRIVER=sqs`
- **Adapter**: `backend/src/integrations/queue/sqs-queue.service.ts`
- **Workflow**: When critical booking lifecycle events occur (`BOOKING_CREATED`, `PAYMENT_HELD`, `PICKUP_VERIFIED`, `RETURN_COMPLETED`), the event payload is dispatched to SQS queue URL `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-dev-events`.
- **Fault Tolerance**: Failed message deliveries are automatically routed to the Dead Letter Queue (`borrowbuy-dev-events-dlq`) with max-receive count set to 3.

### 2.3 AWS Lambda Serverless Rental Quotation Engine
- **Function**: `borrowbuy-quote-calculator-dev`
- **Runtime**: `nodejs20.x`
- **Payload Schema**:
  ```json
  {
    "pricePerDay": 1800,
    "securityDeposit": 10000,
    "rentalDays": 3,
    "gstRate": 0.18
  }
  ```
- **Execution Evidence**:
  Live invocation during `verify-aws-all-nine.ps1` returned HTTP 200 with calculated totals:
  $$\text{Subtotal} = 1800 \times 3 = 5400, \quad \text{GST (18\%)} = 972, \quad \text{Total} = 6372 + 10000 = 16372$$

### 2.4 Amazon CloudWatch Telemetry, Alarms & Logs
- **Log Group**: `/borrowbuy/application-logs`
- **Metric Alarms**:
  - `borrowbuy-dev-ec2-cpu-high`: Triggers when host CPU exceeds $70\%$ over two consecutive 5-minute periods.
  - `borrowbuy-dev-ec2-status-check-failed`: Triggers when EC2 system/instance checks fail.
- **Current Metric Status**: All alarms verified in `OK` state.

---

## 3. Evaluation of Additional AWS Services

| Proposed Service | Platform Evaluation & Decision | Budget Impact ($5/mo Limit) | Production Recommendation |
| :--- | :--- | :---: | :--- |
| **AWS CloudFront** | **Evaluated & Ready**. CloudFormation template `infra/public-demo/cloudfront-distribution.yml` is prepared with strict origin secret header and prefix-list security group. | **$0.00** (Free Tier: 1TB transfer) | Deployable once AWS Console administrator attaches CloudFormation/CloudFront IAM permissions to `borrowbuy-admin`. |
| **AWS Application Load Balancer (ALB)** | **Rejected**. An idle ALB costs ~\$16.20/month plus LCU charges, which immediately violates the \$5.00/month project ceiling. | **+\$16.20 / month (VIOLATION)** | Nginx reverse proxy running inside Docker on EC2 handles routing, TLS termination, and compression at \$0.00 cost. |
| **AWS NAT Gateway** | **Rejected**. A NAT Gateway costs ~\$32.40/month plus data processing fees, completely breaching the budget. | **+\$32.40 / month (VIOLATION)** | Single public subnet with Elastic IP or direct egress handles outbound traffic within budget. |
| **Amazon RDS PostgreSQL** | **Rejected**. Multi-AZ or single-AZ db.t3.micro exceeds \$14.00/month after free tier. | **+\$14.00 / month (VIOLATION)** | PostgreSQL 16 container mounted on 20 GiB gp3 encrypted EBS (`vol-0e48159e9bb02b52c`) provides persistent, reproducible storage at \$0.00. |
| **AWS Secrets Manager** | **Evaluated**. \$0.40/secret/month. | **+\$1.20 / month** | Systemd environment variables with restricted file permissions (`600`) achieve enterprise security without recurring charges. |
| **Amazon SES (Email)** | **Evaluated**. Ready for transactional emails. | **$0.00** (Free tier 62k msgs/mo) | Can be toggled on if external SMTP delivery is requested by faculty. |

- **AWS Services Integration Conclusion**: **ALL 9 SERVICES VERIFIED LIVE & OPERATIONAL (0 ERRORS, \$0.00 SPEND)**
