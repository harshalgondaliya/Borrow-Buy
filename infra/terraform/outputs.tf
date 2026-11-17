# =============================================================================
# BorrowBuy – Master Cloud Infrastructure Outputs (16 AWS Services)
# =============================================================================

# 1. Amazon VPC
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

# 2. Amazon S3
output "s3_bucket_name" {
  description = "Name of the S3 storage bucket"
  value       = module.s3.bucket_id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 storage bucket"
  value       = module.s3.bucket_arn
}

# 3. Amazon CloudFront
output "cloudfront_distribution_domain" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.distribution_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

# 4. Amazon CloudWatch
output "cloudwatch_dashboard_name" {
  description = "CloudWatch System Dashboard Name"
  value       = module.cloudwatch.dashboard_name
}

output "cloudwatch_api_log_group_arn" {
  description = "CloudWatch Log Group ARN for API logging"
  value       = module.cloudwatch.api_log_group_arn
}

# 5. Amazon SQS & SNS
output "sqs_queue_url" {
  description = "URL of the Amazon SQS Event Queue"
  value       = module.messaging.sqs_queue_id
}

output "sns_topic_arn" {
  description = "ARN of the Amazon SNS Notifications Topic"
  value       = module.messaging.sns_topic_arn
}

# 6. AWS Budgets
output "monthly_budget_id" {
  description = "AWS Budget ID for cost monitoring"
  value       = module.budgets.budget_id
}

# 7. Amazon EC2
output "ec2_public_ip" {
  description = "Public IPv4 address of the EC2 Docker host"
  value       = length(module.ec2) > 0 ? module.ec2[0].public_ip : "N/A"
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 Docker host"
  value       = length(module.ec2) > 0 ? module.ec2[0].public_dns : "N/A"
}

# 8. Amazon DynamoDB
output "dynamodb_table_name" {
  description = "DynamoDB Rental Audit Logs Table Name"
  value       = length(module.dynamodb) > 0 ? module.dynamodb[0].table_name : "N/A"
}

output "dynamodb_table_arn" {
  description = "DynamoDB Rental Audit Logs Table ARN"
  value       = length(module.dynamodb) > 0 ? module.dynamodb[0].table_arn : "N/A"
}

# 9. Amazon Cognito
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = length(module.cognito) > 0 ? module.cognito[0].user_pool_id : "N/A"
}

output "cognito_client_id" {
  description = "Cognito App Client ID"
  value       = length(module.cognito) > 0 ? module.cognito[0].user_pool_client_id : "N/A"
}

# 10. AWS Lambda
output "lambda_quote_calculator_arn" {
  description = "Quote Calculator Lambda Function ARN"
  value       = length(module.lambda) > 0 ? module.lambda[0].quote_calculator_arn : "N/A"
}

output "lambda_hold_sweeper_arn" {
  description = "Hold Sweeper Lambda Function ARN"
  value       = length(module.lambda) > 0 ? module.lambda[0].hold_sweeper_arn : "N/A"
}

# 11. Amazon API Gateway
output "api_gateway_endpoint" {
  description = "HTTP API Gateway Endpoint URL"
  value       = length(module.apigateway) > 0 ? module.apigateway[0].api_endpoint : "N/A"
}

# 12. Application Load Balancer
output "alb_dns_name" {
  description = "Application Load Balancer DNS Name"
  value       = length(module.alb) > 0 ? module.alb[0].alb_dns_name : "N/A"
}

# 13. Auto Scaling Group
output "autoscaling_group_name" {
  description = "EC2 Auto Scaling Group Name"
  value       = length(module.autoscaling) > 0 ? module.autoscaling[0].autoscaling_group_name : "N/A"
}

# 14. AWS WAF
output "waf_web_acl_arn" {
  description = "AWS WAF Web ACL ARN"
  value       = length(module.waf) > 0 ? module.waf[0].web_acl_arn : "N/A"
}

# 15. AWS Certificate Manager
output "acm_certificate_arn" {
  description = "ACM TLS Certificate ARN"
  value       = length(module.acm) > 0 ? module.acm[0].certificate_arn : "N/A"
}

# 16. AWS Client VPN
output "vpn_endpoint_id" {
  description = "AWS Client VPN Endpoint ID"
  value       = length(module.vpn) > 0 ? module.vpn[0].vpn_endpoint_id : "N/A"
}
