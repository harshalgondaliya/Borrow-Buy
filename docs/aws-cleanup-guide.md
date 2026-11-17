# BorrowBuy – AWS Resource Teardown & Cost Cleanup Guide

**Target Region**: `ap-south-1` (Asia Pacific – Mumbai)  
**Project**: BorrowBuy – Product Rental and Management Platform  
**Purpose**: Safe, Complete Teardown to Guarantee \$0.00 Incurred Costs  

---

## 1. What Accrues Charges When Idle?

Understanding which cloud resources continue to incur charges when the application is idle is critical for student budget safety:

| Cloud Resource | Incurs Charges When Application Is Idle? | Why / Pricing Mechanism |
|---|:---:|---|
| **EC2 Instance (Running)** | **YES** | Accrues hourly compute charges (~$0.0104/hr) and public IPv4 charges ($0.005/hr). |
| **EC2 Instance (STOPPED)** | **NO** | Compute charges stop instantly! Only the 20 GB EBS volume ($1.76/month) persists. |
| **EBS Volume (gp3)** | **YES** | Stored disk space costs \$0.088 per GB-month until detached and deleted. |
| **S3 Buckets** | **Virtually $0.00** | Only stored data is billed ($0.023/GB-month). A 50 MB bucket costs < \$0.01/month. |
| **CloudFront Distribution** | **NO ($0.00)** | Incurs charges ONLY when end users actively request data. $0.00 when idle. |
| **Amazon SQS / SNS** | **NO ($0.00)** | Incurs charges only per active API call. Zero fixed baseline fee. |
| **AWS Lambda** | **NO ($0.00)** | Incurs charges only per millisecond of compute during execution. |
| **AWS Budgets** | **NO ($0.00)** | First 2 budgets are permanently free. |
| **NAT Gateway** (If created) | **YES ($32.40/mo)** | Billed continuously. **MUST BE DELETED FIRST** if ever enabled. |

---

## 2. Emergency Cost-Freezing Procedure (Pause Mode)

If you receive an AWS Budget alert or wish to pause cloud hosting between project grading sessions:

### Step 1: Stop the EC2 Host
Stopping the instance ceases all compute and public IPv4 billing immediately:

```bash
aws ec2 stop-instances --instance-ids <YOUR_EC2_INSTANCE_ID> --region ap-south-1
```

To resume the instance later:
```bash
aws ec2 start-instances --instance-ids <YOUR_EC2_INSTANCE_ID> --region ap-south-1
```

---

## 3. Complete Infrastructure Teardown (`terraform destroy`)

When your academic project semester concludes and you want all AWS infrastructure removed:

### Step 1: Empty S3 Buckets
AWS S3 prevents Terraform from destroying buckets that contain objects. Empty all buckets first:

```bash
# Empty frontend bucket
aws s3 rm s3://<YOUR_FRONTEND_BUCKET_NAME> --recursive

# Empty upload bucket
aws s3 rm s3://<YOUR_UPLOAD_BUCKET_NAME> --recursive
```

### Step 2: Destroy All Resources via Terraform
Navigate to the Terraform folder and run destroy:

```bash
cd infra/terraform
terraform destroy -auto-approve
```

### Step 3: Verify Zero Remaining Active Resources
Run the following verification commands to ensure no orphan resources remain:

```bash
# Check EC2
aws ec2 describe-instances --region ap-south-1 --query "Reservations[*].Instances[*].[InstanceId,State.Name]" --output table

# Check S3
aws s3 ls

# Check SQS
aws sqs list-queues --region ap-south-1

# Check SNS
aws sns list-topics --region ap-south-1
```
All outputs should show terminated or empty states. Monthly cost is now permanently **\$0.00**.
