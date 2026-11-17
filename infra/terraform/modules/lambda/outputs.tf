output "quote_calculator_arn" {
  value       = aws_lambda_function.quote_calculator.arn
  description = "Rental Quote Calculator Lambda ARN"
}

output "hold_sweeper_arn" {
  value       = aws_lambda_function.hold_sweeper.arn
  description = "Hold Sweeper Lambda ARN"
}

output "eventbridge_rule_arn" {
  value       = aws_cloudwatch_event_rule.sweep_schedule.arn
  description = "EventBridge Cron Rule ARN"
}
