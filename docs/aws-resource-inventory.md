# BorrowBuy – Cloud Resource Inventory & Registry

**Target Region**: `ap-south-1` (Asia Pacific – Mumbai)  
**Project**: BorrowBuy – Product Rental and Management Platform  
**Architecture Tier**: Student Budget Free Tier Baseline  

---

## 1. Complete Cloud Resource Registry

| AWS Service | Resource Logical Name | Terraform Resource Type | Configuration & Sizing | Cost Allocation | Status |
|---|---|---|---|:---:|:---:|
| **VPC** | `borrowbuy-dev-vpc` | `aws_vpc` | CIDR `10.0.0.0/16`, DNS hostnames enabled | \$0.00 | **Declared** |
| **Internet Gateway** | `borrowbuy-dev-igw` | `aws_internet_gateway` | Attached to main VPC | \$0.00 | **Declared** |
| **Public Subnets** | `borrowbuy-dev-public-ap-south-1{a,b}` | `aws_subnet` | CIDRs `10.0.1.0/24`, `10.0.2.0/24` | \$0.00 | **Declared** |
| **Private Subnets** | `borrowbuy-dev-private-ap-south-1{a,b}` | `aws_subnet` | CIDRs `10.0.10.0/24`, `10.0.20.0/24` | \$0.00 | **Declared** |
| **NAT Gateway** | *Omitted to protect budget* | `aws_nat_gateway` | **Disabled** (`count = 0`) | **Saved $32.40/mo** | **Disabled** |
| **Security Group** | `borrowbuy-dev-ec2-host-sg` | `aws_security_group` | Inbound 80/443; egress 0.0.0.0/0 | \$0.00 | **Declared** |
| **IAM Role** | `borrowbuy-dev-ec2-host-role` | `aws_iam_role` | SSM Session Manager + CloudWatch + S3 | \$0.00 | **Declared** |
| **EC2 Instance** | `borrowbuy-dev-docker-host` | `aws_instance` | `t3.micro`, Amazon Linux 2023, 20 GB gp3 | Free Tier | **Declared** |
| **S3 Bucket** | `borrowbuy-dev-assets` | `aws_s3_bucket` | Private, Block Public Access, AES256 | Free Tier | **Declared** |
| **CloudFront** | `borrowbuy-dev-cdn` | `aws_cloudfront_distribution` | HTTPS redirect, OAC, PriceClass_All | Free Tier | **Declared** |
| **SQS Queue** | `borrowbuy-dev-events` | `aws_sqs_queue` | 256 KB max, 4-day retention, SSE enabled | Free Tier | **Declared** |
| **SQS DLQ** | `borrowbuy-dev-events-dlq` | `aws_sqs_queue` | 14-day retention, 3 max receive count | Free Tier | **Declared** |
| **SNS Topic** | `borrowbuy-dev-notifications` | `aws_sns_topic` | Server-side encryption with AWS KMS | Free Tier | **Declared** |
| **CloudWatch Logs** | `/borrowbuy/dev/application` | `aws_cloudwatch_log_group` | 14-day retention policy | Free Tier | **Declared** |
| **AWS Budget** | `borrowbuy-dev-monthly-budget` | `aws_budgets_budget` | \$5.00 limit with 50%, 80%, 100% alerts | Free Tier | **Declared** |
| **ECR Repository** | `borrowbuy-backend` | `aws_ecr_repository` | Tag immutability enabled | Free Tier | **Declared** |
