output "table_name" {
  value       = aws_dynamodb_table.rental_audit_logs.name
  description = "DynamoDB rental audit logs table name"
}

output "table_arn" {
  value       = aws_dynamodb_table.rental_audit_logs.arn
  description = "DynamoDB rental audit logs table ARN"
}
