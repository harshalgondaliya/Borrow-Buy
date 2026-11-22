# BorrowBuy – FinOps Cloud Cost Analysis & Estimation

**Target Region:** `ap-south-1` (Mumbai, India)  
**Deployment Architecture:** Profile A (Academic Low-Cost Baseline)  
**Account Profile:** AWS Free Plan with approximately $100 USD in promotional credits  
**Last Verified:** November 18, 2026  
**Auditor:** Principal AWS Solutions Architect & FinOps Auditor

---

## 1. Executive Summary & Credit Runway

BorrowBuy is architected under **Profile A** to maximize academic demonstration capabilities while minimizing financial exposure.

### Key Financial Facts:
- **Out-of-Pocket Cost:** **$0.00 USD** as long as promotional credits remain active.
- **Credit Balance:** ~$100.00 USD promotional credits applied to the AWS account.
- **Monthly Run Rate (24/7 Uptime):** **~$12.87 USD / month** (if account is past 12-month Free Tier) or **$0.00 / month** (if within 12-month Free Tier).
- **Promotional Credit Runway (24/7 Continuous):** **7.7 to 8.5 months** of non-stop cloud hosting.
- **Promotional Credit Runway (On-Demand / Demos):** **> 24 months** if the EC2 instance is stopped when not actively being evaluated.
- **FinOps Savings vs Enterprise Architecture:** Over **$146.10 USD / month** saved by disabling high-cost managed services (NAT Gateway, ALB, RDS Multi-AZ, Client VPN, WAF).

---

## 2. Granular Time-Window Cost Breakdown (Profile A in Mumbai)

The following table provides verified, itemized cost projections based on current official AWS Mumbai (`ap-south-1`) On-Demand pricing:

| Service / Resource | Unit Price (`ap-south-1`) | 2 Hours (Local Test) | 8 Hours (Faculty Demo) | 24 Hours (1 Day) | 7 Days (1 Week) | 30 Days (1 Month) |
|---|---|---|---|---|---|---|
| **EC2 `t3.micro` Compute** | $0.0104 / hour | $0.0208 | $0.0832 | $0.2496 | $1.7472 | $7.5920 |
| **Public IPv4 Address** | $0.0050 / hour | $0.0100 | $0.0400 | $0.1200 | $0.8400 | $3.6500 |
| **EBS Storage (20 GB gp3)** | $0.0800 / GB-month | $0.0044 | $0.0178 | $0.0533 | $0.3733 | $1.6000 |
| **S3 Storage (< 1 GB uploads)** | $0.0250 / GB-month | $0.0001 | $0.0003 | $0.0008 | $0.0058 | $0.0250 |
| **CloudFront Global CDN** | 1 TB/mo Always Free | $0.0000 | $0.0000 | $0.0000 | $0.0000 | $0.0000 |
| **AWS Lambda Quotes Engine** | 1M req/mo Always Free | $0.0000 | $0.0000 | $0.0000 | $0.0000 | $0.0000 |
| **Amazon DynamoDB Audit Logs** | 25 GB/mo Always Free | $0.0000 | $0.0000 | $0.0000 | $0.0000 | $0.0000 |
| **Amazon Cognito Auth** | 50,000 MAUs Always Free | $0.0000 | $0.0000 | $0.0000 | $0.0000 | $0.0000 |
| **Amazon SQS & SNS Messaging** | 1M req/mo Always Free | $0.0000 | $0.0000 | $0.0000 | $0.0000 | $0.0000 |
| **Amazon CloudWatch Monitoring** | 2 alarms, 1 log, 1 dash | $0.0000 | $0.0000 | $0.0000 | $0.0000 | $0.0000 |
| **Amazon API Gateway v2** | $1.00 / 1M requests | $0.0001 | $0.0004 | $0.0012 | $0.0084 | $0.0360 |
| **Data Transfer Out** | First 100 GB/mo free | $0.0000 | $0.0000 | $0.0000 | $0.0000 | $0.0000 |
| **TOTAL ESTIMATED CHARGES** | | **$0.035 USD** | **$0.142 USD** | **$0.425 USD** | **$2.975 USD** | **$12.903 USD** |
| **Credit Consumption** | | -$0.035 | -$0.142 | -$0.425 | -$2.975 | -$12.903 |
| **ACTUAL OUT-OF-POCKET COST** | | **$0.00 USD** | **$0.00 USD** | **$0.00 USD** | **$0.00 USD** | **$0.00 USD** |

---

## 3. FinOps Comparison: Profile A vs Profile B

| AWS Service / Resource | Profile A (Academic Baseline) | Profile B (Multi-AZ Enterprise) | FinOps Rationale & Safety Setting |
|---|---|---|---|
| **EC2 Compute** | **$7.59 / mo** (1x `t3.micro`) | $15.18 / mo (2x `t3.micro` ASG) | Single Docker host is sufficient for academic evaluation. |
| **Relational Database** | **$0.00 / mo** (Docker PostgreSQL 16) | $18.50 / mo (`db.t4g.micro` Multi-AZ) | Saves database management fee; data stored on EBS volume. |
| **NAT Gateway** | **$0.00 / mo** (0 Gateways) | $32.40 / mo (1 NAT Gateway) | Most common student bill shock; disabled via `enable_nat_gateway=false`. |
| **Application Load Balancer** | **$0.00 / mo** (Direct Nginx Reverse Proxy) | $16.20 / mo (Dual-AZ ALB + LCU fees) | Nginx on port 80 handles routing; CloudFront terminates TLS. |
| **AWS Client VPN** | **$0.00 / mo** (SSM Session Manager) | $72.00 / mo (Subnet association fee) | SSM Session Manager is 100% free and requires zero open ports. |
| **AWS WAFv2 Web ACL** | **$0.00 / mo** (Express Rate Limiter) | $7.00 / mo ($5/ACL + $1/rule) | In-app rate limiting prevents DDoS without AWS WAF fees. |
| **Public IPv4 Address** | $3.65 / mo (1 IP on EC2) | $7.30 / mo (2 IPs on ASG instances) | Required for direct internet ingress; covered if within Free Tier. |
| **EBS Storage** | $1.60 / mo (20 GB gp3) | $3.20 / mo (40 GB across 2 nodes) | Standard gp3 root volume. |
| **Serverless Services** | $0.00 / mo (Always Free tier) | $0.20 / mo (High-volume API calls) | Pay-per-request ensures $0 idle cost. |
| **TOTAL MONTHLY COST** | **~$12.87 / month** | **~$164.98 / month** | **Profile A saves $152.11 / month (92.2% reduction)** |

---

## 4. Cost Safeguards & Budget Notification Truth

> [!IMPORTANT]
> **AWS Budgets Alerting vs Automated Shutdown:**  
> In `infra/terraform/modules/budgets/main.tf`, the project creates an `aws_budgets_budget` resource set to a **$5.00 USD monthly threshold**.
> 
> - **What it DOES:** Sends immediate email notifications to `subscriber_email_addresses` at 50% ($2.50), 80% ($4.00), and 100% ($5.00) of actual/forecasted spend.
> - **What it DOES NOT DO:** It **does not automatically stop or terminate EC2 instances or delete resources**.
> - **Why Automated Termination Is Avoided:** Abruptly killing an EC2 instance can corrupt the PostgreSQL write-ahead log (WAL) and crash faculty demonstrations.

### Administrative Action Protocol upon Receiving a Cost Alert:
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **Billing & Cost Management** -> **Cost Explorer** to inspect the source of the charge.
3. If the evaluation or presentation is finished, run:
   ```bash
   cd infra/terraform
   terraform destroy -var="aws_region=ap-south-1" -var="deploy_mode=ec2"
   ```
4. If you want to keep the data intact but pause charges overnight, stop the EC2 instance:
   ```bash
   aws ec2 stop-instances --instance-ids <INSTANCE_ID> --region ap-south-1
   ```
   *(When stopped, EC2 compute and IPv4 charges halt immediately; only the $1.60/month EBS storage fee accrues).*

---

## 5. Official Pricing Documentation Links

- [AWS Free Tier Details & Limits](https://aws.amazon.com/free/)
- [Amazon EC2 On-Demand Pricing (Mumbai)](https://aws.amazon.com/ec2/pricing/on-demand/)
- [Amazon VPC Public IPv4 Pricing](https://aws.amazon.com/vpc/pricing/)
- [Amazon EBS Pricing](https://aws.amazon.com/ebs/pricing/)
- [Amazon S3 Pricing](https://aws.amazon.com/s3/pricing/)
- [Amazon CloudFront Always Free Tier](https://aws.amazon.com/cloudfront/pricing/)
- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [Amazon DynamoDB On-Demand Pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/)
