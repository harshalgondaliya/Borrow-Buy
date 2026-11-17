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

variable "vpc_id" {
  type        = string
  description = "VPC ID where ALB is deployed"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs spanning at least two AZs"
}

variable "alb_security_group_id" {
  type        = string
  description = "Security Group ID for the ALB"
}

variable "backend_port" {
  type        = number
  description = "Port the backend application listens on"
  default     = 5000
}

variable "health_check_path" {
  type        = string
  description = "Health probe endpoint"
  default     = "/api/health"
}
