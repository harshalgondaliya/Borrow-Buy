# BorrowBuy – Production Environment Variables & Secrets Specification

**Project**: BorrowBuy – Product Rental and Management Platform  
**Target Environment**: AWS `ap-south-1` (Mumbai)  
**Security Standard**: No Plaintext Secrets in Version Control  

---

## 1. Backend Environment Variables (`backend/.env` / Container Runtime)

| Variable Name | Required? | Default / Example Value | Secret? | Description |
|---|:---:|---|:---:|---|
| `PORT` | No | `5000` | No | Port on which the Express REST API listens |
| `NODE_ENV` | Yes | `production` | No | Runtime tier (`development`, `test`, `production`) |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/dbname?schema=public` | **YES** | Prisma connection string to PostgreSQL |
| `JWT_SECRET` | Yes | `[Cryptographically Secure 64-character string]` | **YES** | Secret key for signing and verifying JWT session tokens |
| `JWT_EXPIRES_IN` | No | `7d` | No | Session token expiration window |
| `FRONTEND_URL` | Yes | `https://d12345abcdef.cloudfront.net` | No | Allowed CORS origin for browser requests |
| `STORAGE_DRIVER` | Yes | `s3` (or `local` in dev) | No | Storage provider driver selection |
| `NOTIFICATION_DRIVER`| Yes | `sns` (or `local` in dev) | No | Notification provider driver selection |
| `PAYMENT_DRIVER` | Yes | `simulation` | No | Payment processor driver |
| `QUEUE_DRIVER` | No | `sqs` (or `local` in dev) | No | Queue messaging driver |
| `AWS_REGION` | Yes | `ap-south-1` | No | AWS target region for all SDK calls |
| `AWS_S3_BUCKET_NAME` | Yes | `borrowbuy-dev-assets` | No | S3 bucket for product photo uploads |
| `AWS_SNS_TOPIC_ARN` | No | `arn:aws:sns:ap-south-1:123456789012:borrowbuy-dev-notifications` | No | SNS Topic for broadcast alerts |
| `AWS_SQS_QUEUE_URL` | No | `https://sqs.ap-south-1.amazonaws.com/123456789012/borrowbuy-dev-events` | No | SQS Queue URL for background tasks |
| `CLOUDFRONT_DOMAIN` | No | `d12345abcdef.cloudfront.net` | No | Custom CloudFront domain for fast asset delivery |

---

## 2. Frontend Build Variables (`frontend/.env.production`)

| Variable Name | Required? | Example Value | Description |
|---|:---:|---|---|
| `VITE_API_URL` | Yes | `https://d12345abcdef.cloudfront.net/api` | API base URL consumed by Axios/Fetch client |
| `VITE_APP_ENV` | No | `production` | Active frontend environment flag |

> [!CAUTION]
> Never prepend `VITE_` to AWS access keys, secret keys, or database credentials. Vite embeds all `VITE_` variables directly into public JavaScript bundles sent to end-user browsers.
