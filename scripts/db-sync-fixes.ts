import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting BorrowBuy Database Sync & Correction Script...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Upsert Canonical Demo Accounts (.in and .com)
  const demoUsers = [
    {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'admin@borrowbuy.in',
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      phone: '+91 98250 12345',
      ownerAddress: 'Infocity, Gandhinagar, Gujarat',
      isVerifiedOwner: true,
      trustScore: 5.0,
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      email: 'admin@borrowbuy.com',
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      phone: '+91 98250 12345',
      ownerAddress: 'Infocity, Gandhinagar, Gujarat',
      isVerifiedOwner: true,
      trustScore: 5.0,
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      email: 'owner@borrowbuy.in',
      fullName: 'Demo Equipment Owner',
      role: UserRole.OWNER,
      phone: '+91 98791 20000',
      ownerAddress: 'Navrangpura, Ahmedabad, Gujarat',
      ownerBio: 'Verified professional equipment owner with premium cameras, audio equipment, and construction tools.',
      isVerifiedOwner: true,
      trustScore: 4.9,
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      email: 'owner@borrowbuy.com',
      fullName: 'Demo Equipment Owner',
      role: UserRole.OWNER,
      phone: '+91 98791 20000',
      ownerAddress: 'Navrangpura, Ahmedabad, Gujarat',
      ownerBio: 'Verified professional equipment owner with premium cameras, audio equipment, and construction tools.',
      isVerifiedOwner: true,
      trustScore: 4.9,
    },
    {
      id: '00000000-0000-4000-8000-000000000005',
      email: 'customer@borrowbuy.in',
      fullName: 'Demo Customer',
      role: UserRole.CUSTOMER,
      phone: '+91 98251 10000',
      ownerAddress: 'Satellite, Ahmedabad, Gujarat',
      isVerifiedOwner: false,
      trustScore: 5.0,
    },
    {
      id: '00000000-0000-4000-8000-000000000006',
      email: 'customer@borrowbuy.com',
      fullName: 'Demo Customer',
      role: UserRole.CUSTOMER,
      phone: '+91 98251 10000',
      ownerAddress: 'Satellite, Ahmedabad, Gujarat',
      isVerifiedOwner: false,
      trustScore: 5.0,
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        fullName: u.fullName,
        role: u.role,
        status: UserStatus.ACTIVE,
        isVerifiedOwner: u.isVerifiedOwner,
        phone: u.phone,
        ownerAddress: u.ownerAddress,
        ownerBio: (u as any).ownerBio || null,
        trustScore: u.trustScore,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
        status: UserStatus.ACTIVE,
        isVerifiedOwner: u.isVerifiedOwner,
        phone: u.phone,
        ownerAddress: u.ownerAddress,
        ownerBio: (u as any).ownerBio || null,
        trustScore: u.trustScore,
      },
    });
    console.log(`✅ Upserted demo user: ${u.email} (${u.role}) with Password123!`);
  }

  // Also ensure existing rajesh.owner and priya.customer have Password123!
  await prisma.user.updateMany({
    where: {
      email: {
        in: [
          'rajesh.owner@borrowbuy.in',
          'priya.customer@borrowbuy.in',
        ],
      },
    },
    data: { passwordHash },
  });

  // 2. Clean up product images so every product has strictly ONE 100% relevant primary image
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true },
  });

  console.log(`📦 Auditing ${products.length} products for single-image compliance...`);

  let updatedCount = 0;
  for (const prod of products) {
    if (prod.images && prod.images.length > 1) {
      const primaryImage = prod.images[0];
      await prisma.product.update({
        where: { id: prod.id },
        data: { images: [primaryImage] },
      });
      updatedCount++;
    }
  }

  // Delete secondary images from ProductImage table
  const deletedImages = await prisma.productImage.deleteMany({
    where: { orderIndex: { gt: 0 } },
  });

  console.log(`✨ Single Image Enforcement Complete:`);
  console.log(`   - Updated ${updatedCount} products to have exactly 1 image.`);
  console.log(`   - Removed ${deletedImages.count} secondary images from ProductImage table.`);

  // Verify
  const sample = await prisma.product.findMany({
    take: 5,
    select: { name: true, images: true },
  });
  console.log('🔍 Verification Sample:');
  sample.forEach((p) => {
    console.log(`   - ${p.name}: ${JSON.stringify(p.images)}`);
  });

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
