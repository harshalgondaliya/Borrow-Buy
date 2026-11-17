variable "aws_region" {
  description = "AWS region for deploying cloud infrastructure (Asia Pacific - Mumbai)"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name prefix for all resources"
  type        = string
  default     = "borrowbuy"
}

variable "environment" {
  description = "Deployment environment tier (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to deploy infrastructure"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "deploy_mode" {
  description = "Deployment target mode: 'ec2' (Student Budget Free Tier Baseline) or 'ecs' (Enterprise Fargate + ALB)"
  type        = string
  default     = "ec2"
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway (Disabled by default to save $32.40/month recurring student cost)"
  type        = bool
  default     = false
}

variable "enable_rds" {
  description = "Enable Managed Amazon RDS PostgreSQL (Disabled by default to prioritize EC2 Docker PostgreSQL and save $18/month)"
  type        = bool
  default     = false
}

variable "ec2_instance_type" {
  description = "EC2 instance class for Docker host (Free Tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "rds_instance_class" {
  description = "Instance class for RDS PostgreSQL if enabled"
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ replication (Must remain false for student budget)"
  type        = bool
  default     = false
}

variable "container_image" {
  description = "Container image URI for backend"
  type        = string
  default     = "node:22-alpine"
}

variable "jwt_secret" {
  description = "JWT encryption secret key"
  type        = string
  default     = "production-aws-jwt-secret-borrowbuy-2026-secure"
  sensitive   = true
}

variable "monthly_budget_amount" {
  description = "Monthly spending threshold in USD for AWS Budgets alarm"
  type        = string
  default     = "5.0"
}

variable "budget_notification_email" {
  description = "Email address for AWS Budgets cost alerts"
  type        = string
  default     = "student@borrowbuy.in"
}


variable "enable_alb" {
  description = "Enable Application Load Balancer (Profile B: Multi-AZ Production). False for Profile A Free Tier baseline."
  type        = bool
  default     = false
}

variable "enable_autoscaling" {
  description = "Enable EC2 Auto Scaling Group with Target Tracking (Profile B). False for Profile A single EC2 Docker host."
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Enable AWS WAFv2 Web ACL for ALB / CloudFront rate limiting and OWASP rules"
  type        = bool
  default     = false
}

variable "enable_vpn" {
  description = "Enable AWS Client VPN endpoint for private subnet access"
  type        = bool
  default     = false
}

variable "enable_custom_domain" {
  description = "Enable ACM TLS certificate for custom domain"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain name for ACM certificate"
  type        = string
  default     = "borrowbuy.in"
}

variable "enable_serverless" {
  description = "Enable serverless modules (DynamoDB, Lambda, Cognito, API Gateway) which incur $0 idle cost"
  type        = bool
  default     = true
}
