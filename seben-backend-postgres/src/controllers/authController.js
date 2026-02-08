// src/controllers/authController.js
const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

// Register user
exports.register = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array(),
    });
  }

  const { name, email, password, phone } = req.body;

  // Check if user exists
  const existingUser = await authService.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists with this email',
    });
  }

  // Create user
  const user = await authService.createUser({
    name,
    email,
    password,
    phone,
  });

  // Generate token
  const token = authService.generateToken(user.id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password',
    });
  }

  // Find user
  const user = await authService.findUserByEmail(email);
  
  // Check if user exists and password is correct
  if (!user || !(await authService.comparePasswords(password, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password',
    });
  }

  // Check if user is active
  if (!user.active) {
    return res.status(401).json({
      status: 'error',
      message: 'Your account has been deactivated',
    });
  }

  // Update last login
  await authService.updateLastLogin(user.id);

  // Generate token
  const token = authService.generateToken(user.id);

  // Remove password from response
  delete user.password;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
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

  // Find admin user
  const user = await authService.findUserByEmail(email);
  
  // Check if user exists, is admin, and password is correct
  if (!user || user.role !== 'ADMIN' || !(await authService.comparePasswords(password, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials or insufficient permissions',
    });
  }

  // Update last login
  await authService.updateLastLogin(user.id);

  // Generate token
  const token = authService.generateToken(user.id);

  // Remove password from response
  delete user.password;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

// Get current user
exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.findUserById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
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
    data: {
      user,
    },
  });
});

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const prisma = require('../config/database').getInstance();

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  // Check current password
  if (!(await authService.comparePasswords(currentPassword, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Current password is incorrect',
    });
  }

  // Hash new password
  const hashedPassword = await authService.hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });

  // Generate new token
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