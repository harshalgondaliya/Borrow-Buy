output "db_instance_id" {
  description = "The RDS instance identifier"
  value       = aws_db_instance.postgres.id
}

output "db_endpoint" {
  description = "The connection endpoint for the database"
  value       = aws_db_instance.postgres.endpoint
}

output "db_address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "The port on which the DB accepts connections"
  value       = aws_db_instance.postgres.port
}

output "db_name" {
  description = "The database name"
  value       = aws_db_instance.postgres.db_name
}

output "secrets_manager_secret_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "database_url" {
  description = "Full connection URL for PostgreSQL"
  value       = "postgresql://${var.database_username}:${random_password.master_password.result}@${aws_db_instance.postgres.endpoint}/${var.database_name}?sslmode=require"
  sensitive   = true
}
