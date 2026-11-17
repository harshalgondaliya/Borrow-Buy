output "api_id" {
  value       = aws_apigatewayv2_api.http_api.id
  description = "HTTP API Gateway ID"
}

output "api_endpoint" {
  value       = aws_apigatewayv2_api.http_api.api_endpoint
  description = "HTTP API Gateway endpoint URL"
}

output "api_execution_arn" {
  value       = aws_apigatewayv2_api.http_api.execution_arn
  description = "HTTP API Gateway execution ARN for Lambda permissions"
}
