# BORROWBUY — CLOUD SECURITY & PERIMETER DEFENSE REPORT

**Execution Date:** November 23, 2026  
**AWS Account ID:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai, India)  

---

## 1. Perimeter Defense & Ingress Restriction

- **Security Group `sg-033b02984ba31dc71`:**
  - Inbound Rules: `0` (`IpPermissions: []`).
  - Raw `0.0.0.0/0` Ingress: **100% ELIMINATED**.
  - Direct connection to `http://ec2-13-206-100-236.ap-south-1.compute.amazonaws.com` times out immediately.
  - SSH (Port 22): **CLOSED**. Zero bastion hosts; host managed exclusively via AWS Systems Manager (SSM).
  - PostgreSQL (Port 5432): **CLOSED** to public traffic; loopback binding only.

---

## 2. Nginx Origin Header Validation

- **Secret Token:** 64-character hexadecimal token stored in `/home/ec2-user/app/.origin-secret` (POSIX `600`).
- **Live SSM Verification Results:**
  - `curl http://127.0.0.1:80/api/health` without header: **HTTP 403 Forbidden** (PASS)
  - `curl -H "X-Origin-Verify: wrong-token" http://127.0.0.1:80/api/health`: **HTTP 403 Forbidden** (PASS)
  - `curl -H "X-Origin-Verify: <valid-secret>" http://127.0.0.1:80/api/health`: **HTTP 200 OK** (PASS)
  - `curl http://127.0.0.1:80/` without header: **HTTP 403 Forbidden** (PASS)
  - `curl -H "X-Origin-Verify: <valid-secret>" http://127.0.0.1:80/`: **HTTP 200 OK** (PASS)

---

## 3. Temporary Security Limitation Disclosure

> [!NOTE]
> The origin hop between CloudFront edge proxies and the EC2 host travels over HTTP (Port 80) across AWS's private global network. While secured by the CloudFront managed prefix list and the 64-character secret header, this connection is unencrypted. This configuration is suitable for academic demonstration with synthetic demo personas and simulated payments. For production deployment with real customer credit cards, the production roadmap entails registering a custom domain and issuing public TLS certificates via AWS Certificate Manager and Let's Encrypt / Certbot.
