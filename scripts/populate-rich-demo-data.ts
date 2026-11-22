import {
  PrismaClient,
  BookingStatus,
  DepositStatus,
  ReviewType,
  PaymentStatus,
  DisputeStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Populating Rich Demo Data for Owner, Customer & Admin Portals...');

  // 1. Get canonical users
  const owner = await prisma.user.findUnique({ where: { email: 'owner@borrowbuy.in' } });
  const customer = await prisma.user.findUnique({ where: { email: 'customer@borrowbuy.in' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@borrowbuy.in' } });
  const priya = await prisma.user.findUnique({ where: { email: 'priya.customer@borrowbuy.in' } });
  const rohan = await prisma.user.findUnique({ where: { email: 'rohan.gupta@borrowbuy.in' } });
  const neha = await prisma.user.findUnique({ where: { email: 'neha.trivedi@borrowbuy.in' } });

  if (!owner || !customer) {
    throw new Error('Canonical demo accounts not found. Run db-sync-fixes.ts first.');
  }

  // 2. Assign the first 25 products to owner@borrowbuy.in so the Owner Portal is packed with gear
  const productsToAssign = await prisma.product.findMany({
    take: 25,
    orderBy: { id: 'asc' },
  });

  console.log(`📦 Assigning ${productsToAssign.length} premier equipment listings to ${owner.email}...`);
  for (const prod of productsToAssign) {
    await prisma.product.update({
      where: { id: prod.id },
      data: {
        ownerId: owner.id,
        location: 'Navrangpura, Ahmedabad, Gujarat',
      },
    });
  }

  // Also sync owner@borrowbuy.com if exists
  const ownerCom = await prisma.user.findUnique({ where: { email: 'owner@borrowbuy.com' } });
  if (ownerCom) {
    console.log(`   (Owner .com alias verified)`);
  }

  // 3. Clear existing conflicting demo bookings for clean setup
  const demoBookingNumbers = [
    'BB-DEMO-REQ-001',
    'BB-DEMO-REQ-002',
    'BB-DEMO-ACT-003',
    'BB-DEMO-CMP-004',
    'BB-DEMO-CMP-005',
    'BB-CUST-ACT-101',
    'BB-CUST-CNF-102',
    'BB-CUST-CMP-103',
  ];

  await prisma.dispute.deleteMany({
    where: {
      booking: {
        bookingNumber: { in: demoBookingNumbers },
      },
    },
  });

  await prisma.review.deleteMany({
    where: {
      booking: {
        bookingNumber: { in: demoBookingNumbers },
      },
    },
  });

  await prisma.payment.deleteMany({
    where: {
      booking: {
        bookingNumber: { in: demoBookingNumbers },
      },
    },
  });

  await prisma.securityDeposit.deleteMany({
    where: {
      booking: {
        bookingNumber: { in: demoBookingNumbers },
      },
    },
  });

  await prisma.booking.deleteMany({
    where: {
      bookingNumber: { in: demoBookingNumbers },
    },
  });

  const now = new Date();

  // --------------------------------------------------------------------------
  // A. SEED OWNER PORTAL BOOKINGS (Incoming requests, Active, Completed)
  // --------------------------------------------------------------------------
  console.log('📋 Creating incoming rental requests & active rentals for Owner Portal...');

  // 1. Pending Request: Priya Shah wants Sony A7 IV
  const startReq1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const endReq1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  await prisma.booking.create({
    data: {
      id: '00000003-0000-4000-8000-000000000001',
      bookingNumber: 'BB-DEMO-REQ-001',
      productId: productsToAssign[0].id, // Sony A7 IV
      customerId: priya?.id || customer.id,
      startDate: startReq1,
      endDate: endReq1,
      expectedReturnDate: endReq1,
      totalDays: 3,
      dailyPrice: 1200,
      rentalTotal: 3600,
      securityDeposit: 8000,
      totalAmount: 11600,
      status: BookingStatus.RESERVED,
      pickupCode: 'PK-REQ-A7IV',
      returnCode: 'RT-REQ-A7IV',
    },
  });

  // 2. Pending Request: Rohan Gupta wants Canon EOS R6
  const startReq2 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const endReq2 = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  await prisma.booking.create({
    data: {
      id: '00000003-0000-4000-8000-000000000002',
      bookingNumber: 'BB-DEMO-REQ-002',
      productId: productsToAssign[1].id, // Canon EOS R6
      customerId: rohan?.id || customer.id,
      startDate: startReq2,
      endDate: endReq2,
      expectedReturnDate: endReq2,
      totalDays: 3,
      dailyPrice: 1300,
      rentalTotal: 3900,
      securityDeposit: 9000,
      totalAmount: 12900,
      status: BookingStatus.RESERVED,
      pickupCode: 'PK-REQ-R6II',
      returnCode: 'RT-REQ-R6II',
    },
  });

  // 3. Ongoing Active Rental: Neha Trivedi has GoPro Hero 12
  const startAct1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const endAct1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const actBooking1 = await prisma.booking.create({
    data: {
      id: '00000003-0000-4000-8000-000000000003',
      bookingNumber: 'BB-DEMO-ACT-003',
      productId: productsToAssign[3].id, // GoPro Hero 12
      customerId: neha?.id || customer.id,
      startDate: startAct1,
      endDate: endAct1,
      expectedReturnDate: endAct1,
      totalDays: 4,
      dailyPrice: 500,
      rentalTotal: 2000,
      securityDeposit: 3000,
      totalAmount: 5000,
      status: BookingStatus.ACTIVE,
      pickupCode: 'PK-GOPRO-ACT',
      returnCode: 'RT-GOPRO-ACT',
      pickupAt: startAct1,
    },
  });

  // Payment & Held Deposit for active booking
  await prisma.payment.create({
    data: {
      bookingId: actBooking1.id,
      userId: neha?.id || customer.id,
      transactionId: 'TXN-SIM-ACT-GOPRO-003',
      amount: 5000,
      rentalAmount: 2000,
      depositAmount: 3000,
      paymentMethod: 'UPI_SIMULATED',
      status: PaymentStatus.SUCCESSFUL,
    },
  });
  await prisma.securityDeposit.create({
    data: {
      bookingId: actBooking1.id,
      originalAmount: 3000,
      deductionAmount: 0,
      refundedAmount: 0,
      status: DepositStatus.HELD,
    },
  });

  // 4. Completed Rental: BenQ 4K Projector (with revenue, review & resolved sample dispute)
  const startCmp1 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const endCmp1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cmpBooking1 = await prisma.booking.create({
    data: {
      id: '00000003-0000-4000-8000-000000000004',
      bookingNumber: 'BB-DEMO-CMP-004',
      productId: productsToAssign[15].id, // BenQ Projector
      customerId: priya?.id || customer.id,
      startDate: startCmp1,
      endDate: endCmp1,
      expectedReturnDate: endCmp1,
      actualReturnDate: endCmp1,
      returnedAt: endCmp1,
      totalDays: 3,
      dailyPrice: 1600,
      rentalTotal: 4800,
      securityDeposit: 10000,
      totalAmount: 14800,
      status: BookingStatus.COMPLETED,
      pickupCode: 'PK-BENQ-CMP',
      returnCode: 'RT-BENQ-CMP',
      pickupAt: startCmp1,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: cmpBooking1.id,
      userId: priya?.id || customer.id,
      transactionId: 'TXN-SIM-CMP-BENQ-004',
      amount: 14800,
      rentalAmount: 4800,
      depositAmount: 10000,
      paymentMethod: 'NET_BANKING_SIMULATED',
      status: PaymentStatus.SUCCESSFUL,
    },
  });
  await prisma.securityDeposit.create({
    data: {
      bookingId: cmpBooking1.id,
      originalAmount: 10000,
      deductionAmount: 0,
      refundedAmount: 10000,
      status: DepositStatus.FULLY_REFUNDED,
      releasedAt: endCmp1,
    },
  });
  await prisma.review.create({
    data: {
      bookingId: cmpBooking1.id,
      reviewerId: priya?.id || customer.id,
      revieweeId: owner.id,
      rating: 5,
      comment: 'Super sharp 4K projector! Punctual handover, clean HDMI cables and fast deposit release.',
      type: ReviewType.CUSTOMER_TO_OWNER,
    },
  });

  // Sample resolved dispute so Admin console dispute tab is informative
  if (admin) {
    await prisma.dispute.create({
      data: {
        bookingId: cmpBooking1.id,
        raisedById: owner.id,
        resolvedById: admin.id,
        claimAmount: 500,
        reason: 'HDMI cable connector check',
        description: 'Minor inspection note regarding HDMI gold pin. Cleared upon testing with original cable box.',
        status: DisputeStatus.RESOLVED,
        resolutionNotes: 'Dispute amicably resolved. 100% security deposit released to renter.',
        deductedFromDeposit: 0,
        resolvedAt: endCmp1,
      },
    });
  }

  // --------------------------------------------------------------------------
  // B. SEED CUSTOMER PORTAL BOOKINGS (Active, Confirmed, Completed)
  // --------------------------------------------------------------------------
  console.log('🛍️ Creating active, upcoming & completed rentals for customer@borrowbuy.in...');

  // 1. Customer Active Rental: Sony 70-200mm GM II lens from Owner
  const custActStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const custActEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const custActBooking = await prisma.booking.create({
    data: {
      id: '00000004-0000-4000-8000-000000000101',
      bookingNumber: 'BB-CUST-ACT-101',
      productId: productsToAssign[2].id, // Sony 70-200mm Lens
      customerId: customer.id,
      startDate: custActStart,
      endDate: custActEnd,
      expectedReturnDate: custActEnd,
      totalDays: 4,
      dailyPrice: 750,
      rentalTotal: 3000,
      securityDeposit: 6000,
      totalAmount: 9000,
      status: BookingStatus.ACTIVE,
      pickupCode: 'PK-70200-CUST',
      returnCode: 'RT-70200-CUST',
      pickupAt: custActStart,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: custActBooking.id,
      userId: customer.id,
      transactionId: 'TXN-CUST-ACT-70200-101',
      amount: 9000,
      rentalAmount: 3000,
      depositAmount: 6000,
      paymentMethod: 'UPI_SIMULATED',
      status: PaymentStatus.SUCCESSFUL,
    },
  });
  await prisma.securityDeposit.create({
    data: {
      bookingId: custActBooking.id,
      originalAmount: 6000,
      deductionAmount: 0,
      refundedAmount: 0,
      status: DepositStatus.HELD,
    },
  });

  // 2. Customer Confirmed Upcoming Rental: Bose PA System
  const custCnfStart = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const custCnfEnd = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const custCnfBooking = await prisma.booking.create({
    data: {
      id: '00000004-0000-4000-8000-000000000102',
      bookingNumber: 'BB-CUST-CNF-102',
      productId: productsToAssign[19].id, // Bose S1 Pro+
      customerId: customer.id,
      startDate: custCnfStart,
      endDate: custCnfEnd,
      expectedReturnDate: custCnfEnd,
      totalDays: 3,
      dailyPrice: 950,
      rentalTotal: 2850,
      securityDeposit: 7000,
      totalAmount: 9850,
      status: BookingStatus.CONFIRMED,
      pickupCode: 'PK-BOSE-CUST',
      returnCode: 'RT-BOSE-CUST',
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: custCnfBooking.id,
      userId: customer.id,
      transactionId: 'TXN-CUST-CNF-BOSE-102',
      amount: 9850,
      rentalAmount: 2850,
      depositAmount: 7000,
      paymentMethod: 'CARD_SIMULATED',
      status: PaymentStatus.SUCCESSFUL,
    },
  });
  await prisma.securityDeposit.create({
    data: {
      bookingId: custCnfBooking.id,
      originalAmount: 7000,
      deductionAmount: 0,
      refundedAmount: 0,
      status: DepositStatus.HELD,
    },
  });

  // 3. Customer Past Completed Rental: Manfrotto Tripod
  const custCmpStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const custCmpEnd = new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000);
  const custCmpBooking = await prisma.booking.create({
    data: {
      id: '00000004-0000-4000-8000-000000000103',
      bookingNumber: 'BB-CUST-CMP-103',
      productId: productsToAssign[4].id, // Manfrotto Tripod
      customerId: customer.id,
      startDate: custCmpStart,
      endDate: custCmpEnd,
      expectedReturnDate: custCmpEnd,
      actualReturnDate: custCmpEnd,
      returnedAt: custCmpEnd,
      totalDays: 3,
      dailyPrice: 150,
      rentalTotal: 450,
      securityDeposit: 1000,
      totalAmount: 1450,
      status: BookingStatus.COMPLETED,
      pickupCode: 'PK-TRIPOD-CUST',
      returnCode: 'RT-TRIPOD-CUST',
      pickupAt: custCmpStart,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: custCmpBooking.id,
      userId: customer.id,
      transactionId: 'TXN-CUST-CMP-TRIPOD-103',
      amount: 1450,
      rentalAmount: 450,
      depositAmount: 1000,
      paymentMethod: 'UPI_SIMULATED',
      status: PaymentStatus.SUCCESSFUL,
    },
  });
  await prisma.securityDeposit.create({
    data: {
      bookingId: custCmpBooking.id,
      originalAmount: 1000,
      deductionAmount: 0,
      refundedAmount: 1000,
      status: DepositStatus.FULLY_REFUNDED,
      releasedAt: custCmpEnd,
    },
  });
  await prisma.review.create({
    data: {
      bookingId: custCmpBooking.id,
      reviewerId: customer.id,
      revieweeId: owner.id,
      rating: 5,
      comment: 'Tripod was extremely sturdy and easy to use. Great lender!',
      type: ReviewType.CUSTOMER_TO_OWNER,
    },
  });

  // --------------------------------------------------------------------------
  // C. SEED IN-APP NOTIFICATIONS
  // --------------------------------------------------------------------------
  console.log('🔔 Seeding in-app notification alerts for Owner & Customer...');

  // Clear existing demo notifications for fresh seed
  await prisma.notification.deleteMany({
    where: {
      userId: { in: [owner.id, customer.id] },
    },
  });

  const ownerNotifications = [
    {
      userId: owner.id,
      title: 'New Rental Request Received',
      message: 'Priya Shah has requested to rent your Sony Alpha a7 IV for 3 days.',
      type: 'BOOKING_REQUEST',
      referenceId: 'BB-DEMO-REQ-001',
    },
    {
      userId: owner.id,
      title: 'Equipment Picked Up',
      message: 'Neha Trivedi has completed pickup for GoPro HERO 12. Rental is ACTIVE.',
      type: 'PICKUP_VERIFIED',
      referenceId: 'BB-DEMO-ACT-003',
    },
    {
      userId: owner.id,
      title: '5-Star Review Received',
      message: 'Priya Shah left a 5-star review for BenQ 4K Projector. Trust score updated to 5.0!',
      type: 'REVIEW_RECEIVED',
      referenceId: 'BB-DEMO-CMP-004',
    },
  ];

  for (const n of ownerNotifications) {
    await prisma.notification.create({
      data: {
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        referenceId: n.referenceId,
        isRead: false,
      },
    });
  }

  const customerNotifications = [
    {
      userId: customer.id,
      title: 'Rental Booking Active',
      message: 'Your rental for Sony FE 70-200mm f/2.8 GM II is now ACTIVE. Enjoy your gear!',
      type: 'PICKUP_VERIFIED',
      referenceId: 'BB-CUST-ACT-101',
    },
    {
      userId: customer.id,
      title: 'Booking Confirmed & Paid',
      message: 'Your booking for Bose S1 Pro+ is confirmed. Security deposit of ₹7,000 is safely held.',
      type: 'BOOKING_CONFIRMED',
      referenceId: 'BB-CUST-CNF-102',
    },
    {
      userId: customer.id,
      title: 'Security Deposit Refunded',
      message: '100% of your ₹1,000 security deposit for Manfrotto Tripod has been released.',
      type: 'DEPOSIT_REFUNDED',
      referenceId: 'BB-CUST-CMP-103',
    },
  ];

  for (const n of customerNotifications) {
    await prisma.notification.create({
      data: {
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        referenceId: n.referenceId,
        isRead: false,
      },
    });
  }

  console.log('✨ Demo Data Successfully Populated!');
  console.log('   - Owner Portal (owner@borrowbuy.in):');
  console.log('     • 25 Active Equipment Listings');
  console.log('     • 2 Pending Incoming Requests (Approve Booking)');
  console.log('     • 1 Active Ongoing Rental (GoPro 12)');
  console.log('     • 1 Completed Rental with ₹4,800 revenue & 5-star review');
  console.log('     • 3 In-App Notifications');
  console.log('   - Customer Portal (customer@borrowbuy.in):');
  console.log('     • 1 Active Rental (Sony 70-200mm) with Return Pass QR (RT-70200-CUST)');
  console.log('     • 1 Confirmed Upcoming Rental (Bose PA) with Pickup Pass QR (PK-BOSE-CUST)');
  console.log('     • 1 Completed Rental with 100% Deposit Refund (₹1,000) & Tax Invoice');
  console.log('     • 3 In-App Notifications');
  console.log('   - Admin Console (admin@borrowbuy.in):');
  console.log('     • 1 Sample Resolved Inspection Dispute');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Failed to populate demo data:', err);
  process.exit(1);
});
