output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.system_dashboard.dashboard_name
}

output "ec2_cpu_alarm_arn" {
  description = "ARN of the EC2 CPU alarm"
  value       = length(aws_cloudwatch_metric_alarm.ec2_cpu_high) > 0 ? aws_cloudwatch_metric_alarm.ec2_cpu_high[0].arn : ""
}

output "ec2_status_check_alarm_arn" {
  description = "ARN of the EC2 Status Check alarm"
  value       = length(aws_cloudwatch_metric_alarm.ec2_status_check) > 0 ? aws_cloudwatch_metric_alarm.ec2_status_check[0].arn : ""
}

output "ecs_cpu_alarm_arn" {
  description = "ARN of the ECS CPU alarm"
  value       = length(aws_cloudwatch_metric_alarm.ecs_cpu_high) > 0 ? aws_cloudwatch_metric_alarm.ecs_cpu_high[0].arn : ""
}

output "rds_storage_alarm_arn" {
  description = "ARN of the RDS storage alarm"
  value       = length(aws_cloudwatch_metric_alarm.rds_storage_low) > 0 ? aws_cloudwatch_metric_alarm.rds_storage_low[0].arn : ""
}

output "api_log_group_arn" {
  description = "ARN of the API log group"
  value       = aws_cloudwatch_log_group.api_logs.arn
}

output "api_log_group_name" {
  description = "Name of the API log group"
  value       = aws_cloudwatch_log_group.api_logs.name
}
