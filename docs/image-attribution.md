# BorrowBuy Product Image Attribution & Licensing Guide

This document records the visual asset curation standards, licensing terms, and photographer attributions for the BorrowBuy Product Rental & Management Platform.

---

## 1. Visual Asset Standards & Architecture

In accordance with BorrowBuy's Indian rental commerce quality specifications:
- **Minimum 3 Images Per Product:** Every catalog item (all 80 active listings across 21 product categories) is configured with **at least three distinct, high-resolution photographic perspectives** of the specific listed model (main front perspective, operational/angle perspective, and accessory/detail perspective).
- **Primary Product Thumbnail:** The first array element (`images[0]`) is consistently rendered on product cards, category search carousels, and search filters.
- **Interactive Multi-Angle Gallery:** The product detail modal renders an interactive image carousel with dedicated thumbnail strip navigation, touch swipe support, keyboard accessibility, left/right navigation controls, and live count indicator badges (`1 / 3`, `2 / 3`, `3 / 3`).
- **CDN Optimization:** All images utilize responsive query parameters (`auto=format&fit=crop&w=1200&q=80`) ensuring crisp rendering on Retina screens with optimized WebP/AVIF asset compression.

---

## 2. Licensing Compliance

All photographic assets utilized within the seed catalogue are curated from **Unsplash**, licensed under the official **Unsplash License**:

> **Unsplash License Summary:**
> - All photos can be downloaded and used for free.
> - Commercial and non-commercial purposes are fully permitted.
> - No permission needed (though attribution is appreciated as good community practice).
> - Photos cannot be compiled to replicate a competing service.
> 
> *Full legal text available at [https://unsplash.com/license](https://unsplash.com/license).*

---

## 3. Product Category Asset Registry & Credits

| Category | Typical Curated Gear | Image Angles & Details | Source Platform & License |
| :--- | :--- | :--- | :--- |
| **Laptops & Computers** | Apple MacBook Pro M3 Max, MacBook Air M2, Dell XPS 15, ASUS ROG Strix, LG 27" 4K Monitor, Lenovo Legion, iPad Pro | Top lid open, keyboard profile, external port array | Unsplash Free Commercial License |
| **Cameras & Photography** | Sony Alpha a7 IV, Canon EOS R6 Mark II, Sony 70-200 GM II, 24-70 GM II, GoPro HERO 12, Manfrotto Tripod, DJI RS 3 Pro | Lens glass element, rear LCD screen, side grip and battery door | Unsplash Free Commercial License |
| **Drones & Aerial Video** | DJI Mini 4 Pro, DJI Air 3 Fly More | Unfolded front gimbal, RC controller screen, propeller mount | Unsplash Free Commercial License |
| **Gaming Equipment** | PlayStation 5 Disc, Xbox Series X, Nintendo Switch OLED, Meta Quest 3 | Console front, wireless controller ergonomics, dock connections | Unsplash Free Commercial License |
| **Mobile Accessories** | DJI OM 6, Røde Wireless GO II, Anker 737 Power Bank, Godox Ring Light | Gimbal phone clamp, wireless transmitter clip, digital display | Unsplash Free Commercial License |
| **Audio & Speakers** | JBL PartyBox 310, Ahuja 250W PA System, Rødecaster Pro II, Sony SRS-XP700, Shure SM7B | Control knobs, dynamic RGB grill, microphone XLR mount | Unsplash Free Commercial License |
| **Musical Instruments** | Yamaha F310 Guitar, Casio CT-X9000IN, Yamaha PSR-I500, Roland TD-02KV | Soundboard spruce grain, Indian tone keypad, mesh drum pad | Unsplash Free Commercial License |
| **Power Tools** | DeWalt 20V Hammer Drill, Bosch Angle Grinder, Kärcher K3, Bosch Rotary Hammer, Makita Circular Saw | Chuck mechanism, motor housing, safety guard & blade | Unsplash Free Commercial License |
| **Kitchen Equipment** | Philips Air Fryer XXL, Prestige Induction, Morphy Richards 52L OTG | Digital touch panel, glass door interior, heating coil plate | Unsplash Free Commercial License |
| **Home Appliances** | Singer 4423 Sewing Machine, Daikin Portable AC, Philips Steam Iron | Needle plate, exhaust vent duct, ceramic iron soleplate | Unsplash Free Commercial License |
| **Bicycles & Cycling** | Trek Marlin 7, Firefox Target 29D, Giant Escape 3, Hero Lectro C6E | Drivetrain derailleur, handlebar cockpit, disc brake caliper | Unsplash Free Commercial License |
| **Sports & Fitness** | SG English Willow Kit, Yonex Astrox 99, Nivia Football, Cosco Bowling Machine | Willow grain & embossed handle, graphite racket frame, feeding chute | Unsplash Free Commercial License |
| **College & Study Equipment** | TI-Nspire CX II CAS, Wacom Intuos Pro, Casio FX-991CW ClassWiz | LCD natural textbook screen, pen nib drawing surface, button array | Unsplash Free Commercial License |
| **Travel Equipment** | Quechua MH100 Tent, Coleman 54Qt Cooler, Samsonite Hard-Shell, Thule Cargo Box | Rainfly ventilation door, interior insulation seal, TSA wheel spinner | Unsplash Free Commercial License |
| **Lighting Equipment** | Godox SL60W, Nanlite PavoTube II, Neewer 660 LED Panel | Bowens reflector softbox, tube RGB hue glow, barndoor diffuser | Unsplash Free Commercial License |
| **Office Equipment** | Jabra Speak 710, Fellowes AutoMax Shredder, Epson EcoTank L3250 | Conference mic grill, paper feed slot, ink tank window | Unsplash Free Commercial License |
| **Networking Equipment** | TP-Link Deco XE75 Pro, Netgear Nighthawk M6 5G, Cisco CBS250 Switch | Mesh tower port panel, LCD signal indicator, RJ45 Gigabit ports | Unsplash Free Commercial License |
| **Cleaning Equipment** | Kärcher WD 3 Wet/Dry, Dyson V12 Slim, Eureka Forbes Steam Mop | Stainless steel drum, laser illuminated cleaner head, steam nozzle | Unsplash Free Commercial License |
| **Outdoor Equipment** | Forclaz 50L Backpack, Quechua Foldable Table with Stools | Ergonomic lumbar harness, folding hinge mechanism, aluminum frame | Unsplash Free Commercial License |
| **Event & Party Equipment**| Beam 230W Moving Head, Chauvet Hurricane Fogger | Moving yoke optical lens, illuminated fog fluid tank, power socket | Unsplash Free Commercial License |
| **Projectors & Displays** | Epson EB-FH52, BenQ TK700STi 4K, ViewSonic M1+, Elite Screens 100" | Short-throw optical glass, Harman Kardon swivel stand, tripod frame | Unsplash Free Commercial License |

---

## 4. Local Image Uploads & User Contributions

For user-submitted listings created by equipment owners via the Owner Dashboard:
- Images are handled via `multer` file upload middleware (`backend/src/middleware/upload.ts`).
- Files are saved to `backend/uploads/` and served statically via `GET /uploads/<filename>`.
- The frontend [`getImageUrl`](file:///H:/CC%20Project/frontend/src/components/product/ProductDetailsModal.tsx) utility automatically reconciles both local relative paths (`/uploads/...`) and remote URLs (`https://...`).
