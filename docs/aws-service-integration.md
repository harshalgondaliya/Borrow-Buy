# BorrowBuy – AWS Service Integration & Verification Matrix

**Project**: BorrowBuy – Product Rental and Management Platform  
**Target Region**: `ap-south-1` (Asia Pacific – Mumbai)  
**Author**: Cloud Solutions Architect & Lead Full-Stack Engineer  
**Status**: Real Working Adapters & Verified Unit Tests  

---

## 1. AWS Service Integration Matrix

| # | AWS Service | BorrowBuy Feature | Technical Implementation | Code Adapter / Driver | Test Suite Status | Monthly Cost (`ap-south-1`) |
|:---:|---|---|---|---|:---:|:---:|
| 1 | **Amazon S3** | Product asset storage & user photo uploads | `@aws-sdk/client-s3` + pre-signed PUT URLs | `s3-storage.service.ts` | **PASS (100%)** | Free Tier (5 GB free) |
| 2 | **Amazon CloudFront** | Global CDN for frontend SPA & static images | CloudFront distribution with OAC & SPA rewrite | `infra/terraform/modules/cloudfront` | **VERIFIED** | Free Tier (1 TB transfer free) |
| 3 | **Amazon EC2** | Application host for Express API & PostgreSQL | Docker Compose containerized environment | `infra/terraform/modules/ec2` | **VERIFIED** | Free Tier (750 hrs free) |
| 4 | **Amazon ECR** | Container registry for versioned releases | Immutable Docker image tags pushed via CI/CD | `.github/workflows/deploy.yml` | **CONFIGURED** | Free Tier (500 MB free) |
| 5 | **Amazon SQS** | Asynchronous booking & rental event queue | `@aws-sdk/client-sqs` with 3-retry DLQ | `sqs-queue.service.ts` | **PASS (100%)** | Free Tier (1M requests free) |
| 6 | **Amazon SNS** | Push notifications for booking milestones | `@aws-sdk/client-sns` publish commands | `sns-notification.service.ts` | **PASS (100%)** | Free Tier (1M publishes free) |
| 7 | **Amazon EventBridge** | Scheduled hold sweeper & return reminders | Cron event rules dispatching worker triggers | `job-runner.ts` | **VERIFIED** | Free Tier (free triggers) |
| 8 | **AWS Lambda** | Asynchronous image metadata & event worker | Serverless function package | `infra/terraform/modules/lambda` | **CONFIGURED** | Free Tier (1M invocations free) |
| 9 | **Amazon CloudWatch** | Application metrics & error logging | `@aws-sdk/client-cloudwatch` + Log Groups | `cloudwatch.service.ts` | **PASS (100%)** | Free Tier (10 metrics, 5 GB free) |
| 10 | **AWS Systems Manager** | SSH-free secure terminal access & config | SSM Session Manager + Parameter Store | `modules/ec2` IAM profile | **VERIFIED** | Free Tier (Standard is free) |
| 11 | **AWS Budgets** | Hard cost monitoring & threshold alerting | `aws_budgets_budget` at $5.00 limit | `modules/budgets` | **PASS (Validated)** | Free Tier (First 2 budgets free) |
| 12 | **AWS IAM** | Least-privilege roles for EC2, CI/CD & S3 | IAM instance profiles & OIDC assume role | `modules/security` | **VERIFIED** | Free (Zero cost) |

---

## 2. Detailed Service-by-Service Specifications

### 1. Amazon S3 (Simple Storage Service)
- **Problem Solved**: Centralized, durable, encrypted object storage for equipment photographs uploaded by owners and post-rental inspection records.
- **Connection Method**: `@aws-sdk/client-s3` via `S3StorageService` class (`backend/src/integrations/storage/s3-storage.service.ts`).
- **Trigger**: Owner listing creation (`POST /api/products`) and direct browser upload requests (`GET /api/products/upload-url`).
- **IAM Role**: `borrowbuy-dev-ec2-host-role` with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`.
- **Cost**: \$0.00 within Free Tier (5 GB standard storage, 20,000 GET, 2,000 PUT requests).
- **Graceful Fallback**: When `STORAGE_DRIVER=local`, the application seamlessly falls back to `LocalStorageService` saving files to `./uploads`.

### 2. Amazon CloudFront
- **Problem Solved**: High-performance content delivery, edge SSL termination, and sub-100ms latency across India.
- **Connection Method**: Provisioned via Terraform module `modules/cloudfront`. Origin Access Control (OAC) protects the S3 origin.
- **Trigger**: Client web requests to the BorrowBuy frontend.
- **Cost**: Free Tier includes 1 TB data transfer out and 10,000,000 HTTP/HTTPS requests per month permanently.

### 3. Amazon EC2 & Docker
- **Problem Solved**: Reliable compute execution environment for the Express REST API and PostgreSQL relational database.
- **Connection Method**: Docker Compose orchestration (`docker-compose.prod.yml`) running behind an Nginx reverse proxy.
- **Trigger**: Continuous execution as systemd service on the EC2 host.
- **Cost**: Free Tier eligible (`t3.micro` / `t4g.small` 750 hours/month).

### 4. Amazon SQS (Simple Queue Service)
- **Problem Solved**: Decouples heavy or high-latency processing (email notifications, trust score recalculations) from user-facing HTTP request-response cycles.
- **Connection Method**: `@aws-sdk/client-sqs` via `SqsQueueService` (`backend/src/integrations/queue/sqs-queue.service.ts`).
- **Trigger**: Booking status transitions (`BOOKING_CREATED`, `BOOKING_CONFIRMED`, `RETURN_DUE_REMINDER`).
- **IAM Role**: `sqs:SendMessage`, `sqs:ReceiveMessage`, `sqs:DeleteMessage`.
- **Cost**: 1,000,000 requests per month permanently free under AWS Always-Free Tier.

### 5. Amazon SNS (Simple Notification Service)
- **Problem Solved**: Multi-subscriber alerting for time-sensitive equipment rental actions (e.g. owner approval needed, pickup QR scanned).
- **Connection Method**: `@aws-sdk/client-sns` via `SnsNotificationService` (`backend/src/integrations/notifications/sns-notification.service.ts`).
- **Trigger**: Completed simulated payments and state machine transitions.
- **IAM Role**: `sns:Publish` on topic `borrowbuy-dev-notifications`.
- **Cost**: 1,000,000 publishes permanently free per month.

### 6. Amazon CloudWatch
- **Problem Solved**: Centralized operational visibility, metric tracking, and anomaly detection.
- **Connection Method**: `@aws-sdk/client-cloudwatch` via `CloudWatchMonitoringService` (`backend/src/integrations/monitoring/cloudwatch.service.ts`).
- **Trigger**: Lifecycle events and API health probes.
- **Cost**: 10 custom metrics and 5 GB of log ingestion free forever under Always-Free Tier.

### 7. AWS Budgets
- **Problem Solved**: Prevents accidental student billing overruns.
- **Connection Method**: `aws_budgets_budget` resource in `modules/budgets`.
- **Trigger**: Daily cloud billing evaluation against \$5.00 USD monthly limit.
- **Cost**: 100% Free (AWS provides 2 free budgets per account).
