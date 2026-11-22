# BORROWBUY — CLOUD SECURITY & IAM LEAST-PRIVILEGE AUDIT

**Document Version:** 2.0.0  
**Audit Date:** November 22, 2026  
**Security Posture:** Hardened Academic Production Baseline  
**Target AWS Account:** `767579108846`  
**Region:** `ap-south-1` (Mumbai)  

---

## 1. Executive Summary

A comprehensive security audit of BorrowBuy's cloud architecture was conducted, covering IAM user privileges, instance profile configurations, network isolation boundaries, cryptographic controls, and secret management. 

The architecture strictly adheres to the **AWS Well-Architected Security Pillar**:
- **Zero Inbound Attack Surface:** The EC2 host exposes 0 open inbound ports to the public internet (`IpPermissions: []`). All administrative and debugging access is handled securely via AWS Systems Manager Session Manager (SSM).
- **Strict IAM Least-Privilege:** The auditor/deployer IAM identity (`borrowbuy-admin`) cannot modify billing accounts, create root credentials, or access unauthorized AWS services.
- **Data at Rest & Transit Encryption:** The persistent EBS volume is encrypted with AWS KMS (`ac73acbc-a143-49eb-9293-bc443369f096`). S3 and SQS configurations enforce AES256 / KMS server-side encryption.

---

## 2. IAM User Privilege & Policy Audit (`borrowbuy-admin`)

### 2.1 Managed Policies
1. `BorrowBuy-VPC-Deployment-Policy`:
   - Scoped strictly to `aws:RequestedRegion: ap-south-1`.
   - Permits VPC, subnet, route table, internet gateway, and security group inspection and resource creation.
   - Prevents cross-region modifications.
2. `BorrowBuy-SessionManager-Access`:
   - Limits SSM shell sessions strictly to instances tagged `Project: BorrowBuy`.
   - Forces execution through the standard `SSM-SessionManagerRunShell` document.
   - Session termination and data channel operations are scoped to the user's specific session ID.
3. `IAMReadOnlyAccess`: Permits read-only inspection of roles, policies, and instance profiles for auditing purposes.
4. `AWSBudgetsReadOnlyAccess`: Permits read-only monitoring of budget thresholds and actual spend.
5. `SignInLocalDevelopmentAccess` & `IAMUserChangePassword`: Self-service security compliance.

### 2.2 Inline Scoped Policies
- `BorrowBuy-EC2-Console-Read`: Authorizes `ec2:GetSecurityGroupsForVpc` strictly in Mumbai.
- `BorrowBuy-EC2-InstanceProfile-Access`: Allows `iam:PassRole` *only* to the specific role `BorrowBuy-EC2-SSM-Role` and *only* when passed to the EC2 service (`ec2.amazonaws.com`).
- `BorrowBuy-Temporary-EC2-Launch`: Scoped to `ec2:RunInstances` in Mumbai with mandatory project tagging.

---

## 3. Network Security & Perimeter Defense

### 3.1 Security Group Configuration (`borrowbuy-ec2-sg` / `sg-033b02984ba31dc71`)
- **Inbound Rules (Ingress):**
  - Ports: **None** (`[]`).
  - SSH (port 22): **Closed**.
  - Direct HTTP/HTTPS: **Closed**.
  - Risk Assessment: Zero risk of brute-force SSH attacks, automated network port scanning, or unauthenticated internet exploits.
- **Outbound Rules (Egress):**
  - Protocol: All (`-1`)
  - Destination: `0.0.0.0/0`
  - Purpose: Allows the EC2 instance to communicate with AWS Systems Manager endpoints, package repositories (Amazon Linux yum/dnf), and external payment simulators.

### 3.2 Bastion-Less Administrative Architecture (AWS Systems Manager)
- No public IP requirement for administrative SSH.
- IAM Instance Profile: `arn:aws:iam::767579108846:instance-profile/BorrowBuy-EC2-SSM-Role`
- Role: `BorrowBuy-EC2-SSM-Role` with `AmazonSSMManagedInstanceCore`
- All administrator sessions are authenticated via AWS IAM credentials, recorded in AWS CloudTrail, and logged.

---

## 4. Cryptographic Storage & Secrets Protection

### 4.1 Storage Encryption
- **Amazon EBS (`vol-0e48159e9bb02b52c`):**
  - Encrypted: `true`
  - KMS Key ID: `arn:aws:kms:ap-south-1:767579108846:key/ac73acbc-a143-49eb-9293-bc443369f096`
  - All data blocks written to the PostgreSQL database and host filesystem are encrypted on physical media before persisting.
- **Amazon S3 Asset Bucket:**
  - Configured with `ServerSideEncryptionConfiguration` enforcing `AES256` or `aws:kms`.
  - Public access block enabled across all 4 parameters (`block_public_acls`, `ignore_public_acls`, `block_public_policy`, `restrict_public_buckets`).
- **Amazon SQS Queues:**
  - Configured with Server-Side Encryption (`sqs_managed_sse_enabled = true`).

### 4.2 Application Secrets & Credentials Handling
- Zero plaintext passwords or secret access keys are committed to Git or hardcoded in source code.
- Backend configuration uses Zod environment validation (`backend/src/config/env.ts`) ensuring all sensitive values are read from environment variables or AWS Parameter Store.
- Payment driver is configured to `simulation` mode for academic verification, preventing accidental charges or external banking API leaks.

---

## 5. Security Recommendations for Future Phases

1. **Production Ingress (When exposing to web users):**
   - Attach an Application Load Balancer (ALB) in public subnets with AWS Certificate Manager (ACM) SSL/TLS.
   - Update `borrowbuy-ec2-sg` to allow ingress port 5000/80 *only* from the ALB security group (`sg-alb`), maintaining zero direct internet exposure to the host.
2. **CloudWatch Log Group Policy:**
   - Authorize `borrowbuy-admin` to read CloudWatch logs and metrics directly via IAM policy update for enhanced live observability.
