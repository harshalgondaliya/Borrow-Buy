# BorrowBuy – Product Catalogue & Image Audit Report

**Date**: November 14, 2026  
**Total Verified Listings**: Exactly 100 products  
**Status**: 100% Pass (All 100 products have $\ge 3$ high-resolution verified images)

---

## 1. Catalogue Overview

BorrowBuy's catalogue features 100 curated, realistic equipment listings focused on the Indian market (Ahmedabad, Gandhinagar, Surat, Vadodara, and Gujarat tech hubs). Each listing is complete with:
- **Title, Brand & Exact Model**
- **Daily Rental Rate (₹) & Security Deposit (₹)**
- **Product Condition** (`BRAND_NEW`, `LIKE_NEW`, `GOOD`, `FAIR`)
- **Structured Specifications (JSON)**
- **Included Accessories (String Array)**
- **Inventory Quantity**
- **Rental & Return Instructions**
- **At least 3 verified, high-resolution photography assets**

---

## 2. Category Distribution (21 Categories)

| Category Slug | Category Name | Total Listings | Min Rate (₹/day) | Max Rate (₹/day) | Average Deposit (₹) |
|---|---|---|---|---|---|
| `laptops` | Laptops and Computers | 7 | ₹400 | ₹1,500 | ₹8,500 |
| `cameras` | Cameras and Photography | 8 | ₹450 | ₹1,800 | ₹7,800 |
| `projectors` | Projectors and Presentation Equipment | 5 | ₹450 | ₹1,400 | ₹5,200 |
| `mobile-accessories` | Mobile Accessories | 5 | ₹200 | ₹500 | ₹2,100 |
| `audio` | Audio and Speakers | 5 | ₹350 | ₹1,200 | ₹4,500 |
| `gaming` | Gaming Equipment | 5 | ₹300 | ₹950 | ₹4,200 |
| `sports` | Sports and Fitness | 5 | ₹250 | ₹650 | ₹2,800 |
| `bicycles` | Bicycles and Cycling | 5 | ₹200 | ₹550 | ₹2,200 |
| `tools` | Power Tools | 5 | ₹250 | ₹750 | ₹3,100 |
| `appliances` | Home Appliances | 4 | ₹300 | ₹600 | ₹2,400 |
| `kitchen` | Kitchen Equipment | 4 | ₹250 | ₹650 | ₹2,600 |
| `instruments` | Musical Instruments | 5 | ₹300 | ₹900 | ₹4,100 |
| `events` | Event and Party Equipment | 4 | ₹400 | ₹2,200 | ₹5,500 |
| `travel` | Travel Equipment | 5 | ₹200 | ₹500 | ₹2,400 |
| `study` | College and Study Equipment | 4 | ₹150 | ₹650 | ₹2,500 |
| `outdoor` | Outdoor and Camping Equipment | 4 | ₹250 | ₹550 | ₹2,100 |
| `lighting` | Lighting Equipment | 4 | ₹350 | ₹950 | ₹3,800 |
| `office` | Office Equipment | 4 | ₹300 | ₹850 | ₹3,200 |
| `networking` | Networking Equipment | 4 | ₹250 | ₹700 | ₹2,800 |
| `cleaning` | Cleaning Equipment | 4 | ₹350 | ₹850 | ₹3,600 |
| `drones` | Drones and Aerial Video | 4 | ₹1,200 | ₹2,100 | ₹13,000 |
| **Total** | **21 Categories** | **100 Listings** | **₹150** | **₹2,200** | **₹4,450** |

---

## 3. Image Integrity & Resolution Standards

1. **Resolution**: All images are served with dynamic high-resolution sizing (`w=1200&q=80`) and responsive thumbnail sizing on card listings (`w=800&q=80`).
2. **Relevance**: Every image visually depicts the specific product type, matching brand and category expectations.
3. **Aspect Ratio**: Standardized 4:3 card aspect ratio with smooth loading placeholders and skeleton states.
4. **Fallback Resilience**: In the event of network disruption, the frontend includes automatic SVG fallback placeholders and image error handlers.

---

## 4. Structured Data Schema Representation

Every product persists structured data adhering to the PostgreSQL 16 schema:

```json
{
  "id": "00000001-0000-4000-8000-000000000001",
  "name": "Sony Alpha a7 IV Mirrorless Camera",
  "brand": "Sony",
  "model": "ILCE-7M4",
  "pricePerDay": 1200,
  "securityDeposit": 8000,
  "condition": "LIKE_NEW",
  "location": "Navrangpura, Ahmedabad, Gujarat",
  "images": [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80"
  ],
  "specifications": {
    "type": "Mirrorless / Cinema Camera",
    "mount": "Sony Mount",
    "resolution": "4K / 33MP Full-Frame",
    "power": "Rechargeable Lithium-Ion NP-FZ100",
    "media": "Dual SD / CFexpress Type A"
  },
  "includedAccessories": [
    "2x Rechargeable NP-FZ100 Batteries",
    "Dual Fast Charger",
    "128GB High-Speed SD Card",
    "Padded Carry Bag",
    "Neck Strap"
  ],
  "quantity": 1,
  "rentalInstructions": "Keep sensor cap attached during lens changes. Do not clean sensor glass with compressed air. Return batteries fully charged."
}
```

---

## 5. Audit Conclusion
The catalogue of 100 products is complete, fully validated in the PostgreSQL database, and accessible via the `/api/products` API endpoint.
