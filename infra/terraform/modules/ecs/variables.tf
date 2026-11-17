variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "borrowbuy"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region for logging and cloud integrations"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "The VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group for the ALB"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group for ECS tasks"
  type        = string
}

variable "execution_role_arn" {
  description = "IAM role ARN for ECS task execution"
  type        = string
}

variable "task_role_arn" {
  description = "IAM role ARN for ECS task runtime"
  type        = string
}

variable "container_image" {
  description = "Docker image URI for the backend service"
  type        = string
  default     = "public.ecr.aws/docker/library/node:22-alpine"
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 5000
}

variable "cpu" {
  description = "Fargate CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Fargate memory in MiB (512 = 0.5 GB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of running container instances"
  type        = number
  default     = 1
}

variable "log_group_name" {
  description = "CloudWatch log group name for container logs"
  type        = string
  default     = ""
}

variable "s3_bucket_name" {
  description = "S3 bucket name for uploads"
  type        = string
  default     = ""
}

variable "database_url" {
  description = "Database connection string or reference"
  type        = string
  default     = ""
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret used to sign JWT authentication tokens"
  type        = string
  default     = "production-aws-jwt-secret-borrowbuy-2026-secure"
  sensitive   = true
}
