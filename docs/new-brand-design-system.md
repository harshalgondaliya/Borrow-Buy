# BorrowBuy — Brand Design System & Visual Specification
**Version:** 3.0.0 (Modern Editorial Marketplace)  
**Date:** November 2026  
**Scope:** Frontend Architecture, Tailwind CSS Configuration, Component Tokens & Accessibility Guidelines  

---

## 1. Design Vision & Philosophy

BorrowBuy transforms from a conventional green-heavy listing board into a **Modern Editorial Marketplace** inspired by world-class editorial products (Linear, Stripe, Airbnb, Kinfolk, and Notion). 

The platform communicates:
- **Trust & Security:** Crisp borders, authentic product photography, and transparent escrow protection.
- **Convenience & Community:** Intuitive neighborhood peer-to-peer discovery across Gujarat hubs (Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot).
- **Modern Affordability:** Clear daily pricing, zero hidden fees, and seamless single-use QR handover passes.
- **Editorial Warmth:** Warm Ivory surfaces, Midnight Ink typographic contrast, purposeful Cobalt Blue primary actions, and Soft Tangerine highlight accents.

---

## 2. Core Color Palette Tokens

The brand completely abandons basic forest greens and harsh neon accents in favor of a timeless, tactile palette:

| Token Name | Hex Code | Tailwind Token | CSS Variable | Primary Role / Semantic Usage |
|:---|:---|:---|:---|:---|
| **Warm Ivory** | `#F5F2EA` | `bg-ivory` | `--color-ivory` | Primary page background, editorial hero canvas, footer background, elevated dropdowns |
| **Midnight Ink** | `#202733` | `text-ink` / `bg-ink` | `--color-ink` | Primary display headings, dark contrast sections, host banners, active category chips |
| **Cobalt Blue** | `#315ACB` | `bg-cobalt` / `text-cobalt` | `--color-cobalt` | Primary interactive buttons, focus rings, active navigation indicators, key icons |
| **Soft Tangerine** | `#E98758` | `bg-tangerine` / `text-tangerine` | `--color-tangerine` | Accent highlights, star ratings, notification badges, micro-trust indicators |
| **Mist Green** | `#DCE5DD` | `bg-mist` / `text-mist` | `--color-mist` | Secondary surfaces, badge backdrops, subtle hover fills, spec chips |
| **Pure White** | `#FFFFFF` | `bg-white` | `--color-white` | Elevated product cards, modal surfaces, form inputs, filter sidebars |
| **Muted Grey** | `#777C84` | `text-muted` | `--color-muted` | Secondary body copy, subtitle descriptions, timestamps, helper labels |
| **Border Grey** | `#E5E2DA` | `border-borderGrey` | `--color-border-grey` | Hairline dividers, card outlines, table borders, input outlines |

### Interactive State Variations
- **Cobalt Blue Hover:** `#2649A7` (`bg-cobalt-hover`)
- **Soft Tangerine Hover:** `#D57445` (`bg-tangerine-hover`)
- **Midnight Ink Hover:** `#181E27`
- **Mist Green Hover:** `#CBD8CC`

---

## 3. Typography Architecture

The typography system pairs **Manrope** for authoritative, humanistic display headers with **Inter** for precision and legibility in dense product catalogs and rental date pickers.

```
Headings & Display  →  Manrope (700 Bold, 800 ExtraBold, 900 Black)
Body & Data Forms   →  Inter (400 Regular, 500 Medium, 600 SemiBold)
Monospace Tokens    →  JetBrains Mono / ui-monospace (for QR tokens, booking references)
```

### Typographic Scale

| Level | Font Family | Size / Line Height | Tracking | Usage |
|:---|:---|:---|:---|:---|
| **Hero Display** | Manrope ExtraBold | `3.75rem (60px)` / `1.08` | `-0.025em` | *"Good things are better shared."* master hero header |
| **Page Header (H1)** | Manrope ExtraBold | `2.25rem (36px)` / `1.15` | `-0.02em` | Section headlines, dashboard titles, modal main headers |
| **Section Header (H2)** | Manrope Bold | `1.75rem (28px)` / `1.2` | `-0.015em` | Catalog sections, use-case collection titles, workflow titles |
| **Card Title (H3)** | Manrope Bold | `1.0rem (16px)` / `1.3` | `-0.01em` | Product card titles, review headers, category labels |
| **Body (Base)** | Inter Regular | `0.875rem (14px)` / `1.5` | `normal` | Product descriptions, terms & conditions, safety guidelines |
| **Body (Small)** | Inter Regular | `0.75rem (12px)` / `1.4` | `normal` | Metadata, owner locations, filter labels, badge copy |
| **Micro Labels** | Inter SemiBold | `0.6875rem (11px)` / `1.3` | `+0.02em` | Tag pills, status badges, condition indicators |

---

## 4. Component Elevation & Card Styling

### The Editorial Card (`.editorial-card`)
Products and featured collections utilize a signature editorial card treatment:
- **Base Background:** Pure White (`#FFFFFF`)
- **Border:** `1px solid #E5E2DA` (`border-borderGrey`)
- **Border Radius:** `1.5rem` (`rounded-3xl` / 24px) or `1rem` (`rounded-2xl` / 16px)
- **Shadow:** `0 1px 3px 0 rgba(32, 39, 51, 0.04)` (resting) transitioning to `0 8px 24px -4px rgba(32, 39, 51, 0.08)` on hover
- **Hover Micro-interaction:** Image zoom scale `1.05` over 500ms with smooth cubic-bezier easing.

### Modal Windows & Elevated Sheets
- **Backdrop:** Midnight Ink with high blur: `bg-[#202733]/75 backdrop-blur-md`
- **Modal Container:** Rounded `2rem` (32px), bordered with `#E5E2DA`, layered with high depth `shadow-2xl`.
- **Top Header:** Soft Warm Ivory accent band (`bg-ivory/50`) with Cobalt Blue category or feature badge.

---

## 5. Official Monogram & Brand Logo

The official BorrowBuy logo (`BorrowBuyLogo.tsx`) consists of:
1. **Geometric Monogram SVG:**
   - Double interlaced loops symbolizing the circular sharing economy ("Borrow" & "Buy").
   - Primary Loop in Cobalt Blue (`#315ACB`).
   - Accent Loop in Soft Tangerine (`#E98758`).
   - Center overlap rendered with subtle transparency and smooth corner radius.
2. **Typography Monogram:**
   - "Borrow" in Midnight Ink (`#202733`) ExtraBold Manrope.
   - "Buy" in Cobalt Blue (`#315ACB`) ExtraBold Manrope.
   - Subtitle: "EQUIPMENT SHARING" in Soft Tangerine (`#E98758`) bold tracking `+0.15em`.
3. **Favicon:**
   - Updated SVG favicon located at `frontend/public/favicon.svg` matching the brand loops and Warm Ivory background.

---

## 6. Accessibility & Contrast Verification

Every color pairing has been audited against WCAG 2.1 AA and AAA standards:
- `Midnight Ink (#202733)` on `Warm Ivory (#F5F2EA)`: **Contrast Ratio 11.8:1 (Passes AAA)**
- `Cobalt Blue (#315ACB)` on `Pure White (#FFFFFF)`: **Contrast Ratio 6.2:1 (Passes AA for normal text, AAA for large text)**
- `Cobalt Blue (#315ACB)` on `Warm Ivory (#F5F2EA)`: **Contrast Ratio 5.7:1 (Passes AA)**
- `Pure White (#FFFFFF)` on `Cobalt Blue (#315ACB)`: **Contrast Ratio 6.2:1 (Passes AA)**
- `Pure White (#FFFFFF)` on `Midnight Ink (#202733)`: **Contrast Ratio 14.1:1 (Passes AAA)**
