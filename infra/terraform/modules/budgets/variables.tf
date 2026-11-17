variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "borrowbuy"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "monthly_budget_amount" {
  description = "Monthly budget limit in USD"
  type        = string
  default     = "5.0"
}

variable "subscriber_email_addresses" {
  description = "Email addresses for budget notifications"
  type        = list(string)
  default     = ["student@borrowbuy.in"]
}
