# BorrowBuy – AWS Resource Registry & Configuration Mapping

This registry tracks all cloud resources provisioned across the development lifecycle. In accordance with project governance rules, no synthetic, mocked, or placeholder AWS endpoints or identifiers are entered until the respective resources are provisioned via Terraform or AWS deployment scripts in Stage B.

---

## 1. Cloud Resource Registry Table

| Resource | AWS Service | Resource Name / ID | Region | Endpoint / URL | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VPC** | Amazon VPC | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **Public Subnets** | Amazon VPC | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **Private Subnets** | Amazon VPC | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **Internet Gateway** | Amazon VPC | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **Security Groups** | Amazon EC2 | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **Application Database**| Amazon RDS (PostgreSQL)| *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **Product Media Bucket**| Amazon S3 | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **Web Hosting Bucket** | Amazon S3 | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **CDN Distribution** | Amazon CloudFront | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **API Gateway / ALB** | API Gateway / ALB | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **Backend Compute** | Amazon ECS / EC2 | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **User Directory** | Amazon Cognito User Pool| *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **User Directory Client**| Cognito App Client | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **Notification Topic** | Amazon SNS | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **Task Queue** | Amazon SQS | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **Scheduled Event** | Amazon EventBridge | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **Log Groups** | Amazon CloudWatch Logs | *PENDING* | *PENDING* | *PENDING* | **NOT CREATED** |
| **Billing Alarm** | CloudWatch Metric Alarm | *PENDING* | *PENDING* | N/A | **NOT CREATED** |
| **CI/CD OIDC Role** | AWS IAM | *PENDING* | N/A | *PENDING* | **NOT CREATED** |

---

## 2. Environment Variable to AWS Output Mapping Guide

When infrastructure provisioning occurs via Terraform in Phase 10, the output values from Terraform will map directly to the application environment variables as follows:

| Terraform Output Variable | Application Environment Variable | Target Service / Component | Purpose |
| :--- | :--- | :--- | :--- |
| `terraform output rds_endpoint` | `DATABASE_URL` | Backend / Prisma | PostgreSQL connection string with TLS enabled |
| `terraform output s3_media_bucket_name` | `AWS_S3_BUCKET_NAME` | Backend (`S3StorageService`) | Destination bucket for product photos and condition reports |
| `terraform output aws_region` | `AWS_REGION` | Backend & Terraform | Default AWS region for SDK clients |
| `terraform output cognito_user_pool_id` | `AWS_COGNITO_USER_POOL_ID` | Backend (`CognitoAuthProvider`)| Managed user authentication directory ID |
| `terraform output cognito_app_client_id` | `AWS_COGNITO_CLIENT_ID` | Frontend & Backend | Public client ID for token generation |
| `terraform output sns_topic_arn` | `AWS_SNS_TOPIC_ARN` | Backend (`SNSNotificationService`)| Pub/Sub topic for rental reminders and alerts |
| `terraform output api_gateway_url` | `VITE_API_BASE_URL` | Frontend | Base URL for REST API client requests |
| `terraform output cloudfront_domain_name` | `FRONTEND_URL` | Backend CORS Config | Allowed origin for Cross-Origin Resource Sharing |

