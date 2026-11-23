# BorrowBuy — Academic Faculty Demonstration Runbook

## Executive Summary
This runbook provides university evaluators and faculty members with a structured, step-by-step walkthrough to independently verify the BorrowBuy Equipment Rental and Management Platform. 

The demonstration proves:
1. **Unified Authentication & Automatic Role-Based Redirection**
2. **Simplified Equipment Catalogue & Single-Image Precision**
3. **End-to-End Rental Booking Lifecycle with Digital Escrow**
4. **Cryptographic Single-Use QR Handover Passes**
5. **Dedicated Equipment Owner Portal & Inventory Management**
6. **Administrator Platform Governance & Financial Oversight**
7. **Production AWS Cloud Architecture (9 Live Services in Mumbai)**

---

## 1. Faculty Demo Credentials

| Role | Name | Email | Password | Primary Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Priya Shah | `priya.customer@borrowbuy.in` | `Password123!` | `/bookings` (Borrower Portal) |
| **Customer 2** | Rohan Gupta | `rohan.gupta@borrowbuy.in` | `Password123!` | `/bookings` (Borrower Portal) |
| **Equipment Owner** | Rajesh Patel | `rajesh.owner@borrowbuy.in` | `Password123!` | `/owner` (Lender Portal) |
| **Equipment Owner 2** | Priya Shah (Owner) | `priya.owner@borrowbuy.in` | `Password123!` | `/owner` (Lender Portal) |
| **Platform Administrator** | System Admin | `admin@borrowbuy.in` | `Password123!` | `/admin` (Admin Console) |

---

## 2. Seven-Stage Demonstration Walkthrough

### Stage 1: Unified Authentication & Role Redirection
1. Open the application homepage in any standard web browser.
2. Click **"Sign In"** in the top navigation bar or navigate directly to `/login`.
3. Note that the login screen is a clean, professional email/password form with **zero hardcoded demo buttons**.
4. Enter `priya.customer@borrowbuy.in` and password `Password123!`.
5. Click **"Sign In"**: observe immediate successful toast and automatic redirection to `/bookings`.
6. Log out from the user profile dropdown.
7. Enter `rajesh.owner@borrowbuy.in` and password `Password123!`: observe automatic redirection to the **Owner Portal** (`/owner`).
8. Log out, then enter `admin@borrowbuy.in` and password `Password123!`: observe automatic redirection to the **Admin Console** (`/admin`).

### Stage 2: Equipment Catalogue & Natural Product Names
1. Navigate to `/browse` as a guest or logged-in user.
2. Inspect the 116 equipment items across the 25 categories:
   - Notice the short, recognizable titles: e.g., *"Sony A7 IV Camera"*, *"DeWalt 20V Cordless Drill"*, *"MacBook Pro 16 M3 Max"*, *"DJI Mini 4 Pro Drone"*, *"Traditional Wooden Swing"*.
   - Confirm that every item has strictly **one single, high-definition, relevant WebP image**.
3. Use the search bar to search for equipment using common Indian colloquial terms:
   - Search *"drill machine"* $\rightarrow$ yields DeWalt and Bosch drills.
   - Search *"mike"* $\rightarrow$ yields Shure SM7B and Rode wireless mics.
   - Search *"cycle"* $\rightarrow$ yields Trek and Firefox bicycles.

### Stage 3: Customer Booking & Escrow Deposit Isolation
1. Sign in as `priya.customer@borrowbuy.in`.
2. Select an equipment item (e.g., *"Sony 70-200mm GM Lens"* or *"GoPro Hero 12 Black"*).
3. Select rental dates on the interactive calendar. Notice real-time rental pricing:
   $$\text{Total Amount} = (\text{Daily Rate} \times \text{Days}) + \text{Security Deposit} + \text{GST (18\%)}$$
4. Click **"Reserve Equipment"**: booking status transitions to `RESERVED` (holding calendar slot).
5. Click **"Simulate Payment & Escrow Deposit"**:
   - Simulated payment gateway processes payment.
   - Security deposit is isolated into platform escrow.
   - Booking transitions to `CONFIRMED`.

### Stage 4: Cryptographic QR Handover (Pickup & Return)
1. In the customer portal (`/bookings`), click **"View Handover QR Pass"**.
   - Displays a secure, single-use pickup pass with animated cryptographic verification token (e.g., `PK-B25F28977C63`).
2. Sign in as the gear's owner (`rajesh.owner@borrowbuy.in`) in a second browser window or private tab.
3. In the Owner Portal (`/owner`), locate the rental request and scan / submit the pickup code.
   - Booking immediately transitions to `ACTIVE`. The pickup pass is permanently consumed.
4. When rental concludes, the customer generates the **Return QR Pass** (e.g., `RT-A34F7188DE1D`).
5. The owner scans the return pass, verifies equipment condition, and confirms return.
   - Booking transitions to `RETURNED`.
   - Security deposit in escrow is **100% automatically refunded** to the customer.

### Stage 5: "Become an Owner" Onboarding Flow
1. Sign in as customer `rohan.gupta@borrowbuy.in`.
2. Click the user profile dropdown and select **"Become an Owner"** or navigate to `/become-owner`.
3. Fill in the lender application form:
   - Bio: *"Experienced audio engineer renting studio-grade microphones and mixers."*
   - Pickup Hub: *"Navrangpura, Ahmedabad, Gujarat"*
   - Phone: *"+91 98251 10002"*
4. Submit application: account is instantly upgraded to `OWNER` with access to the Owner Portal.

### Stage 6: Administrator Platform Governance
1. Sign in as `admin@borrowbuy.in` and navigate to `/admin`.
2. Inspect the live platform analytics dashboard:
   - Total Registered Users (breakdown of Customers vs. Verified Owners)
   - Total Inventory Volume (116 products)
   - Active & Completed Bookings
   - Gross Financial Volume (Rental revenues + Escrow holds)
   - Open Booking Disputes & Resolution actions.

### Stage 7: AWS Cloud Operations Verification
1. Navigate to `/cloud` in the platform navigation.
2. Observe the live 9-service AWS cloud status in Mumbai (`ap-south-1`):
   - **IAM**: Least-privilege roles, OIDC integration.
   - **VPC**: Dual-AZ networking across `ap-south-1a` and `ap-south-1b`.
   - **Budgets**: \$5.00/month limit, \$0.00 actual spend (HEALTHY).
   - **EC2 & EBS**: Persistent storage on encrypted gp3 EBS (`vol-0e48159e9bb02b52c`).
   - **S3 & SQS**: Asset storage and decoupled event queues.
   - **Lambda**: Live serverless rental quote calculator.
   - **CloudWatch**: Active CPU alarms and `/borrowbuy/application-logs`.

---

## 3. Demonstration Summary
The platform demonstrates an enterprise-grade cloud computing project fulfilling all academic criteria for full-stack engineering, AWS cloud architecture, role security, and real-time state machine workflows.
