# BorrowBuy — Academic Evaluation Runbook & Demonstration Script

**Platform:** BorrowBuy — Equipment Rental and Management Platform  
**Target Audience:** Academic Evaluators, Faculty Examiners, Cloud Computing Review Committee  
**Time Required:** 5 to 7 Minutes  
**Demonstration Scope:** Complete 9-Service AWS Integration, Editorial Light UI, Full Rental Lifecycle  
**Region:** AWS Mumbai (`ap-south-1`) • Public IP: `13.206.100.236`

---

## 1. Demo Credentials & One-Click Fast-Fill

The platform features pre-seeded demo accounts accessible via one-click buttons on the Sign In modal:

| Persona | Email Address | Password | Role & Permissions | One-Click Fast-Fill |
| :--- | :--- | :--- | :--- | :--- |
| **Borrower (Customer)** | `customer@borrowbuy.in` | `Customer@123` | Browses gear, reserves dates, pays simulated escrow, presents QR pass, submits review | Click **"Customer"** button |
| **Lender (Owner)** | `owner@borrowbuy.in` | `Owner@123` | Manages catalog, approves bookings, verifies in-person pickup & return QR passes | Click **"Owner"** button |
| **Administrator** | `admin@borrowbuy.in` | `Admin@123` | Platform governance, financial escrow ledger, user suspension, damage claim arbitration | Click **"Admin"** button |

---

## 2. Step-by-Step 5-Minute Faculty Walkthrough

### Act 1: Homepage & Editorial Light Brand Design (Minute 0:00 - 1:00)
1. **Open the Application:** Navigate to `http://13.206.100.236` (or `http://localhost:5173` locally).
2. **Observe Design Precision:**
   - Note the editorial light color palette (`#FAFAF8` background, `#FFFFFF` surfaces, `#17191C` typography, `#315CF5` action).
   - Point out the Gujarat service hubs badge: *Serving Ahmedabad, Gandhinagar, Surat, Vadodara & Rajkot*.
   - Point out the live cloud telemetry indicator in the navigation bar showing AWS Mumbai connection.
3. **Explore Categories:**
   - Click the **"Explore 25 Categories"** button to open the Category Explorer Modal.
   - Show the curated visual categories (Cameras, Drones, Laptops, Projectors, Power Tools, Sound Systems).

---

### Act 2: Equipment Discovery & Dynamic Filtering (Minute 1:00 - 2:00)
1. **Navigate to Browse Page:** Click **"Browse Catalog"** in the top navigation.
2. **Observe 116 Seeded Products:**
   - Products are seeded in PostgreSQL on EBS `vol-0e48159e9bb02b52c`.
   - Each card displays daily rate, 100% refundable escrow deposit, equipment condition pill, and star rating.
3. **Interactive Filters:**
   - Filter by City: Select **"Ahmedabad"** or **"Surat"**.
   - Adjust Price Range: Set max daily rate to ₹2,500.
   - Filter by Condition: Select **"Like New"**.
   - Click on an item (e.g. *Sony Alpha a7 IV Mirrorless Camera Body*).

---

### Act 3: Reservation, Serverless Pricing & Escrow Payment (Minute 2:00 - 3:30)
1. **Product Details & Availability:**
   - Inspect the multi-image gallery, included accessories, and owner trust score (★ 5.0).
   - Click **"Book Equipment"**.
2. **Date Range & Availability Hold:**
   - Select a 7-day rental period.
   - Point out the **15% Weekly Duration Discount** automatically calculated by the serverless Lambda pricing formula.
   - Observe the 18% GST tax and 100% Refundable Security Deposit.
   - Click **"Lock In Dates"** (creates 15-minute availability hold to prevent double-booking).
3. **One-Click Sign In:**
   - If not signed in, click the **"Customer"** demo fast-fill button -> Click **"Sign In as Customer"**.
4. **Simulated Payment Gateway:**
   - Payment modal displays breakdown: Rental total + Deposit.
   - Select **UPI** (or Card).
   - Click **"Authorize Payment"**.
   - Success toast appears: *Payment confirmed! Security deposit held securely in escrow.*

---

### Act 4: Lender Approval & Digital QR Handover (Minute 3:30 - 4:45)
1. **Switch to Equipment Owner Persona:**
   - Click the User Profile dropdown -> Sign In as **Owner** using the **"Owner"** fast-fill button.
2. **Review Lender Management Portal:**
   - Navigate to **"Lender Portal"** (`/dashboard`).
   - View 4 telemetry cards: Total Listings, Active Rentals, Pending Requests, Accumulated Earnings.
3. **Approve Booking Request:**
   - Switch to **"Rental Requests"** tab.
   - Click **"Approve Booking"** on the newly created reservation.
4. **Pickup Pass Verification (In-Person Handover Simulation):**
   - In customer view (`/bookings`), customer clicks **"Show Pickup Pass"** to reveal dynamic QR code with token `PK-...`.
   - Copy the pass token.
   - In owner view, switch to **"QR Scanner & Handover"** tab.
   - Paste the token into the verification input and click **"Verify Pickup (Start Rental)"**.
   - Status updates instantly to **ACTIVE**. Equipment is physically in the borrower's custody!

---

### Act 5: Return Pass, Automated Escrow Release & Mutual Review (Minute 4:45 - 5:30)
1. **Return Equipment Handover:**
   - Customer opens `/bookings` and clicks **"Show Return Pass"** to reveal token `RT-...`.
   - Copy the return token.
   - Owner pastes the token in **"QR Scanner & Handover"** tab and clicks **"Verify Return (Release Deposit)"**.
   - Status transitions to **COMPLETED**.
2. **Automated Deposit Refund:**
   - The security deposit is automatically released from escrow back to the customer's payment account.
   - Customer clicks **"View Receipt"** to view and print the official GST payment & refund tax invoice.
3. **Verified Mutual Reviews:**
   - Customer clicks **"Write Review"** -> awards 5 stars with comment *"Pristine camera gear, seamless pickup near Vastrapur, Ahmedabad!"*.
   - Owner's community trust score updates in real time.

---

### Act 6: AWS Cloud Operations & Faculty Verification (Minute 5:30 - 6:30)
1. **Navigate to Cloud Operations:** Click **"Cloud Ops"** in the top navigation (`/cloud`).
2. **Verify 9 AWS Services:**
   - Point out the 9-service architecture grid (EC2, EBS, VPC, IAM, S3, SQS, Lambda, CloudWatch, Budgets).
   - Inspect live database ping latency (< 2ms) and EC2 memory utilization.
3. **Interactive Serverless Lambda Sandbox:**
   - Run the **AWS Lambda Rental Quote Engine** with custom duration and rate to demonstrate serverless execution latency (< 50ms).
   - Click **"Inspect Raw Lambda JSON"** to reveal the execution telemetry.
4. **Horizontal Auto Scaling Simulator:**
   - Click **"Simulate Traffic Spike"** to demonstrate how the EC2 ASG target tracking policy (CPU > 70%) spins up replica nodes.
5. **Amazon CloudWatch / SQS Immutable Event Stream:**
   - View live rental audit events recorded in CloudWatch log group `/aws/borrowbuy/app`.
   - Expand any event to inspect the JSON schema with PK, SK, timestamp, and actor identity.
