variable "project_name" {
  type        = string
  description = "Project name"
  default     = "BorrowBuy"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "production"
}

variable "log_group_arn" {
  type        = string
  description = "CloudWatch log group ARN for API access logs"
}
