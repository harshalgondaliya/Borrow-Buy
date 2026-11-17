output "autoscaling_group_id" {
  value       = aws_autoscaling_group.backend.id
  description = "Auto Scaling Group ID"
}

output "autoscaling_group_name" {
  value       = aws_autoscaling_group.backend.name
  description = "Auto Scaling Group Name"
}

output "launch_template_id" {
  value       = aws_launch_template.backend.id
  description = "Launch Template ID"
}
