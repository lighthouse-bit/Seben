// backend/src/controllers/userController.js
const asyncHandler = require('express-async-handler');
const database = require('../config/database');

const prisma = database.getInstance();

// Get user profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      lastLogin: true,
      _count: {
        select: {
          orders: true,
          addresses: true,
          wishlist: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Get addresses
exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: { isDefault: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    data: { addresses },
  });
});

// Add address
exports.addAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.create({
    data: {
      ...req.body,
      userId: req.user.id,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { address },
  });
});

// Update address
exports.updateAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.update({ // Changed from updateMany to update if using ID
    where: { id: req.params.id },
    data: req.body,
  });

  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

// Delete address
exports.deleteAddress = asyncHandler(async (req, res) => {
  await prisma.address.delete({
    where: { id: req.params.id },
  });

  res.status(204).json({
    status: 'success',
  });
});

// Set default address
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  // Remove default from all addresses
  await prisma.address.updateMany({
    where: { userId: req.user.id },
    data: { isDefault: false },
  });

  // Set new default
  const address = await prisma.address.update({
    where: { id: req.params.id },
    data: { isDefault: true },
  });

  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

// Get wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: { wishlist },
  });
});

// Add to wishlist
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Check if exists first to avoid error
  const existing = await prisma.wishlist.findFirst({
    where: {
      userId: req.user.id,
      productId,
    }
  });

  if (existing) {
    return res.status(200).json({
      status: 'success',
      data: { wishlist: existing },
    });
  }

  const wishlistItem = await prisma.wishlist.create({
    data: {
      userId: req.user.id,
      productId,
    },
    include: {
      product: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: { wishlist: wishlistItem },
  });
});

// Remove from wishlist
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Delete using deleteMany because we don't have the wishlist ID, only product ID + User ID
  await prisma.wishlist.deleteMany({
    where: {
      userId: req.user.id,
      productId: productId,
    },
  });

  res.status(204).json({
    status: 'success',
  });
});

// Get settings
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = {
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  };

  res.status(200).json({
    status: 'success',
    data: { settings },
  });
});

// Update settings
exports.updateSettings = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { settings: req.body },
  });
});