# BorrowBuy – Complete AWS Cloud Deployment Guide

**Target Environment**: AWS `ap-south-1` (Mumbai)  
**Deployment Tier**: Student Budget Free Tier Baseline  
**Project**: BorrowBuy – Product Rental and Management Platform  

---

## 1. Prerequisites Checklist

Ensure the following tools are installed on your local workstation:
- [x] **AWS CLI v2** (`aws --version`)
- [x] **Terraform v1.5+** (`terraform --version`)
- [x] **Node.js v22+ & npm** (`node --version`)
- [x] **Docker & Docker Compose** (`docker --version`)

> [!CAUTION]
> Never share your AWS root credentials or paste secret keys into public forums or chat windows.

---

## 2. Step 1: AWS CLI Authentication (Local Terminal)

In your local command prompt or PowerShell, run:

```bash
aws configure
```

Provide your AWS credentials securely when prompted:
- **AWS Access Key ID**: `YOUR_IAM_USER_ACCESS_KEY`
- **AWS Secret Access Key**: `YOUR_IAM_USER_SECRET_KEY`
- **Default region name**: `ap-south-1`
- **Default output format**: `json`

Verify authentication:
```bash
aws sts get-caller-identity
```

---

## 3. Step 2: Infrastructure Provisioning with Terraform

Navigate to the Terraform directory:

```bash
cd infra/terraform
```

1. Initialize Terraform modules and provider plugins:
```bash
terraform init
```

2. Generate an execution plan to verify resources and ensure zero NAT Gateways are created:
```bash
terraform plan -out=tfplan
```

3. Review the plan. Once approved, apply the plan:
```bash
terraform apply tfplan
```

4. Note the Terraform outputs:
- `cloudfront_distribution_domain`
- `ec2_public_ip`
- `s3_bucket_name`
- `sqs_queue_url`
- `sns_topic_arn`

---

## 4. Step 3: Frontend Deployment to S3 & CloudFront

From the project root:

1. Build the production React frontend bundle:
```bash
npm run build --workspace=frontend
```

2. Sync the compiled assets to the frontend S3 bucket:
```bash
aws s3 sync frontend/dist s3://<YOUR_FRONTEND_BUCKET_NAME> --delete
```

3. Invalidate CloudFront edge caches:
```bash
aws cloudfront create-invalidation --distribution-id <YOUR_CLOUDFRONT_ID> --paths "/*"
```

---

## 5. Step 4: Backend Container Deployment on EC2

1. Connect to your EC2 instance via AWS Systems Manager (no SSH key needed!):
```bash
aws ssm start-session --target <YOUR_EC2_INSTANCE_ID>
```

2. On the EC2 host, clone or transfer the project files and start Docker Compose:
```bash
cd /opt/borrowbuy
docker-compose -f docker-compose.prod.yml up -d
```

3. Execute database schema migrations:
```bash
docker exec borrowbuy-prod-backend npx prisma migrate deploy --schema=./database/prisma/schema.prisma
```

4. Verify backend health check:
```bash
curl http://localhost/api/health
```
Expected response:
```json
{"status":"healthy","uptime":...,"timestamp":"...","database":"connected"}
```
