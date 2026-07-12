const { AppError } = require('../utils/errors');

module.exports = function errorHandler(err, req, res, next) {
  const error = err instanceof AppError
    ? err
    : new AppError(500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');

  res.status(error.statusCode).json({
    errorCode: error.errorCode,
    message: error.message,
    details: error.details || [],
  });
};
