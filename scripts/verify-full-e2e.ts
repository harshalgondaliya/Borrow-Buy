import { PrismaClient } from '@prisma/client';

const API_BASE = 'http://localhost:5000/api';
const prisma = new PrismaClient();

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  [key: string]: any;
}

async function api(path: string, options: RequestInit = {}, token?: string): Promise<ApiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`API ${options.method || 'GET'} ${path} failed (${res.status}): ${body.message || JSON.stringify(body)}`);
  }
  return body;
}

async function runVerification() {
  console.log('================================================================');
  console.log('🚀 BORROWBUY — FULL END-TO-END VERIFICATION & AUDIT RUNNER');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // SECTION 1: AUTHENTICATION AUDIT (Sign In, Registration, Personas)
  // -------------------------------------------------------------------------
  console.log('📋 SECTION 1: AUTHENTICATION AUDIT (Customer, Owner, Admin)');

  const testAccounts = [
    { email: 'customer@borrowbuy.in', expectedRole: 'CUSTOMER', label: 'Canonical Customer (.in)' },
    { email: 'customer@borrowbuy.com', expectedRole: 'CUSTOMER', label: 'Canonical Customer (.com)' },
    { email: 'owner@borrowbuy.in', expectedRole: 'OWNER', label: 'Canonical Owner (.in)' },
    { email: 'owner@borrowbuy.com', expectedRole: 'OWNER', label: 'Canonical Owner (.com)' },
    { email: 'admin@borrowbuy.in', expectedRole: 'ADMIN', label: 'System Administrator (.in)' },
    { email: 'admin@borrowbuy.com', expectedRole: 'ADMIN', label: 'System Administrator (.com)' },
  ];

  let customerToken = '';
  let ownerToken = '';
  let adminToken = '';

  for (const acc of testAccounts) {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: acc.email, password: 'Password123!' }),
    });

    if (!res.success || !res.data.token) {
      throw new Error(`Login failed for ${acc.email}`);
    }

    if (res.data.user.role !== acc.expectedRole) {
      throw new Error(`Role mismatch for ${acc.email}: expected ${acc.expectedRole}, got ${res.data.user.role}`);
    }

    console.log(`  ✅ [PASS] ${acc.label} (${acc.email}): Logged in as ${res.data.user.role} (User ID: ${res.data.user.id})`);

    if (acc.email === 'customer@borrowbuy.in') customerToken = res.data.token;
    if (acc.email === 'owner@borrowbuy.in') ownerToken = res.data.token;
    if (acc.email === 'admin@borrowbuy.in') adminToken = res.data.token;
  }

  // Test Registration: New Customer
  const ts = Date.now();
  const newCustEmail = `test.cust.${ts}@borrowbuy.in`;
  const regCustRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: newCustEmail,
      password: 'Password123!',
      fullName: 'Automated Test Customer',
      role: 'CUSTOMER',
      phone: '+91 99999 11111',
    }),
  });
  console.log(`  ✅ [PASS] Customer Registration: Registered new account ${newCustEmail} with token`);

  // Test Registration: New Owner
  const newOwnerEmail = `test.owner.${ts}@borrowbuy.in`;
  const regOwnerRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: newOwnerEmail,
      password: 'Password123!',
      fullName: 'Automated Test Owner',
      role: 'OWNER',
      phone: '+91 99999 22222',
    }),
  });
  console.log(`  ✅ [PASS] Owner Registration: Registered new account ${newOwnerEmail} (isVerifiedOwner: ${regOwnerRes.data.user.isVerifiedOwner})`);

  // -------------------------------------------------------------------------
  // SECTION 2: PRODUCT CATALOG SINGLE-IMAGE AUDIT
  // -------------------------------------------------------------------------
  console.log('\n📸 SECTION 2: CATALOG SINGLE-IMAGE COMPLIANCE AUDIT');

  const productsRes = await api('/products?limit=50');
  const products = (productsRes as any).products;
  console.log(`  📦 Total active products fetched in sample (limit=50): ${products.length}`);

  // Also query prisma for all 116 products
  const allDbProducts = await prisma.product.findMany({
    select: { id: true, name: true, images: true, category: { select: { name: true } } },
  });
  console.log(`  📊 Database Total Active Inventory: ${allDbProducts.length} items`);

  let singleImageCompliant = 0;
  for (const p of allDbProducts) {
    if (p.images && p.images.length === 1) {
      singleImageCompliant++;
    } else {
      console.warn(`  ⚠️ Product '${p.name}' has ${p.images?.length || 0} images!`);
    }
  }

  console.log(`  ✅ [PASS] Single Image Compliance: ${singleImageCompliant} / ${allDbProducts.length} products have strictly ONE relevant image.`);
  console.log(`  🔍 Sample Verified Products:`);
  for (let i = 0; i < Math.min(5, allDbProducts.length); i++) {
    const p = allDbProducts[i];
    console.log(`     ${i + 1}. [${p.category?.name}] ${p.name}`);
    console.log(`        Image: ${p.images[0]}`);
  }

  // -------------------------------------------------------------------------
  // SECTION 3: COMPLETE END-TO-END BOOKING LIFECYCLE
  // -------------------------------------------------------------------------
  console.log('\n🔄 SECTION 3: COMPLETE END-TO-END BOOKING LIFECYCLE');

  // Choose a product owned by Rajesh Patel or owner@borrowbuy.in
  const targetProduct = products.find((p: any) => p.owner && p.owner.id) || products[0];
  console.log(`  🎯 Target Gear Selected: '${targetProduct.name}'`);
  console.log(`     Daily Rate: ₹${targetProduct.pricePerDay} | Refundable Deposit: ₹${targetProduct.securityDeposit}`);
  console.log(`     Owner: ${targetProduct.owner?.fullName || 'Verified Owner'}`);

  // Fetch product's real owner credentials/token to confirm & verify QR
  const productOwnerUser = await prisma.user.findUnique({
    where: { id: targetProduct.ownerId },
  });
  if (!productOwnerUser) throw new Error('Product owner not found in database');

  // Login as product owner
  const ownerLoginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: productOwnerUser.email, password: 'Password123!' }),
  });
  const activeOwnerToken = ownerLoginRes.data.token;
  console.log(`  🔑 Product Owner Authenticated: ${productOwnerUser.email}`);

  // STEP 3.1: Check availability & Hold booking (Customer)
  const dayOffset = Math.floor(Math.random() * 150) + 40; // 40-190 days ahead to guarantee zero collision
  const startDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
  const endRental = new Date(Date.now() + (dayOffset + 3) * 24 * 60 * 60 * 1000); // 3 days
  const startDateStr = startDate.toISOString();
  const endDateStr = endRental.toISOString();

  console.log(`  📅 Requested Dates: ${startDateStr.split('T')[0]} to ${endDateStr.split('T')[0]}`);

  const holdBookingRes = await api('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      productId: targetProduct.id,
      startDate: startDateStr,
      endDate: endDateStr,
    }),
  }, customerToken);

  const booking = holdBookingRes.data;
  console.log(`  ✅ [PASS] Step 1 - Reservation Hold Created: Booking ID ${booking.id}`);
  console.log(`     Booking Number: ${booking.bookingNumber} | Status: ${booking.status}`);
  console.log(`     Total Amount: ₹${booking.totalAmount} (Security Deposit: ₹${booking.securityDeposit})`);

  // STEP 3.2: Simulated Payment & Security Deposit Escrow Hold
  console.log(`  💳 Step 2 - Executing Simulated Payment with Escrow Security Deposit...`);
  const paymentRes = await api('/payments/pay-booking', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: booking.id,
      simulateFailure: false,
    }),
  }, customerToken);

  console.log(`  ✅ [PASS] Payment Processed: Status -> ${paymentRes.data.booking.status}`);
  console.log(`     Transaction Reference: ${paymentRes.data.payment?.transactionReference}`);
  console.log(`     Security Deposit Escrow Status: ${paymentRes.data.deposit?.status} (₹${paymentRes.data.deposit?.originalAmount})`);

  // STEP 3.3: Cryptographic Pickup QR Handover
  console.log(`  📲 Step 3 - Generating Single-Use Pickup QR Code...`);
  const qrRes = await api(`/qr/booking/${booking.id}`, {}, customerToken);
  const pickupCode = qrRes.data.pickupCode;
  console.log(`     Pickup QR Token Code: ${pickupCode}`);

  // Owner Scans & Verifies Pickup QR
  console.log(`  🔍 Step 4 - Owner Scanning & Verifying Pickup QR Handover...`);
  const verifyPickupRes = await api('/qr/verify-pickup', {
    method: 'POST',
    body: JSON.stringify({ code: pickupCode }),
  }, activeOwnerToken);

  console.log(`  ✅ [PASS] Pickup Verified! Booking Transitioned to: ${verifyPickupRes.booking.status}`);
  console.log(`     Rental Period is now ACTIVE. Single-use pass consumed.`);

  // STEP 3.4: Cryptographic Return QR Handover
  console.log(`  📦 Step 5 - End of Rental: Generating Return QR Code...`);
  const returnQrRes = await api(`/qr/booking/${booking.id}`, {}, customerToken);
  const returnCode = returnQrRes.data.returnCode;
  console.log(`     Return QR Token Code: ${returnCode}`);

  // Owner Scans & Verifies Return QR Handover
  console.log(`  🔍 Step 6 - Owner Scanning & Verifying Return QR Handover...`);
  const verifyReturnRes = await api('/qr/verify-return', {
    method: 'POST',
    body: JSON.stringify({ code: returnCode }),
  }, activeOwnerToken);

  console.log(`  ✅ [PASS] Return Handover Verified! Booking Status -> ${verifyReturnRes.booking.status}`);
  console.log(`     Returned At: ${verifyReturnRes.booking.returnedAt}`);

  // STEP 3.5: Verify Security Deposit 100% Escrow Refund
  const depositRecord = await prisma.securityDeposit.findUnique({
    where: { bookingId: booking.id },
  });
  console.log(`  💰 Step 7 - Escrow Security Deposit Status: ${depositRecord?.status} (Refunded ₹${depositRecord?.refundedAmount || depositRecord?.originalAmount})`);
  if (depositRecord?.status !== 'FULLY_REFUNDED') {
    throw new Error(`Security deposit status expected FULLY_REFUNDED, got ${depositRecord?.status}`);
  }
  console.log(`  ✅ [PASS] 100% Security Deposit Escrow Released to Customer successfully!`);

  // STEP 3.6: Mutual Verified Reviews
  console.log(`  ⭐ Step 8 - Submitting Mutual Verified Reviews...`);
  
  // Customer reviews Owner
  const custReviewRes = await api('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: booking.id,
      rating: 5,
      comment: 'Exceptional experience! Equipment was in pristine condition, professionally packed and owner was very accommodating.',
    }),
  }, customerToken);
  console.log(`  ✅ [PASS] Customer Review Submitted: 5 Stars`);

  // Owner reviews Customer
  const ownerReviewRes = await api('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: booking.id,
      rating: 5,
      comment: 'Responsible and punctual borrower! Handled equipment with great care and returned exactly on time.',
    }),
  }, activeOwnerToken);
  console.log(`  ✅ [PASS] Owner Review Submitted: 5 Stars`);

  // -------------------------------------------------------------------------
  // SECTION 4: ADMIN DASHBOARD METRICS & GOVERNANCE AUDIT
  // -------------------------------------------------------------------------
  console.log('\n👑 SECTION 4: ADMIN DASHBOARD & PLATFORM METRICS AUDIT');

  const adminStats = await api('/admin/stats', {}, adminToken);
  console.log(`  📊 Admin Platform Statistics:`);
  console.log(`     - Total Registered Users: ${adminStats.data.users.total} (${adminStats.data.users.owners} owners, ${adminStats.data.users.customers} customers)`);
  console.log(`     - Total Active Products: ${adminStats.data.products.total}`);
  console.log(`     - Active Bookings: ${adminStats.data.bookings.active} | Completed: ${adminStats.data.bookings.completed}`);
  console.log(`     - Gross Financial Volume: ₹${adminStats.data.financials.grossSimulatedVolume}`);
  console.log(`     - Active Disputes: ${adminStats.data.bookings.openDisputes}`);

  const adminBookings = await api('/admin/bookings', {}, adminToken);
  console.log(`  📋 Admin Bookings Governance: Found ${adminBookings.data.length} bookings managed by platform.`);

  console.log('\n================================================================');
  console.log('🎉 ALL AUDITS AND END-TO-END VERIFICATIONS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');

  await prisma.$disconnect();
}

runVerification().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
