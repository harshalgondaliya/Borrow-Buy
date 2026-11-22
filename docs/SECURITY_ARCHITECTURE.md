# BorrowBuy – Security Architecture & Threat Mitigation Framework

**Security Model:** Defense-in-Depth & Zero-Trust Ingress  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Compliance Standard:** OWASP Top 10 (2021) & AWS Well-Architected Security Pillar

---

## 1. OWASP Top 10 Threat Mitigation Matrix

| Vulnerability | Attack Vector in Rental Apps | BorrowBuy Mitigation Strategy | Implementation File |
|---|---|---|---|
| **A01: Broken Access Control** | Renter tries viewing other users' private bookings or receipts | Scoped Prisma queries enforcing `where: { customerId: req.user.id }` or owner ownership check; role-based guards (`OWNER`, `ADMIN`). | `backend/src/modules/bookings/` |
| **A02: Cryptographic Failures** | Exposing passwords, tokens, or unencrypted IDs | Passwords hashed using bcrypt (10 rounds); single-use QR tokens signed with HMAC-SHA256 and 15-minute expirations; HTTPS/TLS 1.3 enforced. | `backend/src/modules/qr/qr.service.ts` |
| **A03: Injection (SQL / NoSQL)** | SQL injection via search keywords or category filters | Prisma ORM uses parameterized queries exclusively; DynamoDB uses strict typed document client with `ExpressionAttributeValues`. | `backend/src/integrations/dynamodb/` |
| **A04: Insecure Design** | Double-booking high-value equipment or race conditions | Atomic PostgreSQL transactions (`prisma.$transaction`) with reservation lock checks and 15-minute hold timers. | `backend/src/modules/bookings/bookings.service.ts` |
| **A05: Security Misconfiguration** | S3 bucket publicly readable; debug headers exposed | S3 Public Access Blocked; Origin Access Control (OAC) restricts direct S3 access; pre-signed URLs with 15-minute TTLs; Helmet.js security headers. | `infra/terraform/modules/s3`<br>`backend/src/app.ts` |
| **A06: Vulnerable & Outdated Components** | Outdated NPM packages with CVEs | Node 20 LTS runtime; audited dependencies (`npm audit`); minimal production Docker image. | `Dockerfile` |
| **A07: Identification & Auth Failures** | Brute force password guessing | AWS WAFv2 rate limiting (1,000 req/5m); Express rate limiters on `/api/auth/*` (100 req/15m); password complexity enforcement. | `infra/terraform/modules/waf` |
| **A08: Software & Data Integrity Failures** | Tampering with return QR tokens or receipts | Cryptographic checksums; receipts generated server-side with immutable timestamps; immutable audit trail in DynamoDB. | `backend/src/integrations/dynamodb/` |
| **A09: Security Logging & Monitoring Failures** | Breaches occurring without administrative detection | Centralized CloudWatch logging; real-time DynamoDB audit logs; CloudWatch 5XX alarm triggers. | `backend/src/integrations/metrics/` |
| **A10: Server-Side Request Forgery (SSRF)** | Malicious image URLs entered by users | All image uploads are uploaded directly to S3 via pre-signed URLs or validated local storage; no arbitrary backend `curl`/fetching of remote URLs. | `backend/src/integrations/storage/` |

---

## 2. Encryption Standards

### 2.1 Encryption in Transit (In-Flight)
- **Edge Layer:** Amazon CloudFront terminates TLS 1.3 with managed ACM certificates. HTTP connections are redirected to HTTPS (301 Moved Permanently).
- **Backend Communication:** ALB forwards traffic to backend instances via private VPC subnets.
- **Administrative Access:** SSH/SSM sessions and Client VPN connections use TLS/SSH tunneling.

### 2.2 Encryption at Rest
- **Amazon S3:** Server-Side Encryption with Amazon S3 Managed Keys (`SSE-S3` / `aws:kms`) enabled on all buckets.
- **Amazon DynamoDB:** Native AWS KMS encryption enabled on `BorrowBuy-RentalAuditLogs`.
- **Amazon RDS / EBS:** Volume encryption enabled with standard AWS managed KMS keys.
- **Local Database:** PostgreSQL passwords salted and hashed with bcrypt.

---

## 4. Proposed Least-Privilege Deployment IAM Policy (Future Deployer Identity)

To transition from the current read-only audit identity (`borrowbuy-auditor`) to real deployment (`terraform apply`), a dedicated deployment user (e.g. `borrowbuy-deployer`) or role must be created. 

> [!SECURITY NOTICE]
> **Safety Guardrail:** Per security audit requirements, this policy is strictly documented here for administrative review and has **NOT** been applied or granted to any user.

### Proposed IAM Policy Document: `BorrowBuyDeploymentPolicy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VPCAndNetworkingProvisioning",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateVpc",
        "ec2:DeleteVpc",
        "ec2:DescribeVpcs",
        "ec2:ModifyVpcAttribute",
        "ec2:CreateSubnet",
        "ec2:DeleteSubnet",
        "ec2:DescribeSubnets",
        "ec2:ModifySubnetAttribute",
        "ec2:CreateInternetGateway",
        "ec2:DeleteInternetGateway",
        "ec2:AttachInternetGateway",
        "ec2:DetachInternetGateway",
        "ec2:DescribeInternetGateways",
        "ec2:CreateRouteTable",
        "ec2:DeleteRouteTable",
        "ec2:DescribeRouteTables",
        "ec2:CreateRoute",
        "ec2:DeleteRoute",
        "ec2:AssociateRouteTable",
        "ec2:DisassociateRouteTable",
        "ec2:CreateSecurityGroup",
        "ec2:DeleteSecurityGroup",
        "ec2:DescribeSecurityGroups",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:CreateTags",
        "ec2:DeleteTags",
        "ec2:DescribeTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EC2HostProvisioning",
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeImages",
        "ec2:DescribeVolumes",
        "ec2:AttachVolume",
        "ec2:DetachVolume"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3BucketProvisioning",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutEncryptionConfiguration",
        "s3:GetEncryptionConfiguration",
        "s3:PutBucketTagging",
        "s3:GetBucketTagging"
      ],
      "Resource": "arn:aws:s3:::borrowbuy-*"
    },
    {
      "Sid": "CloudFrontCDNProvisioning",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:DeleteOriginAccessControl",
        "cloudfront:GetOriginAccessControl",
        "cloudfront:ListDistributions",
        "cloudfront:TagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ServerlessLambdaAndApiGateway",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:ListFunctions",
        "lambda:TagResource",
        "apigateway:GET",
        "apigateway:POST",
        "apigateway:PUT",
        "apigateway:DELETE",
        "events:PutRule",
        "events:DeleteRule",
        "events:DescribeRule",
        "events:PutTargets",
        "events:RemoveTargets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBCognitoAndMessaging",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DeleteTable",
        "dynamodb:DescribeTable",
        "dynamodb:UpdateTable",
        "dynamodb:TagResource",
        "cognito-idp:CreateUserPool",
        "cognito-idp:DeleteUserPool",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:CreateUserPoolClient",
        "cognito-idp:DeleteUserPoolClient",
        "cognito-idp:DescribeUserPoolClient",
        "sqs:CreateQueue",
        "sqs:DeleteQueue",
        "sqs:GetQueueAttributes",
        "sqs:SetQueueAttributes",
        "sqs:TagQueue",
        "sns:CreateTopic",
        "sns:DeleteTopic",
        "sns:GetTopicAttributes",
        "sns:SetTopicAttributes",
        "sns:TagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "MonitoringAndBudgets",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:DeleteAlarms",
        "cloudwatch:DescribeAlarms",
        "cloudwatch:PutDashboard",
        "cloudwatch:DeleteDashboards",
        "cloudwatch:GetDashboard",
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:PutRetentionPolicy",
        "budgets:ViewBudget",
        "budgets:ModifyBudget"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMRoleCreationScopedToProfileA",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:CreateInstanceProfile",
        "iam:DeleteInstanceProfile",
        "iam:AddRoleToInstanceProfile",
        "iam:RemoveRoleFromInstanceProfile",
        "iam:GetInstanceProfile",
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/borrowbuy-*",
        "arn:aws:iam::*:instance-profile/borrowbuy-*"
      ]
    }
  ]
}
```
