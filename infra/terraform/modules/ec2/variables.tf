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

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_id" {
  description = "Public Subnet ID for the EC2 host"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type (Free Tier eligible t3.micro or t4g.small)"
  type        = string
  default     = "t3.micro"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for uploads"
  type        = string
  default     = ""
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN"
  type        = string
  default     = ""
}
