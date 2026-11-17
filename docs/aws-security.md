# BorrowBuy – Cloud Security Architecture & Hardening Baseline

**Target Region**: `ap-south-1` (Asia Pacific – Mumbai)  
**Security Level**: Production-Grade Academic Standard  
**Project**: BorrowBuy – Product Rental and Management Platform  
**Compliance Standard**: OWASP Top 10 & AWS Well-Architected Security Pillar  

---

## 1. Network Security & Perimeter Defense

```
[Public Internet]
       │ (Port 443 / 80 Only)
       ▼
┌────────────────────────────────────────────────────────┐
│ Amazon CloudFront (AWS Managed DDoS Protection)        │
│   ├── Enforces HTTPS Redirect                          │
│   ├── Origin Access Control (OAC) to S3               │
│   └── Restricts Malformed HTTP Verbs                   │
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ EC2 Host Security Group (borrowbuy-dev-ec2-host-sg)    │
│   ├── Inbound Port 80 (HTTP)                           │
│   ├── Inbound Port 443 (HTTPS)                         │
│   └── Inbound Port 22 (SSH): COMPLETELY BLOCKED (0/0)   │
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Isolated Docker Bridge Network (borrowbuy_net)         │
│   ├── Backend API (:5000) - Unexposed to Internet      │
│   └── PostgreSQL (:5432)  - Strictly Internal Only     │
└────────────────────────────────────────────────────────┘
```

### Key Perimeter Safeguards
1. **Zero Public Database Exposure**: Port 5432 is bound strictly to the internal Docker bridge network (`borrowbuy_net`). External ingress to PostgreSQL from the public internet is completely blocked.
2. **Zero Open SSH Ports**: Port 22 is omitted from security group rules. System administration is conducted exclusively through **AWS Systems Manager (SSM) Session Manager**, which authenticates via IAM, encrypts all shell traffic using TLS 1.3, and logs every command to AWS CloudTrail.
3. **Private S3 Uploads**: All user upload buckets have `block_public_acls = true`, `block_public_policy = true`, `ignore_public_acls = true`, and `restrict_public_buckets = true`. Direct browser access to bucket URLs returns HTTP 403 Forbidden.

---

## 2. Identity & Access Management (IAM) Least Privilege

BorrowBuy enforces granular, role-based access policies with zero wildcards on sensitive write actions:

| IAM Role / Identity | Trust Policy Principal | Attached Policies & Permissions | Purpose |
|---|---|---|---|
| `borrowbuy-dev-ec2-host-role` | `ec2.amazonaws.com` | `AmazonSSMManagedInstanceCore`<br>`CloudWatchAgentServerPolicy`<br>Custom S3 Upload Policy (`s3:PutObject`, `s3:GetObject`) | Allows EC2 host to stream logs, receive SSM sessions, and handle S3 operations |
| `borrowbuy-github-actions-role` | `token.actions.githubusercontent.com` (OIDC) | `AmazonEC2ContainerRegistryPowerUser`<br>`ssm:SendCommand` (Scoped to EC2 instance)<br>`s3:Sync` (Frontend bucket only) | Enables automated CI/CD deployments without storing static AWS access keys |
| Application Users (JWT) | End-User Client | Scoped JWT tokens with role claims (`CUSTOMER`, `OWNER`, `ADMIN`) | Restricts administrative APIs to verified administrators |

---

## 3. Application Security & Data Protection

### A. Authentication & Password Security
- Passwords are encrypted using **bcrypt** with a salt work factor of 10.
- Raw passwords and reset tokens are never stored in plaintext or logged.
- Single-use password reset tokens expire in 1 hour and are invalidated immediately upon redemption.

### B. Single-Use Cryptographic QR Handover Tokens
- Equipment pick-up and return handovers use single-use cryptographic verification tokens (`BB-PICKUP-...` and `BB-RETURN-...`).
- Each token is time-bounded (15-minute validity window) and transitions the booking state machine atomically. Replay attacks are mathematically prevented.

### C. Input Sanitization & SQL Injection Prevention
- All user input is strictly validated through **Zod schemas** before reaching business logic controllers.
- Database access utilizes **Prisma ORM** with parameterized queries, eliminating SQL injection vectors.

### D. Security Deposit Isolation
- Security deposits are tracked in dedicated database columns and held in an isolated escrow state until mutual inspection verification is confirmed by both renter and owner.
