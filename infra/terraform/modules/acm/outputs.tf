output "certificate_arn" {
  value       = length(aws_acm_certificate.cert) > 0 ? aws_acm_certificate.cert[0].arn : null
  description = "ACM Certificate ARN"
}

output "domain_validation_options" {
  value       = length(aws_acm_certificate.cert) > 0 ? aws_acm_certificate.cert[0].domain_validation_options : []
  description = "DNS validation options for domain verification"
}
