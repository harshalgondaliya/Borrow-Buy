# -----------------------------------------------------------------------------
# Metric Alarm: EC2 High CPU Utilization (Profile A: Academic Baseline)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  count               = var.deploy_mode == "ec2" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-ec2-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers when EC2 Docker host CPU utilization exceeds 80% for 10 minutes"

  dimensions = {
    InstanceId = var.ec2_instance_id
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Tier        = "Profile-A"
  }
}

# -----------------------------------------------------------------------------
# Metric Alarm: EC2 Status Check Failed (Profile A: Academic Baseline)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ec2_status_check" {
  count               = var.deploy_mode == "ec2" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-ec2-status-check-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "Triggers when EC2 Docker host fails system or instance status checks"

  dimensions = {
    InstanceId = var.ec2_instance_id
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Tier        = "Profile-A"
  }
}

# -----------------------------------------------------------------------------
# Metric Alarm: ECS High CPU Utilization (Profile B: Conditional)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  count               = var.deploy_mode == "ecs" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers when ECS backend container CPU utilization exceeds 80% for 10 minutes"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Tier        = "Profile-B"
  }
}

# -----------------------------------------------------------------------------
# Metric Alarm: ECS High Memory Utilization (Profile B: Conditional)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  count               = var.deploy_mode == "ecs" ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-ecs-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggers when ECS backend container Memory utilization exceeds 80% for 10 minutes"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Tier        = "Profile-B"
  }
}

# -----------------------------------------------------------------------------
# Metric Alarm: RDS Low Storage Space (Profile B: Conditional)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  count               = var.enable_rds ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2147483648 # 2 GB in bytes
  alarm_description   = "Triggers when PostgreSQL RDS instance has less than 2 GB free disk storage"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Tier        = "Profile-B"
  }
}

# -----------------------------------------------------------------------------
# Metric Alarm: ALB 5XX Internal Server Errors (Profile B: Conditional)
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  count               = var.enable_alb ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-alb-5xx-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Triggers when backend service produces more than 10 5XX HTTP error codes in 5 minutes"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Tier        = "Profile-B"
  }
}

# -----------------------------------------------------------------------------
# System Observability Dashboard
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_dashboard" "system_dashboard" {
  dashboard_name = "${var.project_name}-${var.environment}-observability"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", var.ec2_instance_id, { label = "EC2 CPU %" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "EC2 Docker Host Compute Utilization"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "NetworkIn", "InstanceId", var.ec2_instance_id, { stat = "Sum", label = "Network In (Bytes)" }],
            ["AWS/EC2", "NetworkOut", "InstanceId", var.ec2_instance_id, { stat = "Sum", label = "Network Out (Bytes)" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "EC2 Network Traffic"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiId", "${var.project_name}-http-api-${var.environment}", { stat = "Sum", label = "API Requests" }],
            ["AWS/ApiGateway", "Latency", "ApiId", "${var.project_name}-http-api-${var.environment}", { stat = "Average", label = "Latency (ms)" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "API Gateway Serverless Traffic"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "${var.project_name}-quote-calculator-${var.environment}", { stat = "Sum", label = "Quote Calc Invocations" }],
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-quote-calculator-${var.environment}", { stat = "Average", label = "Avg Duration (ms)" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Serverless Lambda Execution"
          period  = 300
        }
      }
    ]
  })
}


# -----------------------------------------------------------------------------
# CloudWatch Log Group for Application & API Gateway Logging
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/${var.project_name}/${var.environment}/api"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-api-logs"
    Environment = var.environment
    Service     = "CloudWatch"
  }
}
