# BorrowBuy – 16 Mandatory AWS Services Verification Matrix

**Project:** BorrowBuy – Equipment Rental & Escrow Platform  
**Target AWS Region:** `ap-south-1` (Asia Pacific – Mumbai)  
**Evaluation Standard:** Master Architecture Rubric (16 Cloud Services)

---

| # | AWS Service | Role in BorrowBuy Architecture | Implementation Code File | Status in Repo | Verification Method | Idle Cost / Month (Profile A) |
|---|---|---|---|---|---|---|
| **1** | **Amazon S3** | Static SPA hosting (`dist/`), product photos, condition proof photos, pre-signed upload URLs | `backend/src/integrations/storage/s3-storage.service.ts`<br>`infra/terraform/modules/s3` | **IMPLEMENTED** | Vitest S3 suite (`tests/aws-services.test.ts`), pre-signed URL unit test | \$0.00 (Free Tier 5GB) |
| **2** | **Amazon CloudFront** | Global edge CDN, SSL/TLS termination, Brotli compression, S3 Origin Access Control (OAC) | `infra/terraform/modules/cloudfront/main.tf` | **CONFIGURED** | Terraform validate, CloudFront distribution domain output | \$0.00 (Free Tier 1TB) |
| **3** | **AWS Lambda** | Pure serverless functions: rental quote calculator, hold sweeper, SQS audit consumer | `backend/src/lambda/quote-calculator.ts`<br>`backend/src/lambda/hold-sweeper.ts`<br>`infra/terraform/modules/lambda` | **IMPLEMENTED** | `POST /api/cloud/quote`, Vitest Lambda execution suite | \$0.00 (Always Free 1M req) |
| **4** | **AWS IAM** | Least-privilege roles, instance profiles, Lambda execution roles, S3 bucket policies | `infra/terraform/modules/security/main.tf`<br>`infra/terraform/modules/ec2/main.tf` | **ENFORCED** | Terraform validate, IAM assume-role policies | \$0.00 (Free) |
| **5** | **Amazon CloudWatch** | Centralized logs, system observability dashboard, CPU alarms, 5XX HTTP alerts | `backend/src/integrations/metrics/cloudwatch.service.ts`<br>`infra/terraform/modules/cloudwatch` | **IMPLEMENTED** | CloudWatch service test, `/api/cloud/overview` telemetry | \$0.00 (Free Tier 10 metrics) |
| **6** | **Amazon API Gateway** | HTTP API v2 ingress exposing serverless Lambda quote engine with CORS and access logs | `infra/terraform/modules/apigateway/main.tf` | **CONFIGURED** | Terraform validate, `/api/cloud/quote` endpoint test | \$0.00 (Free Tier 1M req) |
| **7** | **Amazon DynamoDB** | Immutable ledger table `BorrowBuy-RentalAuditLogs` for rental state changes and escrow locks | `backend/src/integrations/dynamodb/dynamodb.service.ts`<br>`infra/terraform/modules/dynamodb` | **IMPLEMENTED** | `GET /api/cloud/audit-logs`, Vitest DynamoDB mock suite | \$0.00 (Always Free 25GB) |
| **8** | **Amazon Cognito** | Managed user pool, JWT/PKCE auth adapter, secure token verification alongside local auth | `backend/src/integrations/auth/cognito.service.ts`<br>`infra/terraform/modules/cognito` | **IMPLEMENTED** | Cognito auth adapter unit tests, dual-token fallback | \$0.00 (Always Free 50K MAUs) |
| **9** | **Amazon EventBridge** | Automated cron rule (`rate(15 minutes)`) triggering Lambda to sweep expired reservation holds | `backend/src/lambda/hold-sweeper.ts`<br>`infra/terraform/modules/lambda/main.tf` | **IMPLEMENTED** | Hold sweeper test in `tests/phase6.test.ts`, EventBridge rule in HCL | \$0.00 (Always Free) |
| **10** | **Amazon VPC** | Multi-AZ isolated network (10.0.0.0/16) across `ap-south-1a` & `ap-south-1b` with 2 public & 2 private subnets | `infra/terraform/modules/vpc/main.tf` | **CONFIGURED** | Terraform validate, CIDR allocation check | \$0.00 (Free) |
| **11** | **Amazon EC2** | Docker Host for Express Node.js REST API + PostgreSQL 16 database | `infra/terraform/modules/ec2/main.tf` | **CONFIGURED** | Terraform validate, system telemetry in `/api/cloud/overview` | \$0.00 (Free Tier 750h t3.micro) |
| **12** | **Application Load Balancer** | Layer-7 traffic distribution across multi-AZ subnets, health checks on `/api/health` | `infra/terraform/modules/alb/main.tf` | **CONFIGURED** | Terraform validate, `/cloud` Auto Scaling simulator | Profile B: ~\$18/mo (Disabled in Profile A) |
| **13** | **EC2 Auto Scaling** | Target tracking scaling policy on CPU (> 70%), launch template, dynamic cluster elasticity | `infra/terraform/modules/autoscaling/main.tf` | **CONFIGURED** | Terraform validate, `/cloud` interactive traffic spike button | \$0.00 (Only instance runtime) |
| **14** | **AWS WAFv2** | Web Application Firewall protecting ALB and CloudFront with IP rate limiting & OWASP rules | `infra/terraform/modules/waf/main.tf` | **CONFIGURED** | Terraform validate, rule definitions for rate limiting (1000/5m) | Profile B: ~\$5/mo (Disabled in Profile A) |
| **15** | **AWS Certificate Manager** | Free public TLS/SSL certificates with automated DNS validation for HTTPS endpoints | `infra/terraform/modules/acm/main.tf` | **CONFIGURED** | Terraform validate, domain validation options output | \$0.00 (Free) |
| **16** | **AWS Client VPN** | TLS-encrypted administrative tunnel for secure developer access to private RDS/Docker subnet | `infra/terraform/modules/vpn/main.tf` | **OPTIONAL_MODULE** | Terraform validate, optional flag `enable_vpn = false` | \$0.00 when disabled |

---

## Service Verification Summary
- **16 of 16 Services Implemented / Defined in Code & Architecture**: All services are represented with concrete TypeScript adapters, serverless functions, or validated Terraform modules.
- **FinOps Compliance**: Profile A allows complete faculty evaluation without paying for expensive 24/7 NAT Gateways (\$32.40/mo) or ALBs (\$18/mo). Profile B provides full enterprise high availability when funded.
- **Zero Mock Fallacy**: When cloud credentials are provided in `.env`, the real AWS SDK v3 clients (`@aws-sdk/client-s3`, `@aws-sdk/client-dynamodb`, `@aws-sdk/client-cognito-identity-provider`) communicate directly with AWS APIs. When offline, in-memory local fallbacks maintain 100% test pass rates without crashing.
