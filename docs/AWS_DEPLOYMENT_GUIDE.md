# BorrowBuy – Complete AWS Cloud Deployment & Operations Guide

**Platform:** BorrowBuy Equipment Rental Platform  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Supported Profiles:**
- **Profile A (Academic Demonstration Baseline):** Single EC2 Docker Host + S3 + CloudFront + Serverless Services. (\$0.00 – \$1.50/mo under Free Tier)
- **Profile B (Production Multi-AZ Enterprise):** Multi-AZ ALB + EC2 Auto Scaling + RDS PostgreSQL + WAFv2. (~\$65.00 – \$95.00/mo)

---

## 1. Prerequisites

Before deploying to AWS, ensure you have:
1. **AWS Account**: With active Free Tier eligibility or academic AWS Academy credits.
2. **AWS CLI**: Installed and configured (`aws configure` with region set to `ap-south-1`).
3. **Terraform**: Version 1.5+ installed.
4. **Docker & Docker Compose**: Installed locally.
5. **Node.js**: Version 20+ LTS installed.

---

## 2. Deployment Procedure: Profile A (Academic Low-Cost Baseline)

This is the recommended deployment for university submissions, ensuring \$0 cloud expense.

### Step 1: Build Frontend Assets
```bash
npm install
npm run build --workspace=frontend
```
*Outputs compiled assets to `frontend/dist/`.*

### Step 2: Configure Environment Variables
Copy and update `.env.example` in the project root:
```ini
NODE_ENV=production
PORT=5000
AWS_REGION=ap-south-1
STORAGE_DRIVER=s3
AWS_S3_BUCKET=borrowbuy-product-assets
NOTIFICATION_DRIVER=local
PAYMENT_DRIVER=mock
DATABASE_URL=postgresql://borrowbuy_user:secure_password_2026@localhost:5432/borrowbuy_db?schema=public
```

### Step 3: Initialize & Validate Terraform
```bash
cd infra/terraform
terraform init
terraform validate
```

### Step 4: Preview Infrastructure Plan (Profile A)
```bash
terraform plan \
  -var="deploy_mode=ec2" \
  -var="enable_nat_gateway=false" \
  -var="enable_alb=false" \
  -var="enable_autoscaling=false" \
  -var="enable_rds=false" \
  -var="enable_serverless=true"
```

### Step 5: Provision Infrastructure
```bash
terraform apply -auto-approve
```
*Note the output `ec2_public_ip` and `cloudfront_distribution_domain`.*

### Step 6: Deploy Application to EC2 Host
1. SSH into the provisioned EC2 instance using AWS SSM Session Manager:
   ```bash
   aws ssm start-session --target <instance-id>
   ```
2. Clone your repository, initialize Docker Compose, and run database migrations:
   ```bash
   docker-compose up -d --build
   docker exec -it borrowbuy-backend npx prisma migrate deploy
   docker exec -it borrowbuy-backend npm run seed
   ```

---

## 3. Deployment Procedure: Profile B (Production Multi-AZ Enterprise)

When funded or demonstrating production failover:

```bash
cd infra/terraform
terraform plan \
  -var="deploy_mode=ecs" \
  -var="enable_nat_gateway=true" \
  -var="enable_alb=true" \
  -var="enable_autoscaling=true" \
  -var="enable_rds=true" \
  -var="enable_waf=true" \
  -var="enable_serverless=true"
```

---

## 4. Post-Deployment Verification

1. **Health Check:**
   ```bash
   curl -I https://<your-domain-or-ip>/api/health
   # Expected: HTTP/1.1 200 OK
   ```
2. **Cloud Operations Dashboard:**
   Open `https://<your-domain-or-ip>/cloud` in your browser. Verify that all 16 AWS services show active status pills and real-time compute telemetry is streaming.
3. **Database Seed Verification:**
   Verify that all 116 equipment listings appear in the catalog across Gujarat cities (Ahmedabad, Surat, Gandhinagar, Vadodara, Rajkot).

---

## 5. Teardown & Resource Cleanup

To prevent ongoing charges after faculty presentation:
```bash
cd infra/terraform
terraform destroy -auto-approve
```
*All provisioned resources (EC2, S3, DynamoDB, VPC, CloudWatch alarms) will be cleanly decommissioned.*
