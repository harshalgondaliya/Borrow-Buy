# BorrowBuy – AWS Cloud Readiness & Pre-Deployment Audit Report

**Date**: November 14, 2026  
**Status**: Ready for Task 2 (AWS Deployment)  
**Strict Constraint**: Task 1 performed strictly offline evaluation; zero cloud resources were provisioned and `terraform apply` was not executed.

---

## 1. Cloud Architecture Overview

BorrowBuy's AWS cloud infrastructure is authored using **Terraform (HashiCorp HCL)** located in `infrastructure/terraform/`. The target topology includes:

```
[ Internet Users ]
        │
        ▼
[ AWS CloudFront Global CDN ] (S3 Static Frontend + Edge Caching)
        │
        ├──────── /api/* ────────┐
        │                        ▼
        ▼               [ Application Load Balancer (ALB) ]
[ Amazon S3 ] (SPA Assets)       │
                                 ▼
                    [ ECS Fargate (Private Subnets) ]
                    (borrowbuy-backend container)
                                 │
                                 ├──────────► [ Amazon S3 ] (Uploads / Attachments)
                                 │
                                 ├──────────► [ Amazon CloudWatch ] (Logs & Metrics)
                                 │
                                 ▼
                    [ Amazon RDS PostgreSQL 16 ] (Multi-AZ, Private Subnets)
```

---

## 2. Infrastructure Code Repairs Completed in Task 1

### 2.1 Database Connection URI Fix (`main.tf` & `modules/rds/outputs.tf`)
- **Previous Defect**: `infrastructure/terraform/main.tf` line 74 used:
  ```hcl
  database_url = "postgresql://${module.rds.db_name}:${module.rds.db_endpoint}/${module.rds.db_name}?sslmode=require"
  ```
  This swapped database name and host, omitted credentials, and lacked port and user delimiter.
- **Correction Applied**:
  - Added sensitive output `database_url` in `modules/rds/outputs.tf`:
    ```hcl
    output "database_url" {
      description = "Full connection URL for PostgreSQL"
      value       = "postgresql://${var.database_username}:${random_password.master_password.result}@${aws_db_instance.postgres.endpoint}/${var.database_name}?sslmode=require"
      sensitive   = true
    }
    ```
  - Updated `infrastructure/terraform/main.tf` line 74:
    ```hcl
    database_url = module.rds.database_url
    ```

### 2.2 ECS Task Environment Alignment (`modules/ecs/main.tf`)
- **Previous Defect**: The ECS container definition passed `PAYMENT_DRIVER: "mock"` and `AWS_S3_BUCKET`, which caused Zod validation in `backend/src/config/env.ts` to reject application startup.
- **Correction Applied**:
  - Set `PAYMENT_DRIVER: "simulation"` (valid enum value in `env.ts`).
  - Set `AWS_S3_BUCKET_NAME: var.s3_bucket_name` (matching required schema in `env.ts`).

### 2.3 Parameterized AWS Region
- **Previous Defect**: `modules/ecs/main.tf` hardcoded `"us-east-1"` in `awslogs-region` and `AWS_REGION`.
- **Correction Applied**: Added `variable "aws_region"` to `modules/ecs/variables.tf`, supplied `aws_region = var.aws_region` from `main.tf`, and dynamically referenced `var.aws_region`.

---

## 3. Container & Local Docker Verification

- **Backend Dockerfile**: Multistage production build using `node:22-alpine` with Prisma client generation and unprivileged user execution.
- **Frontend Build**: Single-page application bundle generated via `vite build`, verified producing optimized static assets in `frontend/dist/`.
- **Docker Compose**: Verified local development compose configuration runs PostgreSQL 16 on port 5432 with healthchecks and persistent volumes.

---

## 4. Task 2 Deployment Checklist & Prerequisites

Before initiating Task 2 (AWS Deployment):

1. **AWS Identity & Access Management (IAM)**:
   - Ensure AWS CLI is configured with programmatic deployment credentials:
     ```bash
     aws sts get-caller-identity
     ```
2. **ECR Repository Creation**:
   - Provision backend ECR repository:
     ```bash
     aws ecr create-repository --repository-name borrowbuy-backend --region ap-south-1
     ```
3. **Database Administrator Secret**:
   - Set `ADMIN_INITIAL_PASSWORD` in AWS Secrets Manager or CI/CD secrets before triggering initial seeding.
4. **Terraform Workspace Selection**:
   - Select target environment (`dev`, `staging`, or `prod`) and execute `terraform plan` to verify resource creation graph before apply.

---

## 5. Certification
The repository is confirmed **AWS Ready**. All configuration files, container specifications, and Terraform modules are syntactically sound and structurally aligned with the Node.js backend environment requirements.
