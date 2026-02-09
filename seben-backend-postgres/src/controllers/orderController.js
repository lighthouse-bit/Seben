// src/controllers/orderController.js
const asyncHandler = require('express-async-handler');
const database = require('../config/database');
const { createNotification } = require('./notificationController');

const prisma = database.getInstance();

// Generate unique order ID
const generateOrderId = async () => {
  const count = await prisma.order.count();
  return `ORD-${String(count + 1).padStart(6, '0')}`;
};

// Create order
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    billingAddress,
    paymentMethod,
    paymentInfo,
    items,
    subtotal,
    shipping,
    tax,
    total,
    discount,
    couponCode,
  } = req.body;

  // Validate required fields
  if (!customerName || !customerEmail || !items || items.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
    });
  }

  // Generate order ID
  const orderId = await generateOrderId();

  // Create order with items
  const order = await prisma.order.create({
    data: {
      orderId,
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'CARD',
      paymentInfo,
      subtotal,
      shipping: shipping || 0,
      tax,
      total,
      discount: discount || 0,
      couponCode,
      status: 'PENDING',
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          image: item.image || null,
        })),
      },
      statusHistory: {
        create: {
          status: 'PENDING',
          note: 'Order placed',
        },
      },
    },
    include: {
      items: true,
    },
  });

  // Update product stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stockCount: { decrement: item.quantity },
        sold: { increment: item.quantity },
      },
    });
  }

  // 1. Notify User (if logged in)
  if (userId) {
    await createNotification({
      userId,
      title: 'Order Placed Successfully',
      message: `Your order #${orderId} has been placed. We will notify you when it ships.`,
      type: 'success',
      link: `/account/orders/${order.id}`,
    });
  }

  // 2. Notify Admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      title: 'New Order Received',
      message: `Order #${orderId} placed by ${customerName}. Total: $${total}`,
      type: 'order',
      link: `/admin/orders/${order.id}`,
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Get all orders (Admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const {
    status,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const where = {};

  if (status && status !== 'all') {
    where.status = status.toUpperCase();
  }

  if (search) {
    where.OR = [
      { orderId: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { [sortBy]: order },
      skip,
      take: parseInt(limit),
    }),
    prisma.order.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: {
      orders,
    },
  });
});

// Get order by ID (Admin)
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      notes: {
        orderBy: { addedAt: 'desc' },
      },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Track order (Public)
exports.trackOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderId: req.params.orderId },
    select: {
      orderId: true,
      status: true,
      trackingNumber: true,
      carrier: true,
      estimatedDelivery: true,
      deliveredAt: true,
      createdAt: true,
      statusHistory: {
        orderBy: { changedAt: 'asc' },
        select: {
          status: true,
          changedAt: true,
          note: true,
        },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Get my orders (User)
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
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

// Get my order by ID (User)
exports.getMyOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Update order status (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, carrier, estimatedDelivery } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
  });

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: 'Order not found',
    });
  }

  const updateData = {
    status: status.toUpperCase(),
  };

  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (carrier) updateData.carrier = carrier;
  if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
  if (status === 'DELIVERED') updateData.deliveredAt = new Date();

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      ...updateData,
      statusHistory: {
        create: {
          status: status.toUpperCase(),
          changedBy: req.user.id,
          note: note || `Status changed to ${status}`,
        },
      },
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  // Notify user about status change
  if (order.userId) {
    let message = `Your order #${order.orderId} status has been updated to ${status}.`;
    if (status === 'SHIPPED') {
      message = `Your order #${order.orderId} has been shipped! Tracking: ${trackingNumber || 'N/A'}`;
    } else if (status === 'DELIVERED') {
      message = `Your order #${order.orderId} has been delivered. Enjoy your purchase!`;
    }

    await createNotification({
      userId: order.userId,
      title: 'Order Status Updated',
      message,
      type: 'info',
      link: `/account/orders/${order.id}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder,
    },
  });
});

// Update order (Admin)
exports.updateOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, customerPhone } = req.body;

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      shippingAddress,
      billingAddress,
      customerPhone,
    },
    include: {
      items: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Add order note (Admin)
exports.addOrderNote = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const note = await prisma.orderNote.create({
    data: {
      orderId: req.params.id,
      text,
      addedBy: req.user.id,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      note,
    },
  });
});

// Delete order (Admin)
exports.deleteOrder = asyncHandler(async (req, res) => {
  await prisma.order.delete({
    where: { id: req.params.id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get order stats (Admin)
exports.getOrderStats = asyncHandler(async (req, res) => {
  const [total, pending, processing, shipped, delivered, cancelled] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
    },
  });
});