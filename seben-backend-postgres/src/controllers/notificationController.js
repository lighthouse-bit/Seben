const asyncHandler = require('express-async-handler');
const database = require('../config/database');
const prisma = database.getInstance();

// Get user notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  res.status(200).json({
    status: 'success',
    data: { notifications }
  });
});

// Mark single as read
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.updateMany({
    where: { 
      id: req.params.id,
      userId: req.user.id 
    },
    data: { read: true }
  });

  res.status(200).json({ status: 'success' });
});

// Mark all as read
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true }
  });

  res.status(200).json({ status: 'success' });
});

// Helper to create notification (internal use)
exports.createNotification = async ({ userId, title, message, type, link }) => {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, link }
    });
  } catch (error) {
    console.error('Failed to create notification', error);
  }
};