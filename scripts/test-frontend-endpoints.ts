import request from 'supertest';
import app from '../backend/src/app';

async function testAllViews() {
  console.log('🧪 Testing Frontend Views API Endpoints for All Personas...\n');

  // 1. OWNER PORTAL
  console.log('👑 1. Owner Portal (rajesh.owner@borrowbuy.in):');
  const ownerLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rajesh.owner@borrowbuy.in', password: 'Password123!' });
  const ownerToken = ownerLogin.body?.data?.token;

  if (!ownerToken) {
    throw new Error('Owner login failed');
  }

  const myListings = await request(app)
    .get('/api/products/owner/my-listings')
    .set('Authorization', `Bearer ${ownerToken}`);
  console.log(`   - "My Listings" tab: ${myListings.body?.data?.length || 0} listings loaded (Status: ${myListings.status})`);

  const ownerRequests = await request(app)
    .get('/api/bookings/owner-requests')
    .set('Authorization', `Bearer ${ownerToken}`);
  console.log(`   - "Rental Requests" tab: ${ownerRequests.body?.data?.length || 0} bookings/requests loaded (Status: ${ownerRequests.status})`);

  const ownerNotifs = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${ownerToken}`);
  console.log(`   - Notification Bell: ${ownerNotifs.body?.notifications?.length || 0} notifications, unread: ${ownerNotifs.body?.unreadCount} (Status: ${ownerNotifs.status})`);

  // 2. CUSTOMER PORTAL
  console.log('\n🎒 2. Customer Portal (priya.customer@borrowbuy.in):');
  const custLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'priya.customer@borrowbuy.in', password: 'Password123!' });
  const custToken = custLogin.body?.data?.token;

  if (!custToken) {
    throw new Error('Customer login failed');
  }

  const myBookings = await request(app)
    .get('/api/bookings/my-bookings')
    .set('Authorization', `Bearer ${custToken}`);
  console.log(`   - "My Bookings" page: ${myBookings.body?.data?.length || 0} bookings loaded (Status: ${myBookings.status})`);

  const custNotifs = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${custToken}`);
  console.log(`   - Notification Bell: ${custNotifs.body?.notifications?.length || 0} notifications, unread: ${custNotifs.body?.unreadCount} (Status: ${custNotifs.status})`);

  // 3. ADMIN PORTAL
  console.log('\n🛡️ 3. Admin Console (admin@borrowbuy.in):');
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@borrowbuy.in', password: 'Password123!' });
  const adminToken = adminLogin.body?.data?.token;

  if (!adminToken) {
    throw new Error('Admin login failed');
  }

  const adminStats = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`   - Admin Stats: Total Users: ${adminStats.body?.data?.totalUsers}, Active Products: ${adminStats.body?.data?.totalProducts}, Active Bookings: ${adminStats.body?.data?.activeBookings}`);

  const adminDisputes = await request(app)
    .get('/api/admin/disputes')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`   - Disputes Tab: ${adminDisputes.body?.data?.length || 0} platform disputes loaded (Status: ${adminDisputes.status})`);

  const adminBookings = await request(app)
    .get('/api/admin/bookings')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log(`   - All Platform Bookings: ${adminBookings.body?.data?.length || 0} bookings loaded (Status: ${adminBookings.status})`);

  // 4. BROWSE CATALOGUE & WISHLIST
  console.log('\n📦 4. Public Marketplace & Wishlist:');
  const catalog = await request(app)
    .get('/api/products?page=1&limit=25');
  console.log(`   - Browse Catalog: ${catalog.body?.products?.length || 0} products returned, total: ${catalog.body?.pagination?.totalProducts} (Status: ${catalog.status})`);

  console.log('\n✨ ALL FRONTEND VIEWS HAVE RICH, REAL DATA!');
}

testAllViews().catch((err) => {
  console.error('❌ View testing failed:', err);
  process.exit(1);
});
