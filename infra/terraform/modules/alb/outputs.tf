output "alb_id" {
  value       = aws_lb.main.id
  description = "Application Load Balancer ID"
}

output "alb_arn" {
  value       = aws_lb.main.arn
  description = "Application Load Balancer ARN"
}

output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "Application Load Balancer DNS Name"
}

output "alb_zone_id" {
  value       = aws_lb.main.zone_id
  description = "Application Load Balancer Route53 Canonical Hosted Zone ID"
}

output "target_group_arn" {
  value       = aws_lb_target_group.api.arn
  description = "Target Group ARN for Auto Scaling Group attachment"
}
