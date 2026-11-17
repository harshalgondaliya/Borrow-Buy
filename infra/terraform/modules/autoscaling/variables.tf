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

variable "instance_type" {
  type        = string
  description = "EC2 instance type for ASG workers"
  default     = "t3.micro"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for Auto Scaling Group deployment"
}

variable "target_group_arn" {
  type        = string
  description = "ALB target group ARN"
}

variable "instance_security_group_id" {
  type        = string
  description = "Security group ID for ASG EC2 instances"
}

variable "instance_profile_arn" {
  type        = string
  description = "IAM instance profile ARN for EC2 instances"
}

variable "min_size" {
  type        = number
  description = "Minimum number of instances"
  default     = 1
}

variable "max_size" {
  type        = number
  description = "Maximum number of instances"
  default     = 3
}

variable "desired_capacity" {
  type        = number
  description = "Desired number of instances"
  default     = 1
}

variable "associate_public_ip" {
  type        = bool
  description = "Whether to assign a public IP address"
  default     = true
}
