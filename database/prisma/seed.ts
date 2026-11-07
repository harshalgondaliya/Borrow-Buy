import { PrismaClient, UserRole, UserStatus, ProductCondition, ApprovalStatus, ListingStatus, BookingStatus, PaymentStatus, DepositStatus, ReviewType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for BorrowBuy...');

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
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);

  // 1. Seed Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@borrowbuy.com',
      fullName: 'System Administrator',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      phone: '+1 (555) 019-2831',
      trustScore: 5.0,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerAlex = await prisma.user.create({
    data: {
      email: 'alex.owner@borrowbuy.com',
      fullName: 'Alex Rivera',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Professional photographer and drone pilot based in Downtown Seattle. All camera equipment is meticulously maintained and stored in humidity-controlled cases.',
      ownerAddress: 'Downtown, Seattle, WA',
      phone: '+1 (206) 555-0143',
      trustScore: 4.9,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  const ownerSarah = await prisma.user.create({
    data: {
      email: 'sarah.owner@borrowbuy.com',
      fullName: 'Sarah Chen',
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: true,
      ownerBio: 'Maker and DIY enthusiast. Renting commercial-grade woodworking and workshop tools to help fellow creators finish their dream projects.',
      ownerAddress: 'East Austin, Austin, TX',
      phone: '+1 (512) 555-0189',
      trustScore: 4.8,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  });

  const customerEmma = await prisma.user.create({
    data: {
      email: 'emma.customer@borrowbuy.com',
      fullName: 'Emma Watson',
      passwordHash: defaultPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: false,
      phone: '+1 (206) 555-0177',
      trustScore: 5.0,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    },
  });

  const customerJohn = await prisma.user.create({
    data: {
      email: 'john.customer@borrowbuy.com',
      fullName: 'John Miller',
      passwordHash: defaultPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      isVerifiedOwner: false,
      phone: '+1 (512) 555-0122',
      trustScore: 4.7,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  });

  console.log('👤 Seeded 5 users (1 Admin, 2 Verified Owners, 2 Customers).');

  // 2. Seed Categories
  const catCameras = await prisma.category.create({
    data: {
      name: 'Cameras & Lenses',
      slug: 'cameras-and-lenses',
      description: 'DSLRs, mirrorless cameras, prime lenses, gimbals, and high-end cinema equipment.',
      icon: 'Camera',
    },
  });

  const catTools = await prisma.category.create({
    data: {
      name: 'Power Tools & Workshop',
      slug: 'power-tools-and-workshop',
      description: 'Drills, table saws, pressure washers, sanders, and industrial hand tools.',
      icon: 'Wrench',
    },
  });

  const catAudioVideo = await prisma.category.create({
    data: {
      name: 'Audio & Projectors',
      slug: 'audio-and-projectors',
      description: '4K cinema projectors, outdoor screens, PA systems, and studio microphones.',
      icon: 'Volume2',
    },
  });

  const catOutdoor = await prisma.category.create({
    data: {
      name: 'Outdoor & Bicycles',
      slug: 'outdoor-and-bicycles',
      description: 'Mountain bikes, electric scooters, lightweight camping tents, and rooftop carriers.',
      icon: 'Bike',
    },
  });

  const catTech = await prisma.category.create({
    data: {
      name: 'Computers & VR',
      slug: 'computers-and-vr',
      description: 'Apple MacBooks, high-performance gaming laptops, VR headsets, and graphics tablets.',
      icon: 'Laptop',
    },
  });

  console.log('📂 Seeded 5 categories.');

  // 3. Seed Products
  const prodSonyA7IV = await prisma.product.create({
    data: {
      ownerId: ownerAlex.id,
      categoryId: catCameras.id,
      name: 'Sony Alpha a7 IV Mirrorless Camera Kit',
      brand: 'Sony',
      model: 'ILCE-7M4 with 24-70mm f/2.8 GM Lens',
      description: '33MP full-frame Exmor R CMOS sensor, 4K 60p 10-bit video, and fast hybrid autofocus. Includes 2 high-capacity batteries, 128GB Pro V90 SD card, and Pelican hard case.',
      pricePerDay: 48.0,
      securityDeposit: 350.0,
      condition: ProductCondition.LIKE_NEW,
      location: 'Downtown, Seattle, WA',
      approvalStatus: ApprovalStatus.APPROVED,
      listingStatus: ListingStatus.ACTIVE,
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
      ],
    },
  });

  const prodDewaltMiterSaw = await prisma.product.create({
    data: {
      ownerId: ownerSarah.id,
      categoryId: catTools.id,
      name: 'DeWalt 12-Inch Sliding Compound Miter Saw',
      brand: 'DeWalt',
      model: 'DWS780 Heavy Duty',
      description: 'Double-bevel sliding compound saw with integrated cutline blade positioning system. Powerful 15 Amp motor with precision miter detent plate.',
      pricePerDay: 32.0,
      securityDeposit: 150.0,
      condition: ProductCondition.GOOD,
      location: 'East Austin, Austin, TX',
      approvalStatus: ApprovalStatus.APPROVED,
      listingStatus: ListingStatus.ACTIVE,
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      ],
    },
  });

  const prodEpson4KProjector = await prisma.product.create({
    data: {
      ownerId: ownerAlex.id,
      categoryId: catAudioVideo.id,
      name: 'Epson Home Cinema 4K PRO-UHD Projector',
      brand: 'Epson',
      model: 'Home Cinema 3800',
      description: 'True 3,000 lumens color and white brightness. Includes 100-inch portable outdoor folding screen, HDMI cable, and rugged carrying case. Perfect for backyard movie nights and corporate presentations.',
      pricePerDay: 39.0,
      securityDeposit: 200.0,
      condition: ProductCondition.LIKE_NEW,
      location: 'Downtown, Seattle, WA',
      approvalStatus: ApprovalStatus.APPROVED,
      listingStatus: ListingStatus.ACTIVE,
      images: [
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      ],
    },
  });

  const prodSpecializedTrekBike = await prisma.product.create({
    data: {
      ownerId: ownerSarah.id,
      categoryId: catOutdoor.id,
      name: 'Trek Marlin 7 All-Terrain Mountain Bike',
      brand: 'Trek',
      model: 'Marlin 7 (Size L, 29" Wheels)',
      description: 'Shimano Deore 1x10 drivetrain, RockShox Judy fork with lockout, and hydraulic disc brakes. Comes with helmet, Kryptonite U-lock, and mini-pump.',
      pricePerDay: 26.0,
      securityDeposit: 120.0,
      condition: ProductCondition.GOOD,
      location: 'South Congress, Austin, TX',
      approvalStatus: ApprovalStatus.APPROVED,
      listingStatus: ListingStatus.ACTIVE,
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      ],
    },
  });

  const prodMacBookProM3 = await prisma.product.create({
    data: {
      ownerId: ownerAlex.id,
      categoryId: catTech.id,
      name: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
      brand: 'Apple',
      model: 'MacBook Pro 16-inch 2024',
      description: 'Blazing fast workstation for 8K video editing, Unreal Engine, and machine learning workloads. Includes 140W MagSafe charger, protective sleeve, and USB-C hub.',
      pricePerDay: 65.0,
      securityDeposit: 500.0,
      condition: ProductCondition.BRAND_NEW,
      location: 'Bellevue / Seattle, WA',
      approvalStatus: ApprovalStatus.APPROVED,
      listingStatus: ListingStatus.ACTIVE,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      ],
    },
  });

  console.log('📦 Seeded 5 high-quality product listings.');

  // 4. Seed an illustrative Completed Booking with Payment, Deposit, Inspection, and Review
  const pastStart = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const totalDaysPast = 3;
  const rentalTotalPast = totalDaysPast * prodSonyA7IV.pricePerDay; // 144
  const depositPast = prodSonyA7IV.securityDeposit; // 350
  const totalAmountPast = rentalTotalPast + depositPast; // 494

  const completedBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'BB-2026-00101',
      productId: prodSonyA7IV.id,
      customerId: customerEmma.id,
      startDate: pastStart,
      endDate: pastEnd,
      expectedReturnDate: pastEnd,
      actualReturnDate: pastEnd,
      totalDays: totalDaysPast,
      dailyPrice: prodSonyA7IV.pricePerDay,
      rentalTotal: rentalTotalPast,
      securityDeposit: depositPast,
      totalAmount: totalAmountPast,
      status: BookingStatus.COMPLETED,
      pickupCode: 'PK-DEMO-00101-VERIFIED',
      returnCode: 'RT-DEMO-00101-VERIFIED',
      pickupAt: pastStart,
      returnedAt: pastEnd,
    },
  });

  // Simulated Payment for completed booking
  await prisma.payment.create({
    data: {
      bookingId: completedBooking.id,
      userId: customerEmma.id,
      transactionId: 'TXN-SIM-2026-98124',
      amount: totalAmountPast,
      rentalAmount: rentalTotalPast,
      depositAmount: depositPast,
      status: PaymentStatus.SUCCESSFUL,
      paymentMethod: 'SIMULATED_CARD',
    },
  });

  // Security Deposit refunded cleanly
  await prisma.securityDeposit.create({
    data: {
      bookingId: completedBooking.id,
      originalAmount: depositPast,
      deductionAmount: 0,
      refundedAmount: depositPast,
      status: DepositStatus.FULLY_REFUNDED,
      releasedAt: pastEnd,
    },
  });

  // Completed inspections
  await prisma.inspection.create({
    data: {
      bookingId: completedBooking.id,
      inspectorId: ownerAlex.id,
      type: 'PRE_PICKUP',
      photos: [prodSonyA7IV.images[0]],
      conditionNotes: 'Camera sensor pristine, body has zero scratches. Battery at 100% health.',
      confirmedByCustomer: true,
    },
  });

  await prisma.inspection.create({
    data: {
      bookingId: completedBooking.id,
      inspectorId: ownerAlex.id,
      type: 'POST_RETURN',
      photos: [prodSonyA7IV.images[0]],
      conditionNotes: 'Returned in exact original condition. Lens optics spotless.',
      confirmedByCustomer: true,
    },
  });

  // Mutual Reviews
  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      reviewerId: customerEmma.id,
      revieweeId: ownerAlex.id,
      rating: 5,
      comment: 'Alex was super helpful! The Sony A7 IV worked flawlessly for our weekend documentary shoot in Olympic National Park. Highly recommended!',
      type: ReviewType.CUSTOMER_TO_OWNER,
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      reviewerId: ownerAlex.id,
      revieweeId: customerEmma.id,
      rating: 5,
      comment: 'Emma took extraordinary care of the camera gear and returned it right on schedule. Would gladly lend to her anytime!',
      type: ReviewType.OWNER_TO_CUSTOMER,
    },
  });

  // 5. Seed an Upcoming Confirmed Booking
  const futureStart = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const futureEnd = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
  const upcomingBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'BB-2026-00102',
      productId: prodEpson4KProjector.id,
      customerId: customerJohn.id,
      startDate: futureStart,
      endDate: futureEnd,
      expectedReturnDate: futureEnd,
      totalDays: 3,
      dailyPrice: prodEpson4KProjector.pricePerDay,
      rentalTotal: 3 * prodEpson4KProjector.pricePerDay,
      securityDeposit: prodEpson4KProjector.securityDeposit,
      totalAmount: (3 * prodEpson4KProjector.pricePerDay) + prodEpson4KProjector.securityDeposit,
      status: BookingStatus.CONFIRMED,
      pickupCode: 'PK-DEMO-00102-READY',
      returnCode: 'RT-DEMO-00102-PENDING',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: upcomingBooking.id,
      userId: customerJohn.id,
      transactionId: 'TXN-SIM-2026-77219',
      amount: upcomingBooking.totalAmount,
      rentalAmount: upcomingBooking.rentalTotal,
      depositAmount: upcomingBooking.securityDeposit,
      status: PaymentStatus.SUCCESSFUL,
      paymentMethod: 'SIMULATED_CARD',
    },
  });

  await prisma.securityDeposit.create({
    data: {
      bookingId: upcomingBooking.id,
      originalAmount: upcomingBooking.securityDeposit,
      deductionAmount: 0,
      refundedAmount: 0,
      status: DepositStatus.HELD,
    },
  });

  console.log('✅ Database seeding completed successfully with realistic workflows!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

