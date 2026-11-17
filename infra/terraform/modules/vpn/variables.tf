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

variable "enable_vpn" {
  type        = bool
  description = "Whether to provision the Client VPN endpoint (has hourly endpoint charges)"
  default     = false
}

variable "server_certificate_arn" {
  type        = string
  description = "ACM server certificate ARN"
  default     = ""
}

variable "client_certificate_arn" {
  type        = string
  description = "ACM root CA certificate ARN"
  default     = ""
}

variable "client_cidr_block" {
  type        = string
  description = "CIDR block for VPN clients"
  default     = "10.100.0.0/22"
}

variable "target_subnet_id" {
  type        = string
  description = "Subnet ID to associate with the VPN endpoint"
  default     = ""
}

variable "target_network_cidr" {
  type        = string
  description = "Target network CIDR to authorize"
  default     = "10.0.0.0/16"
}

variable "cloudwatch_log_group_name" {
  type        = string
  description = "CloudWatch log group for VPN connection logs"
  default     = ""
}

variable "cloudwatch_log_stream_name" {
  type        = string
  description = "CloudWatch log stream for VPN connection logs"
  default     = ""
}
