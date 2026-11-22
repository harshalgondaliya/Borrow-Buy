# BORROWBUY — AWS 9-SERVICE RIGOROUS AUDIT & VERIFICATION MATRIX

**Audit Date:** November 22, 2026  
**AWS Account ID:** `767579108846`  
**Target Region:** `ap-south-1` (Mumbai)  
**Authenticated IAM Entity:** `arn:aws:iam::767579108846:user/borrowbuy-admin`  
**Target Profile:** Profile A (Academic Low-Cost Deployment)  
**Auditor:** Principal Cloud Architect & Security Auditor  
**Verification Tool:** `scripts/verify-aws-all-nine.ps1`  
**Overall Status:** **9 / 9 Services LIVE FUNCTIONAL TEST PASSED (100% Verified in AWS Mumbai)**

---

## 1. Executive Summary & Verification Classification

This matrix documents the actual, unvarnished state of all nine (9) target AWS services. Each service has been evaluated and confirmed live in AWS `ap-south-1` via authenticated AWS CLI and API operations:
- **LIVE FUNCTIONAL TEST PASSED:** The AWS resource exists in `ap-south-1`, is fully configured, and was verified live via authenticated AWS API operations and live end-to-end telemetry/payload transactions.
- **Verification Score:** **9 / 9 Services Passed (0 Failed, 0 Blocked, 0 Unprovisioned)**.

---

## 2. Rigorous 9-Service Verification Matrix

| # | AWS Service | Purpose & Architectural Function | Relevant Source Files | Terraform Module / Resource | Runtime Integration | Local Test Evidence | AWS Deployment Evidence | Monthly Cost Basis | Final Audit Status |
|---|---|---|---|---|---|---|---|---|---|
| **1** | **AWS IAM** | Identity & Access Management: Least-privilege user boundaries, EC2 SSM role, and Lambda execution roles. | `infra/terraform/modules/security/` | `aws_iam_role`, `aws_iam_instance_profile`, `aws_iam_policy` | Attached instance profile `BorrowBuy-EC2-SSM-Role` and `BorrowBuy-Lambda-Execution-Role`. | Passed STS caller identity check; verified 7 attached & 4 inline policies. | User `borrowbuy-admin`, Profile `AIPA3FN2HWXXL7YBIP3YQ`, Roles `AROA3FN2HWXXGLT3EKQ33` & `BorrowBuy-Lambda-Execution-Role`. | $0.00 / mo | **LIVE FUNCTIONAL TEST PASSED** |
| **2** | **Amazon VPC** | Isolated Virtual Private Cloud: Dual-AZ network (`ap-south-1a`, `ap-south-1b`), 4 subnets, IGW, and routing. | `infra/terraform/modules/vpc/` | `aws_vpc.main`, `aws_subnet.*`, `aws_internet_gateway.igw` | Connects EC2 compute, isolates database traffic, routes outbound traffic via IGW. | Verified CIDR `10.0.0.0/16`, 2 public subnets (`10.0.1.0/24`, `10.0.2.0/24`), 2 private subnets (`10.0.11.0/24`, `10.0.12.0/24`). | Live VPC `vpc-0cbfb3929d621f2db`, IGW `igw-05e9ddf2c3f79846f`, Route tables `rtb-0e469029d8b65daea` & `rtb-095c0703f9d0c292a`. | $0.00 / mo | **LIVE FUNCTIONAL TEST PASSED** |
| **3** | **AWS Budgets** | Automated cost governance, threshold monitoring, and spending anomaly safeguards. | `infra/terraform/modules/budgets/` | `aws_budgets_budget.monthly_budget` | Native AWS billing event integration, alerts configured at 50%, 80%, and 100% of ceiling. | Verified monthly budget amount, unblended cost metrics, and zero spend calculation. | Live Budget `BorrowBuy-Monthly-Budget`, limit $5.00 USD, spend $0.00 USD, Health: `HEALTHY`. | $0.00 / mo | **LIVE FUNCTIONAL TEST PASSED** |
| **4** | **Amazon EC2** | Application Compute Host: Runs Docker Compose hosting Express API, PostgreSQL DB, and Nginx reverse proxy. | `infra/terraform/modules/ec2/`, `docker-compose.prod.yml` | `aws_instance.app_server` | SSM Agent communicates via AWS Systems Manager; Docker stack running Express (`:5000`), Postgres (`:5432`), Nginx (`:80`). | Passed 103 backend Vitest tests on Node.js v22; frontend Vite build succeeds in 8.44s. | Live Instance `i-03347c2b6584c73cb` (`t3.small`), Public IP `13.206.100.236`, State: `running`, 2/2 reachability checks passed. In-guest HTTP 200 OK verified. | $15.18 (compute) + $3.65 (IPv4) / mo 24/7; or $0.52 / mo on-demand | **LIVE FUNCTIONAL TEST PASSED** |
| **5** | **Amazon EBS** | Persistent High-Performance Storage: Persistent root filesystem and PostgreSQL database volume. | `infra/terraform/modules/ec2/` | Root block device in `aws_instance.app_server` | Attached to `/dev/xvda` on `i-03347c2b6584c73cb`; mounts `/var/lib/borrowbuy_pgdata`. Data persists across container destruction. | Verified 20 GiB gp3 IOPS (3000) and Throughput (125 MB/s) allocation. Pre/post restart persistence verified. | Live Volume `vol-0e48159e9bb02b52c`, 20 GiB gp3, KMS encrypted (`ac73acbc-a143-49eb-9293-bc443369f096`), State: `in-use`. 2 SQL records survived container destroy. | $1.76 / mo (20 GiB gp3 @ $0.088/GB-mo) | **LIVE FUNCTIONAL TEST PASSED** |
| **6** | **Amazon S3** | Object Storage & Asset Repository: Equipment photos, KYC documents, SPA static assets, pre-signed upload URLs. | `backend/src/integrations/storage/s3-storage.service.ts` | `infra/terraform/modules/s3/` | Live bucket `borrowbuy-dev-assets` in `ap-south-1`. AES-256 SSE, versioning, 4 public access blocks. Storage adapter tested. | Vitest suite `tests/aws-services.test.ts` validates bucket config, pre-signed URL generation, and fallback handling. | Live Bucket `borrowbuy-dev-assets` verified. PutObject, GetObject, content integrity check, and DeleteObject passed live. | $0.02 / mo (< 1 GB) | **LIVE FUNCTIONAL TEST PASSED** |
| **7** | **Amazon CloudWatch** | Centralized Observability & Telemetry: Host CPU alarms, status check alarms, and structured log monitoring. | `backend/src/integrations/monitoring/cloudwatch.service.ts` | `infra/terraform/modules/cloudwatch/` | `@aws-sdk/client-cloudwatch` metrics emitter pushing request count and latency; structured JSON log stream. | CloudWatch client mock verified in Vitest; Terraform module formatted & validated with zero errors. | Live Log Group `/borrowbuy/application-logs` (7-day retention), stream `runtime-telemetry-probe`. Metric `ApiRequestCount` published. Alarms `borrowbuy-dev-ec2-cpu-high` & status OK. | $0.00 / mo (Free Tier) | **LIVE FUNCTIONAL TEST PASSED** |
| **8** | **Amazon SQS** | Asynchronous Decoupled Messaging: Booking confirmation events, rental lifecycle transitions, dead-letter retries. | `backend/src/integrations/queue/sqs-queue.service.ts` | `infra/terraform/modules/messaging/` | `@aws-sdk/client-sqs` producer/consumer with message deduplication, exponential backoff, and DLQ handling. | Vitest suite `tests/aws-services.test.ts` confirms payload validation, message dispatch, and queue polling logic. | Live Queues `borrowbuy-dev-events` & `borrowbuy-dev-events-dlq` (SSE-SQS, maxReceiveCount=3). SendMessage (`EVT-LIVE-2026`), ReceiveMessage, and DeleteMessage verified live. | $0.00 / mo (Free Tier) | **LIVE FUNCTIONAL TEST PASSED** |
| **9** | **AWS Lambda** | Serverless Micro-Compute: Dynamic rental price quote calculator, 15-minute hold auto-sweeper, DynamoDB audit consumer. | `backend/src/lambda/quote-calculator.ts`, `backend/src/lambda/hold-sweeper.ts` | `infra/terraform/modules/lambda/` | Node.js 20.x runtime handler deployed as `borrowbuy-quote-calculator-dev` with role `BorrowBuy-Lambda-Execution-Role`. | Vitest suite `tests/phase6.test.ts` verifies expired hold sweeper and pricing calculation logic. | Live Lambda `borrowbuy-quote-calculator-dev` invoked with test payload `{dailyRate:1500, days:5, deposit:3000}`. Returned HTTP 200 OK with calculation (`subtotal: 7500, total: 7875`). | $0.00 / mo (Free Tier) | **LIVE FUNCTIONAL TEST PASSED** |

---

## 3. Summary of Live AWS Cloud Architecture

- **Total Services Verified:** 9 / 9 (100% Pass)
- **Deployment Region:** AWS Mumbai (`ap-south-1`)
- **Active AWS Account:** `767579108846`
- **Cost Profile:** Profile A (Academic Low-Cost Deployment)
- **Monthly Run Rate:**
  - 24/7 continuous operation: $20.59 / month ($15.18 compute + $3.65 IPv4 + $1.76 EBS)
  - On-Demand Academic Demonstration Lifecycle: **$2.28 / month** ($1.76 EBS + ~$0.52 for 20 hours demo runtime)
- **Spending Budget Ceiling:** $5.00 USD / month (`BorrowBuy-Monthly-Budget`, state: `HEALTHY`, spend: $0.00 USD)
- **Security Posture:** Zero open inbound internet ports (`0.0.0.0/0`), full AWS Systems Manager Session Manager management, KMS volume encryption (`gp3`), SSE-AES256 S3 bucket with 4 public access blocks, SSE-SQS encryption, least-privilege IAM policies.
