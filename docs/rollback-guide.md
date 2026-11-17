# BorrowBuy – Cloud Rollback & Emergency Recovery Guide

**Project**: BorrowBuy – Product Rental and Management Platform  
**Target Environment**: AWS `ap-south-1` (Mumbai)  
**Objective**: Rapid, Safe Reversion of Faulty Deployments  

---

## 1. Frontend Rollback Procedure (S3 & CloudFront)

If a newly deployed frontend build introduces runtime errors or broken layouts:

### A. Instant Rollback via S3 Bucket Versioning
1. If versioning is enabled on the frontend bucket, restore the previous `index.html` object version:
```bash
aws s3api list-object-versions --bucket <YOUR_FRONTEND_BUCKET_NAME> --prefix "index.html"
```
2. Copy the previous version to become current:
```bash
aws s3api copy-object \
  --bucket <YOUR_FRONTEND_BUCKET_NAME> \
  --copy-source <YOUR_FRONTEND_BUCKET_NAME>/index.html?versionId=<PREVIOUS_VERSION_ID> \
  --key index.html
```

### B. Instant Edge Cache Invalidation
Clear CloudFront edge caches so users immediately receive the restored build:
```bash
aws cloudfront create-invalidation --distribution-id <YOUR_CLOUDFRONT_ID> --paths "/*"
```

---

## 2. Backend Container Rollback (EC2 & ECR)

If the new backend container fails synthetic health checks or introduces API regression:

### A. Revert to Previous Image Tag on EC2
1. Connect via AWS Systems Manager:
```bash
aws ssm start-session --target <YOUR_EC2_INSTANCE_ID>
```

2. Point Docker Compose to the previous known-good image SHA or `previous` tag:
```bash
docker pull <ECR_REGISTRY>/borrowbuy-backend:<PREVIOUS_GIT_SHA>
docker tag <ECR_REGISTRY>/borrowbuy-backend:<PREVIOUS_GIT_SHA> <ECR_REGISTRY>/borrowbuy-backend:latest
docker-compose -f /opt/borrowbuy/docker-compose.prod.yml up -d --no-deps backend
```

3. Verify health status:
```bash
curl -I http://localhost/api/health
```

---

## 3. Database Schema Rollback

If a migration fails mid-way or introduces breaking schema changes:
1. Revert to the last automated database snapshot:
```bash
docker exec -i borrowbuy-prod-postgres psql -U borrowbuy_user -d borrowbuy_production < /opt/borrowbuy/backups/latest_pre_migration.sql
```
2. Mark the migration as resolved in Prisma's internal history:
```bash
docker exec borrowbuy-prod-backend npx prisma migrate resolve --rolled-back <MIGRATION_NAME>
```

---

## 4. Infrastructure Rollback (Terraform)

If a Terraform apply modified cloud resources undesirably:
1. Check out the previous git commit in `infra/terraform/`:
```bash
git checkout HEAD~1 -- infra/terraform/
```
2. Run plan to verify resource reversion:
```bash
terraform -chdir=infra/terraform plan
```
3. Apply the previous state:
```bash
terraform -chdir=infra/terraform apply -auto-approve
```
