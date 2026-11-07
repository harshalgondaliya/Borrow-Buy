# -----------------------------------------------------------------------------
# Master Password Generation
# -----------------------------------------------------------------------------
resource "random_password" "master_password" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# -----------------------------------------------------------------------------
# DB Subnet Group (Spanning Private Subnets across Multi-AZ)
# -----------------------------------------------------------------------------
resource "aws_db_subnet_group" "rds" {
  name        = "${var.project_name}-${var.environment}-db-subnet-group"
  description = "Subnet group for BorrowBuy PostgreSQL instance"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# -----------------------------------------------------------------------------
# DB Parameter Group (Enforce SSL / TLS connections)
# -----------------------------------------------------------------------------
resource "aws_db_parameter_group" "rds_pg16" {
  name        = "${var.project_name}-${var.environment}-pg16-params"
  family      = "postgres16"
  description = "Custom parameter group enforcing SSL connection requirements"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-pg16-params"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# -----------------------------------------------------------------------------
# Amazon RDS PostgreSQL 16 Instance
# -----------------------------------------------------------------------------
resource "aws_db_instance" "postgres" {
  identifier                  = "${var.project_name}-${var.environment}-pg16"
  engine                      = "postgres"
  engine_version              = "16.4"
  instance_class              = var.instance_class
  allocated_storage           = var.allocated_storage
  max_allocated_storage       = var.max_allocated_storage
  storage_type                = "gp3"
  storage_encrypted           = true
  multi_az                    = var.multi_az
  publicly_accessible         = false

  db_name                     = var.database_name
  username                    = var.database_username
  password                    = random_password.master_password.result
  port                        = 5432

  db_subnet_group_name        = aws_db_subnet_group.rds.name
  vpc_security_group_ids      = [var.security_group_id]
  parameter_group_name        = aws_db_parameter_group.rds_pg16.name

  backup_retention_period     = var.environment == "prod" ? 7 : 1
  backup_window               = "03:00-04:00"
  maintenance_window          = "Mon:04:30-Mon:05:30"
  auto_minor_version_upgrade  = true
  deletion_protection         = var.environment == "prod"
  skip_final_snapshot         = var.skip_final_snapshot

  tags = {
    Name        = "${var.project_name}-${var.environment}-pg16"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# -----------------------------------------------------------------------------
# AWS Secrets Manager Secret for DB Credentials
# -----------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}-${var.environment}-db-credentials-v2"
  description             = "PostgreSQL master connection credentials for BorrowBuy backend"
  recovery_window_in_days = 0

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials_val" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    engine   = "postgres"
    host     = aws_db_instance.postgres.address
    port     = aws_db_instance.postgres.port
    username = var.database_username
    password = random_password.master_password.result
    database = var.database_name
    url      = "postgresql://${var.database_username}:${random_password.master_password.result}@${aws_db_instance.postgres.endpoint}/${var.database_name}?sslmode=require"
  })
}
