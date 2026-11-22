# BorrowBuy — Live Faculty Demonstration Runbook

**Audience:** Faculty Evaluators, Capstone Reviewers & Cloud Architecture Assessors  
**Project:** BorrowBuy — Peer-to-Peer Equipment Rental Platform  
**Target AWS Account:** `767579108846`  
**Region:** `ap-south-1` (Mumbai)  

---

## 1. Verified Demonstration Accounts

| Role | Email Address | Password | Portfolio & Privileges |
|---|---|---|---|
| **Verified Equipment Owner** | `owner@borrowbuy.in` | `Password123!` | 25 active listings (Sony A7 IV, Canon R6, GoPro 12, Bose PA, etc.), 2 incoming rental requests, active handovers |
| **Active Customer Renter** | `customer@borrowbuy.in` | `Password123!` | 1 active rental (Sony 70-200mm GM II) with Return Pass QR, 1 confirmed upcoming rental with Pickup Pass QR |
| **Platform Administrator** | `admin@borrowbuy.in` | *(Password set in backend/.env)* | Full governance console, dispute mediation, user moderation, platform telemetry |

> [!NOTE]
> Demo accounts are permanently seeded with valid bcrypt hashes and active inventories in the PostgreSQL database on our persistent EBS volume.

---

## 2. Recommended Faculty Demonstration Walkthrough (10-Minute Script)

### Step 1: Open Public Website over HTTPS
1. Open the public HTTPS URL in a web browser.
2. Note the secure TLS padlock (`https://`), responsive mobile/desktop design system, and fast loading via Amazon CloudFront edge caching.
3. Observe the dynamic statistics counters: **116 Curated Equipment Items**, **21 Categories**, **Dual-AZ Ahmedabad Hub**.

### Step 2: Browse Equipment Catalogue & Single-Image Precision
1. Click **"Browse Catalog"** or navigate to `/browse`.
2. Filter by category (e.g., *Cameras and Photography*, *Audio and Speakers*, *Power Tools*).
3. Search for *"Sony"*, *"GoPro"*, or *"DeWalt"*.
4. Click on any item (e.g. *Canon EOS R6 Mark II*) to open the detailed modal.
5. Highlight that each product has strictly 1 authentic, relevant WebP image and structured technical specifications.

### Step 3: Demonstrate Serverless AWS Lambda Rental Quote Calculator
1. Select rental dates (e.g., 3 days).
2. Note the instant itemized calculation of daily rental subtotal, escrow security deposit, and GST.
3. Explain that calculation is computed by our serverless AWS Lambda function `borrowbuy-quote-calculator-dev` in `ap-south-1`.

### Step 4: Customer Portal & Digital QR Handover Passes
1. Click **"Sign In"** in the header.
2. Click **"Demo Customer"** to sign in as `customer@borrowbuy.in`.
3. Navigate to **"My Bookings"** (`/bookings`).
4. Show the **ACTIVE rental** (*Sony FE 70-200mm f/2.8 GM II*):
   - Click **"Return Pass"** to display the cryptographic single-use QR pass token (`RT-70200-CUST`).
5. Show the **CONFIRMED upcoming rental** (*Bose S1 Pro+ PA Speaker*):
   - Click **"Pickup Pass"** to display the pickup QR pass token (`PK-BOSE-CUST`).
6. Show the **COMPLETED rental** (*Manfrotto Carbon Tripod*):
   - Click **"Tax Invoice"** to inspect the 100% escrow security deposit refund receipt.
7. Click the **Notification Bell** icon to show real-time in-app alerts dispatched for booking updates.

### Step 5: Owner Portal & Equipment Inventory Management
1. Click user profile in the top-right corner and select **"Sign Out"**.
2. Click **"Sign In"** -> click **"Demo Owner"** to sign in as `owner@borrowbuy.in`.
3. Open the **Owner Dashboard** (`/dashboard`):
   - **"My Listings" Tab**: Browse 25 verified equipment listings with live toggle for listing status.
   - **"Rental Requests" Tab**: Show 2 pending incoming requests from Priya Shah and Rohan Gupta, with the active **"Approve Booking"** button.
   - **"QR Handover" Tab**: Demonstrate the scanner/token input where the owner enters `PK-BOSE-CUST` or `RT-70200-CUST` to verify equipment handovers.

### Step 6: Platform Administrator Console & Dispute Arbitration
1. Sign in as `admin@borrowbuy.in`.
2. Navigate to `/admin`.
3. Show the **Platform Metrics** (66 registered users, 116 products, active bookings, gross transaction volume).
4. Show the **Disputes Tab**: Inspect the resolved inspection dispute for *BenQ 4K Projector* with resolution notes and escrow deposit release details.

---

## 3. Live AWS Console Verification Points

For faculty members who want to inspect the AWS Management Console:

| Service | Console Location | What to Inspect |
|---|---|---|
| **EC2** | EC2 > Instances (`ap-south-1`) | Instance `i-03347c2b6584c73cb` (`borrowbuy-dev-ec2`), state: Running |
| **EBS** | EC2 > Volumes | Volume `vol-0e48159e9bb02b52c` (30 GB GP3, attached to `/dev/xvda`) |
| **S3** | S3 > Buckets | Bucket `borrowbuy-dev-assets` holding equipment images |
| **Lambda** | Lambda > Functions | Function `borrowbuy-quote-calculator-dev` (Node.js 20.x runtime) |
| **SQS** | SQS > Queues | Queues `borrowbuy-dev-events` and `borrowbuy-dev-events-dlq` |
| **CloudWatch** | CloudWatch > Metrics | Namespace `BorrowBuy/Application`, metric `ApiRequestCount` |
| **Budgets** | Billing > Budgets | `BorrowBuy-Monthly-Budget` ($5.00 limit, 0% breach, Healthy status) |
| **IAM** | IAM > Roles | Roles `BorrowBuy-EC2-SSM-Role` and `BorrowBuy-GitHubActions-Deploy-Role` |
| **Systems Manager** | Systems Manager > Run Command | Command history demonstrating automated SSM deployment runs |

---

## 4. Post-Demonstration Cost Shutdown Procedure

To prevent recurring charges after the demonstration:

```powershell
# 1. Stop the EC2 instance (EBS storage and database remain preserved)
aws ec2 stop-instances `
  --instance-ids i-03347c2b6584c73cb `
  --profile borrowbuy-admin `
  --region ap-south-1

# 2. When ready to demonstrate again, restart in 30 seconds:
aws ec2 start-instances `
  --instance-ids i-03347c2b6584c73cb `
  --profile borrowbuy-admin `
  --region ap-south-1
```
