# =============================================================================
# AWS Certificate Manager (ACM)
# Free Managed SSL/TLS Certificates with Automated Renewal
# =============================================================================

resource "aws_acm_certificate" "cert" {
  count             = var.enable_custom_domain ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-tls-cert"
    Environment = var.environment
    Service     = "ACM"
  }
}
