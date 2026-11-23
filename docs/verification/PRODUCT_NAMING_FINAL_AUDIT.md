# BorrowBuy — Product Naming & Single-Image Compliance Final Audit

## Executive Summary
This document provides the final audit evidence for the BorrowBuy equipment catalogue. All 116 product names have been simplified from long, technical titles into short, natural, and recognizable language (2 to 5 words). 

All updates were executed via transactional database migrations and synchronized with `database/prisma/seed.ts` while preserving 100% of the underlying entity relationships:
- **Product IDs**: Unchanged (UUID v4)
- **Owner IDs**: Unchanged (owner assignments preserved)
- **Category IDs**: Unchanged (25 canonical categories preserved)
- **Daily Rates & Security Deposits**: Unchanged
- **Single-Image Associations**: 116/116 products have strictly **ONE** relevant WebP image

---

## 1. Simplification Policy & Metrics
- **Total Products in Database**: 116
- **Total Categories**: 25
- **Naming Rule**: 2 to 5 natural words, eliminating redundant specifications, part numbers, and clutter.
- **Single-Image Compliance**: 116 / 116 products ($100.0\%$) have strictly `array_length(images, 1) == 1`.

---

## 2. Complete 116 Equipment Naming Audit Table

| # | Original Technical Name | Simplified Name | Category | Word Count | Single Image WebP |
| :---: | :--- | :--- | :--- | :---: | :---: |
| 1 | Sony Alpha a7 IV Mirrorless Camera Body | Sony A7 IV Camera | Cameras and Photography | 4 | `image-01.webp` |
| 2 | Canon EOS R6 Mark II Camera with 24-105mm Lens | Canon EOS R6 Mark II | Cameras and Photography | 5 | `image-01.webp` |
| 3 | Sony FE 70-200mm f/2.8 GM II Telephoto Lens | Sony 70-200mm GM Lens | Cameras and Photography | 4 | `image-01.webp` |
| 4 | GoPro HERO 12 Black Action Camera with Battery Grip & Mic | GoPro Hero 12 Black | Cameras and Photography | 4 | `image-01.webp` |
| 5 | Manfrotto 055 Carbon Fiber Tripod with Ball Head | Manfrotto Carbon Tripod | Cameras and Photography | 3 | `image-01.webp` |
| 6 | DJI Mini 4 Pro Drone with Screen Controller | DJI Mini 4 Pro Drone | Drones and Accessories | 5 | `image-01.webp` |
| 7 | Apple MacBook Pro 16-Inch M3 Max (36GB RAM, 1TB SSD) | MacBook Pro 16 M3 Max | Laptops and Computers | 5 | `image-01.webp` |
| 8 | Apple MacBook Air 13-Inch M2 (8GB RAM, 256GB SSD) | MacBook Air 13 M2 | Laptops and Computers | 4 | `image-01.webp` |
| 9 | Dell XPS 15 Laptop (Core i7, 32GB RAM, RTX 4060) | Dell XPS 15 Laptop | Laptops and Computers | 4 | `image-01.webp` |
| 10 | ASUS ROG Strix G16 Gaming Laptop (Core i7, RTX 4060) | ASUS ROG Strix G16 | Laptops and Computers | 4 | `image-01.webp` |
| 11 | LG 27-Inch 4K UHD IPS Monitor with USB-C | LG 27 4K Monitor | Laptops and Computers | 4 | `image-01.webp` |
| 12 | Texas Instruments Graphing Calculator TI-Nspire CX II | TI-Nspire CX II Calculator | College and Study Equipment | 4 | `image-01.webp` |
| 13 | Epson Full HD Projector (4000 Lumens) | Epson Full HD Projector | Projectors and Presentation | 4 | `image-01.webp` |
| 14 | BenQ 4K Short-Throw Gaming Projector | BenQ 4K Gaming Projector | Projectors and Presentation | 4 | `image-01.webp` |
| 15 | 100-Inch Portable Projector Screen with Tripod Stand | 100-Inch Projector Screen | Projectors and Presentation | 3 | `image-01.webp` |
| 16 | JBL PartyBox 310 Bluetooth Speaker (240W) | JBL PartyBox 310 Speaker | Audio and Speakers | 4 | `image-01.webp` |
| 17 | Ahuja 250W PA Sound System with 2 Wireless Mics | Ahuja PA Sound System | Audio and Speakers | 4 | `image-01.webp` |
| 18 | Rødecaster Pro II Podcast Mixer with 2 PodMics | RodeCaster Pro II Mixer | Audio and Speakers | 4 | `image-01.webp` |
| 19 | Yamaha F310 Acoustic Guitar with Bag | Yamaha F310 Acoustic Guitar | Musical Instruments | 4 | `image-01.webp` |
| 20 | Casio CT-X9000IN Electronic Keyboard with Indian Tones | Casio Electronic Keyboard | Musical Instruments | 3 | `image-01.webp` |
| 21 | DeWalt 20V Cordless Hammer Drill & Impact Driver Set | DeWalt 20V Cordless Drill | Power Tools | 4 | `image-01.webp` |
| 22 | Bosch 850W Angle Grinder (100mm) | Bosch Angle Grinder | Power Tools | 3 | `image-01.webp` |
| 23 | Kärcher K3 Pressure Washer (120 Bar) | Karcher K3 Pressure Washer | Cleaning Equipment | 4 | `image-01.webp` |
| 24 | Singer 4423 Sewing Machine | Singer Sewing Machine | Home Appliances | 3 | `image-01.webp` |
| 25 | Trek Marlin 7 Mountain Bike (Large Frame, 29-Inch Wheels) | Trek Marlin 7 Mountain Bike | Bicycles and Cycling | 5 | `image-01.webp` |
| 26 | Firefox Target 29D Hybrid Bicycle with Disc Brakes | Firefox Hybrid Bicycle | Bicycles and Cycling | 3 | `image-01.webp` |
| 27 | SG English Willow Cricket Kit with Kit Bag | SG Willow Cricket Kit | Sports and Fitness | 4 | `image-01.webp` |
| 28 | Yonex Astrox 99 Pro Badminton Rackets (Pair with Shuttles) | Yonex Badminton Rackets | Sports and Fitness | 3 | `image-01.webp` |
| 29 | Quechua MH100 4-Person Camping Tent | Quechua 4-Person Camping Tent | Travel and Camping | 4 | `image-01.webp` |
| 30 | Coleman 51-Litre Steel-Belted Ice Cooler Box | Coleman 51L Cooler Box | Travel and Camping | 4 | `image-01.webp` |
| 31 | Sony PlayStation 5 Console (Disc Edition with 2 Controllers) | PlayStation 5 Console | Gaming Equipment | 3 | `image-01.webp` |
| 32 | Microsoft Xbox Series X Console (1TB with 2 Controllers) | Xbox Series X Console | Gaming Equipment | 4 | `image-01.webp` |
| 33 | Nintendo Switch OLED Gaming Console (Neon Red/Blue) | Nintendo Switch OLED | Gaming Equipment | 3 | `image-01.webp` |
| 34 | Meta Quest 3 VR Headset (128GB) | Meta Quest 3 VR Headset | Gaming Equipment | 5 | `image-01.webp` |
| 35 | DJI Osmo Mobile 6 Smartphone Gimbal | DJI Osmo Mobile 6 Gimbal | Mobile Accessories | 5 | `image-01.webp` |
| 36 | Røde Wireless GO II Dual Channel Wireless Mic | Rode Wireless GO II Mics | Mobile Accessories | 5 | `image-01.webp` |
| 37 | Anker 737 Fast-Charging Power Bank (24,000mAh, 140W) | Anker 737 Power Bank | Mobile Accessories | 4 | `image-01.webp` |
| 38 | Godox LR150 18-Inch LED Ring Light with Phone Mount | Godox 18-Inch Ring Light | Mobile Accessories | 4 | `image-01.webp` |
| 39 | Philips XXL Digital Air Fryer (7.2L) | Philips XXL Air Fryer | Kitchen Equipment | 4 | `image-01.webp` |
| 40 | Prestige 1600W Induction Cooktop with Kadai | Prestige Induction Cooktop | Kitchen Equipment | 3 | `image-01.webp` |
| 41 | Morphy Richards 52L Oven Toaster Griller (OTG) | Morphy Richards 52L OTG | Kitchen Equipment | 4 | `image-01.webp` |
| 42 | Godox SL60W LED Studio Video Light with Softbox | Godox Studio Video Light | Lighting Equipment | 4 | `image-01.webp` |
| 43 | Nanlite PavoTube II 6C RGB LED Tube Lights (Pair) | Nanlite RGB Tube Lights | Lighting Equipment | 4 | `image-01.webp` |
| 44 | Neewer 660 Bi-Color LED Studio Light Panels (Pair with Stands) | Neewer LED Studio Lights | Lighting Equipment | 4 | `image-01.webp` |
| 45 | Jabra Speak 710 Bluetooth Conference Speakerphone | Jabra Bluetooth Speakerphone | Office Equipment | 3 | `image-01.webp` |
| 46 | Fellowes 100M Micro-Cut Paper Shredder | Fellowes Paper Shredder | Office Equipment | 3 | `image-01.webp` |
| 47 | Epson L3250 Color Ink Tank All-in-One Printer | Epson All-in-One Printer | Office Equipment | 3 | `image-01.webp` |
| 48 | TP-Link Deco XE75 Pro Mesh Wi-Fi 6E System (3-Pack) | TP-Link Mesh Wi-Fi System | Networking Equipment | 4 | `image-01.webp` |
| 49 | Netgear Nighthawk M6 Pro 5G Portable Wi-Fi Router | Netgear 5G Mobile Router | Networking Equipment | 4 | `image-01.webp` |
| 50 | Cisco 24-Port Gigabit PoE Network Switch | Cisco 24-Port Gigabit Switch | Networking Equipment | 4 | `image-01.webp` |
| 51 | Kärcher WD 3 Wet & Dry Vacuum Cleaner (17L) | Karcher Wet & Dry Vacuum | Cleaning Equipment | 5 | `image-01.webp` |
| 52 | Dyson V12 Detect Slim Cordless Vacuum Cleaner | Dyson V12 Cordless Vacuum | Cleaning Equipment | 4 | `image-01.webp` |
| 53 | Eureka Forbes Multi-Surface Steam Mop | Eureka Forbes Steam Mop | Cleaning Equipment | 4 | `image-01.webp` |
| 54 | Forclaz 50L Trekking Rucksack Backpack | Forclaz 50L Trekking Backpack | Travel and Camping | 4 | `image-01.webp` |
| 55 | Quechua Folding Camping Table with 4 Stools | Quechua Folding Camping Table | Travel and Camping | 4 | `image-01.webp` |
| 56 | Sharpy Beam 230W Moving Head Stage Light | Sharpy Beam Moving Stage Light | Event and Party Equipment | 5 | `image-01.webp` |
| 57 | Chauvet DJ Hurricane 1200 Fog Machine | Chauvet DJ Fog Machine | Event and Party Equipment | 4 | `image-01.webp` |
| 58 | Sony FE 24-70mm f/2.8 GM II Zoom Lens | Sony 24-70mm GM Lens | Cameras and Photography | 4 | `image-01.webp` |
| 59 | DJI RS 3 Pro Gimbal Stabilizer with LiDAR Focus | DJI RS 3 Pro Gimbal | Video Production | 5 | `image-01.webp` |
| 60 | DJI Air 3 Drone Fly More Combo (3 Batteries) | DJI Air 3 Drone Combo | Drones and Accessories | 5 | `image-01.webp` |
| 61 | Lenovo Legion Pro 5 Gaming Laptop (Ryzen 7, RTX 4070) | Lenovo Legion Pro 5 | Laptops and Computers | 4 | `image-01.webp` |
| 62 | Apple iPad Pro 12.9-Inch M2 with Apple Pencil 2 | iPad Pro 12.9 M2 | Laptops and Computers | 4 | `image-01.webp` |
| 63 | Sony SRS-XP700 Wireless Party Speaker | Sony Wireless Party Speaker | Audio and Speakers | 4 | `image-01.webp` |
| 64 | Shure SM7B Studio Vocal Microphone with Cloudlifter | Shure SM7B Vocal Microphone | Audio and Speakers | 4 | `image-01.webp` |
| 65 | Yamaha PSR-I500 61-Key Keyboard with Indian Tones | Yamaha Indian Tones Keyboard | Musical Instruments | 4 | `image-01.webp` |
| 66 | Roland TD-02KV Electronic Drum Kit with Headphones | Roland Electronic Drum Kit | Musical Instruments | 4 | `image-01.webp` |
| 67 | Bosch 800W Rotary Hammer Drill (GBH 2-26 DRE) | Bosch Rotary Hammer Drill | Power Tools | 4 | `image-01.webp` |
| 68 | Makita 18V Cordless Circular Saw (165mm) | Makita Cordless Circular Saw | Power Tools | 4 | `image-01.webp` |
| 69 | Giant Escape 3 Hybrid Bicycle (Medium Frame) | Giant Escape 3 Bicycle | Bicycles and Cycling | 4 | `image-01.webp` |
| 70 | Hero Lectro C6E Electric Bicycle (30km Range) | Hero Lectro Electric Bicycle | Bicycles and Cycling | 4 | `image-01.webp` |
| 71 | Nivia Leather Football with Training Cones & Agility Ladder | Nivia Football Training Set | Sports and Fitness | 4 | `image-01.webp` |
| 72 | Cosco Tennis Ball Cricket Bowling Machine | Cosco Cricket Bowling Machine | Sports and Fitness | 4 | `image-01.webp` |
| 73 | Wacom Intuos Pro Medium Drawing Tablet with Pen | Wacom Intuos Pro Tablet | College and Study Equipment | 4 | `image-01.webp` |
| 74 | Casio FX-991CW Scientific Calculator (Set of 2) | Casio Scientific Calculator | College and Study Equipment | 3 | `image-01.webp` |
| 75 | Daikin 1.5 Ton Portable Air Conditioner | Daikin Portable Air Conditioner | Home Appliances | 4 | `image-01.webp` |
| 76 | Philips 2400W Steam Iron with Ironing Board | Philips Steam Iron Set | Home Appliances | 4 | `image-01.webp` |
| 77 | Samsonite 28-Inch Hard Luggage Suitcase (Set of 2) | Samsonite Luggage Suitcase Set | Travel and Camping | 4 | `image-01.webp` |
| 78 | Thule Force XT 500L Car Roof Cargo Box with Bars | Thule Car Roof Cargo Box | Travel and Camping | 5 | `image-01.webp` |
| 79 | ViewSonic M1+ Portable Mini LED Projector | ViewSonic Mini LED Projector | Projectors and Presentation | 4 | `image-01.webp` |
| 80 | Logitech Spotlight Wireless Presentation Clicker | Logitech Wireless Clicker | Projectors and Presentation | 3 | `image-01.webp` |
| 81 | DJI Mini 4 Pro Drone Fly More Combo (3 Batteries) | DJI Mini 4 Drone Combo | Drones and Accessories | 5 | `image-01.webp` |
| 82 | Autel EVO Lite+ 6K Camera Drone | Autel EVO 6K Drone | Drones and Accessories | 4 | `image-01.webp` |
| 83 | Chauvet DJ GigBAR Move 5-in-1 Stage Lighting Bar | Chauvet DJ Stage Lighting Bar | Event and Party Equipment | 5 | `image-01.webp` |
| 84 | BeamZ 1500W Stage Fog Machine with Remote | BeamZ Stage Fog Machine | Event and Party Equipment | 4 | `image-01.webp` |
| 85 | Quechua MH100 Fresh & Black 4-Person Blackout Tent | Quechua Blackout Camping Tent | Travel and Camping | 4 | `image-01.webp` |
| 86 | Coleman 51-Litre Steel-Belted Ice Cooler Box (Vadodara Hub) | Coleman Steel Cooler Box | Travel and Camping | 4 | `image-01.webp` |
| 87 | Philips Series 2000 Room Air Purifier | Philips Room Air Purifier | Home Appliances | 4 | `image-01.webp` |
| 88 | Dyson V12 Detect Slim Absolute Vacuum Cleaner (with Floor Fluffy Head) | Dyson Slim Absolute Vacuum | Cleaning Equipment | 4 | `image-01.webp` |
| 89 | Ninja Foodi DualZone Air Fryer (2-Basket, 7.6L) | Ninja DualZone Air Fryer | Kitchen Equipment | 4 | `image-01.webp` |
| 90 | Aputure Amaran 200x Bi-Color LED Video Light (200W) | Aputure Bi-Color Video Light | Lighting Equipment | 4 | `image-01.webp` |
| 91 | Netgear Nighthawk M6 Pro 5G Mobile Wi-Fi 6E Router | Netgear 5G Mobile Hotspot | Networking Equipment | 4 | `image-01.webp` |
| 92 | Fellowes 79Ci Heavy-Duty Cross-Cut Paper Shredder | Fellowes Heavy-Duty Shredder | Office Equipment | 3 | `image-01.webp` |
| 93 | Huion Kamvas Pro 16 Drawing Tablet (2.5K Display) | Huion Kamvas Pro 16 Tablet | College and Study Equipment | 5 | `image-01.webp` |
| 94 | Zhiyun Smooth 5S Smartphone Gimbal with Fill Light | Zhiyun Smooth 5S Gimbal | Mobile Accessories | 4 | `image-01.webp` |
| 95 | Firefox Road Runner Pro Hybrid Bicycle (700C Wheels) | Firefox Road Runner Bicycle | Bicycles and Cycling | 4 | `image-01.webp` |
| 96 | Nintendo Switch OLED Console Kit (with Pro Controller & Games) | Nintendo Switch Gaming Bundle | Gaming Equipment | 4 | `image-01.webp` |
| 97 | Yamaha P-125 88-Key Weighted Digital Piano with Stand | Yamaha Digital Piano | Musical Instruments | 3 | `image-01.webp` |
| 98 | SG Savage English Willow Cricket Kit (Full Set) | SG Savage Cricket Kit | Sports and Fitness | 4 | `image-01.webp` |
| 99 | Delsey Paris Hard Luggage Trolley Bag Set | Delsey Paris Trolley Bag Set | Travel and Camping | 5 | `image-01.webp` |
| 100 | Fujifilm X-T5 Mirrorless Camera Body (Silver) | Fujifilm X-T5 Camera | Cameras and Photography | 3 | `image-01.webp` |
| 101 | Sony FX6 Full-Frame Cinema Camera Kit | Sony FX6 Cinema Camera | Video Production | 4 | `image-01.webp` |
| 102 | Blackmagic Pocket Cinema Camera 6K Pro with Cage | Blackmagic Pocket 6K Pro | Video Production | 4 | `image-01.webp` |
| 103 | DJI Ronin 4D 6K Cinema Camera with 4-Axis Gimbal | DJI Ronin 4D Cinema Camera | Video Production | 5 | `image-01.webp` |
| 104 | Hollyland Mars 400S Pro Wireless Video Transmitter & Receiver | Hollyland Mars Video Transmitter | Video Production | 4 | `image-01.webp` |
| 105 | Bosch 880W Heavy Rotary Hammer Drill (GBH 2-28 F) | Bosch Heavy Hammer Drill | Construction Equipment | 4 | `image-01.webp` |
| 106 | DeWalt 12-Inch Sliding Compound Miter Saw | DeWalt Sliding Miter Saw | Construction Equipment | 4 | `image-01.webp` |
| 107 | Huepar 3D 12-Line Self-Leveling Green Laser Level | Huepar 3D Green Laser Level | Construction Equipment | 5 | `image-01.webp` |
| 108 | Husqvarna K770 14-Inch Concrete Cut-Off Saw | Husqvarna Concrete Cut-Off Saw | Construction Equipment | 4 | `image-01.webp` |
| 109 | Bugaboo Butterfly Compact Folding Baby Stroller | Bugaboo Compact Baby Stroller | Baby and Family Equipment | 4 | `image-01.webp` |
| 110 | Cybex Sirona S 360-Degree Swivel Baby Car Seat | Cybex Swivel Baby Car Seat | Baby and Family Equipment | 5 | `image-01.webp` |
| 111 | BabyBjörn Bouncer Bliss Cotton Baby Rocker | BabyBjorn Cotton Baby Rocker | Baby and Family Equipment | 4 | `image-01.webp` |
| 112 | Guava Lotus Portable Travel Crib & Playpen | Guava Lotus Travel Crib | Baby and Family Equipment | 4 | `image-01.webp` |
| 113 | Traditional Brass Samai Floor Lamps (4-Foot Pair) | Traditional Brass Samai Lamps | Decoration and Furniture | 4 | `image-01.webp` |
| 114 | Velvet Event Lounge Sofa Set (4-Piece Modular) | Velvet Event Lounge Sofa | Decoration and Furniture | 4 | `image-01.webp` |
| 115 | Pine Wood Hexagonal Wedding Stage Arch (8-Foot) | Pine Wood Wedding Arch | Decoration and Furniture | 4 | `image-01.webp` |
| 116 | Traditional Carved Teakwood Sankheda Swing (5-Foot Jhula) | Traditional Wooden Swing | Decoration and Furniture | 3 | `image-01.webp` |

---

## 3. Database & Seed Verification Query Results
- **Database Query**: `SELECT COUNT(*), array_length(images, 1) FROM "Product" GROUP BY array_length(images, 1);`
  - Output: `116 | 1` (All 116 products have strictly 1 image).
- **Name Verification**: `SELECT COUNT(*) FROM "Product" WHERE name NOT IN (SELECT simplified FROM mapping);`
  - Output: `0` (Zero unsimplified names remain).
- **Word Count Range**: Minimum 3 words, Maximum 5 words across all 116 products.
- **Audit Conclusion**: **100% COMPLIANT & SYNCHRONIZED**
