# BORROWBUY — INFRASTRUCTURE RECONCILIATION & IAC ARCHITECTURE

**Document Version:** 2.0.0  
**Verification Date:** November 22, 2026  
**Status:** Reconciled & Validated  

---

## 1. Context & Architectural Reconciliation

The BorrowBuy platform was initially conceptualized with two infrastructure profiles:
- **Profile A (Academic Free/Low-Cost Baseline):** A monolithic/containerized deployment hosting Express API + PostgreSQL + Nginx on a single EC2 host with EBS persistent storage, integrated with AWS S3, CloudWatch, SQS, Lambda, IAM, and VPC.
- **Profile B (Enterprise Multi-AZ Production):** A decoupled container architecture with ECS Fargate tasks, Multi-AZ Amazon RDS PostgreSQL, Application Load Balancers, CloudFront CDN, AWS WAF, and Client VPN.

### Critical Reconciliation Findings
1. **Target Region:** Reconciled definitively to **`ap-south-1` (Mumbai)**. All IAM policies, VPC networking, EC2 host, and Terraform module defaults are aligned to Mumbai.
2. **Current Live State:** The Mumbai account (`767579108846`) already possesses:
   - VPC: `vpc-0cbfb3929d621f2db` (4 subnets across AZ 1a and 1b, IGW attached)
   - EC2 Host: `i-03347c2b6584c73cb` (`borrowbuy-dev-ec2`, `t3.small`)
   - EBS Volume: `vol-0e48159e9bb02b52c` (20 GiB gp3, KMS encrypted)
   - AWS Budget: `BorrowBuy-Monthly-Budget` (\$5.00 ceiling, \$0.00 spent)
   - IAM Instance Profile: `BorrowBuy-EC2-SSM-Role`
3. **Terraform Root Module State:**
   - Terraform root configuration is set to Profile A (`deploy_mode = "ec2"`).
   - Resources that incur high ongoing charges in Profile B (NAT Gateway, Application Load Balancer, RDS DB Instance, Client VPN) are guarded by conditional `count = 0` toggles in Profile A.
   - `terraform validate` and `terraform fmt -check` pass with exit code 0.

---

## 2. Infrastructure-as-Code Module Inventory

The repository contains 18 dedicated Terraform modules in `infra/terraform/modules/`:

| Module Directory | Primary AWS Resources | Active in Profile A? | Active in Profile B? | Cost Impact (Profile A) |
|---|---|:---:|:---:|---|
| `modules/vpc` | `aws_vpc`, `aws_subnet`, `aws_internet_gateway`, `aws_nat_gateway` | Yes (NAT disabled) | Yes (NAT enabled) | \$0.00 / mo |
| `modules/s3` | `aws_s3_bucket`, `aws_s3_bucket_versioning`, `aws_s3_bucket_server_side_encryption_configuration` | Yes | Yes | < \$0.05 / mo |
| `modules/security` | `aws_security_group`, `aws_iam_role`, `aws_iam_instance_profile` | Yes | Yes | \$0.00 / mo |
| `modules/cloudwatch` | `aws_cloudwatch_metric_alarm` (EC2 CPU, status check), `aws_cloudwatch_dashboard` | Yes | Yes | \$0.00 / mo (Free Tier) |
| `modules/messaging` | `aws_sqs_queue` (booking events, DLQ), `aws_sns_topic` | Yes | Yes | \$0.00 / mo (Free Tier) |
| `modules/budgets` | `aws_budgets_budget` (\$5 limit with 50/80/100% threshold notifications) | Yes | Yes | \$0.00 / mo (Free Tier) |
| `modules/ec2` | `aws_instance` (`t3.small` / `t3.micro`), `aws_eip` | Yes | No (uses ECS) | ~\$11.27 / mo |
| `modules/rds` | `aws_db_instance` (PostgreSQL 15), `aws_db_subnet_group` | **No** (`count = 0`) | Yes | \$0.00 / mo |
| `modules/alb` | `aws_lb`, `aws_lb_target_group`, `aws_lb_listener` | **No** (`count = 0`) | Yes | \$0.00 / mo |
| `modules/ecs` | `aws_ecs_cluster`, `aws_ecs_service`, `aws_ecs_task_definition` | **No** (`count = 0`) | Yes | \$0.00 / mo |
| `modules/cloudfront`| `aws_cloudfront_distribution`, `aws_cloudfront_origin_access_control` | Optional | Yes | \$0.00 / mo |
| `modules/lambda` | `aws_lambda_function`, `aws_cloudwatch_event_rule` | Optional/Simulated | Yes | \$0.00 / mo |
| `modules/dynamodb` | `aws_dynamodb_table` (PAY_PER_REQUEST billing) | Optional/Simulated | Yes | \$0.00 / mo |
| `modules/cognito` | `aws_cognito_user_pool`, `aws_cognito_user_pool_client` | Optional/Simulated | Yes | \$0.00 / mo |
| `modules/apigateway`| `aws_apigatewayv2_api`, `aws_apigatewayv2_stage` | Optional/Simulated | Yes | \$0.00 / mo |
| `modules/autoscaling`| `aws_autoscaling_group`, `aws_launch_template` | **No** (`count = 0`) | Yes | \$0.00 / mo |
| `modules/waf` | `aws_wafv2_web_acl` | **No** (`count = 0`) | Yes | \$0.00 / mo |
| `modules/acm` | `aws_acm_certificate` | **No** (`count = 0`) | Yes | \$0.00 / mo |
| `modules/vpn` | `aws_ec2_client_vpn_endpoint`, `aws_ec2_client_vpn_network_association` | **No** (`count = 0`) | Yes | \$0.00 / mo |

---

## 3. Safe IaC State Management Strategy

Because the AWS account already contains the live VPC (`vpc-0cbfb3929d621f2db`) and EC2 instance (`i-03347c2b6584c73cb`), running a blind `terraform apply` without state synchronization would attempt to create duplicate resources or fail with CIDR conflict errors.

### Safe Terraform Integration Paths:
1. **Terraform Data Sources (Recommended for Non-Destructive Operation):**
   Referencing existing VPC and Subnets via `data "aws_vpc" "existing"` ensures Terraform manages only application-level resources (S3, CloudWatch alarms, SQS) while leaving the existing network and instance untouched.
2. **Terraform Import:**
   The live resources can be imported into the local `terraform.tfstate` using:
   ```bash
   terraform import module.vpc.aws_vpc.main vpc-0cbfb3929d621f2db
   terraform import module.vpc.aws_internet_gateway.igw igw-05e9ddf2c3f79846f
   terraform import 'module.vpc.aws_subnet.public[0]' subnet-0ca0dd3ae36f6e293
   terraform import 'module.vpc.aws_subnet.public[1]' subnet-0fa721f9011eae4d7
   terraform import 'module.vpc.aws_subnet.private[0]' subnet-09c327f11994e9743
   terraform import 'module.vpc.aws_subnet.private[1]' subnet-0cffe057630e66592
   ```

---

## 4. Architectural Verification Matrix Summary

- **Local Development & Testing:** 100% verified (all 103 backend Vitest tests pass; Vite frontend builds cleanly).
- **Terraform Codebase:** 100% valid syntax, formatted according to HashiCorp standards, with conditional logic ensuring Profile A does not provision paid Profile B resources.
- **AWS Infrastructure:** 5 services verified live in `ap-south-1`; 4 services verified locally in code and IaC.
