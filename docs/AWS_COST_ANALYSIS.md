# BorrowBuy – FinOps Cloud Cost Analysis & Estimation

**Target Region:** `ap-south-1` (Mumbai, India)  
**Budget Constraint:** Student Low-Cost / Free Tier Eligibility  
**Cost Safeguard:** AWS Budgets configured with hard stop alert at \$5.00 USD.

---

## 1. Cost Comparison: Profile A vs Profile B

| AWS Service | Usage Metric | Profile A (Academic Baseline) | Profile B (Production Multi-AZ) | Notes & Free Tier Eligibility |
|---|---|---|---|---|
| **Amazon EC2** | Compute | **\$0.00** (t3.micro Free Tier) | \$15.00 (2x t3.micro ASG) | 750 hours/month free for 12 months on t2.micro/t3.micro. |
| **Amazon RDS** | Managed DB | **\$0.00** (Docker on EC2) | \$18.50 (db.t4g.micro Multi-AZ) | Profile A uses containerized PostgreSQL 16 on the EC2 host. |
| **NAT Gateway** | Outbound routing | **\$0.00** (0 NAT Gateways) | \$32.40 (1 NAT Gateway) | NAT Gateways cost \$0.045/hr (\$32.40/mo). Disabled in Profile A. |
| **Application Load Balancer** | Layer-7 Ingress | **\$0.00** (Direct EC2 Elastic IP) | \$18.00 (Multi-AZ ALB) | ALBs cost \$0.0225/hr + LCU charges (~~\$18/mo). |
| **Amazon S3** | Object Storage | **\$0.00** (Under 5 GB) | \$0.20 (8 GB photos + logs) | 5 GB standard storage and 20,000 GETs free for 12 months. |
| **Amazon CloudFront** | CDN & Edge SSL | **\$0.00** (Under 1 TB) | **\$0.00** (Under 1 TB) | 1 TB data transfer out per month permanently free. |
| **AWS Lambda** | Serverless Calc | **\$0.00** (< 50,000 req) | **\$0.00** (< 200,000 req) | 1,000,000 requests per month permanently free (Always Free). |
| **Amazon DynamoDB** | Audit Stream | **\$0.00** (On-Demand) | **\$0.00** (Under 25 GB) | 25 GB storage + 25 WCU/RCU permanently free (Always Free). |
| **Amazon API Gateway** | HTTP Ingress | **\$0.00** (< 100,000 calls) | \$0.10 (HTTP API calls) | 1,000,000 API calls free per month for 12 months. |
| **Amazon Cognito** | Authentication | **\$0.00** (< 100 users) | **\$0.00** (< 1,000 users) | 50,000 monthly active users permanently free (Always Free). |
| **Amazon EventBridge** | 15m Cron Sweeper | **\$0.00** (Default bus) | **\$0.00** (Default bus) | Free for all AWS default events. |
| **Amazon SQS / SNS** | Messaging & Alerts | **\$0.00** (< 10,000 msgs) | **\$0.00** (< 50,000 msgs) | 1,000,000 SQS requests + 1,000,000 SNS publishes free monthly. |
| **Amazon CloudWatch** | Logs & Metrics | **\$0.00** (< 10 metrics) | \$3.00 (Custom metrics + alarms) | 10 custom metrics + 10 alarms + 5 GB log ingestion free. |
| **AWS WAFv2** | Web ACL | **\$0.00** (Disabled) | \$5.00 (1 Web ACL + 2 rules) | WAF costs \$5.00/ACL/mo + \$1.00/rule/mo. |
| **AWS Certificate Manager** | Public TLS Cert | **\$0.00** (Free) | **\$0.00** (Free) | Public SSL/TLS certificates are 100% free from Amazon. |
| **AWS Client VPN** | Admin Tunnel | **\$0.00** (Disabled) | \$0.00 (Use SSM Session Mgr) | Avoid endpoint charges (\$72/mo); use SSM Session Manager. |
| **AWS Budgets** | Cost Monitoring | **\$0.00** (Free) | **\$0.00** (Free) | 2 free budgets per AWS account. |
| **TOTAL ESTIMATE** | | **\$0.00 – \$1.50 / month** | **\$89.20 – \$94.20 / month** | |

---

## 2. FinOps Safeguards & Budget Enforcement

To eliminate any risk of unexpected student billing, the following guardrails are enforced in Terraform:
1. **AWS Budget Alarm:** Hard spending threshold set to **\$5.00 USD / month** in `infra/terraform/modules/budgets`. Automatic email notifications trigger at 50% (\$2.50), 80% (\$4.00), and 100% (\$5.00).
2. **Zero-NAT Architecture:** NAT Gateway is disabled by default (`enable_nat_gateway = false`), preventing the most common accidental student charge (\$32.40/month).
3. **On-Demand Serverless:** DynamoDB, Lambda, and API Gateway use Pay-Per-Request billing, ensuring \$0.00 idle cost when no requests are being processed.
4. **S3 Lifecycle Rules:** Private uploads and temporary files transition to Glacier or expire after 30 days.
