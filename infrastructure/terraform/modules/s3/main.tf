resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  bucket_name = var.bucket_name_override != "" ? var.bucket_name_override : "${var.project_name}-${var.environment}-assets-${random_string.suffix.result}"
}

# -----------------------------------------------------------------------------
# S3 Bucket for Equipment Photos & Inspection Evidence
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "assets" {
  bucket        = local.bucket_name
  force_destroy = var.environment != "prod"

  tags = {
    Name        = local.bucket_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "Product and inspection photo storage"
  }
}

# -----------------------------------------------------------------------------
# Block All Public Access (Strict Security Best Practice)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_public_access_block" "assets_block" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------------------------
# Server-Side Encryption (SSE-S3 AES-256)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_server_side_encryption_configuration" "assets_encryption" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# -----------------------------------------------------------------------------
# Versioning Configuration
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_versioning" "assets_versioning" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# -----------------------------------------------------------------------------
# Lifecycle Rule: Cost Optimization (Glacier archival / noncurrent expiration)
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_lifecycle_configuration" "assets_lifecycle" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "archive-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# -----------------------------------------------------------------------------
# CORS Policy for Web Uploads & Previews
# -----------------------------------------------------------------------------
resource "aws_s3_bucket_cors_configuration" "assets_cors" {
  bucket = aws_s3_bucket.assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
