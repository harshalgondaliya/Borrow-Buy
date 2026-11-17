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

## 3. AWS IAM Least-Privilege Policy Model

IAM permissions adhere strictly to least-privilege principles:
- **Backend Application Role:** Granted only `s3:GetObject`, `s3:PutObject` on the specific `borrowbuy-product-assets` bucket, `dynamodb:PutItem`, `dynamodb:Query` on `BorrowBuy-RentalAuditLogs`, and `cloudwatch:PutMetricData`.
- **Admin Root Account:** Multi-Factor Authentication (MFA) enabled; root credentials are never embedded in source code or `.env` files.
