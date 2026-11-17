output "web_acl_id" {
  value       = aws_wafv2_web_acl.main.id
  description = "WAF Web ACL ID"
}

output "web_acl_arn" {
  value       = aws_wafv2_web_acl.main.arn
  description = "WAF Web ACL ARN"
}
