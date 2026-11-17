# -----------------------------------------------------------------------------
# Amazon SQS: Dead Letter Queue (DLQ)
# -----------------------------------------------------------------------------
resource "aws_sqs_queue" "events_dlq" {
  name                      = "${var.project_name}-${var.environment}-events-dlq"
  message_retention_seconds = 1209600 # 14 days retention for inspection
  sqs_managed_sse_enabled   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-events-dlq"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# -----------------------------------------------------------------------------
# Amazon SQS: Main Asynchronous Event Queue
# -----------------------------------------------------------------------------
resource "aws_sqs_queue" "events" {
  name                       = "${var.project_name}-${var.environment}-events"
  delay_seconds              = 0
  max_message_size           = 262144 # 256 KB
  message_retention_seconds  = 345600 # 4 days
  receive_wait_time_seconds  = 10     # Long polling enabled
  visibility_timeout_seconds = 60
  sqs_managed_sse_enabled    = true

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.events_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-events"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# -----------------------------------------------------------------------------
# Amazon SNS: Platform Notification Topic
# -----------------------------------------------------------------------------
resource "aws_sns_topic" "notifications" {
  name              = "${var.project_name}-${var.environment}-notifications"
  kms_master_key_id = "alias/aws/sns"

  tags = {
    Name        = "${var.project_name}-${var.environment}-notifications"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
