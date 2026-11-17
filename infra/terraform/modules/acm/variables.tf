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

variable "enable_custom_domain" {
  type        = bool
  description = "Whether to provision an ACM certificate for a custom domain"
  default     = false
}

variable "domain_name" {
  type        = string
  description = "Apex domain name (e.g. borrowbuy.in)"
  default     = "borrowbuy.in"
}
