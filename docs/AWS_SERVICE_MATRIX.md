# BorrowBuy – 20 AWS Cloud Services Master Verification Matrix

**Project:** BorrowBuy – Equipment Rental & Escrow Platform  
**Target AWS Region:** `ap-south-1` (Asia Pacific – Mumbai)  
**Evaluation Rubric:** Enterprise Cloud Computing Architecture (16 Core + 4 Extended Services)  
**Last Verified:** November 18, 2026

---

| # | AWS Service | Category | Architectural Role in BorrowBuy | Implementation Source File | Status in Repo | Verification Method | Profile A Idle Cost / Mo |
|:---:|---|---|---|---|:---:|---|:---:|
| **1** | **Amazon S3** | Storage | Static SPA hosting (`dist/`), product photos, pre-signed upload URLs | `backend/src/integrations/storage/s3-storage.service.ts`<br>`infra/terraform/modules/s3` | **IMPLEMENTED** | Vitest S3 suite (`tests/aws-services.test.ts`), pre-signed URL test | **$0.00** (Free Tier 5GB) |
| **2** | **Amazon CloudFront** | CDN & Edge | Global edge CDN, TLS termination, S3 Origin Access Control (OAC), `/api/*` bypass | `infra/terraform/modules/cloudfront/main.tf`<br>`frontend/src/utils/apiUrl.ts` | **CONFIGURED** | Terraform validate, CloudFront distribution domain output | **$0.00** (Always Free 1TB) |
| **3** | **AWS Lambda** | Serverless | Rental quote calculator, 15m hold sweeper, async event processor | `backend/src/lambda/quote-calculator.ts`<br>`backend/src/lambda/hold-sweeper.ts`<br>`infra/terraform/modules/lambda` | **IMPLEMENTED** | `POST /api/cloud/quote`, Vitest Lambda execution suite | **$0.00** (Always Free 1M req) |
| **4** | **AWS IAM** | Security | Least-privilege roles, instance profiles, SSM Managed Core policy | `infra/terraform/modules/security/main.tf`<br>`infra/terraform/modules/ec2/main.tf` | **ENFORCED** | Terraform validate, IAM assume-role policies | **$0.00** (Free) |
| **5** | **Amazon CloudWatch** | Monitoring | Centralized logs, system observability dashboard, EC2 CPU & status check alarms | `backend/src/integrations/monitoring/cloudwatch.service.ts`<br>`infra/terraform/modules/cloudwatch` | **IMPLEMENTED** | CloudWatch service test, `/api/cloud/overview` telemetry | **$0.00** (Always Free 10 metrics) |
| **6** | **Amazon API Gateway** | API Ingress | HTTP API v2 ingress exposing serverless Lambda quote engine with CORS and access logs | `infra/terraform/modules/apigateway/main.tf` | **CONFIGURED** | Terraform validate, `/api/cloud/quote` endpoint test | **$0.00** (Free Tier 1M req) |
| **7** | **Amazon DynamoDB** | Database | Immutable ledger table `BorrowBuy-RentalAuditLogs` for rental state changes | `backend/src/integrations/dynamodb/dynamodb.service.ts`<br>`infra/terraform/modules/dynamodb` | **IMPLEMENTED** | `GET /api/cloud/audit-logs`, Vitest DynamoDB mock suite | **$0.00** (Always Free 25GB) |
| **8** | **Amazon Cognito** | Identity | Managed user pool, JWT/PKCE auth adapter, secure token verification alongside local auth | `backend/src/integrations/auth/cognito.service.ts`<br>`infra/terraform/modules/cognito` | **IMPLEMENTED** | Cognito auth adapter unit tests, dual-token fallback | **$0.00** (Always Free 50K MAUs) |
| **9** | **Amazon EventBridge** | Event Bus | Automated cron rule (`rate(15 minutes)`) triggering Lambda to sweep expired holds | `backend/src/lambda/hold-sweeper.ts`<br>`infra/terraform/modules/lambda/main.tf` | **IMPLEMENTED** | Hold sweeper test in `tests/phase6.test.ts`, EventBridge rule in HCL | **$0.00** (Always Free) |
| **10** | **Amazon VPC** | Networking | Multi-AZ isolated network (`10.0.0.0/16`) across `ap-south-1a` & `ap-south-1b` | `infra/terraform/modules/vpc/main.tf` | **CONFIGURED** | Terraform validate, CIDR allocation check | **$0.00** (Free) |
| **11** | **Amazon EC2** | Compute | Docker Host for Express Node.js REST API + PostgreSQL 16 database | `infra/terraform/modules/ec2/main.tf` | **CONFIGURED** | Terraform validate, system telemetry in `/api/cloud/overview` | **$7.59 / mo** ($0 in Free Tier) |
| **12** | **Amazon SQS** | Messaging | Asynchronous event buffer queue + Dead Letter Queue (`events-dlq`) | `backend/src/integrations/queue/sqs-queue.service.ts`<br>`infra/terraform/modules/messaging` | **IMPLEMENTED** | Vitest SQS queue producer/consumer test suite | **$0.00** (Always Free 1M req) |
| **13** | **Amazon SNS** | Notification | Pub/Sub topic for equipment alerts, booking confirmations & push notifications | `backend/src/integrations/notifications/sns-notification.service.ts`<br>`infra/terraform/modules/messaging` | **IMPLEMENTED** | Vitest SNS notification adapter test suite | **$0.00** (Always Free 1M pub) |
| **14** | **AWS Budgets** | FinOps | Automated budget tracking with email threshold alerts at 50%, 80%, and 100% of $5.00 | `infra/terraform/modules/budgets/main.tf` | **CONFIGURED** | Terraform validate, monthly budget alarm resource | **$0.00** (2 free budgets) |
| **15** | **Application Load Balancer** | Ingress (B) | Layer-7 traffic distribution across multi-AZ subnets, health checks on `/api/health` | `infra/terraform/modules/alb/main.tf` | **OPTIONAL (B)** | Terraform validate, disabled in Profile A (`count = 0`) | Profile B: ~$16.20/mo ($0 in A) |
| **16** | **EC2 Auto Scaling** | Elasticity (B) | Target tracking scaling policy on CPU (> 70%), launch template, dynamic elasticity | `infra/terraform/modules/autoscaling/main.tf` | **OPTIONAL (B)** | Terraform validate, disabled in Profile A (`count = 0`) | $0.00 in Profile A |
| **17** | **AWS WAFv2** | Security (B) | Web Application Firewall protecting ALB and CloudFront with IP rate limiting & OWASP rules | `infra/terraform/modules/waf/main.tf` | **OPTIONAL (B)** | Terraform validate, disabled in Profile A (`count = 0`) | Profile B: ~$7.00/mo ($0 in A) |
| **18** | **AWS Certificate Manager** | Security (B) | Managed public TLS/SSL certificates with automated DNS validation | `infra/terraform/modules/acm/main.tf` | **OPTIONAL (B)** | Terraform validate, disabled in Profile A (uses CloudFront TLS) | $0.00 (Free) |
| **19** | **AWS Client VPN** | Networking (B) | TLS-encrypted administrative tunnel for secure developer access to private subnets | `infra/terraform/modules/vpn/main.tf` | **OPTIONAL (B)** | Terraform validate, disabled in Profile A (uses SSM) | Profile B: ~$72.00/mo ($0 in A) |
| **20** | **Amazon RDS PostgreSQL** | Database (B) | Managed PostgreSQL 16 database with Multi-AZ replication and automated snapshots | `infra/terraform/modules/rds/main.tf` | **OPTIONAL (B)** | Terraform validate, disabled in Profile A (uses Docker PG) | Profile B: ~$18.50/mo ($0 in A) |

---

## Service Verification Summary
- **14 Active Services in Profile A**: S3, CloudFront, Lambda, IAM, CloudWatch, API Gateway, DynamoDB, Cognito, EventBridge, VPC, EC2, SQS, SNS, Budgets.
- **6 Advanced Enterprise Services in Profile B**: ALB, Auto Scaling, WAF, ACM, Client VPN, RDS.
- **FinOps Compliance**: Profile A allows complete faculty evaluation without paying for expensive 24/7 NAT Gateways ($32.40/mo) or ALBs ($16.20/mo).
- **Graceful Fallback**: When AWS credentials are not active, the backend's pluggable service factories seamlessly activate in-memory or local disk drivers, preserving 100% functionality for offline development.
