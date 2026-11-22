# BORROWBUY — FACULTY DEMONSTRATION & EVALUATION RUNBOOK

**Document Version:** 3.0.0 (Master Release)  
**Target Audience:** University Faculty, Project Evaluators, Cloud Computing Professors  
**AWS Account ID:** `767579108846`  
**Target AWS Region:** `ap-south-1` (Mumbai, India)  
**Public Website URL:** `https://<cloudfront-domain-name>` (Retrieved via CloudFormation)  
**Total Evaluation Time:** 15 – 20 Minutes  

---

## 1. Faculty Evaluation Overview

This runbook provides an end-to-end, reproducible evaluation guide for university faculty to assess the **BorrowBuy Equipment Rental and Management Platform**. The demonstration showcases:
1. **Public Cloud Accessibility:** Accessible from any standard internet browser over HTTPS without an AWS SSM tunnel or local port-forwarding.
2. **Multi-Service AWS Architecture:** Direct integration of 9 distinct AWS services operating in Mumbai (`ap-south-1`).
3. **Enterprise Defense-in-Depth:** Zero open public ingress (`0.0.0.0/0`), CloudFront Managed Prefix List (`pl-9aa247f3`), and cryptographic origin header validation (`X-Origin-Verify`).
4. **Full Rental Lifecycle:** Renter reservation holds, simulated payments with escrow deposit isolation, cryptographic single-use QR pickup/return passes, and mutual reviews.
5. **Continuous Deployment Automation:** Automatic testing and host deployment powered by GitHub Actions and AWS OIDC.

---

## 2. Safe Demo Account Credentials

All accounts use pre-seeded test data with safe, simulated payments. Do not enter real credit card details or production personal credentials.

| Persona Role | Account Name | Email Address | Password | Key Responsibilities |
|---|---|---|---|---|
| **Customer (Renter)** | Priya Shah | `priya.customer@borrowbuy.in` | `Password123!` | Equipment search, quotation calculation, booking hold, escrow payment, pickup/return QR passes |
| **Owner (Vendor)** | Rajesh Patel | `rajesh.owner@borrowbuy.in` | `Password123!` | 25 Gujarat equipment listings, rental request approval, QR pass scanning & verification, return inspection |
| **Admin (Platform)** | System Admin | `admin@borrowbuy.in` | `Password123!` | Platform-wide metrics, user governance, booking overview, dispute resolution |

---

## 3. Recommended Faculty Demonstration Sequence (7 Phases)

### Phase 1: Public Website & Equipment Catalogue (3 Minutes)
1. Open the public HTTPS URL in Google Chrome or Microsoft Edge.
2. Confirm the secure padlock icon (`HTTPS`, Port 443, TLS 1.2/1.3).
3. Demonstrate the premium React homepage:
   - Dynamic search bar with autocomplete across 116 curated items.
   - 25 equipment categories (e.g., *Cameras & Lenses*, *Construction*, *Audio Equipment*, *Drones*, *Agriculture*).
   - City filter for Gujarat commercial hubs (*Ahmedabad*, *Surat*, *Vadodara*, *Rajkot*).
4. Verify that each product card features **strictly one relevant, high-resolution WebP image** corresponding 100% to its title and category.
5. Test client-side SPA direct navigation: Refresh `/browse` or open in a new tab; confirm index.html loads cleanly without 404.

---

### Phase 2: Customer Rental Workflow (4 Minutes)
1. Click **Sign In** and authenticate as Priya Shah (`priya.customer@borrowbuy.in` / `Password123!`):
   - Review initial trust score (5.0).
2. Search for an available equipment item (e.g., *Sony Alpha a7 IV Mirrorless Camera* or *DJI Mini 4 Pro Drone*).
3. Click on the product card to navigate to `/product/:id`.
4. Select rental dates (e.g., 3 days starting next week).
5. Highlight the real-time quotation calculation breakdown:
   - Daily rental rate x duration.
   - Platform service fee + 18% GST.
   - Refundable security deposit (held in escrow).
6. Click **Book Equipment**. Point out that a 15-minute temporary reservation hold is placed in the database to prevent double bookings.
7. Click **Proceed to Payment**. Select the simulated payment option and confirm checkout.
8. Navigate to **My Bookings** (`/bookings`). Show the active reservation, receipt, and generated **Single-Use Pickup QR Code Pass**.

---

### Phase 3: Owner Handover & Return Verification (4 Minutes)
1. Open an incognito browser window or log out and log in as Rajesh Patel (`rajesh.owner@borrowbuy.in` / `Password123!`).
2. Navigate to the **Owner Portal** (`/owner`).
3. View **My Listings**: Highlight the 25 equipment listings assigned to Rajesh with pricing and availability toggles.
4. View **Rental Requests**: Locate the booking request submitted by Priya Shah.
5. Demonstrate the **Cryptographic Handover Verification**:
   - In a production physical handover, the owner scans the customer's QR pass.
   - In the demo UI, enter the pickup token code from the customer's booking pass.
   - Click **Verify Pickup**. The booking status transitions immediately from `CONFIRMED` to `ACTIVE`.
6. Demonstrate the **Return & Inspection Workflow**:
   - At the end of the rental period, the customer generates a Return QR pass.
   - The owner verifies the return code and marks equipment inspection as complete (0 damage reported).
   - Booking transitions to `COMPLETED`.
   - The customer's security deposit is **100% released and refunded** from escrow.

---

### Phase 4: Mutual Verified Reviews (2 Minutes)
1. Switch back to the Customer portal.
2. In the completed booking card, click **Leave Review**.
3. Submit a 5-star rating with constructive feedback.
4. Point out that BorrowBuy requires a completed booking before reviews can be posted, preventing fake reviews.

---

### Phase 5: Live AWS 9-Service Verification (3 Minutes)
Open a terminal in the project directory and run the automated AWS verification suite:
```powershell
powershell -ExecutionPolicy Bypass -File "scripts/verify-aws-all-nine.ps1"
```
Walk the faculty through the live output confirming all 9 AWS services:
1. **IAM:** Identity `borrowbuy-admin` authenticated with 7 managed policies and zero root usage.
2. **VPC:** VPC `vpc-0cbfb3929d621f2db` with 4 subnets across 2 AZs and attached Internet Gateway.
3. **AWS Budgets:** Active $5.00 monthly cap with $0.00 spend and HEALTHY status.
4. **EC2:** Host `i-03347c2b6584c73cb` (`t3.small`) running in Mumbai with SSM agent connected.
5. **EBS:** Volume `vol-0e48159e9bb02b52c` (20 GiB gp3) KMS-encrypted with persistent PostgreSQL data.
6. **S3:** Bucket `borrowbuy-dev-assets` with SSE-AES256 encryption and public access blocks.
7. **CloudWatch:** Log group `/borrowbuy/application-logs` and 2 active alarms in OK state.
8. **SQS:** Queue `borrowbuy-dev-events` with dead-letter queue processing asynchronous events.
9. **Lambda:** Serverless function `borrowbuy-quote-calculator-dev` responding with quotation calculations.

---

### Phase 6: Automated CI/CD Demonstration (2 Minutes)
1. Open the GitHub repository at `https://github.com/harshalgondaliya/Borrow-Buy/actions`.
2. Display the latest workflow runs:
   - **CI Pipeline:** Shows passing Prisma validation, client generation, Vitest unit tests, 103 backend integration tests, and production Vite builds.
   - **CD Pipeline:** Shows passwordless AWS OIDC authentication and automated SSM deployment to EC2.
3. Explain the host deployment hardening:
   - Atomic checkout with untracked file conflict resolution.
   - Retention of `/home/ec2-user/app/.origin-secret`.
   - Automated 15-retry post-deployment health check.
   - Automatic rollback via `scripts/rollback-ec2.sh` if any check fails.

---

### Phase 7: Clean Teardown / Post-Demo Cost Control (1 Minute)
Explain how the project guarantees zero cost overruns after evaluation:
- **To pause EC2 compute charges (keeps database data intact on EBS):**
  ```powershell
  aws ec2 stop-instances --instance-ids i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1
  ```
- **To resume for subsequent evaluations:**
  ```powershell
  aws ec2 start-instances --instance-ids i-03347c2b6584c73cb --profile borrowbuy-admin --region ap-south-1
  ```
