# BorrowBuy — Premium Design System & UI/UX Specification

**Platform Name:** BorrowBuy Equipment Rental & Management Platform  
**Design Philosophy:** Editorial Light • Linear/Vercel Visual Precision • Airbnb Commercial Clarity • ShareGrid Equipment Focus  
**Theme:** Strict Editorial Light  
**Document Status:** Final Production Specification

---

## 1. Design Vision & Guiding Principles

The BorrowBuy user interface is engineered to inspire trust, clarity, and rapid decision-making in a high-value equipment rental marketplace. High-end cameras, drones, laptops, and generators require transparent pricing, clear equipment condition ratings, verified escrow protection, and frictionless in-person pickup workflows.

### Core Principles
1. **Editorial Restraint:** Prioritize white space, crisp typography, and subtle contrast over flashy visual effects.
2. **Deterministic Feedback:** Every interactive element has immediate visual feedback (hover states, loading spinners, toast alerts).
3. **Information Hierarchy:** Product photos and daily rates lead the eye, followed by escrow deposit guarantees and location tags.
4. **Zero Dark Patterns:** Total upfront price transparency with full breakdown of daily rent, duration discounts, GST, and 100% refundable security deposit.

---

## 2. Color Palette & Token Architecture

The design system is strictly enforced via `tailwind.config.js` and `:root` variables in `src/index.css`.

### Mandatory Color Tokens

| Semantic Token | Hex Value | Usage Guideline |
| :--- | :--- | :--- |
| `bb-bg` | `#FAFAF8` | Page canvas background. Soft off-white preventing screen glare. |
| `bb-card` | `#FFFFFF` | Content card surface. Crisp white creating clear visual elevation. |
| `bb-surface-subtle` | `#F1F3F3` | Inputs, secondary buttons, badge backgrounds, and tab bars. |
| `bb-border` | `#E5E8EA` | Card borders, dividers, table row lines, and subtle outlines. |
| `bb-text-primary` | `#17191C` | High-contrast headings, product titles, bold rates, primary copy. |
| `bb-text-secondary` | `#66707A` | Metadata, subtitle descriptions, timestamps, input placeholders. |
| `bb-accent` | `#315CF5` | High-visibility primary action button, links, selected state. |
| `bb-accent-hover` | `#2447C9` | Interactive hover state for primary action buttons. |
| `bb-positive` | `#13795B` | Refunded escrow deposits, verified badges, active rentals. |
| `bb-warning` | `#B76E16` | Awaiting owner approval, reservation holds, pending alerts. |
| `bb-error` | `#C43838` | Dispute deductions, rejected bookings, form validation errors. |

---

## 3. Typography Hierarchy

BorrowBuy employs a dual-font typographic stack:
- **Display Headings:** `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, sans-serif.
- **Body & Metadata:** `Inter`, `system-ui`, `-apple-system`, sans-serif.
- **Monospace & Pass Tokens:** `JetBrains Mono`, `Fira Code`, `ui-monospace`.

### Type Scale Specifications

| Element | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `36px` / `48px` | `800` (Extrabold) | `1.15` | `-0.025em` |
| **Section Title** | `24px` / `30px` | `800` (Extrabold) | `1.2` | `-0.02em` |
| **Card Heading** | `15px` / `16px` | `700` (Bold) | `1.3` | `-0.01em` |
| **Daily Rate** | `18px` / `20px` | `800` (Extrabold) | `1.0` | `tight` |
| **Body Primary** | `14px` | `500` (Medium) | `1.5` | `normal` |
| **Body Secondary** | `12px` | `400` (Regular) | `1.5` | `normal` |
| **Micro Caption** | `10px` / `11px` | `600` (Semibold) | `1.4` | `+0.02em` |
| **Handover Token** | `13px` / `14px` | `700` (Bold Mono) | `1.0` | `+0.05em` |

---

## 4. Component Design Patterns

### A. Navigation Bar (`Navbar.tsx`)
- Sticky top navigation with 80px height, backdrop blur filter (`backdrop-blur-md`), and hairline bottom border `#E5E8EA`.
- High-contrast BorrowBuy sharing loop logo.
- Integrated quick search shortcut (`/` key binding).
- Live cloud ops status signal pill indicating AWS region (`ap-south-1`).
- User profile popover with one-click access to Customer, Owner, or Admin portals.

### B. Product Equipment Card (`ProductCard.tsx`)
- Fixed 4:3 aspect ratio image container with smooth zoom on hover (`scale-105 duration-300`).
- Subtle condition badge pill on top left (`Brand New`, `Like New`, `Good`, `Fair`).
- Favorite heart toggle button on top right with animated bounce.
- Two-line truncated title preserving consistent grid row alignment.
- Local Gujarat pickup locality indicator (`Ahmedabad`, `Surat`, etc.).
- Prominent daily rental rate in Indian Rupees (`formatINR`).
- 100% Refundable security deposit tag in green `#13795B`.

### C. Booking & Reservation Modal (`DateRangePickerModal.tsx`)
- Dual-calendar date range selector with instant conflict checking.
- Real-time quote evaluation showing duration tiers (5% to 30% discount), 18% GST, and security deposit.
- Instant reservation hold button transitioning to payment simulation.

### D. Digital QR Handover Pass (`QRCodeModal.tsx`)
- High-contrast SVG QR code rendering dynamic pass tokens (`PK-...` for pickup, `RT-...` for return).
- One-click copy button for simulated in-person entry.
- Visual explanation of automated deposit escrow release upon return pass scan.

### E. Owner Portal (`OwnerDashboard.tsx`)
- 4 key metrics: Total Listings, Active Rentals, Pending Requests, Accumulated Earnings.
- 3 clean tabs: My Listings, Rental Requests, QR Scanner Dock.
- One-click booking approval and instant in-person token verification.

### F. One-Click Demo Fast-Fill Dock (`AuthModal.tsx`)
- Provides 3 pre-configured demo account buttons:
  - **Customer:** `customer@borrowbuy.in` / `Customer@123`
  - **Equipment Owner:** `owner@borrowbuy.in` / `Owner@123`
  - **Administrator:** `admin@borrowbuy.in` / `Admin@123`
- Instant form auto-fill allowing immediate faculty walkthroughs without typing credentials.

---

## 5. Accessibility & Micro-Interactions

- **Keyboard Navigation:** Full tab order across all interactive elements, modal escape key dismissal, and visible focus rings (`focus:ring-2 focus:ring-[#315CF5]/20`).
- **Contrast Ratios:** All text pairings exceed WCAG AA standards (minimum 4.5:1 for body copy; 7:1 for headings).
- **Reduced Motion:** Graceful spring animations via `framer-motion` that respect `prefers-reduced-motion`.
- **Responsive Breakpoints:**
  - Mobile: `< 640px` (single column, sticky bottom actions, mobile drawer)
  - Tablet: `640px - 1024px` (2-column grid, responsive sidebar filter toggle)
  - Desktop: `> 1024px` (3-to-4 column grid, sticky filter sidebar, spacious modal overlays)
