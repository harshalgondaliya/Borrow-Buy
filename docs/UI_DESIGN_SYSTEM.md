# BorrowBuy – Enterprise Design System & UI/UX Specification

**Design Standards**: Inspired by Apple, Linear, Vercel, and Framer  
**Domain**: Premium Indian Equipment Rental Marketplace  
**Version**: 3.0  

---

## 1. Design Philosophy & Visual Principles

1. **Restrained Color Hierarchy**: High-contrast, focused color palette with zero visual noise. Neutral backgrounds allow equipment photography and real hardware to be the hero.
2. **Selective Glassmorphism**: Controlled `backdrop-blur-md` surfaces with subtle border transparencies (`border-white/10` or `border-slate-200/80`) on sticky headers, floating control bars, and contextual modals. Avoids universal blur.
3. **Typography & Readability**: Inter font system with strict tracking (`tracking-tight` on headings), mathematically balanced leading, and high contrast against white/porcelain surfaces.
4. **Micro-Interactions**: Subtle Framer Motion spring physics (`damping: 25, stiffness: 300`) on button presses, hover elevations, and card transitions.
5. **Accessibility (WCAG 2.1 AA)**: Minimum 4.5:1 color contrast for body text, visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#F06449]`), and screen reader friendly ARIA labels.

---

## 2. Tokenized Color System

### Primary Identity Palette
| Token Name | Hex Code | Tailwind Token | Semantic Usage |
|---|---|---|---|
| **Midnight Navy** | `#172B46` | `bg-[#172B46]`, `text-[#172B46]` | Primary brand headers, hero sections, dark cards |
| **Coral Action** | `#F06449` | `bg-[#F06449]`, `text-[#F06449]` | Primary CTA buttons, active tabs, highlight tags |
| **Porcelain Background** | `#F5F6F8` | `bg-[#F5F6F8]` | Default application page background |
| **Pure White Surface** | `#FFFFFF` | `bg-[#FFFFFF]` | Product cards, modal dialogs, elevated containers |
| **Deep Charcoal** | `#202833` | `text-[#202833]` | Primary high-contrast body text |
| **Teal Secondary** | `#2F6B65` | `bg-[#2F6B65]`, `text-[#2F6B65]` | Trust badges, verification indicators, secondary buttons |
| **Warm Amber** | `#F2C66D` | `bg-[#F2C66D]`, `text-[#D97706]` | Star ratings, alert chips, attention states |
| **Neutral Slate** | `#667085` | `text-[#667085]` | Metadata, category subtitles, secondary body text |
| **Border Light** | `#E4E7EC` | `border-[#E4E7EC]` | Card dividers, input borders, table rules |
| **Glass Surface Light** | `rgba(255, 255, 255, 0.85)` | `bg-white/85 backdrop-blur-md` | Sticky navbar, floating search pills, dropdown menus |

---

## 3. Typography Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|
| **Display Hero** | 48px / 3rem | Bold (700) | 1.15 | `-0.025em` | Homepage hero headline |
| **Heading 1** | 32px / 2rem | SemiBold (600) | 1.25 | `-0.02em` | Page titles, Cloud dashboard header |
| **Heading 2** | 24px / 1.5rem | SemiBold (600) | 1.3 | `-0.015em` | Section headers, modal titles |
| **Heading 3** | 18px / 1.125rem | Medium (500) | 1.4 | `-0.01em` | Card titles, category cards |
| **Body Large** | 16px / 1rem | Regular (400) | 1.5 | Normal | Product descriptions, modal content |
| **Body Small** | 14px / 0.875rem | Regular (400) | 1.5 | Normal | Filter labels, table data, specifications |
| **Caption / Badge**| 12px / 0.75rem | Medium (500) | 1.4 | `+0.025em` | Status chips, timestamps, verified pills |

---

## 4. Multi-Page Navigation Structure

```
BorrowBuy App
├── / (Home: Hero, Category Highlights, Curated Showcase, Value Proposition)
├── /browse (Marketplace: Category Explorer, 116 Products Grid, Filter Sidebar, Sort)
├── /bookings (Activity: Renter Booking History, QR Handover Tokens, Receipts)
├── /dashboard (Owner: Inventory, Add Equipment, Booking Approvals, Earnings)
├── /admin (Governance: Product Approval Pipeline, User Trust Management)
├── /cloud (Operations: 16 AWS Services Telemetry, Compute Load, Real-Time Health)
├── /settings (User: Profile, City Location, Trust Score Verification)
├── /help (Support: Rental Terms, Security Deposit Escrow Policy, FAQs)
└── * (404: Professional Not Found Page with Navigation Fallback)
```

---

## 5. Responsive Breakpoint Guidelines

- **Mobile Small (320px – 375px)**: Single column product card, compact header, collapsible drawer filters.
- **Mobile Large (375px – 480px)**: Refined touch targets ($\ge 44 \times 44$ px), bottom navigation bar option.
- **Tablet (768px – 1023px)**: 2-column product grid, top navigation with icon badges.
- **Laptop (1024px – 1439px)**: 3-column product grid with persistent filter sidebar.
- **Desktop Ultra (1440px – 1920px)**: 4-column product grid, max-w-7xl content container, high-density telemetry views.
