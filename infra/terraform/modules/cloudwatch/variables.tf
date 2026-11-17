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

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster to monitor"
  type        = string
  default     = "borrowbuy-cluster"
}

variable "ecs_service_name" {
  description = "Name of the ECS service to monitor"
  type        = string
  default     = "borrowbuy-service"
}

variable "rds_instance_id" {
  description = "Identifier of the RDS database instance to monitor"
  type        = string
  default     = "borrowbuy-postgres"
}

variable "alb_arn_suffix" {
  description = "ARN suffix of the ALB for CloudWatch metrics"
  type        = string
  default     = "app/borrowbuy-alb/1234567890"
}

variable "target_group_arn_suffix" {
  description = "ARN suffix of the ALB Target Group for CloudWatch metrics"
  type        = string
  default     = "targetgroup/borrowbuy-api-tg/1234567890"
}
