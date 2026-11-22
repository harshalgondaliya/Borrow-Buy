# BorrowBuy — Public Demo CloudFront Infrastructure

This directory contains the infrastructure-as-code definition to expose BorrowBuy publicly over HTTPS using Amazon CloudFront edge distribution connected to our existing EC2 instance.

---

## 1. Architectural Overview

```
[Public Web Visitor]
        │
        │ HTTPS (Port 443)
        ▼
[Amazon CloudFront Distribution] (*.cloudfront.net)
   ├── Default (/*)    ──> Edge Cached Static React Bundle (Gzip/Brotli)
   ├── /images/*       ──> Edge Cached WebP Product Images
   └── /api/*          ──> Uncached (Managed-CachingDisabled) + Forward Authorization
        │
        │ HTTP (Port 80) with 'X-Origin-Verify: <secret>' header
        ▼
[EC2 Security Group: sg-033b02984ba31dc71] (Port 80 Allowed)
        │
        ▼
[EC2 Host: i-03347c2b6584c73cb] (Mumbai ap-south-1)
   └── Nginx (borrowbuy-proxy) ──> Express Backend (Port 5000) ──> PostgreSQL 16 (Port 5432)
```

---

## 2. Security and Cost Protection

1. **Zero Database Exposure**: Port 5432 is strictly internal loopback (127.0.0.1) and never exposed.
2. **Zero SSH Exposure**: Port 22 is closed. Host access is handled via AWS SSM.
3. **Origin Protection**: CloudFront passes a custom header `X-Origin-Verify`. Direct traffic bypassing CloudFront can be filtered.
4. **Zero Cache on APIs**: Authenticated API endpoints (`/api/*`) use AWS Managed-CachingDisabled (`4135ea2d-6df8-44a3-9df3-4b3e42644bad`) and forward `Authorization`, `Cookies`, and query parameters.
5. **SPA Routing**: 403/404 HTTP errors are transparently rewritten to `/index.html` with HTTP 200 to enable direct deep-linking on client-side React routes (`/browse`, `/bookings`, `/dashboard`, `/admin`).

---

## 3. Deployment Commands

### Option A: Via AWS CloudFormation CLI (Using Administrator or Root session)
```powershell
aws cloudformation deploy `
  --template-file "infra\public-demo\cloudfront-distribution.yml" `
  --stack-name "BorrowBuy-Public-CloudFront" `
  --region ap-south-1
```

### Option B: Retrieve Stack Outputs (Public URL)
```powershell
aws cloudformation describe-stacks `
  --stack-name "BorrowBuy-Public-CloudFront" `
  --region ap-south-1 `
  --query "Stacks[0].Outputs" `
  --output table
```

### Option C: Teardown / Cleanup After Demo
```powershell
aws cloudformation delete-stack `
  --stack-name "BorrowBuy-Public-CloudFront" `
  --region ap-south-1
```
