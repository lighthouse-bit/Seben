// src/controllers/dashboardController.js
const asyncHandler = require('express-async-handler');
const database = require('../config/database');

const prisma = database.getInstance();

// Get dashboard stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  // Get orders for calculations
  const [
    totalOrders,
    todayOrders,
    thisMonthOrders,
    lastMonthOrders,
    totalCustomers,
    newCustomersThisMonth,
    totalProducts,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thisMonth } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: lastMonth, lte: lastMonthEnd },
      },
      select: { total: true },
    }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({
      where: {
        role: 'USER',
        createdAt: { gte: thisMonth },
      },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({
      where: { active: true, stockCount: { lt: 10 } },
    }),
  ]);

  // Calculate revenue
  const thisMonthRevenue = thisMonthOrders.reduce(
    (sum, order) => sum + parseFloat(order.total),
    0
  );
  const lastMonthRevenue = lastMonthOrders.reduce(
    (sum, order) => sum + parseFloat(order.total),
    0
  );

  const revenueChange = lastMonthRevenue
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : 100;

  res.status(200).json({
    status: 'success',
    data: {
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        change: parseFloat(revenueChange),
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
        thisMonth: thisMonthOrders.length,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
    },
  });
});

// Get sales data for charts
exports.getSalesData = asyncHandler(async (req, res) => {
  const { period = '7days' } = req.query;

  let startDate;
  let groupBy;

  switch (period) {
    case '30days':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
      break;
    case '12months':
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      groupBy = 'month';
      break;
    default:
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
  }

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: 'CANCELLED' },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group orders by date
  const salesByDate = {};

  orders.forEach((order) => {
    let key;
    if (groupBy === 'month') {
      key = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
    } else {
      key = order.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    if (!salesByDate[key]) {
      salesByDate[key] = { date: key, sales: 0, orders: 0 };
    }
    salesByDate[key].sales += parseFloat(order.total);
    salesByDate[key].orders += 1;
  });

  const salesData = Object.values(salesByDate);

  res.status(200).json({
    status: 'success',
    data: {
      period,
      salesData,
    },
  });
});

// Get recent orders
exports.getRecentOrders = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const orders = await prisma.order.findMany({
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderId: true,
      customerName: true,
      customerEmail: true,
      total: true,
      status: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  const ordersWithItemCount = orders.map((order) => ({
    ...order,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items: undefined,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      orders: ordersWithItemCount,
    },
  });
});

// Get top products
exports.getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const products = await prisma.product.findMany({
    where: { active: true },
    take: parseInt(limit),
    orderBy: { sold: 'desc' },
    select: {
      id: true,
      name: true,
      price: true,
      sold: true,
      stockCount: true,
      images: {
        where: { isMain: true },
        take: 1,
        select: { url: true },
      },
    },
  });

  const productsWithRevenue = products.map((product) => ({
    ...product,
    revenue: parseFloat(product.price) * product.sold,
    image: product.images[0]?.url || null,
    images: undefined,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      products: productsWithRevenue,
    },
  });
});

// Get revenue data
exports.getRevenueData = asyncHandler(async (req, res) => {
  const { period = 'thisMonth' } = req.query;

  let startDate;
  let endDate = new Date();

  switch (period) {
    case 'today':
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'thisWeek':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'thisYear':
      startDate = new Date(new Date().getFullYear(), 0, 1);
      break;
    default: // thisMonth
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: { not: 'CANCELLED' },
    },
    select: {
      total: true,
      subtotal: true,
      shipping: true,
      tax: true,
      discount: true,
    },
  });

  const totals = orders.reduce(
    (acc, order) => ({
      revenue: acc.revenue + parseFloat(order.total),
      subtotal: acc.subtotal + parseFloat(order.subtotal),
      shipping: acc.shipping + parseFloat(order.shipping),
      tax: acc.tax + parseFloat(order.tax),
      discount: acc.discount + parseFloat(order.discount),
    }),
    { revenue: 0, subtotal: 0, shipping: 0, tax: 0, discount: 0 }
  );

  res.status(200).json({
    status: 'success',
    data: {
      period,
      ordersCount: orders.length,
      ...totals,
    },
  });
});