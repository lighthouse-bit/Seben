// backend/src/controllers/productController.js
const asyncHandler = require('express-async-handler');
const database = require('../config/database');
const { createNotification } = require('./notificationController');

const prisma = database.getInstance();

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Get all products
exports.getAllProducts = asyncHandler(async (req, res) => {
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
  } = req.query;

  // Build where clause
  const where = {
    active: true,
  };

  if (category && category !== 'all' && category !== '') {
    where.category = category.toUpperCase();
  }

  if (featured === 'true') {
    where.featured = true;
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
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

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

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: {
      products,
    },
  });
});

// Get single product by ID
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

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
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  // Increment views
  await prisma.product.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Get featured products
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await prisma.product.findMany({
    where: {
      featured: true,
      active: true,
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Get new arrivals
exports.getNewArrivals = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await prisma.product.findMany({
    where: {
      new: true,
      active: true,
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Get related products
exports.getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 4;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  const products = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: id },
      active: true,
    },
    include: {
      images: {
        where: { isMain: true },
        take: 1,
      },
    },
    take: limit,
    orderBy: { ratingsAverage: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Create product (Admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    category,
    subcategory,
    price,
    originalPrice,
    description,
    stockCount,
    featured,
    new: isNew,
    inStock,
    materials,
    origin,
    brand,
    images,
    details,
    specifications,
    sizes,
  } = req.body;

  // Validate required fields
  if (!name || !sku || !category || !price || !description) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide name, sku, category, price, and description',
    });
  }

  // Check if SKU already exists
  const existingProduct = await prisma.product.findUnique({
    where: { sku: sku.toUpperCase() },
  });

  if (existingProduct) {
    return res.status(400).json({
      status: 'error',
      message: 'A product with this SKU already exists',
    });
  }

  // Generate slug
  const slug = generateSlug(name);

  // Check if slug exists
  const existingSlug = await prisma.product.findUnique({
    where: { slug },
  });

  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const product = await prisma.product.create({
    data: {
      name,
      sku: sku.toUpperCase(),
      slug: finalSlug,
      category: category.toUpperCase(),
      subcategory: subcategory || null,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      description,
      stockCount: parseInt(stockCount) || 0,
      featured: featured || false,
      new: isNew || false,
      inStock: inStock !== false,
      materials: materials || [],
      origin: origin || null,
      brand: brand || 'SEBEN',
      images: {
        create: (images || []).map((img, index) => ({
          url: img.url,
          isMain: img.isMain || index === 0,
          order: img.order !== undefined ? img.order : index,
        })),
      },
      details: {
        create: (details || []).filter(d => d.detail || d).map((d, index) => ({
          detail: typeof d === 'string' ? d : d.detail,
          order: d.order !== undefined ? d.order : index,
        })),
      },
      specifications: {
        create: (specifications || []).filter(s => s.key && s.value),
      },
      sizes: {
        create: (sizes || []).filter(s => s.size).map(s => ({
          size: s.size,
          stock: parseInt(s.stock) || 0,
        })),
      },
    },
    include: {
      images: true,
      details: true,
      specifications: true,
      sizes: true,
    },
  });

  // Notify admins if low stock upon creation (rare but possible)
  if (parseInt(stockCount) < 5) {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: 'Low Stock Alert',
        message: `Product "${name}" created with low stock (${stockCount} units).`,
        type: 'alert',
        link: `/admin/products/edit/${product.id}`,
      });
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Update product (Admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    subcategory,
    price,
    originalPrice,
    description,
    stockCount,
    featured,
    new: isNew,
    inStock,
    materials,
    origin,
    brand,
    images,
    details,
    specifications,
    sizes,
  } = req.body;

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  // Generate new slug if name changed
  let slug = existingProduct.slug;
  if (name && name !== existingProduct.name) {
    slug = generateSlug(name);
    const existingSlug = await prisma.product.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  // Transaction for updating related data
  // This ensures that either everything updates or nothing does
  await prisma.$transaction(async (tx) => {
    // Delete existing related data if new data provided
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }
    if (details) {
      await tx.productDetail.deleteMany({ where: { productId: id } });
    }
    if (specifications) {
      await tx.productSpecification.deleteMany({ where: { productId: id } });
    }
    if (sizes) {
      await tx.productSize.deleteMany({ where: { productId: id } });
    }

    // Prepare update data
    const updateData = {
      name: name || existingProduct.name,
      slug,
      category: category ? category.toUpperCase() : existingProduct.category,
      subcategory: subcategory !== undefined ? subcategory : existingProduct.subcategory,
      price: price !== undefined ? parseFloat(price) : existingProduct.price,
      originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existingProduct.originalPrice,
      description: description || existingProduct.description,
      stockCount: stockCount !== undefined ? parseInt(stockCount) : existingProduct.stockCount,
      featured: featured !== undefined ? featured : existingProduct.featured,
      new: isNew !== undefined ? isNew : existingProduct.new,
      inStock: inStock !== undefined ? inStock : existingProduct.inStock,
      materials: materials !== undefined ? materials : existingProduct.materials,
      origin: origin !== undefined ? origin : existingProduct.origin,
      brand: brand !== undefined ? brand : existingProduct.brand,
    };

    // Add create operations for related data if provided
    if (images) {
      updateData.images = {
        create: images.map((img, index) => ({
          url: img.url,
          isMain: img.isMain || index === 0,
          order: img.order !== undefined ? img.order : index,
        })),
      };
    }

    if (details) {
      updateData.details = {
        create: details.filter(d => d.detail || d).map((d, index) => ({
          detail: typeof d === 'string' ? d : d.detail,
          order: d.order !== undefined ? d.order : index,
        })),
      };
    }

    if (specifications) {
      updateData.specifications = {
        create: specifications.filter(s => s.key && s.value),
      };
    }

    if (sizes) {
      updateData.sizes = {
        create: sizes.filter(s => s.size).map(s => ({
          size: s.size,
          stock: parseInt(s.stock) || 0,
        })),
      };
    }

    // Perform the update
    await tx.product.update({
      where: { id },
      data: updateData,
    });
  });

  // Fetch updated product to return
  const updatedProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      details: true,
      specifications: true,
      sizes: true,
    },
  });

  // Notify admins if low stock
  if (stockCount !== undefined && parseInt(stockCount) < 5) {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: 'Low Stock Alert',
        message: `Product "${updatedProduct.name}" is running low (${updatedProduct.stockCount} left).`,
        type: 'alert',
        link: `/admin/products/edit/${id}`,
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct,
    },
  });
});

// Delete product (Admin) - Soft delete
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});