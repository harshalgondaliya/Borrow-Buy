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

variable "database_name" {
  description = "Name of the default database"
  type        = string
  default     = "borrowbuy_db"
}

variable "database_username" {
  description = "Master username for PostgreSQL"
  type        = string
  default     = "borrowbuy_admin"
}

variable "instance_class" {
  description = "RDS instance class (Free-tier eligible db.t4g.micro or db.t3.micro)"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in gigabytes"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage limit for auto-scaling"
  type        = number
  default     = 50
}

variable "multi_az" {
  description = "Specifies if the RDS instance is multi-AZ (set true for prod)"
  type        = bool
  default     = false
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID restricting access to RDS"
  type        = string
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion (set true for non-prod)"
  type        = bool
  default     = true
}
