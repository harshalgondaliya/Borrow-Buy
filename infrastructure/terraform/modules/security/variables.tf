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

variable "vpc_id" {
  description = "The VPC ID where security groups will be created"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the backend container"
  type        = number
  default     = 5000
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 asset bucket for IAM task permissions"
  type        = string
  default     = ""
}
