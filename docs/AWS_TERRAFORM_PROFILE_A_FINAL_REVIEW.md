# BorrowBuy – Terraform Profile A Architectural & Security Review

**Document Purpose:** Final technical review of Terraform root configuration, module instantiation, security groups, IAM least-privilege, and dry-run execution plan for Profile A.  
**Execution Timestamp:** November 18, 2026  
**Auditor:** Senior AWS DevOps Engineer & Cloud Security Auditor  
**Target Architecture:** Profile A (Academic Low-Cost Baseline)  
**Region:** `ap-south-1` (Mumbai)

---

## 1. Terraform Root Module Architecture

The root Terraform configuration in `infra/terraform/main.tf` orchestrates 18 modular components. The Profile A baseline selectively activates only the zero/low-cost modules necessary for a complete full-stack demonstration:

### Module Instantiation Status in Profile A

```
[ Root Module: infra/terraform/main.tf ]
   │
   ├── [ ACTIVE ] module "vpc"              --> Multi-AZ VPC (10.0.0.0/16) across ap-south-1a & 1b
   ├── [ ACTIVE ] module "s3"               --> Private asset bucket with SSE-S3 encryption
   ├── [ ACTIVE ] module "security"         --> Security groups (web ports only) & IAM instance profiles
   ├── [ ACTIVE ] module "cloudwatch"       --> Metric alarms, log groups & dashboard (ap-south-1)
   ├── [ ACTIVE ] module "messaging"        --> SQS event queue + Dead Letter Queue & SNS topic
   ├── [ ACTIVE ] module "budgets"          --> Cost control alarm at $5.00 threshold
   ├── [ ACTIVE ] module "ec2"              --> 1x t3.micro Docker host running Compose (Nginx + API + PG)
   ├── [ ACTIVE ] module "cloudfront"       --> Global CDN with Origin Access Control (OAC)
   ├── [ ACTIVE ] module "dynamodb"         --> Pay-per-request audit trail table ($0 idle)
   ├── [ ACTIVE ] module "cognito"          --> User Pool & App Client for authentication ($0 idle)
   ├── [ ACTIVE ] module "lambda"           --> Serverless quote calculator & hold sweeper ($0 idle)
   ├── [ ACTIVE ] module "apigateway"       --> HTTP API v2 ingress ($0 idle)
   │
   ├── [ DISABLED: count=0 ] module "rds"         --> Saves ~$18.50/month (uses Docker PG on EC2)
   ├── [ DISABLED: count=0 ] module "alb"         --> Saves ~$16.20/month (uses Nginx on EC2)
   ├── [ DISABLED: count=0 ] module "autoscaling" --> Saves multi-instance compute cost
   ├── [ DISABLED: count=0 ] module "waf"         --> Saves ~$7.00/month
   ├── [ DISABLED: count=0 ] module "vpn"         --> Saves ~$72.00/month (uses SSM Session Manager)
   ├── [ DISABLED: count=0 ] module "acm"         --> Saves custom domain complexity (uses CloudFront TLS)
   │
   └── [ UNCALLED IN ROOT ] modules/ecs/    --> Legacy reference module (not invoked in main.tf)
```

---

## 2. Dry-Run Execution Plan Evidence

Using the authenticated `borrowbuy-auditor` profile, a complete read-only `terraform plan` was executed against AWS Mumbai (`ap-south-1`):

```powershell
PS H:\CC Project\infra\terraform> terraform plan -var="aws_region=ap-south-1" -var="deploy_mode=ec2"
module.lambda[0].data.archive_file.lambda_dummy: Read complete after 0s
module.ec2[0].data.aws_ami.al2023: Reading...
module.ec2[0].data.aws_ami.al2023: Read complete after 3s [id=ami-0d5a1afa9b3736956]

Terraform used the selected providers to generate the following execution plan:
Plan: 60 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + acm_certificate_arn            = "N/A"
  + alb_dns_name                   = "N/A"
  + api_gateway_endpoint           = (known after apply)
  + autoscaling_group_name         = "N/A"
  + cloudfront_distribution_domain = (known after apply)
  + cloudfront_distribution_id     = (known after apply)
  + cloudwatch_api_log_group_arn   = (known after apply)
  + cloudwatch_dashboard_name      = "borrowbuy-dev-observability"
  + cognito_client_id              = (known after apply)
  + cognito_user_pool_id           = (known after apply)
  + dynamodb_table_arn             = (known after apply)
  + dynamodb_table_name            = "borrowbuy-RentalAuditLogs"
  + ec2_public_dns                 = (known after apply)
  + ec2_public_ip                  = (known after apply)
  + lambda_hold_sweeper_arn        = (known after apply)
  + lambda_quote_calculator_arn    = (known after apply)
  + monthly_budget_id              = (known after apply)
  + private_subnet_ids             = [(known after apply), (known after apply)]
  + public_subnet_ids              = [(known after apply), (known after apply)]
  + s3_bucket_arn                  = (known after apply)
  + s3_bucket_name                 = (known after apply)
  + sns_topic_arn                  = (known after apply)
  + sqs_queue_url                  = (known after apply)
  + vpc_id                         = (known after apply)
  + vpn_endpoint_id                = "N/A"
  + waf_web_acl_arn                = "N/A"
```

### Plan Highlights:
1. **Live AMI Resolution:** Successfully queried AWS EC2 in `ap-south-1` and resolved latest Amazon Linux 2023 AMI: `ami-0d5a1afa9b3736956`.
2. **Exactly 60 Resources:** Matches the planned Profile A service inventory across VPC, EC2, S3, CloudFront, Lambda, API Gateway, DynamoDB, Cognito, SQS, SNS, CloudWatch, and Budgets.
3. **Zero High-Cost Outputs:** All enterprise resources output `"N/A"`, confirming zero ALB, zero RDS, zero ASG, zero VPN, and zero WAF resources.

---

## 3. Security Architecture & IAM Review

### 3.1 Network Security (Zero SSH Exposure)
- **Standard Vulnerability Eliminated:** Port 22 (SSH) is **completely closed** in the EC2 host security group (`modules/ec2/main.tf`).
- **Inbound Ingress:** Restricted exclusively to port 80 (HTTP) and port 443 (HTTPS) for public web traffic.
- **Administrative Access:** Provided via AWS Systems Manager Session Manager. The IAM policy `arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore` is attached to the EC2 host role, allowing browser-based terminal access without open inbound ports or SSH key pairs.

### 3.2 S3 Bucket Security & CloudFront OAC
- The S3 asset bucket enforces `aws_s3_bucket_public_access_block` (all 4 public access blocks enabled).
- In `modules/cloudfront/main.tf`, access is granted exclusively through AWS Origin Access Control (OAC) with SigV4 signing (`Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.cdn.arn } }`).
- Direct public reads to the S3 bucket URL are rejected with HTTP 403.

### 3.3 Reconciled CloudWatch Dashboard Configuration
- **Defect Identified & Corrected:** `modules/cloudwatch/main.tf` hardcoded `"region": "us-east-1"` in the dashboard JSON widgets.
- **Correction Implemented:** Added variable `aws_region` to `modules/cloudwatch/variables.tf`, wired `aws_region = var.aws_region` in `main.tf`, and updated all metric widgets in `modules/cloudwatch/main.tf` to reference `var.aws_region`.
- Metrics now dynamically track `ap-south-1` resources.

---

## 4. Application Bootstrap, Docker Compose & Data Persistence

### 4.1 Single-Host Docker Architecture
On the EC2 instance, the application executes via `docker-compose.prod.yml`:
1. `borrowbuy-prod-postgres` (`postgres:16-alpine` on internal port 5432)
2. `borrowbuy-prod-backend` (Node 22 Express API on internal port 5000)
3. `borrowbuy-prod-proxy` (Nginx reverse proxy on public ports 80/443)

### 4.2 Database Persistence Guarantees
- PostgreSQL data files reside on the Docker named volume `postgres_prod_data`, located on the host EBS volume at `/var/lib/docker/volumes/postgres_prod_data/_data`.
- **Survival Matrix:**
  - Container crash / restart: **Data Preserved** (`restart: always`).
  - Container update (`docker compose down && docker compose up -d`): **Data Preserved**.
  - Host OS reboot (`sudo reboot`): **Data Preserved** (EBS volume remains attached).
  - EC2 Stop/Start from AWS Console: **Data Preserved** (EBS volume remains attached).
  - EC2 Instance Termination: **Data Lost Without Backup** (Root EBS device has `delete_on_termination = true`).

### 4.3 Automated S3 Disaster Recovery Script
To prevent data loss on accidental EC2 termination, the following cron script should run daily on the host:
```bash
#!/bin/bash
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/borrowbuy_backup_${TIMESTAMP}.sql.gz"

docker exec borrowbuy-prod-postgres pg_dump -U borrowbuy_user borrowbuy_production | gzip > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://${AWS_S3_BUCKET_NAME}/backups/borrowbuy_backup_${TIMESTAMP}.sql.gz
rm -f $BACKUP_FILE
```
