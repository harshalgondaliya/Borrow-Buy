# =============================================================================
# Amazon DynamoDB Table: BorrowBuy-RentalAuditLogs
# Provides immutable audit trails for rental lifecycle events and state locks
# Pay-Per-Request (On-Demand) billing ensures $0 idle cost for academic demo
# =============================================================================

resource "aws_dynamodb_table" "rental_audit_logs" {
  name         = "${var.project_name}-RentalAuditLogs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.enable_point_in_time_recovery
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name        = "${var.project_name}-rental-audit-logs"
    Environment = var.environment
    Service     = "DynamoDB"
  }
}
