# BORROWBUY — AWS NINE SERVICES DETAILED EVIDENCE REPORT

**Execution Timestamp:** 2026-11-23 21:09:34 IST  
**AWS Account ID:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai, India)  

---

## Service 1: AWS Identity and Access Management (IAM)
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **STS Caller Identity:**
  - Account: `767579108846`
  - Arn: `arn:aws:iam::767579108846:user/borrowbuy-admin`
  - UserId: `AIDA3FN2HWXXGC35LT7BL`
- **Attached Policies (7 Active):**
  1. `BorrowBuy-VPC-Deployment-Policy`
  2. `BorrowBuy-Services-Deployment-Policy`
  3. `BorrowBuy-SessionManager-Access`
  4. `IAMReadOnlyAccess`
  5. `IAMUserChangePassword`
  6. `AWSBudgetsReadOnlyAccess`
  7. `SignInLocalDevelopmentAccess`
- **Application Roles:**
  - `BorrowBuy-EC2-SSM-Role` (EC2 Instance Profile)
  - `BorrowBuy-GitHubActions-Deploy-Role` (OIDC Web Identity for CI/CD)
  - `BorrowBuy-Lambda-Execution-Role` (Serverless Execution)

---

## Service 2: Amazon Virtual Private Cloud (VPC)
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **VPC ID:** `vpc-0cbfb3929d621f2db` (`borrowbuy-dev-vpc`)
- **CIDR:** `10.0.0.0/16`
- **Internet Gateway:** `igw-05e9ddf2c3f79846f` attached
- **Subnets (4 Total across 2 AZs):**
  - `subnet-0ca0dd3ae36f6e293` (Public 1A, 10.0.1.0/24, contains EC2 host)
  - `subnet-0fa721f9011eae4d7` (Public 1B, 10.0.2.0/24)
  - `subnet-09c327f11994e9743` (Private 1A, 10.0.11.0/24)
  - `subnet-0cffe057630e66592` (Private 1B, 10.0.12.0/24)
- **Security Group:** `sg-033b02984ba31dc71` with 0 raw inbound rules.

---

## Service 3: AWS Budgets
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **Budget Name:** `BorrowBuy-Monthly-Budget`
- **Budget Limit:** `$5.00 USD`
- **Actual Spend:** `$0.00 USD`
- **Health:** `HEALTHY` (100% remaining)
- **Time Unit:** `MONTHLY`

---

## Service 4: Amazon Elastic Compute Cloud (EC2)
- **Status:** **LIVE RESOURCE VERIFIED**
- **Instance ID:** `i-03347c2b6584c73cb` (`borrowbuy-dev-ec2`)
- **State:** `running`
- **Type:** `t3.small` (2 vCPU, 2 GiB RAM)
- **Public IP:** `13.206.100.236` | **Private IP:** `10.0.1.249`
- **Public DNS:** `ec2-13-206-100-236.ap-south-1.compute.amazonaws.com`
- **SSM Agent:** Online and responsive

---

## Service 5: Amazon Elastic Block Store (EBS)
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **Volume ID:** `vol-0e48159e9bb02b52c`
- **Size:** 20 GiB gp3
- **State:** `in-use`
- **Encrypted:** `True` (AWS KMS Key: `arn:aws:kms:ap-south-1:767579108846:key/ac73acbc-a143-49eb-9293-bc443369f096`)
- **Attachment:** Attached to `i-03347c2b6584c73cb` on `/dev/xvda`
- **Database Persistence Proof:** 29 users, 116 products, 6 bookings persisted across container restarts

---

## Service 6: Amazon Simple Storage Service (S3)
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **Bucket Name:** `borrowbuy-dev-assets` in `ap-south-1`
- **Encryption:** Server-Side Encryption `AES256`
- **Versioning:** `Enabled`
- **Public Access Blocks:** All 4 blocks active (`BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets` = `true`)
- **Application Integration:** `STORAGE_DRIVER=s3` via `@aws-sdk/client-s3`

---

## Service 7: Amazon CloudWatch
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **Log Group:** `/borrowbuy/application-logs` (1 active log group)
- **Active Metric Alarms (2 Alarms in OK State):**
  - `borrowbuy-dev-ec2-cpu-high`: State `OK`, Metric `CPUUtilization`
  - `borrowbuy-dev-ec2-status-check-failed`: State `OK`, Metric `StatusCheckFailed`
- **Custom Metric Namespace:** `BorrowBuy/Application` (`ApiRequestCount`, `BookingCreated`)

---

## Service 8: Amazon Simple Queue Service (SQS)
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **Main Queue URL:** `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-dev-events`
- **Dead-Letter Queue URL:** `https://sqs.ap-south-1.amazonaws.com/767579108846/borrowbuy-dev-events-dlq`
- **Encryption:** `SSE-SQS`
- **Application Integration:** `QUEUE_DRIVER=sqs` via `@aws-sdk/client-sqs`

---

## Service 9: AWS Lambda
- **Status:** **LIVE FUNCTIONAL TEST PASSED**
- **Function Name:** `borrowbuy-quote-calculator-dev`
- **Runtime:** `nodejs20.x`
- **Execution Role:** `arn:aws:iam::767579108846:role/BorrowBuy-Lambda-Execution-Role`
- **Handler:** `index.handler`
- **Memory:** 128 MB | **Timeout:** 3 seconds
- **Live Invocation Result:** Evaluated quotation calculation returning HTTP 200 OK with 18% GST and itemized cost breakdown
