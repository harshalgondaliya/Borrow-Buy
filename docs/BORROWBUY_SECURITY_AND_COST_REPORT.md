# BORROWBUY — CLOUD SECURITY ARCHITECTURE & COST AUDIT REPORT

**Document Version:** 1.0.0 (Master Release)  
**AWS Account ID:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai, India)  
**Budget Limit:** `$5.00 USD/month`  
**Actual Monthly Spend:** `$0.00 USD`  
**Incremental Edge Cost:** `$0.00 USD`  

---

## 1. Security Architecture & Threat Mitigation Matrix

BorrowBuy implements defense-in-depth across the network, application, host, and cloud governance layers. The design strictly enforces the principle of least privilege, eliminates public attack surfaces, and protects customer and owner data.

```
═══════════════════════════════════════════════════════════════════════════════
                      BORROWBUY DEFENSE-IN-DEPTH SECURITY MODEL
═══════════════════════════════════════════════════════════════════════════════

   [ Edge Layer ]       CloudFront Global Edge CDN
                        ├── HTTPS Only (TLS 1.2 / TLS 1.3 Termination)
                        ├── DDOS Mitigation (AWS Shield Standard)
                        └── Injects Cryptographic 'X-Origin-Verify' Header
                                │
   [ Perimeter Layer ]  AWS VPC Security Group (sg-033b02984ba31dc71)
                        ├── Port 80 Ingress: STRICTLY LIMITED to pl-9aa247f3
                        │   (AWS CloudFront Origin-Facing Managed Prefix List)
                        ├── 0.0.0.0/0 raw public ingress is 100% BLOCKED
                        ├── Port 22 (SSH): 100% CLOSED (No Bastion Host)
                        └── Port 5432 (PostgreSQL): 100% CLOSED (Loopback only)
                                │
   [ Transport Layer ]  Nginx Origin Reverse Proxy (borrowbuy-proxy :80)
                        ├── Header Validation: $http_x_origin_verify == $SECRET
                        │   (Missing or Invalid -> Immediate 403 Forbidden)
                        ├── Strips Internal Origin Headers
                        └── Serves Static Assets & Proxies /api/*
                                │
   [ Application Layer] Express REST API Backend (Port 5000)
                        ├── Role-Based Access Control (RBAC): CUSTOMER, OWNER, ADMIN
                        ├── JWT Authentication (HMAC SHA-256 with 7-day expiration)
                        ├── Cryptographic Single-Use QR Pass Generation (HMAC-SHA256)
                        ├── Zod Strict Schema Validation on all input payloads
                        └── Data Isolation: Owner A cannot see Owner B listings;
                            Customer A cannot view Customer B bookings
                                │
   [ Data Layer ]       PostgreSQL 16 & Persistent Storage
                        ├── Encrypted at Rest: AWS KMS (gp3 EBS vol-0e48159e9bb02b52c)
                        ├── Amazon S3: SSE-AES256, 4 Public Access Blocks Enabled
                        └── Escrow Security Deposit Isolation (Zero Plaintext Cards)
```

---

## 2. In-Depth Security Layer Analysis

### 2.1 Perimeter & Ingress Security
- **Elimination of `0.0.0.0/0` Ingress:** The EC2 instance security group (`sg-033b02984ba31dc71`) completely removes unrestricted internet ingress. Direct port scans or automated exploit payloads directed at the EC2 public IP (`13.206.100.236`) are dropped at the AWS network edge.
- **AWS Managed Prefix List (`pl-9aa247f3`):** Only legitimate AWS CloudFront edge proxies belonging to `com.amazonaws.global.cloudfront.origin-facing` are permitted to establish TCP connections on port 80.
- **Port 22 (SSH) Inactive:** The host eliminates SSH entirely. Administrative access and deployment automation are conducted exclusively through encrypted AWS Systems Manager (SSM) sessions authenticated via AWS IAM.
- **Port 5432 (PostgreSQL) Isolation:** PostgreSQL listens strictly inside its Docker container and binds only to loopback (`127.0.0.1:5432`). It is completely unroutable from external networks.

### 2.2 Origin Verification & Defense Against Edge Bypass
- **Cryptographic Header Verification:** Even if an attacker were to discover the origin EC2 IP and attempt to spoof traffic within an AWS region, Nginx validates the `X-Origin-Verify` header on every request to `/` and `/api/*`.
- **Secret Generation:** The secret is a 64-character hexadecimal token (256 bits of entropy) stored in `/home/ec2-user/app/.origin-secret` with POSIX permissions `600`.
- **Zero Whitelist Bypass:** All local or gateway IP whitelist bypasses (`172.17.0.1`, `127.0.0.1`) have been eradicated from Nginx, ensuring that 100% of external HTTP requests must present the valid token to receive an HTTP 200 response. Missing or incorrect headers immediately return HTTP 403 Forbidden.

### 2.3 Identity & Least-Privilege IAM Governance
- **No Long-Lived Credentials in CI/CD:** GitHub Actions authenticates via AWS OpenID Connect (OIDC) using short-lived STS tokens bound specifically to repository `harshalgondaliya/Borrow-Buy` and environment `production`.
- **Scoped Host Profile:** The EC2 host instance profile (`BorrowBuy-EC2-SSM-Role`) contains permissions strictly scoped to `borrowbuy-*` S3 buckets, SQS queues, and CloudWatch log groups. It cannot create or delete arbitrary AWS resources.
- **Zero Root Account Utilization:** Deployments, audits, and operational tasks are executed exclusively under IAM user `borrowbuy-admin`, preserving root account isolation.

---

## 3. Temporary Security Limitation Disclosure & Roadmap

### 3.1 Unencrypted Origin Hop Limitation (HTTP Port 80)
- **Current Architecture:** Traffic between public client browsers and the CloudFront edge is fully encrypted over **HTTPS (Port 443, TLS 1.2 / TLS 1.3)**. However, the origin connection from CloudFront edge proxies to the EC2 host currently travels over **HTTP (Port 80)**.
- **Risk Assessment:** This origin hop traverses the AWS global private backbone network between CloudFront point-of-presence (PoP) edge locations and the Mumbai region (`ap-south-1`). Because port 80 is restricted to CloudFront origin IPs via `pl-9aa247f3` and protected by the 64-character secret header, the attack surface is tightly constrained.
- **Evaluation Suitability:** For university faculty evaluation, academic demonstration, and testing with synthetic demo personas, this configuration provides robust perimeter security and zero-cost operation.
- **Production Roadmap to End-to-End TLS:**
  1. Register a custom domain (e.g., `borrowbuy.in` or use a free dynamic DNS subdomain).
  2. Request a free public SSL/TLS certificate via AWS Certificate Manager (ACM) for CloudFront viewer termination.
  3. Install a Let's Encrypt / Certbot TLS certificate on EC2 Nginx (or deploy AWS Private CA / self-signed certificate with CloudFront custom origin trust).
  4. Update `CustomOriginConfig.OriginProtocolPolicy` in CloudFormation to `https-only` with `OriginSSLProtocols: [TLSv1.2]`.

---

## 4. Comprehensive Cost Analysis & Budget Protection

### 4.1 Strict $5.00/Month AWS Budget Compliance
BorrowBuy was engineered under an uncompromising financial constraint: **monthly AWS spend must not exceed $5.00 USD**.

```
═══════════════════════════════════════════════════════════════════════════════
                      BORROWBUY MONTHLY COST BREAKDOWN
═══════════════════════════════════════════════════════════════════════════════

   Service Component           Allocation & Tier                     Cost/Month
   ─────────────────────────────────────────────────────────────────────────────
   Amazon CloudFront           Always-Free Tier (1 TB Out, 10M Req)     $0.00
   Amazon EC2 (t3.small)       Demo Hours (~20 hrs @ $0.0208/hr)        $0.42
   Amazon EBS (20 GiB gp3)     EBS Allocation (20 GB @ $0.08/GB)        $1.60
   Amazon S3                   Standard (Under 5 GB Free Tier)          $0.00
   Amazon CloudWatch           3 Dashboards, 10 Alarms Free Tier        $0.00
   Amazon SQS                  First 1,000,000 Requests/Month Free      $0.00
   AWS Lambda                  1,000,000 Invocations/Month Free         $0.00
   AWS Budgets                 First 2 Budgets Free                     $0.00
   AWS Systems Manager         Core Features (Session Manager/SSM)      $0.00
   ─────────────────────────────────────────────────────────────────────────────
   PROJECTED MONTHLY TOTAL                                              $2.02
   AUTHORIZED BUDGET CEILING                                            $5.00
   REMAINING FINANCIAL BUFFER                                           $2.98
```

### 4.2 Prohibited High-Cost Cloud Services Avoided
To guarantee zero budget overruns, the following expensive enterprise AWS services were deliberately avoided:
1. **AWS Application Load Balancer (ALB):** Costs **$16.20/month** base ($0.0225/hr) + LCU charges. *Avoided in favor of CloudFront edge routing ($0.00).*
2. **AWS NAT Gateway:** Costs **$32.40/month** base ($0.045/hr) + $0.045/GB data processing. *Avoided by using public subnet with Managed Prefix List security ($0.00).*
3. **Amazon RDS for PostgreSQL:** Costs **$15.00+/month** for `db.t3.micro`. *Avoided by hosting containerized PostgreSQL 16 on persistent KMS-encrypted EBS ($1.60).*

### 4.3 Demo Resource Management (Start / Stop Procedure)
To ensure the project stays well under the $5.00 budget ceiling after faculty evaluation:
- **Stop EC2 Instance (Preserves all database data on EBS):**
  ```powershell
  aws ec2 stop-instances --instance-ids i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1
  ```
- **Start EC2 Instance for Demonstration:**
  ```powershell
  aws ec2 start-instances --instance-ids i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1
  ```
- **Teardown Edge Distribution (If evaluation is complete):**
  ```powershell
  aws cloudformation delete-stack --stack-name BorrowBuy-Public-CloudFront --region ap-south-1
  ```
