// src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../config/database');

const prisma = database.getInstance();

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  // Hash password
  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  // Compare passwords
  async comparePasswords(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Create user
  async createUser(userData) {
    const hashedPassword = await this.hashPassword(userData.password);
    
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Find user by email
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID
  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        stripeCustomerId: true,
        emailVerified: true,
        createdAt: true,
        addresses: true,
        wishlist: {
          include: {
            product: true,
          },
        },
        cart: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Update last login
  async updateLastLogin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }
}

module.exports = new AuthService();