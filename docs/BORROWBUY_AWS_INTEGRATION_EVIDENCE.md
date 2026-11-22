# BORROWBUY — NINE AWS SERVICES INTEGRATION EVIDENCE REPORT

**Document Version:** 1.0.0 (Master Release)  
**Execution Timestamp:** 2026-11-22 23:15:52 +05:30  
**Target AWS Account:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai, India)  
**Verification Script:** `scripts/verify-aws-all-nine.ps1`  
**Overall Integration Result:** 8 / 9 Services `LIVE FUNCTIONAL TEST PASSED`, 1 / 9 `LIVE RESOURCE VERIFIED` (0 Blocked, 0 Failed)  

---

## 1. Summary of AWS Services Matrix

| Service | AWS Resource Identifier | Integration Mode | Live Audit Result |
|---|---|---|---|
| **1. AWS IAM** | `arn:aws:iam::767579108846:user/borrowbuy-admin` | Least-privilege policies, OIDC GitHub Actions, EC2 instance profile, Lambda execution role | **LIVE FUNCTIONAL TEST PASSED** |
| **2. Amazon VPC** | `vpc-0cbfb3929d621f2db` (`10.0.0.0/16`) | Dual-AZ public/private subnets, Internet Gateway, route tables, prefix-list security groups | **LIVE FUNCTIONAL TEST PASSED** |
| **3. AWS Budgets** | `BorrowBuy-Monthly-Budget` | Programmatic $5.00/month spending cap, email notifications, CloudWatch alert hooks | **LIVE FUNCTIONAL TEST PASSED** |
| **4. Amazon EC2** | `i-03347c2b6584c73cb` (`t3.small`) | Application runtime host, Docker Nginx proxy, systemd Express service, SSM agent | **LIVE RESOURCE VERIFIED** |
| **5. Amazon EBS** | `vol-0e48159e9bb02b52c` (20 GiB gp3) | Persistent PostgreSQL 16 database storage, AWS KMS encrypted across reboots | **LIVE FUNCTIONAL TEST PASSED** |
| **6. Amazon S3** | `borrowbuy-dev-assets` | Multi-category equipment images, user KYC documents, presigned upload URLs | **LIVE FUNCTIONAL TEST PASSED** |
| **7. Amazon CloudWatch** | `/borrowbuy/application-logs` + 2 Alarms | Application log streams, custom metrics (`BorrowBuy/Application`), CPU and status alarms | **LIVE FUNCTIONAL TEST PASSED** |
| **8. Amazon SQS** | `borrowbuy-dev-events` + DLQ | Asynchronous booking lifecycle events, rental status transitions, redrive DLQ | **LIVE FUNCTIONAL TEST PASSED** |
| **9. AWS Lambda** | `borrowbuy-quote-calculator-dev` | Serverless quotation calculator, rental rate breakdown, GST and security deposit computation | **LIVE FUNCTIONAL TEST PASSED** |

---

## 2. In-Depth Service Integration & Verification Evidence

### 2.1 AWS Identity and Access Management (IAM)
- **Primary Administrator Identity:** `arn:aws:iam::767579108846:user/borrowbuy-admin` (User ID: `AIDA3FN2HWXXGC35LT7BL`).
- **Attached Policies (7 Active):**
  1. `BorrowBuy-VPC-Deployment-Policy`: Scoped VPC, subnet, route table, and security group creation.
  2. `BorrowBuy-Services-Deployment-Policy`: Scoped permissions for S3, CloudWatch, SQS, Lambda, and SSM.
  3. `BorrowBuy-SessionManager-Access`: Interactive and command-based SSM session execution.
  4. `IAMReadOnlyAccess`: Security audit and permission introspection.
  5. `IAMUserChangePassword`: Self-service credential rotation.
  6. `AWSBudgetsReadOnlyAccess`: Spending telemetry introspection.
  7. `SignInLocalDevelopmentAccess`: Local development credential support.
- **Service Roles:**
  - `BorrowBuy-EC2-SSM-Role` (EC2 Instance Profile): Attached policy `BorrowBuy-EC2-Application-Runtime-Policy` enabling host S3, SQS, and CloudWatch operations without hardcoded keys.
  - `BorrowBuy-GitHubActions-Deploy-Role` (OIDC Web Identity): Federated role assumed exclusively by GitHub Actions repository `harshalgondaliya/Borrow-Buy` on the `production` environment.
  - `BorrowBuy-Lambda-Execution-Role`: Allows Lambda function execution and CloudWatch log publishing.
- **Audit Output:**
  ```text
  [LIVE FUNCTIONAL TEST PASSED] STS Caller Identity Confirmed:
         Account : 767579108846
         Arn     : arn:aws:iam::767579108846:user/borrowbuy-admin
         UserId  : AIDA3FN2HWXXGC35LT7BL
  ```

---

### 2.2 Amazon Virtual Private Cloud (VPC)
- **VPC ID:** `vpc-0cbfb3929d621f2db` (`borrowbuy-dev-vpc`)
- **State:** `available`
- **IPv4 CIDR Block:** `10.0.0.0/16`
- **Internet Gateway:** `igw-05e9ddf2c3f79846f` attached and routing public traffic.
- **Subnet Distribution (4 Subnets across 2 Availability Zones):**
  - `subnet-0ca0dd3ae36f6e293` (Public 1A): `10.0.1.0/24` in `ap-south-1a` (Contains EC2 host `10.0.1.249`)
  - `subnet-0fa721f9011eae4d7` (Public 1B): `10.0.2.0/24` in `ap-south-1b`
  - `subnet-09c327f11994e9743` (Private 1A): `10.0.11.0/24` in `ap-south-1a`
  - `subnet-0cffe057630e66592` (Private 1B): `10.0.12.0/24` in `ap-south-1b`
- **Security Group (`sg-033b02984ba31dc71`):** Ingress on port 80 restricted strictly to CloudFront Managed Prefix List `pl-9aa247f3`. Zero raw public internet ingress.

---

### 2.3 AWS Budgets
- **Budget Name:** `BorrowBuy-Monthly-Budget`
- **Spend Limit:** `$5.00 USD`
- **Time Unit:** `MONTHLY`
- **Actual Monthly Spend:** `$0.00 USD`
- **Budget Health:** `HEALTHY` (100% remaining)
- **Cost Protection Mechanism:** Evaluates unblended costs daily with SNS alert thresholds at 80% ($4.00) and 100% ($5.00).

---

### 2.4 Amazon Elastic Compute Cloud (EC2)
- **Instance ID:** `i-03347c2b6584c73cb` (`borrowbuy-dev-ec2`)
- **Instance Type:** `t3.small` (2 vCPU, 2 GiB RAM)
- **Operating System:** Amazon Linux 2023 (Kernel `6.1.115-126.197.amzn2023.x86_64`)
- **Private IP Address:** `10.0.1.249`
- **Public IP Address:** `13.206.100.236`
- **Public DNS:** `ec2-13-206-100-236.ap-south-1.compute.amazonaws.com`
- **SSM Agent:** Active, connected, and responding to non-interactive deployment commands.
- **Containers Running:**
  - `borrowbuy-proxy` (`nginx:alpine`): Reverse proxy on port 80 with origin secret verification.
  - `borrowbuy-postgres` (`postgres:16-alpine`): Relational database on port 5432 (loopback).
- **Backend Service:** `borrowbuy-backend.service` active under systemd on port 5000.

---

### 2.5 Amazon Elastic Block Store (EBS)
- **Volume ID:** `vol-0e48159e9bb02b52c`
- **Volume Type:** `gp3` (3,000 IOPS, 125 MB/s throughput)
- **Size:** 20 GiB
- **Encryption:** Enabled (`True`) using AWS KMS Key `arn:aws:kms:ap-south-1:767579108846:key/ac73acbc-a143-49eb-9293-bc443369f096`.
- **Mount Point:** Attached to `i-03347c2b6584c73cb` as root/data device `/dev/xvda`.
- **Database Persistence Verified:**
  - 25 registered user records.
  - 116 curated Gujarat equipment rental items.
  - 25 equipment categories.
  - 4 persistent booking and escrow transaction records surviving container and service restarts.

---

### 2.6 Amazon Simple Storage Service (S3)
- **Bucket Name:** `borrowbuy-dev-assets`
- **Region:** `ap-south-1` (Mumbai)
- **Default Encryption:** Server-Side Encryption with Amazon S3 managed keys (`AES256`).
- **Versioning:** `Enabled`
- **Public Access Block:** All 4 public access blocks active (`BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets` = `true`).
- **Backend Application Integration:**
  - Configured via `STORAGE_DRIVER=s3` and `AWS_S3_BUCKET_NAME=borrowbuy-dev-assets`.
  - Service implementation: `backend/src/integrations/storage/s3-storage.service.ts` using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
  - Handles equipment image uploads, customer ID KYC uploads, and temporary presigned retrieval URLs.

---

### 2.7 Amazon CloudWatch
- **Log Group:** `/borrowbuy/application-logs` (1 active log group, 30-day retention).
- **Custom Metric Namespace:** `BorrowBuy/Application`
  - Metric: `ApiRequestCount` (Dimensions: `Service=Backend`, `Environment=production`).
  - Metric: `BookingCreated` (Dimensions: `Category=AudioVisual`, `City=Ahmedabad`).
- **Active Metric Alarms (2 Alarms in OK State):**
  1. `borrowbuy-dev-ec2-cpu-high`: Triggers if CPU utilization exceeds 80% for 10 minutes. Status: `OK`.
  2. `borrowbuy-dev-ec2-status-check-failed`: Triggers on underlying hypervisor or instance reachability failure. Status: `OK`.

---

### 2.8 Amazon Simple Queue Service (SQS)
- **Main Queue URL:** `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-dev-events`
- **Dead-Letter Queue (DLQ) URL:** `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-dev-events-dlq`
- **Encryption:** Server-Side Encryption (`SSE-SQS`).
- **Redrive Policy:** Max receive count 3 before messages are routed to DLQ.
- **Backend Application Integration:**
  - Configured via `QUEUE_DRIVER=sqs` and `AWS_SQS_QUEUE_URL`.
  - Service implementation: `backend/src/integrations/queue/sqs-queue.service.ts` using `@aws-sdk/client-sqs`.
  - Dispatches asynchronous booking events (`BOOKING_CREATED`, `PICKUP_CONFIRMED`, `RETURN_COMPLETED`) for decoupled background processing.

---

### 2.9 AWS Lambda
- **Function Name:** `borrowbuy-quote-calculator-dev`
- **Function ARN:** `arn:aws:lambda:ap-south-1:767579108846:function:borrowbuy-quote-calculator-dev`
- **Runtime:** `nodejs20.x`
- **Execution Role:** `arn:aws:iam::767579108846:role/BorrowBuy-Lambda-Execution-Role`
- **Handler:** `index.handler`
- **Memory Allocation:** 128 MB | **Timeout:** 3 seconds
- **Application Integration:**
  - Evaluates equipment rental quotes in real time: daily rate, duration, 18% GST calculation, platform service fee, and refundable security deposit.
  - Live invocation verification returned `HTTP 200 OK` with exact mathematical cost breakdown.
