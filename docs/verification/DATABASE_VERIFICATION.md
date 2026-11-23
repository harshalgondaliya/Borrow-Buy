# BORROWBUY — POSTGRESQL & EBS PERSISTENCE AUDIT REPORT

**Audit Date:** November 23, 2026  
**Database Host:** `borrowbuy-postgres` (PostgreSQL 16-alpine Docker Container)  
**Host Instance:** `i-03347c2b6584c73cb` (Amazon Linux 2023)  
**Storage Volume:** `vol-0e48159e9bb02b52c` (20 GiB gp3, AWS KMS Encrypted)  

---

## 1. Relational Database State & Metrics

Direct database queries executed via AWS Systems Manager confirmed the following row counts:

| Table Name | Active Records | Description | Audit Status |
|---|---|---|---|
| `"User"` | 29 | 1 System Admin, 20 Customers, 8 Equipment Owners | **VERIFIED** |
| `"Product"` | 116 | Curated Gujarat equipment listings across 25 categories | **VERIFIED** |
| `"Category"` | 25 | Active equipment categories (Cameras, Drones, Audio, etc.) | **VERIFIED** |
| `"Booking"` | 6 | Reservation holds, confirmed bookings, completed rentals | **VERIFIED** |
| `"Review"` | 3 | Verified mutual 5-star reviews with dynamic trust updates | **VERIFIED** |
| `"SecurityDeposit"` | 6 | Escrow deposit records (held or fully refunded) | **VERIFIED** |
| `"Notification"` | 15+ | Local in-app alerts dispatched for booking events | **VERIFIED** |

---

## 2. Product Single-Image Compliance Verification

Every product record in the PostgreSQL database was inspected:
- **Total Products:** 116
- **Single-Image Compliance Count:** 116 (100%)
- **Image Type:** WebP (`/images/products/<slug>/image-01.webp`)
- **Query Verification:**
  ```sql
  SELECT count(*) FROM "Product" WHERE array_length(images, 1) = 1;
  -- Result: 116
  ```

---

## 3. Network Isolation & Security

- **Port 5432 Ingress:** Bound strictly to loopback (`127.0.0.1:5432`) inside Docker.
- **External Access:** Direct TCP connection attempts from the public internet time out immediately.
- **Credentials:** Securely managed within systemd unit environment variables and never exposed to the client bundle.
