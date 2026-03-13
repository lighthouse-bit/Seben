// src/services/productService.js
const database = require('../config/database');
const prisma = database.getInstance();

class ProductService {
  // Get all products with filters
  async getProducts(filters = {}) {
    const {
      category,
      minPrice,
      maxPrice,
      featured,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = filters;

    // Build where clause
    const where = {
      active: true,
    };

    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          sizes: true,
          details: {
            orderBy: { order: 'asc' },
          },
          specifications: true,
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit),
      },
    };
  }

  // Get single product
  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        sizes: true,
        details: {
          orderBy: { order: 'asc' },
        },
        specifications: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (product) {
      // Increment views
      await prisma.product.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return product;
  }

  // Get product by slug
  async getProductBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        sizes: true,
        details: {
          orderBy: { order: 'asc' },
        },
        specifications: true,
      },
    });
  }

  // Create product
  async createProduct(data) {
    const { images, details, specifications, sizes, ...productData } = data;

    // Generate slug
    productData.slug = this.generateSlug(productData.name);

    return prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images || [],
        },
        details: {
          create: details || [],
        },
        specifications: {
          create: specifications || [],
        },
        sizes: {
          create: sizes || [],
        },
      },
      include: {
        images: true,
        details: true,
        specifications: true,
        sizes: true,
      },
    });
  }

  // Update product
  async updateProduct(id, data) {
    const { images, details, specifications, sizes, ...productData } = data;

    // Update slug if name changed
    if (productData.name) {
      productData.slug = this.generateSlug(productData.name);
    }

    return prisma.product.update({
      where: { id },
      data: productData,
      include: {
        images: true,
        details: true,
        specifications: true,
        sizes: true,
      },
    });
  }

  // Delete product
  async deleteProduct(id) {
    return prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    return prisma.product.findMany({
      where: {
        featured: true,
        active: true,
      },
      include: {
        images: {
          where: { isMain: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get new arrivals
  async getNewArrivals(limit = 8) {
    return prisma.product.findMany({
      where: {
        new: true,
        active: true,
      },
      include: {
        images: {
          where: { isMain: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get related products
  async getRelatedProducts(productId, limit = 4) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return [];

    return prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: productId },
        active: true,
      },
      include: {
        images: {
          where: { isMain: true },
        },
      },
      take: limit,
      orderBy: { ratingsAverage: 'desc' },
    });
  }

  // Helper: Generate slug
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
}

module.exports = new ProductService();