# BORROWBUY — CLOUD CLEANUP & DISASTER RECOVERY RUNBOOK

**Document Version:** 2.0.0  
**Verification Date:** November 22, 2026  
**Target AWS Account:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Target IAM Entity:** `arn:aws:iam::767579108846:user/borrowbuy-admin`  

---

## 1. Overview & Decommissioning Policy

To ensure zero ongoing charges against the AWS account when the project is not actively being evaluated or demonstrated, follow this systematic guide. It describes:
1. **Safe Standby Mode (Zero Compute Charges, Full Data Preservation)**
2. **Complete Teardown & Decommissioning (Permanent Cleanup)**
3. **Disaster Recovery & Re-deployment Procedure**

> [!CAUTION]
> Deleting the VPC or terminating the EC2 instance without creating an EBS snapshot will permanently delete the local PostgreSQL database data and uploaded media assets. Always take a manual EBS snapshot before terminating resources.

---

## 2. Procedure A: Safe Standby Mode (Recommended)

When pausing work between evaluation sessions, stop the EC2 instance. This eliminates 100% of the EC2 compute cost (\$0.0104/hr) and keeps only the \$1.60/month EBS storage fee.

### Step 1: Stop EC2 Instance
```bash
aws ec2 stop-instances \
  --instance-ids i-03347c2b6584c73cb \
  --profile borrowbuy-admin \
  --region ap-south-1
```

### Step 2: Verify Stopped State
```bash
aws ec2 describe-instances \
  --instance-ids i-03347c2b6584c73cb \
  --profile borrowbuy-admin \
  --region ap-south-1 \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text
```
*(Expected output: `stopped`).*

### Step 3: Resuming Operations
When ready to present again:
```bash
aws ec2 start-instances \
  --instance-ids i-03347c2b6584c73cb \
  --profile borrowbuy-admin \
  --region ap-south-1
```
*(The host will boot in ~45 seconds, reconnect to SSM, and resume Docker containers).*

---

## 3. Procedure B: Permanent Decommissioning & Zero-Cost Cleanup

Follow these steps only after final grading and project submission to ensure that the AWS account incurs \$0.00:

### Step 1: Create Backup EBS Snapshot (Safety First)
```bash
aws ec2 create-snapshot \
  --volume-id vol-0e48159e9bb02b52c \
  --description "BorrowBuy Final Academic Submission Snapshot - Nov 2026" \
  --tag-specifications "ResourceType=snapshot,Tags=[{Key=Project,Value=BorrowBuy},{Key=Purpose,Value=FinalBackup}]" \
  --profile borrowbuy-admin \
  --region ap-south-1
```

### Step 2: Terminate EC2 Instance
```bash
aws ec2 terminate-instances \
  --instance-ids i-03347c2b6584c73cb \
  --profile borrowbuy-admin \
  --region ap-south-1
```
*(The root EBS volume `vol-0e48159e9bb02b52c` has `DeleteOnTermination: true` and will be automatically purged).*

### Step 3: Remove Subnets & Internet Gateway
Once the instance reaches `terminated` state:
```bash
# Detach Internet Gateway
aws ec2 detach-internet-gateway \
  --internet-gateway-id igw-05e9ddf2c3f79846f \
  --vpc-id vpc-0cbfb3929d621f2db \
  --profile borrowbuy-admin \
  --region ap-south-1

# Delete Internet Gateway
aws ec2 delete-internet-gateway \
  --internet-gateway-id igw-05e9ddf2c3f79846f \
  --profile borrowbuy-admin \
  --region ap-south-1

# Delete Subnets
aws ec2 delete-subnet --subnet-id subnet-0ca0dd3ae36f6e293 --profile borrowbuy-admin --region ap-south-1
aws ec2 delete-subnet --subnet-id subnet-0fa721f9011eae4d7 --profile borrowbuy-admin --region ap-south-1
aws ec2 delete-subnet --subnet-id subnet-09c327f11994e9743 --profile borrowbuy-admin --region ap-south-1
aws ec2 delete-subnet --subnet-id subnet-0cffe057630e66592 --profile borrowbuy-admin --region ap-south-1
```

### Step 4: Delete Security Group & VPC
```bash
# Delete Security Group
aws ec2 delete-security-group \
  --group-id sg-033b02984ba31dc71 \
  --profile borrowbuy-admin \
  --region ap-south-1

# Delete VPC
aws ec2 delete-vpc \
  --vpc-id vpc-0cbfb3929d621f2db \
  --profile borrowbuy-admin \
  --region ap-south-1
```

---

## 4. Procedure C: Disaster Recovery from Snapshot

If the EC2 instance is ever accidentally deleted or corrupted, it can be restored in under 5 minutes:

1. **Locate Latest Snapshot:**
   ```bash
   aws ec2 describe-snapshots --owner-ids self --profile borrowbuy-admin --region ap-south-1
   ```
2. **Create New EBS Volume from Snapshot:**
   ```bash
   aws ec2 create-volume \
     --availability-zone ap-south-1a \
     --snapshot-id <SNAPSHOT_ID> \
     --volume-type gp3 \
     --profile borrowbuy-admin \
     --region ap-south-1
   ```
3. **Launch Replacement EC2 Instance:**
   Launch a `t3.small` instance in `subnet-0ca0dd3ae36f6e293`, attach the instance profile `BorrowBuy-EC2-SSM-Role`, and mount the restored volume to `/dev/xvda`.
4. **Reconnect via SSM Session Manager:**
   Connect via AWS Console Systems Manager or AWS CLI to start Docker Compose.
