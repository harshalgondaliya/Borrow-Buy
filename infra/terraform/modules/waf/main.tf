# =============================================================================
# AWS WAFv2 Web ACL
# Application Layer Threat Protection: Rate Limiting & OWASP Top 10 Mitigation
# =============================================================================

resource "aws_wafv2_web_acl" "main" {
  name        = "${var.project_name}-web-acl-${var.environment}"
  description = "WAF protection for BorrowBuy application"
  scope       = var.scope # REGIONAL for ALB, CLOUDFRONT for CloudFront

  default_action {
    allow {}
  }

  # Rule 1: AWS Managed Common Rule Set (OWASP Top 10)
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: IP-Based Rate Limiting (1000 requests per 5 minutes per IP)
  rule {
    name     = "RateLimit1000Per5Min"
    priority = 2

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-web-acl"
    sampled_requests_enabled   = true
  }

  tags = {
    Name        = "${var.project_name}-waf-acl"
    Environment = var.environment
    Service     = "WAFv2"
  }
}
