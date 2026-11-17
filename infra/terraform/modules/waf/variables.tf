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

variable "scope" {
  type        = string
  description = "WAF scope: REGIONAL (for ALB) or CLOUDFRONT (must be us-east-1)"
  default     = "REGIONAL"
}
