output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.host.id
}

output "public_ip" {
  description = "The public IPv4 address of the EC2 instance"
  value       = aws_instance.host.public_ip
}

output "public_dns" {
  description = "The public DNS name of the EC2 instance"
  value       = aws_instance.host.public_dns
}

output "security_group_id" {
  description = "Security group ID of the EC2 instance"
  value       = aws_security_group.ec2.id
}

output "instance_profile_arn" {
  description = "IAM instance profile ARN of the EC2 host"
  value       = aws_iam_instance_profile.ec2.arn
}
