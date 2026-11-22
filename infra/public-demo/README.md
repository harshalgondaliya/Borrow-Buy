# BorrowBuy — Secure Public CloudFront Infrastructure

This directory contains the infrastructure-as-code definition to securely expose the BorrowBuy equipment rental platform publicly over HTTPS using Amazon CloudFront edge distribution connected to the existing EC2 host (`i-03347c2b6584c73cb`) in `ap-south-1` (Mumbai).

---

## 1. Architectural Overview & Network Design

```
[Public Web Visitors / Evaluators]
        │
        │ HTTPS (Port 443, TLS 1.2 / TLS 1.3)
        ▼
[Amazon CloudFront Distribution] (*.cloudfront.net)
   ├── PriceClass_200 (India, Asia, Europe, Middle East, North America)
   ├── Default (/*)    ──> Edge Cached Static React Bundle (Managed-CachingOptimized)
   ├── /images/*       ──> Edge Cached WebP Product Images (Managed-CachingOptimized)
   └── /api/*          ──> Uncached (Managed-CachingDisabled) + Forward Auth Headers & Cookies
        │
        │ HTTP (Port 80) with 'X-Origin-Verify: <secret>' header
        │ Source restricted to CloudFront Origin-Facing Managed Prefix List (pl-9aa247f3)
        ▼
[EC2 Security Group: sg-033b02984ba31dc71]
   ├── Port 80 Ingress: STRICTLY limited to pl-9aa247f3 (NO 0.0.0.0/0 ingress)
   ├── Port 5432 (PostgreSQL): Loopback only (NOT exposed to public)
   └── Port 22 (SSH): Closed (Host access via AWS SSM)
        │
        ▼
[EC2 Host: i-03347c2b6584c73cb] (Mumbai ap-south-1)
   ├── Nginx (borrowbuy-proxy :80)
   │     ├── Serves React SPA (try_files $uri $uri/ /index.html for route-aware deep-linking)
   │     └── Proxies /api/* to Express API (preserving real 400/401/403/404/500 status codes)
   ├── Express Backend (:5000)
   └── PostgreSQL 16 (:5432) on persistent EBS volume (vol-0e48159e9bb02b52c)
```

---

## 2. Key Security & Operational Corrections

1. **Elimination of `0.0.0.0/0` Ingress**:
   - The security group ingress rule strictly uses `SourcePrefixListId: pl-9aa247f3` (`com.amazonaws.global.cloudfront.origin-facing`).
   - Direct inbound internet traffic attempting to bypass CloudFront is dropped at the AWS network edge.
2. **Subnet & VPC Architecture Evaluation**:
   - The EC2 instance resides in `borrowbuy-public-1a` (`subnet-0ca0dd3ae36f6e293`).
   - Placing EC2 into a private subnet for CloudFront VPC Origin would sever outbound connectivity required for AWS SSM management, GitHub Actions CD pulls, S3 uploads, SQS events, and CloudWatch telemetry unless an AWS NAT Gateway is provisioned.
   - An AWS NAT Gateway costs **$32.40/month minimum**, violating the project's strict **$5.00/month AWS budget**.
   - The secure restricted alternative—CloudFront Managed Prefix List (`pl-9aa247f3`) combined with origin header verification (`X-Origin-Verify`) and edge HTTPS redirection—provides enterprise-grade perimeter isolation at **$0.00 incremental cost**.
3. **No Committed Origin Secrets**:
   - The predictable default origin verification string has been completely removed.
   - Stack deployment requires a cryptographically strong runtime secret (`NoEcho: true`, min length 24 characters).
4. **Preservation of Real API Error Codes**:
   - Distribution-wide `CustomErrorResponses` (403/404 -> 200) has been removed.
   - Express API error status codes (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error) are delivered cleanly to the browser.
   - React Single-Page Application (SPA) client-side routing (`/browse`, `/bookings`, `/dashboard`) is handled by Nginx via `try_files $uri $uri/ /index.html`.
5. **Cost & Billing Protection**:
   - Uses `PriceClass_200`, covering India, Asia, Europe, Middle East, and North America while avoiding expensive South America edge locations.
   - CloudFront free tier covers 1 TB/month data transfer out and 10,000,000 requests/month forever.
   - Total incremental AWS monthly spend is **$0.00**.

---

## 3. Deployment Commands

### Option A: Via AWS Management Console (Recommended)
1. Sign in to AWS Management Console in region `ap-south-1` (Mumbai).
2. Open **CloudFormation** > **Create stack** > **With new resources**.
3. Upload `infra/public-demo/cloudfront-distribution.yml`.
4. Enter Stack name: `BorrowBuy-Public-CloudFront`.
5. Under `OriginVerifyHeaderValue`, provide a generated 32-character random string (e.g., generated with `[System.Guid]::NewGuid().ToString()`).
6. Click **Next** through default parameters and click **Submit**.
7. Once status reaches `CREATE_COMPLETE`, view the public HTTPS URL in the **Outputs** tab.

### Option B: Via AWS CloudFormation CLI
```powershell
$secret = [System.Guid]::NewGuid().ToString("N") + [System.Guid]::NewGuid().ToString("N")

aws cloudformation deploy `
  --template-file "infra\public-demo\cloudfront-distribution.yml" `
  --stack-name "BorrowBuy-Public-CloudFront" `
  --parameter-overrides OriginVerifyHeaderValue=$secret `
  --region ap-south-1
```

### Stack Outputs Verification
```powershell
aws cloudformation describe-stacks `
  --stack-name "BorrowBuy-Public-CloudFront" `
  --region ap-south-1 `
  --query "Stacks[0].Outputs" `
  --output table
```
