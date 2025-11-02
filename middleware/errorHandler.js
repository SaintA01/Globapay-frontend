const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // PostgreSQL duplicate key error
  if (err.code === '23505') {
    const field = err.detail.match(/\(([^)]+)\)/)[1];
    error = {
      message: `${field} already exists`,
      statusCode: 400
    };
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    error = {
      message: 'Referenced record not found',
      statusCode: 400
    };
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    const field = err.column;
    error = {
      message: `${field} is required`,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
