variable "project_name" {
  type        = string
  description = "Name of the project"
  default     = "BorrowBuy"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "production"
}

variable "enable_point_in_time_recovery" {
  type        = bool
  description = "Enable PITR for production environments"
  default     = false
}
