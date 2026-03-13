// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create or update admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@seben.com' },
    update: {
      password: adminPassword,
      name: process.env.ADMIN_NAME || 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@seben.com',
      password: adminPassword,
      name: process.env.ADMIN_NAME || 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created/updated:', admin.email);

  // Create sample products with upsert
  const products = [
    {
      sku: 'SEB-WCH-001',
      name: 'The Sovereign Chronograph',
      slug: 'the-sovereign-chronograph',
      description: 'A masterpiece of horological engineering featuring Swiss automatic movement with 72-hour power reserve.',
      category: 'WATCHES',
      price: 18500,
      stockCount: 5,
      featured: true,
      new: true,
      materials: ['904L Stainless Steel', 'Sapphire Crystal', 'Alligator Leather'],
      origin: 'Switzerland',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-SUT-001',
      name: 'Midnight Black Tuxedo',
      slug: 'midnight-black-tuxedo',
      description: 'Cut from the finest Italian Super 150s wool, this tuxedo exemplifies timeless elegance with silk satin peak lapels.',
      category: 'SUITS',
      price: 4200,
      stockCount: 12,
      featured: true,
      materials: ['Super 150s Italian Wool', 'Silk Satin', 'Bemberg Lining'],
      origin: 'Italy',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-LTH-001',
      name: 'Executive Leather Briefcase',
      slug: 'executive-leather-briefcase',
      description: 'Handcrafted from full-grain Florentine leather, this briefcase is the epitome of professional sophistication.',
      category: 'LEATHER',
      price: 2800,
      originalPrice: 3400,
      stockCount: 8,
      featured: true,
      materials: ['Full-grain Florentine Leather', 'Solid Brass Hardware', 'Suede Lining'],
      origin: 'Italy',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-GRM-001',
      name: "The Gentleman's Fragrance",
      slug: 'the-gentlemans-fragrance',
      description: 'An intoxicating blend of bergamot, oud, and sandalwood. This Eau de Parfum is crafted by master perfumers in Grasse, France.',
      category: 'GROOMING',
      price: 320,
      stockCount: 25,
      featured: true,
      new: true,
      materials: ['Bergamot', 'Oud', 'Sandalwood', 'Musk', 'Amber'],
      origin: 'France',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-FTW-001',
      name: 'Oxford Brogues in Cognac',
      slug: 'oxford-brogues-cognac',
      description: 'Goodyear welted Oxford brogues in hand-burnished cognac calf leather. Crafted by artisans in Northampton, England.',
      category: 'FOOTWEAR',
      price: 890,
      stockCount: 15,
      materials: ['Calf Leather', 'Leather Sole', 'Full Leather Lining'],
      origin: 'England',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-ACC-001',
      name: 'Platinum Cufflinks Set',
      slug: 'platinum-cufflinks-set',
      description: 'Solid platinum cufflinks with onyx inlay and the Seben emblem. Presented in a handcrafted wooden box.',
      category: 'ACCESSORIES',
      price: 1200,
      originalPrice: 1500,
      stockCount: 10,
      featured: true,
      materials: ['950 Platinum', 'Black Onyx', 'Italian Suede'],
      origin: 'Switzerland',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-OUT-001',
      name: 'Charcoal Cashmere Overcoat',
      slug: 'charcoal-cashmere-overcoat',
      description: 'Double-breasted overcoat in pure Mongolian cashmere. Fully lined in silk with horn buttons.',
      category: 'SUITS',
      price: 5600,
      stockCount: 6,
      featured: true,
      materials: ['100% Mongolian Cashmere', '100% Silk Lining', 'Natural Horn Buttons'],
      origin: 'Scotland',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-LTH-002',
      name: 'Leather Card Holder',
      slug: 'leather-card-holder',
      description: 'Slim card holder in hand-stitched black calf leather. Six card slots with a central compartment for folded bills.',
      category: 'LEATHER',
      price: 280,
      stockCount: 30,
      new: true,
      materials: ['Black Calf Leather', 'Hand-stitched'],
      origin: 'Italy',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-GRM-002',
      name: 'Shaving Kit Deluxe',
      slug: 'shaving-kit-deluxe',
      description: 'The complete gentleman\'s shaving ritual. Includes a hand-crafted badger hair brush, chrome safety razor, and premium products.',
      category: 'GROOMING',
      price: 450,
      stockCount: 20,
      materials: ['Silvertip Badger Hair', 'Chrome', 'Full-grain Leather'],
      origin: 'Germany',
      brand: 'SEBEN',
    },
    {
      sku: 'SEB-SUT-002',
      name: 'Navy Pinstripe Suit',
      slug: 'navy-pinstripe-suit',
      description: 'Classic navy pinstripe suit in Super 130s wool. Single-breasted, two-button jacket with notch lapels.',
      category: 'SUITS',
      price: 3400,
      originalPrice: 4000,
      stockCount: 18,
      materials: ['Super 130s Wool', 'Bemberg Lining', 'Mother of Pearl Buttons'],
      origin: 'Italy',
      brand: 'SEBEN',
    },
  ];

  for (const product of products) {
    try {
      // Prepare the product data
      const { 
        sku, 
        name, 
        slug, 
        description, 
        category, 
        price, 
        originalPrice,
        stockCount,
        featured,
        new: isNew,
        materials,
        origin,
        brand 
      } = product;

      // Upsert the product
      const createdProduct = await prisma.product.upsert({
        where: { sku },
        update: {
          name,
          slug,
          description,
          category,
          price,
          originalPrice: originalPrice || null,
          stockCount,
          featured: featured || false,
          new: isNew || false,
          materials: materials || [],
          origin,
          brand,
          inStock: stockCount > 0,
        },
        create: {
          sku,
          name,
          slug,
          description,
          category,
          price,
          originalPrice: originalPrice || null,
          stockCount,
          featured: featured || false,
          new: isNew || false,
          materials: materials || [],
          origin,
          brand,
          inStock: stockCount > 0,
        },
      });

      console.log(`✅ Product upserted: ${createdProduct.name} (${createdProduct.sku})`);

      // Add/Update product images
      await prisma.productImage.deleteMany({
        where: { productId: createdProduct.id }
      });

      const imageUrls = {
        'SEB-WCH-001': [
          'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
          'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800',
          'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
        ],
        'SEB-SUT-001': [
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
        ],
        'SEB-LTH-001': [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        ],
        'SEB-GRM-001': [
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800',
          'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800',
        ],
        'SEB-FTW-001': [
          'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
          'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=800',
        ],
        'SEB-ACC-001': [
          'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800',
        ],
        'SEB-OUT-001': [
          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800',
          'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
        ],
        'SEB-LTH-002': [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
        ],
        'SEB-GRM-002': [
          'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800',
        ],
        'SEB-SUT-002': [
          'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
          'https://images.unsplash.com/photo-1593030103066-0093718e7977?w=800',
        ],
      };

      if (imageUrls[sku]) {
        for (let i = 0; i < imageUrls[sku].length; i++) {
          await prisma.productImage.create({
            data: {
              productId: createdProduct.id,
              url: imageUrls[sku][i],
              isMain: i === 0,
              order: i,
            },
          });
        }
      }

      // Add product details
      await prisma.productDetail.deleteMany({
        where: { productId: createdProduct.id }
      });

      const productDetails = {
        'SEB-WCH-001': [
          'Swiss automatic movement',
          '904L Stainless steel case',
          'Sapphire crystal with AR coating',
          'Water resistant to 100m',
          '72-hour power reserve',
          'Alligator leather strap',
        ],
        'SEB-SUT-001': [
          'Super 150s Italian wool',
          'Silk satin peak lapels',
          'Half-canvas construction',
          'Bemberg lining',
          'Mother of pearl buttons',
          'Made in Italy',
        ],
        'SEB-LTH-001': [
          'Full-grain Florentine leather',
          'Solid brass hardware',
          'Fits 15" laptop',
          'Suede-lined interior',
          'Detachable shoulder strap',
          'Hand-stitched edges',
        ],
      };

      if (productDetails[sku]) {
        for (let i = 0; i < productDetails[sku].length; i++) {
          await prisma.productDetail.create({
            data: {
              productId: createdProduct.id,
              detail: productDetails[sku][i],
              order: i,
            },
          });
        }
      }

      // Add product specifications
      await prisma.productSpecification.deleteMany({
        where: { productId: createdProduct.id }
      });

      const productSpecs = {
        'SEB-WCH-001': {
          'Case Size': '42mm',
          'Case Material': '904L Stainless Steel',
          'Movement': 'Swiss Automatic',
          'Water Resistance': '100m',
        },
        'SEB-SUT-001': {
          'Fabric': 'Super 150s Italian Wool',
          'Lapel': 'Peak, Silk Satin',
          'Buttons': 'Mother of Pearl',
          'Lining': 'Bemberg',
        },
        'SEB-LTH-001': {
          'Dimensions': '16" x 12" x 4"',
          'Leather': 'Full-grain Florentine',
          'Hardware': 'Solid Brass',
          'Laptop Fit': 'Up to 15"',
        },
      };

      if (productSpecs[sku]) {
        for (const [key, value] of Object.entries(productSpecs[sku])) {
          await prisma.productSpecification.create({
            data: {
              productId: createdProduct.id,
              key,
              value,
            },
          });
        }
      }

      // Add sizes for suits and footwear
      await prisma.productSize.deleteMany({
        where: { productId: createdProduct.id }
      });

      if (category === 'SUITS') {
        const sizes = ['46', '48', '50', '52', '54', '56'];
        for (const size of sizes) {
          await prisma.productSize.create({
            data: {
              productId: createdProduct.id,
              size,
              stock: Math.floor(Math.random() * 3) + 1,
            },
          });
        }
      } else if (category === 'FOOTWEAR') {
        const sizes = ['40', '41', '42', '43', '44', '45', '46'];
        for (const size of sizes) {
          await prisma.productSize.create({
            data: {
              productId: createdProduct.id,
              size,
              stock: Math.floor(Math.random() * 3) + 1,
            },
          });
        }
      } else if (category === 'GROOMING' && sku === 'SEB-GRM-001') {
        const sizes = ['50ml', '100ml'];
        for (const size of sizes) {
          await prisma.productSize.create({
            data: {
              productId: createdProduct.id,
              size,
              stock: Math.floor(Math.random() * 10) + 5,
            },
          });
        }
      }

    } catch (error) {
      console.error(`❌ Error seeding product ${product.sku}:`, error);
    }
  }

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