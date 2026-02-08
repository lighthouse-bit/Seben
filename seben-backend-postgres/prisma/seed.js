// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@seben.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@seben.com',
      password: adminPassword,
      name: process.env.ADMIN_NAME || 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample products
  const products = [
    {
      sku: 'SEB-WCH-001',
      name: 'The Sovereign Chronograph',
      slug: 'the-sovereign-chronograph',
      description: 'A masterpiece of horological engineering featuring Swiss automatic movement.',
      category: 'WATCHES',
      price: 18500,
      stockCount: 5,
      featured: true,
      new: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
            isMain: true,
            order: 0,
          },
        ],
      },
      details: {
        create: [
          { detail: 'Swiss automatic movement', order: 0 },
          { detail: '904L Stainless steel case', order: 1 },
          { detail: 'Sapphire crystal with AR coating', order: 2 },
          { detail: 'Water resistant to 100m', order: 3 },
        ],
      },
      specifications: {
        create: [
          { key: 'Case Size', value: '42mm' },
          { key: 'Case Material', value: '904L Stainless Steel' },
          { key: 'Movement', value: 'Swiss Automatic' },
        ],
      },
    },
    {
      sku: 'SEB-SUT-001',
      name: 'Midnight Black Tuxedo',
      slug: 'midnight-black-tuxedo',
      description: 'Cut from the finest Italian Super 150s wool, this tuxedo exemplifies timeless elegance.',
      category: 'SUITS',
      price: 4200,
      stockCount: 12,
      featured: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
            isMain: true,
            order: 0,
          },
        ],
      },
      sizes: {
        create: [
          { size: '46', stock: 2 },
          { size: '48', stock: 3 },
          { size: '50', stock: 3 },
          { size: '52', stock: 2 },
          { size: '54', stock: 2 },
        ],
      },
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Sample products created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });