import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findFirst({
    where: { OR: [{ email: 'rajesh.owner@borrowbuy.in' }, { email: 'owner@borrowbuy.in' }] }
  });
  const ownerProducts = await prisma.product.count({ where: { ownerId: owner?.id } });
  const ownerBookings = await prisma.booking.count({ where: { product: { ownerId: owner?.id } } });

  const customer = await prisma.user.findFirst({
    where: { OR: [{ email: 'priya.customer@borrowbuy.in' }, { email: 'customer@borrowbuy.in' }] }
  });
  const customerBookings = await prisma.booking.count({ where: { customerId: customer?.id } });

  const ownerNotifs = await prisma.notification.count({ where: { userId: owner?.id } });
  const custNotifs = await prisma.notification.count({ where: { userId: customer?.id } });

  const adminDisputes = await prisma.dispute.count();
  const allProducts = await prisma.product.count();

  console.log('--- BORROWBUY PORTAL DATA SUMMARY ---');
  console.log(`Owner Listings (${owner?.email}):`, ownerProducts);
  console.log(`Owner Bookings/Requests:`, ownerBookings);
  console.log(`Customer Bookings (${customer?.email}):`, customerBookings);
  console.log(`Owner Notifications:`, ownerNotifs);
  console.log(`Customer Notifications:`, custNotifs);
  console.log(`Total System Active Products:`, allProducts);
  console.log(`Total Platform Disputes:`, adminDisputes);
  console.log('-------------------------------------');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
