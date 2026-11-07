output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = module.vpc.vpc_id
}

output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = module.rds.db_endpoint
}

output "s3_bucket_name" {
  description = "S3 assets bucket name"
  value       = module.s3.bucket_id
}

output "alb_dns_name" {
  description = "Application Load Balancer public DNS name"
  value       = module.ecs.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution public domain name"
  value       = module.cloudfront.distribution_domain_name
}

output "cloudwatch_dashboard_name" {
  description = "Name of the system observability dashboard"
  value       = module.cloudwatch.dashboard_name
}
