import fs from 'fs';

const simplifiedNames = [
  // 1-10
  { original: "Sony Alpha a7 IV Mirrorless Camera Body", simplified: "Sony A7 IV Camera" },
  { original: "Canon EOS R6 Mark II Camera with 24-105mm Lens", simplified: "Canon EOS R6 Mark II" },
  { original: "Sony FE 70-200mm f/2.8 GM II Telephoto Lens", simplified: "Sony 70-200mm GM Lens" },
  { original: "GoPro HERO 12 Black Action Camera with Battery Grip & Mic", simplified: "GoPro Hero 12 Black" },
  { original: "Manfrotto 055 Carbon Fiber Tripod with Ball Head", simplified: "Manfrotto Carbon Tripod" },
  { original: "DJI Mini 4 Pro Drone with Screen Controller", simplified: "DJI Mini 4 Pro Drone" },
  { original: "Apple MacBook Pro 16-Inch M3 Max (36GB RAM, 1TB SSD)", simplified: "MacBook Pro 16 M3 Max" },
  { original: "Apple MacBook Air 13-Inch M2 (8GB RAM, 256GB SSD)", simplified: "MacBook Air 13 M2" },
  { original: "Dell XPS 15 Laptop (Core i7, 32GB RAM, RTX 4060)", simplified: "Dell XPS 15 Laptop" },
  { original: "ASUS ROG Strix G16 Gaming Laptop (Core i7, RTX 4060)", simplified: "ASUS ROG Strix G16" },

  // 11-20
  { original: "LG 27-Inch 4K UHD IPS Monitor with USB-C", simplified: "LG 27 4K Monitor" },
  { original: "Texas Instruments Graphing Calculator TI-Nspire CX II", simplified: "TI-Nspire CX II Calculator" },
  { original: "Epson Full HD Projector (4000 Lumens)", simplified: "Epson Full HD Projector" },
  { original: "BenQ 4K Short-Throw Gaming Projector", simplified: "BenQ 4K Gaming Projector" },
  { original: "100-Inch Portable Projector Screen with Tripod Stand", simplified: "100-Inch Projector Screen" },
  { original: "JBL PartyBox 310 Bluetooth Speaker (240W)", simplified: "JBL PartyBox 310 Speaker" },
  { original: "Ahuja 250W PA Sound System with 2 Wireless Mics", simplified: "Ahuja PA Sound System" },
  { original: "Rødecaster Pro II Podcast Mixer with 2 PodMics", simplified: "RodeCaster Pro II Mixer" },
  { original: "Yamaha F310 Acoustic Guitar with Bag", simplified: "Yamaha F310 Acoustic Guitar" },
  { original: "Casio CT-X9000IN Electronic Keyboard with Indian Tones", simplified: "Casio Electronic Keyboard" },

  // 21-30
  { original: "DeWalt 20V Cordless Hammer Drill & Impact Driver Set", simplified: "DeWalt 20V Cordless Drill" },
  { original: "Bosch 850W Angle Grinder (100mm)", simplified: "Bosch Angle Grinder" },
  { original: "Kärcher K3 Pressure Washer (120 Bar)", simplified: "Karcher K3 Pressure Washer" },
  { original: "Singer 4423 Sewing Machine", simplified: "Singer Sewing Machine" },
  { original: "Trek Marlin 7 Mountain Bike (Large Frame, 29-Inch Wheels)", simplified: "Trek Marlin 7 Mountain Bike" },
  { original: "Firefox Target 29D Hybrid Bicycle with Disc Brakes", simplified: "Firefox Hybrid Bicycle" },
  { original: "SG English Willow Cricket Kit with Kit Bag", simplified: "SG Willow Cricket Kit" },
  { original: "Yonex Astrox 99 Pro Badminton Rackets (Pair with Shuttles)", simplified: "Yonex Badminton Rackets" },
  { original: "Quechua MH100 4-Person Camping Tent", simplified: "Quechua 4-Person Camping Tent" },
  { original: "Coleman 51-Litre Steel-Belted Ice Cooler Box", simplified: "Coleman 51L Cooler Box" },

  // 31-40
  { original: "Sony PlayStation 5 Console (Disc Edition with 2 Controllers)", simplified: "PlayStation 5 Console" },
  { original: "Microsoft Xbox Series X Console (1TB with 2 Controllers)", simplified: "Xbox Series X Console" },
  { original: "Nintendo Switch OLED Gaming Console (Neon Red/Blue)", simplified: "Nintendo Switch OLED" },
  { original: "Meta Quest 3 VR Headset (128GB)", simplified: "Meta Quest 3 VR Headset" },
  { original: "DJI Osmo Mobile 6 Smartphone Gimbal", simplified: "DJI Osmo Mobile 6 Gimbal" },
  { original: "Røde Wireless GO II Dual Channel Wireless Mic", simplified: "Rode Wireless GO II Mics" },
  { original: "Anker 737 Fast-Charging Power Bank (24,000mAh, 140W)", simplified: "Anker 737 Power Bank" },
  { original: "Godox LR150 18-Inch LED Ring Light with Phone Mount", simplified: "Godox 18-Inch Ring Light" },
  { original: "Philips XXL Digital Air Fryer (7.2L)", simplified: "Philips XXL Air Fryer" },
  { original: "Prestige 1600W Induction Cooktop with Kadai", simplified: "Prestige Induction Cooktop" },

  // 41-50
  { original: "Morphy Richards 52L Oven Toaster Griller (OTG)", simplified: "Morphy Richards 52L OTG" },
  { original: "Godox SL60W LED Studio Video Light with Softbox", simplified: "Godox Studio Video Light" },
  { original: "Nanlite PavoTube II 6C RGB LED Tube Lights (Pair)", simplified: "Nanlite RGB Tube Lights" },
  { original: "Neewer 660 Bi-Color LED Studio Light Panels (Pair with Stands)", simplified: "Neewer LED Studio Lights" },
  { original: "Jabra Speak 710 Bluetooth Conference Speakerphone", simplified: "Jabra Bluetooth Speakerphone" },
  { original: "Fellowes 100M Micro-Cut Paper Shredder", simplified: "Fellowes Paper Shredder" },
  { original: "Epson L3250 Color Ink Tank All-in-One Printer", simplified: "Epson All-in-One Printer" },
  { original: "TP-Link Deco XE75 Pro Mesh Wi-Fi 6E System (3-Pack)", simplified: "TP-Link Mesh Wi-Fi System" },
  { original: "Netgear Nighthawk M6 Pro 5G Portable Wi-Fi Router", simplified: "Netgear 5G Mobile Router" },
  { original: "Cisco 24-Port Gigabit PoE Network Switch", simplified: "Cisco 24-Port Gigabit Switch" },

  // 51-60
  { original: "Kärcher WD 3 Wet & Dry Vacuum Cleaner (17L)", simplified: "Karcher Wet & Dry Vacuum" },
  { original: "Dyson V12 Detect Slim Cordless Vacuum Cleaner", simplified: "Dyson V12 Cordless Vacuum" },
  { original: "Eureka Forbes Multi-Surface Steam Mop", simplified: "Eureka Forbes Steam Mop" },
  { original: "Forclaz 50L Trekking Rucksack Backpack", simplified: "Forclaz 50L Trekking Backpack" },
  { original: "Quechua Folding Camping Table with 4 Stools", simplified: "Quechua Folding Camping Table" },
  { original: "Sharpy Beam 230W Moving Head Stage Light", simplified: "Sharpy Beam Moving Stage Light" },
  { original: "Chauvet DJ Hurricane 1200 Fog Machine", simplified: "Chauvet DJ Fog Machine" },
  { original: "Sony FE 24-70mm f/2.8 GM II Zoom Lens", simplified: "Sony 24-70mm GM Lens" },
  { original: "DJI RS 3 Pro Gimbal Stabilizer with LiDAR Focus", simplified: "DJI RS 3 Pro Gimbal" },
  { original: "DJI Air 3 Drone Fly More Combo (3 Batteries)", simplified: "DJI Air 3 Drone Combo" },

  // 61-70
  { original: "Lenovo Legion Pro 5 Gaming Laptop (Ryzen 7, RTX 4070)", simplified: "Lenovo Legion Pro 5" },
  { original: "Apple iPad Pro 12.9-Inch M2 with Apple Pencil 2", simplified: "iPad Pro 12.9 M2" },
  { original: "Sony SRS-XP700 Wireless Party Speaker", simplified: "Sony Wireless Party Speaker" },
  { original: "Shure SM7B Studio Vocal Microphone with Cloudlifter", simplified: "Shure SM7B Vocal Microphone" },
  { original: "Yamaha PSR-I500 61-Key Keyboard with Indian Tones", simplified: "Yamaha Indian Tones Keyboard" },
  { original: "Roland TD-02KV Electronic Drum Kit with Headphones", simplified: "Roland Electronic Drum Kit" },
  { original: "Bosch 800W Rotary Hammer Drill (GBH 2-26 DRE)", simplified: "Bosch Rotary Hammer Drill" },
  { original: "Makita 18V Cordless Circular Saw (165mm)", simplified: "Makita Cordless Circular Saw" },
  { original: "Giant Escape 3 Hybrid Bicycle (Medium Frame)", simplified: "Giant Escape 3 Bicycle" },
  { original: "Hero Lectro C6E Electric Bicycle (30km Range)", simplified: "Hero Lectro Electric Bicycle" },

  // 71-80
  { original: "Nivia Leather Football with Training Cones & Agility Ladder", simplified: "Nivia Football Training Set" },
  { original: "Cosco Tennis Ball Cricket Bowling Machine", simplified: "Cosco Cricket Bowling Machine" },
  { original: "Wacom Intuos Pro Medium Drawing Tablet with Pen", simplified: "Wacom Intuos Pro Tablet" },
  { original: "Casio FX-991CW Scientific Calculator (Set of 2)", simplified: "Casio Scientific Calculator" },
  { original: "Daikin 1.5 Ton Portable Air Conditioner", simplified: "Daikin Portable Air Conditioner" },
  { original: "Philips 2400W Steam Iron with Ironing Board", simplified: "Philips Steam Iron Set" },
  { original: "Samsonite 28-Inch Hard Luggage Suitcase (Set of 2)", simplified: "Samsonite Luggage Suitcase Set" },
  { original: "Thule Force XT 500L Car Roof Cargo Box with Bars", simplified: "Thule Car Roof Cargo Box" },
  { original: "ViewSonic M1+ Portable Mini LED Projector", simplified: "ViewSonic Mini LED Projector" },
  { original: "Logitech Spotlight Wireless Presentation Clicker", simplified: "Logitech Wireless Clicker" },

  // 81-90
  { original: "DJI Mini 4 Pro Drone Fly More Combo (3 Batteries)", simplified: "DJI Mini 4 Drone Combo" },
  { original: "Autel EVO Lite+ 6K Camera Drone", simplified: "Autel EVO 6K Drone" },
  { original: "Chauvet DJ GigBAR Move 5-in-1 Stage Lighting Bar", simplified: "Chauvet DJ Stage Lighting Bar" },
  { original: "BeamZ 1500W Stage Fog Machine with Remote", simplified: "BeamZ Stage Fog Machine" },
  { original: "Quechua MH100 Fresh & Black 4-Person Blackout Tent", simplified: "Quechua Blackout Camping Tent" },
  { original: "Coleman 51-Litre Steel-Belted Ice Cooler Box (Vadodara Hub)", simplified: "Coleman Steel Cooler Box" },
  { original: "Philips Series 2000 Room Air Purifier", simplified: "Philips Room Air Purifier" },
  { original: "Dyson V12 Detect Slim Absolute Vacuum Cleaner (with Floor Fluffy Head)", simplified: "Dyson Slim Absolute Vacuum" },
  { original: "Ninja Foodi DualZone Air Fryer (2-Basket, 7.6L)", simplified: "Ninja DualZone Air Fryer" },
  { original: "Aputure Amaran 200x Bi-Color LED Video Light (200W)", simplified: "Aputure Bi-Color Video Light" },

  // 91-100
  { original: "Netgear Nighthawk M6 Pro 5G Mobile Wi-Fi 6E Router", simplified: "Netgear 5G Mobile Hotspot" },
  { original: "Fellowes 79Ci Heavy-Duty Cross-Cut Paper Shredder", simplified: "Fellowes Heavy-Duty Shredder" },
  { original: "Huion Kamvas Pro 16 Drawing Tablet (2.5K Display)", simplified: "Huion Kamvas Pro 16 Tablet" },
  { original: "Zhiyun Smooth 5S Smartphone Gimbal with Fill Light", simplified: "Zhiyun Smooth 5S Gimbal" },
  { original: "Firefox Road Runner Pro Hybrid Bicycle (700C Wheels)", simplified: "Firefox Road Runner Bicycle" },
  { original: "Nintendo Switch OLED Console Kit (with Pro Controller & Games)", simplified: "Nintendo Switch Gaming Bundle" },
  { original: "Yamaha P-125 88-Key Weighted Digital Piano with Stand", simplified: "Yamaha Digital Piano" },
  { original: "SG Savage English Willow Cricket Kit (Full Set)", simplified: "SG Savage Cricket Kit" },
  { original: "Delsey Paris Hard Luggage Trolley Bag Set", simplified: "Delsey Paris Trolley Bag Set" },
  { original: "Fujifilm X-T5 Mirrorless Camera Body (Silver)", simplified: "Fujifilm X-T5 Camera" },

  // 101-116
  { original: "Sony FX6 Full-Frame Cinema Camera Kit", simplified: "Sony FX6 Cinema Camera" },
  { original: "Blackmagic Pocket Cinema Camera 6K Pro with Cage", simplified: "Blackmagic Pocket 6K Pro" },
  { original: "DJI Ronin 4D 6K Cinema Camera with 4-Axis Gimbal", simplified: "DJI Ronin 4D Cinema Camera" },
  { original: "Hollyland Mars 400S Pro Wireless Video Transmitter & Receiver", simplified: "Hollyland Mars Video Transmitter" },
  { original: "Bosch 880W Heavy Rotary Hammer Drill (GBH 2-28 F)", simplified: "Bosch Heavy Hammer Drill" },
  { original: "DeWalt 12-Inch Sliding Compound Miter Saw", simplified: "DeWalt Sliding Miter Saw" },
  { original: "Huepar 3D 12-Line Self-Leveling Green Laser Level", simplified: "Huepar 3D Green Laser Level" },
  { original: "Husqvarna K770 14-Inch Concrete Cut-Off Saw", simplified: "Husqvarna Concrete Cut-Off Saw" },
  { original: "Bugaboo Butterfly Compact Folding Baby Stroller", simplified: "Bugaboo Compact Baby Stroller" },
  { original: "Cybex Sirona S 360-Degree Swivel Baby Car Seat", simplified: "Cybex Swivel Baby Car Seat" },
  { original: "BabyBjörn Bouncer Bliss Cotton Baby Rocker", simplified: "BabyBjorn Cotton Baby Rocker" },
  { original: "Guava Lotus Portable Travel Crib & Playpen", simplified: "Guava Lotus Travel Crib" },
  { original: "Traditional Brass Samai Floor Lamps (4-Foot Pair)", simplified: "Traditional Brass Samai Lamps" },
  { original: "Velvet Event Lounge Sofa Set (4-Piece Modular)", simplified: "Velvet Event Lounge Sofa" },
  { original: "Pine Wood Hexagonal Wedding Stage Arch (8-Foot)", simplified: "Pine Wood Wedding Arch" },
  { original: "Traditional Carved Teakwood Sankheda Swing (5-Foot Jhula)", simplified: "Traditional Wooden Swing" }
];

// Validation
console.log(`Checking ${simplifiedNames.length} items...`);
if (simplifiedNames.length !== 116) {
  throw new Error(`Expected 116 items, got ${simplifiedNames.length}`);
}

const originalList = JSON.parse(fs.readFileSync('scripts/seed_products.json', 'utf8'));
const originalsInMap = simplifiedNames.map(s => s.original);

// Check that every original exists in seed_products.json
for (let i = 0; i < 116; i++) {
  if (originalList[i] !== originalsInMap[i]) {
    console.error(`Mismatch at index ${i}:`);
    console.error(`  Expected: "${originalList[i]}"`);
    console.error(`  Found   : "${originalsInMap[i]}"`);
  }
}

// Check word count for each simplified name
for (const item of simplifiedNames) {
  const words = item.simplified.trim().split(/\s+/);
  if (words.length < 2 || words.length > 6) {
    console.warn(`Word count warning (${words.length} words): "${item.simplified}"`);
  }
}

fs.writeFileSync('scripts/product-name-map.json', JSON.stringify(simplifiedNames, null, 2));
console.log('Successfully written scripts/product-name-map.json with 116 simplified names!');
