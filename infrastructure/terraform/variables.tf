variable "aws_region" {
  description = "AWS region for deploying cloud infrastructure"
  type        = string
  default     = "us-east-1"
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
  description = "Availability zones to deploy multi-AZ infrastructure"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "rds_instance_class" {
  description = "Instance class for RDS PostgreSQL (Free-Tier eligible db.t4g.micro or db.t3.micro)"
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ replication for production redundancy"
  type        = bool
  default     = false
}

variable "container_image" {
  description = "ECR image URI for backend container"
  type        = string
  default     = "public.ecr.aws/docker/library/node:22-alpine"
}

variable "fargate_cpu" {
  description = "Fargate CPU units"
  type        = number
  default     = 256
}

variable "fargate_memory" {
  description = "Fargate memory allocation (MB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of desired backend tasks"
  type        = number
  default     = 1
}

variable "jwt_secret" {
  description = "JWT encryption secret key"
  type        = string
  default     = "production-aws-jwt-secret-borrowbuy-2026-secure"
  sensitive   = true
}
