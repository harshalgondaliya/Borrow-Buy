# BORROWBUY — FACULTY DEMO TEST RUNBOOK & ACADEMIC WALKTHROUGH

**Document Version:** 3.0.0 (Master Release)  
**Target Audience:** University Faculty & Academic Evaluators  
**AWS Account ID:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai)  

---

## 1. Verified Demo Personas & Credentials

| Persona Role | User Name | Email Address | Password | Core Responsibilities |
|---|---|---|---|---|
| **Customer** | Priya Shah | `priya.customer@borrowbuy.in` | `Password123!` | Equipment search, quotation calculation, booking hold, simulated escrow checkout, single-use pickup/return QR passes |
| **Owner** | Rajesh Patel | `rajesh.owner@borrowbuy.in` | `Password123!` | 25 listings management, rental request review, pickup QR scanning & handover verification, return inspection |
| **System Admin** | Admin | `admin@borrowbuy.in` | `Password123!` | Platform statistics, user governance, dispute management |

---

## 2. Recommended 15-Minute Academic Evaluation Walkthrough

### Part 1: Cloud Architecture Verification (3 Minutes)
Open terminal in project directory:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-aws-all-nine.ps1
```
Present the 9 live AWS services in Mumbai (`ap-south-1`): IAM, VPC, Budgets, EC2, EBS, S3, CloudWatch, SQS, Lambda.

### Part 2: Product Catalogue & Single-Image Compliance (3 Minutes)
1. Open catalogue at `/browse`.
2. Browse 116 equipment rental items across 25 categories.
3. Demonstrate that each product features strictly 1 relevant WebP image corresponding directly to its equipment name and category tag.
4. Filter by Gujarat commercial hubs (Ahmedabad, Surat, Vadodara, Rajkot).

### Part 3: Customer Rental Journey (4 Minutes)
1. Sign in as Priya Shah (`priya.customer@borrowbuy.in` / `Password123!`).
2. Select equipment and rental dates.
3. Note real-time quotation calculation (daily rate x days + 18% GST + refundable deposit).
4. Place 15-minute reservation hold.
5. Execute simulated checkout; deposit is isolated in escrow (`HELD`).
6. View active booking and generated **Single-Use Pickup QR Code Pass**.

### Part 4: Owner Handover & Deposit Release (3 Minutes)
1. Sign in as Rajesh Patel (`rajesh.owner@borrowbuy.in` / `Password123!`).
2. Open Owner Portal; locate Priya Shah's rental request.
3. Enter pickup QR token; booking transitions to `ACTIVE`.
4. Enter return QR token; complete return inspection (0 damage reported).
5. Booking transitions to `COMPLETED`; security deposit is **100% refunded** from escrow.
6. Submit mutual 5-star verified reviews.

### Part 5: CI/CD Automation & Cost Control (2 Minutes)
1. Display GitHub Actions deployment history (`deployments.log` shows commit `9efb611`).
2. Explain the $5.00/month AWS budget protection ($0.00 actual spend).
3. Demonstrate host stop/start commands for clean post-demo resource management:
   ```powershell
   aws ec2 stop-instances --instance-ids i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1
   ```
