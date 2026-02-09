// backend/src/controllers/customerController.js
const asyncHandler = require('express-async-handler');
const database = require('../config/database');

const prisma = database.getInstance();

// Get all customers
exports.getAllCustomers = asyncHandler(async (req, res) => {
  const {
    search,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const where = {
    role: 'USER', // Only get regular users, not admins
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        lastLogin: true,
        active: true,
        addresses: true,
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            total: true,
          },
        },
      },
      orderBy: { [sortBy]: order },
      skip,
      take: parseInt(limit),
    }),
    prisma.user.count({ where }),
  ]);

  // Calculate total spent for each customer
  const customersWithStats = customers.map((customer) => {
    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + parseFloat(order.total || 0),
      0
    );
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      lastLogin: customer.lastLogin,
      active: customer.active,
      addresses: customer.addresses,
      ordersCount: customer._count.orders,
      totalSpent,
    };
  });

  res.status(200).json({
    status: 'success',
    results: customers.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: {
      customers: customersWithStats,
    },
  });
});

// Get customer by ID
exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      lastLogin: true,
      emailVerified: true,
      active: true,
      addresses: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
          wishlist: true,
        },
      },
      orders: {
        select: {
          total: true,
        },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({
      status: 'error',
      message: 'Customer not found',
    });
  }

  const totalSpent = customer.orders.reduce(
    (sum, order) => sum + parseFloat(order.total || 0),
    0
  );

  res.status(200).json({
    status: 'success',
    data: {
      customer: {
        ...customer,
        ordersCount: customer._count.orders,
        reviewsCount: customer._count.reviews,
        wishlistCount: customer._count.wishlist,
        totalSpent,
      },
    },
  });
});

// Get customer orders
exports.getCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.params.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Update customer
exports.updateCustomer = asyncHandler(async (req, res) => {
  const { name, phone, active } = req.body;

  const customer = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      name,
      phone,
      active,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      customer,
    },
  });
});

// Delete customer (soft delete)
exports.deleteCustomer = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.params.id },
    data: { active: false },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get customer stats
exports.getCustomerStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, newThisMonth, activeUsers] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({
      where: {
        role: 'USER',
        createdAt: { gte: firstDayOfMonth },
      },
    }),
    prisma.user.count({
      where: {
        role: 'USER',
        lastLogin: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      total,
      newThisMonth,
      activeUsers,
    },
  });
});