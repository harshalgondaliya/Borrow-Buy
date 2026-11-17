output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.system_dashboard.dashboard_name
}

output "ecs_cpu_alarm_arn" {
  description = "ARN of the ECS CPU alarm"
  value       = aws_cloudwatch_metric_alarm.ecs_cpu_high.arn
}

output "rds_storage_alarm_arn" {
  description = "ARN of the RDS storage alarm"
  value       = aws_cloudwatch_metric_alarm.rds_storage_low.arn
}

output "api_log_group_arn" {
  description = "ARN of the API log group"
  value       = aws_cloudwatch_log_group.api_logs.arn
}

output "api_log_group_name" {
  description = "Name of the API log group"
  value       = aws_cloudwatch_log_group.api_logs.name
}
