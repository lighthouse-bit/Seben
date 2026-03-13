// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // Log error
  console.error(err);

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 400;
    message = `Duplicate field value: ${err.meta.target}`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;