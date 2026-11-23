# BORROWBUY — FEATURE TEST MATRIX & VERIFICATION SCORECARD

**Execution Date:** November 23, 2026  
**Target AWS Region:** `ap-south-1` (Mumbai)  
**Target Host:** `i-03347c2b6584c73cb` (`t3.small`)  

---

| Test ID | Category | Feature / Scenario | Environment | Input / Precondition | Expected Output | Observed Result | Status |
|---|---|---|---|---|---|---|---|
| **FEAT-01** | Frontend | Homepage Hero & Navigation | EC2 / Nginx | `GET /` | HTTP 200, index.html with BorrowBuy branding | HTTP 200, root mounted | **PASS** |
| **FEAT-02** | Frontend | SPA Client Route Deep-Linking | EC2 / Nginx | `GET /browse` | HTTP 200 via `try_files`, index.html served | HTTP 200, index.html served | **PASS** |
| **FEAT-03** | Frontend | Gujarat City Selector Filter | Local & EC2 | Select `Ahmedabad` | Filters listings to Ahmedabad commercial hub | Listings filtered dynamically | **PASS** |
| **FEAT-04** | Catalogue | 116 Products Inventory Load | Express API | `GET /api/products?limit=50` | HTTP 200 with 50 products and pagination | 50 items returned (Total: 116) | **PASS** |
| **FEAT-05** | Catalogue | Equipment Categories Load | Express API | `GET /api/products/categories` | HTTP 200 with 25 categories | 25 categories returned | **PASS** |
| **FEAT-06** | Catalogue | Single-Image Compliance | Database / API | Inspect 116 products | Strictly 1 relevant WebP image per item | 116/116 items have strictly 1 image | **PASS** |
| **FEAT-07** | Auth | Customer Login | Express API | `priya.customer@borrowbuy.in` | HTTP 200, JWT token, role CUSTOMER | Token issued, role CUSTOMER | **PASS** |
| **FEAT-08** | Auth | Owner Login | Express API | `rajesh.owner@borrowbuy.in` | HTTP 200, JWT token, role OWNER | Token issued, role OWNER | **PASS** |
| **FEAT-09** | Auth | Admin Login | Express API | `admin@borrowbuy.in` | HTTP 200, JWT token, role ADMIN | Token issued, role ADMIN | **PASS** |
| **FEAT-10** | Auth | Dynamic Customer Registration | Express API | `POST /api/auth/register` | HTTP 201, User record created, token | Account registered successfully | **PASS** |
| **FEAT-11** | Auth | Dynamic Owner Registration | Express API | `POST /api/auth/register` | HTTP 201, Owner record created | Owner account registered | **PASS** |
| **FEAT-12** | Booking | Reservation Hold Creation | Express API | `POST /api/bookings` | 15-minute temporary reservation hold | Status: `RESERVED`, booking created | **PASS** |
| **FEAT-13** | Booking | Quotation Engine Calculation | Express / Lambda | Rental dates 2027-03-23 to 03-26 | Daily rate x days + 18% GST + deposit | Computed total ₹15,400 (Deposit ₹10k) | **PASS** |
| **FEAT-14** | Payment | Simulated Escrow Deposit | Express API | `POST /api/payments/pay-booking` | Status `CONFIRMED`, deposit `HELD` | Payment processed, deposit isolated | **PASS** |
| **FEAT-15** | Handover | Single-Use Pickup QR Pass | Express API | `GET /api/qr/booking/:id` | Cryptographic pickup token generated | Token `PK-B074F0BC0A8A` issued | **PASS** |
| **FEAT-16** | Handover | Owner Pickup QR Verification | Express API | `POST /api/qr/verify-pickup` | Booking transitions from `CONFIRMED` to `ACTIVE` | Booking status `ACTIVE`, pass consumed | **PASS** |
| **FEAT-17** | Return | End-of-Rental Return QR Pass | Express API | `GET /api/qr/booking/:id` | Cryptographic return token generated | Token `RT-1F2F35A8C4F8` issued | **PASS** |
| **FEAT-18** | Return | Owner Return QR Verification | Express API | `POST /api/qr/verify-return` | Booking transitions to `RETURNED` | Booking status `RETURNED` | **PASS** |
| **FEAT-19** | Escrow | 100% Security Deposit Release | Database / API | Inspect SecurityDeposit table | Status `FULLY_REFUNDED`, 100% released | Status `FULLY_REFUNDED` (₹10,000) | **PASS** |
| **FEAT-20** | Reviews | Verified Mutual 5-Star Reviews | Express API | `POST /api/reviews` | Reviews allowed strictly after return | 5-star Customer & Owner reviews saved | **PASS** |
| **FEAT-21** | Admin | Platform Statistics Governance | Express API | `GET /api/admin/stats` | HTTP 200, gross volume & user counts | Volume ₹44,800, 29 users, 6 bookings | **PASS** |
| **FEAT-22** | Security | PostgreSQL Port 5432 Closed | Network | TCP connection to host port 5432 | Connection timed out / refused | Port 5432 safely inaccessible | **PASS** |
| **FEAT-23** | Security | SSH Port 22 Closed | Network | TCP connection to host port 22 | Connection refused | Port 22 closed, zero bastion host | **PASS** |
| **FEAT-24** | Security | Nginx Missing Header Rejection | EC2 / Nginx | `GET /api/health` without header | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **FEAT-25** | Security | Nginx Invalid Header Rejection | EC2 / Nginx | `GET /api/health` with wrong token | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **FEAT-26** | Security | Nginx Valid Header Acceptance | EC2 / Nginx | `GET /api/health` with secret token | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **FEAT-27** | Routing | API Error Code Preservation | EC2 / Nginx | `GET /api/not-found` with token | HTTP 404 JSON error | HTTP 404 JSON error (Not 200 SPA) | **PASS** |
| **FEAT-28** | Health | Post-Deploy Health Check Script | Host Script | `bash scripts/health-check.sh` | 5/5 services report healthy | 5/5 checks PASSED [200 OK] | **PASS** |
