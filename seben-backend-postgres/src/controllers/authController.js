// backend/src/controllers/authController.js
const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const { createNotification } = require('./notificationController'); // Import notification helper

// Register user
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array(),
    });
  }

  const { name, email, password, phone } = req.body;

  const existingUser = await authService.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists with this email',
    });
  }

  const user = await authService.createUser({
    name,
    email,
    password,
    phone,
  });

  const token = authService.generateToken(user.id);

  // Notify user of welcome
  await createNotification({
    userId: user.id,
    title: 'Welcome to Seben',
    message: 'Your account has been successfully created.',
    type: 'success',
    link: '/account'
  });

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password',
    });
  }

  const user = await authService.findUserByEmail(email);
  
  if (!user || !(await authService.comparePasswords(password, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password',
    });
  }

  if (!user.active) {
    return res.status(401).json({
      status: 'error',
      message: 'Your account has been deactivated',
    });
  }

  await authService.updateLastLogin(user.id);
  const token = authService.generateToken(user.id);
  delete user.password;

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

// Admin login
exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password',
    });
  }

  const user = await authService.findUserByEmail(email);
  
  if (!user || user.role !== 'ADMIN' || !(await authService.comparePasswords(password, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials or insufficient permissions',
    });
  }

  await authService.updateLastLogin(user.id);
  const token = authService.generateToken(user.id);

  // --- TRIGGER NOTIFICATION HERE ---
  await createNotification({
    userId: user.id,
    title: 'Security Alert',
    message: `New login detected from Admin dashboard at ${new Date().toLocaleTimeString()}`,
    type: 'info',
    link: '/admin/settings'
  });
  // ---------------------------------

  delete user.password;

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  });
});

// Get current user
exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.findUserById(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const prisma = require('../config/database').getInstance();

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

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const prisma = require('../config/database').getInstance();

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || !(await authService.comparePasswords(currentPassword, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Current password is incorrect',
    });
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });

  // Notify user of password change
  await createNotification({
    userId: user.id,
    title: 'Security Update',
    message: 'Your password was successfully changed.',
    type: 'success',
    link: '/account/security'
  });

  const token = authService.generateToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password updated successfully',
  });
});

// Logout
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};