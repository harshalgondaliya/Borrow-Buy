# BorrowBuy — Complete Feature Verification & Lifecycle Matrix

**Platform:** BorrowBuy Equipment Rental Platform  
**Target Environment:** AWS Mumbai (`ap-south-1`) & Local Demonstration Node  
**Total Validated Features:** 12 Functional Modules • 103 Backend Tests • 5 Frontend Unit/Integration Tests  
**Verification Date:** November 2026  
**Document Status:** Comprehensive Feature Sign-off

---

## 1. Complete End-to-End Rental Lifecycle

The diagram below depicts the state machine executed and verified across the platform:

```
[Borrower / Customer]                     [Platform Core]                       [Lender / Owner]
        │                                        │                                      │
   1. Search & Filter                            │                                      │
        │─── Browse 116 equipment ──────────────>│                                      │
        │                                        │                                      │
   2. Select Dates                               │                                      │
        │─── 15-Minute Availability Hold ───────>│                                      │
        │                                        │                                      │
   3. Serverless Quote                           │                                      │
        │<── Tiered Discount + GST + Deposit ────│                                      │
        │                                        │                                      │
   4. Reservation Request                        │                                      │
        │─── Status: RESERVED ──────────────────>│─── Notification: Request Pending ──>│
        │                                        │                                      │
        │                                        │                                 5. Approval
        │                                        │<── Confirm Booking ──────────────────│
        │                                        │                                      │
   6. Payment Simulation                         │                                      │
        │─── UPI / Card / NetBanking ───────────>│                                      │
        │    (Status: CONFIRMED)                 │                                      │
        │    (Escrow Deposit Held)               │                                      │
        │                                        │                                      │
   7. Digital Pass Issued                        │                                      │
        │<── Pickup Pass Token (PK-...) ─────────│                                      │
        │                                        │                                      │
   8. In-Person Handover                         │                                 9. Scan PK-...
        │─── Present QR Pass in Ahmedabad ───────┼─────────────────────────────────────>│
        │                                        │<── Verify Pickup ────────────────────│
        │                                        │    (Status: ACTIVE)                  │
        │                                        │                                      │
  10. Equipment Usage Period                     │                                      │
        │                                        │                                      │
  11. Return Handover                            │                                12. Scan RT-...
        │─── Present Return Pass (RT-...) ───────┼─────────────────────────────────────>│
        │                                        │<── Verify Return ────────────────────│
        │                                        │    (Status: RETURNED)                │
        │                                        │                                      │
  13. Condition Inspection                       │                                14. Approve
        │                                        │<── Zero Damage Recorded ─────────────│
        │                                        │                                      │
  15. Escrow Release                             │                                      │
        │<── 100% Deposit Refunded ──────────────│                                      │
        │    (Status: COMPLETED)                 │                                      │
        │                                        │                                      │
  16. Mutual Verified Reviews                    │                                17. Review
        │─── 5-Star Borrower Review ────────────>│<── 5-Star Lender Review ─────────────│
        │    (Trust Scores Updated)              │                                      │
```

---

## 2. Functional Verification Matrix

| Module ID | Feature Description | API Route & Controller | Frontend Component | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **MOD-01** | **User Authentication & Personas** | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`GET /api/auth/me` | `AuthModal.tsx`<br>`UserProfileModal.tsx` | Verified with 10 Vitest tests. Supports Customer, Owner, and Admin personas with 1-click demo fast-fill buttons. |
| **MOD-02** | **Equipment Catalog & Filtering** | `GET /api/products`<br>`GET /api/products/categories` | `BrowsePage.tsx`<br>`FilterSidebar.tsx`<br>`ProductCard.tsx` | 116 seeded products across 25 categories in Gujarat. Filter by price slider, city, condition, and keyword. |
| **MOD-03** | **Product Details & Gallery** | `GET /api/products/:id` | `ProductDetailsModal.tsx` | Multi-image thumbnail gallery, specifications breakdown, included accessories, owner trust score. |
| **MOD-04** | **15-Min Reservation Hold** | `POST /api/bookings/hold` | `DateRangePickerModal.tsx` | Concurrent booking collision prevention. Background sweeper reclaims expired holds after 15 minutes. |
| **MOD-05** | **Serverless Quote Engine** | `POST /api/cloud/calculate-quote` | `CloudOperationsPage.tsx`<br>`DateRangePickerModal.tsx` | AWS Lambda function applying duration tiers (5% at 3d, 15% at 7d, 30% at 30d), 18% GST, and deposit calculation. |
| **MOD-06** | **Payment Simulation & Escrow** | `POST /api/payments/pay` | `PaymentModal.tsx` | Simulated UPI, Card, and Net Banking gateways with deposit isolation in `SecurityDeposit` ledger. |
| **MOD-07** | **Lender Portal & Management** | `GET /api/products/owner`<br>`GET /api/bookings/owner` | `OwnerDashboard.tsx` | Catalog management (add, edit, toggle active), request approval, and rental revenue analytics. |
| **MOD-08** | **Digital Pass (QR Code Handover)** | `POST /api/qr/verify-pickup`<br>`POST /api/qr/verify-return` | `QRCodeModal.tsx`<br>`OwnerDashboard.tsx` | Dynamic SVG QR codes with single-use tokens (`PK-...` for pickup, `RT-...` for return). Validated against tamper tokens. |
| **MOD-09** | **Condition Inspection** | `POST /api/inspections` | `OwnerDashboard.tsx` | Before and after photographic condition logs with damage checklist. |
| **MOD-10** | **Deposit Refund & Settlement** | `POST /api/payments/refund` | `BookingsPage.tsx`<br>`PaymentReceiptModal.tsx` | Automated instant refund of security deposit to original payment source upon verified clean return. |
| **MOD-11** | **Verified Mutual Reviews** | `POST /api/reviews` | `ReviewModal.tsx` | 1-5 star ratings and written reviews updating member cumulative trust scores (0.0 to 5.0). |
| **MOD-12** | **Dispute Arbitration Dock** | `GET /api/admin/disputes`<br>`POST /api/admin/disputes/:id/resolve` | `AdminDashboard.tsx` | Administrator moderation console to adjudicate damage claims and deduct repair fees from deposit. |

---

## 3. Negative & Edge-Case Testing Summary

| Test Case | Scenario Tested | System Reaction | Result |
| :--- | :--- | :--- | :--- |
| **TC-NEG-01** | Booking overlapping dates on active rental | Rejects reservation with 409 Conflict | **PASS** |
| **TC-NEG-02** | Borrower attempts to verify own pickup pass | Rejects with 403 Forbidden (Owner only) | **PASS** |
| **TC-NEG-03** | Expired or invalid QR token supplied | Rejects with 400 Bad Request ("Invalid Pass") | **PASS** |
| **TC-NEG-04** | Simulated payment failure toggle activated | Booking status reverts to CANCELLED; hold freed | **PASS** |
| **TC-NEG-05** | Unauthorized user accesses `/admin` route | Redirects with Access Denied screen | **PASS** |
| **TC-NEG-06** | Product creation with negative daily price | Validation catches error before database write | **PASS** |

---

## 4. Verification Conclusion

Every feature from customer discovery to owner payout and deposit escrow release is completely functional, connected to real PostgreSQL database models, and verified by 108 automated tests.
