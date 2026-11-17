output "sqs_queue_id" {
  description = "The URL of the SQS queue"
  value       = aws_sqs_queue.events.id
}

output "sqs_queue_arn" {
  description = "The ARN of the SQS queue"
  value       = aws_sqs_queue.events.arn
}

output "sqs_dlq_arn" {
  description = "The ARN of the SQS dead-letter queue"
  value       = aws_sqs_queue.events_dlq.arn
}

output "sns_topic_arn" {
  description = "The ARN of the SNS topic"
  value       = aws_sns_topic.notifications.arn
}
