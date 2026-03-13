// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const database = require('../config/database');

const prisma = database.getInstance();

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'You are not logged in. Please log in to get access.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // DEBUG: Print User ID from token
    console.log(`🔑 Auth Middleware: Verified Token for User ID: ${decoded.id}`);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      console.error(`❌ Auth Error: User ID ${decoded.id} found in token but NOT in database.`);
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error.message);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.',
    });
  }
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.warn(`⛔ Access Denied: User role ${req.user.role} is not in allowed roles [${roles}]`);
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};