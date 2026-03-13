// src/controllers/orderController.js
const asyncHandler = require('express-async-handler');
const database = require('../config/database');
const { createNotification } = require('./notificationController');
const stripe = require('../config/stripe');

const prisma = database.getInstance();

// Generate unique order ID
const generateOrderId = async () => {
  const count = await prisma.order.count();
  return `ORD-${String(count + 1).padStart(6, '0')}`;
};

// 1. Create order (Manual/COD)
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

  if (!customerName || !customerEmail || !items || items.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
    });
  }

  const orderId = await generateOrderId();

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

  // Update stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stockCount: { decrement: item.quantity },
        sold: { increment: item.quantity },
      },
    });
  }

  // Notify User
  if (userId) {
    await createNotification({
      userId,
      title: 'Order Placed Successfully',
      message: `Your order #${orderId} has been placed. We will notify you when it ships.`,
      type: 'success',
      link: `/account/orders/${order.id}`,
    });
  }

  // Notify Admins
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
    data: { order },
  });
});

// 2. Create Stripe Checkout Session
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const { items, shippingAddress, customerEmail, userId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No items in checkout',
    });
  }

  const lineItems = items.map((item) => {
    // Ensure image is a valid absolute URL for Stripe
    const images = item.image && item.image.startsWith('http') 
      ? [item.image] 
      : []; 

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: images,
          metadata: {
            productId: item.productId,
            size: item.size || '',
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        userId: userId || null,
        shippingName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      },
    });

    res.status(200).json({
      status: 'success',
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

// 3. Verify Payment and Create Order (Stripe)
exports.verifyPaymentAndCreateOrder = asyncHandler(async (req, res) => {
  const { sessionId, orderData } = req.body;

  console.log("------------------------------------------");
  console.log("🔵 VERIFYING PAYMENT START");
  console.log("Session ID:", sessionId);

  if (!sessionId || !orderData) {
    console.error("❌ Missing session ID or order data");
    return res.status(400).json({ status: 'error', message: 'Missing data' });
  }

  try {
    // 1. Verify Stripe Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("✅ Stripe Status:", session.payment_status);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ status: 'error', message: 'Payment not verified' });
    }

    // 2. Check for Duplicates
    const existingOrder = await prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
    });

    if (existingOrder) {
      console.log("⚠️ Order already exists:", existingOrder.orderId);
      return res.status(200).json({ status: 'success', data: { order: existingOrder } });
    }

    // 3. Validate Product IDs before creation
    const { items, shippingAddress, userId, customerName, customerEmail, customerPhone } = orderData;
    
    // Check if products actually exist in DB
    const productIds = items.map(i => i.productId);
    const validProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });

    const validIdSet = new Set(validProducts.map(p => p.id));
    const invalidItems = items.filter(i => !validIdSet.has(i.productId));

    if (invalidItems.length > 0) {
      console.error("❌ FATAL: Cart contains products that do not exist in DB:", invalidItems);
      return res.status(400).json({ 
        status: 'error', 
        message: 'Cart contains invalid products. Please clear cart and try again.' 
      });
    }

    // 4. Create Order
    console.log("🔵 Attempting to create order in DB...");
    const orderId = await generateOrderId();

    const order = await prisma.order.create({
      data: {
        orderId,
        userId: userId || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod: 'STRIPE',
        paymentInfo: { id: session.payment_intent, status: session.payment_status },
        subtotal: session.amount_subtotal / 100,
        total: session.amount_total / 100,
        tax: 0,
        shipping: 0,
        status: 'PROCESSING',
        stripeSessionId: sessionId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            size: item.size || null,
            image: item.image || null,
          })),
        },
        statusHistory: {
          create: { status: 'PROCESSING', note: 'Payment successful via Stripe' },
        },
      },
    });

    console.log("✅ ORDER CREATED SUCCESSFULLY:", order.orderId);

    // 5. Update Stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockCount: { decrement: parseInt(item.quantity) },
          sold: { increment: parseInt(item.quantity) },
        },
      }).catch(e => console.warn("Stock update warning:", e.message));
    }

    // 6. Notifications
    try {
      if (userId) {
        await createNotification({
          userId,
          title: 'Order Placed Successfully',
          message: `Your order #${orderId} has been placed.`,
          type: 'success',
          link: `/account/orders/${order.id}`,
        });
      }
      
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          title: 'New Order Received',
          message: `Order #${orderId} placed by ${customerName}.`,
          type: 'order',
          link: `/admin/orders/${order.id}`,
        });
      }
    } catch (notifError) {
      console.warn("Notification error (non-fatal):", notifError.message);
    }

    res.status(201).json({ status: 'success', data: { order } });

  } catch (error) {
    console.error("❌ CRITICAL DB ERROR:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 4. Get all orders (Admin)
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

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
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
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: { orders },
  });
});

// 5. Get order by ID (Admin)
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
              images: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true } },
      notes: { orderBy: { addedAt: 'desc' } },
      statusHistory: { orderBy: { changedAt: 'desc' } },
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
    data: { order },
  });
});

// 6. Track order (Public)
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
      statusHistory: { orderBy: { changedAt: 'asc' }, select: { status: true, changedAt: true, note: true } },
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
    data: { order },
  });
});

// 7. Get my orders (User)
exports.getMyOrders = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  console.log("🔍 Fetching orders for USER ID:", currentUserId);

  const orders = await prisma.order.findMany({
    where: { userId: currentUserId },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`✅ Found ${orders.length} orders for user.`);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// 8. Get my order by ID (User)
exports.getMyOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      items: true,
      statusHistory: { orderBy: { changedAt: 'desc' } },
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
    data: { order },
  });
});

// 9. Update order status (Admin)
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

  const updateData = { status: status.toUpperCase() };

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
    include: { items: true, statusHistory: { orderBy: { changedAt: 'desc' } } },
  });

  if (order.userId) {
    let message = `Your order #${order.orderId} status has been updated to ${status}.`;
    if (status === 'SHIPPED') message = `Your order #${order.orderId} has been shipped! Tracking: ${trackingNumber || 'N/A'}`;
    else if (status === 'DELIVERED') message = `Your order #${order.orderId} has been delivered. Enjoy your purchase!`;

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
    data: { order: updatedOrder },
  });
});

// 10. Update order (Admin)
exports.updateOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, customerPhone } = req.body;

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { shippingAddress, billingAddress, customerPhone },
    include: { items: true },
  });

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

// 11. Add order note (Admin)
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
    data: { note },
  });
});

// 12. Delete order (Admin)
exports.deleteOrder = asyncHandler(async (req, res) => {
  await prisma.order.delete({
    where: { id: req.params.id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// 13. Get order stats (Admin)
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