import {
  PrismaClient,
  UserRole,
  UserStatus,
  ProductCondition,
  ApprovalStatus,
  ListingStatus,
  BookingStatus,
  PaymentStatus,
  DepositStatus,
  ReviewType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting India-First database seeding for BorrowBuy...');

  // Clean existing records in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.securityDeposit.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // Password hashing
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);
  
  // Secure administrator password from env (or secure default for local testing)
  const rawAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Harshal@Admin2026!';
  const adminPasswordHash = await bcrypt.hash(rawAdminPassword, salt);

  // --------------------------------------------------------------------------
  // 1. SEED ADMINISTRATOR (Exactly 1 Admin)
  // --------------------------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      email: 'harshal07@gmail.com',
      fullName: 'Harshal Patel',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      phone: '+91 98250 12345',
      ownerAddress: 'Infocity, Gandhinagar, Gujarat',
      trustScore: 5.0,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  // --------------------------------------------------------------------------
  // 2. SEED 6 OWNERS (Gujarat & Indian Tech Hubs)
  // --------------------------------------------------------------------------
  const ownerRajesh = await prisma.user.create({
    data: {
      email: 'rajesh.owner@borrowbuy.in',
      fullName: 'Rajesh Patel',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Commercial wedding and event photographer based in Navrangpura, Ahmedabad. All cameras, lenses, and lighting equipment are professionally calibrated and stored in humidity-controlled dry cabinets.',
      ownerAddress: 'Navrangpura, Ahmedabad, Gujarat',
      phone: '+91 98791 23456',
      trustScore: 4.9,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerPriya = await prisma.user.create({
    data: {
      email: 'priya.owner@borrowbuy.in',
      fullName: 'Priya Shah',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Event organizer & audio sound technician in Vastrapur. Renting sound systems, microphones, DJ consoles, and instruments for Garba practice, college fests, and corporate functions.',
      ownerAddress: 'Vastrapur, Ahmedabad, Gujarat',
      phone: '+91 98240 98765',
      trustScore: 4.9,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerAmit = await prisma.user.create({
    data: {
      email: 'amit.owner@borrowbuy.in',
      fullName: 'Amit Sharma',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Software architect and tech enthusiast in Kudasan, Gandhinagar. Renting high-performance MacBook Pros, gaming laptops, and 4K monitors for developers and college project submissions.',
      ownerAddress: 'Kudasan, Gandhinagar, Gujarat',
      phone: '+91 97123 45678',
      trustScore: 4.8,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerSneha = await prisma.user.create({
    data: {
      email: 'sneha.owner@borrowbuy.in',
      fullName: 'Sneha Mehta',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Interior designer and DIY specialist in Adajan, Surat. Providing commercial-grade power drills, pressure washers, and home maintenance tools for temporary house shifting and renovation.',
      ownerAddress: 'Adajan, Surat, Gujarat',
      phone: '+91 99090 11223',
      trustScore: 4.8,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerVikram = await prisma.user.create({
    data: {
      email: 'vikram.owner@borrowbuy.in',
      fullName: 'Vikram Desai',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Outdoor adventure guide in Alkapuri, Vadodara. Renting high-grade hybrid bicycles, waterproof camping tents, trekking kits, and tournament sports equipment.',
      ownerAddress: 'Alkapuri, Vadodara, Gujarat',
      phone: '+91 98980 44556',
      trustScore: 4.9,
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerAnanya = await prisma.user.create({
    data: {
      email: 'ananya.owner@borrowbuy.in',
      fullName: 'Ananya Joshi',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Corporate presentation specialist in Prahlad Nagar, Ahmedabad. Supplying 4K high-lumens projectors, portable pull-up screens, and wireless presentation clickers for business seminars.',
      ownerAddress: 'Prahlad Nagar, Ahmedabad, Gujarat',
      phone: '+91 98255 66778',
      trustScore: 5.0,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    },
  });

  // --------------------------------------------------------------------------
  // 3. SEED 18 CUSTOMERS (Indian Cities & Realistic Profiles)
  // --------------------------------------------------------------------------
  const customerList = [
    { name: 'Priya Shah', email: 'priya.customer@borrowbuy.in', city: 'Satellite, Ahmedabad, Gujarat', phone: '+91 98251 10001' },
    { name: 'Rohan Gupta', email: 'rohan.gupta@borrowbuy.in', city: 'Navrangpura, Ahmedabad, Gujarat', phone: '+91 98251 10002' },
    { name: 'Neha Trivedi', email: 'neha.trivedi@borrowbuy.in', city: 'Sargasan, Gandhinagar, Gujarat', phone: '+91 98251 10003' },
    { name: 'Parth Dave', email: 'parth.dave@borrowbuy.in', city: 'Vesu, Surat, Gujarat', phone: '+91 98251 10004' },
    { name: 'Anjali Verma', email: 'anjali.verma@borrowbuy.in', city: 'Fatehgunj, Vadodara, Gujarat', phone: '+91 98251 10005' },
    { name: 'Siddharth Rao', email: 'siddharth.rao@borrowbuy.in', city: 'Kalawad Road, Rajkot, Gujarat', phone: '+91 98251 10006' },
    { name: 'Pooja Iyer', email: 'pooja.iyer@borrowbuy.in', city: 'Bodakdev, Ahmedabad, Gujarat', phone: '+91 98251 10007' },
    { name: 'Chirag Bhatt', email: 'chirag.bhatt@borrowbuy.in', city: 'Kudasan, Gandhinagar, Gujarat', phone: '+91 98251 10008' },
    { name: 'Meera Nair', email: 'meera.nair@borrowbuy.in', city: 'Ghod Dod Road, Surat, Gujarat', phone: '+91 98251 10009' },
    { name: 'Hardik Joshi', email: 'hardik.joshi@borrowbuy.in', city: 'Akota, Vadodara, Gujarat', phone: '+91 98251 10010' },
    { name: 'Swati Kulkarni', email: 'swati.kulkarni@borrowbuy.in', city: 'Kothrud, Pune, Maharashtra', phone: '+91 98251 10011' },
    { name: 'Devang Raval', email: 'devang.raval@borrowbuy.in', city: 'Naranpura, Ahmedabad, Gujarat', phone: '+91 98251 10012' },
    { name: 'Ritu Malhotra', email: 'ritu.malhotra@borrowbuy.in', city: 'Andheri West, Mumbai, Maharashtra', phone: '+91 98251 10013' },
    { name: 'Tanmay Solanki', email: 'tanmay.solanki@borrowbuy.in', city: 'Vidyanagar, Anand, Gujarat', phone: '+91 98251 10014' },
    { name: 'Ishita Saxena', email: 'ishita.saxena@borrowbuy.in', city: 'Waghawadi Road, Bhavnagar, Gujarat', phone: '+91 98251 10015' },
    { name: 'Bhavin Panchal', email: 'bhavin.panchal@borrowbuy.in', city: 'Maninagar, Ahmedabad, Gujarat', phone: '+91 98251 10016' },
    { name: 'Kruti Vora', email: 'kruti.vora@borrowbuy.in', city: 'University Road, Rajkot, Gujarat', phone: '+91 98251 10017' },
    { name: 'Yash Kapadia', email: 'yash.kapadia@borrowbuy.in', city: 'Piplod, Surat, Gujarat', phone: '+91 98251 10018' },
  ];

  const seededCustomers: any[] = [];
  for (const c of customerList) {
    const cust = await prisma.user.create({
      data: {
        email: c.email,
        fullName: c.name,
        passwordHash: defaultPasswordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        phone: c.phone,
        ownerAddress: c.city,
        trustScore: 5.0,
      },
    });
    seededCustomers.push(cust);
  }

  const primaryCustomer = seededCustomers[0]; // Priya Shah (Customer)

  // --------------------------------------------------------------------------
  // 4. SEED 12 INDIAN CATEGORIES
  // --------------------------------------------------------------------------
  const categoryDefs = [
    { name: 'Cameras & Photography', slug: 'cameras', icon: 'Camera', description: 'DSLRs, mirrorless cameras, prime lenses, gimbals, and studio lighting.' },
    { name: 'Laptops & Computers', slug: 'laptops', icon: 'Laptop', description: 'MacBooks, Windows coding laptops, gaming rigs, and high-res external monitors.' },
    { name: 'Projectors & Displays', slug: 'projectors', icon: 'Projector', description: 'Full HD and 4K projectors with tripod screens for college fests and business meetings.' },
    { name: 'Sound & Audio Systems', slug: 'audio', icon: 'Volume2', description: 'PA speakers, party sound systems, wireless mics, podcast mixers, and amplifiers.' },
    { name: 'Bicycles & Mobility', slug: 'bicycles', icon: 'Bike', description: 'Geared mountain bikes, city hybrids, and commute cycles.' },
    { name: 'Sports & Fitness Equipment', slug: 'sports', icon: 'Activity', description: 'Full cricket kits, badminton sets, football gear, and gym accessories.' },
    { name: 'Power Tools & DIY Gear', slug: 'tools', icon: 'Wrench', description: 'Cordless drills, miter saws, angle grinders, and pressure washers.' },
    { name: 'Home & Kitchen Appliances', slug: 'appliances', icon: 'Home', description: 'Heavy-duty sewing machines, portable vacuums, and temporary home appliances.' },
    { name: 'Musical Instruments', slug: 'instruments', icon: 'Music', description: 'Acoustic guitars, Indian keyboards, harmoniums, and electronic drums.' },
    { name: 'College & Study Equipment', slug: 'study', icon: 'BookOpen', description: 'Scientific calculators, drawing boards, and presentation clickers.' },
    { name: 'Travel & Camping Accessories', slug: 'travel', icon: 'Compass', description: 'Waterproof trekking tents, sleeping bags, cooler boxes, and rucksacks.' },
    { name: 'Drones & Aerial Video', slug: 'drones', icon: 'Send', description: '4K cinema drones with controllers and extra batteries for pre-wedding and landscape shoots.' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoryDefs) {
    categories[cat.slug] = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      },
    });
  }

  // --------------------------------------------------------------------------
  // 5. SEED 30 HIGH-QUALITY PRODUCT LISTINGS (Realistic Indian Rates & Data)
  // --------------------------------------------------------------------------
  const productDefinitions = [
    // Cameras & Photography
    {
      ownerId: ownerRajesh.id,
      categoryId: categories['cameras'].id,
      name: 'Sony Alpha a7 IV Mirrorless Camera',
      brand: 'Sony',
      model: 'ILCE-7M4',
      pricePerDay: 1200,
      securityDeposit: 8000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Navrangpura, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '33MP full-frame hybrid mirrorless camera with 4K 60p 10-bit video. Perfect for wedding cinematography, YouTube content, and commercial portraits in Ahmedabad. Includes 2 original NP-FZ100 batteries, 128GB V90 SD card, twin charger, and padded shoulder bag. Please inspect upon collection.',
    },
    {
      ownerId: ownerRajesh.id,
      categoryId: categories['cameras'].id,
      name: 'Canon EOS R6 Mark II Mirrorless Camera Kit',
      brand: 'Canon',
      model: 'EOS R6 Mark II',
      pricePerDay: 1300,
      securityDeposit: 9000,
      condition: ProductCondition.BRAND_NEW,
      location: 'Satellite, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '24.2MP full-frame Canon mirrorless camera with lightning-fast Dual Pixel AF II and 6K oversampled 4K 60p recording. Excellent for pre-wedding functions, college convocations, and documentary shoots. Supplied with 24-105mm f/4L USM lens, 2 LP-E6NH batteries, fast charger, and carrying case.',
    },
    {
      ownerId: ownerRajesh.id,
      categoryId: categories['cameras'].id,
      name: 'Sony FE 70-200mm f/2.8 GM II Telephoto Lens',
      brand: 'Sony G Master',
      model: 'SEL70200GM2',
      pricePerDay: 750,
      securityDeposit: 6000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Navrangpura, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Ultra-sharp professional telephoto zoom lens with constant f/2.8 aperture and 4 XD linear autofocus motors. Ideal for wedding candids, indoor events, and sports tournaments. Comes with lens hood, tripod collar, front/rear caps, and padded zip case.',
    },
    {
      ownerId: ownerRajesh.id,
      categoryId: categories['cameras'].id,
      name: 'GoPro HERO 12 Black Creator Edition Kit',
      brand: 'GoPro',
      model: 'HERO12 Black',
      pricePerDay: 500,
      securityDeposit: 3000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Vastrapur, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Rugged 5.3K60 waterproof action camera with HyperSmooth 6.0 stabilization and Volta battery grip. Ideal for bike rides, Goa road trips, trekking in Saputara, and sports vlog recording. Includes Volta battery grip, media mod, directional mic, light mod, and 128GB Extreme Pro microSD.',
    },
    {
      ownerId: ownerRajesh.id,
      categoryId: categories['cameras'].id,
      name: 'Manfrotto 055 Carbon Fiber 3-Section Tripod',
      brand: 'Manfrotto',
      model: 'MT055CXPRO3',
      pricePerDay: 150,
      securityDeposit: 1000,
      condition: ProductCondition.GOOD,
      location: 'Navrangpura, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Heavy-duty carbon fiber tripod with 90-degree horizontal center column mechanism and fluid ball head with quick-release Arca-Swiss plate. Maximum payload 9kg, ideal for long-exposure photography, astrophotography, and stable video panning.',
    },

    // Drones & Aerial
    {
      ownerId: ownerRajesh.id,
      categoryId: categories['drones'].id,
      name: 'DJI Mini 4 Pro Drone with RC 2 Controller',
      brand: 'DJI',
      model: 'Mini 4 Pro',
      pricePerDay: 1400,
      securityDeposit: 10000,
      condition: ProductCondition.BRAND_NEW,
      location: 'Satellite, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Lightweight under-249g drone with omnidirectional obstacle sensing, 4K/60fps HDR video, and 20km FHD transmission. Recommended for licensed pilots or experienced creators filming wedding venues and Gujarat architectural landscapes. Includes DJI RC 2 controller with 5.5" screen, 3 intelligent flight batteries, two-way charging hub, and shoulder case.',
    },

    // Laptops & Computers
    {
      ownerId: ownerAmit.id,
      categoryId: categories['laptops'].id,
      name: 'Apple MacBook Pro 16" (M3 Max, 36GB RAM)',
      brand: 'Apple',
      model: 'MacBook Pro 16 M3 Max',
      pricePerDay: 1100,
      securityDeposit: 9000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Kudasan, Gandhinagar, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Powerhouse workstation for video editing, iOS compiling, CAD rendering, and machine learning models. 14-core CPU, 30-core GPU, Liquid Retina XDR display, and 1TB SSD. Includes 140W USB-C GaN power adapter, MagSafe cable, and Incase protective sleeve. Device is factory reset before every rental.',
    },
    {
      ownerId: ownerAmit.id,
      categoryId: categories['laptops'].id,
      name: 'Apple MacBook Air 13" M2 (Midnight)',
      brand: 'Apple',
      model: 'MacBook Air M2',
      pricePerDay: 550,
      securityDeposit: 4000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Kudasan, Gandhinagar, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Sleek, lightweight laptop with 18-hour battery life and sharp Liquid Retina display. Ideal for college presentations, startup pitches, and travel productivity. Supplied in Midnight finish with 35W Dual USB-C charger and protective carry pouch.',
    },
    {
      ownerId: ownerAmit.id,
      categoryId: categories['laptops'].id,
      name: 'Dell XPS 15 9530 (Core i7, 32GB RAM, RTX 4060)',
      brand: 'Dell',
      model: 'XPS 15 9530',
      pricePerDay: 700,
      securityDeposit: 5000,
      condition: ProductCondition.GOOD,
      location: 'Sargasan, Gandhinagar, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '15.6" OLED 3.5K touch display with Intel Core i7-13700H and NVIDIA RTX 4060 graphics. Designed for 3D modeling, AutoCAD, and high-performance software engineering. Supplied with 130W USB-C charger and USB-C to HDMI/USB-A adapter.',
    },
    {
      ownerId: ownerAmit.id,
      categoryId: categories['laptops'].id,
      name: 'ASUS ROG Strix G16 Gaming Laptop',
      brand: 'ASUS ROG',
      model: 'G614JU',
      pricePerDay: 800,
      securityDeposit: 5500,
      condition: ProductCondition.LIKE_NEW,
      location: 'Kudasan, Gandhinagar, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Intel Core i9-13980HX with NVIDIA GeForce RTX 4050, 16" 165Hz FHD+ display, and RGB backlit keyboard. Great for college gaming LAN tournaments, game testing, and VR demonstrations. Comes with 280W adapter and ASUS gaming mouse.',
    },
    {
      ownerId: ownerAmit.id,
      categoryId: categories['laptops'].id,
      name: 'LG 27" 4K UHD USB-C Color-Accurate Monitor',
      brand: 'LG',
      model: '27UP850-W',
      pricePerDay: 300,
      securityDeposit: 2500,
      condition: ProductCondition.LIKE_NEW,
      location: 'Infocity, Gandhinagar, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '27-inch IPS 4K (3840x2160) display with VESA DisplayHDR 400 and 96W USB-C laptop power delivery. Great for color grading, design reviews, and dual-screen home office setups. Supplied with HDMI, DisplayPort, and Type-C cables.',
    },

    // College & Study Equipment
    {
      ownerId: ownerAmit.id,
      categoryId: categories['study'].id,
      name: 'Texas Instruments TI-Nspire CX II CAS Calculator',
      brand: 'Texas Instruments',
      model: 'TI-Nspire CX II CAS',
      pricePerDay: 60,
      securityDeposit: 800,
      condition: ProductCondition.GOOD,
      location: 'Kudasan, Gandhinagar, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Advanced graphing calculator approved for engineering exams, SAT/ACT, and university mathematics coursework. Full-color backlit display and rechargeable battery. Includes slide case and USB mini-charging cable.',
    },

    // Projectors & Displays
    {
      ownerId: ownerAnanya.id,
      categoryId: categories['projectors'].id,
      name: 'Epson EB-FH52 4000 Lumens Full HD Projector',
      brand: 'Epson',
      model: 'EB-FH52',
      pricePerDay: 600,
      securityDeposit: 4000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Prahlad Nagar, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'High-brightness 4,000 lumens 3LCD projector with crisp 1080p resolution and 240Hz refresh rate. Visible even in well-lit college classrooms, hotel conference halls, and startup offices. Features dual HDMI ports, built-in 16W speaker, remote control, and 10-meter HDMI cable.',
    },
    {
      ownerId: ownerAnanya.id,
      categoryId: categories['projectors'].id,
      name: 'BenQ TK700STi 4K HDR Short-Throw Projector',
      brand: 'BenQ',
      model: 'TK700STi',
      pricePerDay: 950,
      securityDeposit: 6000,
      condition: ProductCondition.BRAND_NEW,
      location: 'Bodakdev, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'True 4K UHD 3000 lumens short-throw cinema projector. Casts a huge 100-inch picture from just 2 meters away. Ideal for private movie nights, live cricket match screenings with friends, and keynote presentations. Includes Android TV streaming stick, remote, and padded travel bag.',
    },
    {
      ownerId: ownerAnanya.id,
      categoryId: categories['projectors'].id,
      name: 'Elite Screens 100-Inch Portable Tripod Screen',
      brand: 'Elite Screens',
      model: 'T100UWV1',
      pricePerDay: 200,
      securityDeposit: 1500,
      condition: ProductCondition.GOOD,
      location: 'Prahlad Nagar, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '100-inch diagonal 16:9 MaxWhite 1.1 gain projector screen mounted on an adjustable aluminum tripod stand. Sets up in under 3 minutes for indoor or outdoor evening screening. Folds into a compact carry bag.',
    },

    // Sound & Audio Systems
    {
      ownerId: ownerPriya.id,
      categoryId: categories['audio'].id,
      name: 'JBL PartyBox 310 Portable Bluetooth Party Speaker',
      brand: 'JBL',
      model: 'PartyBox 310',
      pricePerDay: 600,
      securityDeposit: 4000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Vastrapur, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '240W RMS powerful sound with dynamic synchronized RGB light show, built-in wheels, and 18-hour battery life. Perfect for farmhouse parties, birthday celebrations, and Navratri Garba rehearsals. Includes power cable and wireless mic adapter.',
    },
    {
      ownerId: ownerPriya.id,
      categoryId: categories['audio'].id,
      name: 'Ahuja 250W Complete Portable PA System + 2 Wireless Mics',
      brand: 'Ahuja',
      model: 'XPA-3000',
      pricePerDay: 500,
      securityDeposit: 3000,
      condition: ProductCondition.GOOD,
      location: 'Vastrapur, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Reliable Indian workhorse PA system for society gatherings, school annual events, public speeches, and garba rounds. Includes 250W amplifier speaker, 2 VHF wireless handheld microphones, Bluetooth input, and speaker stand.',
    },
    {
      ownerId: ownerPriya.id,
      categoryId: categories['audio'].id,
      name: 'Rødecaster Pro II Studio + 2 PodMic Package',
      brand: 'Røde',
      model: 'RCP II Studio Bundle',
      pricePerDay: 750,
      securityDeposit: 5000,
      condition: ProductCondition.BRAND_NEW,
      location: 'Vastrapur, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Complete studio broadcast bundle for podcasting, interviews, and live streaming. Features 4 ultra-low noise Revolution preamps, APHEX processing, Bluetooth connectivity, and dual USB audio interfaces. Includes 2 Røde PodMics, 2 desk boom arms, 2 XLR cables, and power supply.',
    },

    // Musical Instruments
    {
      ownerId: ownerPriya.id,
      categoryId: categories['instruments'].id,
      name: 'Yamaha F310 Acoustic Guitar with Padded Gig Bag',
      brand: 'Yamaha',
      model: 'F310',
      pricePerDay: 180,
      securityDeposit: 1200,
      condition: ProductCondition.GOOD,
      location: 'Vastrapur, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Dreadnought acoustic guitar with spruce top and rich resonance. Ideal for college hostel jam sessions, stage performances, and weekend music recordings. Rent includes a padded gig bag, guitar strap, tuner, and picks.',
    },
    {
      ownerId: ownerPriya.id,
      categoryId: categories['instruments'].id,
      name: 'Casio CT-X9000IN Indian Tone Keyboard',
      brand: 'Casio',
      model: 'CT-X9000IN',
      pricePerDay: 350,
      securityDeposit: 2500,
      condition: ProductCondition.LIKE_NEW,
      location: 'Vastrapur, Ahmedabad, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1520523839898-507121c2105c?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '61-key keyboard with AiX Sound Source specifically loaded with authentic Indian instrument tones (Harmonium, Sitar, Veena, Dholak, Tabla, Tanpura). Perfect for Bhajan groups, Garba orchestras, and music examinations. Comes with power adapter, music stand, and double-X keyboard stand.',
    },

    // Power Tools & DIY
    {
      ownerId: ownerSneha.id,
      categoryId: categories['tools'].id,
      name: 'DeWalt 20V Cordless Hammer Drill & Impact Driver Combo',
      brand: 'DeWalt',
      model: 'DCK280C2',
      pricePerDay: 250,
      securityDeposit: 1800,
      condition: ProductCondition.LIKE_NEW,
      location: 'Adajan, Surat, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Commercial brushless cordless combo kit for masonry wall drilling, furniture assembly, and TV wall-mounting. Includes 1/2" hammer drill, 1/4" impact driver, two 2.0Ah lithium-ion batteries, fast charger, masonry drill bit set, and tough box.',
    },
    {
      ownerId: ownerSneha.id,
      categoryId: categories['tools'].id,
      name: 'Bosch Professional GWS 850W Angle Grinder (100mm)',
      brand: 'Bosch',
      model: 'GWS 850 C',
      pricePerDay: 150,
      securityDeposit: 1000,
      condition: ProductCondition.GOOD,
      location: 'Adajan, Surat, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Compact 850-watt angle grinder for metal fabrication, tile cutting, and rust removal. Features safety guard, two-hole spanner, and auxiliary handle. Includes 2 cutting discs and safety protective eyewear.',
    },
    {
      ownerId: ownerSneha.id,
      categoryId: categories['tools'].id,
      name: 'Kärcher K3 High Pressure Washer (120 Bar)',
      brand: 'Kärcher',
      model: 'K3 Full Control',
      pricePerDay: 350,
      securityDeposit: 2200,
      condition: ProductCondition.LIKE_NEW,
      location: 'Adajan, Surat, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=80',
      ],
      description: '120-bar pressure washer for deep cleaning bungalow driveways, cars, SUVs, balcony tiles, and solar panels. Includes 6m high-pressure hose, dirt blaster lance, Vario Power spray lance, and water inlet connector filter.',
    },

    // Home & Kitchen Appliances
    {
      ownerId: ownerSneha.id,
      categoryId: categories['appliances'].id,
      name: 'Singer Heavy Duty 4423 Sewing Machine',
      brand: 'Singer',
      model: '4423 Heavy Duty',
      pricePerDay: 200,
      securityDeposit: 1500,
      condition: ProductCondition.GOOD,
      location: 'Adajan, Surat, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'High-speed 1,100 stitches-per-minute mechanical sewing machine with stainless steel bed plate and 23 built-in stitches. Can easily handle heavy denim, curtain fabrics, and Navratri chaniya choli alterations. Includes foot pedal, extra bobbins, and needle set.',
    },

    // Bicycles & Mobility
    {
      ownerId: ownerVikram.id,
      categoryId: categories['bicycles'].id,
      name: 'Trek Marlin 7 Gen 3 Mountain Bike (Large Frame, 29")',
      brand: 'Trek',
      model: 'Marlin 7 Gen 3',
      pricePerDay: 350,
      securityDeposit: 2500,
      condition: ProductCondition.LIKE_NEW,
      location: 'Alkapuri, Vadodara, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Premium cross-country mountain bike with RockShox Judy fork with lockout, Shimano Deore 1x10 wide-range drivetrain, and Shimano hydraulic disc brakes. Superb for exploring Pavagadh trails, riverfront cycling, and weekend fitness rides. Includes helmet, bottle cage, and lock.',
    },
    {
      ownerId: ownerVikram.id,
      categoryId: categories['bicycles'].id,
      name: 'Firefox Target 29D Dual Disc Hybrid Bicycle',
      brand: 'Firefox',
      model: 'Target 29D',
      pricePerDay: 200,
      securityDeposit: 1500,
      condition: ProductCondition.GOOD,
      location: 'Alkapuri, Vadodara, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Reliable 21-speed alloy hybrid bicycle with front suspension, dual mechanical disc brakes, and comfortable geometry. Great for daily city commute in Vadodara or weekend morning rides. Supplied with cable lock and high-visibility LED front light.',
    },

    // Sports & Fitness
    {
      ownerId: ownerVikram.id,
      categoryId: categories['sports'].id,
      name: 'SG Full English Willow Cricket Kit with Wheelie Bag',
      brand: 'SG (Sanspareils Greenlands)',
      model: 'Tournament Edition Kit',
      pricePerDay: 250,
      securityDeposit: 1800,
      condition: ProductCondition.GOOD,
      location: 'Alkapuri, Vadodara, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Complete leather ball cricket kit for club tournaments and corporate matches. Includes SG English Willow cricket bat (Grade 2), batting pads, premium batting gloves, wicketkeeping gloves and pads, cricket helmet (size L), thigh guard, and heavy-duty wheelie duffle bag.',
    },
    {
      ownerId: ownerVikram.id,
      categoryId: categories['sports'].id,
      name: 'Yonex Astrox 99 Pro Badminton Pair + Mavis 350 Shuttles',
      brand: 'Yonex',
      model: 'Astrox 99 Pro',
      pricePerDay: 120,
      securityDeposit: 900,
      condition: ProductCondition.LIKE_NEW,
      location: 'Alkapuri, Vadodara, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Two graphite head-heavy power badminton rackets strung with BG65 at 24 lbs. Ideal for indoor badminton court games at sports complexes in Vadodara. Includes 2 full racket covers and a tube of 6 Yonex Mavis 350 nylon shuttlecocks.',
    },

    // Travel & Camping
    {
      ownerId: ownerVikram.id,
      categoryId: categories['travel'].id,
      name: 'Quechua MH100 4-Person Waterproof Camping Tent',
      brand: 'Quechua / Decathlon',
      model: 'MH100 4P',
      pricePerDay: 350,
      securityDeposit: 2000,
      condition: ProductCondition.LIKE_NEW,
      location: 'Alkapuri, Vadodara, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Spacious 4-person dome tent tested against 50km/h winds and tropical monsoon rain. Easy self-standing structure with flysheet and ventilation. Perfect for weekend camping at Polo Forest, Statue of Unity, or Mount Abu. Includes tent poles, pegs, ground sheet, and manual air pump.',
    },
    {
      ownerId: ownerVikram.id,
      categoryId: categories['travel'].id,
      name: 'Coleman 54-Quart Steel-Belted Cooler Ice Box',
      brand: 'Coleman',
      model: '54-Quart Cooler',
      pricePerDay: 150,
      securityDeposit: 1000,
      condition: ProductCondition.GOOD,
      location: 'Alkapuri, Vadodara, Gujarat',
      images: [
        'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Heavy-duty insulated stainless steel cooler that keeps ice cold for up to 4 days even in peak summer heat. Holds up to 85 beverage cans. Ideal for outdoor catering, road trips, and cricket tournament refreshments. Leak-resistant channel drain.',
    },
  ];

  console.log(`📦 Seeding ${productDefinitions.length} curated Indian listings...`);
  const seededProducts: any[] = [];
  for (const def of productDefinitions) {
    const prod = await prisma.product.create({
      data: {
        ownerId: def.ownerId,
        categoryId: def.categoryId,
        name: def.name,
        brand: def.brand,
        model: def.model,
        pricePerDay: def.pricePerDay,
        securityDeposit: def.securityDeposit,
        condition: def.condition,
        location: def.location,
        images: def.images,
        description: def.description,
        approvalStatus: ApprovalStatus.APPROVED,
        listingStatus: ListingStatus.ACTIVE,
      },
    });
    seededProducts.push(prod);
  }

  // --------------------------------------------------------------------------
  // 6. SEED DEMO BOOKINGS & DISPUTES FOR REALISTIC DASHBOARD DATA
  // --------------------------------------------------------------------------
  console.log('📑 Seeding realistic demo bookings, payments & disputes...');

  // Active Rental: Priya Shah renting Sony Alpha a7 IV from Rajesh Patel
  const activeStart = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const activeEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const activeBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'BB-2026-IN-48921',
      customerId: primaryCustomer.id,
      productId: seededProducts[0].id, // Sony a7 IV
      startDate: activeStart,
      endDate: activeEnd,
      expectedReturnDate: activeEnd,
      totalDays: 5,
      dailyPrice: 1200,
      rentalTotal: 6000, // 5 x ₹1200
      securityDeposit: 8000,
      totalAmount: 14000,
      status: BookingStatus.ACTIVE,
      pickupCode: 'PK-48921-ACT',
      returnCode: 'RT-48921-RET',
      pickupAt: activeStart,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: activeBooking.id,
      userId: primaryCustomer.id,
      amount: 14000,
      rentalAmount: 6000,
      depositAmount: 8000,
      paymentMethod: 'UPI_SIMULATED',
      status: PaymentStatus.SUCCESSFUL,
      transactionId: 'TXN-UPI-IN-98240-2026',
    },
  });

  await prisma.securityDeposit.create({
    data: {
      bookingId: activeBooking.id,
      originalAmount: 8000,
      status: DepositStatus.HELD,
    },
  });

  // Completed Rental: Rohan Gupta rented MacBook Pro from Amit Sharma
  const pastStart = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completedBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'BB-2026-IN-10934',
      customerId: seededCustomers[1].id, // Rohan Gupta
      productId: seededProducts[6].id, // MacBook Pro 16"
      startDate: pastStart,
      endDate: pastEnd,
      expectedReturnDate: pastEnd,
      totalDays: 3,
      dailyPrice: 1100,
      rentalTotal: 3300,
      securityDeposit: 9000,
      totalAmount: 12300,
      status: BookingStatus.COMPLETED,
      pickupCode: 'PK-10934-CPT',
      returnCode: 'RT-10934-CPT',
      pickupAt: pastStart,
      returnedAt: pastEnd,
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      reviewerId: seededCustomers[1].id,
      revieweeId: ownerAmit.id,
      rating: 5,
      comment: 'Amit bhai was extremely professional. The MacBook Pro M3 Max worked flawlessly for our startup pitch and demo day at Gandhinagar. Deposit was returned within 10 minutes of inspection!',
      type: ReviewType.CUSTOMER_TO_OWNER,
    },
  });

  // Demo Dispute under arbitration: Minor cable damage claim on Ahuja PA system
  const disputeBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'BB-2026-IN-77812',
      customerId: seededCustomers[2].id, // Neha Trivedi
      productId: seededProducts[16].id, // Ahuja PA System
      startDate: pastStart,
      endDate: pastEnd,
      expectedReturnDate: pastEnd,
      totalDays: 2,
      dailyPrice: 500,
      rentalTotal: 1000,
      securityDeposit: 3000,
      totalAmount: 4000,
      status: BookingStatus.DISPUTED,
      pickupCode: 'PK-77812-DSP',
      returnCode: 'RT-77812-DSP',
      pickupAt: pastStart,
      returnedAt: pastEnd,
    },
  });

  await prisma.dispute.create({
    data: {
      bookingId: disputeBooking.id,
      raisedById: ownerPriya.id,
      reason: 'VHF Wireless Mic Antenna Bent',
      description: 'One wireless microphone antenna was bent during the society cultural event. Microphone works fine but needs antenna replacement.',
      claimAmount: 450,
      status: 'OPEN',
    },
  });

  // Welcome notification
  await prisma.notification.create({
    data: {
      userId: primaryCustomer.id,
      title: 'Welcome to BorrowBuy India!',
      message: 'Explore verified local equipment in Ahmedabad, Gandhinagar, Surat and nearby cities with secure deposit escrow.',
      type: 'SYSTEM_WELCOME',
    },
  });

  console.log('✅ Seeding complete!');
  console.log(`👤 1 Administrator: harshal07@gmail.com`);
  console.log(`🛠️ 6 Verified Equipment Owners (Gujarat & Tech hubs)`);
  console.log(`🎒 18 Active Customer Renters`);
  console.log(`📦 30 Curated Indian Equipment Listings across 12 Categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
