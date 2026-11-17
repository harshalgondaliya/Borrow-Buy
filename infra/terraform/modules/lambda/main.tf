# =============================================================================
# AWS Lambda & Amazon EventBridge Module
# Pure Serverless Execution for Rental Quotes & Cron Hold Sweeping
# 1,000,000 requests/month permanently free under AWS Always-Free Tier
# =============================================================================

data "archive_file" "lambda_dummy" {
  type        = "zip"
  output_path = "${path.module}/lambda_dummy.zip"

  source {
    content  = "exports.handler = async (event) => ({ statusCode: 200, body: JSON.stringify({ message: 'Lambda placeholder' }) });"
    filename = "index.js"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-exec-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 1. Rental Quote Calculator Function
resource "aws_lambda_function" "quote_calculator" {
  function_name = "${var.project_name}-quote-calculator-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "quote-calculator.handler"
  runtime       = "nodejs20.x"
  filename      = data.archive_file.lambda_dummy.output_path
  memory_size   = 128
  timeout       = 5

  environment {
    variables = {
      NODE_ENV = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-quote-calculator"
    Environment = var.environment
    Service     = "Lambda"
  }
}

# 2. Hold Sweeper Function
resource "aws_lambda_function" "hold_sweeper" {
  function_name = "${var.project_name}-hold-sweeper-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "hold-sweeper.handler"
  runtime       = "nodejs20.x"
  filename      = data.archive_file.lambda_dummy.output_path
  memory_size   = 128
  timeout       = 30

  environment {
    variables = {
      NODE_ENV = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-hold-sweeper"
    Environment = var.environment
    Service     = "Lambda"
  }
}

# 3. Amazon EventBridge Rule: 15-Minute Cron Schedule for Hold Sweeping
resource "aws_cloudwatch_event_rule" "sweep_schedule" {
  name                = "${var.project_name}-hold-sweeper-cron"
  description         = "Triggers hold-sweeper Lambda every 15 minutes"
  schedule_expression = "rate(15 minutes)"
}

resource "aws_cloudwatch_event_target" "sweep_target" {
  rule      = aws_cloudwatch_event_rule.sweep_schedule.name
  target_id = "HoldSweeperLambda"
  arn       = aws_lambda_function.hold_sweeper.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hold_sweeper.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.sweep_schedule.arn
}
