# BorrowBuy Local Development & Demonstration Accounts

This document lists all seeded accounts created by `npm run seed --workspace=database` for local testing, quality assurance, and demonstration in the Indian market context.

> [!IMPORTANT]
> **Production Security Notice**: These credentials are strictly for local offline evaluation. In production environments:
> 1. Automatic test user seeding is disabled.
> 2. The Administrator account is initialized via environment variables (`ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`) hashed using `bcrypt` (12 rounds).
> 3. Administrative credentials are never rendered on public client screens.

---

## 1. Platform Administrator (1 Account)

| Role | Full Name | Email Address | Development Password | Location | Permissions |
|---|---|---|---|---|---|
| **ADMIN** | Harshal (System Admin) | `admin@borrowbuy.in` | Configured via `ADMIN_INITIAL_PASSWORD` *(Local dev default: `DevAdmin#BorrowBuy2026!`)* | Ahmedabad, Gujarat | Full Governance, User Moderation, Dispute Arbitration, Financial Escrow Ledger |

---

## 2. Verified Equipment Owners (6 Accounts across Gujarat)

| Role | Full Name | Email Address | Development Password | Primary Hub | Gear Categories |
|---|---|---|---|---|---|
| **OWNER** | Rajesh Patel | `rajesh.owner@borrowbuy.in` | `Password123!` | Vastrapur / Navrangpura, Ahmedabad | Cinema Cameras, Lenses, Gimbals, Action Cams |
| **OWNER** | Priya Shah | `priya.owner@borrowbuy.in` | `Password123!` | Bodakdev, Ahmedabad | Sony Full-Frame Primes, Studio Lighting, Softboxes |
| **OWNER** | Amit Sharma | `amit.owner@borrowbuy.in` | `Password123!` | Kudasan, Gandhinagar | Apple MacBook Pros, Gaming Laptops, 4K Monitors |
| **OWNER** | Sneha Mehta | `sneha.owner@borrowbuy.in` | `Password123!` | Vesu, Surat | PA Sound Systems, JBL Partybox, Wireless Microphones |
| **OWNER** | Vikram Desai | `vikram.owner@borrowbuy.in` | `Password123!` | Alkapuri, Vadodara | Bosch Rotary Hammers, Power Drills, Pressure Washers |
| **OWNER** | Ananya Joshi | `ananya.owner@borrowbuy.in` | `Password123!` | Prahlad Nagar, Ahmedabad | 4K Laser Projectors, Tripod Screens, Presentation Clickers |

---

## 3. Customer Renters (18 Accounts across Indian Cities)

| Role | Full Name | Email Address | Development Password | City & Locality |
|---|---|---|---|---|
| **CUSTOMER** | Priya Shah (Customer) | `priya.customer@borrowbuy.in` | `Password123!` | Satellite, Ahmedabad, Gujarat |
| **CUSTOMER** | Rohan Gupta | `rohan.gupta@borrowbuy.in` | `Password123!` | Navrangpura, Ahmedabad, Gujarat |
| **CUSTOMER** | Neha Trivedi | `neha.trivedi@borrowbuy.in` | `Password123!` | Sargasan, Gandhinagar, Gujarat |
| **CUSTOMER** | Parth Dave | `parth.dave@borrowbuy.in` | `Password123!` | Vesu, Surat, Gujarat |
| **CUSTOMER** | Anjali Verma | `anjali.verma@borrowbuy.in` | `Password123!` | Fatehgunj, Vadodara, Gujarat |
| **CUSTOMER** | Siddharth Rao | `siddharth.rao@borrowbuy.in` | `Password123!` | Kalawad Road, Rajkot, Gujarat |
| **CUSTOMER** | Pooja Iyer | `pooja.iyer@borrowbuy.in` | `Password123!` | Bodakdev, Ahmedabad, Gujarat |
| **CUSTOMER** | Chirag Bhatt | `chirag.bhatt@borrowbuy.in` | `Password123!` | Kudasan, Gandhinagar, Gujarat |
| **CUSTOMER** | Meera Nair | `meera.nair@borrowbuy.in` | `Password123!` | Ghod Dod Road, Surat, Gujarat |
| **CUSTOMER** | Hardik Joshi | `hardik.joshi@borrowbuy.in` | `Password123!` | Akota, Vadodara, Gujarat |
| **CUSTOMER** | Swati Kulkarni | `swati.kulkarni@borrowbuy.in` | `Password123!` | Kothrud, Pune, Maharashtra |
| **CUSTOMER** | Devang Raval | `devang.raval@borrowbuy.in` | `Password123!` | Naranpura, Ahmedabad, Gujarat |
| **CUSTOMER** | Ritu Malhotra | `ritu.malhotra@borrowbuy.in` | `Password123!` | Andheri West, Mumbai, Maharashtra |
| **CUSTOMER** | Tanmay Solanki | `tanmay.solanki@borrowbuy.in` | `Password123!` | Vidyanagar, Anand, Gujarat |
| **CUSTOMER** | Ishita Saxena | `ishita.saxena@borrowbuy.in` | `Password123!` | Waghawadi Road, Bhavnagar, Gujarat |
| **CUSTOMER** | Bhavin Panchal | `bhavin.panchal@borrowbuy.in` | `Password123!` | Maninagar, Ahmedabad, Gujarat |
| **CUSTOMER** | Kruti Vora | `kruti.vora@borrowbuy.in` | `Password123!` | University Road, Rajkot, Gujarat |
| **CUSTOMER** | Yash Kapadia | `yash.kapadia@borrowbuy.in` | `Password123!` | Piplod, Surat, Gujarat |

---

## 4. How to Reset or Re-seed Demo Data

To re-seed the local PostgreSQL database with a fresh set of records:

```bash
npm run seed --workspace=database
```

This cleans and repopulates:
- 1 Admin account (`admin@borrowbuy.in`)
- 6 Verified Owners
- 18 Customers
- 21 Categories
- 30+ Curated Indian equipment listings
- Realistic demo bookings (Active, Completed, Disputed) and verified reviews
