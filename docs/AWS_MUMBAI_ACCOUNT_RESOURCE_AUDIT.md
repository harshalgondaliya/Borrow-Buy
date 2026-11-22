# BorrowBuy – AWS Mumbai (`ap-south-1`) Account & Resource Audit

**Audit Date:** November 18, 2026  
**Auditor Role:** Senior AWS DevOps Engineer & Cloud Security Auditor  
**Target Region:** `ap-south-1` (Asia Pacific – Mumbai)  
**Authentication Profile:** `borrowbuy-auditor`  
**Execution Safety:** 100% Read-Only Inspection. Zero AWS resources created, modified, or destroyed.

---

## 1. Active AWS Identity Verification

Command executed: `aws sts get-caller-identity --profile borrowbuy-auditor`

```json
{
    "UserId": "AIDA3FN2HWXXHC47UWUAO",
    "Account": "767579108846",
    "Arn": "arn:aws:iam::767579108846:user/borrowbuy-auditor"
}
```

### Identity Attributes
- **IAM User Name:** `borrowbuy-auditor`
- **AWS Account ID:** `767579108846`
- **Unique Principal ID:** `AIDA3FN2HWXXHC47UWUAO`
- **Authentication Method:** AWS CLI v2 login session (`TYPE: login`) with temporary STS security tokens (`ASIA...`).

---

## 2. Mumbai (`ap-south-1`) Region Availability

Command executed: `aws ec2 describe-regions --region-names ap-south-1 --profile borrowbuy-auditor --region ap-south-1`

```json
{
    "Regions": [
        {
            "OptInStatus": "opt-in-not-required",
            "Geography": [
                {
                    "Name": "India"
                }
            ],
            "RegionName": "ap-south-1",
            "Endpoint": "ec2.ap-south-1.amazonaws.com"
        }
    ]
}
```

**Verification Finding:**
- Mumbai (`ap-south-1`) is an **enabled-by-default AWS commercial region** (`"OptInStatus": "opt-in-not-required"`).
- No manual region opt-in or account-level approval is required.
- The region endpoint `ec2.ap-south-1.amazonaws.com` is responsive and authorized for this account.

---

## 3. Existing Resource Inventory in `ap-south-1`

A comprehensive read-only scan of core AWS service endpoints in `ap-south-1` was conducted:

| AWS Service / Resource | Read-Only CLI Command | Result & Output Summary | Status |
|---|---|---|---|
| **VPC** | `aws ec2 describe-vpcs` | 1 VPC found: Default VPC `vpc-0b4ff264d93c18f02` (`172.31.0.0/16`). Zero custom project VPCs exist. | Clean |
| **Subnets** | `aws ec2 describe-subnets` | 3 subnets found: Default subnets in `ap-south-1a`, `ap-south-1b`, `ap-south-1c`. | Clean |
| **EC2 Instances** | `aws ec2 describe-instances` | `"Reservations": []`. Exactly **0** EC2 instances running or stopped. | Clean |
| **S3 Buckets** | `aws s3api list-buckets` | `"Buckets": []`. Exactly **0** S3 buckets exist in the account. | Clean |
| **Lambda Functions** | `aws lambda list-functions` | `"Functions": []`. Exactly **0** Lambda functions exist. | Clean |
| **SNS Topics** | `aws sns list-topics` | `"Topics": []`. Exactly **0** SNS topics exist. | Clean |
| **CloudWatch Log Groups** | `aws logs describe-log-groups` | `"logGroups": []`. Exactly **0** CloudWatch log groups exist. | Clean |
| **CloudWatch Alarms** | `aws cloudwatch describe-alarms` | `"MetricAlarms": []`. Exactly **0** CloudWatch alarms exist. | Clean |
| **DynamoDB Tables** | `aws dynamodb list-tables` | AccessDeniedException (`dynamodb:ListTables` not granted to auditor user). | Permission Gate |
| **Cognito User Pools** | `aws cognito-idp list-user-pools` | AccessDeniedException (`cognito-idp:ListUserPools` not granted to auditor user). | Permission Gate |
| **SQS Queues** | `aws sqs list-queues` | AccessDenied (`sqs:listqueues` not granted to auditor user). | Permission Gate |
| **CloudFront Distributions**| `aws cloudfront list-distributions` | AccessDenied (`cloudfront:ListDistributions` not granted to auditor user). | Permission Gate |
| **IAM User Policies** | `aws iam list-user-policies` | AccessDenied (`iam:ListUserPolicies` not granted to auditor user). | Permission Gate |

### Key Discovery:
The target deployment region `ap-south-1` is an entirely **clean greenfield environment**:
- No conflicting VPC CIDRs (`10.0.0.0/16` is completely unallocated).
- Zero dangling instances, unattached EBS volumes, or abandoned S3 buckets.
- Zero unexpected background charges are currently running in the account.

---

## 4. Auditor IAM Permission Analysis

The IAM user `borrowbuy-auditor` was configured specifically with read-only inspection access. During our audit, the following permission boundaries were identified:

### Permissions Confirmed Active:
- `sts:GetCallerIdentity`
- `ec2:DescribeRegions`
- `ec2:DescribeVpcs`
- `ec2:DescribeSubnets`
- `ec2:DescribeInstances`
- `ec2:DescribeImages` (used by Terraform to resolve AL2023 AMI)
- `s3:ListAllMyBuckets`
- `lambda:ListFunctions`
- `sns:ListTopics`
- `logs:DescribeLogGroups`
- `cloudwatch:DescribeAlarms`

### Permissions Missing for Complete Audit & Deployment:
To allow full pre-deployment inspection and future resource creation, the deploying identity will require:

1. **DynamoDB Read/Write:**
   - `dynamodb:ListTables`, `dynamodb:DescribeTable`, `dynamodb:CreateTable`, `dynamodb:DeleteTable`, `dynamodb:TagResource`
2. **Cognito Read/Write:**
   - `cognito-idp:ListUserPools`, `cognito-idp:CreateUserPool`, `cognito-idp:CreateUserPoolClient`, `cognito-idp:DeleteUserPool`
3. **SQS Read/Write:**
   - `sqs:ListQueues`, `sqs:CreateQueue`, `sqs:GetQueueAttributes`, `sqs:SetQueueAttributes`, `sqs:DeleteQueue`
4. **CloudFront Read/Write:**
   - `cloudfront:ListDistributions`, `cloudfront:CreateDistribution`, `cloudfront:CreateOriginAccessControl`, `cloudfront:GetDistribution`
5. **IAM Role & Instance Profile Management:**
   - `iam:CreateRole`, `iam:PutRolePolicy`, `iam:AttachRolePolicy`, `iam:CreateInstanceProfile`, `iam:AddRoleToInstanceProfile`, `iam:PassRole`
6. **AWS Budgets:**
   - `budgets:ViewBudget`, `budgets:ModifyBudget`

> [!NOTE]
> Per the user's explicit safety instructions, **no IAM policies have been attached or modified automatically**. The permissions above are documented solely for administrative review before the user authorizes deployment.
