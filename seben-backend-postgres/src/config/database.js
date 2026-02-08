// src/config/database.js
const { PrismaClient } = require('@prisma/client');

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('📦 PostgreSQL Connected via Prisma');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
    console.log('📦 PostgreSQL Disconnected');
  }

  getInstance() {
    return this.prisma;
  }
}

const database = new Database();

// Handle application shutdown
process.on('beforeExit', async () => {
  await database.disconnect();
});

module.exports = database;