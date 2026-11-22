# =============================================================================
# BorrowBuy – Master Cloud Infrastructure Root Module
# Enterprise Hybrid Architecture: 16 AWS Cloud Services
# Supports Profile A (Low-Cost Academic Baseline) & Profile B (Multi-AZ Production)
# =============================================================================

# -----------------------------------------------------------------------------
# 1. Amazon Virtual Private Cloud (VPC)
# Multi-AZ Network across ap-south-1a & ap-south-1b
# -----------------------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = true
}

# -----------------------------------------------------------------------------
# 2. Amazon S3 Storage
# Equipment Photos, Uploads, SPA Assets & Pre-signed URL Store
# -----------------------------------------------------------------------------
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 3. AWS IAM & Security Groups
# Least-privilege roles, instance profiles, and strict SG ingress/egress rules
# -----------------------------------------------------------------------------
module "security" {
  source = "./modules/security"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  container_port = 5000
  s3_bucket_arn  = module.s3.bucket_arn
}

# -----------------------------------------------------------------------------
# 4. Amazon CloudWatch
# Observability Dashboard, Compute Alarms, 5XX Monitors & API Log Groups
# -----------------------------------------------------------------------------
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name    = var.project_name
  environment     = var.environment
  aws_region      = var.aws_region
  deploy_mode     = var.deploy_mode
  ec2_instance_id = length(module.ec2) > 0 ? module.ec2[0].instance_id : ""
  enable_rds      = var.enable_rds
  enable_alb      = var.enable_alb
  rds_instance_id = length(module.rds) > 0 ? module.rds[0].db_instance_id : ""
  alb_arn_suffix  = length(module.alb) > 0 ? module.alb[0].alb_arn : ""
}

# -----------------------------------------------------------------------------
# 5. Amazon SQS & SNS
# Asynchronous Booking Event Queues & In-App / SMS / Email Notifications
# -----------------------------------------------------------------------------
module "messaging" {
  source = "./modules/messaging"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 6. AWS Budgets & Cost Safeguard
# Automated budget tracking with alert thresholds at 50%, 80%, and 100%
# -----------------------------------------------------------------------------
module "budgets" {
  source = "./modules/budgets"

  project_name               = var.project_name
  environment                = var.environment
  monthly_budget_amount      = var.monthly_budget_amount
  subscriber_email_addresses = [var.budget_notification_email]
}

# -----------------------------------------------------------------------------
# 7. Amazon EC2 Docker Host (Profile A: Academic Free Tier Baseline)
# Single t3.micro/t2.micro host running Docker Compose (Express + Postgres + Nginx)
# -----------------------------------------------------------------------------
module "ec2" {
  count  = var.deploy_mode == "ec2" ? 1 : 0
  source = "./modules/ec2"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_id      = module.vpc.public_subnet_ids[0]
  instance_type  = var.ec2_instance_type
  s3_bucket_name = module.s3.bucket_id
  s3_bucket_arn  = module.s3.bucket_arn
}

# -----------------------------------------------------------------------------
# 8. Amazon RDS PostgreSQL (Profile B: Managed Relational Database)
# -----------------------------------------------------------------------------
module "rds" {
  count  = var.enable_rds ? 1 : 0
  source = "./modules/rds"

  project_name        = var.project_name
  environment         = var.environment
  instance_class      = var.rds_instance_class
  multi_az            = var.rds_multi_az
  private_subnet_ids  = module.vpc.private_subnet_ids
  security_group_id   = module.security.rds_security_group_id
  skip_final_snapshot = true
}

# -----------------------------------------------------------------------------
# 9. Amazon CloudFront Global CDN
# Global Edge Caching, Origin Access Control & SSL/TLS Termination
# -----------------------------------------------------------------------------
module "cloudfront" {
  source = "./modules/cloudfront"

  project_name          = var.project_name
  environment           = var.environment
  s3_bucket_domain_name = module.s3.bucket_regional_domain_name
  s3_bucket_arn         = module.s3.bucket_arn
  alb_dns_name          = var.deploy_mode == "ec2" ? (length(module.ec2) > 0 ? module.ec2[0].public_dns : "") : ""
}

# -----------------------------------------------------------------------------
# 10. Amazon DynamoDB Table
# Immutable Rental Audit Logs & State Locks (Pay-Per-Request, $0 Idle Cost)
# -----------------------------------------------------------------------------
module "dynamodb" {
  count  = var.enable_serverless ? 1 : 0
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 11. Amazon Cognito User Pool & App Client
# Managed User Authentication with PKCE & Token Verification Adapter
# -----------------------------------------------------------------------------
module "cognito" {
  count  = var.enable_serverless ? 1 : 0
  source = "./modules/cognito"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 12. AWS Lambda & Amazon EventBridge
# Serverless Rental Quotes Engine & 15-Minute Reservation Hold Sweeper
# -----------------------------------------------------------------------------
module "lambda" {
  count  = var.enable_serverless ? 1 : 0
  source = "./modules/lambda"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 13. Amazon API Gateway (HTTP API v2)
# Serverless Ingress for Lambda Execution Sandbox
# -----------------------------------------------------------------------------
module "apigateway" {
  count  = var.enable_serverless ? 1 : 0
  source = "./modules/apigateway"

  project_name  = var.project_name
  environment   = var.environment
  log_group_arn = module.cloudwatch.api_log_group_arn
}

# -----------------------------------------------------------------------------
# 14. Application Load Balancer (ALB) (Profile B: Multi-AZ Enterprise Ingress)
# -----------------------------------------------------------------------------
module "alb" {
  count  = var.enable_alb ? 1 : 0
  source = "./modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  backend_port          = 5000
}

# -----------------------------------------------------------------------------
# 15. EC2 Auto Scaling Group (Profile B: Horizontal Elasticity)
# -----------------------------------------------------------------------------
module "autoscaling" {
  count  = var.enable_autoscaling ? 1 : 0
  source = "./modules/autoscaling"

  project_name               = var.project_name
  environment                = var.environment
  subnet_ids                 = module.vpc.public_subnet_ids
  target_group_arn           = length(module.alb) > 0 ? module.alb[0].target_group_arn : ""
  instance_security_group_id = length(module.ec2) > 0 ? module.ec2[0].security_group_id : module.security.ecs_tasks_security_group_id
  instance_profile_arn       = length(module.ec2) > 0 ? module.ec2[0].instance_profile_arn : ""
}

# -----------------------------------------------------------------------------
# 16. AWS WAFv2 (Web Application Firewall)
# -----------------------------------------------------------------------------
module "waf" {
  count  = var.enable_waf ? 1 : 0
  source = "./modules/waf"

  project_name = var.project_name
  environment  = var.environment
  scope        = "REGIONAL"
}

# -----------------------------------------------------------------------------
# 17. AWS Certificate Manager (ACM)
# -----------------------------------------------------------------------------
module "acm" {
  count  = var.enable_custom_domain ? 1 : 0
  source = "./modules/acm"

  project_name         = var.project_name
  environment          = var.environment
  enable_custom_domain = var.enable_custom_domain
  domain_name          = var.domain_name
}

# -----------------------------------------------------------------------------
# 18. AWS Client VPN
# -----------------------------------------------------------------------------
module "vpn" {
  count  = var.enable_vpn ? 1 : 0
  source = "./modules/vpn"

  project_name     = var.project_name
  environment      = var.environment
  enable_vpn       = var.enable_vpn
  target_subnet_id = module.vpc.private_subnet_ids[0]
}
